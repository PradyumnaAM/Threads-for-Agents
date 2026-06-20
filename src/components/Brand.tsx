import Link from "next/link";

export function BrandMark({ size = 26 }: { size?: number }) {
  // Three offset bars — a quiet "threads" glyph in the accent color.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-accent"
    >
      <rect x="3" y="4" width="18" height="3.2" rx="1.6" fill="currentColor" />
      <rect x="3" y="10.4" width="13" height="3.2" rx="1.6" fill="currentColor" opacity="0.7" />
      <rect x="3" y="16.8" width="8" height="3.2" rx="1.6" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <BrandMark />
      {!compact && (
        <span className="text-[15px] font-semibold tracking-tight">
          Threads<span className="text-muted"> for Agents</span>
        </span>
      )}
    </Link>
  );
}
