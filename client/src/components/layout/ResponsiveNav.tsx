import { NavLink, useLocation } from "react-router-dom";
import { Map, ClipboardList, Ticket, Car, BarChart3, Users, Home, FileText, PieChart, MapPin, BookOpen, Info, HelpCircle, Menu, X } from "lucide-react";
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

  const userItems = [
    { title: t("nav.home"), url: "/", icon: Home },
    { title: t("side.myChallans"), url: "/my-challans", icon: FileText },
    { title: t("side.myAnalytics"), url: "/my-analytics", icon: PieChart },
    { title: t("side.myMap"), url: "/my-map", icon: MapPin },
  ];

  const guestItems = [
    { title: t("nav.home"), url: "/", icon: Home },
    { title: t("side.myChallans"), url: "/my-challans", icon: FileText },
    { title: t("side.myMap"), url: "/my-map", icon: MapPin },
  ];

  const infoItems = [
    { title: t("nav.about"), url: "/about", icon: Info },
    { title: t("nav.rules"), url: "/rules", icon: BookOpen },
    { title: t("nav.guidelines"), url: "/guidelines", icon: HelpCircle },
  ];

  const items = user?.role === "admin" ? adminItems : user ? userItems : guestItems;
  const allItems = [...items, ...infoItems];

  const isActive = (url: string) => url === "/" ? pathname === "/" : pathname.startsWith(url);
  const linkClass = (url: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
      isActive(url)
        ? "bg-[var(--saffron)] text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <>
      {/* Horizontal Navbar (Large Screens) */}
      {user?.role === "admin" && (
        <nav className="hidden lg:block sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm no-print">
          <div className="max-w-full px-4 py-3">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-[var(--saffron)] mr-4">{t("side.ops")}</span>
              <div className="flex flex-wrap gap-1">
                {items.map((item) => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    className={linkClass(item.url)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Menu Button & Vertical Menu (Small Screens) */}
      {user?.role === "admin" && (
        <div className="lg:hidden fixed top-4 left-4 z-50 no-print">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-[var(--saffron)] text-white rounded-lg shadow-lg"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      )}

      {/* Mobile Vertical Menu */}
      {user?.role === "admin" && mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white border-r border-gray-200 z-40 no-print overflow-y-auto">
          <div className="p-4 space-y-2">
            <span className="block text-sm font-semibold text-[var(--saffron)] mb-4">{t("side.ops")}</span>
            {items.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className={linkClass(item.url)}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
            <hr className="my-4" />
            <span className="block text-sm font-semibold text-[var(--saffron)] mb-4">{t("side.info")}</span>
            {infoItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className={linkClass(item.url)}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
