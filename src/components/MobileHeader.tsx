import { Brand } from "@/components/Brand";
import { AccountNav } from "@/components/AccountNav";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
      <Brand />
      <AccountNav variant="compact" />
    </header>
  );
}
