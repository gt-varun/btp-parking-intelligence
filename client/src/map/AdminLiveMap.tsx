import { lazy, Suspense, useEffect, useState } from "react";
import api from "@/lib/api";
import { ClientOnly } from "@/components/common/ClientOnly";
import { MapLegend } from "@/components/map/MapLegend";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ViolationMap = lazy(() =>
  import("@/components/map/ViolationMap").then((m) => ({
    default: m.ViolationMap,
  }))
);

export default function AdminLiveMap() {
  const [junctions, setJunctions] = useState<any[]>([]);
  const [hour, setHour] = useState(new Date().getHours());
  const [layer, setLayer] = useState<"cli" | "count">("cli");

  useEffect(() => {
    api.get("/junctions").then((res) => {
      const data = res.data.map((j: any) => ({
        ...j,
        id: j.jid || j._id,
      }));

      setJunctions(data);
    });
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-1 pb-3">
        <Tabs value={layer} onValueChange={(v) => setLayer(v as "cli" | "count")} className="h-8">
          <TabsList className="h-8">
            <TabsTrigger value="cli" className="h-6 text-xs">CLI</TabsTrigger>
            <TabsTrigger value="count" className="h-6 text-xs">Count</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-16">Hour: {hour}:00</span>
          <Slider className="w-40 sm:max-w-xs" min={0} max={23} step={1} value={[hour]} onValueChange={([v]) => setHour(v)} />
        </div>
      </div>

      <div className="relative h-[500px] w-full">
        <ClientOnly
          fallback={<div className="h-full w-full animate-pulse bg-muted" />}
        >
          {() => (
            <Suspense
              fallback={
                <div className="h-full w-full animate-pulse bg-muted" />
              }
            >
              <ViolationMap
                hour={hour}
                layer={layer}
                junctions={junctions}
              />
            </Suspense>
          )}
        </ClientOnly>
        <MapLegend layer={layer} />
      </div>
    </div>
  );
}