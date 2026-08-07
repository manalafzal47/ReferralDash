import { cn } from "@/lib/utils";

export function MatchScore({
  score,
  size = "sm",
}: {
  score: number;
  size?: "sm" | "lg";
}) {
  const tone =
    score >= 85
      ? "bg-success/12 text-success"
      : score >= 75
        ? "bg-warning/15 text-warning-foreground"
        : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "num inline-flex items-center rounded-md font-medium tabular-nums",
        tone,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-base",
      )}
    >
      {score}/100
    </span>
  );
}