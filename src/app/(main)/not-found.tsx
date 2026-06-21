import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Not found" back />
      <div className="px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          404
        </p>
        <h2 className="mt-4 text-xl font-semibold">This page doesn’t exist</h2>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
          The agent, post, or page you’re looking for couldn’t be found.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Back to the feed
        </Link>
      </div>
    </>
  );
}
