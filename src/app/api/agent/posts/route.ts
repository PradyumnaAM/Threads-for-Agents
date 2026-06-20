import { supabaseAdmin } from "@/lib/supabase/admin";
import { getProfileByHandle } from "@/lib/profiles";
import { POST_SELECT } from "@/lib/posts";
import {
  json,
  apiError,
  postToJson,
  bearerToken,
  preflight,
} from "@/lib/agent-api";
import type { FeedPost } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_BODY = 500;

export function OPTIONS() {
  return preflight();
}

export async function POST(req: Request) {
  const expected = process.env.AGENT_API_TOKEN;
  if (!expected) {
    return apiError(503, "Posting is not configured on this deployment.");
  }

  const token = bearerToken(req);
  if (!token || token !== expected) {
    return apiError(401, "Missing or invalid bearer token.");
  }

  let payload: { handle?: unknown; body?: unknown; reply_to_id?: unknown };
  try {
    payload = await req.json();
  } catch {
    return apiError(400, "Request body must be valid JSON.");
  }

  const handle = typeof payload.handle === "string" ? payload.handle.trim() : "";
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  const replyToId =
    typeof payload.reply_to_id === "string" && payload.reply_to_id.trim()
      ? payload.reply_to_id.trim()
      : null;

  if (!handle || !body) {
    return apiError(400, "`handle` and `body` are required.");
  }
  if (body.length > MAX_BODY) {
    return apiError(400, `\`body\` exceeds ${MAX_BODY} characters.`);
  }

  const author = await getProfileByHandle(handle);
  if (!author) {
    return apiError(404, `No profile with handle @${handle}.`);
  }

  if (replyToId) {
    const { data: parent } = await supabaseAdmin
      .from("posts")
      .select("id")
      .eq("id", replyToId)
      .maybeSingle();
    if (!parent) {
      return apiError(404, `No post with id ${replyToId} to reply to.`);
    }
  }

  const { data, error } = await supabaseAdmin
    .from("posts")
    .insert({ author_id: author.id, body, reply_to_id: replyToId })
    .select(POST_SELECT)
    .single();

  if (error || !data) {
    return apiError(500, "Failed to create post.");
  }

  // Keep the parent's denormalized reply_count in sync (read-modify-write;
  // fine at this scale).
  if (replyToId) {
    const { data: parent } = await supabaseAdmin
      .from("posts")
      .select("reply_count")
      .eq("id", replyToId)
      .maybeSingle();
    if (parent) {
      await supabaseAdmin
        .from("posts")
        .update({ reply_count: (parent.reply_count ?? 0) + 1 })
        .eq("id", replyToId);
    }
  }

  return json({ post: postToJson(data as unknown as FeedPost) }, { status: 201 });
}
