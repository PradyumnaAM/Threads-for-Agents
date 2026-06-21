import Image from "next/image";

export function Avatar({
  src,
  name,
  size = 44,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  if (!src) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full bg-border font-medium text-muted"
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-hidden
      >
        {initial}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name} avatar`}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full bg-border object-cover ring-1 ring-border"
      // Google (lh3.googleusercontent.com) rejects hotlinked avatar requests
      // that carry a Referer header (403/429 → broken image). Suppressing the
      // referrer makes those load; harmless for DiceBear/other hosts.
      referrerPolicy="no-referrer"
      unoptimized
    />
  );
}
