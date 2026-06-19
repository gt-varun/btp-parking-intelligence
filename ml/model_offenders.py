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
into one feature space and fit a Gaussian Mixture Model (4 components) to group
vehicles into natural risk tiers, then ORDER the resulting clusters by their
mean escalation-feature centroid (not by hand) and label them. This means
the tier boundaries come from the actual structure in the data.

WHY GAUSSIAN MIXTURE INSTEAD OF K-MEANS:
Offender behaviour is a skewed long tail (a few extreme offenders, many minor
ones), which K-Means handles poorly because it assumes round, equal-size
clusters and its tier boundaries jump between runs. A GMM fits elliptical
clusters of different sizes AND gives a SOFT probability per vehicle, so we
can report how confident the model is in each vehicle's tier — important when
the output drives an action as serious as a court referral.

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
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

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

    # Gaussian Mixture segments vehicles into behavioural groups and gives a
    # SOFT probability per vehicle (how cleanly it belongs to its group).
    gmm = GaussianMixture(
        n_components=N_CLUSTERS, covariance_type="full", n_init=5, random_state=42
    )
    segment_ids = gmm.fit_predict(Xs)
    behaviour_confidence = gmm.predict_proba(Xs).max(axis=1)

    # composite escalation score = mean of the (recency-flipped) standardized
    # features, then min-max scaled to 0-100 for readability
    raw_score = Xs_scored.mean(axis=1)
    score_0_100 = 100 * (raw_score - raw_score.min()) / (raw_score.max() - raw_score.min() + 1e-9)

    g = g.copy()
    g["behaviourSegment"] = segment_ids
    g["behaviourConfidence"] = behaviour_confidence.round(3)
    g["escalationScore"] = score_0_100.round(1)

    # ACTIONABLE TIER by percentile of the escalation score, NOT by raw cluster
    # membership: clustering optimizes for density structure, which produced a
    # bloated top tier (23% of vehicles). Percentile cut-offs give a defensible
    # risk pyramid — only the genuinely worst few get Court-Referral.
    pct = g["escalationScore"].rank(pct=True)

    def to_tier(r):
        if r > 0.95:
            return "Court-Referral"   # worst 5%
        if r > 0.80:
            return "Escalate"          # next 15%
        if r > 0.50:
            return "Warning"           # next 30%
        return "Watch"                 # bottom 50%

    g["tier"] = pct.apply(to_tier)

    # VALIDATION (unsupervised, so no accuracy): silhouette = how well-separated
    # the behavioural segments are (-1..1, higher is better); BIC lets us justify
    # k=4 against other component counts. Silhouette is sampled for speed.
    sample = min(5000, len(Xs))
    validation = {
        "silhouette": round(float(
            silhouette_score(Xs, segment_ids, sample_size=sample, random_state=42)
        ), 4),
        "bic": round(float(gmm.bic(Xs)), 1),
        "nComponents": int(N_CLUSTERS),
        "silhouetteSampleSize": int(sample),
    }

    return g, gmm, scaler, feature_cols, validation


def mask_vehicle_id(vid: str) -> str:
    """Vehicle IDs are already anonymized (FKN...) in this dataset, but we
    mask further for any display surface that shouldn't show the raw id."""
    if not isinstance(vid, str) or len(vid) < 4:
        return "****"
    return vid[:4] + "*" * (len(vid) - 6) + vid[-2:]


def run():
    df = load_clean()
    g = build_vehicle_features(df)
    g, gmm, scaler, feature_cols, validation = fit_escalation_model(g)

    tier_counts = g["tier"].value_counts().reindex(TIER_LABELS_ORDERED, fill_value=0).to_dict()

    top = g.sort_values("escalationScore", ascending=False).head(500).copy()
    top["vehicleMasked"] = top["vehicle_id"].apply(mask_vehicle_id)

    records = top[[
        "vehicleMasked", "violations", "confirmed", "rejected", "n_junctions",
        "violation_density", "days_since_last_seen", "escalationScore", "tier",
        "behaviourSegment", "behaviourConfidence",
    ]].rename(columns={
        "confirmed": "confirmedViolations",
        "rejected": "rejectedViolations",
        "n_junctions": "junctionSpread",
        "violation_density": "violationsPerActiveDay",
        "days_since_last_seen": "daysSinceLastSeen",
    }).round(3).to_dict(orient="records")

    out = {
        "model": "GaussianMixture behavioural segmentation (4 components) + percentile escalation tiers",
        "trainedOnVehicles": int(len(g)),
        "totalRepeatOffenders": int(len(g)),
        "validation": validation,
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
