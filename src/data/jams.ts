/**
 * Homepage Jams teaser — the four cards in the `.jams-teaser__row` grid
 * (src/pages/index.astro). Each card is rendered by src/components/JamCard.astro,
 * driven entirely by the entries below.
 *
 * status: 'published'   — real, watchable jam. Needs a videoUrl; the Play
 *                          button is a real link that opens it in a new tab.
 * status: 'coming-soon' — the artist/session is announced but no video
 *                          exists yet. Card goes gray, a "Coming Soon"
 *                          overlay appears, and the Play button is a
 *                          disabled, non-clickable control.
 *
 * To replace a card: change its entry below (or ask the agent to, with the
 * artistName / image / status / videoUrl for that card). Nothing else in
 * this file or in JamCard.astro needs to change for a content swap.
 */

export type JamStatus = 'published' | 'coming-soon';

/**
 * 'split'  — one photo above the artist banner, a second one below it
 *            (Card 1's original treatment).
 * 'single' — one continuous photo behind the whole card; the banner is
 *            layered on top of it rather than sitting between two images.
 * Independent from `status` — either status can use either layout.
 */
export type JamImageLayout = 'split' | 'single';

export interface JamCardData {
  artistName: string;
  /** split: the top photo. single: the one photo used for the whole card. */
  image: string;
  /** split only — the bottom (Play-button) photo, if it should differ from `image`. Ignored by 'single'. */
  secondaryImage?: string;
  status: JamStatus;
  imageLayout: JamImageLayout;
  /**
   * single only — CSS object-position for `image` (e.g. "50% 25%"), so the
   * subject's face/head lands where you want within the frame instead of a
   * plain center-crop. Also doubles as the transform-origin for imageScale,
   * so zooming in stays anchored on the same focal point. Defaults to
   * "50% 50%" when omitted. Ignored by 'split'.
   */
  imagePosition?: string;
  /**
   * single only — zooms the photo in around `imagePosition` (CSS
   * transform: scale()). 1 = no zoom. Use this instead of a tighter
   * object-position alone when the subject needs to visually read larger/
   * closer, not just recentered. Defaults to 1. Ignored by 'split'.
   */
  imageScale?: number;
  /**
   * single only — shifts the already-scaled photo horizontally by this many
   * CSS pixels (positive = right), independent of imagePosition/imageScale.
   * imagePosition doubles as both the crop alignment AND the scale's zoom
   * anchor, which makes its X component unpredictable once a scale is
   * involved (moving it can shift the subject either direction depending on
   * the scale). Use imageOffsetX for a plain, literal nudge instead of
   * re-deriving what percentage does at a given scale. Defaults to 0 (no
   * shift — every existing card is unaffected). Ignored by 'split'.
   */
  imageOffsetX?: number;
  /**
   * single only — CSS filter contrast()/brightness() on just this photo
   * (never the banner/name/overlay/Play button). Photos vary in their own
   * tonal range (a flatter source photo isn't a bug to "fix" globally);
   * tune per card so the four cards read as one consistent set. Both
   * default to 1 (no change). Ignored by 'split'.
   */
  imageContrast?: number;
  imageBrightness?: number;
  /** Required for status:'published' — omitting it leaves the Play button inert. */
  videoUrl?: string;
}

/**
 * Card 1 is still the TEMPORARY PROTOTYPE MEDIA cropped from page 3 of the
 * approved PDF (Andy Babb + Lara Elle) — unchanged, videoUrl deliberately
 * left unset since no real video exists for it yet (see CLAUDE.md), and
 * still `imageLayout: 'split'` — the reference implementation for that
 * layout. Cards 2-4 carry the operator's real artist names/photos, one
 * continuous photo each (`imageLayout: 'single'`), all `coming-soon` for
 * now (no video exists yet for any of them either).
 */
export const jamCards: JamCardData[] = [
  {
    artistName: 'Andy Babb + Lara Elle',
    image: '/jams-still-1-prototype.jpg',
    secondaryImage: '/jams-still-2-prototype.jpg',
    status: 'published',
    imageLayout: 'split',
    videoUrl: 'https://www.youtube.com/watch?v=iaSnPzfVWRY&list=PLJNrF11lrZ3g&index=1',
  },
  {
    artistName: 'Sierra Marin',
    image: '/Sierra Marin.webp',
    status: 'coming-soon',
    imageLayout: 'single',
    // Anchors the zoom below her face (not ON it) so scaling pushes her face
    // UP into view instead of toward the band — counterintuitive but that's
    // how transform-origin works. Position history: 57% (too low, too much
    // empty backdrop above her head) -> 64% -> 70% + a small scale ease
    // (1.54 -> 1.48) this pass, since 1.54 alone read slightly more tightly
    // cropped/face-dominant than Noah/Tubby; moving the origin down to 70%
    // alongside the smaller scale keeps her eyes at the same height rather
    // than letting the scale reduction sink her back down. A CSS
    // contrast/brightness lift used to live here to compensate for the
    // source measuring flatter than Noah's — removed now that final
    // tonal grading happens in Photoshop on the source WebP itself; the
    // site should render that file as-is. Crop (imagePosition/imageScale)
    // is unaffected — that's geometry, not tone.
    imagePosition: '50% 70%',
    imageScale: 1.48,
  },
  {
    artistName: 'Noah Proudfoot',
    image: '/Noah Proudfoot.webp',
    status: 'coming-soon',
    imageLayout: 'single',
    // The 1.9-scale reference-matching attempt over-corrected — too tight a
    // crop, lost too much body/mountain/guitar context, and read left-
    // weighted. Reverted to the 1.45/27% that gave the right amount of
    // context and left both untouched since.
    //
    // Horizontal target changed: the operator now wants Noah's FACE
    // centered specifically (not his hat/torso "center of mass" — that
    // read fine by that metric but still looked face-left-weighted).
    // imagePosition's X kept fighting us here because it's doing two jobs
    // at once (object-position AND the scale's transform-origin), so
    // nudging it shifts the crop AND re-anchors the zoom simultaneously —
    // moving it can shift the visible subject either direction depending
    // on imageScale, which is why this took several rounds. Added
    // imageOffsetX (translateX in real px, applied AFTER the scale, so
    // it's a plain literal nudge decoupled from imagePosition/imageScale)
    // instead of continuing to re-derive what a percentage does at this
    // scale. imagePosition stays at 45%/27% for the crop + zoom anchor;
    // imageOffsetX: 38 shifts the already-scaled image right by 38px,
    // landing his FACE (not his hat or torso) on the card's centerline —
    // confirmed by computing the actual rendered page-position of his
    // face from the real box/image rects (not by eyeballing a screenshot,
    // which overshot by ~17px on the first attempt here).
    imagePosition: '45% 27%',
    imageScale: 1.45,
    imageOffsetX: 38,
  },
  {
    artistName: 'Tubby Love',
    image: '/Tubby Love.webp',
    status: 'coming-soon',
    imageLayout: 'single',
    // Operator swapped in a new source photo (beanie, eyes closed, softer
    // bokeh background) after the prior crop was tuned for the old one —
    // this pass re-tunes scale/position for the new photo from scratch,
    // not an increment on the old numbers. 1.05 read small/loose next to
    // Sierra and Noah with too much soft background around him; 1.35 gives
    // him comparable visual weight while keeping the guitar/strumming hand
    // meaningful in the lower panel. 56% keeps his beanie fully clear of
    // the top edge with a small margin, same "breathing room" logic as the
    // other two. A CSS contrast/brightness lift used to live here (tuned
    // for a since-replaced source photo, never re-verified against this
    // one) — removed now that final tonal grading happens in Photoshop on
    // the source WebP itself; the site should render that file as-is.
    imagePosition: '50% 56%',
    imageScale: 1.35,
  },
];
