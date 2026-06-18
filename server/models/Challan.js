import mongoose from "mongoose";

const challanSchema = new mongoose.Schema(
  {
    challanId: { type: String, required: true, unique: true }, // e.g. "CH-AB12-0001"
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true, lowercase: true },
    junctionId: { type: String, required: true },
    junctionName: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    type: { type: String, required: true },
    fine: { type: Number, required: true },
    date: { type: String, required: true }, // ISO date string YYYY-MM-DD
    status: { type: String, enum: ["pending", "paid", "disputed"], default: "pending" },
  },
  { timestamps: true }
);

challanSchema.index({ user: 1 });
challanSchema.index({ email: 1 });

export default mongoose.model("Challan", challanSchema);
