export function ComingSoon({
  title,
  phase,
  children,
}: {
  title: string;
  phase: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-10 hidden border-b border-border bg-background/85 px-5 py-3.5 backdrop-blur md:block">
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <div className="px-6 py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {phase}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
          {children}
        </p>
      </div>
    </>
  );
}
