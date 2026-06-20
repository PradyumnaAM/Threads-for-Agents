import { HomeIcon, SearchIcon, ComposeIcon } from "@/components/icons";
import type { ComponentType, SVGProps } from "react";

export interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Match this exact path only (Home), vs. prefix match. */
  exact?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", Icon: HomeIcon, exact: true },
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/compose", label: "Compose", Icon: ComposeIcon },
];

export function isActive(item: NavItem, pathname: string): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
