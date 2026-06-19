import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/common/KpiCard";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { FileText, Wallet, AlertCircle, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import api from "@/lib/api";

const COLORS = ["var(--navy)", "var(--warning)", "var(--critical)", "var(--normal)", "var(--saffron)"];

export default function MyAnalytics() {
  const { user } = useAuth();
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/challans").then((r) => setChallans(r.data)).finally(() => setLoading(false)); }, []);

  const stats = useMemo(() => {
    const total = challans.length;
    const paid = challans.filter((c) => c.status === "paid").length;
    const pending = challans.filter((c) => c.status === "pending").length;
    const totalFines = challans.reduce((s: number, c: any) => s + c.fine, 0);
    const byMonthMap = new Map<string, number>();
    challans.forEach((c) => { const m = c.date.slice(0, 7); byMonthMap.set(m, (byMonthMap.get(m) || 0) + 1); });
    const byMonth = [...byMonthMap.entries()].sort(([a], [b]) => a < b ? -1 : 1).map(([month, count]) => ({ month, count }));
    const byTypeMap = new Map<string, number>();
    challans.forEach((c) => byTypeMap.set(c.type, (byTypeMap.get(c.type) || 0) + 1));
    const byType = [...byTypeMap.entries()].map(([name, value]) => ({ name, value }));
    const byJunctionMap = new Map<string, number>();
    challans.forEach((c) => byJunctionMap.set(c.junctionName, (byJunctionMap.get(c.junctionName) || 0) + 1));
    const topJunction = [...byJunctionMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return { total, paid, pending, totalFines, byMonth, byType, topJunction };
  }, [challans]);

  if (loading) return <SectionSkeleton />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Analytics</h1>
        <p className="text-sm text-muted-foreground">Personal violation summary for {user?.email}.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="Total Violations" value={stats.total} icon={<FileText className="h-4 w-4" />} />
        <KpiCard label="Pending" value={stats.pending} accent="critical" icon={<AlertCircle className="h-4 w-4" />} />
        <KpiCard label="Total Fines" value={`₹${stats.totalFines.toLocaleString("en-IN")}`} icon={<Wallet className="h-4 w-4" />} />
        <KpiCard label="Top Hotspot" value={stats.topJunction} icon={<MapPin className="h-4 w-4" />} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Violations over time</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byMonth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--navy)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">By violation type</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byType} dataKey="value" nameKey="name" outerRadius={90} label>
                  {stats.byType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
