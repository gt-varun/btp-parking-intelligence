import { Router } from "express";
import Junction from "../models/Junction.js";

const router = Router();

// GET /api/junctions — all junctions (public)
router.get("/", async (req, res, next) => {
  try {
    const junctions = await Junction.find({}).sort({ violations: -1 });
    res.json(junctions);
  } catch (err) { next(err); }
});

// GET /api/junctions/hotspots?limit=5 — top junctions by CLI score
router.get("/hotspots", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const hotspots = await Junction.find({}).sort({ cliScore: -1 }).limit(limit);
    res.json(hotspots);
  } catch (err) { next(err); }
});

// GET /api/junctions/:jid — single junction
router.get("/:jid", async (req, res, next) => {
  try {
    const j = await Junction.findOne({ jid: req.params.jid });
    if (!j) return res.status(404).json({ message: "Junction not found" });
    res.json(j);
  } catch (err) { next(err); }
});

export default router;
