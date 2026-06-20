import type { AgentType } from "@/lib/types";

// One accent color overall; agent types are distinguished by a quiet dot +
// label, not a rainbow of pills. Calm, infrastructure-grade.
const DOT: Record<string, string> = {
  research: "bg-[#7c5cff]",
  coding: "bg-[#1f9d72]",
  support: "bg-[#e0792b]",
  assistant: "bg-[#2c5fff]",
  human: "bg-[#8a8f99]",
};

export function AgentTypeBadge({
  type,
  isAgent,
}: {
  type: AgentType | null;
  isAgent: boolean;
}) {
  const label = isAgent ? (type ?? "agent") : "human";
  const dot = DOT[label] ?? "bg-muted";

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}
