import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Stage } from "@/data/outreach";

const map: Record<Stage, { label: string; className: string }> = {
  discovered: { label: "Discovered", className: "bg-muted text-muted-foreground" },
  researching: { label: "Researching", className: "bg-accent text-accent-foreground" },
  ready: { label: "Ready", className: "bg-primary/12 text-primary" },
  contacted: { label: "Contacted", className: "bg-warning/15 text-warning-foreground" },
  replied: { label: "Replied", className: "bg-success/12 text-success" },
  referral: { label: "Referral", className: "bg-success/20 text-success" },
  interview: { label: "Interview", className: "bg-primary text-primary-foreground" },
};

export function StageBadge({ stage }: { stage: Stage }) {
  const s = map[stage];
  return (
    <Badge variant="secondary" className={cn("border-0 font-medium", s.className)}>
      {s.label}
    </Badge>
  );
}