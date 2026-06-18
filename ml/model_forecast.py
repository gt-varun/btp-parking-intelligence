"""
model_forecast.py
-------------------
Predictive patrol scheduler: forecasts violation counts per junction for the
7 days immediately following the end of the dataset (2024-04-08), so every
number is backed by the data rather than guessed.

APPROACH (real model, not a lookup table):
For every named junction we build a complete daily calendar (filling days
with zero violations where none were logged) and engineer time-series
features per (junction, day):
    - day-of-week (one-hot)
    - rolling 7-day and 14-day mean violation count (trend/momentum)
    - days-since-dataset-start (captures any long-run drift)
    - junction's own historical mean/std (so the model generalizes across
      junctions of very different volume — a single global model, not 168
      separate tiny models, which would overfit on sparse junctions)
We train ONE GradientBoostingRegressor across all junction-days (pooled),
then roll the forecast forward 7 days autoregressively: predict day+1 using
real history, append it to that junction's rolling window, predict day+2
using the prediction from day+1, etc. — a standard recursive forecasting
strategy that lets a single trained model produce per-junction future paths.

SWAPPABLE: replace GradientBoostingRegressor with RandomForestRegressor,
Ridge, etc. Everything else (features, recursive rollout, JSON contract)
stays the same as long as the model exposes .fit(X, y) / .predict(X).

Output: ml/output/forecast.json
    { "forecastStart": "2024-04-09", days: [
        { day, date, top: [{junction, junctionCode, severity, predicted}, ...] }
      ],
      perJunction: { junctionCode: [7 predicted values] } }
"""

import json
import os
from datetime import timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor

from load_data import load_clean

OUT_PATH = os.path.join(os.path.dirname(__file__), "output", "forecast.json")
HORIZON_DAYS = 7
ROLLING_WINDOWS = (7, 14)


def build_daily_panel(df: pd.DataFrame) -> pd.DataFrame:
    named = df[df["has_junction"]].copy()
    daily = (
        named.groupby(["junction_code", "junction_clean", "date"])
        .size()
        .reset_index(name="count")
    )

    full_dates = pd.date_range(df["date"].min(), df["date"].max(), freq="D").date
    junctions = daily[["junction_code", "junction_clean"]].drop_duplicates()

    panel = (
        junctions.assign(key=1)
        .merge(pd.DataFrame({"date": full_dates, "key": 1}), on="key")
        .drop(columns="key")
    )
    panel = panel.merge(daily, on=["junction_code", "junction_clean", "date"], how="left")
    panel["count"] = panel["count"].fillna(0)
    panel = panel.sort_values(["junction_code", "date"]).reset_index(drop=True)
    return panel


def engineer_features(panel: pd.DataFrame) -> pd.DataFrame:
    p = panel.copy()
    p["date_dt"] = pd.to_datetime(p["date"])
    p["weekday"] = p["date_dt"].dt.dayofweek
    p["days_since_start"] = (p["date_dt"] - p["date_dt"].min()).dt.days

    # junction-level stats (computed once on full history -> static feature)
    stats = p.groupby("junction_code")["count"].agg(["mean", "std"]).fillna(0)
    stats.columns = ["junction_mean", "junction_std"]
    p = p.merge(stats, on="junction_code", how="left")

    for w in ROLLING_WINDOWS:
        p[f"roll_mean_{w}"] = (
            p.groupby("junction_code")["count"]
            .transform(lambda s: s.shift(1).rolling(w, min_periods=1).mean())
        )

    ROLLING_FEATS = [f"roll_mean_{w}" for w in ROLLING_WINDOWS]

    p[ROLLING_FEATS] = p[ROLLING_FEATS].fillna(0)

    weekday_dummies = pd.get_dummies(p["weekday"], prefix="wd")
    p = pd.concat([p, weekday_dummies], axis=1)

    return p


FEATURE_COLS_BASE = ["days_since_start", "junction_mean", "junction_std", "roll_mean_7", "roll_mean_14"]


def fit_forecast_model(p: pd.DataFrame):
    weekday_cols = [c for c in p.columns if c.startswith("wd_")]
    feature_cols = FEATURE_COLS_BASE + weekday_cols
    # drop the first 14 days per junction where rolling stats are unstable/cold-start
    train = p[p["days_since_start"] >= 14].copy()

    X = train[feature_cols].values
    y = train["count"].values

    model = GradientBoostingRegressor(
        n_estimators=150, max_depth=3, learning_rate=0.08, subsample=0.8, random_state=42
    )
    model.fit(X, y)
    return model, feature_cols, weekday_cols


def recursive_forecast(model, feature_cols, weekday_cols, panel: pd.DataFrame, p: pd.DataFrame):
    last_date = pd.to_datetime(panel["date"]).max()
    start_day0 = pd.to_datetime(panel["date"]).min()
    results = {jc: [] for jc in panel["junction_code"].unique()}

    junction_meta = p.groupby("junction_code").agg(
        junction_mean=("junction_mean", "first"),
        junction_std=("junction_std", "first"),
        junction_clean=("junction_clean", "first"),
    )

    # history per junction = list of counts (mutable, extended as we predict forward)
    history = {
        jc: list(p[p["junction_code"] == jc].sort_values("date")["count"])
        for jc in panel["junction_code"].unique()
    }

    for step in range(1, HORIZON_DAYS + 1):
        future_date = last_date + timedelta(days=step)
        days_since_start = (future_date - start_day0).days
        weekday = future_date.dayofweek

        rows = []
        jcs = list(history.keys())
        for jc in jcs:
            hist = history[jc]
            roll7 = float(np.mean(hist[-7:])) if hist else 0.0
            roll14 = float(np.mean(hist[-14:])) if hist else 0.0
            row = {
                "days_since_start": days_since_start,
                "junction_mean": junction_meta.loc[jc, "junction_mean"],
                "junction_std": junction_meta.loc[jc, "junction_std"],
                "roll_mean_7": roll7,
                "roll_mean_14": roll14,
            }
            for c in weekday_cols:
                row[c] = 1 if c == f"wd_{weekday}" else 0
            rows.append(row)

        Xf = pd.DataFrame(rows)[feature_cols].values
        preds = np.clip(model.predict(Xf), 0, None)

        for jc, pred in zip(jcs, preds):
            history[jc].append(float(pred))
            results[jc].append({
                "date": future_date.strftime("%Y-%m-%d"),
                "weekday": int(weekday),
                "predicted": round(float(pred), 1),
            })

    return results, junction_meta


def severity_for_rank(pred, all_preds_today):
    """Severity based on this junction's percentile rank across ALL junctions
    on the same day — top decile = high, next 25% = medium, rest = low.
    (A self-relative z-score against the junction's own history made the
    highest-volume junctions look 'low severity' just because they're
    consistently busy — percentile rank against the network avoids that.)"""
    if len(all_preds_today) < 2:
        return "medium"
    rank_pct = (sorted(all_preds_today).index(pred) + 1) / len(all_preds_today)
    if rank_pct >= 0.90:
        return "high"
    if rank_pct >= 0.65:
        return "medium"
    return "low"


def run():
    df = load_clean()
    panel = build_daily_panel(df)
    p = engineer_features(panel)
    model, feature_cols, weekday_cols = fit_forecast_model(p)
    results, junction_meta = recursive_forecast(model, feature_cols, weekday_cols, panel, p)

    weekday_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    last_date = pd.to_datetime(panel["date"]).max()

    days_out = []
    for step in range(HORIZON_DAYS):
        date_str = (last_date + timedelta(days=step + 1)).strftime("%Y-%m-%d")
        day_label = weekday_names[(last_date + timedelta(days=step + 1)).dayofweek]
        all_preds_today = [preds[step]["predicted"] for preds in results.values()]  # ALL junctions
        entries = []
        for jc, preds in results.items():
            entry = preds[step]
            entries.append({
                "junctionCode": jc,
                "junction": junction_meta.loc[jc, "junction_clean"],
                "predicted": entry["predicted"],
                "severity": severity_for_rank(entry["predicted"], all_preds_today),
            })
        entries.sort(key=lambda r: -r["predicted"])
        days_out.append({
            "day": day_label,
            "date": date_str,
            "top": entries[:5],   # severity was computed before this truncation, so it's correct
        })

    per_junction = {
        jc: [e["predicted"] for e in preds] for jc, preds in results.items()
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump({
            "model": "GradientBoostingRegressor (pooled, recursive 7-day rollout)",
            "trainedOnJunctionDays": int(len(p)),
            "forecastStart": (last_date + timedelta(days=1)).strftime("%Y-%m-%d"),
            "horizonDays": HORIZON_DAYS,
            "days": days_out,
            "perJunction": per_junction,
        }, f, indent=2)

    print(f"Wrote 7-day forecast -> {OUT_PATH}")
    for d in days_out:
        print(d["day"], d["date"], "->", [(t["junction"], t["predicted"]) for t in d["top"][:3]])


if __name__ == "__main__":
    run()
