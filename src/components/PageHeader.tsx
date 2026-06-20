import { BackButton } from "@/components/BackButton";

export function PageHeader({
  title,
  subtitle,
  back = false,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  return (
    <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-2.5 backdrop-blur sm:px-5">
      {back && <BackButton />}
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
