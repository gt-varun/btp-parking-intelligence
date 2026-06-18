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
    mlModel: off.model,
    mlGeneratedAt: new Date(),
  }));
  await Offender.insertMany(docs);
  console.log(`🚨  Seeded ${docs.length} offender records from model_offenders.py (tiers: ${JSON.stringify(off.tierCounts)})`);
}

async function seedMeta(manifest, datasetSummary) {
  await MLMeta.findOneAndUpdate(
    { key: "current" },
    {
      key: "current",
      generatedAt: manifest.generatedAt,
      totalSeconds: manifest.totalSeconds,
      models: manifest.models,
      summary: datasetSummary,
    },
    { upsert: true }
  );
  console.log("🧠  Seeded ML run metadata");
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
  await seedMeta(manifest, datasetSummary);

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
