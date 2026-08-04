/**
 * Event content comes from the Luma calendar at request time.
 *
 * `kind` is the program name and is ours, not Luma's — it decides which
 * events land on /jams versus /pbj. We read it off the event's Luma tags and
 * fall back to matching the title, so an untagged event still lands
 * somewhere sensible.
 *
 * `title` and `when` come straight off the feed, so cards are built to
 * survive real-world title lengths (they clamp at three lines) and always
 * render a date.
 */

import { LUMA_API_KEY } from 'astro:env/server';

export type EventKind = 'Gr8ful Jam' | 'PB&J Service';

export interface LumaEvent {
  /** Program name — ours, not Luma's. Drives filtering. */
  kind: EventKind;
  /** Luma event title. Can be long; cards clamp at three lines. */
  title: string;
  /** Luma start, formatted in the event's own timezone. Always present. */
  when: string;
  /** Luma location line. Absent when the event has no address yet. */
  where?: string;
  /** Luma registration URL. Signup always happens on Luma. */
  url: string;
}

/** Public Luma calendar — where a "reserve" link lands if an event has no page. */
export const lumaCalendarUrl = 'https://lu.ma/gr8fulproject';

/** Calendar this site is bound to. Drives the /events embed. */
export const lumaCalendarId = 'cal-5Jvx9o7XeW0VVca';

/** Luma's own calendar embed. Live — never built from the data below. */
export const lumaEmbedUrl = `https://lu.ma/embed/calendar/${lumaCalendarId}/events`;

/**
 * Sent by the pages that render events. Vercel's CDN serves a cached copy for
 * five minutes and keeps serving the stale one while it refreshes, so a
 * visitor never waits on Luma and we never hammer it.
 */
export const eventsCacheControl = 'public, s-maxage=300, stale-while-revalidate=3600';

/**
 * Luma has served the public API from two hosts. Trying the current one
 * first means a host migration costs one slow request, not an outage.
 */
const API_BASES = ['https://public-api.luma.com/v1', 'https://api.lu.ma/public/v1'];

/** A slow calendar must not hold a page render open. */
const TIMEOUT_MS = 6000;

/** Warm functions reuse a recent fetch instead of re-calling Luma. */
const CACHE_TTL_MS = 60_000;

interface ApiEvent {
  name?: string;
  start_at?: string;
  timezone?: string;
  url?: string;
  geo_address_info?: { city_state?: string; full_address?: string } | null;
  tags?: Array<{ name?: string }> | null;
}

interface ApiEntry {
  event?: ApiEvent;
  tags?: Array<{ name?: string }> | null;
}

async function requestEntries(): Promise<ApiEntry[]> {
  if (!LUMA_API_KEY) throw new Error('LUMA_API_KEY is not set');

  let lastError: unknown;

  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}/calendar/list-events`, {
        headers: { 'x-luma-api-key': LUMA_API_KEY, accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        lastError = new Error(`Luma responded ${response.status}`);
        continue;
      }

      const body = await response.json();
      // Documented shape is { entries: [...] }; tolerate a bare array too.
      const entries = body?.entries ?? body?.events ?? body?.data ?? body;
      if (Array.isArray(entries)) return entries;

      lastError = new Error('Luma returned an unrecognised body');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Luma request failed');
}

/** Tags win; the title is the fallback for anything untagged. */
const PBJ_PATTERN = /pb\s*&?\s*j|peanut butter/i;

function detectKind(entry: ApiEntry): EventKind {
  const tags = [...(entry.tags ?? []), ...(entry.event?.tags ?? [])]
    .map((tag) => tag?.name ?? '')
    .join(' ');

  return PBJ_PATTERN.test(`${tags} ${entry.event?.name ?? ''}`)
    ? 'PB&J Service'
    : 'Gr8ful Jam';
}

/** "Thu, Aug 13 · 7:00 PM", read in the timezone the event was set in. */
function formatWhen(startAt: string, timeZone: string): string {
  const at = new Date(startAt);

  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(at);

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(at);

  return `${day} · ${time}`;
}

function toEvent(entry: ApiEntry): LumaEvent | null {
  const event = entry.event;
  if (!event?.name || !event.start_at) return null;

  const slug = event.url;
  const geo = event.geo_address_info;

  return {
    kind: detectKind(entry),
    title: event.name,
    when: formatWhen(event.start_at, event.timezone || 'America/Denver'),
    where: geo?.city_state ?? geo?.full_address ?? undefined,
    url: !slug ? lumaCalendarUrl : /^https?:\/\//.test(slug) ? slug : `https://lu.ma/${slug}`,
  };
}

function startedAt(entry: ApiEntry): number {
  return Date.parse(entry.event?.start_at ?? '');
}

let cache: { at: number; events: LumaEvent[] } | null = null;

/** Upcoming events, soonest first. Empty if Luma can't be reached. */
export async function getEvents(): Promise<LumaEvent[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.events;

  try {
    const entries = await requestEntries();
    const now = Date.now();

    const events = entries
      .filter((entry) => startedAt(entry) >= now)
      .sort((a, b) => startedAt(a) - startedAt(b))
      .map(toEvent)
      .filter((event): event is LumaEvent => event !== null);

    cache = { at: Date.now(), events };
    return events;
  } catch (error) {
    console.error('[luma] could not load events:', error);
    // A calendar outage should thin the page out, not 500 it. Prefer the
    // last good response over nothing.
    return cache?.events ?? [];
  }
}

/** /jams — jams only, three cards. */
export async function getJams(limit = 3): Promise<LumaEvent[]> {
  const events = await getEvents();
  return events.filter((event) => event.kind === 'Gr8ful Jam').slice(0, limit);
}

/** /pbj — service only, as a date list rather than cards. */
export async function getService(limit = 4): Promise<LumaEvent[]> {
  const events = await getEvents();
  return events.filter((event) => event.kind === 'PB&J Service').slice(0, limit);
}

/** /pledge/thanks — the single next thing to show up to. */
export async function getNextEvent(): Promise<LumaEvent | undefined> {
  const events = await getEvents();
  return events[0];
}

/** Home — a mixed three-card strip. */
export async function getHomeEvents(limit = 3): Promise<LumaEvent[]> {
  const events = await getEvents();
  return events.slice(0, limit);
}
