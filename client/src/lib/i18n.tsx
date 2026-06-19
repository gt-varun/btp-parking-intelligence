import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "kn";

const STORAGE_KEY = "btp.lang";

type Dict = Record<string, { en: string; kn: string }>;

export const dict: Dict = {
  "app.title": { en: "Bangalore Traffic Police", kn: "ಬೆಂಗಳೂರು ಸಂಚಾರ ಪೊಲೀಸ್" },
  "app.tagline": { en: "Serving Bengaluru, Safely.", kn: "ಬೆಂಗಳೂರಿಗೆ ಸುರಕ್ಷಿತ ಸೇವೆ." },
  "nav.home": { en: "Home", kn: "ಮುಖಪುಟ" },
  "nav.rules": { en: "Rules & Regulations", kn: "ನಿಯಮಗಳು" },
  "nav.guidelines": { en: "Platform Guide", kn: "ಬಳಕೆದಾರರ ಮಾರ್ಗಸೂಚಿ" },
  "nav.about": { en: "About BTP", kn: "ನಮ್ಮ ಬಗ್ಗೆ" },
  "lang.toggle": { en: "ಕನ್ನಡ", kn: "English" },

  "home.welcome": { en: "Welcome to the BTP Portal", kn: "ಬಿಟಿಪಿ ಪೋರ್ಟಲ್‌ಗೆ ಸ್ವಾಗತ" },
  "home.sub": {
    en: "View your challans, traffic hotspots and learn the rules of the road.",
    kn: "ನಿಮ್ಮ ಚಲನ್‌ಗಳು, ಸಂಚಾರ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು ಮತ್ತು ರಸ್ತೆ ನಿಯಮಗಳನ್ನು ತಿಳಿಯಿರಿ.",
  },
  "home.admin.title": { en: "Operations Dashboard", kn: "ಆಪರೇಷನ್ಸ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
  "home.admin.sub": {
    en: "Live violation map, patrol planning and city-wide analytics.",
    kn: "ಲೈವ್ ಉಲ್ಲಂಘನೆ ನಕ್ಷೆ, ಗಸ್ತು ಯೋಜನೆ ಮತ್ತು ನಗರ-ವ್ಯಾಪಿ ವಿಶ್ಲೇಷಣೆ.",
  },
  "home.quick": { en: "Quick links", kn: "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು" },

  "about.title": { en: "About Bangalore Traffic Police", kn: "ಬೆಂಗಳೂರು ಸಂಚಾರ ಪೊಲೀಸ್ ಬಗ್ಗೆ" },
  "about.p1": {
    en: "The Bangalore Traffic Police (BTP) manages traffic across the city's 50+ traffic stations. Our officers regulate signals, enforce rules and keep Bengaluru moving 24×7.",
    kn: "ಬೆಂಗಳೂರು ಸಂಚಾರ ಪೊಲೀಸ್ (ಬಿಟಿಪಿ) ನಗರದ 50+ ಸಂಚಾರ ಠಾಣೆಗಳಲ್ಲಿ ಸಂಚಾರವನ್ನು ನಿರ್ವಹಿಸುತ್ತದೆ. ನಮ್ಮ ಅಧಿಕಾರಿಗಳು ಸಿಗ್ನಲ್‌ಗಳನ್ನು ನಿಯಂತ್ರಿಸುತ್ತಾರೆ, ನಿಯಮಗಳನ್ನು ಜಾರಿಗೊಳಿಸುತ್ತಾರೆ ಮತ್ತು ಬೆಂಗಳೂರನ್ನು 24×7 ಚಲನಶೀಲವಾಗಿರಿಸುತ್ತಾರೆ.",
  },
  "about.p2": {
    en: "This portal helps citizens view their challans and helps officers monitor hotspots in real time.",
    kn: "ಈ ಪೋರ್ಟಲ್ ನಾಗರಿಕರಿಗೆ ಚಲನ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಮತ್ತು ಅಧಿಕಾರಿಗಳಿಗೆ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
  },

  "rules.title": { en: "Traffic Rules & Regulations", kn: "ಸಂಚಾರ ನಿಯಮಗಳು" },
  "rules.sub": {
    en: "Fines as per the Motor Vehicles (Amendment) Act and Karnataka State rules. Drive safe, stay legal.",
    kn: "ಮೋಟಾರು ವಾಹನ ಕಾಯ್ದೆ ಮತ್ತು ಕರ್ನಾಟಕ ರಾಜ್ಯ ನಿಯಮಗಳಂತೆ ದಂಡ. ಸುರಕ್ಷಿತವಾಗಿ ಚಾಲನೆ ಮಾಡಿ.",
  },
  "rules.fine": { en: "Fine", kn: "ದಂಡ" },

  "guide.title": { en: "How to use this platform", kn: "ಈ ವೇದಿಕೆಯನ್ನು ಬಳಸುವುದು ಹೇಗೆ" },
  "guide.citizens": { en: "For Citizens", kn: "ನಾಗರಿಕರಿಗೆ" },
  "guide.admins": { en: "For Administrators", kn: "ಆಡಳಿತಾಧಿಕಾರಿಗಳಿಗೆ" },

  "side.ops": { en: "Operations", kn: "ಕಾರ್ಯಾಚರಣೆ" },
  "side.liveMap": { en: "Live Map", kn: "ಲೈವ್ ನಕ್ಷೆ" },
  "side.patrol": { en: "Patrol Planner", kn: "ಗಸ್ತು ಯೋಜಕ" },
  "side.tickets": { en: "Ticket Quality", kn: "ಟಿಕೆಟ್ ಗುಣಮಟ್ಟ" },
  "side.offenders": { en: "Repeat Offenders", kn: "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು" },
  "side.analytics": { en: "Analytics", kn: "ವಿಶ್ಲೇಷಣೆ" },
  "side.users": { en: "User Management", kn: "ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ" },
  "side.account": { en: "My Account", kn: "ನನ್ನ ಖಾತೆ" },
  "side.myChallans": { en: "My Challans", kn: "ನನ್ನ ಚಲನ್‌ಗಳು" },
  "side.myAnalytics": { en: "My Analytics", kn: "ನನ್ನ ವಿಶ್ಲೇಷಣೆ" },
  "side.myMap": { en: "My Map", kn: "ನನ್ನ ನಕ್ಷೆ" },
  "side.info": { en: "Info", kn: "ಮಾಹಿತಿ" },
  "side.adminConsole": { en: "Admin Console", kn: "ಆಡಳಿತ ಕನ್ಸೋಲ್" },
  "side.citizenPortal": { en: "Citizen Portal", kn: "ನಾಗರಿಕ ಪೋರ್ಟಲ್" },

  "kpi.total": { en: "Total Challans", kn: "ಒಟ್ಟು ಚಲನ್‌ಗಳು" },
  "kpi.pending": { en: "Pending", kn: "ಬಾಕಿ" },
  "kpi.paid": { en: "Paid", kn: "ಪಾವತಿಸಲಾಗಿದೆ" },
  "kpi.due": { en: "Amount Due", kn: "ಬಾಕಿ ಮೊತ್ತ" },
  "home.recent": { en: "Recent Challans", kn: "ಇತ್ತೀಚಿನ ಚಲನ್‌ಗಳು" },
  "home.viewAll": { en: "View all", kn: "ಎಲ್ಲವನ್ನು ನೋಡಿ" },
  "home.noChallans": { en: "No challans on record.", kn: "ಯಾವುದೇ ಚಲನ್‌ಗಳಿಲ್ಲ." },

  "admin.kpi.violations": { en: "Violations Today", kn: "ಇಂದಿನ ಉಲ್ಲಂಘನೆಗಳು" },
  "admin.kpi.challans": { en: "Challans Issued", kn: "ನೀಡಲಾದ ಚಲನ್‌ಗಳು" },
  "admin.kpi.collected": { en: "Fines Collected", kn: "ಸಂಗ್ರಹಿಸಿದ ದಂಡ" },
  "admin.kpi.patrols": { en: "Active Patrols", kn: "ಸಕ್ರಿಯ ಗಸ್ತು" },
  "admin.overview": { en: "City Overview", kn: "ನಗರ ಅವಲೋಕನ" },
  "admin.liveMap": { en: "Live Violation Map", kn: "ಲೈವ್ ಉಲ್ಲಂಘನೆ ನಕ್ಷೆ" },
  "admin.liveMap.sub": {
    en: "CLI-coded junctions across Bangalore. Drag the slider to scrub through the day.",
    kn: "ಬೆಂಗಳೂರಿನ ಸಿಎಲ್‌ಐ-ಕೋಡೆಡ್ ಜಂಕ್ಷನ್‌ಗಳು. ದಿನವಿಡೀ ಸ್ಕ್ರಬ್ ಮಾಡಲು ಸ್ಲೈಡರ್ ಎಳೆಯಿರಿ.",
  },
  "admin.cli": { en: "CLI view", kn: "ಸಿಎಲ್‌ಐ ನೋಟ" },
  "admin.raw": { en: "Raw count", kn: "ಕಚ್ಚಾ ಎಣಿಕೆ" },
  "admin.timeOfDay": { en: "Time of day", kn: "ದಿನದ ಸಮಯ" },
  "admin.top5": { en: "Top 5 Hotspots", kn: "ಮೊದಲ 5 ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು" },
};

// ── Universal English → Kannada map ─────────────────────────
// Keyed on the exact English source string so any visible label OR data value
// can be translated with tx("..."). Anything not present falls back to English
// (e.g. proper-noun junction names, masked plates, emails, raw numbers).
export const enToKn: Record<string, string> = {
  // Header / shell
  "Parking Intelligence": "ಪಾರ್ಕಿಂಗ್ ಇಂಟೆಲಿಜೆನ್ಸ್",
  "Citizen Portal": "ನಾಗರಿಕ ಪೋರ್ಟಲ್",
  "Sign in": "ಲಾಗಿನ್",
  "Sign out": "ಲಾಗ್ ಔಟ್",
  "Learn more": "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
  "Bangalore Traffic Police": "ಬೆಂಗಳೂರು ಸಂಚಾರ ಪೊಲೀಸ್",

  // Common KPI / table labels
  "Total Violations": "ಒಟ್ಟು ಉಲ್ಲಂಘನೆಗಳು",
  "Challans Issued": "ನೀಡಲಾದ ಚಲನ್‌ಗಳು",
  "Fines Collected": "ಸಂಗ್ರಹಿಸಿದ ದಂಡ",
  "Junctions Tracked": "ಟ್ರ್ಯಾಕ್ ಮಾಡಿದ ಜಂಕ್ಷನ್‌ಗಳು",
  "Total Challans": "ಒಟ್ಟು ಚಲನ್‌ಗಳು",
  "Pending": "ಬಾಕಿ",
  "Paid": "ಪಾವತಿಸಲಾಗಿದೆ",
  "Total Fines": "ಒಟ್ಟು ದಂಡ",
  "Overall Rejection": "ಒಟ್ಟಾರೆ ತಿರಸ್ಕಾರ",
  "Model Accuracy": "ಮಾದರಿ ನಿಖರತೆ",
  "Junction": "ಜಂಕ್ಷನ್",
  "Junctions": "ಜಂಕ್ಷನ್‌ಗಳು",
  "Violations": "ಉಲ್ಲಂಘನೆಗಳು",
  "Status": "ಸ್ಥಿತಿ",
  "Type": "ಪ್ರಕಾರ",
  "Date": "ದಿನಾಂಕ",
  "Fine": "ದಂಡ",
  "Email": "ಇಮೇಲ್",
  "Role": "ಪಾತ್ರ",
  "Action": "ಕ್ರಿಯೆ",
  "Risk": "ಅಪಾಯ",
  "Tier": "ಶ್ರೇಣಿ",
  "Peak": "ಗರಿಷ್ಠ",
  "Units": "ಘಟಕಗಳು",
  "Rank": "ಶ್ರೇಯಾಂಕ",
  "Enforcement": "ಜಾರಿ",
  "CLI": "ಸಿಎಲ್‌ಐ",
  "Rejection %": "ತಿರಸ್ಕಾರ %",
  "Rejection": "ತಿರಸ್ಕಾರ",
  "Rejection Rate": "ತಿರಸ್ಕಾರ ದರ",
  "CLI Score": "ಸಿಎಲ್‌ಐ ಸ್ಕೋರ್",
  "Top Violation": "ಪ್ರಮುಖ ಉಲ್ಲಂಘನೆ",
  "Top": "ಪ್ರಮುಖ",
  "Peak Hour": "ಗರಿಷ್ಠ ಸಮಯ",
  "POI Tags": "ಪಿಒಐ ಟ್ಯಾಗ್‌ಗಳು",
  "Predicted 24h": "ಮುನ್ಸೂಚಿತ 24ಗಂ",
  "Loading…": "ಲೋಡ್ ಆಗುತ್ತಿದೆ…",
  "No results found": "ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ",
  "No users found": "ಯಾವುದೇ ಬಳಕೆದಾರರು ಸಿಗಲಿಲ್ಲ",
  "No challans found": "ಯಾವುದೇ ಚಲನ್‌ಗಳು ಸಿಗಲಿಲ್ಲ",

  // Home — public
  "Jan–May 2024": "ಜನವರಿ–ಮೇ 2024",
  "Live Violation Map · Bengaluru": "ಲೈವ್ ಉಲ್ಲಂಘನೆ ನಕ್ಷೆ · ಬೆಂಗಳೂರು",
  "Count": "ಎಣಿಕೆ",
  "Hour:": "ಗಂಟೆ:",
  "Top Hotspots": "ಪ್ರಮುಖ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು",
  "Rules & Regulations": "ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳು",
  "Know the parking rules": "ಪಾರ್ಕಿಂಗ್ ನಿಯಮಗಳನ್ನು ತಿಳಿಯಿರಿ",
  "Platform Guide": "ವೇದಿಕೆ ಮಾರ್ಗದರ್ಶಿ",
  "How to use this portal": "ಈ ಪೋರ್ಟಲ್ ಬಳಸುವುದು ಹೇಗೆ",
  "About BTP": "ಬಿಟಿಪಿ ಬಗ್ಗೆ",
  "Our mission and reach": "ನಮ್ಮ ಧ್ಯೇಯ ಮತ್ತು ವ್ಯಾಪ್ತಿ",

  // Home — user
  "Welcome back": "ಮರಳಿ ಸ್ವಾಗತ",
  "pending challan(s)": "ಬಾಕಿ ಚಲನ್‌(ಗಳು)",
  "Pay or contest before the due date": "ಕೊನೆಯ ದಿನಾಂಕದ ಮೊದಲು ಪಾವತಿಸಿ ಅಥವಾ ವಿವಾದಿಸಿ",
  "View": "ನೋಡಿ",
  "My Challans": "ನನ್ನ ಚಲನ್‌ಗಳು",
  "My Analytics": "ನನ್ನ ವಿಶ್ಲೇಷಣೆ",
  "My Violation Map": "ನನ್ನ ಉಲ್ಲಂಘನೆ ನಕ್ಷೆ",

  // Home — admin
  "Officer Console": "ಅಧಿಕಾರಿ ಕನ್ಸೋಲ್",
  "City-wide enforcement overview": "ನಗರವ್ಯಾಪಿ ಜಾರಿ ಅವಲೋಕನ",
  "City-wide Junction Heat Map": "ನಗರವ್ಯಾಪಿ ಜಂಕ್ಷನ್ ಹೀಟ್ ಮ್ಯಾಪ್",
  "Patrol Planner": "ಗಸ್ತು ಯೋಜಕ",
  "Ticket Quality": "ಟಿಕೆಟ್ ಗುಣಮಟ್ಟ",
  "Analytics": "ವಿಶ್ಲೇಷಣೆ",
  "Top Hotspots by CLI": "ಸಿಎಲ್‌ಐ ಪ್ರಕಾರ ಪ್ರಮುಖ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು",

  // Analytics page
  "Analytics & Reports": "ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ವರದಿಗಳು",
  "Patterns across time, geography and violation type.": "ಸಮಯ, ಭೌಗೋಳಿಕತೆ ಮತ್ತು ಉಲ್ಲಂಘನೆ ಪ್ರಕಾರದಾದ್ಯಂತ ಮಾದರಿಗಳು.",
  "Total Records": "ಒಟ್ಟು ದಾಖಲೆಗಳು",
  "Date Range": "ದಿನಾಂಕ ವ್ಯಾಪ್ತಿ",
  "Monthly Violations": "ಮಾಸಿಕ ಉಲ್ಲಂಘನೆಗಳು",
  "Violations by Type": "ಪ್ರಕಾರವಾರು ಉಲ್ಲಂಘನೆಗಳು",
  "Hour of Day": "ದಿನದ ಗಂಟೆ",
  "Day of Week": "ವಾರದ ದಿನ",
  "Top 10 Junctions by Volume": "ಪ್ರಮಾಣದ ಪ್ರಕಾರ ಪ್ರಮುಖ 10 ಜಂಕ್ಷನ್‌ಗಳು",

  // Patrol page
  "Priority junctions, deployment recommendations and 7-day forecast.": "ಆದ್ಯತಾ ಜಂಕ್ಷನ್‌ಗಳು, ನಿಯೋಜನೆ ಶಿಫಾರಸುಗಳು ಮತ್ತು 7-ದಿನಗಳ ಮುನ್ಸೂಚನೆ.",
  "Priority Junctions": "ಆದ್ಯತಾ ಜಂಕ್ಷನ್‌ಗಳು",
  "Critical (CLI ≥ 75)": "ತೀವ್ರ (ಸಿಎಲ್‌ಐ ≥ 75)",
  "Units Recommended": "ಶಿಫಾರಸು ಮಾಡಿದ ಘಟಕಗಳು",
  "Forecast Days": "ಮುನ್ಸೂಚನೆ ದಿನಗಳು",
  "Priority Table": "ಆದ್ಯತಾ ಕೋಷ್ಟಕ",
  "Heat Map": "ಹೀಟ್ ಮ್ಯಾಪ್",
  "7-Day Forecast": "7-ದಿನಗಳ ಮುನ್ಸೂಚನೆ",
  "Enforcement Gaps": "ಜಾರಿ ಅಂತರಗಳು",
  "Junction Heat Map": "ಜಂಕ್ಷನ್ ಹೀಟ್ ಮ್ಯಾಪ್",
  "CLI Window": "ಸಿಎಲ್‌ಐ ವಿಂಡೋ",

  // Tickets page
  "Ticket Quality Monitor": "ಟಿಕೆಟ್ ಗುಣಮಟ್ಟ ಮಾನಿಟರ್",
  "Rejection rates, revenue recovery and ticket-quality drill-down.": "ತಿರಸ್ಕಾರ ದರಗಳು, ಆದಾಯ ಚೇತರಿಕೆ ಮತ್ತು ಟಿಕೆಟ್-ಗುಣಮಟ್ಟ ವಿವರ.",
  "Avg. Challan": "ಸರಾಸರಿ ಚಲನ್",
  "Lost Revenue": "ಕಳೆದುಕೊಂಡ ಆದಾಯ",
  "Revenue Recovery Simulator": "ಆದಾಯ ಚೇತರಿಕೆ ಸಿಮ್ಯುಲೇಟರ್",
  "Drag to simulate rejection rate improvement": "ತಿರಸ್ಕಾರ ದರ ಸುಧಾರಣೆಯನ್ನು ಅನುಕರಿಸಲು ಎಳೆಯಿರಿ",
  "recovered at": "ಚೇತರಿಕೆ —",
  "improvement": "ಸುಧಾರಣೆಯಲ್ಲಿ",
  "Rejection by Violation Type": "ಉಲ್ಲಂಘನೆ ಪ್ರಕಾರವಾರು ತಿರಸ್ಕಾರ",
  "Rejection by Vehicle Type": "ವಾಹನ ಪ್ರಕಾರವಾರು ತಿರಸ್ಕಾರ",
  "Junction Drill-down": "ಜಂಕ್ಷನ್ ವಿವರ",

  // Offenders page
  "Repeat Offender Escalation Engine": "ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿ ಉಲ್ಬಣ ಎಂಜಿನ್",
  "KMeans risk tiering across all 298,450 records — vehicles scored on frequency, confirmed-violation rate, junction spread and recency.": "ಎಲ್ಲಾ 2,98,450 ದಾಖಲೆಗಳಲ್ಲಿ KMeans ಅಪಾಯ ಶ್ರೇಣೀಕರಣ — ಆವರ್ತನ, ದೃಢೀಕೃತ ಉಲ್ಲಂಘನೆ ದರ, ಜಂಕ್ಷನ್ ಹರಡುವಿಕೆ ಮತ್ತು ಇತ್ತೀಚೆಗಿನ ಆಧಾರದ ಮೇಲೆ ವಾಹನಗಳಿಗೆ ಸ್ಕೋರ್.",
  "Citizens with 2+ violations in the demo account challan log.": "ಡೆಮೋ ಖಾತೆ ಚಲನ್ ದಾಖಲೆಯಲ್ಲಿ 2+ ಉಲ್ಲಂಘನೆಗಳಿರುವ ನಾಗರಿಕರು.",
  "Dataset-wide (model)": "ಡೇಟಾಸೆಟ್-ವ್ಯಾಪಿ (ಮಾದರಿ)",
  "Demo accounts": "ಡೆಮೋ ಖಾತೆಗಳು",
  "Total Repeat Offenders": "ಒಟ್ಟು ಪುನರಾವರ್ತಿತ ಅಪರಾಧಿಗಳು",
  "Court-Referral Tier": "ನ್ಯಾಯಾಲಯ-ಶಿಫಾರಸು ಶ್ರೇಣಿ",
  "Escalate Tier": "ಉಲ್ಬಣ ಶ್ರೇಣಿ",
  "Watch + Warning": "ವಾಚ್ + ಎಚ್ಚರಿಕೆ",
  "Top Scored Vehicles": "ಹೆಚ್ಚು ಸ್ಕೋರ್ ಪಡೆದ ವಾಹನಗಳು",
  "Search vehicle id…": "ವಾಹನ ಐಡಿ ಹುಡುಕಿ…",
  "Vehicle (masked)": "ವಾಹನ (ಮರೆಮಾಚಿದ)",
  "Confirmed": "ದೃಢೀಕೃತ",
  "Junction Spread": "ಜಂಕ್ಷನ್ ಹರಡುವಿಕೆ",
  "Days Since Last Seen": "ಕೊನೆಯ ಬಾರಿ ಕಂಡ ನಂತರದ ದಿನಗಳು",
  "Escalation Score": "ಉಲ್ಬಣ ಸ್ಕೋರ್",
  "Total Offenders": "ಒಟ್ಟು ಅಪರಾಧಿಗಳು",
  "Critical (5+)": "ತೀವ್ರ (5+)",
  "Total Fines Due": "ಒಟ್ಟು ಬಾಕಿ ದಂಡ",
  "Avg Violations": "ಸರಾಸರಿ ಉಲ್ಲಂಘನೆಗಳು",
  "Offender List": "ಅಪರಾಧಿ ಪಟ್ಟಿ",
  "Search by email…": "ಇಮೇಲ್ ಮೂಲಕ ಹುಡುಕಿ…",
  "Last Seen": "ಕೊನೆಯ ಬಾರಿ ಕಂಡದ್ದು",
  "Hotspot Junctions": "ಹಾಟ್‌ಸ್ಪಾಟ್ ಜಂಕ್ಷನ್‌ಗಳು",

  // Users page
  "User Management": "ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ",
  "All registered citizens. Click a row to see their challans.": "ಎಲ್ಲಾ ನೋಂದಾಯಿತ ನಾಗರಿಕರು. ಚಲನ್‌ಗಳನ್ನು ನೋಡಲು ಸಾಲಿನ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.",
  "Total Citizens": "ಒಟ್ಟು ನಾಗರಿಕರು",
  "Pending Challans": "ಬಾಕಿ ಚಲನ್‌ಗಳು",
  "Total Fines Levied": "ವಿಧಿಸಿದ ಒಟ್ಟು ದಂಡ",
  "Avg Challans/User": "ಸರಾಸರಿ ಚಲನ್/ಬಳಕೆದಾರ",
  "Citizens": "ನಾಗರಿಕರು",
  "Registered": "ನೋಂದಾಯಿತ",
  "Total": "ಒಟ್ಟು",
  "Fines": "ದಂಡ",

  // MyAnalytics
  "Personal violation summary for": "ಇದಕ್ಕಾಗಿ ವೈಯಕ್ತಿಕ ಉಲ್ಲಂಘನೆ ಸಾರಾಂಶ",
  "Top Hotspot": "ಪ್ರಮುಖ ಹಾಟ್‌ಸ್ಪಾಟ್",
  "Violations over time": "ಕಾಲಾನುಕ್ರಮ ಉಲ್ಲಂಘನೆಗಳು",
  "By violation type": "ಉಲ್ಲಂಘನೆ ಪ್ರಕಾರವಾರು",

  // MyChallans
  "All parking violations linked to": "ಇದಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಎಲ್ಲಾ ಪಾರ್ಕಿಂಗ್ ಉಲ್ಲಂಘನೆಗಳು",
  "record(s)": "ದಾಖಲೆ(ಗಳು)",
  "Challan ID": "ಚಲನ್ ಐಡಿ",
  "Pay": "ಪಾವತಿಸಿ",
  "Contest": "ವಿವಾದಿಸಿ",
  "Challan marked as paid": "ಚಲನ್ ಪಾವತಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ",
  "Dispute submitted": "ವಿವಾದ ಸಲ್ಲಿಸಲಾಗಿದೆ",
  "Failed to update challan": "ಚಲನ್ ನವೀಕರಿಸಲು ವಿಫಲವಾಗಿದೆ",

  // MyMap ("My Violation Map" already defined above)
  "Locations where your": "ನಿಮ್ಮ",
  "parking violation(s) were recorded.": "ಪಾರ್ಕಿಂಗ್ ಉಲ್ಲಂಘನೆ(ಗಳು) ದಾಖಲಾದ ಸ್ಥಳಗಳು.",

  // Map legend
  "High CLI (>70)": "ಹೆಚ್ಚಿನ ಸಿಎಲ್‌ಐ (>70)",
  "Medium CLI (40–70)": "ಮಧ್ಯಮ ಸಿಎಲ್‌ಐ (40–70)",
  "Low CLI (<40)": "ಕಡಿಮೆ ಸಿಎಲ್‌ಐ (<40)",
  "Top tier violations": "ಉನ್ನತ ಶ್ರೇಣಿ ಉಲ್ಲಂಘನೆಗಳು",
  "Mid tier": "ಮಧ್ಯಮ ಶ್ರೇಣಿ",
  "Low tier": "ಕಡಿಮೆ ಶ್ರೇಣಿ",
  "Capacity-Loss Index": "ಸಾಮರ್ಥ್ಯ-ನಷ್ಟ ಸೂಚ್ಯಂಕ",
  "Violation Count": "ಉಲ್ಲಂಘನೆ ಎಣಿಕೆ",
  "Marker size ∝ violation volume": "ಮಾರ್ಕರ್ ಗಾತ್ರ ∝ ಉಲ್ಲಂಘನೆ ಪ್ರಮಾಣ",

  // Hotspot card
  "violations": "ಉಲ್ಲಂಘನೆಗಳು",
  "rejection": "ತಿರಸ್ಕಾರ",
  "Intensity": "ತೀವ್ರತೆ",

  // Auth
  "Back to dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
  "Sign in to access citizen tools or the officer console.": "ನಾಗರಿಕ ಪರಿಕರಗಳು ಅಥವಾ ಅಧಿಕಾರಿ ಕನ್ಸೋಲ್ ಪ್ರವೇಶಿಸಲು ಲಾಗಿನ್ ಆಗಿ.",
  "Citizen": "ನಾಗರಿಕ",
  "Officer": "ಅಧಿಕಾರಿ",
  "Register": "ನೋಂದಾಯಿಸಿ",
  "Password": "ಪಾಸ್‌ವರ್ಡ್",
  "Please wait…": "ದಯವಿಟ್ಟು ಕಾಯಿರಿ…",
  "Create account": "ಖಾತೆ ರಚಿಸಿ",
  "Sign in as Officer": "ಅಧಿಕಾರಿಯಾಗಿ ಲಾಗಿನ್",
  "Sign in as Citizen": "ನಾಗರಿಕರಾಗಿ ಲಾಗಿನ್",
  "Signed in as": "ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ —",
  "Live enforcement analytics, challan management, and citizen services for Bengaluru.": "ಬೆಂಗಳೂರಿಗೆ ಲೈವ್ ಜಾರಿ ವಿಶ್ಲೇಷಣೆ, ಚಲನ್ ನಿರ್ವಹಣೆ ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳು.",
  "Enter a valid email address": "ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ",
  "Enter your password": "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
  "Sign in failed": "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ",

  // Guidelines
  "Step-by-step guidance for citizens and administrators using the BTP portal.": "ಬಿಟಿಪಿ ಪೋರ್ಟಲ್ ಬಳಸುವ ನಾಗರಿಕರು ಮತ್ತು ಆಡಳಿತಗಾರರಿಗೆ ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶನ.",

  // ── Data values (categorical enums) ──
  // Statuses
  "pending": "ಬಾಕಿ",
  "paid": "ಪಾವತಿಸಲಾಗಿದೆ",
  "disputed": "ವಿವಾದಿತ",
  "disposed": "ವಿಲೇವಾರಿ",
  // Risk / severity / enforcement
  "critical": "ತೀವ್ರ",
  "warning": "ಎಚ್ಚರಿಕೆ",
  "normal": "ಸಾಮಾನ್ಯ",
  "high": "ಹೆಚ್ಚು",
  "medium": "ಮಧ್ಯಮ",
  "low": "ಕಡಿಮೆ",
  // Roles
  "admin": "ಆಡಳಿತಗಾರ",
  "user": "ಬಳಕೆದಾರ",
  // Offender tiers
  "Court-Referral": "ನ್ಯಾಯಾಲಯ-ಶಿಫಾರಸು",
  "Escalate": "ಉಲ್ಬಣ",
  "Warning": "ಎಚ್ಚರಿಕೆ",
  "Watch": "ವಾಚ್",
  // POI tags
  "Market": "ಮಾರುಕಟ್ಟೆ",
  "Metro": "ಮೆಟ್ರೋ",
  "Hospital": "ಆಸ್ಪತ್ರೆ",
  "Commercial": "ವಾಣಿಜ್ಯ",
  "Mall": "ಮಾಲ್",
  "Office": "ಕಚೇರಿ",
  "Temple": "ದೇವಸ್ಥಾನ",
  "School": "ಶಾಲೆ",
  // Weekdays
  "Mon": "ಸೋಮ", "Tue": "ಮಂಗಳ", "Wed": "ಬುಧ", "Thu": "ಗುರು", "Fri": "ಶುಕ್ರ", "Sat": "ಶನಿ", "Sun": "ಭಾನು",
  // Months
  "Jan": "ಜನವರಿ", "Feb": "ಫೆಬ್ರವರಿ", "Mar": "ಮಾರ್ಚ್", "Apr": "ಏಪ್ರಿಲ್", "May": "ಮೇ", "Jun": "ಜೂನ್",
  "Jul": "ಜುಲೈ", "Aug": "ಆಗಸ್ಟ್", "Sep": "ಸೆಪ್ಟೆಂಬರ್", "Oct": "ಅಕ್ಟೋಬರ್", "Nov": "ನವೆಂಬರ್", "Dec": "ಡಿಸೆಂಬರ್",
  // Events
  "Sankranti": "ಸಂಕ್ರಾಂತಿ",
  "Ugadi": "ಯುಗಾದಿ",
  "Ram Navami": "ರಾಮ ನವಮಿ",
  // Vehicle types
  "BUS (BMTC/KSRTC)": "ಬಸ್ (ಬಿಎಂಟಿಸಿ/ಕೆಎಸ್‌ಆರ್‌ಟಿಸಿ)",
  "CAR": "ಕಾರು",
  "FACTORY BUS": "ಕಾರ್ಖಾನೆ ಬಸ್",
  "GOODS AUTO": "ಸರಕು ಆಟೋ",
  "HGV": "ಎಚ್‌ಜಿವಿ",
  "JEEP": "ಜೀಪ್",
  "LGV": "ಎಲ್‌ಜಿವಿ",
  "LORRY/GOODS VEHICLE": "ಲಾರಿ/ಸರಕು ವಾಹನ",
  "MAXI-CAB": "ಮ್ಯಾಕ್ಸಿ-ಕ್ಯಾಬ್",
  "MINI LORRY": "ಮಿನಿ ಲಾರಿ",
  "MOPED": "ಮೊಪೆಡ್",
  "MOTOR CYCLE": "ಮೋಟಾರ್ ಸೈಕಲ್",
  "OTHERS": "ಇತರೆ",
  "PASSENGER AUTO": "ಪ್ರಯಾಣಿಕ ಆಟೋ",
  "PRIVATE BUS": "ಖಾಸಗಿ ಬಸ್",
  "SCHOOL VEHICLE": "ಶಾಲಾ ವಾಹನ",
  "SCOOTER": "ಸ್ಕೂಟರ್",
  "TANKER": "ಟ್ಯಾಂಕರ್",
  "TEMPO": "ಟೆಂಪೋ",
  "TOURIST BUS": "ಪ್ರವಾಸಿ ಬಸ್",
  "TRACTOR": "ಟ್ರ್ಯಾಕ್ಟರ್",
  "VAN": "ವ್ಯಾನ್",
  // Violation types
  "DEFECTIVE NUMBER PLATE": "ದೋಷಪೂರಿತ ನಂಬರ್ ಪ್ಲೇಟ್",
  "DEMANDING EXCESS FARE": "ಹೆಚ್ಚುವರಿ ದರ ಬೇಡಿಕೆ",
  "DOUBLE PARKING": "ಡಬಲ್ ಪಾರ್ಕಿಂಗ್",
  "FAIL TO USE SAFETY BELTS": "ಸುರಕ್ಷತಾ ಬೆಲ್ಟ್ ಬಳಸದಿರುವುದು",
  "H T V PROHIBITED": "ಎಚ್‌ಟಿವಿ ನಿಷೇಧಿತ",
  "NO PARKING": "ನೋ ಪಾರ್ಕಿಂಗ್",
  "OBSTRUCTING DRIVER": "ಚಾಲಕನಿಗೆ ಅಡ್ಡಿ",
  "PARKING IN A MAIN ROAD": "ಮುಖ್ಯ ರಸ್ತೆಯಲ್ಲಿ ಪಾರ್ಕಿಂಗ್",
  "PARKING NEAR BUSTOP/SCHOOL/HOSPITAL ETC": "ಬಸ್‌ಸ್ಟಾಪ್/ಶಾಲೆ/ಆಸ್ಪತ್ರೆ ಬಳಿ ಪಾರ್ಕಿಂಗ್",
  "PARKING NEAR ROAD CROSSING": "ರಸ್ತೆ ದಾಟುವ ಬಳಿ ಪಾರ್ಕಿಂಗ್",
  "PARKING NEAR TRAFFIC LIGHT OR ZEBRA CROSS": "ಸಂಚಾರ ದೀಪ ಅಥವಾ ಜೀಬ್ರಾ ಕ್ರಾಸ್ ಬಳಿ ಪಾರ್ಕಿಂಗ್",
  "PARKING ON FOOTPATH": "ಪಾದಚಾರಿ ಮಾರ್ಗದಲ್ಲಿ ಪಾರ್ಕಿಂಗ್",
  "PARKING OPPOSITE TO ANOTHER PARKED VEHICLE": "ಮತ್ತೊಂದು ನಿಲ್ಲಿಸಿದ ವಾಹನದ ಎದುರು ಪಾರ್ಕಿಂಗ್",
  "PARKING OTHER THAN BUS STOP": "ಬಸ್ ನಿಲ್ದಾಣ ಹೊರತಾಗಿ ಪಾರ್ಕಿಂಗ್",
  "REFUSE TO GO FOR HIRE": "ಬಾಡಿಗೆಗೆ ಹೋಗಲು ನಿರಾಕರಣೆ",
  "WITHOUT SIDE MIRROR": "ಸೈಡ್ ಮಿರರ್ ಇಲ್ಲದೆ",
  "WRONG PARKING": "ತಪ್ಪು ಪಾರ್ಕಿಂಗ್",
};

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
  /** Translate any English UI label or data value; falls back to the input. */
  tx: (s: string | null | undefined) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "kn" || raw === "en") setLangState(raw);
    } catch {
      /* noop */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* noop */
    }
  };

  const t = (key: keyof typeof dict) => dict[key]?.[lang] ?? String(key);

  const tx = (s: string | null | undefined) => {
    if (s == null) return "";
    if (lang !== "kn") return s;
    return enToKn[s] ?? s;
  };

  return <I18nContext.Provider value={{ lang, setLang, t, tx }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
