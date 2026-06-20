import { Brand } from "@/components/Brand";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
      <Brand />
    </header>
  );
}
