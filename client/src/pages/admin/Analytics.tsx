import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { StatusBadge, cliStatus } from "@/components/common/StatusBadge";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceArea, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/api";

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] uppercase tracking-wide text-[var(--navy-foreground)]/60">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-[11px] tabular-nums text-[var(--navy-foreground)]/50">{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [hourly, setHourly] = useState<any[]>([]);
  const [weekday, setWeekday] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [topJunctions, setTopJunctions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [modelCards, setModelCards] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/summary"),
      api.get("/analytics/monthly"),
      api.get("/analytics/hourly"),
      api.get("/analytics/weekday"),
      api.get("/analytics/violations"),
      api.get("/analytics/top-junctions"),
      api.get("/analytics/events"),
      api.get("/analytics/models"),
    ]).then(([s, m, h, w, v, j, e, mc]) => {
      setSummary(s.data); setMonthly(m.data); setHourly(h.data);
      setWeekday(w.data); setViolations(v.data); setTopJunctions(j.data); setEvents(e.data);
      setModelCards(mc.data?.cards ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !summary) return <SectionSkeleton />;

  const COLORS = ["var(--critical)", "var(--warning)", "var(--saffron)", "var(--navy)", "var(--normal)", "var(--muted-foreground)"];
  const pieData = violations.map((v: any) => ({ name: v.type, value: v.count }));

  const eventMonths = new Set(events.map((e: any) => e.month));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics & Reports</h1>
        <p className="text-sm text-muted-foreground">Patterns across time, geography and violation type.</p>
      </div>

      <Card className="bg-[var(--navy)] text-[var(--navy-foreground)] shadow-card">
        <CardContent className="grid gap-4 p-4 md:grid-cols-4">
          <Metric label="Total Records" value={summary.totalViolations.toLocaleString("en-IN")} />
          <Metric label="Junctions Tracked" value={summary.junctionsTracked} />
          <Metric label="Date Range" value={summary.dateRange} />
          <Metric
            label="Model Accuracy"
            value={summary.modelAccuracy != null ? (summary.modelAccuracy * 100).toFixed(1) + "%" : "—"}
            sub={summary.modelAUC != null ? `AUC ${summary.modelAUC.toFixed(3)}` : undefined}
          />
        </CardContent>
      </Card>
      {modelCards.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Model Validation</CardTitle>
            <p className="text-xs text-muted-foreground">
              How every model in this dashboard was validated — metrics reported by the models themselves, not hand-typed.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {modelCards.map((c: any) => (
              <div key={c.key} className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold">{c.feature}</span>
                  <span className="shrink-0 rounded-full bg-[var(--navy)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--navy)] dark:bg-[var(--navy-foreground)]/10 dark:text-[var(--navy-foreground)]">
                    {c.learning}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{c.model}</div>
                <div className="flex flex-wrap gap-1.5">
                  {(c.metrics ?? []).map((m: any) => (
                    <span key={m.label} className="rounded-md border border-border bg-background px-2 py-1 text-[11px]">
                      <span className="text-muted-foreground">{m.label}: </span>
                      <span className="font-semibold tabular-nums">{m.value}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-auto text-[11px] leading-snug text-muted-foreground">{c.note}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Monthly Violations</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip formatter={(v: number) => v.toLocaleString("en-IN")} />
                {events.map((e: any) => (
                  <ReferenceDot key={e.month} x={e.month} y={monthly.find((m: any) => m.month === e.month)?.violations ?? 0}
                    r={6} fill="var(--saffron)" stroke="none" label={{ value: e.name, position: "top", fontSize: 10 }} />
                ))}
                <Line type="monotone" dataKey="violations" stroke="var(--navy)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Violations by Type</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString("en-IN")} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Hour of Day</CardTitle></CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly} barSize={10}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(h) => h + ":00"} interval={3} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip labelFormatter={(h) => h + ":00"} formatter={(v: number) => v.toLocaleString("en-IN")} />
                <Bar dataKey="violations" fill="var(--saffron)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekday */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Day of Week</CardTitle></CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekday}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip formatter={(v: number) => v.toLocaleString("en-IN")} />
                <Bar dataKey="violations" fill="var(--navy)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top junctions table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Top 10 Junctions by Volume</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Junction</TableHead>
                <TableHead className="text-right">Violations</TableHead>
                <TableHead className="text-right">CLI</TableHead>
                <TableHead className="text-right">Rejection %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topJunctions.map((j: any, i: number) => (
                <TableRow key={j.jid}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{j.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{j.violations.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-right tabular-nums">{j.cliScore}</TableCell>
                  <TableCell className="text-right tabular-nums">{(j.rejectionRate * 100).toFixed(1)}%</TableCell>
                  <TableCell><StatusBadge status={cliStatus(j.cliScore)}>{j.topViolation}</StatusBadge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
