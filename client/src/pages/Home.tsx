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
  const { t, lang, tx } = useI18n();
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
    <div>
      {/* Hero — full-bleed banner */}
      <section className="relative w-full overflow-hidden border-b">
        <img src={heroImg} alt="Bangalore Traffic Police officer on duty" className="h-[360px] w-full object-cover object-[center_30%] md:h-[480px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-background/40 to-transparent" />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4 md:px-6">
            <h1 className={`max-w-xl text-4xl font-bold leading-[1.05] text-[var(--navy)] dark:text-white md:text-6xl ${kn ? "font-kn" : ""}`}>
              {tx("Ensuring Safety.")}<br />{tx("Enabling Mobility.")}
            </h1>
            <p className={`mt-4 max-w-md text-sm text-muted-foreground md:text-base ${kn ? "font-kn" : ""}`}>
              {tx("Bangalore Traffic Police is committed to creating a safe, disciplined and efficient road environment for everyone.")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate("/auth")} className="gap-1.5 bg-blue-800 text-white hover:bg-blue-900">
                <LogIn className="h-4 w-4" /> {tx("Sign in")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/about")} className="border-2 border-blue-800 bg-white text-blue-800 hover:bg-blue-50 hover:text-blue-800">
                {tx("Learn more")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label={tx("Total Violations")} value={totalViolations.toLocaleString("en-IN")} hint={tx("Jan–May 2024")} icon={<Clock className="h-4 w-4" />} />
        <KpiCard label={tx("Challans Issued")} value={challansIssued.toLocaleString("en-IN")} icon={<Layers className="h-4 w-4" />} />
        <KpiCard label={tx("Fines Collected")} value={"₹" + (finesCollected / 1e7).toFixed(2) + " Cr"} icon={<Wallet className="h-4 w-4" />} />
        <KpiCard label={tx("Junctions Tracked")} value={junctions.length} icon={<MapPin className="h-4 w-4" />} />
      </div>

      {/* Map */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">{tx("Live Violation Map · Bengaluru")}</CardTitle>
            <Tabs value={layer} onValueChange={(v) => setLayer(v as "cli" | "count")} className="h-8">
              <TabsList className="h-8">
                <TabsTrigger value="cli" className="h-6 text-xs">{tx("CLI")}</TabsTrigger>
                <TabsTrigger value="count" className="h-6 text-xs">{tx("Count")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="mt-3 flex items-center gap-3 pb-1">
            <span className="text-xs text-muted-foreground w-16">{tx("Hour:")} {hour}:00</span>
            <Slider className="max-w-xs" min={0} max={23} step={1} value={[hour]} onValueChange={([v]) => setHour(v)} />
          </div>
        </CardHeader>
        <CardContent className="relative isolate p-0">
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
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">{tx("Top Hotspots")}</h2>
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
                  <div className="font-medium">{tx(c.title)}</div>
                  <div className="text-xs text-muted-foreground">{tx(c.desc)}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}

// ── User dashboard (citizen) ───────────────────────────────
function UserHome({ email }: { email: string }) {
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { tx } = useI18n();

  useEffect(() => {
    api.get("/challans").then((r) => setChallans(r.data)).finally(() => setLoading(false));
  }, []);

  const pending = challans.filter((c) => c.status === "pending");
  const totalFines = challans.reduce((s: number, c: any) => s + c.fine, 0);

  if (loading) return <SectionSkeleton />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">{tx("Welcome back")}</h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label={tx("Total Challans")} value={challans.length} icon={<FileText className="h-4 w-4" />} />
        <KpiCard label={tx("Pending")} value={pending.length} accent="critical" icon={<AlertCircle className="h-4 w-4" />} />
        <KpiCard label={tx("Total Fines")} value={`₹${totalFines.toLocaleString("en-IN")}`} icon={<Wallet className="h-4 w-4" />} />
        <KpiCard label={tx("Paid")} value={challans.filter((c) => c.status === "paid").length} accent="normal" icon={<Sparkles className="h-4 w-4" />} />
      </div>

      {pending.length > 0 && (
        <Card className="border-[var(--critical)]/30 bg-[var(--critical)]/5">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="font-semibold text-[var(--critical)]">{pending.length} {tx("pending challan(s)")}</div>
              <div className="text-xs text-muted-foreground">{tx("Pay or contest before the due date")}</div>
            </div>
            <Button size="sm" onClick={() => navigate("/my-challans")}>{tx("View")}</Button>
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
                <div className="font-medium">{tx(c.title)}</div>
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
  const { tx } = useI18n();

  useEffect(() => {
    api.get("/analytics/summary").then((r) => setSummary(r.data));
    api.get("/junctions").then((r) => setJunctions(r.data));
  }, []);

  const hotspots = [...junctions].sort((a, b) => b.cliScore - a.cliScore).slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">{tx("Officer Console")}</h1>
        <p className="text-sm text-muted-foreground">{tx("City-wide enforcement overview")}</p>
      </div>

      {summary && (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    <KpiCard label={tx("Total Violations")} value={summary.totalViolations.toLocaleString("en-IN")} />
    <KpiCard label={tx("Challans Issued")} value={summary.challansIssued.toLocaleString("en-IN")} />
    <KpiCard label={tx("Overall Rejection")} value={(summary.overallRejection * 100).toFixed(1) + "%"} accent="critical" />
    <KpiCard label={tx("Model Accuracy")} value={(summary.modelAccuracy * 100).toFixed(1) + "%"} accent="normal" />
  </div>
)}

<Card className="overflow-hidden">
  <CardHeader>
    <CardTitle>{tx("City-wide Junction Heat Map")}</CardTitle>
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
                <div className="font-medium">{tx(c.title)}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {hotspots.length > 0 && (
        <>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tx("Top Hotspots by CLI")}</h2>
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
