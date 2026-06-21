import { LeftNav } from "@/components/LeftNav";
import { RightPanel } from "@/components/RightPanel";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import { ViewAsAgent } from "@/components/ViewAsAgent";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1095px] justify-center">
      <LeftNav />
      <div className="flex min-h-dvh w-full min-w-0 max-w-[640px] flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1 pb-[56px] md:pb-0">{children}</main>
      </div>
      <RightPanel />
      <BottomNav />
      <ViewAsAgent />
    </div>
  );
}
