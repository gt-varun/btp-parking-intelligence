import { NavLink, useLocation } from "react-router-dom";
import { Map, ClipboardList, Ticket, Car, BarChart3, Users, Home, FileText, PieChart, MapPin, BookOpen, Info, HelpCircle } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";

export function AppSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();

  const adminItems = [
    { title: t("side.liveMap"),  url: "/",          icon: Map          },
    { title: t("side.patrol"),   url: "/patrol",    icon: ClipboardList },
    { title: t("side.tickets"),  url: "/tickets",   icon: Ticket        },
    { title: t("side.offenders"),url: "/offenders", icon: Car           },
    { title: t("side.analytics"),url: "/analytics", icon: BarChart3     },
    { title: t("side.users"),    url: "/users",     icon: Users         },
  ];
  const userItems = [
    { title: t("nav.home"),          url: "/",            icon: Home     },
    { title: t("side.myChallans"),   url: "/my-challans", icon: FileText },
    { title: t("side.myAnalytics"),  url: "/my-analytics",icon: PieChart },
    { title: t("side.myMap"),        url: "/my-map",      icon: MapPin   },
  ];
  const guestItems = [
    { title: t("nav.home"),        url: "/",            icon: Home     },
    { title: t("side.myChallans"), url: "/my-challans", icon: FileText },
    { title: t("side.myMap"),      url: "/my-map",      icon: MapPin   },
  ];

  const items   = user?.role === "admin" ? adminItems : user ? userItems : guestItems;
  const label   = user?.role === "admin" ? t("side.ops") : user ? t("side.account") : "Browse";

  const infoItems = [
    { title: t("nav.about"),      url: "/about",      icon: Info      },
    { title: t("nav.rules"),      url: "/rules",      icon: BookOpen  },
    { title: t("nav.guidelines"), url: "/guidelines", icon: HelpCircle},
  ];

  const linkCls = (url: string) => {
    const active = url === "/" ? pathname === "/" : pathname.startsWith(url);
    return "flex items-center gap-2 " + (active ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5");
  };

  const isAdmin = user?.role === "admin";

  return (
    <Sidebar collapsible="icon" className={`no-print ${isAdmin ? "hidden lg:flex" : ""}`}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[var(--saffron)]/90">{label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)}>
                    <NavLink to={item.url} className={linkCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[var(--saffron)]/90">{t("side.info")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {infoItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <NavLink to={item.url} className={linkCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-[10px] text-white/50">
        <div className="px-2 pb-2">
          {user?.role === "admin" ? t("side.adminConsole") : t("side.citizenPortal")} · v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
