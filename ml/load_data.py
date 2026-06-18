"""
load_data.py
-------------
Single shared loader for the BTP parking-violation dataset.
Every model script (model_cli.py, model_forecast.py, model_ticket_quality.py,
model_offenders.py) imports `load_clean()` from here so that all four models
train on EXACTLY the same cleaned frame and there is one place to fix a parsing
bug.

Run directly to print a data-quality summary:
    python3 load_data.py
"""

import json
import re
import os
import numpy as np
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv

RAW_CSV = os.path.join(os.path.dirname(__file__), "data", "violations_raw.csv")

# Violations that physically occupy a traffic lane / block carriageway flow.
# Used to weight the Capacity-Loss Index — a vehicle blocking a main road
# costs far more lane-hours than a defective number plate.
CARRIAGEWAY_BLOCKING = {
    "WRONG PARKING",
    "PARKING IN A MAIN ROAD",
    "DOUBLE PARKING",
    "PARKING NEAR ROAD CROSSING",
    "PARKING NEAR TRAFFIC LIGHT OR ZEBRA CROSS",
    "PARKING OPPOSITE TO ANOTHER PARKED VEHICLE",
    "AGAINST ONE WAY/NO ENTRY",
    "VIOLATING LANE DISIPLINE",
}
FOOTPATH_OR_LOW_IMPACT = {
    "PARKING ON FOOTPATH",
    "DEFECTIVE NUMBER PLATE",
    "WITHOUT SIDE MIRROR",
    "USING BLACK FILM/OTHER MATERIALS",
    "FAIL TO USE SAFETY BELTS",
}

# Rough relative road-footprint multiplier per vehicle type (car = 1.0 baseline).
# Used by the CLI model — a goods lorry blocks roughly 3x the carriageway
# width/length of a scooter for the same parking duration.
VEHICLE_FOOTPRINT = {
    "SCOOTER": 0.35, "MOTOR CYCLE": 0.35, "MOPED": 0.3,
    "CAR": 1.0, "JEEP": 1.1, "VAN": 1.2,
    "PASSENGER AUTO": 0.8, "MAXI-CAB": 1.3,
    "LGV": 1.8, "GOODS AUTO": 1.0, "TEMPO": 1.6,
    "MINI LORRY": 2.0, "LORRY/GOODS VEHICLE": 2.6, "HGV": 2.8, "TANKER": 2.8,
    "PRIVATE BUS": 2.5, "BUS (BMTC/KSRTC)": 2.5, "TOURIST BUS": 2.5,
    "SCHOOL VEHICLE": 2.2, "FACTORY BUS": 2.5, "TRACTOR": 2.0, "OTHERS": 1.0,
}


def _parse_json_list(s):
    if not isinstance(s, str):
        return []
    try:
        v = json.loads(s)
        return v if isinstance(v, list) else [v]
    except Exception:
        return []


def load_clean(path: str = RAW_CSV) -> pd.DataFrame:
    """Load dataset from CSV first, MongoDB Atlas as fallback."""

    try:
        if os.path.exists(path):
            print(f"📄 Loading dataset from CSV: {path}")
            df = pd.read_csv(path, low_memory=False)
        else:
            raise FileNotFoundError("CSV not found")

    except Exception as e:
        print(f"⚠️ CSV unavailable ({e})")
        print("☁️ Falling back to MongoDB Atlas...")

        load_dotenv("../server/.env")

        client = MongoClient(os.getenv("MONGO_URI"))
        db = client["btp_db"]

        records = list(
            db.violations_raw.find({}, {"_id": 0})
        )

        df = pd.DataFrame(records)

        print(f"✅ Loaded {len(df)} records from Atlas")

    # ---- timestamps ----
    df["created_dt"] = pd.to_datetime(df["created_datetime"], utc=True, errors="coerce")
    df = df.dropna(subset=["created_dt"]).copy()
    df["date"] = df["created_dt"].dt.date
    df["hour"] = df["created_dt"].dt.hour
    df["weekday"] = df["created_dt"].dt.dayofweek  # 0=Mon
    df["weekday_name"] = df["created_dt"].dt.day_name()
    df["month"] = df["created_dt"].dt.to_period("M").astype(str)

    # ---- junction cleanup ----
    # "BTP051 - Safina Plaza Junction" -> code "BTP051", clean name "Safina Plaza Junction"
    def split_junction(raw):
        if raw == "No Junction" or not isinstance(raw, str):
            return pd.Series(["UNASSIGNED", "No Junction"])
        m = re.match(r"^(BTP\d+)\s*-\s*(.+)$", raw.strip())
        if m:
            return pd.Series([m.group(1), m.group(2).strip()])
        return pd.Series(["UNASSIGNED", raw.strip()])

    df[["junction_code", "junction_clean"]] = df["junction_name"].apply(split_junction)
    df["has_junction"] = df["junction_code"] != "UNASSIGNED"

    # ---- violation type list parsing ----
    df["violation_list"] = df["violation_type"].apply(_parse_json_list)
    df["n_violations_tagged"] = df["violation_list"].apply(len)
    df["primary_violation"] = df["violation_list"].apply(lambda l: l[0] if l else "UNKNOWN")
    df["is_carriageway_blocking"] = df["violation_list"].apply(
        lambda l: any(v in CARRIAGEWAY_BLOCKING for v in l)
    )

    # ---- vehicle footprint ----
    df["vehicle_type"] = df["vehicle_type"].fillna("OTHERS").str.upper().str.strip()
    df["footprint"] = df["vehicle_type"].map(VEHICLE_FOOTPRINT).fillna(1.0)

    # ---- validation / ticket status ----
    # NaN validation_status == still pending / unprocessed (42% of records)
    df["validation_status"] = df["validation_status"].fillna("pending").str.lower().str.strip()
    df["is_pending"] = df["validation_status"] == "pending"
    df["is_processed"] = df["validation_status"].isin(["approved", "rejected"])
    df["is_rejected"] = df["validation_status"] == "rejected"
    df["is_approved"] = df["validation_status"] == "approved"

    # ---- vehicle id for repeat-offender tracking ----
    # updated_vehicle_number (post-correction) is more reliable when present
    df["vehicle_id"] = df["updated_vehicle_number"].fillna(df["vehicle_number"])

    keep_cols = [
        "id", "latitude", "longitude", "vehicle_id", "vehicle_type", "footprint",
        "primary_violation", "violation_list", "n_violations_tagged",
        "is_carriageway_blocking", "offence_code", "created_dt", "date", "hour",
        "weekday", "weekday_name", "month", "police_station", "center_code",
        "junction_code", "junction_clean", "junction_name", "has_junction",
        "validation_status", "is_pending", "is_processed", "is_rejected", "is_approved",
        "data_sent_to_scita",
    ]
    return df[keep_cols]


def summary(df: pd.DataFrame) -> dict:
    processed = df["is_processed"].sum()
    return {
        "total_records": len(df),
        "date_range": [str(df["date"].min()), str(df["date"].max())],
        "named_junctions": df.loc[df["has_junction"], "junction_clean"].nunique(),
        "geocoded_to_junction_pct": round(df["has_junction"].mean() * 100, 1),
        "rejection_rate_of_processed": round(df["is_rejected"].sum() / processed * 100, 1) if processed else None,
        "pending_pct": round(df["is_pending"].mean() * 100, 1),
        "repeat_offenders_3plus": int((df["vehicle_id"].value_counts() >= 3).sum()),
    }


# ---------------------------------------------------------------------------
# NOTE: the helper below is a NAME-KEYWORD HEURISTIC, not a model output.
# The dataset has no point-of-interest layer, so poiTags/enforcement can't be
# learned from data. This only exists so the Junction UI has something to
# display in those fields; it is kept separate from every *_scores.json /
# forecast.json / ticket_quality.json / offenders.json file, all of which are
# genuine trained-model predictions.
# ---------------------------------------------------------------------------
POI_KEYWORDS = {
    "Market": ["market", "bazaar", "mandi"],
    "Metro": ["metro", "railway", "station"],
    "Hospital": ["hospital", "nursing", "clinic"],
    "Mall": ["mall", "plaza", "theatre", "cinema"],
    "Temple": ["temple", "church", "mosque", "circle"],
    "School": ["school", "college"],
    "Office": ["tech", "office", "park"],
    "Commercial": ["street", "road", "junction", "circle", "layout"],
}


def heuristic_poi_tags(junction_name: str) -> list:
    name = junction_name.lower()
    tags = [tag for tag, kws in POI_KEYWORDS.items() if any(k in name for k in kws)]
    return tags[:3] if tags else ["Commercial"]


if __name__ == "__main__":
    d = load_clean()
    import pprint
    pprint.pprint(summary(d))
