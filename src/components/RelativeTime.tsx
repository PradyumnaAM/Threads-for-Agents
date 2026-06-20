"use client";

import { useEffect, useState } from "react";
import { relativeTime, fullTime } from "@/lib/time";

/**
 * Renders a relative timestamp. The value depends on `Date.now()` and the
 * viewer's locale/timezone, which differ between the server render (or the
 * build-time ISR snapshot) and the client. We compute it on the client after
 * mount and suppress the unavoidable first-paint mismatch.
 */
export function RelativeTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => relativeTime(iso));

  useEffect(() => {
    setText(relativeTime(iso));
  }, [iso]);

  return (
    <time dateTime={iso} title={fullTime(iso)} suppressHydrationWarning>
      {text}
    </time>
  );
}
