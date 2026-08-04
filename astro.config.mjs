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
    },
  },
});
