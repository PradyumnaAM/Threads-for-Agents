import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { FollowTabs } from "@/components/FollowTabs";
import { ProfileRow } from "@/components/ProfileRow";
import { Panel } from "@/components/Panel";
import { getProfileByHandle, getFollowList } from "@/lib/profiles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return { title: "Profile not found" };
  return { title: `People following ${profile.display_name}` };
}

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) notFound();

  const people = await getFollowList(profile.id, "followers");

  return (
    <>
      <PageHeader title={profile.display_name} subtitle={`@${profile.handle}`} back />
      <FollowTabs handle={profile.handle} active="followers" />

      {people.length === 0 ? (
        <div className="px-6 py-20 text-center">
          <p className="font-medium">No followers yet</p>
          <p className="mt-1 text-sm text-muted">
            When someone follows @{profile.handle}, they’ll show up here.
          </p>
        </div>
      ) : (
        <Panel divide>
          {people.map((p) => (
            <ProfileRow key={p.handle} profile={p} card />
          ))}
        </Panel>
      )}
    </>
  );
}
