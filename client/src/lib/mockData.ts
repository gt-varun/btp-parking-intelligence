export const TOTAL_VIOLATIONS = 298450;
export const OVERALL_REJECTION = 0.301;
export const AVG_CHALLAN = 750;
export const REPEAT_REJECTION = 0.148;
export const FIRST_TIME_REJECTION = 0.169;
// DEPRECATED placeholder — the dashboard now reads the REAL model accuracy
// from GET /api/analytics/summary (`modelAccuracy`, the stacking ensemble's
// held-out test accuracy ~0.725). Do not display this constant.
export const MODEL_ACCURACY = 0.725;
export const DATE_RANGE = "Jan–May 2024";

export type PoiTag = "Market" | "Metro" | "Hospital" | "Commercial" | "Mall" | "Office" | "Temple" | "School";

export interface Junction {
  id: string;
  jid?: string; // MongoDB field alias
  name: string;
  lat: number;
  lng: number;
  violations: number;
  cliScore: number; // 0-100
  rejectionRate: number; // 0-1
  topViolation: string;
  peakHour: number;
  hourlyPattern: number[]; // 24 entries 0-1
  poiTags: PoiTag[];
  enforcement: "low" | "medium" | "high";
}

// Deterministic pseudo-random hourly pattern
function hourly(peak: number, intensity = 1): number[] {
  const out: number[] = [];
  for (let h = 0; h < 24; h++) {
    const d = Math.min(Math.abs(h - peak), 24 - Math.abs(h - peak));
    const v = Math.max(0.05, Math.exp(-(d * d) / 12) * intensity);
    out.push(Number(v.toFixed(3)));
  }
  return out;
}

export const junctions: Junction[] = [
  { id: "j1", name: "Safina Plaza", lat: 12.9826, lng: 77.6055, violations: 15449, cliScore: 92, rejectionRate: 0.37, topViolation: "No Parking Zone", peakHour: 11, hourlyPattern: hourly(11, 1), poiTags: ["Commercial", "Market"], enforcement: "medium" },
  { id: "j2", name: "Brigade Road Jn", lat: 12.9719, lng: 77.6068, violations: 13280, cliScore: 88, rejectionRate: 0.33, topViolation: "Footpath Parking", peakHour: 19, hourlyPattern: hourly(19, 0.95), poiTags: ["Commercial", "Mall"], enforcement: "low" },
  { id: "j3", name: "Commercial Street", lat: 12.9836, lng: 77.6094, violations: 12950, cliScore: 85, rejectionRate: 0.34, topViolation: "Carriageway Blocking", peakHour: 18, hourlyPattern: hourly(18, 0.9), poiTags: ["Market", "Commercial"], enforcement: "medium" },
  { id: "j4", name: "MG Road Metro", lat: 12.9756, lng: 77.6068, violations: 11820, cliScore: 81, rejectionRate: 0.29, topViolation: "Parking on Main Road", peakHour: 10, hourlyPattern: hourly(10, 0.88), poiTags: ["Metro", "Commercial"], enforcement: "high" },
  { id: "j5", name: "Indiranagar 100ft Rd", lat: 12.9719, lng: 77.6412, violations: 11050, cliScore: 78, rejectionRate: 0.31, topViolation: "Footpath Parking", peakHour: 20, hourlyPattern: hourly(20, 0.85), poiTags: ["Commercial", "Mall"], enforcement: "low" },
  { id: "j6", name: "Koramangala 80ft", lat: 12.9352, lng: 77.6245, violations: 10430, cliScore: 74, rejectionRate: 0.28, topViolation: "No Parking Zone", peakHour: 19, hourlyPattern: hourly(19, 0.82), poiTags: ["Commercial", "Office"], enforcement: "medium" },
  { id: "j7", name: "Jayanagar 4th Block", lat: 12.9250, lng: 77.5938, violations: 9870, cliScore: 71, rejectionRate: 0.30, topViolation: "Footpath Parking", peakHour: 18, hourlyPattern: hourly(18, 0.78), poiTags: ["Market", "Commercial"], enforcement: "medium" },
  { id: "j8", name: "Majestic Bus Stand", lat: 12.9774, lng: 77.5712, violations: 9420, cliScore: 76, rejectionRate: 0.35, topViolation: "Carriageway Blocking", peakHour: 9, hourlyPattern: hourly(9, 0.8), poiTags: ["Metro", "Commercial"], enforcement: "high" },
  { id: "j9", name: "Whitefield Main Rd", lat: 12.9698, lng: 77.7500, violations: 8950, cliScore: 68, rejectionRate: 0.27, topViolation: "Parking on Main Road", peakHour: 10, hourlyPattern: hourly(10, 0.75), poiTags: ["Office", "Mall"], enforcement: "low" },
  { id: "j10", name: "HSR Layout Sector 1", lat: 12.9116, lng: 77.6473, violations: 8120, cliScore: 64, rejectionRate: 0.26, topViolation: "No Parking Zone", peakHour: 20, hourlyPattern: hourly(20, 0.7), poiTags: ["Commercial", "Office"], enforcement: "medium" },
  { id: "j11", name: "Malleshwaram Jn", lat: 13.0035, lng: 77.5709, violations: 7640, cliScore: 58, rejectionRate: 0.29, topViolation: "Footpath Parking", peakHour: 11, hourlyPattern: hourly(11, 0.68), poiTags: ["Market", "Temple"], enforcement: "medium" },
  { id: "j12", name: "BTM Layout", lat: 12.9165, lng: 77.6101, violations: 7210, cliScore: 55, rejectionRate: 0.28, topViolation: "No Parking Zone", peakHour: 19, hourlyPattern: hourly(19, 0.65), poiTags: ["Commercial"], enforcement: "low" },
  { id: "j13", name: "Yeshwanthpur Jn", lat: 13.0286, lng: 77.5404, violations: 6980, cliScore: 52, rejectionRate: 0.32, topViolation: "Carriageway Blocking", peakHour: 9, hourlyPattern: hourly(9, 0.62), poiTags: ["Metro", "Market"], enforcement: "low" },
  { id: "j14", name: "Marathahalli Bridge", lat: 12.9569, lng: 77.7011, violations: 6420, cliScore: 48, rejectionRate: 0.30, topViolation: "Parking on Main Road", peakHour: 18, hourlyPattern: hourly(18, 0.58), poiTags: ["Mall", "Office"], enforcement: "medium" },
  { id: "j15", name: "Rajajinagar 2nd Blk", lat: 12.9889, lng: 77.5556, violations: 5870, cliScore: 44, rejectionRate: 0.26, topViolation: "No Parking Zone", peakHour: 11, hourlyPattern: hourly(11, 0.55), poiTags: ["Market"], enforcement: "high" },
  { id: "j16", name: "Banashankari TTMC", lat: 12.9250, lng: 77.5667, violations: 5320, cliScore: 41, rejectionRate: 0.25, topViolation: "Footpath Parking", peakHour: 10, hourlyPattern: hourly(10, 0.52), poiTags: ["Metro"], enforcement: "high" },
  { id: "j17", name: "Hebbal Flyover", lat: 13.0359, lng: 77.5970, violations: 4980, cliScore: 38, rejectionRate: 0.28, topViolation: "Parking on Main Road", peakHour: 9, hourlyPattern: hourly(9, 0.5), poiTags: ["Office"], enforcement: "medium" },
  { id: "j18", name: "Domlur Jn", lat: 12.9612, lng: 77.6387, violations: 4520, cliScore: 35, rejectionRate: 0.24, topViolation: "No Parking Zone", peakHour: 19, hourlyPattern: hourly(19, 0.48), poiTags: ["Office"], enforcement: "high" },
  { id: "j19", name: "Vijayanagar Jn", lat: 12.9716, lng: 77.5300, violations: 3980, cliScore: 31, rejectionRate: 0.27, topViolation: "Footpath Parking", peakHour: 18, hourlyPattern: hourly(18, 0.42), poiTags: ["Metro", "Market"], enforcement: "medium" },
  { id: "j20", name: "Elite Junction", lat: 12.9450, lng: 77.6200, violations: 3450, cliScore: 28, rejectionRate: 0.22, topViolation: "No Parking Zone", peakHour: 11, hourlyPattern: hourly(11, 0.4), poiTags: ["Hospital", "Commercial"], enforcement: "high" },
];

export interface ForecastDay {
  day: string;
  date: string;
  top: { junction: string; severity: "high" | "medium" | "low"; predicted: number }[];
}
export const forecast7Day: ForecastDay[] = [
  { day: "Mon", date: "17 Jun", top: [{ junction: "Safina Plaza", severity: "high", predicted: 540 }, { junction: "Brigade Road Jn", severity: "high", predicted: 480 }, { junction: "Commercial Street", severity: "medium", predicted: 410 }] },
  { day: "Tue", date: "18 Jun", top: [{ junction: "MG Road Metro", severity: "high", predicted: 510 }, { junction: "Indiranagar 100ft Rd", severity: "medium", predicted: 420 }, { junction: "Koramangala 80ft", severity: "medium", predicted: 380 }] },
  { day: "Wed", date: "19 Jun", top: [{ junction: "Brigade Road Jn", severity: "high", predicted: 530 }, { junction: "Safina Plaza", severity: "high", predicted: 500 }, { junction: "Majestic Bus Stand", severity: "medium", predicted: 390 }] },
  { day: "Thu", date: "20 Jun", top: [{ junction: "Commercial Street", severity: "high", predicted: 495 }, { junction: "Indiranagar 100ft Rd", severity: "medium", predicted: 430 }, { junction: "Jayanagar 4th Block", severity: "medium", predicted: 360 }] },
  { day: "Fri", date: "21 Jun", top: [{ junction: "Brigade Road Jn", severity: "high", predicted: 620 }, { junction: "Koramangala 80ft", severity: "high", predicted: 540 }, { junction: "Indiranagar 100ft Rd", severity: "high", predicted: 510 }] },
  { day: "Sat", date: "22 Jun", top: [{ junction: "Commercial Street", severity: "high", predicted: 680 }, { junction: "Safina Plaza", severity: "high", predicted: 640 }, { junction: "HSR Layout Sector 1", severity: "medium", predicted: 450 }] },
  { day: "Sun", date: "23 Jun", top: [{ junction: "Brigade Road Jn", severity: "high", predicted: 740 }, { junction: "MG Road Metro", severity: "high", predicted: 620 }, { junction: "Jayanagar 4th Block", severity: "high", predicted: 580 }] },
];

export interface EnforcementGap {
  junction: string;
  cliWindow: number;
  enforcementLevel: number;
  poiTags: PoiTag[];
  note: string;
}
export const enforcementGaps: EnforcementGap[] = [
  { junction: "Brigade Road Jn", cliWindow: 88, enforcementLevel: 18, poiTags: ["Commercial", "Mall"], note: "High CLI 3–9 PM, low patrol coverage on weekdays" },
  { junction: "Indiranagar 100ft Rd", cliWindow: 78, enforcementLevel: 22, poiTags: ["Commercial", "Mall"], note: "Evening footpath blocking spikes — only 1 unit assigned" },
  { junction: "BTM Layout", cliWindow: 55, enforcementLevel: 12, poiTags: ["Commercial"], note: "Underpatrolled despite consistent evening violations" },
];

export interface VehicleType {
  type: string;
  share: number;
  rejectionRate: number;
  topViolation: string;
  topViolationShare: number;
}
export const vehicleTypes: VehicleType[] = [
  { type: "Passenger Auto", share: 0.28, rejectionRate: 0.35, topViolation: "Carriageway Blocking", topViolationShare: 0.18 },
  { type: "Maxi-cab", share: 0.12, rejectionRate: 0.31, topViolation: "Parking on Main Road", topViolationShare: 0.14 },
  { type: "2-Wheeler", share: 0.34, rejectionRate: 0.27, topViolation: "Footpath Parking", topViolationShare: 0.22 },
  { type: "Car (Private)", share: 0.19, rejectionRate: 0.29, topViolation: "No Parking Zone", topViolationShare: 0.16 },
  { type: "Goods Vehicle", share: 0.05, rejectionRate: 0.33, topViolation: "Carriageway Blocking", topViolationShare: 0.20 },
  { type: "Bus / Mini-bus", share: 0.02, rejectionRate: 0.30, topViolation: "Parking on Main Road", topViolationShare: 0.11 },
];

export interface ViolationType {
  type: string;
  count: number;
  rejectionRate: number;
}
export const violationTypes: ViolationType[] = [
  { type: "No Parking Zone", count: 92500, rejectionRate: 0.28 },
  { type: "Footpath Parking", count: 78400, rejectionRate: 0.34 },
  { type: "Carriageway Blocking", count: 61200, rejectionRate: 0.36 },
  { type: "Parking on Main Road", count: 42100, rejectionRate: 0.26 },
  { type: "Double Parking", count: 14250, rejectionRate: 0.31 },
  { type: "Yellow Line Crossing", count: 10000, rejectionRate: 0.23 },
];

export interface RepeatOffender {
  id: string;
  vehicle: string;
  violations: number;
  frequentJunctions: [string, string];
  lastSeen: string;
  rejectionRate: number;
  vehicleType: string;
}
function maskedPlate(seed: number): string {
  const d1 = String(seed).padStart(2, "0").slice(-2);
  const d2 = String(seed * 7 + 13).padStart(2, "0").slice(-2);
  const letters = "ABCDEFGHJKLMPRSTUVWXYZ";
  const l = letters[seed % letters.length] + letters[(seed * 3) % letters.length];
  return `KA-${d1}-${l}-${d2}**`;
}
const jn = junctions.map((j) => j.name);
export const repeatOffenders: RepeatOffender[] = Array.from({ length: 30 }, (_, i) => {
  const v = i === 0 ? 55 : Math.max(3, Math.round(50 * Math.exp(-i / 9) + ((i * 13) % 7)));
  const ja = jn[i % jn.length];
  const jb = jn[(i * 3 + 5) % jn.length];
  const types = ["Passenger Auto", "Maxi-cab", "2-Wheeler", "Car (Private)", "Goods Vehicle"];
  const days = ["3h ago", "1d ago", "2d ago", "5d ago", "1w ago", "2w ago"];
  return {
    id: `o${i + 1}`,
    vehicle: maskedPlate(i * 41 + 7),
    violations: v,
    frequentJunctions: [ja, jb] as [string, string],
    lastSeen: days[i % days.length],
    rejectionRate: 0.1 + ((i * 17) % 23) / 100,
    vehicleType: types[i % types.length],
  };
});

export const monthlyTrend = [
  { month: "Jan", violations: 68200, event: "Sankranti" },
  { month: "Feb", violations: 54300, event: null },
  { month: "Mar", violations: 59100, event: "Ugadi" },
  { month: "Apr", violations: 56800, event: null },
  { month: "May", violations: 60050, event: null },
];

export const hourOfDay = Array.from({ length: 24 }, (_, h) => {
  const base = Math.exp(-Math.pow((h - 10.5) / 4, 2)) * 18000;
  const eve = Math.exp(-Math.pow((h - 19) / 3, 2)) * 12000;
  return { hour: h, violations: Math.round(800 + base + eve) };
});

export const dayOfWeek = [
  { day: "Mon", violations: 36000 },
  { day: "Tue", violations: 38200 },
  { day: "Wed", violations: 39500 },
  { day: "Thu", violations: 41200 },
  { day: "Fri", violations: 47800 },
  { day: "Sat", violations: 49850 },
  { day: "Sun", violations: 52200 }, // ~45% > Mon
];

export const events = [
  { month: "Jan", name: "Sankranti", delta: "+22%" },
  { month: "Mar", name: "Ugadi", delta: "+8%" },
  { month: "Apr", name: "Ram Navami", delta: "+5%" },
];
