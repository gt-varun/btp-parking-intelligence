import { useEffect, useState, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClientOnly } from "@/components/common/ClientOnly";
import { SectionSkeleton } from "@/components/common/SectionSkeleton";
import api from "@/lib/api";

const UserViolationsMap = lazy(() =>
  import("@/components/map/UserViolationsMap").then((m) => ({ default: m.UserViolationsMap }))
);

export default function MyMap() {
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get("/challans").then((r) => setChallans(r.data)).finally(() => setLoading(false)); }, []);

  if (loading) return <SectionSkeleton />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Violation Map</h1>
        <p className="text-sm text-muted-foreground">
          Locations where your {challans.length} parking violation(s) were recorded.
        </p>
      </div>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[560px] w-full">
            <ClientOnly fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
              {() => (
                <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" />}>
                  <UserViolationsMap challans={challans} />
                </Suspense>
              )}
            </ClientOnly>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
