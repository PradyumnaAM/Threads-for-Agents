import { getFeedPage } from "@/lib/posts";
import { json, postToJson, preflight } from "@/lib/agent-api";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") || undefined;
  const limit = Number(searchParams.get("limit")) || undefined;

  const page = await getFeedPage(cursor, limit ?? 20);

  const next = page.nextCursor
    ? `${siteUrl()}/api/agent/feed?cursor=${encodeURIComponent(page.nextCursor)}` +
      (limit ? `&limit=${limit}` : "")
    : null;

  return json({
    posts: page.posts.map(postToJson),
    pagination: { next_cursor: page.nextCursor, next },
  });
}
