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
    - is_holiday: festival/public-holiday flag (Sankranti, Ugadi, Holi, ...)
      because Bangalore parking demand spikes on festivals — the dataset's
      own monthly trend shows Sankranti at +22%. The 7-day forecast window
      (Apr 9-15 2024) contains Ugadi (Apr 9), so this feature is live, not
      just historical.
    - junction's own historical mean/std (so the model generalizes across
      junctions of very different volume — a single global model, not 168
      separate tiny models, which would overfit on sparse junctions)
We train ONE XGBRegressor across all junction-days (pooled), then roll the
forecast forward 7 days autoregressively: predict day+1 using real history,
append it to that junction's rolling window, predict day+2 using the
prediction from day+1, etc. — a standard recursive forecasting strategy that
lets a single trained model produce per-junction future paths.

VALIDATION: we back-test on a time-based holdout (train on everything up to
7 days before the dataset ends, recursively predict those last 7 days, and
compare to the real counts) and report MAE / MAPE vs. a naive
last-7-day-average baseline, so the forecast ships with an honest error bar.

SWAPPABLE: replace XGBRegressor with GradientBoostingRegressor / RandomForest
/ Ridge — everything else (features, recursive rollout, JSON contract) stays
the same as long as the model exposes .fit(X, y) / .predict(X).

Output: ml/output/forecast.json
    { model, backtest: {mae, mape, naiveMae, ...}, forecastStart,
      days: [{ day, date, top: [{junction, junctionCode, severity, predicted}] }],
      perJunction: { junctionCode: [7 predicted values] } }
"""

import json
import os
from datetime import date, timedelta

import numpy as np
import pandas as pd
from xgboost import XGBRegressor

from load_data import load_clean

OUT_PATH = os.path.join(os.path.dirname(__file__), "output", "forecast.json")
HORIZON_DAYS = 7
ROLLING_WINDOWS = (7, 14)

# Festival / public holidays within (and just after) the dataset window
# 2023-11-09 .. 2024-04-08. Parking demand deviates on these days; the model
# learns the effect from the in-window holidays and applies it to Ugadi, which
# falls inside the forecast horizon.
HOLIDAYS = {
    date(2023, 11, 12),  # Deepavali
    date(2023, 11, 27),  # Guru Nanak Jayanti
    date(2023, 12, 25),  # Christmas
    date(2024, 1, 1),    # New Year's Day
    date(2024, 1, 15),   # Makar Sankranti
    date(2024, 1, 26),   # Republic Day
    date(2024, 3, 8),    # Maha Shivaratri
    date(2024, 3, 25),   # Holi
    date(2024, 3, 29),   # Good Friday
    date(2024, 4, 9),    # Ugadi (inside the forecast window)
    date(2024, 4, 11),   # Eid-ul-Fitr (inside the forecast window)
}


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
    p["is_holiday"] = p["date_dt"].dt.date.isin(HOLIDAYS).astype(int)

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


FEATURE_COLS_BASE = [
    "days_since_start", "junction_mean", "junction_std",
    "roll_mean_7", "roll_mean_14", "is_holiday",
]


def _new_model():
    return XGBRegressor(
        n_estimators=300, max_depth=4, learning_rate=0.05,
        subsample=0.8, colsample_bytree=0.8,
        objective="reg:squarederror", random_state=42, n_jobs=-1,
    )


def fit_forecast_model(p: pd.DataFrame, max_day: int | None = None):
    """Fit the pooled regressor. If max_day is given, only train on junction-days
    up to that day index (used by the time-based back-test)."""
    weekday_cols = [c for c in p.columns if c.startswith("wd_")]
    feature_cols = FEATURE_COLS_BASE + weekday_cols
    # drop the first 14 days per junction where rolling stats are cold-start
    train = p[p["days_since_start"] >= 14].copy()
    if max_day is not None:
        train = train[train["days_since_start"] <= max_day]

    X = train[feature_cols].values
    y = train["count"].values

    model = _new_model()
    model.fit(X, y)
    return model, feature_cols, weekday_cols


def _roll_forward(model, feature_cols, weekday_cols, history, junction_meta,
                  jcs, start_date, start_day0, n_steps):
    """Recursively predict n_steps days ahead from `start_date` for every
    junction in `jcs`, given each junction's count `history` up to start_date.
    Returns {jc: [{date, weekday, predicted}, ...]}."""
    results = {jc: [] for jc in jcs}
    hist = {jc: list(history[jc]) for jc in jcs}

    for step in range(1, n_steps + 1):
        future_date = start_date + timedelta(days=step)
        days_since_start = (future_date - start_day0).days
        weekday = future_date.dayofweek
        is_holiday = 1 if future_date.date() in HOLIDAYS else 0

        rows = []
        for jc in jcs:
            h = hist[jc]
            row = {
                "days_since_start": days_since_start,
                "junction_mean": junction_meta.loc[jc, "junction_mean"],
                "junction_std": junction_meta.loc[jc, "junction_std"],
                "roll_mean_7": float(np.mean(h[-7:])) if h else 0.0,
                "roll_mean_14": float(np.mean(h[-14:])) if h else 0.0,
                "is_holiday": is_holiday,
            }
            for c in weekday_cols:
                row[c] = 1 if c == f"wd_{weekday}" else 0
            rows.append(row)

        Xf = pd.DataFrame(rows)[feature_cols].values
        preds = np.clip(model.predict(Xf), 0, None)

        for jc, pred in zip(jcs, preds):
            hist[jc].append(float(pred))
            results[jc].append({
                "date": future_date.strftime("%Y-%m-%d"),
                "weekday": int(weekday),
                "predicted": round(float(pred), 1),
            })

    return results


def _junction_meta(p: pd.DataFrame):
    return p.groupby("junction_code").agg(
        junction_mean=("junction_mean", "first"),
        junction_std=("junction_std", "first"),
        junction_clean=("junction_clean", "first"),
    )


def _history_upto(p: pd.DataFrame, jcs, cutoff_dt):
    sub = p[pd.to_datetime(p["date"]) <= cutoff_dt]
    return {
        jc: list(sub[sub["junction_code"] == jc].sort_values("date")["count"])
        for jc in jcs
    }


def backtest(p: pd.DataFrame):
    """Time-based holdout: train on everything up to (last_date - 7d), recursively
    predict the final 7 days, and score against the real counts. Compared to a
    naive 'repeat the last-7-day average' baseline."""
    p["date_dt2"] = pd.to_datetime(p["date"])
    last_dt = p["date_dt2"].max()
    start_day0 = p["date_dt2"].min()
    cutoff_dt = last_dt - timedelta(days=HORIZON_DAYS)
    cutoff_day = int((cutoff_dt - start_day0).days)

    jcs = list(p["junction_code"].unique())
    meta = _junction_meta(p)

    model, feature_cols, weekday_cols = fit_forecast_model(p, max_day=cutoff_day)
    history = _history_upto(p, jcs, cutoff_dt)
    preds = _roll_forward(model, feature_cols, weekday_cols, history, meta,
                          jcs, cutoff_dt, start_day0, HORIZON_DAYS)

    # actuals for the held-out window, keyed by (jc, date)
    actual = p[(p["date_dt2"] > cutoff_dt)].copy()
    actual_map = {(r.junction_code, r.date_dt2.strftime("%Y-%m-%d")): r.count
                  for r in actual.itertuples()}
    naive_map = {jc: float(np.mean(history[jc][-7:])) if history[jc] else 0.0 for jc in jcs}

    errs, naive_errs, ape = [], [], []
    for jc in jcs:
        for entry in preds[jc]:
            a = actual_map.get((jc, entry["date"]))
            if a is None:
                continue
            errs.append(abs(entry["predicted"] - a))
            naive_errs.append(abs(naive_map[jc] - a))
            if a > 0:
                ape.append(abs(entry["predicted"] - a) / a)

    return {
        "method": "time-based holdout: last 7 days, recursive rollout",
        "heldOutJunctionDays": len(errs),
        "mae": round(float(np.mean(errs)), 3) if errs else None,
        "mape": round(float(np.mean(ape)) * 100, 1) if ape else None,
        "naiveMae": round(float(np.mean(naive_errs)), 3) if naive_errs else None,
        "improvementVsNaivePct": (
            round(float((1 - np.mean(errs) / np.mean(naive_errs)) * 100), 1)
            if errs and naive_errs and np.mean(naive_errs) > 0 else None
        ),
    }


def severity_for_rank(pred, all_preds_today):
    """Severity based on this junction's percentile rank across ALL junctions
    on the same day — top decile = high, next 25% = medium, rest = low."""
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

    # honest error bar first
    bt = backtest(p)

    # production model: train on ALL data, forecast the true future 7 days
    model, feature_cols, weekday_cols = fit_forecast_model(p)
    jcs = list(panel["junction_code"].unique())
    meta = _junction_meta(p)
    last_dt = pd.to_datetime(panel["date"]).max()
    start_day0 = pd.to_datetime(panel["date"]).min()
    history = _history_upto(p, jcs, last_dt)
    results = _roll_forward(model, feature_cols, weekday_cols, history, meta,
                            jcs, last_dt, start_day0, HORIZON_DAYS)

    weekday_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    days_out = []
    for step in range(HORIZON_DAYS):
        future = last_dt + timedelta(days=step + 1)
        date_str = future.strftime("%Y-%m-%d")
        day_label = weekday_names[future.dayofweek]
        all_preds_today = [preds[step]["predicted"] for preds in results.values()]
        entries = []
        for jc, preds in results.items():
            entry = preds[step]
            entries.append({
                "junctionCode": jc,
                "junction": meta.loc[jc, "junction_clean"],
                "predicted": entry["predicted"],
                "severity": severity_for_rank(entry["predicted"], all_preds_today),
            })
        entries.sort(key=lambda r: -r["predicted"])
        days_out.append({"day": day_label, "date": date_str, "top": entries[:5]})

    per_junction = {jc: [e["predicted"] for e in preds] for jc, preds in results.items()}

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump({
            "model": "XGBRegressor (pooled, recursive 7-day rollout, holiday-aware)",
            "trainedOnJunctionDays": int(len(p)),
            "backtest": bt,
            "forecastStart": (last_dt + timedelta(days=1)).strftime("%Y-%m-%d"),
            "horizonDays": HORIZON_DAYS,
            "days": days_out,
            "perJunction": per_junction,
        }, f, indent=2)

    print(f"Wrote 7-day forecast -> {OUT_PATH}")
    print("Backtest:", bt)
    for d in days_out:
        print(d["day"], d["date"], "->", [(t["junction"], t["predicted"]) for t in d["top"][:3]])


if __name__ == "__main__":
    run()
