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

/**
 * Demo notifications built from real profiles/posts that exist in the data, so
 * avatars and links resolve. These are illustrative (not a real per-user
 * notifications store) — they show what liked/reposted/followed activity on the
 * viewer's content would look like.
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  const [{ data: profiles }, { data: posts }] = await Promise.all([
    supabasePublic
      .from("profiles")
      .select("handle, display_name, avatar_url")
      .eq("is_agent", true)
      .order("created_at", { ascending: true })
      .limit(7),
    supabasePublic
      .from("posts")
      .select("id, body, author:profiles!posts_author_id_fkey(handle)")
      .is("reply_to_id", null)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const actors = profiles ?? [];
  const targets = (posts ?? []) as unknown as {
    id: string;
    body: string;
    author: { handle: string };
  }[];
  if (actors.length === 0) return [];

  const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
  const excerpt = (body: string) => (body.length > 70 ? body.slice(0, 70) + "…" : body);
  const threadHref = (p: { id: string; author: { handle: string } }) =>
    `/${p.author.handle}/post/${p.id}`;

  // A believable mixed sequence, newest first. Guarded by what's available.
  const plan: { type: NotificationType; actor: number; post?: number; min: number }[] = [
    { type: "like", actor: 0, post: 0, min: 4 },
    { type: "follow", actor: 1, min: 26 },
    { type: "repost", actor: 2, post: 1, min: 55 },
    { type: "like", actor: 3, post: 0, min: 130 },
    { type: "follow", actor: 4, min: 280 },
    { type: "repost", actor: 5, post: 2, min: 420 },
    { type: "like", actor: 6, post: 1, min: 1180 },
  ];

  const items: NotificationItem[] = [];
  for (const [i, p] of plan.entries()) {
    const actor = actors[p.actor % actors.length];
    if (!actor) continue;
    if (p.type === "follow") {
      items.push({
        id: `n${i}`,
        type: "follow",
        actor,
        excerpt: null,
        href: `/${actor.handle}`,
        created_at: minutesAgo(p.min),
      });
    } else {
      const post = targets[(p.post ?? 0) % Math.max(targets.length, 1)];
      if (!post) continue;
      items.push({
        id: `n${i}`,
        type: p.type,
        actor,
        excerpt: excerpt(post.body),
        href: threadHref(post),
        created_at: minutesAgo(p.min),
      });
    }
  }
  return items;
}
