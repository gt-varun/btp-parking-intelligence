import { Router } from "express";
import Junction from "../models/Junction.js";
import Forecast from "../models/Forecast.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(protect, requireAdmin);

// GET /api/patrol/priority?limit=10
// Ranks junctions by model-predicted CLI score (ml/model_cli.py) and adds a
// next-24h prediction pulled from the forecast model's first day, NOT a
// hand-tuned formula.
router.get("/priority", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const junctions = await Junction.find({}).sort({ cliScore: -1 }).limit(limit);
    const forecast = await Forecast.findOne({}).sort({ generatedAt: -1 }).lean();
    const day0 = forecast?.days?.[0];
    const day0Map = new Map((day0?.top || []).map((t) => [t.junctionCode, t.predicted]));

    const priority = junctions.map((j, i) => {
      const predicted24h = day0Map.get(j.jid) ?? forecast?.perJunction?.[j.jid]?.[0] ?? null;
      return {
        ...j.toObject(),
        rank: i + 1,
        predicted24h, // model output (model_forecast.py), null if junction not in forecast set
        recommendedUnits: Math.max(1, Math.ceil(j.cliScore / 25)), // simple deployment heuristic, NOT a model output
      };
    });
    res.json(priority);
  } catch (err) { next(err); }
});

// GET /api/patrol/forecast — real 7-day forecast from ml/model_forecast.py
// Returns a bare array of {day, date, top} to match the existing client
// contract (client/src/pages/admin/Patrol.tsx expects forecast.map(...)).
router.get("/forecast", async (_req, res, next) => {
  try {
    const forecast = await Forecast.findOne({}).sort({ generatedAt: -1 }).lean();
    if (!forecast) return res.status(404).json({ message: "No forecast data. Run the ML pipeline and seed:ml." });
    res.json(forecast.days);
  } catch (err) { next(err); }
});

// GET /api/patrol/forecast-meta — model name + back-test error bar for the
// forecast. Separate from /forecast so the bare-array contract stays intact.
router.get("/forecast-meta", async (_req, res, next) => {
  try {
    const forecast = await Forecast.findOne({}).sort({ generatedAt: -1 }).lean();
    if (!forecast) return res.json({ model: null, backtest: null });
    res.json({ model: forecast.model, backtest: forecast.backtest ?? null });
  } catch (err) { next(err); }
});

// GET /api/patrol/gaps — junctions with high model-predicted CLI score and
// elevated 7-day forecast load. (No enforcement/patrol-roster data exists in
// the raw dataset, so "enforcementLevel" here is a deployment-recommendation
// heuristic derived FROM the model outputs above — not a separate guess —
// while "cliWindow" is the real CLI score from model_cli.py.)
router.get("/gaps", async (_req, res, next) => {
  try {
    const junctions = await Junction.find({}).sort({ cliScore: -1 }).limit(20).lean();
    const forecast = await Forecast.findOne({}).sort({ generatedAt: -1 }).lean();
    const perJunction = forecast?.perJunction || {};

    const gaps = junctions
      .filter((j) => j.cliScore >= 50)
      .slice(0, 10)
      .map((j) => {
        const futurePreds = perJunction[j.jid] || [];
        const avgForecast = futurePreds.length
          ? futurePreds.reduce((a, b) => a + b, 0) / futurePreds.length
          : 0;
        // enforcementLevel: a simple deployment-recommendation scale (0-30)
        // derived from the CLI score, standing in for the patrol-roster data
        // BTP doesn't expose in this dataset.
        const enforcementLevel = Math.round(30 - j.cliScore * 0.22);
        return {
          junction: j.name,
          junctionCode: j.jid,
          cliWindow: j.cliScore,
          enforcementLevel: Math.max(5, enforcementLevel),
          avgForecast7d: Math.round(avgForecast * 10) / 10,
          poiTags: j.poiTags,
          note:
            j.cliScore >= 70
              ? `High CLI score (${j.cliScore}) with avg ${Math.round(avgForecast)} violations/day forecast — verify current patrol coverage`
              : "Moderate CLI score — monitor",
        };
      });

    res.json(gaps);
  } catch (err) { next(err); }
});

export default router;
