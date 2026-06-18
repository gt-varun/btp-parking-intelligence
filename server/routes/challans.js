import { Router } from "express";
import Challan from "../models/Challan.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// All challan routes require login
router.use(protect);

// GET /api/challans — my challans
router.get("/", async (req, res, next) => {
  try {
    const challans = await Challan.find({ user: req.user._id }).sort({ date: -1 });
    res.json(challans);
  } catch (err) { next(err); }
});

// PATCH /api/challans/:id — update status (pay / dispute)
router.patch("/:id", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["paid", "disputed", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const challan = await Challan.findOne({ challanId: req.params.id, user: req.user._id });
    if (!challan) return res.status(404).json({ message: "Challan not found" });
    if (challan.status !== "pending" && status !== "pending") {
      return res.status(400).json({ message: "Only pending challans can be updated" });
    }
    challan.status = status;
    await challan.save();
    res.json(challan);
  } catch (err) { next(err); }
});

export default router;
