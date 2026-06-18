
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import rulesImg from "@/assets/btp-rules.jpg";
import {
  HardHat,
  ShieldAlert,
  PhoneOff,
  Wine,
  Gauge,
  TrafficCone,
  Car,
  ParkingCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";



interface Rule {
  icon: LucideIcon;
  en: { title: string; desc: string };
  kn: { title: string; desc: string };
  fine: string;
}

const RULES: Rule[] = [
  {
    icon: HardHat,
    en: { title: "Helmet Required", desc: "Both rider and pillion must wear ISI-mark helmets." },
    kn: { title: "ಹೆಲ್ಮೆಟ್ ಕಡ್ಡಾಯ", desc: "ಸವಾರ ಮತ್ತು ಹಿಂಬದಿ ಸವಾರ ISI ಹೆಲ್ಮೆಟ್ ಧರಿಸಬೇಕು." },
    fine: "₹1,000",
  },
  {
    icon: ShieldAlert,
    en: { title: "Seatbelt Mandatory", desc: "All passengers including rear seats must use seatbelts." },
    kn: { title: "ಸೀಟ್‌ಬೆಲ್ಟ್ ಕಡ್ಡಾಯ", desc: "ಎಲ್ಲ ಪ್ರಯಾಣಿಕರು ಸೀಟ್‌ಬೆಲ್ಟ್ ಬಳಸಬೇಕು." },
    fine: "₹1,000",
  },
  {
    icon: TrafficCone,
    en: { title: "No Signal Jumping", desc: "Stop on red. Wait for the green signal." },
    kn: { title: "ಸಿಗ್ನಲ್ ಜಂಪ್ ನಿಷೇಧ", desc: "ಕೆಂಪು ದೀಪದಲ್ಲಿ ನಿಲ್ಲಿ. ಹಸಿರು ಸಿಗ್ನಲ್‌ಗಾಗಿ ಕಾಯಿರಿ." },
    fine: "₹1,000 – ₹5,000",
  },
  {
    icon: Wine,
    en: { title: "No Drunk Driving", desc: "BAC limit 30 mg / 100 ml. Criminal offence." },
    kn: { title: "ಮದ್ಯಪಾನ ಚಾಲನೆ ನಿಷೇಧ", desc: "BAC ಮಿತಿ 30 mg / 100 ml. ಕ್ರಿಮಿನಲ್ ಅಪರಾಧ." },
    fine: "₹10,000 + 6 mo. jail",
  },
  {
    icon: Gauge,
    en: { title: "Over-speeding", desc: "Stay within posted city limits, usually 40–60 km/h." },
    kn: { title: "ವೇಗ ಮೀರುವಿಕೆ", desc: "ನಗರ ಮಿತಿ ಸಾಮಾನ್ಯವಾಗಿ 40–60 ಕಿ.ಮೀ/ಗಂ." },
    fine: "₹1,000 – ₹2,000",
  },
  {
    icon: PhoneOff,
    en: { title: "No Mobile Phone Use", desc: "Hands-free or pulled over only." },
    kn: { title: "ಮೊಬೈಲ್ ಬಳಕೆ ನಿಷೇಧ", desc: "ಹ್ಯಾಂಡ್ಸ್-ಫ್ರೀ ಅಥವಾ ನಿಲ್ಲಿಸಿ ಬಳಸಿರಿ." },
    fine: "₹5,000",
  },
  {
    icon: Car,
    en: { title: "Valid Documents", desc: "Carry DL, RC, Insurance and PUC at all times." },
    kn: { title: "ವಾಹನ ದಾಖಲೆಗಳು", desc: "DL, RC, ವಿಮೆ ಮತ್ತು PUC ಯಾವಾಗಲೂ ಇರಬೇಕು." },
    fine: "₹500 – ₹10,000",
  },
  {
    icon: ParkingCircle,
    en: { title: "No-Parking Zones", desc: "Park only in designated bays. Tow risk." },
    kn: { title: "ನಿಷೇಧಿತ ಪಾರ್ಕಿಂಗ್", desc: "ಗೊತ್ತುಪಡಿಸಿದ ಸ್ಥಳಗಳಲ್ಲಿ ಮಾತ್ರ ಪಾರ್ಕ್ ಮಾಡಿ." },
    fine: "₹500 – ₹1,000",
  },
];

export default function Rules() {
  const { t, lang } = useI18n();
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid items-center gap-0 md:grid-cols-[1.2fr_1fr]">
          <div className="p-6">
            <h1 className="text-2xl font-semibold tracking-tight">{t("rules.title")}</h1>
            <p className={"mt-2 max-w-xl text-sm text-muted-foreground " + (lang === "kn" ? "font-kn" : "")}>
              {t("rules.sub")}
            </p>
          </div>
          <img
            src={rulesImg}
            alt="Traffic rules illustration"
            width={1280}
            height={720}
            loading="lazy"
            className="h-48 w-full object-cover md:h-56"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RULES.map((r) => {
          const c = lang === "kn" ? r.kn : r.en;
          return (
            <Card key={r.en.title} className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[var(--saffron)]/15 p-1.5 text-[var(--saffron)]">
                      <r.icon className="h-4 w-4" />
                    </span>
                    <div className={"text-sm font-semibold " + (lang === "kn" ? "font-kn" : "")}>
                      {c.title}
                    </div>
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {t("rules.fine")}: {r.fine}
                  </Badge>
                </div>
                <p className={"text-xs leading-relaxed text-muted-foreground " + (lang === "kn" ? "font-kn" : "")}>
                  {c.desc}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

