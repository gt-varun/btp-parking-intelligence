import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut, Languages } from "lucide-react";
import { Emblem } from "./Emblem";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function TopHeader() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { lang, setLang, t, tx } = useI18n();
  const navigate = useNavigate();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const onLogout = () => { logout(); navigate("/auth"); };

  return (
    <header className="no-print sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-[var(--navy)] px-3 text-[var(--navy-foreground)] shadow-sm md:px-5">
      <SidebarTrigger className="text-[var(--navy-foreground)] hover:bg-white/10" />

      <div className="flex items-center gap-3">
        <span className="text-[var(--saffron)]">
          <Emblem className="h-9 w-9" />
        </span>
        <div className="leading-tight">
          <div className="font-kn text-[11px] tracking-wide text-white/80">ಬೆಂಗಳೂರು ಸಂಚಾರ ಪೊಲೀಸ್</div>
          <div className="text-sm font-semibold md:text-base">
            BTP <span className="text-[var(--saffron)]">·</span>{" "}
            {user?.role === "admin" ? tx("Parking Intelligence") : tx("Citizen Portal")}
          </div>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right text-xs leading-tight text-white/80 sm:block">
          <div className="font-medium text-white tabular-nums">
            {now ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
          </div>
          <div>{user?.email ?? ""}</div>
        </div>

        <button
          onClick={() => setLang(lang === "en" ? "kn" : "en")}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-2 py-1 text-xs text-white/90 transition-colors hover:bg-white/10"
        >
          <Languages className="h-3.5 w-3.5" />
          <span className={lang === "en" ? "font-kn" : ""}>{t("lang.toggle")}</span>
        </button>

        <button onClick={toggle} className="rounded-md p-2 text-white/90 transition-colors hover:bg-white/10">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user ? (
          <Button size="sm" variant="outline" onClick={onLogout} className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
            <LogOut className="mr-1.5 h-3.5 w-3.5" /> {tx("Sign out")}
          </Button>
        ) : (
          <Button size="sm" onClick={() => navigate("/auth")} className="bg-[var(--saffron)] text-[var(--saffron-foreground)] hover:bg-[var(--saffron)]/90">
            {tx("Sign in")}
          </Button>
        )}
      </div>
    </header>
  );
}
