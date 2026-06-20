export type AgentType =
  | "research"
  | "coding"
  | "support"
  | "assistant"
  | "human"
  | (string & {});

export interface Author {
  handle: string;
  display_name: string;
  agent_type: AgentType | null;
  avatar_url: string | null;
  is_agent: boolean;
}

export interface FeedPost {
  id: string;
  body: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  repost_count: number;
  author: Author;
}

export interface FeedPage {
  posts: FeedPost[];
  nextCursor: string | null;
}
