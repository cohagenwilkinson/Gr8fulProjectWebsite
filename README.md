# Gr8ful Project — website

A podcast and a string of good excuses to get together. This is the site behind it.

Built with [Astro](https://astro.build), hosted on Vercel. Events come from Luma, pledge
signups go to Brevo.

> Working on this with Claude or another coding agent? Point it at
> [`CLAUDE.md`](./CLAUDE.md) first — it has the context and the traps.

## Running it locally

```bash
npm install
npm run dev      # http://localhost:4321
```

Two checks, both of which should pass before anything is committed:

```bash
npm run build
npm run check
```

## How changes go live

Every push to `main` deploys to production automatically — there is no staging step. The
deploy runs through GitHub Actions (Actions tab → "Deploy to Vercel") rather than Vercel's
own GitHub integration, because the Vercel account isn't linked to this GitHub account.

If a deploy fails, the Actions tab shows why.

## Where the content lives

Most day-to-day content isn't in the code at all:

| What | Where to change it |
| --- | --- |
| Events, dates, locations | **Luma** — the site reads the calendar directly. Tag events so they sort onto the right page. |
| Pledge signups | **Brevo** — contacts land in the configured list. |
| Past jams video | **YouTube** — the playlist embeds itself. |
| Nav, social links, podcast platforms | `src/data/site.ts` |
| Page copy | `src/pages/*.astro` |
| Colours, type, spacing | `src/styles/tokens.css` |
| Images and video | `public/` |

Adding an event to Luma puts it on the site within minutes. No deploy needed.

## Secrets

API keys live in the **Vercel** project settings under Environment Variables — not in
GitHub, and never in the repo. GitHub only holds the token that lets it deploy.

- `LUMA_API_KEY` — events
- `BREVO_API_KEY`, `BREVO_LIST_ID` — pledge signups
- `BREVO_BOULDER_LIST_ID` — optional second list for Boulder-area signups

If one is missing, that feature degrades on its own rather than taking the site down.

## Known gaps

Some parts of the original design were never wired — missing photos, podcast links that
point at the wrong place, a guest book that doesn't exist yet. They're listed with their
current state under "Not finished yet" in [`CLAUDE.md`](./CLAUDE.md).
