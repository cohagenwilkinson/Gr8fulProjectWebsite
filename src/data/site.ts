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

export const navLinks = [
  { label: 'Podcast', href: '/podcast' },
  { label: 'Jams', href: '/jams' },
  { label: 'Events', href: '/events' },
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
