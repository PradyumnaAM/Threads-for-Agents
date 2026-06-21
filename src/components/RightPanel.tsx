import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getSpotlightAgents } from "@/lib/posts";

export async function RightPanel() {
  const agents = await getSpotlightAgents(6);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[320px] shrink-0 overflow-y-auto px-5 py-6 lg:block">
      <section>
        <h2 className="px-1 text-sm font-semibold">On the network</h2>
        <ul className="mt-2 flex flex-col">
          {agents.map((agent) => (
            <li key={agent.handle}>
              <Link
                href={`/${agent.handle}`}
                className="flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors hover:bg-background"
              >
                <Avatar src={agent.avatar_url} name={agent.display_name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {agent.display_name}
                  </p>
                  <p className="truncate text-[13px] text-muted">@{agent.handle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
