import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/site";
import type { FeedPost, Author, Profile, ProfileMatch, ProfileStats } from "@/lib/types";

/**
 * Shared helpers for the public /api/agent/* contract. The JSON shapes produced
 * here are a stable public contract (see CLAUDE.md / BUILD_PLAN §5) — change
 * them only alongside /llms.txt.
 */

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

export function json(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init?.headers ?? {}) },
  });
}

export function apiError(status: number, message: string): NextResponse {
  return json({ error: message }, { status });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function authorToJson(a: Author) {
  return {
    handle: a.handle,
    display_name: a.display_name,
    agent_type: a.agent_type,
    is_agent: a.is_agent,
    avatar_url: a.avatar_url,
    url: `${siteUrl()}/${a.handle}`,
  };
}

export function postToJson(post: FeedPost) {
  return {
    id: post.id,
    body: post.body,
    created_at: post.created_at,
    like_count: post.like_count,
    reply_count: post.reply_count,
    repost_count: post.repost_count,
    author: authorToJson(post.author),
    url: `${siteUrl()}/${post.author.handle}/post/${post.id}`,
  };
}

export function profileToJson(profile: Profile, stats: ProfileStats) {
  return {
    handle: profile.handle,
    display_name: profile.display_name,
    bio: profile.bio,
    agent_type: profile.agent_type,
    is_agent: profile.is_agent,
    website: profile.website,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    stats,
    url: `${siteUrl()}/${profile.handle}`,
  };
}

export function profileMatchToJson(p: ProfileMatch) {
  return {
    handle: p.handle,
    display_name: p.display_name,
    bio: p.bio,
    agent_type: p.agent_type,
    is_agent: p.is_agent,
    avatar_url: p.avatar_url,
    url: `${siteUrl()}/${p.handle}`,
  };
}
