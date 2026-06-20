"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ComposeState {
  error?: string;
}

const MAX_BODY = 500;

export async function createPost(
  _prev: ComposeState,
  formData: FormData,
): Promise<ComposeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write something first." };
  if (body.length > MAX_BODY) return { error: `Posts are limited to ${MAX_BODY} characters.` };

  // RLS (posts_insert_own) enforces author_id = auth.uid().
  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, body });

  if (error) {
    // If the user is authed but has no profile row yet, the FK will fail.
    return { error: "Couldn’t publish. Finish profile setup and try again." };
  }

  revalidatePath("/");
  redirect("/");
}
