"""
model_offenders.py
---------------------
Repeat Offender Escalation Engine: scores every vehicle with >=2 violations
on a continuous 0-100 escalation-risk score and buckets into tiers
(Watch / Warning / Escalate / Court-Referral), instead of a flat "3+
violations = repeat offender" rule.

WHY THIS IS A MODEL AND NOT A THRESHOLD RULE:
There's no labeled ground truth for "should this vehicle be escalated"
(BTP doesn't log enforcement outcomes), so this is an unsupervised problem.
We standardize four behaviourally meaningful signals —
    - violation frequency (volume)
    - confirmed-violation rate (rejected-adjusted: only counts violations
      that were actually approved, so a vehicle isn't penalized for tickets
      that were thrown out)
    - junction spread (how many distinct junctions they offend at — a
      vehicle violating across many junctions is a more systemic problem
      than one stuck in one bad parking spot)
    - recency (days since last seen — still active vs. tailed off)
into one feature space and fit a K-Means clustering model (k=4) to group
vehicles into natural risk tiers, then ORDER the resulting clusters by their
mean escalation-feature centroid (not by hand) and label them. This means
the tier boundaries come from the actual structure in the data, and swapping
KMeans for GaussianMixture/AgglomerativeClustering only touches fit_predict().

Output: ml/output/offenders.json
    { totalRepeatOffenders, tierCounts: {...},
      offenders: [{ vehicleId(masked), violations, confirmedViolations,
                     junctionSpread, daysSinceLastSeen, escalationScore,
                     tier }, ...] (sorted by score desc, capped to top 500) }
"""

import json
import os

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from load_data import load_clean

OUT_PATH = os.path.join(os.path.dirname(__file__), "output", "offenders.json")
MIN_VIOLATIONS = 2
N_CLUSTERS = 4
TIER_LABELS_ORDERED = ["Watch", "Warning", "Escalate", "Court-Referral"]


def build_vehicle_features(df: pd.DataFrame) -> pd.DataFrame:
    last_date = df["date"].max()

    g = df.groupby("vehicle_id").agg(
        violations=("id", "count"),
        confirmed=("is_approved", "sum"),
        rejected=("is_rejected", "sum"),
        n_junctions=("junction_clean", lambda x: x[x != "No Junction"].nunique()),
        first_seen=("date", "min"),
        last_seen=("date", "max"),
    ).reset_index()

    g = g[g["violations"] >= MIN_VIOLATIONS].copy()
    g["confirmed_rate"] = g["confirmed"] / g["violations"]
    g["days_since_last_seen"] = g["last_seen"].apply(lambda d: (last_date - d).days)
    g["active_span_days"] = g.apply(lambda r: max((r["last_seen"] - r["first_seen"]).days, 1), axis=1)
    g["violation_density"] = g["violations"] / g["active_span_days"]  # violations per active day
    return g


def fit_escalation_model(g: pd.DataFrame):
    feature_cols = ["violations", "confirmed_rate", "n_junctions", "violation_density", "days_since_last_seen"]
    X = g[feature_cols].values
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    # recency should pull score DOWN (older last-seen -> lower urgency), so
    # flip the sign on that one standardized column before scoring.
    recency_idx = feature_cols.index("days_since_last_seen")
    Xs_scored = Xs.copy()
    Xs_scored[:, recency_idx] *= -1

    km = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
    cluster_ids = km.fit_predict(Xs)

    # composite escalation score = mean of the (recency-flipped) standardized
    # features, then min-max scaled to 0-100 for readability
    raw_score = Xs_scored.mean(axis=1)
    score_0_100 = 100 * (raw_score - raw_score.min()) / (raw_score.max() - raw_score.min() + 1e-9)

    g = g.copy()
    g["clusterId"] = cluster_ids
    g["escalationScore"] = score_0_100.round(1)

    # order clusters by mean escalation score -> assign tier labels in that order
    cluster_order = (
        g.groupby("clusterId")["escalationScore"].mean().sort_values().index.tolist()
    )
    tier_map = {cid: TIER_LABELS_ORDERED[i] for i, cid in enumerate(cluster_order)}
    g["tier"] = g["clusterId"].map(tier_map)

    return g, km, scaler, feature_cols


def mask_vehicle_id(vid: str) -> str:
    """Vehicle IDs are already anonymized (FKN...) in this dataset, but we
    mask further for any display surface that shouldn't show the raw id."""
    if not isinstance(vid, str) or len(vid) < 4:
        return "****"
    return vid[:4] + "*" * (len(vid) - 6) + vid[-2:]


def run():
    df = load_clean()
    g = build_vehicle_features(df)
    g, km, scaler, feature_cols = fit_escalation_model(g)

    tier_counts = g["tier"].value_counts().reindex(TIER_LABELS_ORDERED, fill_value=0).to_dict()

    top = g.sort_values("escalationScore", ascending=False).head(500).copy()
    top["vehicleMasked"] = top["vehicle_id"].apply(mask_vehicle_id)

    records = top[[
        "vehicleMasked", "violations", "confirmed", "rejected", "n_junctions",
        "violation_density", "days_since_last_seen", "escalationScore", "tier",
    ]].rename(columns={
        "confirmed": "confirmedViolations",
        "rejected": "rejectedViolations",
        "n_junctions": "junctionSpread",
        "violation_density": "violationsPerActiveDay",
        "days_since_last_seen": "daysSinceLastSeen",
    }).round(3).to_dict(orient="records")

    out = {
        "model": "KMeans (k=4) on standardized behavioural features -> ordered risk tiers",
        "trainedOnVehicles": int(len(g)),
        "totalRepeatOffenders": int(len(g)),
        "tierCounts": tier_counts,
        "tierOrder": TIER_LABELS_ORDERED,
        "featureColumns": feature_cols,
        "offenders": records,
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2)

    print(f"Wrote offender escalation model -> {OUT_PATH}")
    print("Tier counts:", tier_counts)
    print("Top 5:", [(r["vehicleMasked"], r["violations"], r["tier"], r["escalationScore"]) for r in records[:5]])


if __name__ == "__main__":
    run()
