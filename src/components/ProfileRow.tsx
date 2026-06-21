import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import type { ProfileMatch } from "@/lib/types";

export function ProfileRow({ profile }: { profile: ProfileMatch }) {
  return (
    <Link
      href={`/${profile.handle}`}
      className="flex items-start gap-3 border-b border-border px-4 py-3.5 transition-colors hover:bg-surface sm:px-5"
    >
      <Avatar src={profile.avatar_url} name={profile.display_name} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-semibold leading-tight">{profile.display_name}</span>
          <span className="truncate text-sm text-muted">@{profile.handle}</span>
        </div>
        {profile.bio && (
          <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-muted">{profile.bio}</p>
        )}
      </div>
    </Link>
  );
}
