# CLAUDE.md — read this before you touch anything

You are working on the Gr8ful Project website. **Read this file at the start of every
session.** It exists because several problems here have non-obvious causes, and each one
cost real time to diagnose. Reading takes a minute; rediscovering them does not.

**Keep it current.** When you learn something a future agent would waste time relearning —
a tool that isn't available, a service that behaves unexpectedly, a decision and its
reasoning — add it here in the same change. Treat that as part of the work, not a chore.

**This is the only documentation, by design.** There is no README and there shouldn't be —
every change to this site goes through an agent, so anything a human needs to know belongs
here where you'll actually read it. Don't add one.

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

**It is deployed but not launched.** Nobody is being sent to it yet, so a rough edge costs
nothing today and there's room to leave things visibly unfinished. Don't argue for urgency
on that basis — but do treat the list below as the launch checklist, because the day it
opens to the public those gaps stop being free.

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
                         PledgeForm, PledgeQuote, JamCard
  data/site.ts           nav, socials, YouTube playlist, podcast platforms
  data/events.ts         Luma types, config, fetch, and the per-page selectors
  data/jams.ts            homepage Jams card content — see "Jams cards" below
  pages/api/pledge.ts    Brevo signup endpoint
```

### Jams cards

The four cards in the homepage Jams section (`.jams-teaser__row` in
`src/pages/index.astro`) are data-driven, not hand-written markup. Content lives in
`src/data/jams.ts`, an array of `{ artistName, image, secondaryImage?, status, videoUrl? }`
objects; rendering/styling/behavior for both states lives in `src/components/JamCard.astro`.

**To swap a card's content, all that's needed is:**

```
artistName: Artist Name
image: filename.jpg          (public/ path; reused for both photo halves
                              unless a distinct secondaryImage is also given)
status: published | coming-soon
videoUrl: https://...        (published only — omitting it leaves that
                              card's Play button rendered but inert)
```

`status` drives everything else automatically:

- **`published`** — dark/navy border + artist banner, orange Play button. If `videoUrl` is
  set, the Play button is a real `target="_blank"` link; if not, it still looks active but
  is a disabled, non-clickable button (never points at a guessed URL).
- **`coming-soon`** — gray border + banner (via the `--g8-inactive` token in
  `tokens.css`, the one non-brand color in the palette, scoped to exactly this state), an
  orange "Coming Soon" overlay on the lower photo, Play button gray and permanently disabled.

All four cards currently ship as `published` with no `videoUrl`, reusing the same PDF-cropped
placeholder photos (Andy Babb + Lara Elle) — real per-artist photos/names/status/links for
cards 2-4 are still pending from the operator.

## Not finished yet

The site is live and working, but it was built from a design handoff and some seams were
never wired. **None of these are bugs to fix on sight.** Most need content or credentials
only the operator can supply, and some are deliberately left broken so the gap stays
visible — a dead link here can be a placeholder holding its position, not an oversight.
Routing around one hides work that still needs doing. Ask first, and update this list when
one gets closed.

| Gap | State |
| --- | --- |
| **Podcast RSS feed** | Not published. Several things below wait on it. |
| **Latest-episode resolver** | `/api/latest-episode` should read the feed and redirect to the newest episode. Not built, so the three "Watch the latest episode" CTAs 404 today. **This is deliberate** — the operator chose to leave the gap visible rather than paper it over with a link elsewhere. Don't "fix" it by repointing the href; build the resolver once the feed exists. |
| **Podcast platform links** | Only YouTube is real. Spotify, Apple Podcasts, and Pocket Casts point at each service's *homepage*, not the show, and the RSS chip points at an ungenerated `/feed.xml`. Same reasoning as above — left visible on purpose. |
| **Three photos** | `/about` ("Rob and the van"), `/pbj` ("sandwich line"), and the homepage podcast card ("artist mid-taping") still render dashed `g8-placeholder` frames. Waiting on real images. |
| **The van's story** | `/van` says "the real story is coming" over deliberately fake lore. Awaiting real copy. |
| **Guest book** | `/van` has a "Coming soon" panel with nothing behind it. Would need storage and moderation — a real feature, not a stub to fill in. |
| **Custom domain** | `gr8fulproject.com` is **not attached** to the Vercel project yet. Until it is, the site is only reachable at the `.vercel.app` URL. |

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
`canPlayType` before concluding anything about video. The hero's H.264 fallbacks have been
played on a real iPhone and are fine, so a `readyState: 0` on those files is the
environment, not a regression. If you need to test an MP4, have the operator open the file
URL directly on a phone — that skips source selection and tests the file itself.

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

**Pushing `main` ships to production. Pushing any other branch builds a preview.** Both run
the same workflow; the branch decides the target.

**Default to a branch and offer the preview link.** Push your work to a branch, wait for
the run, pull the deployment URL out of it, and give it to the operator so they can look at
the change on their phone before it ships. That matters more here than on most projects,
because they can see things you can't — the live site and real webfonts are both unreachable
from your container.

Getting the URL: the deploy step prints a `DEPLOY_URL=` line and writes the same URL to the
run summary. Read it with `get_job_logs`. Hand over the link itself, not instructions for
finding it.

**But it's their call, and "push to main" means push to main.** Don't insist on a preview,
don't re-ask, don't treat it as a safety issue to be negotiated. There is **no branch
protection, by design** — the operator wants a push to `main` to ship, and asked for it
explicitly. Don't propose adding protection.

The flip side is real, though: nothing stands between a mistake and production, so the
verification bar in "Before you commit" is the only safety net there is.

**Env vars** — all in Vercel, and all four are set and working. They're optional in the
schema so a missing one degrades a single feature instead of breaking the build:
`LUMA_API_KEY`, `BREVO_API_KEY`, `BREVO_LIST_ID`, and `BREVO_BOULDER_LIST_ID` (which is
live — "I live around Boulder" really does route to its own Brevo list).

> **Declare optional config as `envField.string`, never `envField.number`.** Astro validates
> the entire env schema at startup, so one mistyped numeric value returns 500 on *every*
> server-rendered page — including pages unrelated to that variable. Parse to a number in
> the route instead.

---

## Integrations

Most of what looks like site content isn't in this repo. Events live in Luma, signups in
Brevo, past jams on YouTube — so adding an event is a Luma task, not a deploy. Say so when
the operator asks how to change something; it's often not a code change at all.

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

The homepage Podcast card works the same way: the poster image + a real coded play button
(`data-podcast-play` in `index.astro`) swap in place for a `youtube-nocookie.com/embed/
videoseries?list=PLJ06EoI7HZ1c` iframe, sized to the card via inline styles (see the scoped-
CSS trap above for why). `autoplay=1` only ever fires from that click handler, never on page
load. **The playlist embed plays whatever is first in the playlist — that is NOT
automatically "most recently uploaded."** It's the playlist's own stored order, which
defaults to manual/add-order unless the playlist's sort is set to "Date added (newest)" in
YouTube Studio (a setting on the playlist itself, not something this repo controls). At the
time this was wired up the playlist held exactly one video, so there's no live multi-video
data to confirm that setting is on — **when a new episode goes up, either drag it to
position 1 in YouTube Studio, or confirm the playlist's sort order is "Date added (newest)"
so it lands there automatically.** No website code changes either way; this is a YouTube-
Studio task, not a deploy.

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

**Astro's scoped CSS never reaches elements created with `document.createElement`.**
Scoping works by stamping a `data-astro-cid-*` attribute onto every element *in that file's
own template* at build time; a node built at runtime in a `<script>` block never gets it, so
a component-scoped class rule silently matches nothing on it — no error, the element just
renders unstyled (browser defaults). Bit the Podcast play-in-place embed: the injected
`<iframe>` rendered at the browser's ~304×154 default instead of filling the card, with the
intended `.podcast-teaser__frame` rule sitting right there unmatched. Fix is to style
anything you build with `createElement` via `el.style.cssText` (or inline attributes), not a
scoped class — same issue would hit any future JS-injected element on this site.

---

## Before you commit

1. `npm run build` and `npm run check` both clean.
2. Verify the actual behaviour — browser-drive it, or mock the service and assert on what it
   received. "It compiles" is not verification.
3. For layout work, check real device widths *and* stress wider text.
4. Say plainly what you could **not** verify and why. Do not imply more confidence than you
   earned.

## Git

Work on a branch — that also gets you a preview deploy to show the operator (see Deploys).
Open a PR and squash-merge to `main` when they're happy, or push straight to `main` if
that's what they ask for.

Squash-merging leaves your local branch diverged — reset onto `origin/main` before the next
change rather than stacking onto the pre-squash commit.

Write PR bodies that explain **cause**, not just the change, and state what wasn't verified.
