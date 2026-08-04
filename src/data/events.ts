/**
 * Event content is a Luma slot.
 *
 * `kind` is the program name and is fixed by us (Gr8ful Jam | PB&J Service).
 * `title` and `when` come straight off the Luma feed at build time, so cards
 * are built to survive real-world title lengths (titles clamp at three lines)
 * and always render a date.
 *
 * Sample data below stands in for the feed. Replace `loadEvents()` with the
 * real Luma fetch — the page components only consume the exported lists.
 */

export type EventKind = 'Gr8ful Jam' | 'PB&J Service';

export interface LumaEvent {
  /** Program name — ours, not Luma's. Drives filtering. */
  kind: EventKind;
  /** Luma event title. Can be long; cards clamp at three lines. */
  title: string;
  /** Luma start date, pre-formatted for display. Always present. */
  when: string;
  /** Luma location line. Optional — reads "Location TBA" upstream. */
  where?: string;
  /** Luma registration URL. Signup always happens on Luma. */
  url: string;
}

/** Public Luma calendar — also the target of the /events embed. */
export const lumaCalendarUrl = 'https://lu.ma/gr8fulproject';

const events: LumaEvent[] = [
  {
    kind: 'Gr8ful Jam',
    title: 'Gr8ful Jam with Maya Okonkwo',
    when: 'Thu, Aug 13 · 7:00 PM',
    where: 'Rooftop, downtown Boulder',
    url: lumaCalendarUrl,
  },
  {
    kind: 'PB&J Service',
    title: 'PB&J Service',
    when: 'Sat, Aug 15 · 10:00 AM',
    where: 'Central Park bandshell',
    url: lumaCalendarUrl,
  },
  {
    kind: 'Gr8ful Jam',
    title: 'Gr8ful Jam · Late Summer Rooftop Session',
    when: 'Thu, Aug 27 · 7:00 PM',
    where: 'Location TBA',
    url: lumaCalendarUrl,
  },
  {
    kind: 'PB&J Service',
    title: 'PB&J Service',
    when: 'Sat, Aug 22',
    url: lumaCalendarUrl,
  },
  {
    kind: 'PB&J Service',
    title: 'PB&J Service',
    when: 'Sat, Aug 29',
    url: lumaCalendarUrl,
  },
  {
    kind: 'Gr8ful Jam',
    title: 'Gr8ful Jam with The Front Range Trio',
    when: 'Thu, Sep 10 · 7:00 PM',
    where: 'Location TBA',
    url: lumaCalendarUrl,
  },
  {
    kind: 'PB&J Service',
    title: 'PB&J Service',
    when: 'Sat, Sep 5',
    url: lumaCalendarUrl,
  },
];

/** Feed order is chronological upstream; keep it as delivered. */
export const upcomingEvents: LumaEvent[] = events;

/** /jams — jams only, three cards. */
export const upcomingJams: LumaEvent[] = events
  .filter((e) => e.kind === 'Gr8ful Jam')
  .slice(0, 3);

/** /pbj — service only, as a date list rather than cards. */
export const upcomingService: LumaEvent[] = events
  .filter((e) => e.kind === 'PB&J Service')
  .slice(0, 4);

/** /pledge/thanks — the single next thing to show up to. */
export const nextEvent: LumaEvent | undefined = events[0];

/** Home — a mixed three-card strip. */
export const homeEvents: LumaEvent[] = events.slice(0, 3);
