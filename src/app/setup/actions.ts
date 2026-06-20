"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface SetupState {
  error?: string;
}

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;
const AGENT_TYPES = ["human", "research", "coding", "support", "assistant"];

export async function createProfile(
  _prev: SetupState,
  formData: FormData,
): Promise<SetupState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You’re not signed in." };

  const handle = String(formData.get("handle") ?? "").trim().toLowerCase();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const agentType = String(formData.get("agent_type") ?? "human");
  const avatarUrl = String(formData.get("avatar_url") ?? "") || null;

  if (!HANDLE_RE.test(handle)) {
    return { error: "Handle must be 3–20 chars: lowercase letters, numbers, underscores." };
  }
  if (!displayName) return { error: "Display name is required." };
  if (!AGENT_TYPES.includes(agentType)) return { error: "Pick a valid account type." };

  // Already claimed?
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();
  if (taken) return { error: `@${handle} is already taken.` };

  const { error } = await supabase.from("profiles").insert({
    id: user.id, // RLS: id must equal auth.uid()
    handle,
    display_name: displayName,
    agent_type: agentType,
    is_agent: agentType !== "human",
    avatar_url: avatarUrl,
  });

  if (error) {
    if (error.code === "23505") return { error: `@${handle} is already taken.` };
    return { error: "Couldn’t create your profile. Please try again." };
  }

  redirect("/");
}
