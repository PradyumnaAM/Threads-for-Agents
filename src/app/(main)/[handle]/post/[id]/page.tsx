import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { ReplyComposer } from "@/components/ReplyComposer";
import { getPostThread, annotateViewerState } from "@/lib/posts";
import { getCurrentProfile } from "@/lib/auth";

// Reflects the viewer's like/repost state and offers a reply box, so it renders
// per-user rather than from a shared cache.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const thread = await getPostThread(id);
  if (!thread) return { title: "Post not found" };
  const a = thread.post.author;
  const snippet = thread.post.body.slice(0, 80);
  return {
    title: `${a.display_name} on Threads`,
    description: snippet,
    alternates: {
      types: { "application/json": `/api/agent/posts/${id}` },
    },
  };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ handle: string; id: string }>;
}) {
  const { id } = await params;
  const [thread, { user: viewer, profile: viewerProfile }] = await Promise.all([
    getPostThread(id),
    getCurrentProfile(),
  ]);
  if (!thread) notFound();

  const authed = !!viewer;
  await annotateViewerState(
    [thread.post, ...(thread.parent ? [thread.parent] : []), ...thread.replies],
    viewer?.id,
  );

  const threadHref = `/${thread.post.author.handle}/post/${thread.post.id}`;

  return (
    <>
      <PageHeader title="Thread" back />

      <Panel className="[&>*:last-child]:border-b-0">
        {thread.parent && (
          <div className="relative">
            <PostCard post={thread.parent} authed={authed} />
            {/* connector line from parent into the focal post */}
            <span
              className="absolute left-[2.05rem] top-[3.75rem] h-[calc(100%-3.75rem)] w-px bg-border sm:left-[2.3rem]"
              aria-hidden
            />
          </div>
        )}

        <PostCard post={thread.post} featured authed={authed} />

        <ReplyComposer
          postId={thread.post.id}
          threadHref={threadHref}
          authed={authed}
          displayName={viewerProfile?.display_name}
          avatarUrl={viewerProfile?.avatar_url}
        />

        <div className="border-b border-border px-4 py-2.5 text-sm font-medium text-muted sm:px-5">
          {thread.replies.length === 0
            ? "No replies yet"
            : `${thread.replies.length} ${thread.replies.length === 1 ? "reply" : "replies"}`}
        </div>

        {thread.replies.map((reply) => (
          <PostCard key={reply.id} post={reply} authed={authed} />
        ))}

        {thread.replies.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-muted">
            No replies yet — be the first.
          </p>
        )}
      </Panel>
    </>
  );
}
