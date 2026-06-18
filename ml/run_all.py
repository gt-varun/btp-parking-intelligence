"""
run_all.py
-----------
Runs every model script in sequence, writes a dataset-level summary (the
headline numbers used across the dashboard — total records, rejection rate,
pending %, repeat offenders, geocoding coverage), and a manifest describing
what ran, when, and which model/algorithm produced each output file. Node's
seed script reads ml/output/manifest.json + ml/output/dataset_summary.json
so it never has to recompute or hardcode a single statistic itself.

Usage:
    python3 run_all.py
"""
import importlib
import json
import os
import time

from load_data import load_clean, summary
import descriptive_stats

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")

MODELS = [
    ("cli", "model_cli", "ml/output/cli_scores.json"),
    ("forecast", "model_forecast", "ml/output/forecast.json"),
    ("ticketQuality", "model_ticket_quality", "ml/output/ticket_quality.json"),
    ("offenders", "model_offenders", "ml/output/offenders.json"),
]


def write_dataset_summary():
    df = load_clean()
    s = summary(df)
    # JSON can't serialize numpy types -> cast everything explicitly
    s = {k: (v.tolist() if hasattr(v, "tolist") else v) for k, v in s.items()}
    with open(os.path.join(OUTPUT_DIR, "dataset_summary.json"), "w") as f:
        json.dump(s, f, indent=2)
    return s


def run():
    manifest = {"generatedAt": None, "models": {}}
    t_start = time.time()

    print(f"\n{'='*60}\nComputing dataset summary ...\n{'='*60}")
    ds_summary = write_dataset_summary()
    print(ds_summary)

    print(f"\n{'='*60}\nComputing descriptive stats (non-ML aggregates) ...\n{'='*60}")
    descriptive_stats.run()

    for key, module_name, out_rel in MODELS:
        print(f"\n{'='*60}\nRunning {module_name} ...\n{'='*60}")
        t0 = time.time()
        mod = importlib.import_module(module_name)
        mod.run()
        elapsed = round(time.time() - t0, 2)
        manifest["models"][key] = {
            "module": module_name,
            "outputFile": out_rel,
            "trainSeconds": elapsed,
        }
        print(f"-- {module_name} done in {elapsed}s")

    manifest["generatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    manifest["totalSeconds"] = round(time.time() - t_start, 2)
    manifest["datasetSummary"] = ds_summary

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nAll models complete in {manifest['totalSeconds']}s. Manifest written.")


if __name__ == "__main__":
    run()

