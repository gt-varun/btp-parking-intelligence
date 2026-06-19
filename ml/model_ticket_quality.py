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

PRODUCTION MODEL = STACKING ENSEMBLE. We benchmarked four families on one
identical hold-out split (see benchmark_ticket_quality.py / _stack.py):
    Stacking      AUC 0.698  acc 0.725   <-- best, shipped here
    XGBoost       AUC 0.696  acc 0.720
    CatBoost      AUC 0.686  acc 0.717
    RandomForest  AUC 0.677  acc 0.629
    LogReg        AUC 0.606  acc 0.570
The stack blends LogReg + RandomForest + XGBoost + CatBoost via a logistic
meta-learner trained on 3-fold out-of-fold predictions — the standard,
leakage-safe way to combine models. It is the genuine best of the four
families plus their ensemble; the AUC ceiling (~0.70) is set by the data
(rejection is mostly decided by which police station reviews the ticket),
not the algorithm.

Output: ml/output/ticket_quality.json
    { model, testAUC, overallRejectionRate, featureImportance: {...},
      byVehicleType: [...], byViolationType: [...],
      byJunction: [{junction, rejectionRate, n}, ...],
      pendingRiskSummary: { highRisk, mediumRisk, lowRisk, totalPending } }
"""

import json
import os

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from xgboost import XGBClassifier
from catboost import CatBoostClassifier
from sklearn.metrics import (
    roc_auc_score, accuracy_score, precision_score, recall_score, f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from load_data import load_clean

OUT_PATH = os.path.join(os.path.dirname(__file__), "output", "ticket_quality.json")

CAT_FEATURES = ["vehicle_type", "primary_violation", "police_station", "weekday_name"]
NUM_FEATURES = ["hour", "n_violations_tagged", "has_junction"]


def build_pipeline():
    """Stacking ensemble: 4 base learners -> logistic meta-learner.
    OneHotEncoder is dense (sparse_output=False) so every base model — including
    CatBoost — gets a uniform numeric matrix."""
    pre = ColumnTransformer([
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT_FEATURES),
    ], remainder="passthrough")

    base = [
        ("logreg", LogisticRegression(max_iter=300, class_weight="balanced")),
        ("rf", RandomForestClassifier(
            n_estimators=300, max_depth=18, min_samples_leaf=5,
            class_weight="balanced", n_jobs=-1, random_state=42)),
        ("xgb", XGBClassifier(
            n_estimators=300, max_depth=8, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            objective="binary:logistic", eval_metric="auc",
            random_state=42, n_jobs=-1)),
        ("cat", CatBoostClassifier(
            iterations=300, depth=8, learning_rate=0.05,
            loss_function="Logloss", verbose=0, random_seed=42)),
    ]
    clf = StackingClassifier(
        estimators=base,
        final_estimator=LogisticRegression(max_iter=500),
        stack_method="predict_proba",
        cv=3,
        n_jobs=1,
    )
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

    print("Training stacking ensemble (4 base models x 3-fold CV) — a few minutes...")
    pipe = build_pipeline()
    pipe.fit(X_train, y_train)

    proba_test = pipe.predict_proba(X_test)[:, 1]
    pred_test = (proba_test >= 0.5).astype(int)
    auc = roc_auc_score(y_test, proba_test)
    metrics = {
        "accuracy": round(float(accuracy_score(y_test, pred_test)), 4),
        "precision": round(float(precision_score(y_test, pred_test, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, pred_test, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, pred_test, zero_division=0)), 4),
    }

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

    # feature importance: read the fitted XGBoost base member of the stack
    # (gain-based) and aggregate its one-hot columns back to the original
    # feature names, normalized to sum to 1 — keeps the JSON contract stable.
    stack = pipe.named_steps["clf"]
    ohe = pipe.named_steps["pre"].named_transformers_["cat"]
    cat_names = ohe.get_feature_names_out(CAT_FEATURES)
    importances = stack.named_estimators_["xgb"].feature_importances_
    n_cat = len(cat_names)
    cat_imp = importances[:n_cat]
    num_imp = importances[n_cat:]

    importance = {}
    for col in CAT_FEATURES:
        mask = np.array([name.startswith(f"{col}_") for name in cat_names])
        importance[col] = float(cat_imp[mask].sum())
    for col, c in zip(NUM_FEATURES, num_imp):
        importance[col] = float(c)
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
        "model": "StackingEnsemble (LogReg+RF+XGBoost+CatBoost -> LogReg meta)",
        "trainedOnTickets": int(len(labeled)),
        "testAUC": round(float(auc), 4),
        "testMetrics": metrics,
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
    print("Test AUC:", round(auc, 4), "| metrics:", metrics)
    print("Feature importance:", importance)
    print("Pending risk bands:", risk_counts)


if __name__ == "__main__":
    run()
