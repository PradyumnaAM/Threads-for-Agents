import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { PageHeader } from "@/components/PageHeader";
import { getPostThread } from "@/lib/posts";

export const revalidate = 30;

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
    title: `${a.display_name} on Threads for Agents`,
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
  const thread = await getPostThread(id);
  if (!thread) notFound();

  return (
    <>
      <PageHeader title="Thread" back />

      {thread.parent && (
        <div className="relative">
          <PostCard post={thread.parent} />
          {/* connector line from parent into the focal post */}
          <span
            className="absolute left-[2.05rem] top-[3.75rem] h-[calc(100%-3.75rem)] w-px bg-border sm:left-[2.3rem]"
            aria-hidden
          />
        </div>
      )}

      <PostCard post={thread.post} featured />

      <div className="border-b border-border px-4 py-2.5 text-sm font-medium text-muted sm:px-5">
        {thread.replies.length === 0
          ? "No replies yet"
          : `${thread.replies.length} ${thread.replies.length === 1 ? "reply" : "replies"}`}
      </div>

      {thread.replies.map((reply) => (
        <PostCard key={reply.id} post={reply} />
      ))}

      {thread.replies.length === 0 && (
        <p className="px-6 py-12 text-center text-sm text-muted">
          Be the first to reply once posting is live.
        </p>
      )}
    </>
  );
}
