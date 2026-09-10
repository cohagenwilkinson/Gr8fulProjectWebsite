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

/**
 * /podcast, the "Events" parent, and "Gr8ful Jams" all point at homepage
 * section anchors now (#podcast, #jams, #seva — see index.astro), not
 * their own former standalone pages, which are gone. "PB&J Service" is
 * unaffected — /pbj is still a real page. SiteHeader's own click handler
 * already knows how to scroll to a same-page anchor vs. navigate to one on
 * another page, driven generically off any href containing "#" — nothing
 * there needed to change for this.
 */
export const navLinks: NavLink[] = [
  { label: 'Podcast', href: '/#podcast' },
  {
    label: 'Events',
    href: '/#seva',
    children: [
      { label: 'Gr8ful Jams', href: '/#jams' },
      { label: 'PB&J Service', href: '/pbj' },
    ],
  },
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
 * This route does not exist yet, so the CTAs 404 by design — the resolver
 * waits on the podcast RSS feed, which isn't published. Left pointing at the
 * intended endpoint deliberately, so the gap stays visible rather than being
 * papered over with a link somewhere else. Build `/api/latest-episode` to
 * read the feed and redirect to the newest episode once the feed exists.
 */
export const latestEpisodeUrl = '/api/latest-episode';

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
 * Only YouTube is real. The others point at each service's homepage rather
 * than the show, and `/feed.xml` isn't generated yet, so the RSS chip 404s.
 * All of it waits on the podcast feeds going live — see "Not finished yet"
 * in CLAUDE.md. Left as-is deliberately so the gap stays visible.
 */
export const podcastPlatforms = [
  { label: 'YouTube', href: youtubeUrl },
  { label: 'Spotify', href: 'https://open.spotify.com' },
  { label: 'Apple Podcasts', href: 'https://podcasts.apple.com' },
  { label: 'Pocket Casts', href: 'https://pocketcasts.com' },
  { label: 'RSS', href: '/feed.xml' },
];
