/**
 * seedFromML.js
 * ---------------
 * Reads the trained-model outputs in ml/output/*.json (produced by
 * `python3 ml/run_all.py`) and writes them into MongoDB. This is the ONLY
 * place predicted values are allowed to enter the database — every route in
 * server/routes/* reads from these collections, it never recomputes a score.
 *
 * Run after every retrain:
 *   cd ml && python3 run_all.py && cd ../server && npm run seed:ml
 *
 * Swapping a model: edit the relevant ml/model_*.py file, keep its JSON
 * output contract the same (documented in that file's docstring), re-run
 * the two commands above. Nothing in server/ or client/ needs to change.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import Junction from "../models/Junction.js";
import Forecast from "../models/Forecast.js";
import TicketQuality from "../models/TicketQuality.js";
import Offender from "../models/Offender.js";
import MLMeta from "../models/MLMeta.js";
import DescriptiveStats from "../models/DescriptiveStats.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ML_OUTPUT_DIR = path.resolve(__dirname, "../../ml/output");
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/btp_db";

function readJSON(filename) {
  const p = path.join(ML_OUTPUT_DIR, filename);
  if (!fs.existsSync(p)) {
    throw new Error(
      `Missing ${p}. Run "python3 ml/run_all.py" from the project root before seeding.`
    );
  }
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function seedJunctions(cli) {
  await Junction.deleteMany({});
  const docs = cli.junctions.map((j) => ({
    jid: j.junctionCode,
    name: j.junction,
    lat: j.lat,
    lng: j.lng,
    violations: j.violations,
    cliScore: j.cliScore,
    laneHoursLostPerDay: j.laneHoursLostPerDay,
    rejectionRate: j.rejectionRate,
    topViolation: j.topViolation,
    peakHour: j.peakHour,
    hourlyPattern: j.hourlyPattern,
    carriagewayShare: j.carriagewayShare,
    poiTags: j.poiTags,
    enforcement: "medium", // not derivable from data; admin can edit later
    mlModel: cli.model,
    mlGeneratedAt: new Date(),
  }));
  await Junction.insertMany(docs);
  console.log(`📍  Seeded ${docs.length} junctions from model_cli.py (${cli.model})`);
  return docs;
}

async function seedForecast(forecast) {
  await Forecast.deleteMany({});
  await Forecast.create({
    model: forecast.model,
    forecastStart: forecast.forecastStart,
    horizonDays: forecast.horizonDays,
    trainedOnJunctionDays: forecast.trainedOnJunctionDays,
    backtest: forecast.backtest,
    days: forecast.days,
    perJunction: forecast.perJunction,
    generatedAt: new Date(),
  });
  console.log(`📈  Seeded 7-day forecast from model_forecast.py (${forecast.model})`);
}

async function seedTicketQuality(tq) {
  await TicketQuality.deleteMany({});
  await TicketQuality.create({
    model: tq.model,
    trainedOnTickets: tq.trainedOnTickets,
    testAUC: tq.testAUC,
    testMetrics: tq.testMetrics,
    overallRejectionRate: tq.overallRejectionRate,
    featureImportance: tq.featureImportance,
    byVehicleType: tq.byVehicleType,
    byViolationType: tq.byViolationType,
    byJunction: tq.byJunction,
    pendingRiskSummary: tq.pendingRiskSummary,
    pendingSample: tq.pendingSample,
    generatedAt: new Date(),
  });
  console.log(`🎫  Seeded ticket-quality model output (AUC ${tq.testAUC}, ${tq.model})`);
}

async function seedOffenders(off) {
  await Offender.deleteMany({});
  const docs = off.offenders.map((o) => ({
    vehicleMasked: o.vehicleMasked,
    violations: o.violations,
    confirmedViolations: o.confirmedViolations,
    rejectedViolations: o.rejectedViolations,
    junctionSpread: o.junctionSpread,
    violationsPerActiveDay: o.violationsPerActiveDay,
    daysSinceLastSeen: o.daysSinceLastSeen,
    escalationScore: o.escalationScore,
    tier: o.tier,
    behaviourSegment: o.behaviourSegment,
    behaviourConfidence: o.behaviourConfidence,
    mlModel: off.model,
    mlGeneratedAt: new Date(),
  }));
  await Offender.insertMany(docs);
  console.log(`🚨  Seeded ${docs.length} offender records from model_offenders.py (tiers: ${JSON.stringify(off.tierCounts)})`);
}

// Build the per-feature validation summary rendered by the Model Validation
// panel. Reads straight from each model's JSON output so the numbers shown to
// judges are exactly what the trained models reported — nothing hand-typed.
function buildModelCards({ cli, forecast, tq, offenders }) {
  const pct = (v) => (v == null ? null : `${(v * 100).toFixed(1)}%`);
  return [
    {
      key: "ticketQuality",
      feature: "Ticket rejection prediction",
      model: tq.model,
      task: "Binary classification",
      learning: "Supervised",
      metrics: [
        { label: "Test AUC", value: tq.testAUC?.toFixed?.(3) ?? String(tq.testAUC) },
        { label: "Accuracy", value: pct(tq.testMetrics?.accuracy) },
        { label: "F1", value: tq.testMetrics?.f1?.toFixed?.(3) ?? null },
      ].filter((m) => m.value != null),
      note: `${(tq.trainedOnTickets ?? 0).toLocaleString("en-IN")} labelled tickets · stratified 20% hold-out`,
    },
    {
      key: "cli",
      feature: "Junction severity (heat map)",
      model: cli.model,
      task: "Deterministic capacity-loss index",
      learning: "Rule-based · traffic-engineering calibrated (not a learned model)",
      metrics: [
        {
          label: "Top-10 share of impact",
          value: cli.concentration?.top10SharePct != null
            ? `${cli.concentration.top10SharePct}%`
            : null,
        },
        {
          label: "Junctions = 50% impact",
          value: cli.concentration?.junctionsForHalfOfImpact != null
            ? String(cli.concentration.junctionsForHalfOfImpact)
            : null,
        },
        { label: "Junctions scored", value: cli.junctionsScored != null ? String(cli.junctionsScored) : null },
      ].filter((m) => m.value != null),
      note: "Transparent lane-hours-lost formula from HCM-style road-capacity rules; every term is measured "
        + "from the data except one stated block-duration assumption (a global multiplier, ranking-neutral). "
        + "Caveat: reflects observed-violation density, not un-patrolled hotspots.",
    },
    {
      key: "forecast",
      feature: "7-day patrol forecast",
      model: forecast.model,
      task: "Time-series regression",
      learning: "Supervised",
      metrics: [
        { label: "Back-test MAE", value: forecast.backtest?.mae != null ? String(forecast.backtest.mae) : null },
        { label: "vs naive", value: forecast.backtest?.improvementVsNaivePct != null ? `+${forecast.backtest.improvementVsNaivePct}%` : null },
      ].filter((m) => m.value != null),
      note: forecast.backtest?.method ?? "time-based hold-out",
    },
    {
      key: "offenders",
      feature: "Repeat-offender tiers",
      model: offenders.model,
      task: "Clustering + percentile tiers",
      learning: "Unsupervised",
      metrics: [
        { label: "Silhouette", value: offenders.validation?.silhouette != null ? String(offenders.validation.silhouette) : null },
        { label: "Components", value: offenders.validation?.nComponents != null ? String(offenders.validation.nComponents) : null },
      ].filter((m) => m.value != null),
      note: "Low silhouette = offender behaviour is a continuum; tiers use percentile cut-offs, GMM supplies soft confidence",
    },
    {
      key: "descriptive",
      feature: "Descriptive analytics",
      model: "Pandas aggregation",
      task: "Aggregation",
      learning: "Not a model",
      metrics: [{ label: "Source", value: "Exact dataset counts" }],
      note: "Real monthly / hourly / weekday distributions — no prediction involved",
    },
  ];
}

async function seedMeta(manifest, datasetSummary, modelCards) {
  await MLMeta.findOneAndUpdate(
    { key: "current" },
    {
      key: "current",
      generatedAt: manifest.generatedAt,
      totalSeconds: manifest.totalSeconds,
      models: manifest.models,
      summary: datasetSummary,
      modelCards,
    },
    { upsert: true }
  );
  console.log(`🧠  Seeded ML run metadata + ${modelCards.length} model cards`);
}

async function seedDescriptiveStats(stats) {
  await DescriptiveStats.deleteMany({});
  await DescriptiveStats.create({
    monthlyTrend: stats.monthlyTrend,
    hourOfDay: stats.hourOfDay,
    dayOfWeek: stats.dayOfWeek,
    vehicleTypes: stats.vehicleTypes,
    violationTypes: stats.violationTypes,
    generatedAt: new Date(),
  });
  console.log("📊  Seeded descriptive stats (real dataset aggregates, not model predictions)");
}

export async function seedFromML({ disconnect = true } = {}) {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB:", MONGO_URI);

  const manifest = readJSON("manifest.json");
  const datasetSummary = readJSON("dataset_summary.json");
  const descriptiveStats = readJSON("descriptive_stats.json");
  const cli = readJSON("cli_scores.json");
  const forecast = readJSON("forecast.json");
  const ticketQuality = readJSON("ticket_quality.json");
  const offenders = readJSON("offenders.json");

  const junctionDocs = await seedJunctions(cli);
  await seedForecast(forecast);
  await seedTicketQuality(ticketQuality);
  await seedOffenders(offenders);
  await seedDescriptiveStats(descriptiveStats);
  const modelCards = buildModelCards({ cli, forecast, tq: ticketQuality, offenders });
  await seedMeta(manifest, datasetSummary, modelCards);

  console.log("\n✅  ML seed complete — all predicted values now live in MongoDB.");
  if (disconnect) await mongoose.disconnect();
  return { junctionDocs };
}

// Allow running directly: `node seed/seedFromML.js`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedFromML().catch((err) => {
    console.error("❌  seedFromML failed:", err.message);
    process.exit(1);
  });
}
