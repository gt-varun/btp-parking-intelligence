import { useEffect, useState, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { ClientOnly } from "@/components/common/ClientOnly";
import { MapLegend } from "@/components/map/MapLegend";
import { Slider } from "@/components/ui/slider";
import { PoiTag } from "@/components/common/PoiTag";
import { AlertTriangle, Shield, Map, Calendar } from "lucide-react";
import api from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const ViolationMap = lazy(() =>
  import("@/components/map/ViolationMap").then((m) => ({ default: m.ViolationMap }))
);

const SEVERITY_COLOR: Record<string, string> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

export default function Patrol() {
  const { tx } = useI18n();
  const [loading, setLoading] = useState(true);
  const [priority, setPriority] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [gaps, setGaps] = useState<any[]>([]);
  const [tab, setTab] = useState<"table" | "map" | "forecast" | "gaps">("table");
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => {
    Promise.all([
      api.get("/patrol/priority"),
      api.get("/patrol/forecast"),
      api.get("/patrol/gaps"),
    ]).then(([p, f, g]) => {
      setPriority(p.data); setForecast(f.data); setGaps(g.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <SectionSkeleton />;

  const highCount = priority.filter((j) => j.cliScore >= 75).length;
  const totalUnits = priority.reduce((s: number, j: any) => s + j.recommendedUnits, 0);

  // Flatten junctions for map
  const allJunctions = priority.map((j: any) => ({
    ...j, jid: j.jid, id: j.jid,
    lat: j.lat, lng: j.lng, name: j.name,
    violations: j.violations, cliScore: j.cliScore,
    hourlyPattern: j.hourlyPattern,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{tx("Patrol Planner")}</h1>
        <p className="text-sm text-muted-foreground">{tx("Priority junctions, deployment recommendations and 7-day forecast.")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label={tx("Priority Junctions")} value={priority.length} icon={<Map className="h-4 w-4" />} />
        <KpiCard label={tx("Critical (CLI ≥ 75)")} value={highCount} accent="critical" icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label={tx("Units Recommended")} value={totalUnits} icon={<Shield className="h-4 w-4" />} />
        <KpiCard label={tx("Forecast Days")} value={forecast.length} icon={<Calendar className="h-4 w-4" />} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="table">{tx("Priority Table")}</TabsTrigger>
          <TabsTrigger value="map">{tx("Heat Map")}</TabsTrigger>
          <TabsTrigger value="forecast">{tx("7-Day Forecast")}</TabsTrigger>
          <TabsTrigger value="gaps">{tx("Enforcement Gaps")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "table" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tx("Rank")}</TableHead>
                  <TableHead>{tx("Junction")}</TableHead>
                  <TableHead className="text-right">{tx("CLI")}</TableHead>
                  <TableHead className="text-right">{tx("Predicted 24h")}</TableHead>
                  <TableHead className="text-right">{tx("Units")}</TableHead>
                  <TableHead>{tx("Peak")}</TableHead>
                  <TableHead>{tx("POI Tags")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priority.map((j: any) => (
                  <TableRow key={j.jid}>
                    <TableCell className="font-mono text-muted-foreground">#{j.rank}</TableCell>
                    <TableCell className="font-medium">{tx(j.name)}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{j.cliScore}</TableCell>
                    <TableCell className="text-right tabular-nums">{j.predicted24h}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Badge variant={j.recommendedUnits >= 3 ? "destructive" : "secondary"}>{j.recommendedUnits}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{j.peakHour}:00</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {j.poiTags?.map((tag: string) => <PoiTag key={tag} tag={tag as any} />)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === "map" && (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-3">
            <CardTitle className="text-base">{tx("Junction Heat Map")}</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16">{tx("Hour:")} {hour}:00</span>
              <Slider className="w-40 sm:max-w-xs" min={0} max={23} step={1} value={[hour]} onValueChange={([v]) => setHour(v)} />
            </div>
          </CardHeader>
          <CardContent className="relative isolate p-0">
            <div className="h-[500px] w-full">
              <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
                {() => (
                  <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
                    <ViolationMap hour={hour} layer="cli" junctions={allJunctions} />
                  </Suspense>
                )}
              </ClientOnly>
            </div>
            <MapLegend layer="cli" />
          </CardContent>
        </Card>
      )}

      {tab === "forecast" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {forecast.map((day: any) => (
            <Card key={day.day}>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-semibold">{tx(day.day)} · {day.date}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {day.top.map((t: any) => (
                  <div key={t.junction} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={SEVERITY_COLOR[t.severity] as any} className="h-4 px-1 text-[9px]">{tx(t.severity)}</Badge>
                      <span className="font-medium">{tx(t.junction)}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">{t.predicted}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "gaps" && (
        <div className="space-y-3">
          {gaps.map((g: any) => (
            <Card key={g.junction} className="border-[var(--critical)]/30">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="flex-1 space-y-1">
                  <div className="font-semibold">{tx(g.junction)}</div>
                  <div className="text-xs text-muted-foreground">{tx(g.note)}</div>
                  <div className="flex flex-wrap gap-1">
                    {g.poiTags.map((t: string) => <PoiTag key={t} tag={t as any} />)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-2">
                  <div className="rounded-lg bg-[var(--critical)]/10 p-2">
                    <div className="text-lg font-bold text-[var(--critical)]">{g.cliWindow}</div>
                    <div className="text-[10px] text-muted-foreground">{tx("CLI Window")}</div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <div className="text-lg font-bold">{g.enforcementLevel}</div>
                    <div className="text-[10px] text-muted-foreground">{tx("Enforcement")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
