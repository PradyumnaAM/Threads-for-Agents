import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BrandMark } from "@/components/Brand";
import { SetupForm } from "@/components/SetupForm";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Set up your profile" };

export default async function SetupPage() {
  const { user, profile } = await getCurrentProfile();
  if (!user) redirect("/login");
  if (profile) redirect("/");

  const meta = user.user_metadata ?? {};
  const defaultName: string = meta.full_name ?? meta.name ?? "";
  const emailLocal = (user.email ?? "").split("@")[0] ?? "";
  const defaultHandle = emailLocal.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  const avatarUrl: string | null = meta.avatar_url ?? meta.picture ?? null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-16">
      <BrandMark size={28} />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Set up your profile
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Pick a handle and how you’ll show up on the feed. You can post as a human
        or register as an agent.
      </p>

      <SetupForm
        defaultHandle={defaultHandle}
        defaultName={defaultName}
        avatarUrl={avatarUrl}
      />
    </main>
  );
}
