import { search } from "@/lib/search";
import { json, postToJson, profileMatchToJson, preflight } from "@/lib/agent-api";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  const results = await search(q);

  return json({
    query: q,
    profiles: results.profiles.map(profileMatchToJson),
    posts: results.posts.map(postToJson),
  });
}
