"""
model_ticket_quality.py
-------------------------
Ticket Quality Score: a real binary classifier trained on the 165k already-
processed tickets (label = was it rejected?) to predict REJECTION PROBABILITY
for any ticket from features known at the time it's issued — vehicle type,
violation type, junction, hour, weekday, police station, number of tags on
the violation, and whether it's geocoded to a junction at all.

WHY THIS MATTERS (per the brief): 30.1% of processed tickets get rejected.
This model (1) quantifies WHICH conditions predict rejection so BTP can fix
upstream data-capture/process issues before tickets are filed, and (2) scores
the 125k STILL-PENDING tickets with a predicted rejection probability so
reviewers can triage the backlog by predicted risk instead of FIFO.

SWAPPABLE: swap LogisticRegression for GradientBoostingClassifier /
RandomForestClassifier below; everything downstream (feature encoding,
junction/global aggregation, JSON contract) is unchanged as long as the
model exposes .fit(X, y) / .predict_proba(X).

Output: ml/output/ticket_quality.json
    { overallRejectionRate, modelAUC, featureImportance: {...},
      byVehicleType: [...], byViolationType: [...],
      byJunction: [{junction, rejectionRate, n}, ...],
      pendingRiskSummary: { highRisk, mediumRisk, lowRisk, totalPending } }
"""

import json
import os

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from load_data import load_clean

OUT_PATH = os.path.join(os.path.dirname(__file__), "output", "ticket_quality.json")

CAT_FEATURES = ["vehicle_type", "primary_violation", "police_station", "weekday_name"]
NUM_FEATURES = ["hour", "n_violations_tagged", "has_junction"]


def build_pipeline():
    pre = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore"), CAT_FEATURES),
    ], remainder="passthrough")
    # NOTE: swap this single line to try a different model family
    clf = LogisticRegression(max_iter=300, class_weight="balanced")
    return Pipeline([("pre", pre), ("clf", clf)])


def run():
    df = load_clean()
    df["has_junction"] = df["has_junction"].astype(int)

    labeled = df[df["is_processed"]].copy()
    pending = df[df["is_pending"]].copy()

    feature_cols = CAT_FEATURES + NUM_FEATURES
    X = labeled[feature_cols]
    y = labeled["is_rejected"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipe = build_pipeline()
    pipe.fit(X_train, y_train)
    proba_test = pipe.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, proba_test)

    # refit on all labeled data for the production scoring pass
    pipe.fit(X, y)

    # score the pending backlog with predicted rejection probability
    pending_proba = pipe.predict_proba(pending[feature_cols])[:, 1]
    pending = pending.copy()
    pending["rejectionRisk"] = pending_proba

    def risk_band(p):
        if p >= 0.5:
            return "high"
        if p >= 0.3:
            return "medium"
        return "low"

    pending["riskBand"] = pending["rejectionRisk"].apply(risk_band)
    risk_counts = pending["riskBand"].value_counts().to_dict()

    # feature importance proxy: logistic regression coefficients mapped back
    # to the original (pre-one-hot) categorical columns by summing |coef|
    # across that column's one-hot levels, normalized to sum to 1.
    ohe = pipe.named_steps["pre"].named_transformers_["cat"]
    cat_names = ohe.get_feature_names_out(CAT_FEATURES)
    coefs = pipe.named_steps["clf"].coef_[0]
    n_cat = len(cat_names)
    cat_coefs = coefs[:n_cat]
    num_coefs = coefs[n_cat:]

    importance = {}
    for col in CAT_FEATURES:
        mask = [name.startswith(f"{col}_") for name in cat_names]
        importance[col] = float(np.abs(cat_coefs[mask]).sum())
    for col, c in zip(NUM_FEATURES, num_coefs):
        importance[col] = float(np.abs(c))
    total_imp = sum(importance.values()) or 1.0
    importance = {k: round(v / total_imp, 4) for k, v in sorted(importance.items(), key=lambda kv: -kv[1])}

    by_vehicle = (
        labeled.groupby("vehicle_type")["is_rejected"]
        .agg(rejectionRate="mean", n="count")
        .reset_index()
        .sort_values("rejectionRate", ascending=False)
    )
    by_violation = (
        labeled.groupby("primary_violation")["is_rejected"]
        .agg(rejectionRate="mean", n="count")
        .reset_index()
        .sort_values("rejectionRate", ascending=False)
    )
    by_junction = (
        labeled[labeled["has_junction"] == 1]
        .groupby("junction_clean")["is_rejected"]
        .agg(rejectionRate="mean", n="count")
        .reset_index()
        .rename(columns={"junction_clean": "junction"})
        .sort_values("n", ascending=False)
    )

    out = {
        "model": "LogisticRegression (one-hot cat features, class-balanced)",
        "trainedOnTickets": int(len(labeled)),
        "testAUC": round(float(auc), 4),
        "overallRejectionRate": round(float(y.mean()), 4),
        "featureImportance": importance,
        "byVehicleType": by_vehicle.round(4).to_dict(orient="records"),
        "byViolationType": by_violation.round(4).to_dict(orient="records"),
        "byJunction": by_junction.round(4).to_dict(orient="records"),
        "pendingRiskSummary": {
            "totalPending": int(len(pending)),
            "highRisk": int(risk_counts.get("high", 0)),
            "mediumRisk": int(risk_counts.get("medium", 0)),
            "lowRisk": int(risk_counts.get("low", 0)),
        },
        "pendingSample": pending.sort_values("rejectionRisk", ascending=False)[
            ["id", "junction_clean", "vehicle_type", "primary_violation", "rejectionRisk", "riskBand"]
        ].head(200).rename(columns={"junction_clean": "junction"}).round(4).to_dict(orient="records"),
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2)

    print(f"Wrote ticket quality model -> {OUT_PATH}")
    print("Test AUC:", round(auc, 4), "| Overall rejection rate:", round(float(y.mean()), 4))
    print("Feature importance:", importance)
    print("Pending risk bands:", risk_counts)


if __name__ == "__main__":
    run()
