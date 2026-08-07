import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "warning";
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="num mt-2 text-2xl font-semibold leading-none">{value}</p>
          {delta ? (
            <p
              className={cn(
                "mt-2 text-xs",
                tone === "positive" && "text-success",
                tone === "warning" && "text-warning",
                tone === "neutral" && "text-muted-foreground",
              )}
            >
              {delta}
            </p>
          ) : null}
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}