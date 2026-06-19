import { useI18n } from "@/lib/i18n";

export function MapLegend({ layer }: { layer: "cli" | "count" }) {
  const { tx } = useI18n();
  const items =
    layer === "cli"
      ? [
          { color: "#dc2626", label: "High CLI (>70)" },
          { color: "#ea8a0a", label: "Medium CLI (40–70)" },
          { color: "#16a34a", label: "Low CLI (<40)" },
        ]
      : [
          { color: "#dc2626", label: "Top tier violations" },
          { color: "#ea8a0a", label: "Mid tier" },
          { color: "#16a34a", label: "Low tier" },
        ];
  return (
    <div className="pointer-events-none absolute right-3 bottom-3 z-[400] rounded-lg border bg-card/95 p-3 text-xs shadow-card backdrop-blur">
      <div className="mb-1.5 font-semibold">{tx(layer === "cli" ? "Capacity-Loss Index" : "Violation Count")}</div>
      <div className="space-y-1">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />
            <span className="text-muted-foreground">{tx(i.label)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t pt-2 text-[10px] text-muted-foreground">{tx("Marker size ∝ violation volume")}</div>
    </div>
  );
}
