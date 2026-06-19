"""
benchmark_ticket_quality.py
---------------------------
Trains every candidate rejection-classifier family on ONE identical
train/test split and reports the full metric set (AUC + accuracy,
precision, recall, F1 at a 0.5 threshold) side by side, so the best
model can be chosen on evidence instead of guesswork.

This does NOT touch ml/output/ticket_quality.json — it only prints a
comparison table and the winner (by test AUC, the right metric for this
imbalanced 30%-rejection ranking problem).

Run: ../.venv/bin/python benchmark_ticket_quality.py
"""

import json
import os

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
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
OUT_PATH = os.path.join(os.path.dirname(__file__), "output", "model_benchmark.json")


def candidates():
    return {
        "LogisticRegression": LogisticRegression(max_iter=300, class_weight="balanced"),
        "RandomForest": RandomForestClassifier(
            n_estimators=300, max_depth=18, min_samples_leaf=5,
            class_weight="balanced", n_jobs=-1, random_state=42,
        ),
        "XGBoost": XGBClassifier(
            n_estimators=300, max_depth=8, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            objective="binary:logistic", eval_metric="auc",
            random_state=42, n_jobs=-1,
        ),
        "CatBoost": CatBoostClassifier(
            iterations=500, depth=8, learning_rate=0.05,
            loss_function="Logloss", eval_metric="AUC",
            verbose=0, random_seed=42,
        ),
    }


def build_pipeline(clf):
    pre = ColumnTransformer(
        [("cat", OneHotEncoder(handle_unknown="ignore"), CAT_FEATURES)],
        remainder="passthrough",
    )
    return Pipeline([("pre", pre), ("clf", clf)])


def run():
    df = load_clean()
    df["has_junction"] = df["has_junction"].astype(int)
    labeled = df[df["is_processed"]].copy()

    feature_cols = CAT_FEATURES + NUM_FEATURES
    X = labeled[feature_cols]
    y = labeled["is_rejected"].astype(int)

    # ONE shared split so every model is judged on identical data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    results = []
    for name, clf in candidates().items():
        pipe = build_pipeline(clf)
        pipe.fit(X_train, y_train)
        proba = pipe.predict_proba(X_test)[:, 1]
        pred = (proba >= 0.5).astype(int)
        results.append({
            "model": name,
            "auc": round(float(roc_auc_score(y_test, proba)), 4),
            "accuracy": round(float(accuracy_score(y_test, pred)), 4),
            "precision": round(float(precision_score(y_test, pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, pred, zero_division=0)), 4),
            "f1": round(float(f1_score(y_test, pred, zero_division=0)), 4),
        })

    results.sort(key=lambda r: r["auc"], reverse=True)
    winner = results[0]["model"]

    header = f"{'model':<20}{'AUC':>8}{'accuracy':>10}{'precision':>11}{'recall':>9}{'F1':>8}"
    print("\n" + header)
    print("-" * len(header))
    for r in results:
        print(f"{r['model']:<20}{r['auc']:>8}{r['accuracy']:>10}{r['precision']:>11}{r['recall']:>9}{r['f1']:>8}")
    print(f"\nWinner by AUC: {winner}")
    print("NOTE: no metric can exceed 1.0 (100%) — that is the hard ceiling.")

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump({
            "testSize": int(len(y_test)),
            "trainSize": int(len(y_train)),
            "positiveRate": round(float(y.mean()), 4),
            "rankedByAUC": results,
            "winner": winner,
        }, f, indent=2)
    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    run()
