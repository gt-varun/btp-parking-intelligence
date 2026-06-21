import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, Languages, Phone } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

// Official-site-style landing chrome: white header + navy nav bar.
export function SiteHeader() {
  const { theme, toggle } = useTheme();
  const { lang, setLang, t, tx } = useI18n();
  const navigate = useNavigate();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const navItems = [
    { label: t("nav.home"),        to: "/" },
    { label: t("nav.about"),       to: "/about" },
    { label: t("nav.rules"),       to: "/rules" },
    { label: t("nav.guidelines"),  to: "/guidelines" },
  ];

  const navCls = ({ isActive }: { isActive: boolean }) =>
    "relative px-1 py-3 text-sm font-medium tracking-wide transition-colors " +
    (isActive ? "text-white" : "text-white/75 hover:text-white") +
    (isActive ? " after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--saffron)]" : "");

  return (
    <header className="no-print sticky top-0 z-40">
      {/* Top white bar */}
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-2.5 md:px-6">
          {/* Brand */}
          <button onClick={() => navigate("/")} className="flex items-center gap-3 text-left">
            <img src={logo} alt="Bangalore Traffic Police" className="h-11 w-11 shrink-0 object-contain" />
            <div className="leading-tight">
              <div className={`text-base font-bold uppercase tracking-wide text-[var(--navy)] md:text-lg ${lang === "kn" ? "font-kn" : ""}`}>
                {tx("Bangalore Traffic Police")}
              </div>
              <div className={`text-[11px] text-muted-foreground ${lang === "kn" ? "font-kn" : ""}`}>
                {tx("Safe Roads. Safe Bengaluru.")}
              </div>
            </div>
          </button>

          {/* Controls */}
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            {/* Time */}
            <div className="hidden text-right text-xs leading-tight sm:block">
              <div className="font-semibold tabular-nums text-foreground">
                {now ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—"}
              </div>
              <div className="text-muted-foreground">
                {now ? now.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : ""}
              </div>
            </div>

            {/* Language */}
            <button
              onClick={() => setLang(lang === "en" ? "kn" : "en")}
              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
            >
              <Languages className="h-3.5 w-3.5" />
              <span className={lang === "en" ? "font-kn" : ""}>{t("lang.toggle")}</span>
            </button>

            {/* Theme */}
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="rounded-md border p-2 text-foreground transition-colors hover:bg-muted"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Sign in */}
            <Button
              size="sm"
              onClick={() => navigate("/auth")}
              className="bg-[var(--saffron)] text-[var(--saffron-foreground)] hover:bg-[var(--saffron)]/90"
            >
              {tx("Sign in")}
            </Button>

            {/* Emergency dial */}
            <a href="tel:112" className="flex items-center gap-2 pl-1 md:pl-2">
              <Phone className="h-5 w-5 text-[var(--navy)]" />
              <div className="hidden leading-tight sm:block">
                <div className={`text-[10px] uppercase tracking-wide text-muted-foreground ${lang === "kn" ? "font-kn" : ""}`}>
                  {tx("FOR EMERGENCIES")}
                </div>
                <div className="text-sm font-bold text-[var(--navy)]">
                  <span className={lang === "kn" ? "font-kn" : ""}>{tx("DIAL")}</span>{" "}
                  <span className="text-[var(--critical)]">112</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Navy nav bar */}
      <nav className="bg-[var(--navy)] text-[var(--navy-foreground)] shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 md:px-6">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={navCls}>
              <span className={lang === "kn" ? "font-kn" : ""}>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
