import { getProfileByHandle, getProfileStats } from "@/lib/profiles";
import { getProfilePostsPage } from "@/lib/posts";
import { json, apiError, postToJson, profileToJson, preflight } from "@/lib/agent-api";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const profile = await getProfileByHandle(handle);
  if (!profile) return apiError(404, `No profile with handle @${handle}`);

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") || undefined;

  const [stats, page] = await Promise.all([
    getProfileStats(profile.id),
    getProfilePostsPage(profile.id, cursor),
  ]);

  const next = page.nextCursor
    ? `${siteUrl()}/api/agent/profile/${profile.handle}?cursor=${encodeURIComponent(page.nextCursor)}`
    : null;

  return json({
    profile: profileToJson(profile, stats),
    posts: page.posts.map(postToJson),
    pagination: { next_cursor: page.nextCursor, next },
  });
}
