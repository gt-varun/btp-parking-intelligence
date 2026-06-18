import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KpiCard } from "@/components/common/KpiCard";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { Users, AlertCircle, Wallet, Search } from "lucide-react";
import api from "@/lib/api";

interface AdminUser {
  _id: string; email: string; role: string; createdAt: string;
  total: number; pending: number; totalFines: number;
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [challans, setChallans] = useState<any[]>([]);
  const [challansLoading, setChallansLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/admin/users").then((r) => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const openUser = async (u: AdminUser) => {
    setSelected(u); setChallans([]); setChallansLoading(true);
    api.get(`/admin/users/${u._id}/challans`).then((r) => setChallans(r.data)).finally(() => setChallansLoading(false));
  };

  if (loading) return <SectionSkeleton />;

  const filtered = users.filter((u) => !query || u.email.toLowerCase().includes(query.toLowerCase()));
  const totalPending = users.reduce((s, u) => s + u.pending, 0);
  const totalFines = users.reduce((s, u) => s + u.totalFines, 0);

  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">All registered citizens. Click a row to see their challans.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label="Total Citizens" value={users.length} icon={<Users className="h-4 w-4" />} />
          <KpiCard label="Pending Challans" value={totalPending} accent="critical" icon={<AlertCircle className="h-4 w-4" />} />
          <KpiCard label="Total Fines Levied" value={`₹${totalFines.toLocaleString("en-IN")}`} icon={<Wallet className="h-4 w-4" />} />
          <KpiCard label="Avg Challans/User" value={(users.reduce((s, u) => s + u.total, 0) / (users.length || 1)).toFixed(1)} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <CardTitle className="text-base">Citizens</CardTitle>
            <div className="relative ml-auto w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search by email…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Total Challans</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Total Fines</TableHead>
                  <TableHead>Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u._id} className="cursor-pointer hover:bg-muted/50" onClick={() => openUser(u)}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell><Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{u.total}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {u.pending > 0
                        ? <span className="font-semibold text-[var(--critical)]">{u.pending}</span>
                        : <span className="text-muted-foreground">0</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">₹{u.totalFines.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{u.createdAt?.slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No users found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selected && (
        <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
          <SheetContent className="w-full sm:max-w-xl">
            <SheetHeader>
              <SheetTitle className="text-sm font-mono">{selected.email}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                {[["Total", selected.total], ["Pending", selected.pending], ["Fines", `₹${selected.totalFines.toLocaleString("en-IN")}`]].map(([k, v]) => (
                  <div key={k} className="rounded-lg border p-2 text-center">
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="font-semibold">{v}</div>
                  </div>
                ))}
              </div>
              {challansLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Fine</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challans.map((c) => (
                      <TableRow key={c.challanId}>
                        <TableCell className="tabular-nums text-xs">{c.date}</TableCell>
                        <TableCell className="text-xs">{c.type}</TableCell>
                        <TableCell className="text-right tabular-nums text-xs">₹{c.fine.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.status === "paid" ? "normal" : c.status === "disputed" ? "warning" : "critical"}>
                            {c.status}
                          </StatusBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {challans.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="py-4 text-center text-muted-foreground text-xs">No challans found</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
