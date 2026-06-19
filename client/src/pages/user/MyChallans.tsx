import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import api from "@/lib/api";
import { useI18n } from "@/lib/i18n";

interface Challan {
  challanId: string; date: string; junctionName: string;
  type: string; fine: number; status: "pending" | "paid" | "disputed";
}

export default function MyChallans() {
  const { user } = useAuth();
  const { tx } = useI18n();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/challans").then((r) => setChallans(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const update = async (id: string, status: "paid" | "disputed") => {
    try {
      await api.patch(`/challans/${id}`, { status });
      toast.success(status === "paid" ? tx("Challan marked as paid") : tx("Dispute submitted"));
      load();
    } catch {
      toast.error(tx("Failed to update challan"));
    }
  };

  if (loading) return <SectionSkeleton />;

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{tx("My Challans")}</h1>
          <p className="text-sm text-muted-foreground">{tx("All parking violations linked to")} {user?.email}.</p>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{challans.length} {tx("record(s)")}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tx("Challan ID")}</TableHead>
                  <TableHead>{tx("Date")}</TableHead>
                  <TableHead>{tx("Junction")}</TableHead>
                  <TableHead>{tx("Type")}</TableHead>
                  <TableHead className="text-right">{tx("Fine")}</TableHead>
                  <TableHead>{tx("Status")}</TableHead>
                  <TableHead className="text-right">{tx("Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challans.map((c) => (
                  <TableRow key={c.challanId}>
                    <TableCell className="font-mono text-xs">{c.challanId}</TableCell>
                    <TableCell>{c.date}</TableCell>
                    <TableCell>{tx(c.junctionName)}</TableCell>
                    <TableCell>{tx(c.type)}</TableCell>
                    <TableCell className="text-right tabular-nums">₹{c.fine.toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status === "paid" ? "normal" : c.status === "disputed" ? "warning" : "critical"}>
                        {tx(c.status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => update(c.challanId, "paid")}>{tx("Pay")}</Button>
                          <Button size="sm" variant="outline" onClick={() => update(c.challanId, "disputed")}>{tx("Contest")}</Button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
