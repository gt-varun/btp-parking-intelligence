import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusBadge, cliStatus } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/common/ClientOnly";
import { MapLegend } from "@/components/map/MapLegend";
import { HotspotCard } from "@/components/map/HotspotCard";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Layers, FileText, Wallet, AlertCircle, MapPin, BookOpen, HelpCircle, Info, ClipboardList, Ticket, BarChart3, LogIn, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/btp-hero.jpg";
import api from "@/lib/api";
import type { Junction } from "@/lib/mockData";
import AdminLiveMap from "@/map/AdminLiveMap";

const ViolationMap = lazy(() =>
  import("@/components/map/ViolationMap").then((m) => ({ default: m.ViolationMap }))
);

// ── Public dashboard (guest) ───────────────────────────────
function PublicDashboard() {
  const [loading, setLoading] = useState(true);
  const [hour, setHour] = useState(11);
  const [layer, setLayer] = useState<"cli" | "count">("cli");
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/junctions").then((r) => setJunctions(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <SectionSkeleton />;

  const kn = lang === "kn";
  const hotspots = [...junctions].sort((a, b) => b.cliScore - a.cliScore).slice(0, 5);
  const totalViolations = junctions.reduce((s, j) => s + (j.violations ?? 0), 0);
  const challansIssued = Math.round(totalViolations * 0.78);
  const finesCollected = challansIssued * 650;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border shadow-card">
        <img src={heroImg} alt="BTP" className="h-52 w-full object-cover md:h-64" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--navy)]/90 via-[var(--navy)]/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
          <div className={`text-[11px] uppercase tracking-[0.2em] text-white/70 ${kn ? "font-kn" : ""}`}>
            {kn ? "ಬೆಂಗಳೂರು ಸಂಚಾರ ಪೊಲೀಸ್" : "Bangalore Traffic Police"}
          </div>
          <h1 className={`mt-1 max-w-md text-2xl font-semibold text-white md:text-3xl ${kn ? "font-kn" : ""}`}>
            {t("home.welcome")}
          </h1>
          <p className={`mt-2 max-w-sm text-sm text-white/80 ${kn ? "font-kn" : ""}`}>{t("home.sub")}</p>
          <div className="mt-5 flex gap-2">
            <Button size="sm" onClick={() => navigate("/auth")} className="gap-1.5 bg-[var(--saffron)] text-[var(--saffron-foreground)] hover:bg-[var(--saffron)]/90">
              <LogIn className="h-3.5 w-3.5" /> Sign in
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/about")} className="border-white/25 bg-white/10 text-white hover:bg-white/20">
              Learn more
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Violations" value={totalViolations.toLocaleString("en-IN")} hint="Jan–May 2024" icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Challans Issued" value={challansIssued.toLocaleString("en-IN")} icon={<Layers className="h-4 w-4" />} />
        <KpiCard label="Fines Collected" value={"₹" + (finesCollected / 1e7).toFixed(2) + " Cr"} icon={<Wallet className="h-4 w-4" />} />
        <KpiCard label="Junctions Tracked" value={junctions.length} icon={<MapPin className="h-4 w-4" />} />
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Live Violation Map · Bengaluru</CardTitle>
            <Tabs value={layer} onValueChange={(v) => setLayer(v as "cli" | "count")} className="h-8">
              <TabsList className="h-8">
                <TabsTrigger value="cli" className="h-6 text-xs">CLI</TabsTrigger>
                <TabsTrigger value="count" className="h-6 text-xs">Count</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="mt-3 flex items-center gap-3 pb-1">
            <span className="text-xs text-muted-foreground w-16">Hour: {hour}:00</span>
            <Slider className="max-w-xs" min={0} max={23} step={1} value={[hour]} onValueChange={([v]) => setHour(v)} />
          </div>
        </CardHeader>
        <CardContent className="relative p-0">
          <div className="h-[400px] w-full">
            <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
              {() => (
                <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
                  <ViolationMap hour={hour} layer={layer} junctions={junctions} />
                </Suspense>
              )}
            </ClientOnly>
          </div>
          <MapLegend layer={layer} />
        </CardContent>
      </Card>

      {/* Hotspots */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Top Hotspots</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {hotspots.map((j) => <HotspotCard key={j.jid || j.id} j={j} />)}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: <BookOpen className="h-5 w-5" />, title: "Rules & Regulations", desc: "Know the parking rules", to: "/rules" },
          { icon: <HelpCircle className="h-5 w-5" />, title: "Platform Guide", desc: "How to use this portal", to: "/guidelines" },
          { icon: <Info className="h-5 w-5" />, title: "About BTP", desc: "Our mission and reach", to: "/about" },
        ].map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className="h-full transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-start gap-3 p-4">
                <span className="mt-0.5 text-[var(--saffron)]">{c.icon}</span>
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.desc}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── User dashboard (citizen) ───────────────────────────────
function UserHome({ email }: { email: string }) {
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/challans").then((r) => setChallans(r.data)).finally(() => setLoading(false));
  }, []);

  const pending = challans.filter((c) => c.status === "pending");
  const totalFines = challans.reduce((s: number, c: any) => s + c.fine, 0);

  if (loading) return <SectionSkeleton />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Challans" value={challans.length} icon={<FileText className="h-4 w-4" />} />
        <KpiCard label="Pending" value={pending.length} accent="critical" icon={<AlertCircle className="h-4 w-4" />} />
        <KpiCard label="Total Fines" value={`₹${totalFines.toLocaleString("en-IN")}`} icon={<Wallet className="h-4 w-4" />} />
        <KpiCard label="Paid" value={challans.filter((c) => c.status === "paid").length} accent="normal" icon={<Sparkles className="h-4 w-4" />} />
      </div>

      {pending.length > 0 && (
        <Card className="border-[var(--critical)]/30 bg-[var(--critical)]/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="font-semibold text-[var(--critical)]">{pending.length} pending challan(s)</div>
              <div className="text-xs text-muted-foreground">Pay or contest before the due date</div>
            </div>
            <Button size="sm" onClick={() => navigate("/my-challans")}>View</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: <FileText className="h-5 w-5" />, title: "My Challans", to: "/my-challans" },
          { icon: <BarChart3 className="h-5 w-5" />, title: "My Analytics", to: "/my-analytics" },
          { icon: <MapPin className="h-5 w-5" />, title: "My Violation Map", to: "/my-map" },
        ].map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className="h-full transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-[var(--saffron)]">{c.icon}</span>
                <div className="font-medium">{c.title}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Admin dashboard ────────────────────────────────────────
function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [junctions, setJunctions] = useState<Junction[]>([]);

  useEffect(() => {
    api.get("/analytics/summary").then((r) => setSummary(r.data));
    api.get("/junctions").then((r) => setJunctions(r.data));
  }, []);

  const hotspots = [...junctions].sort((a, b) => b.cliScore - a.cliScore).slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Officer Console</h1>
        <p className="text-sm text-muted-foreground">City-wide enforcement overview</p>
      </div>

      {summary && (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    <KpiCard label="Total Violations" value={summary.totalViolations.toLocaleString("en-IN")} />
    <KpiCard label="Challans Issued" value={summary.challansIssued.toLocaleString("en-IN")} />
    <KpiCard label="Overall Rejection" value={(summary.overallRejection * 100).toFixed(1) + "%"} accent="critical" />
    <KpiCard label="Model Accuracy" value={(summary.modelAccuracy * 100).toFixed(1) + "%"} accent="normal" />
  </div>
)}

<Card className="overflow-hidden">
  <CardHeader>
    <CardTitle>City-wide Junction Heat Map</CardTitle>
  </CardHeader>

  <CardContent className="p-0">
    <AdminLiveMap />
  </CardContent>
</Card>

<div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: <ClipboardList className="h-5 w-5" />, title: "Patrol Planner", to: "/patrol" },
          { icon: <Ticket className="h-5 w-5" />, title: "Ticket Quality", to: "/tickets" },
          { icon: <BarChart3 className="h-5 w-5" />, title: "Analytics", to: "/analytics" },
        ].map((c) => (
          <Link key={c.to} to={c.to}>
            <Card className="h-full transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-[var(--saffron)]">{c.icon}</span>
                <div className="font-medium">{c.title}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {hotspots.length > 0 && (
        <>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top Hotspots by CLI</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {hotspots.map((j) => <HotspotCard key={j.jid || j.id} j={j} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ── Router ─────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "user") return <UserHome email={user.email} />;
  return <PublicDashboard />;
}
