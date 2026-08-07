# CLAUDE.md — read this before you touch anything

You are working on the Gr8ful Project website. **Read this file at the start of every
session.** It exists because several problems here have non-obvious causes, and each one
cost real time to diagnose. Reading takes a minute; rediscovering them does not.

**Keep it current.** When you learn something a future agent would waste time relearning —
a tool that isn't available, a service that behaves unexpectedly, a decision and its
reasoning — add it here in the same change. Treat that as part of the work, not a chore.

`IMPLEMENTATION.md` documents the original design handoff and the route-to-mockup mapping.
It is still useful for that, but parts have gone stale: the Luma feed is no longer sample
data, and `npm run preview` no longer works (see Commands).

---

## Who you are working with

The person directing you generally **does not write code**. This shapes how you work more
than anything else in this file.

**Do the verification yourself.** Do not ask them to run a command, read a log, check a
build, or interpret an error. If you need to know whether something works, find out. You
have a browser (Playwright), a shell, and the ability to stand up mock servers. Use them.

**Explain in plain language.** Lead with what changed and whether it works. Keep jargon out
of the first sentence. They do not need the mechanism unless it affects a decision they
have to make — and when it does, explain the *consequence*, not the implementation.

**Recommend; don't present menus.** "Here are four options" puts the burden on someone
without the background to weigh them. Pick the one you'd defend, say why in a sentence, and
note what it costs.

**But they are the authority on how it looks and reads.** Copy, design, priorities, and
money are theirs. And on one technical axis they beat you outright: **they can see the real
site on a real phone and you cannot.** When something visual is in question, their
screenshot is better evidence than your measurement. Ask for it.

**Never make them the safety net.** Assume nobody will catch a mistake in review. Build,
typecheck, and verify before you commit — every time.

---

## What this is

Astro static site deployed to Vercel, in the **`gr8ful` team** (not the account the Vercel
MCP is signed into — see Tooling access gaps). The deployment URL is
`gr8fulproject-site-nine.vercel.app`; `astro.config.mjs` sets `site` to
`https://gr8fulproject.com`, so confirm with the operator which domain is actually serving
before assuming.

Mostly prerendered. **Four pages are server-rendered** because they show live Luma events —
they carry `export const prerender = false`:

- `/` (homepage events strip)
- `/jams`
- `/pbj`
- `/pledge/thanks`

Everything else builds to static HTML. `/api/pledge` is a server route too.

```
src/
  styles/tokens.css      design tokens (colours, spacing, shadows) — g8- prefix
  styles/global.css      shared primitives: type, buttons, cards, grids
  layouts/BaseLayout     head, fonts, header + footer
  components/            SiteHeader, SiteFooter, ColorRibbon, EventCard,
                         PledgeForm, PledgeQuote
  data/site.ts           nav, socials, YouTube playlist, podcast platforms
  data/events.ts         Luma types, config, fetch, and the per-page selectors
  pages/api/pledge.ts    Brevo signup endpoint
```

## Commands

```bash
npm run dev      # http://localhost:4321
npm run build    # must pass before committing
npm run check    # astro + TypeScript diagnostics — must pass before committing
```

`npm run preview` **does not work** — the Vercel adapter doesn't support it. Use `npm run dev`
to exercise server-rendered pages.

`astro dev` runs as a daemon and **refuses to start a second instance**. Stop it first:

```bash
npx astro dev stop
```

Never `pkill -f "astro dev"` — the pattern matches your own shell command and kills your
session. This has happened.

---

## Environment limits — read before you trust a test

This container's network policy blocks a lot. Diagnose with:

```bash
curl -sS "$HTTPS_PROXY/__agentproxy/status"
```

**Blocked:** `lu.ma` / `api.lu.ma` / `public-api.luma.com`, `fonts.googleapis.com`,
`*.vercel.app` (including the live site), `youtube.com`.

The consequences are easy to miss:

- **You cannot load the live site.** Deploy status comes from GitHub Actions; anything
  visual on production has to come from the operator.
- **Webfonts do not load, so every layout measurement uses narrow fallback fonts.** The real
  Instrument Serif / Jost / Poppins are wider. A layout that measures fine here can overflow
  on a real phone. This caused three failed rounds of "fixed" mobile bugs. If you are
  measuring layout, stress-test with wider text before believing yourself:
  `page.addStyleTag({ content: '*{letter-spacing:0.08em !important}' })`, or bump font-size
  20%, or substitute a wide serif.
- **You cannot reach Luma or Brevo.** Test against a local mock server instead — point the
  API base at `localhost`, run the real code path, assert on what the mock received, then
  revert the patch. See the pattern used for both integrations in git history.

**Chromium here has no H.264.** MP4 video will not play in tests and reports
`readyState: 0`. AV1/WebM does work. This is a codec limitation, not a site bug — check
`canPlayType` before concluding anything about video.

**No ffmpeg/ffprobe**, and `apt-get install ffmpeg` fails. To inspect media, parse the
containers directly (the AV1 config lives in the WebM `CodecPrivate`; H.264 profile/level in
the MP4 `avcC` box) or use Pillow for images.

**Playwright** is installed globally and is CommonJS:

```js
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pw;
```

Use **real device emulation** for anything mobile — `pw.devices['iPhone 13']`. A desktop
browser at a narrow viewport does not reproduce mobile viewport behaviour.

**Tooling access gaps.** The GitHub integration cannot trigger, re-run, or cancel workflow
runs (403) — ask the operator to click. The Vercel MCP is authenticated to a *different*
team than the one owning this project, so it cannot read this project's logs or
deployments. `mcp__github__actions_list` output often exceeds the token limit; parse the
saved JSON file with Python instead.

---

## Deploys and secrets

Deploys run through **GitHub Actions**, not Vercel's git integration, because the Vercel
account isn't linked to this GitHub account. `.github/workflows/deploy-vercel.yml` runs
`vercel deploy` with a token.

Two consequences that matter:

- The workflow **deletes `.git` before deploying**. Do not remove that. Without it, Vercel
  blocks the deployment because the commit author can't be matched to the Vercel account.
- **Vercel does the build, so environment variables live in the Vercel project settings —
  not GitHub secrets.** GitHub only holds `VERCEL_TOKEN`. Getting this backwards will waste
  the operator's time.

Every push to `main` deploys to production. There is no staging.

**Env vars** (all in Vercel, all optional in the schema so a missing one degrades one
feature instead of breaking the build): `LUMA_API_KEY`, `BREVO_API_KEY`, `BREVO_LIST_ID`,
`BREVO_BOULDER_LIST_ID`.

> **Declare optional config as `envField.string`, never `envField.number`.** Astro validates
> the entire env schema at startup, so one mistyped numeric value returns 500 on *every*
> server-rendered page — including pages unrelated to that variable. Parse to a number in
> the route instead.

---

## Integrations

**Luma** (`src/data/events.ts`) — events are fetched at request time on the four SSR pages.
Calendar `cal-5Jvx9o7XeW0VVca`. Two API hosts are tried in order. `kind` (Gr8ful Jam vs PB&J
Service) reads the event's Luma **tags** first and falls back to matching the title. Times
format in the event's own timezone. If Luma is unreachable the page still renders with a
short "see the full calendar" note rather than a 500 — **never make an outage look like an
empty calendar without saying so.** Responses carry a CDN cache with
`max-age=0, must-revalidate` so browsers always revalidate.

**Brevo** (`src/pages/api/pledge.ts`) — pledge signups. Works **with and without
JavaScript**: JS posts JSON and shows errors inline without losing what was typed; without
JS the browser posts natively and gets a 303. Preserve both paths. On failure the thanks
page says "Almost." with a mailto fallback — **it must never tell someone they're subscribed
when they aren't.** There's a honeypot field guarding what is otherwise an open endpoint
writing to a mailing list; keep it.

> Brevo offers API-key IP allowlisting. **Leave it off.** Vercel Hobby has no static egress
> IP, so enabling it would break signups intermittently.

**YouTube** — the past-jams playlist embeds from `youtube-nocookie.com` so no tracking
cookies are set until someone presses play. Keep it that way, and keep the visible
"watch on YouTube" link so the section is never a dead end if the embed fails.

---

## Design system and layout traps

Tokens and primitives are `g8-` prefixed and live in `styles/`. Prefer them over new values.
Match the surrounding code's comment density and naming.

**Naming rule:** always "Gr8ful Project", never "Gr8ful" alone. Product names keep their
form: The Gr8ful Pledge, The Gr8ful Podcast, Gr8ful Jams, PB&J Service.

Two bugs bit repeatedly. Both are fixed globally — don't reintroduce them:

- **Grid items default to `min-width: auto`.** One stubborn child (an `<input>` holding its
  ~20-character intrinsic width) can force a track wider than its container, so the row
  overflows right while the left edge stays pinned to the gutter — which reads as
  "off-centre", not "too wide". `.g8-grid-2 > *` and `.g8-grid-3 > *` now set `min-width: 0`.
- **`.g8-card--shadow` casts a hard `6px 6px` shadow.** Side by side it falls into the
  column gap; stacked it eats the right gutter. Stacked cards inset by the shadow offset.

**Component scoped styles beat two-class global rules.** Astro compiles them with an
attribute selector, so `.quote { margin: 0 }` silently overrides `.g8-grid-2 > .g8-card--shadow`.
Check specificity when a global rule appears to do nothing.

**`getBoundingClientRect()` excludes shadows**, and Chromium clips leftward overflow
silently. Neither shows up in naive measurements.

---

## Before you commit

1. `npm run build` and `npm run check` both clean.
2. Verify the actual behaviour — browser-drive it, or mock the service and assert on what it
   received. "It compiles" is not verification.
3. For layout work, check real device widths *and* stress wider text.
4. Say plainly what you could **not** verify and why. Do not imply more confidence than you
   earned.

## Git

Work on a branch, open a PR, squash-merge to `main`. Note that squash-merging leaves your
local branch diverged — reset onto `origin/main` before the next change rather than stacking
onto the pre-squash commit.

Write PR bodies that explain **cause**, not just the change, and state what wasn't verified.
