import mongoose from "mongoose";

/**
 * Stores the output of ml/descriptive_stats.py — real aggregates computed
 * directly from the dataset (monthly trend, hour/day distribution, vehicle
 * & violation breakdowns). NOT a predictive model — there is nothing to
 * "swap" here, only the underlying CSV.
 */

const descriptiveStatsSchema = new mongoose.Schema({
  monthlyTrend: [
    {
      month: {
        type: String,
        required: true,
      },
      violations: {
        type: Number,
        required: true,
      },
    },
  ],

  hourOfDay: [
    {
      hour: {
        type: Number,
        required: true,
      },
      violations: {
        type: Number,
        required: true,
      },
    },
  ],

  dayOfWeek: [
    {
      day: {
        type: String,
        required: true,
      },
      violations: {
        type: Number,
        required: true,
      },
    },
  ],

  vehicleTypes: [
    {
      vehicle_type: {
        type: String,
        required: true,
      },

      topViolation: {
        type: String,
      },

      topViolationShare: {
        type: Number,
      },

      share: {
        type: Number,
      },

      rejectionRate: {
        type: Number,
      },
    },
  ],

  // IMPORTANT: 'type' is a reserved keyword in Mongoose
  violationTypes: [
    {
      type: {
        type: String,
        required: true,
      },

      count: {
        type: Number,
        required: true,
      },

      rejectionRate: {
        type: Number,
        default: 0,
      },
    },
  ],

  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model(
  "DescriptiveStats",
  descriptiveStatsSchema
);