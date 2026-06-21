import { supabasePublic } from "@/lib/supabase/public-client";

export type NotificationType = "like" | "repost" | "follow";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actor: { handle: string; display_name: string; avatar_url: string | null };
  /** Post excerpt for like/repost; null for follows. */
  excerpt: string | null;
  /** Where clicking the row goes (thread for like/repost, profile for follow). */
  href: string;
  created_at: string;
}

type Actor = { handle: string; display_name: string; avatar_url: string | null };

function excerpt(body: string): string {
  return body.length > 70 ? body.slice(0, 70) + "…" : body;
}

/**
 * Real notifications for the signed-in viewer: who actually followed them, and
 * who liked or reposted one of their posts. Backed by the follows/likes/reposts
 * tables, so the bell stays consistent with the profile's follower counts.
 */
export async function getNotifications(viewerId: string | null): Promise<NotificationItem[]> {
  if (!viewerId) return [];

  const LIMIT = 25;

  // The viewer's posts — targets for like/repost notifications (+ excerpt/href).
  const { data: myPosts } = await supabasePublic
    .from("posts")
    .select("id, body, author:profiles!posts_author_id_fkey(handle)")
    .eq("author_id", viewerId);
  const myPostIds = (myPosts ?? []).map((p) => p.id as string);
  const postInfo = new Map(
    ((myPosts ?? []) as unknown as { id: string; body: string; author: { handle: string } }[]).map(
      (p) => [p.id, { excerpt: excerpt(p.body), href: `/${p.author.handle}/post/${p.id}` }],
    ),
  );

  const empty = Promise.resolve({ data: [] as unknown[] });
  const [followsRes, likesRes, repostsRes] = await Promise.all([
    supabasePublic
      .from("follows")
      .select("created_at, actor:profiles!follows_follower_id_fkey(handle,display_name,avatar_url)")
      .eq("followee_id", viewerId)
      .order("created_at", { ascending: false })
      .limit(LIMIT),
    myPostIds.length
      ? supabasePublic
          .from("likes")
          .select("created_at, post_id, actor:profiles!likes_profile_id_fkey(handle,display_name,avatar_url)")
          .in("post_id", myPostIds)
          .order("created_at", { ascending: false })
          .limit(LIMIT)
      : empty,
    myPostIds.length
      ? supabasePublic
          .from("reposts")
          .select("created_at, post_id, actor:profiles!reposts_profile_id_fkey(handle,display_name,avatar_url)")
          .in("post_id", myPostIds)
          .order("created_at", { ascending: false })
          .limit(LIMIT)
      : empty,
  ]);

  const items: NotificationItem[] = [];

  for (const f of (followsRes.data ?? []) as unknown as { created_at: string; actor: Actor | null }[]) {
    if (!f.actor) continue;
    items.push({
      id: `f-${f.actor.handle}-${f.created_at}`,
      type: "follow",
      actor: f.actor,
      excerpt: null,
      href: `/${f.actor.handle}`,
      created_at: f.created_at,
    });
  }
  for (const l of (likesRes.data ?? []) as unknown as { created_at: string; post_id: string; actor: Actor | null }[]) {
    if (!l.actor) continue;
    const info = postInfo.get(l.post_id);
    items.push({
      id: `l-${l.post_id}-${l.actor.handle}`,
      type: "like",
      actor: l.actor,
      excerpt: info?.excerpt ?? null,
      href: info?.href ?? `/${l.actor.handle}`,
      created_at: l.created_at,
    });
  }
  for (const r of (repostsRes.data ?? []) as unknown as { created_at: string; post_id: string; actor: Actor | null }[]) {
    if (!r.actor) continue;
    const info = postInfo.get(r.post_id);
    items.push({
      id: `r-${r.post_id}-${r.actor.handle}`,
      type: "repost",
      actor: r.actor,
      excerpt: info?.excerpt ?? null,
      href: info?.href ?? `/${r.actor.handle}`,
      created_at: r.created_at,
    });
  }

  items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return items.slice(0, LIMIT);
}
