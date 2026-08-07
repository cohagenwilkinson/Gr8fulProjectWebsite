/**
 * Site-wide chrome content. Editing nav or socials here changes every page.
 * Project naming rule (project/CLAUDE.md): always "Gr8ful Project", never
 * "Gr8ful" alone. Product names keep their own form — The Gr8ful Pledge,
 * The Gr8ful Podcast, Gr8ful Jams, PB&J Service.
 */

export const site = {
  name: 'Gr8ful Project',
  contactEmail: 'hello@gr8fulproject.com',
};

export interface NavLink {
  label: string;
  href: string;
  /**
   * Programmes that live under a parent. The parent stays a real destination —
   * the header opens these on hover and keyboard focus, and the compact menu
   * lists them indented underneath.
   */
  children?: Array<{ label: string; href: string }>;
}

export const navLinks: NavLink[] = [
  { label: 'Podcast', href: '/podcast' },
  {
    label: 'Events',
    href: '/events',
    children: [
      { label: 'Gr8ful Jams', href: '/jams' },
      { label: 'PB&J Service', href: '/pbj' },
    ],
  },
  { label: 'The Van', href: '/van' },
  { label: 'About', href: '/about' },
];

/** The channel handle is the same everywhere except Instagram. */
export const youtubeUrl = 'https://www.youtube.com/@gr8fulproject';
export const instagramUrl = 'https://www.instagram.com/thegr8fulproject';
export const tiktokUrl = 'https://www.tiktok.com/@gr8fulproject';

export const socialLinks = [
  { label: 'YouTube', href: youtubeUrl },
  { label: 'Instagram', href: instagramUrl },
  { label: 'TikTok', href: tiktokUrl },
];

/**
 * Every "Watch the latest episode" CTA points here.
 *
 * The design called for a resolver endpoint that reads the podcast feed and
 * redirects to the newest episode. That was never built, and the placeholder
 * href pointed at a route that doesn't exist, so all three CTAs 404'd. Until
 * a resolver exists, the channel is the honest destination — the newest
 * episode is the first thing on it.
 */
export const latestEpisodeUrl = youtubeUrl;

/**
 * Past jams, embedded on /jams. nocookie keeps YouTube from setting tracking
 * cookies until a visitor actually presses play.
 */
export const jamsPlaylistId = 'PLJNrF11lrZ3g';
export const jamsPlaylistUrl = `https://www.youtube.com/playlist?list=${jamsPlaylistId}`;
export const jamsPlaylistEmbedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${jamsPlaylistId}`;

/**
 * Where listeners can find the show. Order is intentional — YouTube first.
 *
 * Only YouTube is real. The rest point at each service's homepage rather than
 * the show, and need swapping once the feeds are live — see "Not finished
 * yet" in CLAUDE.md. An RSS entry was listed here too, pointing at a
 * /feed.xml that was never generated; it's out until a feed exists, since a
 * dead chip is worse than a missing one.
 */
export const podcastPlatforms = [
  { label: 'YouTube', href: youtubeUrl },
  { label: 'Spotify', href: 'https://open.spotify.com' },
  { label: 'Apple Podcasts', href: 'https://podcasts.apple.com' },
  { label: 'Pocket Casts', href: 'https://pocketcasts.com' },
];
