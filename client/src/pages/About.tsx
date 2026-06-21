import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/btp-hero.jpg";
import teamImg from "@/assets/btp-team.jpg";

const FACTS = [
  { en: "50+ traffic police stations across Bengaluru", kn: "ಬೆಂಗಳೂರಿನಲ್ಲಿ 50+ ಸಂಚಾರ ಠಾಣೆಗಳು" },
  { en: "5,000+ officers on duty every day",             kn: "ಪ್ರತಿದಿನ 5,000+ ಅಧಿಕಾರಿಗಳು ಕರ್ತವ್ಯದಲ್ಲಿ" },
  { en: "400+ signalised junctions managed",            kn: "400+ ಸಿಗ್ನಲ್ ಜಂಕ್ಷನ್‌ಗಳ ನಿರ್ವಹಣೆ" },
  { en: "24×7 traffic helpline: 103",                   kn: "24×7 ಸಂಚಾರ ಸಹಾಯವಾಣಿ: 103" },
];

export default function About() {
  const { t, lang } = useI18n();
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="relative">
          <img src={heroImg} alt="Bangalore Traffic Police officer at duty" width={1536} height={768} className="h-56 w-full object-cover object-[center_25%] md:h-72" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--navy)]/90 via-[var(--navy)]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5 text-white">
            <div className="font-kn text-xs text-white/80">ಬೆಂಗಳೂರು ಸಂಚಾರ ಪೊಲೀಸ್</div>
            <h1 className="text-2xl font-semibold md:text-3xl">{t("about.title")}</h1>
            <p className={"mt-1 max-w-xl text-sm text-white/90 " + (lang === "kn" ? "font-kn" : "")}>{t("app.tagline")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-5 text-sm leading-relaxed">
            <p className={lang === "kn" ? "font-kn" : ""}>{t("about.p1")}</p>
            <p className={lang === "kn" ? "font-kn" : ""}>{t("about.p2")}</p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <img src={teamImg} alt="BTP officers in formation" width={1280} height={800} loading="lazy" className="h-full max-h-72 w-full object-cover" />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {FACTS.map((f) => (
          <Card key={f.en}>
            <CardContent className="p-4">
              <div className={"text-sm font-medium " + (lang === "kn" ? "font-kn" : "")}>{lang === "kn" ? f.kn : f.en}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
