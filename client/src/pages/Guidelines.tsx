
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";



const CITIZEN: { en: string; kn: string }[] = [
  { en: "Sign in with your registered email to view all challans linked to you.", kn: "ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್‌ನಿಂದ ಲಾಗಿನ್ ಆಗಿ ಚಲನ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ." },
  { en: "Open ‘My Challans’ to see status — pending, paid or disputed.", kn: "'My Challans' ತೆರೆಯಿರಿ — ಬಾಕಿ, ಪಾವತಿಸಿದ ಅಥವಾ ವಿವಾದಿತ ಸ್ಥಿತಿ ನೋಡಿ." },
  { en: "Pay pending challans online; status updates within minutes.", kn: "ಬಾಕಿ ಚಲನ್‌ಗಳನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪಾವತಿಸಿ; ಸ್ಥಿತಿ ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ನವೀಕರಿಸಲಾಗುತ್ತದೆ." },
  { en: "Use ‘My Map’ to view violations recorded near you and avoid hotspots.", kn: "'My Map' ಬಳಸಿ ಹತ್ತಿರದ ಉಲ್ಲಂಘನೆಗಳನ್ನು ನೋಡಿ ಮತ್ತು ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳಿಂದ ದೂರವಿರಿ." },
  { en: "Read the Rules page before raising a dispute.", kn: "ವಿವಾದ ಎತ್ತುವ ಮೊದಲು ನಿಯಮಗಳ ಪುಟವನ್ನು ಓದಿ." },
  { en: "Switch between English and ಕನ್ನಡ from the top-right toggle.", kn: "ಮೇಲಿನ ಬಲ ಮೂಲೆಯಿಂದ English ಮತ್ತು ಕನ್ನಡ ನಡುವೆ ಬದಲಾಯಿಸಿ." },
];

const ADMIN: { en: string; kn: string }[] = [
  { en: "Use admin email to sign in (admin@test.btp.in) and access operations.", kn: "ಆಡಳಿತ ಇಮೇಲ್ (admin@test.btp.in) ನಿಂದ ಲಾಗಿನ್ ಆಗಿ ಆಪರೇಷನ್ಸ್ ತಲುಪಿ." },
  { en: "Live Map shows CLI-coded junctions; scrub the time slider to study patterns.", kn: "ಲೈವ್ ಮ್ಯಾಪ್ CLI ಜಂಕ್ಷನ್‌ಗಳನ್ನು ತೋರಿಸುತ್ತದೆ; ಸಮಯದ ಸ್ಲೈಡರ್ ಬಳಸಿ ಮಾದರಿಗಳನ್ನು ಅಧ್ಯಯನ ಮಾಡಿ." },
  { en: "Patrol Planner: allocate officers to top hotspots for the next shift.", kn: "ಗಸ್ತು ಯೋಜಕ: ಮುಂದಿನ ಪಾಳಿಗೆ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳಿಗೆ ಅಧಿಕಾರಿಗಳನ್ನು ನಿಯೋಜಿಸಿ." },
  { en: "Ticket Quality flags challans with missing evidence — review and resolve.", kn: "ಟಿಕೆಟ್ ಗುಣಮಟ್ಟ ಸಾಕ್ಷ್ಯ ಇಲ್ಲದ ಚಲನ್‌ಗಳನ್ನು ಗುರುತಿಸುತ್ತದೆ — ಪರಿಶೀಲಿಸಿ ಬಗೆಹರಿಸಿ." },
  { en: "Use Analytics for weekly trends; export reports for daily briefings.", kn: "ವಾರದ ಪ್ರವೃತ್ತಿಗಳಿಗೆ ವಿಶ್ಲೇಷಣೆ ಬಳಸಿ; ದೈನಿಕ ಬ್ರೀಫಿಂಗ್‌ಗಾಗಿ ರಫ್ತು ಮಾಡಿ." },
  { en: "User Management is for adding officers — keep PII off shared screens.", kn: "ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ ಅಧಿಕಾರಿಗಳನ್ನು ಸೇರಿಸಲು — PII ಹಂಚಿಕೊಂಡ ಪರದೆಗಳ ಮೇಲೆ ತೋರಿಸಬೇಡಿ." },
];

function List({ items, kn }: { items: { en: string; kn: string }[]; kn: boolean }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.en} className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--saffron)]" />
          <span className={"text-sm leading-relaxed " + (kn ? "font-kn" : "")}>
            {kn ? it.kn : it.en}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Guidelines() {
  const { t, lang, tx } = useI18n();
  const kn = lang === "kn";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("guide.title")}</h1>
        <p className={"mt-1 text-sm text-muted-foreground " + (kn ? "font-kn" : "")}>
          {tx("Step-by-step guidance for citizens and administrators using the BTP portal.")}
        </p>
      </div>
      <Tabs defaultValue="citizens">
        <TabsList>
          <TabsTrigger value="citizens" className={kn ? "font-kn" : ""}>
            {t("guide.citizens")}
          </TabsTrigger>
          <TabsTrigger value="admins" className={kn ? "font-kn" : ""}>
            {t("guide.admins")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="citizens">
          <Card>
            <CardContent className="p-5">
              <List items={CITIZEN} kn={kn} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admins">
          <Card>
            <CardContent className="p-5">
              <List items={ADMIN} kn={kn} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

