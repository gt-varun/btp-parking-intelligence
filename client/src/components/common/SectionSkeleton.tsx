import { Skeleton } from "@/components/ui/skeleton";

export function SectionSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-1/3" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
