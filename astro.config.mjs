// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  // The operator confirmed www.gr8fulproject.org (not gr8fulproject.com) as
  // the actual production domain — used to build every absolute URL the
  // site emits (canonical/og:url, the social share image). Was
  // gr8fulproject.com before; see CLAUDE.md's note about confirming the
  // serving domain with the operator rather than assuming it.
  site: 'https://www.gr8fulproject.org',

  // The site stays static apart from the four pages showing Luma event
  // cards; those opt out with `export const prerender = false`.
  adapter: vercel(),

  // /van, /jams, /podcast, and /events are all old/legacy routes we don't
  // want reachable any more (their src/pages/ files are gone — git history
  // has them if any is ever rebuilt as a real standalone page again), but
  // each URL still needs to resolve somewhere rather than 404ing, since
  // /van in particular is printed on a physical QR code. Astro's own
  // `redirects` config is what the Vercel adapter turns into real
  // platform-level redirects (part of the deployed routing manifest, not
  // client-side meta-refresh pages), so these are honored before any page
  // rendering runs — status explicit (302) on every entry: these routes
  // may become real standalone pages again later, so this is deliberately
  // a TEMPORARY redirect, not a permanent one, even though the underlying
  // pages are gone today.
  //
  // /jams, /podcast, and /events land on the matching homepage section
  // (#jams, #podcast) rather than just the homepage top — those anchors
  // already exist on index.astro's own sections, reused here rather than
  // duplicated. /events specifically goes to #seva per an explicit choice
  // (not #jams) — Seva is the section that now carries the calendar/event
  // content /events used to.
  redirects: {
    '/van': { status: 302, destination: '/' },
    '/jams': { status: 302, destination: '/#jams' },
    '/podcast': { status: 302, destination: '/#podcast' },
    '/events': { status: 302, destination: '/#seva' },
  },

  env: {
    schema: {
      // Lives in the Vercel project env, read at request time, never bundled
      // into client code. Optional so a build without it still succeeds — the
      // calendar degrades instead (see src/data/events.ts).
      LUMA_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),

      // Pledge signups. Optional for the same reason — a missing key makes the
      // form report a failure honestly rather than breaking the build.
      BREVO_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      // Deliberately strings, not numbers. Astro validates this whole schema
      // at startup, so a mistyped number here would 500 every server-rendered
      // page — including ones that never touch Brevo. Parsed in the route
      // instead, where a bad value only costs the pledge form.
      /** The list every pledge joins. */
      BREVO_LIST_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      /** Optional second list for people who said they're near Boulder. */
      BREVO_BOULDER_LIST_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },
});
