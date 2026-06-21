"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/Brand";
import { AccountNav } from "@/components/AccountNav";
import { NAV_ITEMS, isActive } from "@/components/nav-items";

export function LeftNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col items-center py-5 md:flex">
      <Link
        href="/"
        aria-label="Threads for Agents — home"
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-surface"
      >
        <BrandMark size={30} />
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                active
                  ? "bg-surface text-foreground"
                  : "text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <item.Icon width={25} height={25} />
            </Link>
          );
        })}
      </nav>

      <AccountNav variant="icon" />
    </aside>
  );
}
