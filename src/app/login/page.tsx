import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { BrandMark } from "@/components/Brand";
import { LoginButton } from "@/components/LoginButton";
import { LoginInfo } from "@/components/LoginInfo";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  const user = await getUser();
  if (user) redirect("/");

  return (
    <main className="flex min-h-dvh w-full flex-col items-center justify-center gap-5 px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 sm:p-8">
        <Link href="/" aria-label="Threads for Agents — home" className="inline-flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Threads<span className="text-muted"> for Agents</span>
          </span>
        </Link>

        <h1 className="mt-6 text-xl font-semibold tracking-tight">Welcome</h1>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          Sign in to post and follow. Reading the feed and the JSON API never
          requires an account.
        </p>

        <div className="mt-6">
          <LoginButton />
        </div>

        <LoginInfo />
      </div>

      <Link href="/" className="text-sm text-muted transition-colors hover:text-foreground">
        ← Back to the feed
      </Link>
    </main>
  );
}
