import mongoose from "mongoose";

/**
 * Single-document collection (singleton) holding the manifest of the most
 * recently seeded ML run. Lets the frontend show "Model last trained: ..."
 * and lets admins confirm a re-train actually took effect.
 */
const mlMetaSchema = new mongoose.Schema({
  key: { type: String, default: "current", unique: true },
  generatedAt: { type: Date },
  totalSeconds: Number,
  models: { type: mongoose.Schema.Types.Mixed }, // raw manifest.json contents
  summary: { type: mongoose.Schema.Types.Mixed }, // headline stats from load_data summary()
});

export default mongoose.model("MLMeta", mlMetaSchema);
