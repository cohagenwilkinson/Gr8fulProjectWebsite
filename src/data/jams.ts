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
   * single only — same concept as imageOffsetX, vertically: shifts the
   * already-scaled photo by this many CSS pixels (negative = up), applied
   * as a plain translateY AFTER imageScale/imagePosition, independent of
   * both. Added specifically because chasing a target pixel position (e.g.
   * matching another card's eye-line) by re-tuning imagePosition's Y is
   * fighting the same coupling imageOffsetX exists to avoid — that Y value
   * is simultaneously the object-position crop AND the scale's transform-
   * origin, so nudging it shifts the crop and re-anchors the zoom at once.
   * Use imageOffsetY to move the rendered image a known, literal amount
   * instead. Defaults to 0 (no shift — every existing card is unaffected).
   * Ignored by 'split'.
   */
  imageOffsetY?: number;
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
    image: '/Noah_BW_Still.webp',
    status: 'coming-soon',
    imageLayout: 'single',
    // Same live-jam still, tonally-corrected .webp (Photoshop owns the
    // grading — no contrast/brightness filter added). X (~25%) still does
    // essentially all the horizontal cropping, unchanged from the .jpg pass.
    //
    // imageScale/imageOffsetY: Noah read slightly smaller than Tubby and his
    // face sat too high, but his source was already touching the top edge at
    // imageScale:1 — translating down with imageOffsetY alone would have
    // revealed empty space above his hat. Needed crop margin first. The
    // minimum scale that creates enough margin to cover a given downward
    // imageOffsetY without exposing that gap turns out to be independent of
    // imagePosition's Y (the transform-origin/anchor): S >= (target +
    // buffer) / baseline_eye_Y, where baseline_eye_Y is the eye's Y position
    // at scale 1. That put the floor around 1.25, so that's what's set here
    // (1.05, in the original 1.04-1.06 nudge range, still left a visible
    // sliver of background at the top — confirmed via RGB channel analysis,
    // not just eyeballing). imageOffsetY: 15 then nudges the now-margined
    // image down so his eye lines up with Tubby's — measured with a
    // darkness-weighted centroid on the actual eye/iris (not eyebrow, lid,
    // or hat line) in one shared screenshot spanning both cards, landing
    // within ~1.3px of Tubby's eye height.
    imagePosition: '25% 20%',
    imageScale: 1.25,
    imageOffsetY: 15,
  },
  {
    artistName: 'Tubby Love',
    image: '/Tubby_BW_Still.webp',
    status: 'coming-soon',
    imageLayout: 'single',
    // Same live-jam still, tonally-corrected .webp (Photoshop owns the
    // grading — no contrast/brightness filter added). X (~61%) still does
    // essentially all the horizontal cropping, unchanged from the .jpg pass.
    //
    // imageScale/imagePosition-Y: eye-line reference is Noah (Sierra is
    // being replaced, no longer used). Noah's own crop is locked — already
    // at the top edge of his source, can't move further.
    //
    // Switched from chasing this via imagePosition's Y percentage to
    // imageOffsetY (see that field's doc comment in this file, and the
    // transform comment in JamCard.astro) after repeated percentage
    // iteration kept landing off — the Y value doing double duty as both
    // crop position and scale transform-origin made each adjustment's
    // actual rendered effect hard to predict and easy to mis-measure.
    // imagePosition/imageScale are left as the last percentage-tuned pass;
    // imageOffsetY below is a plain, literal, scale-independent nudge on
    // top of that, set directly from a measured on-screen pixel gap
    // against Noah's eye line (one shared screenshot, one guide line
    // across both cards — not separately-cropped comparisons).
    imagePosition: '61% 71%',
    imageScale: 1.05,
    imageOffsetY: -4,
  },
];
