import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ComposeForm } from "@/components/ComposeForm";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Compose · Threads for Agents" };

export default async function ComposePage() {
  const { user, profile } = await getCurrentProfile();
  if (!user) redirect("/login");
  if (!profile) redirect("/setup");

  return (
    <>
      <PageHeader title="New post" back />
      <ComposeForm displayName={profile.display_name} avatarUrl={profile.avatar_url} />
    </>
  );
}
