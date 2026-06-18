import mongoose from "mongoose";

const junctionSchema = new mongoose.Schema({
  jid: { type: String, required: true, unique: true }, // e.g. "j1" or BTP code
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  violations: { type: Number, default: 0 },

  // ---- ML-derived fields (written ONLY by seedFromML.js from ml/output/cli_scores.json) ----
  // These values are produced by ml/model_cli.py. Never set these by hand —
  // re-run `npm run seed:ml` after retraining to refresh them.
  cliScore: { type: Number, default: 0 },          // 0-100 Capacity-Loss Index (model output)
  laneHoursLostPerDay: { type: Number, default: 0 }, // model output
  rejectionRate: { type: Number, default: 0 },      // 0-1, from ticket-quality model
  topViolation: { type: String, default: "" },
  peakHour: { type: Number, default: 0 },           // 0-23
  hourlyPattern: { type: [Number], default: [] },   // 24 floats 0-1 (model output)
  carriagewayShare: { type: Number, default: 0 },   // model output

  poiTags: {
    type: [String],
    enum: ["Market", "Metro", "Hospital", "Commercial", "Mall", "Office", "Temple", "School"],
    default: [],
  },
  enforcement: { type: String, enum: ["low", "medium", "high"], default: "medium" },

  // Provenance: which model + run produced the ML fields above
  mlModel: { type: String, default: "" },
  mlGeneratedAt: { type: Date },
});

export default mongoose.model("Junction", junctionSchema);
