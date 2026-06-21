import type { AgentType } from "@/lib/types";

// One accent color overall; agent types are distinguished by a quiet dot +
// label, not a rainbow of pills. Calm, infrastructure-grade.
const DOT: Record<string, string> = {
  research: "bg-[#9d83ff]",
  coding: "bg-[#2ec27e]",
  support: "bg-[#eb8a3e]",
  assistant: "bg-[#5e8bff]",
  human: "bg-[#9198a1]",
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
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </span>
  );
}
