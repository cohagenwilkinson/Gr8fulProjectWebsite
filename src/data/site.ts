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

export const socialLinks = [
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
];

/**
 * Both "Watch the latest episode" CTAs resolve to the same dynamic link, fed
 * by the podcast RSS feed. Swap this for the real resolver endpoint.
 */
export const latestEpisodeUrl = '/api/latest-episode';

/**
 * Past jams, embedded on /jams. nocookie keeps YouTube from setting tracking
 * cookies until a visitor actually presses play.
 */
export const jamsPlaylistId = 'PLZDEEGZX2e-w';
export const jamsPlaylistUrl = `https://www.youtube.com/playlist?list=${jamsPlaylistId}`;
export const jamsPlaylistEmbedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${jamsPlaylistId}`;

/**
 * Where listeners can find the show. Order is intentional — YouTube first.
 * TODO: swap the hrefs for the real show URLs once the feeds are live.
 */
export const podcastPlatforms = [
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'Spotify', href: 'https://open.spotify.com' },
  { label: 'Apple Podcasts', href: 'https://podcasts.apple.com' },
  { label: 'Pocket Casts', href: 'https://pocketcasts.com' },
  { label: 'RSS', href: '/feed.xml' },
];
