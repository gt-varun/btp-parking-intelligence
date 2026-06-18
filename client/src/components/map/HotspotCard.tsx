import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, cliStatus } from "@/components/common/StatusBadge";
import { PoiTags } from "@/components/common/PoiTag";
import type { Junction } from "@/lib/mockData";

export function HotspotCard({ j }: { j: Junction }) {
  const status = cliStatus(j.cliScore);
  const data = j.hourlyPattern.map((v, h) => ({ h, v }));
  return (
    <Card className="min-w-[240px] shrink-0 shadow-card transition-shadow hover:shadow-card-hover">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="text-sm font-semibold leading-tight">{j.name}</div>
          <StatusBadge status={status}>CLI {j.cliScore}</StatusBadge>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {j.violations.toLocaleString("en-IN")} violations · {(j.rejectionRate * 100).toFixed(0)}% rejection
        </div>
        <div className="mt-2 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
              <Tooltip
                cursor={false}
                contentStyle={{ fontSize: 11, padding: "4px 6px", borderRadius: 6 }}
                formatter={(v) => [(Number(v) * 100).toFixed(0) + "%", "Intensity"]}
                labelFormatter={(h) => `${h}:00`}
              />
              <Line type="monotone" dataKey="v" stroke="var(--saffron)" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2">
          <PoiTags tags={j.poiTags} />
        </div>
      </CardContent>
    </Card>
  );
}
