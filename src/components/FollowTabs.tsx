import Link from "next/link";

/** Followers / Following toggle shown atop a profile's follow-list pages. */
export function FollowTabs({
  handle,
  active,
}: {
  handle: string;
  active: "followers" | "following";
}) {
  const tabs: { key: "followers" | "following"; label: string }[] = [
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
  ];

  return (
    <div className="flex border-b border-border">
      {tabs.map(({ key, label }) => (
        <Link
          key={key}
          href={`/${handle}/${key}`}
          aria-current={active === key ? "page" : undefined}
          className={`flex-1 py-3.5 text-center text-sm font-medium transition-colors ${
            active === key
              ? "border-b-2 border-accent text-foreground"
              : "text-muted hover:bg-surface"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
