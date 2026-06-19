import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusBadge, cliStatus } from "@/components/common/StatusBadge";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, PieChart, Pie, LineChart, Line } from "recharts";
import { IndianRupee, Percent, TrendingDown, TrendingUp } from "lucide-react";
import api from "@/lib/api";

function fmtINR(n: number) {
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(2) + " Cr";
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(2) + " L";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function Tickets() {
  const [loading, setLoading] = useState(true);
  const [improvement, setImprovement] = useState(20);
  const [selected, setSelected] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [violations, setViolations] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [junctions, setJunctions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/summary"),
      api.get("/analytics/violations"),
      api.get("/analytics/vehicles"),
      api.get("/junctions"),
    ]).then(([s, v, vh, j]) => {
      setSummary(s.data); setViolations(v.data); setVehicles(vh.data); setJunctions(j.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !summary) return <SectionSkeleton />;

  const totalFines = summary.challansIssued * summary.avgChallan;
  const lostRevenue = totalFines * summary.overallRejection;
  const savedRevenue = lostRevenue * (improvement / 100);
  const avgChallan = summary.avgChallan;
  const COLORS = ["var(--critical)", "var(--warning)", "var(--navy)", "var(--normal)", "var(--saffron)", "var(--muted-foreground)"];

  const top10 = [...junctions].sort((a: any, b: any) => b.violations - a.violations).slice(0, 10);

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ticket Quality Monitor</h1>
          <p className="text-sm text-muted-foreground">Rejection rates, revenue recovery and ticket-quality drill-down.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Challans Issued" value={<AnimatedCounter value={summary.challansIssued} />} icon={<IndianRupee className="h-4 w-4" />} />
          <KpiCard label="Overall Rejection" value={<AnimatedCounter value={summary.overallRejection * 100} suffix="%" format={(n) => n.toFixed(1)} />} accent="critical" icon={<TrendingDown className="h-4 w-4" />} />
          <KpiCard label="Avg. Challan" value={`₹${avgChallan.toLocaleString("en-IN")}`} icon={<Percent className="h-4 w-4" />} />
          <KpiCard label="Lost Revenue" value={fmtINR(lostRevenue)} accent="critical" icon={<TrendingUp className="h-4 w-4" />} />
        </div>

        {/* Revenue simulator */}
        <Card className="bg-[var(--navy)] text-[var(--navy-foreground)]">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Revenue Recovery Simulator</div>
                <div className="text-xs text-[var(--navy-foreground)]/60">Drag to simulate rejection rate improvement</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-[var(--saffron)]">{fmtINR(savedRevenue)}</div>
                <div className="text-xs text-[var(--navy-foreground)]/60">recovered at {improvement}% improvement</div>
              </div>
            </div>
            <Slider min={5} max={100} step={5} value={[improvement]} onValueChange={([v]) => setImprovement(v)} />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Violations rejection */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Rejection by Violation Type</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violations} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => (v * 100).toFixed(0) + "%"} />
                  <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip formatter={(v: number) => [(v * 100).toFixed(1) + "%", "Rejection"]} />
                  <Bar dataKey="rejectionRate" radius={[0, 4, 4, 0]}>
                    {violations.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vehicle type */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Rejection by Vehicle Type</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicles}>
                  <XAxis dataKey="type" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v * 100).toFixed(0) + "%"} />
                  <Tooltip formatter={(v: number) => [(v * 100).toFixed(1) + "%"]} />
                  <Bar dataKey="rejectionRate" fill="var(--saffron)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Junction table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Junction Drill-down</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Junction</TableHead>
                  <TableHead className="text-right">Violations</TableHead>
                  <TableHead className="text-right">Rejection %</TableHead>
                  <TableHead className="text-right">CLI</TableHead>
                  <TableHead>Top Violation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10.map((j: any) => (
                  <TableRow key={j.jid} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(j)}>
                    <TableCell className="font-medium">{j.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{j.violations.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right tabular-nums">{(j.rejectionRate * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right tabular-nums">{j.cliScore}</TableCell>
                    <TableCell><StatusBadge status={cliStatus(j.cliScore)}>{j.topViolation}</StatusBadge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selected && (
        <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{selected.name}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Violations", selected.violations.toLocaleString("en-IN")],
                  ["CLI Score", selected.cliScore],
                  ["Rejection Rate", (selected.rejectionRate * 100).toFixed(1) + "%"],
                  ["Enforcement", selected.enforcement],
                  ["Top Violation", selected.topViolation],
                  ["Peak Hour", selected.peakHour + ":00"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border p-2">
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="font-medium">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
