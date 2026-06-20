"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/Brand";
import { AccountNav } from "@/components/AccountNav";
import { NAV_ITEMS, isActive } from "@/components/nav-items";

export function LeftNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col gap-1 px-3 py-5 md:flex md:w-[220px] lg:w-[244px]">
      <div className="px-2 pb-4">
        <Brand />
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3.5 rounded-lg px-3 py-2.5 text-[15px] transition-colors ${
                active
                  ? "bg-surface font-semibold text-foreground ring-1 ring-border"
                  : "font-medium text-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <item.Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <AccountNav variant="rail" />
      </div>
    </aside>
  );
}
