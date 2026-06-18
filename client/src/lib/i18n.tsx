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

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
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

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
