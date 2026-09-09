/**
 * Homepage Jams teaser — the four cards in `.jams-teaser__row`
 * (src/pages/index.astro), rendered by src/components/JamCard.astro.
 *
 * Each card is now ONE complete flattened image supplied by Rob — the
 * photo(s), the artist-name band, and (for a published card) the Play
 * button are already part of the artwork itself. This component does not
 * construct any of that in CSS/markup any more; `image` IS the entire
 * visible card.
 *
 * status: 'published'   — has a working video. `hotspot` locates the Play
 *                          button already baked into the artwork, in
 *                          percentages of the image's own natural
 *                          width/height, so a real clickable/tappable
 *                          layer can sit precisely over it at any card
 *                          size.
 * status: 'coming-soon' — the supplied artwork has no Play button baked
 *                          in for these — the card is non-interactive
 *                          artwork, full stop. No hotspot, no click
 *                          handler, nothing to preserve/disable.
 *
 * For the previous CSS-constructed card design (separate photo(s), a live
 * text band, an SVG Play button, Coming Soon overlay + toast), see
 * JamCardLegacy.astro / jamsLegacy.ts — preserved, not deleted, with
 * revert instructions in that component's own header comment.
 */

export type JamStatus = 'published' | 'coming-soon';

export interface JamHotspot {
  /**
   * All four are percentages of `image`'s own natural width/height — NOT
   * the rendered card's on-screen size — so the interactive area scales
   * exactly with the artwork at every breakpoint (mobile scroll-strip
   * card, desktop grid card, anything in between) instead of drifting off
   * the visible button the way a fixed-px hotspot would.
   */
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface JamCardData {
  artistName: string;
  /** The complete card artwork — every visible pixel (photo(s), name band, Play button if any) is already baked into this one image. */
  image: string;
  status: JamStatus;
  /** Required for status:'published' when the Play button should actually work (paired with `hotspot`). */
  videoUrl?: string;
  /** Required alongside `videoUrl` — see JamHotspot. Omit for 'coming-soon' cards; their artwork has no Play button to align to. */
  hotspot?: JamHotspot;
}

/**
 * All four images are Rob's supplied artwork, web-optimized (WebP
 * re-encodes of his original PNGs — see the matching jam_*.png files in
 * public/, kept byte-for-byte untouched as the source masters; the .webp
 * versions are ~88% smaller with no visible quality loss, checked at 2x
 * zoom against fine text edges and the rounded-corner alpha before
 * shipping). Native size 787×1352 on all four — JamCard.astro's
 * aspect-ratio is set to match; if a future asset ships at different
 * dimensions, update both together.
 */
export const jamCards: JamCardData[] = [
  {
    artistName: 'Andy Babb + Lara Elle',
    image: '/jam_andy_lara_live.webp',
    status: 'published',
    videoUrl: 'https://www.youtube.com/watch?v=iaSnPzfVWRY&list=PLJNrF11lrZ3g&index=1',
    // Play button located by isolating its golden-hour pixels in the
    // source PNG via connected-component analysis (not eyeballed): a
    // solid 84×84px circle at (629,1179)-(713,1263) on the 787×1352
    // canvas. Padded ~8px on every side for a more comfortable tap
    // target before converting to percentages of the image's own
    // dimensions — verified visually against the source art afterward.
    hotspot: { left: 78.9, top: 86.61, width: 12.71, height: 7.4 },
  },
  {
    artistName: 'Sierra Marin',
    image: '/jam_sierra_marin_coming_soon.webp',
    status: 'coming-soon',
  },
  {
    artistName: 'Noah Proudfoot',
    // Filename keeps Rob's supplied spelling ("proudfood") — this is the
    // exact asset path, not a typo to silently correct.
    image: '/jam_noah_proudfood_coming_soon.webp',
    status: 'coming-soon',
  },
  {
    artistName: 'Tubby Love',
    image: '/jam_tubby_love_coming_soon.webp',
    status: 'coming-soon',
  },
];
