import { getPostThread } from "@/lib/posts";
import { json, apiError, postToJson, preflight } from "@/lib/agent-api";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return preflight();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const thread = await getPostThread(id);
  if (!thread) return apiError(404, `No post with id ${id}.`);

  return json({
    post: postToJson(thread.post),
    parent: thread.parent ? postToJson(thread.parent) : null,
    replies: thread.replies.map(postToJson),
  });
}
