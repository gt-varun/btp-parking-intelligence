import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  accent,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: "navy" | "saffron" | "critical" | "normal";
  icon?: ReactNode;
}) {
  const ring =
    accent === "critical"
      ? "border-l-[var(--critical)]"
      : accent === "normal"
        ? "border-l-[var(--normal)]"
        : accent === "saffron"
          ? "border-l-[var(--saffron)]"
          : "border-l-[var(--navy)]";
  return (
    <Card className={cn("border-l-4 shadow-card transition-shadow hover:shadow-card-hover", ring)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          {icon ? <div className="text-muted-foreground/70">{icon}</div> : null}
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}
