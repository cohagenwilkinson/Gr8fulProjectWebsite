# Gr8ful Project — site implementation

> **Start with [`CLAUDE.md`](./CLAUDE.md).** This file records the original design handoff
> and the route-to-mockup mapping, which is still accurate. Some of the rest has aged:
> the Luma feed is live rather than sample data, `npm run preview` no longer works, and the
> seams listed at the end are wired. `CLAUDE.md` describes the site as it stands.

The Claude Design handoff in `project/` built as an Astro static site. Design files are
left in place, untouched, as the reference.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to dist/
npm run preview
npm run check    # astro + TypeScript diagnostics
```

## Routes

| Route            | Source design                    |
| ---------------- | -------------------------------- |
| `/`              | `project/Home.dc.html`           |
| `/pledge`        | `project/Site Pages.dc.html`     |
| `/pledge/thanks` | ″                                |
| `/podcast`       | ″                                |
| `/jams`          | ″                                |
| `/pbj`           | ″                                |
| `/events`        | ″                                |
| `/van`           | ″                                |
| `/about`         | ″                                |
| `/privacy`       | ″                                |
| `404`            | ″                                |

## Structure

```
src/
  styles/tokens.css     # gr8ful-tokens.css verbatim (paper URL rewritten for public/)
  styles/global.css     # design-language primitives: type, buttons, cards, grids
  layouts/BaseLayout    # head, fonts, paper ground, header + footer
  components/           # SiteHeader, SiteFooter, ColorRibbon, EventCard,
                        # PledgeForm, PledgeQuote
  data/site.ts          # nav, socials, podcast platforms, latest-episode link
  data/events.ts        # Luma event shape + sample feed, filtered per page
  pages/                # one file per route
```

Colour, type, spacing and radius all resolve through the tokens. Paper grain is on
`.g8-ground` only — the backmost light layer — never under Midnight, Deep Teal or any
saturated fill, per the design language.

## Fidelity notes

- Desktop (≥1024px) renders the prototype's values exactly. Below that, grids stack,
  display type steps down, and the nav collapses behind a Menu toggle. The prototypes
  were drawn desktop-only, so all small-screen behaviour is an extension of the system,
  not a copy of a drawn screen.
- Dropped from the prototype: the jump bar and the `/pledge`-style URL label strips at
  the top of each section. Those are Claude Design scaffolding for stacking screens in
  one file, not site chrome.
- Event card CTAs are pinned to the card foot (`margin-top:auto`), as on the home-page
  design, so a row of cards with uneven Luma titles lines up.
- The nav still has no active-page indicator — that question was raised in the design
  chat and never answered, so nothing was invented.

## Seams still to wire

- **Luma feed** — `src/data/events.ts` holds the shape and sample data. Replace the
  `events` array with a build-time fetch; `upcomingJams`, `upcomingService`, `nextEvent`
  and `homeEvents` derive from it. `kind` is ours (program name); `title` and `when`
  come from Luma. Titles clamp at three lines and the date always renders.
- **Podcast RSS** — `latestEpisodeUrl` in `src/data/site.ts` backs both "Watch the latest
  episode" CTAs. Platform chip hrefs are placeholders pending the real show URLs.
- **Pledge form** — `src/components/PledgeForm.astro` prevents default and routes to
  `/pledge/thanks`. POST the payload to the list provider at the marked TODO.
- **Embeds** — `/events` (Luma calendar) and `/jams` (YouTube playlist) have framed
  placeholders with the drop-in point commented.
- **Assets** — hero B&W video (`/` — markup and `--g8-hero-filter` scrim are in place),
  plus four photo slots: PB&J sandwich line, Rob and the van, the van in the wild (×2).
- **Privacy copy** is the design bundle's draft boilerplate and needs a real review
  before launch.
