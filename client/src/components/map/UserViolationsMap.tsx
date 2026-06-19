import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface Challan {
  challanId?: string; _id?: string;
  lat: number; lng: number;
  type: string; junctionName: string; date: string;
  fine: number; status: string;
}

function FitBounds({ items }: { items: Challan[] }) {
  const map = useMap();
  useEffect(() => {
    if (!items.length) return;
    const lats = items.map((c) => c.lat);
    const lngs = items.map((c) => c.lng);
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [40, 40] }
    );
  }, [items, map]);
  return null;
}

const STATUS_COLOR: Record<string, string> = {
  paid: "#16a34a", pending: "#dc2626", disputed: "#ea8a0a",
};

export function UserViolationsMap({ challans }: { challans: Challan[] }) {
  const { tx } = useI18n();
  return (
    <MapContainer center={[12.9716, 77.5946]} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds items={challans} />
      {challans.map((c) => {
        const color = STATUS_COLOR[c.status] ?? "#1e3a8a";
        const key = c.challanId ?? c._id ?? Math.random().toString();
        return (
          <CircleMarker key={key} center={[c.lat, c.lng]} radius={9}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.55, weight: 1.5 }}>
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="text-sm font-semibold">{tx(c.type)}</div>
                <div>{tx(c.junctionName)}</div>
                <div className="text-muted-foreground">{c.date}</div>
                <div>{tx("Fine")}: <span className="font-medium">₹{c.fine.toLocaleString("en-IN")}</span></div>
                <div>{tx("Status")}: <span className="font-medium">{tx(c.status)}</span></div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
