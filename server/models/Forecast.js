import mongoose from "mongoose";

/**
 * Stores the output of ml/model_forecast.py — ONE document per pipeline run.
 * Only ever written by server/seed/seedFromML.js. Routes read, never write.
 */
const forecastDaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },   // "Mon".."Sun"
    date: { type: String, required: true },  // "YYYY-MM-DD"
    top: [
      {
        junctionCode: String,
        junction: String,
        predicted: Number,   // model output — predicted violation count
        severity: { type: String, enum: ["low", "medium", "high"] },
      },
    ],
  },
  { _id: false }
);

const forecastSchema = new mongoose.Schema({
  model: { type: String, required: true },         // e.g. "GradientBoostingRegressor..."
  forecastStart: { type: String, required: true },  // "YYYY-MM-DD"
  horizonDays: { type: Number, default: 7 },
  trainedOnJunctionDays: { type: Number },
  backtest: { type: mongoose.Schema.Types.Mixed }, // { mae, mape, naiveMae, improvementVsNaivePct }
  days: [forecastDaySchema],
  perJunction: { type: mongoose.Schema.Types.Mixed }, // { junctionCode: [7 predicted values] }
  generatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Forecast", forecastSchema);
