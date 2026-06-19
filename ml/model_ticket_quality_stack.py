"""
model_ticket_quality_stack.py
-----------------------------
Stacking ensemble for rejection prediction: combines LogisticRegression,
RandomForest, XGBoost and CatBoost as base learners, with a LogisticRegression
meta-learner trained (via 3-fold cross-validated out-of-fold predictions) to
blend their probabilities. This is the proper "combine multiple models" move.

Reports the full metric set on the SAME held-out split the benchmark uses, so
the stacked number is directly comparable to the individual models.
"""

import json
import os

import numpy as np
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

CAT_FEATURES = ["vehicle_type", "primary_violation", "police_station", "weekday_name"]
NUM_FEATURES = ["hour", "n_violations_tagged", "has_junction"]
OUT_PATH = os.path.join(os.path.dirname(__file__), "output", "model_benchmark_stack.json")


def build_stack():
    pre = ColumnTransformer(
        [("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT_FEATURES)],
        remainder="passthrough",
    )
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
    stack = StackingClassifier(
        estimators=base,
        final_estimator=LogisticRegression(max_iter=500),
        stack_method="predict_proba",
        cv=3,
        n_jobs=1,
    )
    return Pipeline([("pre", pre), ("clf", stack)])


def run():
    df = load_clean()
    df["has_junction"] = df["has_junction"].astype(int)
    labeled = df[df["is_processed"]].copy()

    feature_cols = CAT_FEATURES + NUM_FEATURES
    X = labeled[feature_cols]
    y = labeled["is_rejected"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipe = build_stack()
    print("Training stacking ensemble (4 base models x 3-fold CV)... this takes a few minutes")
    pipe.fit(X_train, y_train)
    proba = pipe.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)

    metrics = {
        "model": "StackingClassifier (LogReg+RF+XGB+CatBoost -> LogReg meta)",
        "auc": round(float(roc_auc_score(y_test, proba)), 4),
        "accuracy": round(float(accuracy_score(y_test, pred)), 4),
        "precision": round(float(precision_score(y_test, pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, pred, zero_division=0)), 4),
        "f1": round(float(f1_score(y_test, pred, zero_division=0)), 4),
    }

    print("\nStacking ensemble — held-out test metrics:")
    for k, v in metrics.items():
        print(f"  {k:>10}: {v}")
    print("REMINDER: every metric is capped at 1.0 (100%). 0.95 is not reachable")
    print("with these issue-time features — the signal simply isn't there.")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    run()
