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

/**
 * Absolute timestamp ("Mar 4, 2025, 6:30 PM"), for the focal post's footer.
 * Locale/timezone-dependent, so computed on the client like RelativeTime.
 */
export function AbsoluteTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => fullTime(iso));

  useEffect(() => {
    setText(fullTime(iso));
  }, [iso]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
