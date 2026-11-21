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
`gr8fulproject-site-nine.vercel.app`. The operator has confirmed the real production domain
is **`https://www.gr8fulproject.org`** (not `.com`, and with the `www` — this superseded an
earlier `gr8fulproject.com` value that was never actually confirmed); `astro.config.mjs`'s
`site` is set to that. **That domain is attached and serving this site** — checked
2026-11-21: `www.gr8fulproject.org` answers from Vercel with the same build (identical asset
hashes) as the `.vercel.app` URL, and `/van` redirects there. The old Webflow site no longer
serves it. (This file used to say the opposite; the cutover happened without the note being
updated.)

**Launch status is unconfirmed.** This file used to say "deployed but not launched", written
when only the `.vercel.app` URL existed. Now that the real domain serves it, ask the operator
before assuming rough edges are free. Either way, treat "Not finished yet" below as the
launch checklist.

**Every page is prerendered to static HTML** — `/`, `/about`, `/privacy`, `/404`. The only
server code is the two API routes, `/api/join-pledge` (live) and `/api/pledge` (dormant).
The homepage used to be server-rendered to show live Luma events; the redesign dropped that
strip, and nothing imports `data/events.ts` any more. The Luma code is dormant, not deleted,
in case live events come back — and if they do, that page needs
`export const prerender = false` again.

```
src/
  styles/tokens.css        design tokens (colours, spacing, shadows) — g8- prefix
  styles/global.css        shared primitives: type, buttons, cards, grids
  layouts/BaseLayout       head, fonts, OG/Twitter tags, header + footer
  pages/index.astro        homepage: hero, #podcast, #jams, #seva, then #join
  pages/about.astro        founder letter
  pages/privacy.astro      privacy page (copy shared with footer modal via data/privacy.ts)
  pages/api/join-pledge.ts LIVE — Join modal → notification email via Brevo
  pages/api/pledge.ts      DORMANT — Brevo mailing-list signup, nothing posts to it
  components/              SiteHeader, SiteFooter, ColorRibbon, JamCard,
                           JoinProjectSection (live);
                           EventCard, PledgeForm, PledgeQuote, JamCardLegacy (dormant —
                           not imported by any page)
  data/site.ts             nav, socials, contact email, playlist IDs, podcast platforms
  data/jams.ts             homepage Jams card content — see "Jams cards" below
  data/jamsLegacy.ts       data for the dormant JamCardLegacy design
  data/events.ts           DORMANT — Luma fetch and selectors
```

**`design-reference/` is git-ignored** (94 MB: the approved mockup PDF
`website-mockup-final.pdf` plus per-section assets). Comments throughout cite it as the
source of measurements and colours, but it only exists on the machine it was copied to — a
fresh clone won't have it. Ask the operator for a copy if you need it.

### Jams cards

The four cards in the homepage Jams section (`.jams-teaser__row` in
`src/pages/index.astro`) are data-driven. Content lives in `src/data/jams.ts`; rendering in
`src/components/JamCard.astro`. **Each card is one complete flattened artwork image** from
Rob (photo, name band and — for a playable card — the Play button are all baked in), served
as WebP beside its untouched PNG master in `public/`. All four are 787×1352; the component's
`aspect-ratio` matches, so change both together if a future asset differs.

```
artistName: Artist Name
image: /filename.webp         (the whole visible card)
status: published | coming-soon
videoUrl: https://...         (published only)
hotspot: { left, top, width, height }
                              (published only — percentages of the image's own
                               natural size, locating the baked-in Play button)
```

A published card with both `videoUrl` and `hotspot` gets a transparent, keyboard-reachable
`target="_blank"` link over its Play button. Without both it's just artwork. Coming-soon
artwork has no Play button, so it never gets a hotspot.

Current state: card 1 (Andy Babb + Lara Elle) is published with a working video; Sierra
Marin, Noah Proudfoot and Tubby Love are coming-soon. The Noah Proudfoot file is spelled
`proudfood` — Rob's filename, kept as-is.

The previous CSS-built design (separate photos, live text band, CSS Play button, gray
coming-soon state via `--g8-inactive`) is `JamCardLegacy.astro` + `jamsLegacy.ts`, kept for
revert — steps are in that component's header comment.

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
| **Latest-episode resolver** | `/api/latest-episode` should read the feed and redirect to the newest episode. Not built. `latestEpisodeUrl` in `site.ts` still points at it, but after the redesign **no page renders a "Watch the latest episode" CTA**, so nothing visibly 404s today. The operator's earlier choice was to leave such links pointing at the unbuilt route rather than somewhere else — don't repoint them; build the resolver once the feed exists. |
| **Podcast platform links** | `podcastPlatforms` in `src/data/site.ts` (Spotify/Apple Podcasts/Pocket Casts homepages, plus an RSS chip pointing at an ungenerated `/feed.xml`) isn't rendered anywhere right now — its only consumer was the old standalone `/podcast` page, which is gone (see the legacy-routes row below). Left in place, dormant, for whenever podcast platform links come back; not a live broken link today. |
| **Podcast card image** | The homepage podcast card shows `podcast-still-prototype.jpg`, a crop from the mockup PDF flagged in code as temporary. Waiting on a real episode photo. (No page renders a dashed `g8-placeholder` frame any more; `/about` now uses `RobbieDob-about.png`.) |
| **Seva stats** | "16 Events / 652 Lunches Served, As of August 25, 2026" is typed into `index.astro` by hand, not computed from Luma. Update it by hand. |
| **Join pledges aren't on a mailing list** | `/api/join-pledge` only emails each pledge to `hello@gr8fulproject.org` (BCC `kbonomo@gr8fulproject.org`, marked in code as temporary testing). Nobody is added to a Brevo list automatically. Whether that's the intended process is unconfirmed. |
| **No spam protection on `/api/join-pledge`** | No honeypot or rate limit, unlike `/api/pledge`. Anyone can script it to send unlimited emails through the Brevo account. |
| **Dependencies** | `npm audit` (2026-11-21): 20 vulnerabilities, 1 critical (in `astro` 7.1.6; 7.4.13 available). Upgrade within the current majors, then build, check and click through. |
| **Contact email** | `site.contactEmail` (footer and `/privacy`) is `hello@gr8fulproject.com`, while every other address is `.org`. Probably wrong — confirm with the operator. |
| **Privacy copy** | Marked in `data/privacy.ts` as draft boilerplate needing legal review before launch. |
| **`/van`, `/jams`, `/podcast`, `/events`, `/service`, `/pbj`, `/pledge`, `/pledge/thanks`** | None of these are real pages any more — their `src/pages/*.astro` files were deleted (git history has them) and each URL now 302s to `/` or a homepage section instead (see `redirects` in `astro.config.mjs`). Temporary, not permanent, since any of them may become a real standalone page again — don't "fix" a 404 report for one of these by re-adding a page without checking whether a redirect already covers it on purpose. `/service` never had a page in this codebase to begin with; the rest did. Retiring `/pledge` and `/pledge/thanks` did **not** touch `PledgeForm.astro`, `EventCard.astro`, or `/api/pledge` (Brevo) — all still intact, just no longer reachable via a standalone page; `/api/pledge`'s own success/failure redirect now points at `/#join` instead of the retired thanks page. The current homepage "Join the Project" experience (`#join`, `JoinProjectSection.astro`) is a separate, already-working flow posting to `/api/join-pledge`, unaffected either way. |
| **Unused files in `public/`** | Not referenced by any source file: `Live_Happier.png`, `hero-540.{mp4,webm}`, `hero-720.{mp4,webm}`, `hero-poster.jpg`, `van-photo.jpg`, `join-still-pledge-prototype.jpg`, `join-still-welcome-prototype.jpg`. (The `jam_*.png` files are intentional masters for the WebP copies.) Ask before deleting — some may be wanted later. |

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

**This section describes one specific environment** — the sandboxed cloud container most of
this site was built in. Other setups differ: on the operator's Mac (checked 2026-11-21) the
live site and `*.vercel.app` were reachable, there was no Playwright at the path below, and
the `gh` CLI wasn't installed. Check what your own environment can do before relying on any
of this. The webfont point applies everywhere a browser can't load Google Fonts.

That container's network policy blocks a lot. Diagnose with:

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
`canPlayType` before concluding anything about video. The redesigned hero now uses **only**
H.264 MP4s (`hero-bw-portrait.mp4` under 768px, `hero-bw-landscape.mp4` above), so in that
container it won't play at all. The earlier hero's H.264 fallbacks were played on a real
iPhone and were fine, so a `readyState: 0` on those files is the
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
because they can see things you can't — a real phone with real webfonts, and in some
environments the live site itself.

Getting the URL: the deploy step prints a `DEPLOY_URL=` line and writes the same URL to the
run summary. Read it with `get_job_logs`. Hand over the link itself, not instructions for
finding it.

**But it's their call, and "push to main" means push to main.** Don't insist on a preview,
don't re-ask, don't treat it as a safety issue to be negotiated. There is **no branch
protection, by design** — the operator wants a push to `main` to ship, and asked for it
explicitly. Don't propose adding protection.

The flip side is real, though: nothing stands between a mistake and production, so the
verification bar in "Before you commit" is the only safety net there is.

**Env vars** — all in Vercel, and all four were reported set and working. They're optional
in the schema so a missing one degrades a single feature instead of breaking the build:
`LUMA_API_KEY`, `BREVO_API_KEY`, `BREVO_LIST_ID`, and `BREVO_BOULDER_LIST_ID`. Today only
`BREVO_API_KEY` is actually read by live code (`/api/join-pledge`); the Luma key and both
list IDs belong to dormant code.

> **Declare optional config as `envField.string`, never `envField.number`.** Astro validates
> the entire env schema at startup, so one mistyped numeric value returns 500 on *every*
> server-rendered page — including pages unrelated to that variable. Parse to a number in
> the route instead.

---

## Integrations

Some of what looks like site content isn't in this repo — pledges arrive by email via
Brevo, and the podcast and past jams live on YouTube. Say so when the operator asks how to
change something; it's often not a code change at all. (Events used to come from Luma too;
see below — today the only event-related content is the hand-typed Seva stats.)

**Brevo — Join pledge (live)** (`src/pages/api/join-pledge.ts`) — the `#join` modal in
`JoinProjectSection.astro` posts JSON `{ firstName, email, zip, invites }`. The route sends
**one transactional email** through Brevo's `/v3/smtp/email`: from
`robbiedob@gr8fulproject.org` (a verified Brevo sender), to `hello@gr8fulproject.org`, BCC
`kbonomo@gr8fulproject.org` (temporary), Reply-To the submitter. It never touches Brevo
Contacts or Lists. ZIP stays a string so leading zeros survive; input is HTML-escaped; logs
never include the submitter's details. JS-only — the modal has no native-form fallback. The
welcome view opens only after the server confirms the send; **it must never tell someone
they've pledged when the send failed.**

**Luma (dormant)** (`src/data/events.ts`) — nothing imports this today; it fed the old
homepage events strip and the retired `/jams` and `/pbj` pages. Calendar `cal-5Jvx9o7XeW0VVca`. Two API hosts are tried in order. `kind` (Gr8ful Jam vs PB&J
Service) reads the event's Luma **tags** first and falls back to matching the title. Times
format in the event's own timezone. If Luma is unreachable the page still renders with a
short "see the full calendar" note rather than a 500 — **never make an outage look like an
empty calendar without saying so.** Responses carry a CDN cache with
`max-age=0, must-revalidate` so browsers always revalidate.

**Brevo — mailing-list signup (dormant)** (`src/pages/api/pledge.ts`) — adds a Brevo
contact to `BREVO_LIST_ID`, plus `BREVO_BOULDER_LIST_ID` for "near Boulder". Nothing posts
to it today: its form, `PledgeForm.astro`, isn't rendered anywhere. If it's revived, keep
what it already does: works **with and without JavaScript** (JSON with inline errors, or a
native post that gets a 303 to `/#join`, with `?pledge=error` on failure), never reports
success on failure, and has a honeypot field (`website`) — keep it.

> Brevo offers API-key IP allowlisting. **Leave it off.** Vercel Hobby has no static egress
> IP, so enabling it would break signups intermittently.

**YouTube** — any embed uses `youtube-nocookie.com` so no tracking cookies are set until
someone presses play, and sits beside a visible link to YouTube so the section is never a
dead end if the embed fails. Keep both. Jams card 1's hotspot opens video `iaSnPzfVWRY`, and
"See all JAMS" links to playlist `PLJNrF11lrZ3g` (the old `/jams` page's embed of it is
gone).

The homepage Podcast card: the poster image + a real coded play button
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

**Fonts and the Keynote design.** The redesign came from a Keynote deck (exported as the
mockup PDF in `design-reference/`). `BaseLayout.astro` loads Instrument Serif, Inter, Jost
and Poppins from Google Fonts. Inter stands in for the deck's Helvetica Neue on interface
chrome and is used on `/about`; Instrument Serif and Poppins remain because `/privacy` and
shared primitives still use them. Reconciling those older faces with the Keynote's type is
an open design question for the operator, not settled. `tokens.css` also names Yeseva One
and Futura, which are **not** loaded and fall back to system fonts.

**Some code comments are stale.** `JoinProjectSection.astro`'s header still calls the Join
modal a local-only prototype that submits nowhere — it now posts to `/api/join-pledge` and
sends real email. `site.ts` says the jams playlist is "embedded on /jams" (that page is
gone) and that every "Watch the latest episode" CTA points at `latestEpisodeUrl` (none is
rendered now). Trust the code over those comments, and fix them when you next touch the
file.

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
