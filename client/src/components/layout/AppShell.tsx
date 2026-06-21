import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "./AppSidebar";
import { TopHeader } from "./TopHeader";
import { SiteHeader } from "./SiteHeader";
import { ResponsiveNav } from "./ResponsiveNav";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/lib/i18n";

export function AppShell() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { lang } = useI18n();
  const isAdmin = user?.role === "admin";

  // Public chrome — keep the same horizontal navbar (SiteHeader) on every
  // public page (Home, About BTP, Rules & Regulations, Platform Guide) for
  // guests, instead of switching to the vertical sidebar + navy TopHeader.
  const publicPaths = ["/", "/about", "/rules", "/guidelines"];
  const isLanding = !user && publicPaths.includes(pathname);
  if (isLanding) {
    const isHome = pathname === "/";
    return (
      <div className="min-h-screen w-full bg-background">
        <SiteHeader />
        <main className={lang === "kn" ? "font-kn" : ""}>
          {isHome ? (
            <Outlet />
          ) : (
            <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
              <Outlet />
            </div>
          )}
        </main>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <>
      {isAdmin && <ResponsiveNav />}
      <SidebarProvider>
        {!isAdmin && <AppSidebar />}
        <SidebarInset className="min-h-screen w-full bg-background">
          <TopHeader />
          <main className={"flex-1 p-4 md:p-6" + (lang === "kn" ? " font-kn" : "")}>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <Toaster position="top-right" />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
