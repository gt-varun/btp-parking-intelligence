import mongoose from "mongoose";

/**
 * Stores the output of ml/model_ticket_quality.py — ONE document per pipeline run.
 * Only ever written by server/seed/seedFromML.js. Routes read, never write.
 */
const ticketQualitySchema = new mongoose.Schema({
  model: { type: String, required: true },
  trainedOnTickets: Number,
  testAUC: Number,
  overallRejectionRate: Number,
  featureImportance: { type: mongoose.Schema.Types.Mixed },
  byVehicleType: [{ vehicle_type: String, rejectionRate: Number, n: Number }],
  byViolationType: [{ primary_violation: String, rejectionRate: Number, n: Number }],
  byJunction: [{ junction: String, rejectionRate: Number, n: Number }],
  pendingRiskSummary: {
    totalPending: Number,
    highRisk: Number,
    mediumRisk: Number,
    lowRisk: Number,
  },
  pendingSample: [
    {
      id: String,
      junction: String,
      vehicle_type: String,
      primary_violation: String,
      rejectionRisk: Number,
      riskBand: { type: String, enum: ["low", "medium", "high"] },
    },
  ],
  generatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("TicketQuality", ticketQualitySchema);
