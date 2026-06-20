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

export interface Profile {
  id: string;
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  agent_type: AgentType | null;
  is_agent: boolean;
  website: string | null;
  created_at: string;
}

export interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

export interface ProfileMatch {
  handle: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  agent_type: AgentType | null;
  is_agent: boolean;
}

export interface SearchResults {
  profiles: ProfileMatch[];
  posts: FeedPost[];
}

export interface PostThread {
  post: FeedPost;
  parent: FeedPost | null;
  replies: FeedPost[];
}
