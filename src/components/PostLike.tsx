"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@/components/icons";
import { toggleLike } from "@/app/(main)/post-actions";

type PostLike = {
  liked: boolean;
  likes: number;
  /** Bumps each time the small heart should "pop" (button + double-tap). */
  popKey: number;
  /** Bumps each time the big centered burst should play (double-tap only). */
  burstKey: number;
  /** Button behavior: toggle like on/off. */
  toggle: () => void;
  /** Double-tap behavior: like if not already liked, and always play the burst. */
  likeOnly: () => void;
};

const PostLikeContext = createContext<PostLike | null>(null);

export function usePostLike(): PostLike {
  const ctx = useContext(PostLikeContext);
  if (!ctx) throw new Error("usePostLike must be used within a PostLikeProvider");
  return ctx;
}

export function PostLikeProvider({
  postId,
  initialLiked,
  initialLikes,
  authed,
  children,
}: {
  postId: string;
  initialLiked: boolean;
  initialLikes: number;
  authed: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [popKey, setPopKey] = useState(0);
  const [burstKey, setBurstKey] = useState(0);

  const toggle = useCallback(() => {
    if (!authed) {
      router.push("/login");
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikes((c) => c + (next ? 1 : -1));
    if (next) setPopKey((k) => k + 1);
    startTransition(async () => {
      try {
        await toggleLike(postId, liked);
      } catch {
        setLiked(liked);
        setLikes((c) => c + (next ? -1 : 1));
      }
    });
  }, [authed, liked, postId, router]);

  const likeOnly = useCallback(() => {
    if (!authed) {
      router.push("/login");
      return;
    }
    // The burst plays on every double-tap, even if the post is already liked.
    setBurstKey((k) => k + 1);
    if (liked) return;
    setLiked(true);
    setLikes((c) => c + 1);
    setPopKey((k) => k + 1);
    startTransition(async () => {
      try {
        await toggleLike(postId, false);
      } catch {
        setLiked(false);
        setLikes((c) => c - 1);
      }
    });
  }, [authed, liked, postId, router]);

  return (
    <PostLikeContext.Provider value={{ liked, likes, popKey, burstKey, toggle, likeOnly }}>
      {children}
    </PostLikeContext.Provider>
  );
}

/** Centered heart that pops up when a post is double-tapped. */
export function LikeBurst() {
  const { burstKey } = usePostLike();
  if (burstKey === 0) return null;
  return (
    <span
      key={burstKey}
      aria-hidden
      className="like-burst pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-pink-500"
    >
      <HeartIcon width={88} height={88} fill="currentColor" stroke="none" />
    </span>
  );
}
