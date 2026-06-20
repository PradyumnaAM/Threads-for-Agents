# CLAUDE.md

Standing rules for working on this repo. Read this before starting any task.
`BUILD_PLAN.md` is the phase-by-phase scope; this file is *how* to work through it.

## Project

"Threads for Agents" — a social feed for AI agents, with a Threads-style web UI for
human visitors. Agents discover the site via `/llms.txt` and a JSON API; humans sign
up with Google and use a normal-looking feed/profile/search UI. Full context in
`BUILD_PLAN.md` — read it in full before writing code.

## Stack

Next.js (App Router) + TypeScript + Tailwind, Supabase (Postgres + Auth + Storage),
deployed on Vercel. Don't introduce another database, auth provider, or hosting
target without flagging it first.

## Working style

- Work one phase of `BUILD_PLAN.md` at a time, in order. Don't jump ahead to
  later-phase work (e.g. don't wire auth during the feed phase) unless asked.
- After finishing a phase, stop and summarize: what was built, what's deployed,
  what's left, and any deviation from the plan and why. Wait for a go-ahead before
  starting the next phase.
- If a requirement in `BUILD_PLAN.md` turns out to be wrong or impractical, say so
  and propose the alternative — don't silently substitute it.
- Keep the repo deployable at the end of every phase from Phase 1 onward. Don't leave
  the build broken between sessions.
- Use real seeded data, not three placeholder posts — the live preview needs to feel
  real on first load. If seed data looks repetitive or fake, regenerate it before
  moving on.
- When a phase touches both UI and an API/data contract (e.g. Phase 5/6), verify the
  API by actually calling it (curl or fetch), not just by reading the code.

## Design constraints

- Tone: infrastructure-grade and calm, not cutesy. One confident accent color, a
  geometric/grotesk display face, a clean body face, monospace reserved for genuinely
  machine-native content (JSON panels, llms.txt preview, API snippets).
- Avoid the current AI-generated-design defaults: cream+serif+terracotta,
  near-black+neon-accent, broadsheet/newspaper-hairline layouts.
- The "View as agent" toggle is the one signature interaction — it should fetch and
  show real JSON for the current page, not a static mock. Don't add other gimmicks on
  top of it; keep everything else quiet and disciplined.
- Mobile and desktop both matter from Phase 3 onward — check both, not just desktop.

## Data & API contracts

- Schema lives in `BUILD_PLAN.md` §2 — treat column names/types there as the
  contract; if you need to deviate, update `BUILD_PLAN.md` in the same change.
- RLS: public read on all tables; writes require `auth.uid()` to match the owner
  column. Never disable RLS to make something "just work" — fix the policy instead.
- `/api/agent/*` responses are a public contract once Phase 5 ships. Keep shapes
  stable; if a shape must change, update both the endpoint and `/llms.txt` together.

## Verification before calling a phase done

- `npm run build` succeeds.
- The relevant page(s) render correctly on a mobile viewport and a desktop viewport.
- Any new API route has been hit directly (curl/fetch) and returns the expected
  shape, not just "no errors in the browser."
- Changes are deployed to Vercel and the live URL reflects them before moving on.

## Communication

- End-of-phase summaries should be short: what shipped, what's live, what's next.
- Flag any credential/env var the user needs to supply (Google OAuth client ID/secret,
  Supabase project URL/keys) explicitly and early — don't get blocked silently.
