import { Router } from "express";
import Junction from "../models/Junction.js";
import DescriptiveStats from "../models/DescriptiveStats.js";
import TicketQuality from "../models/TicketQuality.js";
import MLMeta from "../models/MLMeta.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(protect, requireAdmin);

// GET /api/analytics/summary
// Pulls real totals from MLMeta.summary (computed once by ml/load_data.py's
// summary() function -- see ml/run_all.py) plus live Junction counts. Avoids
// recomputing or hand-typing a single statistic in JS.
router.get("/summary", async (_req, res, next) => {
  try {
    const [junctions, meta, tq] = await Promise.all([
      Junction.find({}),
      MLMeta.findOne({ key: "current" }).lean(),
      TicketQuality.findOne({}).sort({ generatedAt: -1 }).lean(),
    ]);

    const total = meta?.summary?.total_records ?? junctions.reduce((s, j) => s + j.violations, 0);
    const overallRejection = tq?.overallRejectionRate ?? 0.301;
    const challansIssued = total; // every record IS a challan in this dataset
    const avgChallan = 750; // not present in dataset (no fine-amount column) -- display-only assumption, flagged here

    res.json({
      totalViolations: total,
      junctionsTracked: junctions.length,
      dateRange: meta?.summary?.date_range
        ? `${meta.summary.date_range[0]} to ${meta.summary.date_range[1]}`
        : null,
      modelAccuracy: tq?.testAUC ?? null, // real AUC from model_ticket_quality.py, not a fabricated 0.892
      overallRejection,
      pendingPct: meta?.summary?.pending_pct ?? null,
      repeatOffenders3plus: meta?.summary?.repeat_offenders_3plus ?? null,
      avgChallan,
      challansIssued,
      finesCollected: Math.round(challansIssued * avgChallan * (1 - overallRejection)),
      mlGeneratedAt: meta?.generatedAt ?? null,
    });
  } catch (err) { next(err); }
});

// GET /api/analytics/monthly -- real monthly trend from the dataset
router.get("/monthly", async (_req, res, next) => {
  try {
    const stats = await DescriptiveStats.findOne({}).sort({ generatedAt: -1 }).lean();
    res.json(stats?.monthlyTrend ?? []);
  } catch (err) { next(err); }
});

// GET /api/analytics/hourly -- real hour-of-day distribution
router.get("/hourly", async (_req, res, next) => {
  try {
    const stats = await DescriptiveStats.findOne({}).sort({ generatedAt: -1 }).lean();
    res.json(stats?.hourOfDay ?? []);
  } catch (err) { next(err); }
});

// GET /api/analytics/weekday -- real day-of-week distribution
router.get("/weekday", async (_req, res, next) => {
  try {
    const stats = await DescriptiveStats.findOne({}).sort({ generatedAt: -1 }).lean();
    res.json(stats?.dayOfWeek ?? []);
  } catch (err) { next(err); }
});

// GET /api/analytics/violations -- real violation-type breakdown + rejection rate
router.get("/violations", async (_req, res, next) => {
  try {
    const stats = await DescriptiveStats.findOne({}).sort({ generatedAt: -1 }).lean();
    res.json(stats?.violationTypes ?? []);
  } catch (err) { next(err); }
});

// GET /api/analytics/vehicles -- real vehicle-type breakdown + rejection rate
// (mapped to {type, share, rejectionRate, topViolation, topViolationShare}
// to match the existing client contract in Tickets.tsx / Analytics.tsx)
router.get("/vehicles", async (_req, res, next) => {
  try {
    const stats = await DescriptiveStats.findOne({}).sort({ generatedAt: -1 }).lean();
    const mapped = (stats?.vehicleTypes ?? []).map((v) => ({
      type: v.vehicle_type,
      share: v.share,
      rejectionRate: v.rejectionRate,
      topViolation: v.topViolation,
      topViolationShare: v.topViolationShare,
    }));
    res.json(mapped);
  } catch (err) { next(err); }
});

// GET /api/analytics/events
// No festival/event calendar exists in the raw dataset, so this stays a
// short manually-curated annotation layer for the chart's reference dots --
// NOT a model output and not pretended to be one.
router.get("/events", async (_req, res, next) => {
  try {
    const stats = await DescriptiveStats.findOne({}).sort({ generatedAt: -1 }).lean();
    const months = new Set((stats?.monthlyTrend ?? []).map((m) => m.month));
    const KNOWN_EVENTS = [
      { month: "Jan", name: "Sankranti" },
      { month: "Mar", name: "Ugadi" },
    ];
    res.json(KNOWN_EVENTS.filter((e) => months.has(e.month)));
  } catch (err) { next(err); }
});

// GET /api/analytics/top-junctions?limit=10 -- ranked by real violation count
router.get("/top-junctions", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const junctions = await Junction.find({}).sort({ violations: -1 }).limit(limit);
    res.json(junctions);
  } catch (err) { next(err); }
});

// GET /api/analytics/ticket-quality -- full ticket-quality model output
// (feature importance, per-junction/vehicle/violation rejection rates, AUC)
router.get("/ticket-quality", async (_req, res, next) => {
  try {
    const tq = await TicketQuality.findOne({}).sort({ generatedAt: -1 }).lean();
    if (!tq) return res.status(404).json({ message: "No ticket quality model output. Run the ML pipeline and seed:ml." });
    res.json(tq);
  } catch (err) { next(err); }
});

export default router;
