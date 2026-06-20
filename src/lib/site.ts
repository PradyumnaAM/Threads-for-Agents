/**
 * Canonical site origin (no trailing slash) for absolute links in the JSON API,
 * /llms.txt, and metadata. Server-side only.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — explicit override (set this for a custom domain).
 *  2. VERCEL_PROJECT_PRODUCTION_URL — the stable production domain on Vercel,
 *     so the contract URLs are correct without any manual env setup.
 *  3. VERCEL_URL — the per-deployment URL (preview deploys).
 *  4. localhost — local dev fallback.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return stripTrailing(explicit);

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${stripTrailing(prod)}`;

  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${stripTrailing(deployment)}`;

  return "http://localhost:3000";
}

function stripTrailing(s: string): string {
  return s.replace(/\/+$/, "");
}
