import { Router } from "express";
import User from "../models/User.js";
import Challan from "../models/Challan.js";
import Offender from "../models/Offender.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();
router.use(protect, requireAdmin);

// GET /api/admin/users — all non-admin users with challan summary
router.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });

    const enriched = await Promise.all(
      users.map(async (u) => {
        const challans = await Challan.find({ user: u._id });
        const pending = challans.filter((c) => c.status === "pending").length;
        const totalFines = challans.reduce((s, c) => s + c.fine, 0);
        return { ...u.toJSON(), total: challans.length, pending, totalFines };
      })
    );

    res.json(enriched);
  } catch (err) { next(err); }
});

// GET /api/admin/users/:userId/challans
router.get("/users/:userId/challans", async (req, res, next) => {
  try {
    const challans = await Challan.find({ user: req.params.userId }).sort({ date: -1 });
    res.json(challans);
  } catch (err) { next(err); }
});

// GET /api/admin/offenders — repeat offenders derived from the small demo
// Challan collection (the handful of seeded citizen users). Kept for the
// "My Challans"-style admin drill-down UI on demo accounts.
router.get("/offenders", async (_req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$email",
          violations: { $sum: 1 },
          totalFines: { $sum: "$fine" },
          junctions: { $addToSet: "$junctionName" },
          lastSeen: { $max: "$date" },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      },
      { $match: { violations: { $gte: 2 } } },
      { $sort: { violations: -1 } },
      { $limit: 50 },
    ];

    const offenders = await Challan.aggregate(pipeline);
    res.json(offenders);
  } catch (err) { next(err); }
});

// GET /api/admin/offenders-ml?tier=Court-Referral&limit=100
// Real repeat-offender escalation scores from the 298k-record dataset,
// produced by ml/model_offenders.py (KMeans risk tiering). This is the
// dataset-wide model output — distinct from /offenders above, which only
// covers the small demo-user Challan collection.
router.get("/offenders-ml", async (req, res, next) => {
  try {
    const { tier, limit } = req.query;
    const filter = tier ? { tier } : {};
    const docs = await Offender.find(filter)
      .sort({ escalationScore: -1 })
      .limit(parseInt(limit) || 200)
      .lean();

    const tierCounts = await Offender.aggregate([
      { $group: { _id: "$tier", count: { $sum: 1 } } },
    ]);

    res.json({
      offenders: docs,
      tierCounts: Object.fromEntries(tierCounts.map((t) => [t._id, t.count])),
      totalRepeatOffenders: await Offender.countDocuments(),
    });
  } catch (err) { next(err); }
});

export default router;
