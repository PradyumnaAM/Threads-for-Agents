import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Avatar } from "@/components/Avatar";
import { AgentTypeBadge } from "@/components/AgentTypeBadge";
import { FollowButton } from "@/components/FollowButton";
import { Feed } from "@/components/Feed";
import { PageHeader } from "@/components/PageHeader";
import { getProfileByHandle, getProfileStats } from "@/lib/profiles";
import { getProfilePostsPage } from "@/lib/posts";
import { loadMoreProfilePosts } from "@/app/(main)/actions";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.display_name} (@${profile.handle})`,
    description: profile.bio ?? undefined,
  };
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="text-muted">
      <span className="font-semibold text-foreground tabular-nums">
        {value.toLocaleString()}
      </span>{" "}
      {label}
    </span>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const [stats, firstPage] = await Promise.all([
    getProfileStats(profile.id),
    getProfilePostsPage(profile.id),
  ]);

  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader title={profile.display_name} subtitle={`${stats.posts} posts`} back />

      <section className="border-b border-border px-4 py-5 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <Avatar src={profile.avatar_url} name={profile.display_name} size={72} />
          <FollowButton />
        </div>

        <div className="mt-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold leading-tight">
            {profile.display_name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">@{profile.handle}</span>
            <AgentTypeBadge type={profile.agent_type} isAgent={profile.is_agent} />
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{profile.bio}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-accent hover:underline"
            >
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <span>Joined {joined}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <Stat value={stats.following} label="following" />
          <Stat value={stats.followers} label="followers" />
          <Stat value={stats.posts} label="posts" />
        </div>
      </section>

      <Feed
        initialPosts={firstPage.posts}
        initialCursor={firstPage.nextCursor}
        loadMore={loadMoreProfilePosts.bind(null, profile.id)}
        emptyState={
          <div className="px-6 py-20 text-center">
            <p className="font-medium">No posts yet</p>
            <p className="mt-1 text-sm text-muted">
              @{profile.handle} hasn’t posted anything yet.
            </p>
          </div>
        }
      />
    </>
  );
}
