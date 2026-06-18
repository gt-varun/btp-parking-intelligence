import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, AdminRoute } from "@/router/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";

// Public pages
const Home        = lazy(() => import("@/pages/Home"));
const AuthPage    = lazy(() => import("@/pages/Auth"));
const About       = lazy(() => import("@/pages/About"));
const Rules       = lazy(() => import("@/pages/Rules"));
const Guidelines  = lazy(() => import("@/pages/Guidelines"));

// Citizen pages
const MyChallans  = lazy(() => import("@/pages/user/MyChallans"));
const MyAnalytics = lazy(() => import("@/pages/user/MyAnalytics"));
const MyMap       = lazy(() => import("@/pages/user/MyMap"));

// Admin pages
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminTickets   = lazy(() => import("@/pages/admin/Tickets"));
const AdminOffenders = lazy(() => import("@/pages/admin/Offenders"));
const AdminPatrol    = lazy(() => import("@/pages/admin/Patrol"));
const AdminUsers     = lazy(() => import("@/pages/admin/Users"));

const Fallback = () => <SectionSkeleton />;

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* Auth page — no shell */}
        <Route path="/auth" element={<AuthPage />} />

        {/* All other pages share the app shell */}
        <Route element={<AppShell />}>
          {/* Public */}
          <Route path="/"            element={<Home />} />
          <Route path="/about"       element={<About />} />
          <Route path="/rules"       element={<Rules />} />
          <Route path="/guidelines"  element={<Guidelines />} />

          {/* Citizen (requires login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-challans"  element={<MyChallans />} />
            <Route path="/my-analytics" element={<MyAnalytics />} />
            <Route path="/my-map"       element={<MyMap />} />
          </Route>

          {/* Admin (requires admin role) */}
          <Route element={<AdminRoute />}>
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/tickets"   element={<AdminTickets />} />
            <Route path="/offenders" element={<AdminOffenders />} />
            <Route path="/patrol"    element={<AdminPatrol />} />
            <Route path="/users"     element={<AdminUsers />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
