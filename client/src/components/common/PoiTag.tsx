import { Store, Train, Hospital, Building2, ShoppingBag, Briefcase, Landmark, GraduationCap } from "lucide-react";
import type { PoiTag as PoiTagType } from "@/lib/mockData";
import { useI18n } from "@/lib/i18n";

const cfg: Record<PoiTagType, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  Market: { icon: Store, label: "Market" },
  Metro: { icon: Train, label: "Metro" },
  Hospital: { icon: Hospital, label: "Hospital" },
  Commercial: { icon: Building2, label: "Commercial" },
  Mall: { icon: ShoppingBag, label: "Mall" },
  Office: { icon: Briefcase, label: "Office" },
  Temple: { icon: Landmark, label: "Temple" },
  School: { icon: GraduationCap, label: "School" },
};

export function PoiTag({ tag }: { tag: PoiTagType }) {
  const { tx } = useI18n();
  const C = cfg[tag];
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      <C.icon className="h-3 w-3" />
      {tx(C.label)}
    </span>
  );
}

export function PoiTags({ tags }: { tags: PoiTagType[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {tags.map((t) => (
        <PoiTag key={t} tag={t} />
      ))}
    </span>
  );
}
