/**
 * Pledge signups land here and go into Brevo.
 *
 * Serves both submission paths. With JavaScript the form sends JSON and gets
 * JSON back, so a failure can be shown inline without losing what was typed.
 * Without it, the browser posts the form natively and we redirect — to
 * /pledge/thanks on success, or the same page flagged with ?pledge=error so
 * nobody is told they're on the list when they aren't.
 *
 * The key and list IDs live in the Vercel project env.
 */

import type { APIRoute } from 'astro';
import {
  BREVO_API_KEY,
  BREVO_LIST_ID,
  BREVO_BOULDER_LIST_ID,
} from 'astro:env/server';

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Brevo shouldn't be able to hold a submission open indefinitely. */
const TIMEOUT_MS = 8000;

const THANKS = '/pledge/thanks';

interface Submission {
  email: string;
  pledged: boolean;
  nearBoulder: boolean;
  /** Honeypot. Real people leave it empty; bots fill every field they find. */
  website: string;
}

async function readSubmission(request: Request): Promise<Submission> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    return {
      email: String(body?.email ?? '').trim(),
      pledged: Boolean(body?.pledged),
      nearBoulder: Boolean(body?.nearBoulder),
      website: String(body?.website ?? '').trim(),
    };
  }

  const form = await request.formData();
  return {
    email: String(form.get('email') ?? '').trim(),
    pledged: form.get('pledged') !== null,
    nearBoulder: form.get('nearBoulder') !== null,
    website: String(form.get('website') ?? '').trim(),
  };
}

async function addToBrevo(submission: Submission): Promise<void> {
  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    throw new Error('Brevo is not configured (BREVO_API_KEY / BREVO_LIST_ID)');
  }

  const listIds = [BREVO_LIST_ID];
  if (submission.nearBoulder && BREVO_BOULDER_LIST_ID) {
    listIds.push(BREVO_BOULDER_LIST_ID);
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      email: submission.email,
      listIds,
      // Someone pledging twice should be a no-op, not a 400.
      updateEnabled: true,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Brevo responded ${response.status} ${detail.slice(0, 200)}`);
  }
}

export const POST: APIRoute = async ({ request }) => {
  const wantsJson = (request.headers.get('content-type') ?? '').includes('application/json');

  const reply = (ok: boolean, status: number, message?: string) =>
    wantsJson
      ? new Response(JSON.stringify({ ok, message }), {
          status,
          headers: { 'content-type': 'application/json' },
        })
      : new Response(null, {
          status: 303,
          headers: { location: ok ? THANKS : `${THANKS}?pledge=error` },
        });

  let submission: Submission;
  try {
    submission = await readSubmission(request);
  } catch {
    return reply(false, 400, 'That submission could not be read.');
  }

  // Silently accept the honeypot so a bot gets no signal, but send nothing on.
  if (submission.website) return reply(true, 200);

  if (!submission.pledged) {
    return reply(false, 400, 'Please tick the pledge box.');
  }
  if (!EMAIL.test(submission.email)) {
    return reply(false, 400, 'That email address doesn’t look right.');
  }

  try {
    await addToBrevo(submission);
  } catch (error) {
    console.error('[brevo] signup failed:', error);
    return reply(false, 502, 'We couldn’t save that just now. Please try again in a moment.');
  }

  return reply(true, 200);
};
