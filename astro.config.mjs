// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://gr8fulproject.com',

  // The site stays static apart from the four pages showing Luma event
  // cards; those opt out with `export const prerender = false`.
  adapter: vercel(),

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
