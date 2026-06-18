/**
 * Seed script — run: `npm run seed` from the server/ directory.
 * Populates: admin user, demo citizen users with sample challans.
 *
 * IMPORTANT: this script no longer seeds Junction documents itself. Real
 * junctions (168 of them, with model-predicted CLI/forecast/rejection
 * fields) come exclusively from `npm run seed:ml`, which must be run FIRST:
 *
 *   cd ml && python3 run_all.py
 *   cd ../server && npm run seed:ml   # writes real junctions + model outputs
 *   npm run seed                      # then seeds demo users/challans against them
 */
import "dotenv/config";
import mongoose from "mongoose";
import Junction from "../models/Junction.js";
import User from "../models/User.js";
import Challan from "../models/Challan.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/btp_db";

const VIOLATION_TYPES = ["NO PARKING", "WRONG PARKING", "PARKING IN A MAIN ROAD", "PARKING ON FOOTPATH", "DOUBLE PARKING"];

function seededRng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

async function buildChallansForUser(userId, email, junctions) {
  const seed = strHash(email);
  const rng = seededRng(seed);
  const count = 4 + Math.floor(rng() * 9);
  const today = new Date();
  const challans = [];

  for (let i = 0; i < count; i++) {
    const j = junctions[Math.floor(rng() * junctions.length)];
    const daysAgo = Math.floor(rng() * 150);
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const fine = [500, 750, 1000, 1500, 2000][Math.floor(rng() * 5)];
    const type = VIOLATION_TYPES[Math.floor(rng() * VIOLATION_TYPES.length)];
    const status = rng() < 0.55 ? "paid" : "pending";
    const prefix = seed.toString(36).toUpperCase().slice(0, 4);
    const challanId = `CH-${prefix}-${String(i + 1).padStart(4, "0")}`;

    challans.push({
      challanId,
      user: userId,
      email,
      junctionId: j.jid,
      junctionName: j.name,
      lat: j.lat,
      lng: j.lng,
      type,
      fine,
      date: d.toISOString().slice(0, 10),
      status,
    });
  }
  return challans;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB");

  const junctions = await Junction.find({}).lean();
  if (junctions.length === 0) {
    console.error(
      "❌  No junctions found. Run `python3 ml/run_all.py` then `npm run seed:ml` BEFORE `npm run seed`."
    );
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`📍  Found ${junctions.length} real junctions (from ML seed) — building demo challans against these`);

  // Clear existing demo users + challans only (junctions are owned by seed:ml)
  await Promise.all([User.deleteMany({}), Challan.deleteMany({})]);
  console.log("🗑   Cleared existing users/challans");

  const admin = await User.create({ email: "admin@test.btp.in", password: "admin123", role: "admin" });
  console.log(`👮  Admin created — admin@test.btp.in / admin123`);

  const SAMPLE_EMAILS = [
    "rahul@example.com",
    "priya@example.com",
    "suresh@example.com",
    "divya@example.com",
    "mohan@example.com",
  ];

  for (const email of SAMPLE_EMAILS) {
    const user = await User.create({ email, password: "user123", role: "user" });
    const challans = await buildChallansForUser(user._id, email, junctions);
    await Challan.insertMany(challans);
    console.log(`👤  Created ${email} with ${challans.length} challans`);
  }

  console.log("\n✅  Seed complete!");
  console.log("   Admin:  admin@test.btp.in  /  admin123");
  console.log("   User:   rahul@example.com  /  user123");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
