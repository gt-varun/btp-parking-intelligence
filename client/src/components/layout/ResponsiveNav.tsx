import { NavLink, useLocation } from "react-router-dom";
import { Map, ClipboardList, Ticket, Car, BarChart3, Users, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";

export function ResponsiveNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminItems = [
    { title: t("side.liveMap"), url: "/", icon: Map },
    { title: t("side.patrol"), url: "/patrol", icon: ClipboardList },
    { title: t("side.tickets"), url: "/tickets", icon: Ticket },
    { title: t("side.offenders"), url: "/offenders", icon: Car },
    { title: t("side.analytics"), url: "/analytics", icon: BarChart3 },
    { title: t("side.users"), url: "/users", icon: Users },
  ];

  const isActive = (url: string) => url === "/" ? pathname === "/" : pathname.startsWith(url);

  return (
    <>
      {/* Horizontal Navbar (Large Screens >= 1024px) */}
      <nav className="hidden lg:flex sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-lg no-print">
        <div className="w-full px-6 py-4 flex items-center gap-4">
          <span className="text-sm font-bold text-[var(--saffron)] uppercase tracking-wide whitespace-nowrap">
            {t("side.ops")}
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {adminItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive(item.url)
                    ? "bg-[var(--saffron)] text-white shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button (Small Screens < 1024px) */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--saffron)] text-white rounded-lg shadow-lg no-print"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Vertical Menu (Small Screens < 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 left-0 right-0 bg-gradient-to-b from-slate-900 to-slate-800 z-40 no-print overflow-y-auto">
          <div className="p-4 space-y-2">
            <span className="block text-sm font-bold text-[var(--saffron)] mb-4 uppercase tracking-wide">
              {t("side.ops")}
            </span>
            {adminItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${
                  isActive(item.url)
                    ? "bg-[var(--saffron)] text-white shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
