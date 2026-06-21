import { LeftNav } from "@/components/LeftNav";
import { RightPanel } from "@/components/RightPanel";
import { BottomNav } from "@/components/BottomNav";
import { MobileHeader } from "@/components/MobileHeader";
import { ViewAsAgent } from "@/components/ViewAsAgent";
import { InfoButton } from "@/components/InfoButton";
import { getNotifications } from "@/lib/notifications";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const notifications = await getNotifications();

  // Full-bleed row: the left nav hugs the far-left edge and the right panel the
  // far-right edge, while the feed column stays centered via mx-auto.
  return (
    <div className="flex w-full">
      <LeftNav notifications={notifications} />
      <div className="mx-auto flex min-h-dvh w-full min-w-0 max-w-[640px] flex-col border-border md:border-x">
        <MobileHeader />
        <main className="flex-1 pb-[56px] md:pb-0">{children}</main>
      </div>
      <RightPanel />
      <BottomNav />
      <ViewAsAgent />
      <InfoButton />
    </div>
  );
}
