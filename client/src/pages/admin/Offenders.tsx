import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/common/KpiCard";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { AlertTriangle, Users, Wallet, Search, Gauge } from "lucide-react";
import api from "@/lib/api";

const TIER_VARIANT: Record<string, "destructive" | "secondary" | "outline"> = {
  "Court-Referral": "destructive",
  Escalate: "secondary",
  Warning: "outline",
  Watch: "outline",
};

export default function Offenders() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"ml" | "demo">("ml");

  // Real model output: ml/model_offenders.py (KMeans risk tiering, 298k-record dataset)
  const [mlData, setMlData] = useState<any>(null);
  const [tierFilter, setTierFilter] = useState<string | null>(null);

  // Small demo-user collection (the handful of seeded citizen accounts)
  const [demoOffenders, setDemoOffenders] = useState<any[]>([]);

  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/admin/offenders-ml", { params: { limit: 300 } }),
      api.get("/admin/offenders"),
    ])
      .then(([ml, demo]) => {
        setMlData(ml.data);
        setDemoOffenders(demo.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SectionSkeleton />;

  const tierCounts = mlData?.tierCounts ?? {};
  const totalRepeat = mlData?.totalRepeatOffenders ?? 0;
  const mlOffenders = (mlData?.offenders ?? []).filter(
    (o: any) => (!tierFilter || o.tier === tierFilter) && (!query || o.vehicleMasked.toLowerCase().includes(query.toLowerCase()))
  );

  const demoFiltered = demoOffenders.filter((o) => !query || o._id.toLowerCase().includes(query.toLowerCase()));
  const demoTotalFines = demoOffenders.reduce((s, o) => s + o.totalFines, 0);
  const demoCritical = demoOffenders.filter((o) => o.violations >= 5).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Repeat Offender Escalation Engine</h1>
          <p className="text-sm text-muted-foreground">
            {view === "ml"
              ? "KMeans risk tiering across all 298,450 records — vehicles scored on frequency, confirmed-violation rate, junction spread and recency."
              : "Citizens with 2+ violations in the demo account challan log."}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
          <Button size="sm" variant={view === "ml" ? "default" : "ghost"} onClick={() => setView("ml")}>
            Dataset-wide (model)
          </Button>
          <Button size="sm" variant={view === "demo" ? "default" : "ghost"} onClick={() => setView("demo")}>
            Demo accounts
          </Button>
        </div>
      </div>

      {view === "ml" ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="Total Repeat Offenders" value={totalRepeat.toLocaleString("en-IN")} icon={<Users className="h-4 w-4" />} />
            <KpiCard
              label="Court-Referral Tier"
              value={(tierCounts["Court-Referral"] ?? 0).toLocaleString("en-IN")}
              accent="critical"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <KpiCard label="Escalate Tier" value={(tierCounts["Escalate"] ?? 0).toLocaleString("en-IN")} icon={<Gauge className="h-4 w-4" />} />
            <KpiCard label="Watch + Warning" value={((tierCounts["Watch"] ?? 0) + (tierCounts["Warning"] ?? 0)).toLocaleString("en-IN")} />
          </div>

          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center gap-3 pb-2">
              <CardTitle className="text-base">Top Scored Vehicles</CardTitle>
              <div className="flex flex-wrap gap-1.5">
                {["Court-Referral", "Escalate", "Warning", "Watch"].map((t) => (
                  <Badge
                    key={t}
                    variant={tierFilter === t ? TIER_VARIANT[t] : "outline"}
                    className="cursor-pointer"
                    onClick={() => setTierFilter(tierFilter === t ? null : t)}
                  >
                    {t} ({tierCounts[t] ?? 0})
                  </Badge>
                ))}
              </div>
              <div className="relative ml-auto w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search vehicle id…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle (masked)</TableHead>
                    <TableHead className="text-right">Violations</TableHead>
                    <TableHead className="text-right">Confirmed</TableHead>
                    <TableHead className="text-right">Junction Spread</TableHead>
                    <TableHead className="text-right">Days Since Last Seen</TableHead>
                    <TableHead className="text-right">Escalation Score</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mlOffenders.slice(0, 100).map((o: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{o.vehicleMasked}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{o.violations}</TableCell>
                      <TableCell className="text-right tabular-nums">{o.confirmedViolations}</TableCell>
                      <TableCell className="text-right tabular-nums">{o.junctionSpread}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{o.daysSinceLastSeen}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">{o.escalationScore.toFixed(1)}</TableCell>
                      <TableCell><Badge variant={TIER_VARIANT[o.tier]}>{o.tier}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {mlOffenders.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No results found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="Total Offenders" value={demoOffenders.length} icon={<Users className="h-4 w-4" />} />
            <KpiCard label="Critical (5+)" value={demoCritical} accent="critical" icon={<AlertTriangle className="h-4 w-4" />} />
            <KpiCard label="Total Fines Due" value={`₹${demoTotalFines.toLocaleString("en-IN")}`} icon={<Wallet className="h-4 w-4" />} />
            <KpiCard
              label="Avg Violations"
              value={(demoOffenders.reduce((s, o) => s + o.violations, 0) / (demoOffenders.length || 1)).toFixed(1)}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <CardTitle className="text-base">Offender List</CardTitle>
              <div className="relative ml-auto w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Violations</TableHead>
                    <TableHead className="text-right">Pending</TableHead>
                    <TableHead className="text-right">Total Fines</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Hotspot Junctions</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demoFiltered.map((o) => {
                    const risk = o.violations >= 5 ? "critical" : o.violations >= 3 ? "warning" : "normal";
                    return (
                      <TableRow key={o._id}>
                        <TableCell className="font-medium">{o._id}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">{o.violations}</TableCell>
                        <TableCell className="text-right tabular-nums text-[var(--critical)]">{o.pendingCount}</TableCell>
                        <TableCell className="text-right tabular-nums">₹{o.totalFines.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">{o.lastSeen}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {o.junctions.slice(0, 2).map((j: string) => (
                              <Badge key={j} variant="outline" className="text-[10px]">{j}</Badge>
                            ))}
                            {o.junctions.length > 2 && (
                              <Badge variant="outline" className="text-[10px]">+{o.junctions.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={risk === "critical" ? "destructive" : risk === "warning" ? "secondary" : "outline"}>
                            {risk}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {demoFiltered.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No results found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
