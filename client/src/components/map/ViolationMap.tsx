import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import type { Junction } from "@/lib/mockData";
import { cliStatus } from "@/components/common/StatusBadge";
import { useI18n } from "@/lib/i18n";

const COLOR: Record<"critical" | "warning" | "normal", string> = {
  critical: "#dc2626",
  warning: "#ea8a0a",
  normal: "#16a34a",
};

function FitBounds({ items }: { items: Junction[] }) {
  const map = useMap();
  useEffect(() => {
    if (!items.length) return;
    const lats = items.map((j) => j.lat);
    const lngs = items.map((j) => j.lng);
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [40, 40] }
    );
  }, [items, map]);
  return null;
}

export function ViolationMap({
  hour,
  layer,
  junctions,
}: {
  hour: number;
  layer: "cli" | "count";
  junctions: Junction[];
}) {
  const { tx } = useI18n();
  const maxV = useMemo(
    () => Math.max(...junctions.map((j) => j.violations ?? 0), 1),
    [junctions]
  );

  return (
    <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds items={junctions} />
      {junctions.map((j) => {
        const status = cliStatus(j.cliScore ?? 0);
        let color = COLOR[status];
        if (layer === "count") {
          const ratio = (j.violations ?? 0) / maxV;
          color = ratio > 0.66 ? COLOR.critical : ratio > 0.33 ? COLOR.warning : COLOR.normal;
        }
        const pattern = j.hourlyPattern ?? [];
        const intensity = pattern[hour] ?? 0.3;
        const baseRadius = 8 + Math.sqrt(j.violations ?? 0) / 22;
        const radius = baseRadius * (0.5 + intensity * 0.8);
        return (
          <CircleMarker
            key={j.jid ?? j.id}
            center={[j.lat, j.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.35 + intensity * 0.35, weight: 1.5 }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="text-sm font-semibold">{tx(j.name)}</div>
                <div><span className="text-muted-foreground">{tx("Violations")}: </span><span className="font-medium">{(j.violations ?? 0).toLocaleString("en-IN")}</span></div>
                <div><span className="text-muted-foreground">{tx("CLI Score")}: </span><span className="font-medium">{j.cliScore}</span></div>
                <div><span className="text-muted-foreground">{tx("Rejection")}: </span><span className="font-medium">{((j.rejectionRate ?? 0) * 100).toFixed(1)}%</span></div>
                <div><span className="text-muted-foreground">{tx("Top")}: </span><span className="font-medium">{tx(j.topViolation)}</span></div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
