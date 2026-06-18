import { cn } from "@/lib/utils";

export type Status = "critical" | "warning" | "normal";

const dotColor: Record<Status, string> = {
  critical: "bg-[var(--critical)]",
  warning: "bg-[var(--warning)]",
  normal: "bg-[var(--normal)]",
};

const textColor: Record<Status, string> = {
  critical: "text-[var(--critical)]",
  warning: "text-[var(--warning)]",
  normal: "text-[var(--normal)]",
};

export function StatusBadge({
  status,
  children,
  className,
}: {
  status: Status;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5 text-xs font-medium",
        textColor[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[status])} />
      {children}
    </span>
  );
}

export function cliStatus(cli: number): Status {
  if (cli > 70) return "critical";
  if (cli >= 40) return "warning";
  return "normal";
}
