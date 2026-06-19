import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { StatusBadge, cliStatus } from "@/components/common/StatusBadge";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "@/lib/api";
import { useI18n } from "@/lib/i18n";

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] uppercase tracking-wide text-[var(--navy-foreground)]/60">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

export default function Analytics() {
  const { tx } = useI18n();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [hourly, setHourly] = useState<any[]>([]);
  const [weekday, setWeekday] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [topJunctions, setTopJunctions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/summary"),
      api.get("/analytics/monthly"),
      api.get("/analytics/hourly"),
      api.get("/analytics/weekday"),
      api.get("/analytics/violations"),
      api.get("/analytics/top-junctions"),
      api.get("/analytics/events"),
    ]).then(([s, m, h, w, v, j, e]) => {
      setSummary(s.data); setMonthly(m.data); setHourly(h.data);
      setWeekday(w.data); setViolations(v.data); setTopJunctions(j.data); setEvents(e.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading || !summary) return <SectionSkeleton />;

  const COLORS = ["var(--critical)", "var(--warning)", "var(--saffron)", "#3b82f6", "var(--normal)", "var(--muted-foreground)"];
  const pieData = violations.map((v: any) => ({ name: v.type, value: v.count }));

  const eventMonths = new Set(events.map((e: any) => e.month));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{tx("Analytics & Reports")}</h1>
        <p className="text-sm text-muted-foreground">{tx("Patterns across time, geography and violation type.")}</p>
      </div>

      <Card className="bg-[var(--navy)] text-[var(--navy-foreground)] shadow-card">
        <CardContent className="grid gap-4 p-4 md:grid-cols-4">
          <Metric label={tx("Total Records")} value={summary.totalViolations.toLocaleString("en-IN")} />
          <Metric label={tx("Junctions Tracked")} value={summary.junctionsTracked} />
          <Metric label={tx("Date Range")} value={tx(summary.dateRange)} />
          <Metric label={tx("Model Accuracy")} value={(summary.modelAccuracy * 100).toFixed(1) + "%"} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly trend */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{tx("Monthly Violations")}</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} tickFormatter={(m) => tx(m)} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip formatter={(v: number) => v.toLocaleString("en-IN")} labelFormatter={(m) => tx(m)} />
                {events.map((e: any) => (
                  <ReferenceDot key={e.month} x={e.month} y={monthly.find((m: any) => m.month === e.month)?.violations ?? 0}
                    r={6} fill="var(--saffron)" stroke="none" label={{ value: tx(e.name), position: "top", fontSize: 10 }} />
                ))}
                <Line type="monotone" dataKey="violations" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{tx("Violations by Type")}</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="40%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ percent }) => (percent >= 0.05 ? `${(percent * 100).toFixed(0)}%` : "")}
                >
                  {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number, n: any) => [v.toLocaleString("en-IN"), tx(n)]} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={9}
                  wrapperStyle={{ fontSize: 10, lineHeight: "15px", maxWidth: "48%" }}
                  formatter={(value) => tx(String(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{tx("Hour of Day")}</CardTitle></CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly} barSize={10}>
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(h) => h + ":00"} interval={3} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip cursor={false} labelFormatter={(h) => h + ":00"} formatter={(v: number) => v.toLocaleString("en-IN")} />
                <Bar dataKey="violations" fill="var(--saffron)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekday */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{tx("Day of Week")}</CardTitle></CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekday}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={(d) => tx(d)} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip cursor={false} formatter={(v: number) => v.toLocaleString("en-IN")} labelFormatter={(d) => tx(d)} />
                <Bar dataKey="violations" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top junctions table */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">{tx("Top 10 Junctions by Volume")}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>{tx("Junction")}</TableHead>
                <TableHead className="text-right">{tx("Violations")}</TableHead>
                <TableHead className="text-right">{tx("CLI")}</TableHead>
                <TableHead className="text-right">{tx("Rejection %")}</TableHead>
                <TableHead>{tx("Status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topJunctions.map((j: any, i: number) => (
                <TableRow key={j.jid}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{tx(j.name)}</TableCell>
                  <TableCell className="text-right tabular-nums">{j.violations.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-right tabular-nums">{j.cliScore}</TableCell>
                  <TableCell className="text-right tabular-nums">{(j.rejectionRate * 100).toFixed(1)}%</TableCell>
                  <TableCell><StatusBadge status={cliStatus(j.cliScore)}>{tx(j.topViolation)}</StatusBadge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
