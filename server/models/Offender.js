import mongoose from "mongoose";

/**
 * Stores one document PER OFFENDER, produced by ml/model_offenders.py.
 * Only ever written/replaced by server/seed/seedFromML.js. Routes read, never write.
 */
const offenderSchema = new mongoose.Schema({
  vehicleMasked: { type: String, required: true },
  violations: Number,
  confirmedViolations: Number,
  rejectedViolations: Number,
  junctionSpread: Number,
  violationsPerActiveDay: Number,
  daysSinceLastSeen: Number,
  escalationScore: { type: Number, required: true }, // model output, 0-100
  tier: { type: String, enum: ["Watch", "Warning", "Escalate", "Court-Referral"], required: true },
  mlModel: { type: String, default: "" },
  mlGeneratedAt: { type: Date },
});

offenderSchema.index({ escalationScore: -1 });
offenderSchema.index({ tier: 1 });

export default mongoose.model("Offender", offenderSchema);
