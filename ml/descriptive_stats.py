"""
descriptive_stats.py
-----------------------
NOT a predictive model — this script computes real descriptive aggregates
straight from the cleaned dataset (monthly trend, hour-of-day distribution,
day-of-week distribution, vehicle-type breakdown, violation-type breakdown).
It exists so the analytics dashboard shows the ACTUAL dataset shape instead
of the hand-typed placeholder constants that were in the original
server/routes/analytics.js. Kept in a separate file from model_*.py so it's
never confused with a trained model — there's nothing to "swap" here, only
the underlying data.

Output: ml/output/descriptive_stats.json
"""
import json
import os

import pandas as pd

from load_data import load_clean

OUT_PATH = os.path.join(os.path.dirname(__file__), "output", "descriptive_stats.json")
MONTH_LABELS = {
    "2023-11": "Nov", "2023-12": "Dec", "2024-01": "Jan",
    "2024-02": "Feb", "2024-03": "Mar", "2024-04": "Apr",
}
WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
WEEKDAY_SHORT = {"Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed", "Thursday": "Thu",
                  "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun"}


def run():
    df = load_clean()
    processed = df[df["is_processed"]]

    monthly = (
        df.groupby("month").size().reset_index(name="violations")
    )
    monthly["month"] = monthly["month"].map(lambda m: MONTH_LABELS.get(m, m))

    hourly = df.groupby("hour").size().reindex(range(24), fill_value=0).reset_index()
    hourly.columns = ["hour", "violations"]

    weekday = (
        df.groupby("weekday_name").size().reindex(WEEKDAY_ORDER, fill_value=0)
        .reset_index()
    )
    weekday.columns = ["day", "violations"]
    weekday["day"] = weekday["day"].map(WEEKDAY_SHORT)

    def top_violation_and_share(g):
        vc = g["primary_violation"].value_counts()
        if len(vc) == 0:
            return pd.Series({"topViolation": "UNKNOWN", "topViolationShare": 0.0})
        return pd.Series({"topViolation": vc.idxmax(), "topViolationShare": round(float(vc.max() / len(g)), 4)})

    vehicle_total = len(df)
    vehicle = df.groupby("vehicle_type").apply(top_violation_and_share, include_groups=False).reset_index()
    vehicle_counts = df["vehicle_type"].value_counts()
    vehicle["share"] = vehicle["vehicle_type"].map(lambda v: round(float(vehicle_counts[v] / vehicle_total), 4))
    vehicle_rejection = processed.groupby("vehicle_type")["is_rejected"].mean()
    vehicle["rejectionRate"] = vehicle["vehicle_type"].map(lambda v: round(float(vehicle_rejection.get(v, 0)), 4))
    vehicle = vehicle.sort_values("share", ascending=False)

    violation_counts = df["primary_violation"].value_counts().reset_index()
    violation_counts.columns = ["type", "count"]
    violation_rejection = processed.groupby("primary_violation")["is_rejected"].mean()
    violation_counts["rejectionRate"] = violation_counts["type"].map(
        lambda v: round(float(violation_rejection.get(v, 0)), 4)
    )

    out = {
        "monthlyTrend": monthly.to_dict(orient="records"),
        "hourOfDay": hourly.to_dict(orient="records"),
        "dayOfWeek": weekday.to_dict(orient="records"),
        "vehicleTypes": vehicle.round(4).to_dict(orient="records"),
        "violationTypes": violation_counts.head(10).to_dict(orient="records"),
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(out, f, indent=2)

    print(f"Wrote descriptive stats -> {OUT_PATH}")


if __name__ == "__main__":
    run()
