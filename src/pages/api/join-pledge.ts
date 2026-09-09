/**
 * "Take the Pledge" modal (src/components/JoinProjectSection.astro) — the
 * one with Name/Email/Zipcode fields, separate from the site's actual
 * mailing-list signup (PledgeForm.astro / /api/pledge, which adds a Brevo
 * *contact* to a list). That modal used to be a local-only prototype that
 * never sent data anywhere; this route is what makes it real.
 *
 * Brevo is used ONLY as a transactional email carrier here — one call to
 * https://api.brevo.com/v3/smtp/email, authenticated with the same
 * BREVO_API_KEY already configured in Vercel. This route never touches
 * Brevo Contacts or Lists (no BREVO_LIST_ID / BREVO_BOULDER_LIST_ID), so
 * the submitted ZIP is only ever plain text in an email body — it's never
 * coerced into a Brevo contact attribute, which is what "must remain a
 * string" is actually protecting against.
 *
 * JSON only. This modal has no non-JS entry point (it only opens via a
 * click handler), so unlike /api/pledge there's no native-form-post
 * fallback to also support here.
 */

import type { APIRoute } from 'astro';
import { BREVO_API_KEY } from 'astro:env/server';

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Brevo shouldn't be able to hold a submission open indefinitely. */
const TIMEOUT_MS = 8000;

/**
 * Verified in Brevo against the authenticated gr8fulproject.org domain.
 * Fixed sender, not an env var — it's tied to Brevo's domain/sender
 * verification, not something that varies by deploy target.
 */
const SENDER = { email: 'robbiedob@gr8fulproject.org', name: 'RobbieDob' };

/** Primary recipient for every successful pledge submission. */
const PLEDGE_NOTIFY_TO = 'hello@gr8fulproject.org';

// Temporary testing BCC — remove kbonomo@gr8fulproject.org at launch if desired.
const PLEDGE_NOTIFY_BCC = 'kbonomo@gr8fulproject.org';

interface Submission {
  firstName: string;
  email: string;
  /** Always a string — never parsed as a number, so "02138" never becomes "2138". */
  zip: string;
  /**
   * The modal's "Get invites and stay in touch" checkbox. Recorded in the
   * notification email only (see sendNotification below) — never sent to
   * Brevo Contacts/Lists, per this route's transactional-email-only scope.
   */
  invites: boolean;
}

function readSubmission(body: unknown): Submission {
  const record = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  return {
    firstName: String(record.firstName ?? '').trim(),
    email: String(record.email ?? '').trim(),
    zip: String(record.zip ?? '').trim(),
    invites: Boolean(record.invites),
  };
}

function validate(submission: Submission): string | null {
  if (!submission.firstName) return 'Please enter your name.';
  if (!EMAIL.test(submission.email)) return 'That email address doesn’t look right.';
  if (!submission.zip) return 'Please enter your zipcode.';
  return null;
}

/** Minimal escaping — these three fields are the only user input reaching the HTML body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendNotification(submission: Submission): Promise<void> {
  if (!BREVO_API_KEY) {
    throw new Error('Brevo is not configured (BREVO_API_KEY)');
  }

  const submittedAt = new Date().toISOString();

  const stayInTouch = submission.invites ? 'Yes' : 'No';

  const textLines = [
    'New Gr8ful Project Pledge',
    '',
    `Name: ${submission.firstName}`,
    `Email: ${submission.email}`,
    `ZIP Code: ${submission.zip}`,
    `Stay in Touch: ${stayInTouch}`,
    '',
    `Submitted: ${submittedAt}`,
  ];

  const htmlLines = [
    '<p>New Gr8ful Project Pledge</p>',
    '<p>',
    `Name: ${escapeHtml(submission.firstName)}<br>`,
    `Email: ${escapeHtml(submission.email)}<br>`,
    `ZIP Code: ${escapeHtml(submission.zip)}<br>`,
    `Stay in Touch: ${stayInTouch}`,
    '</p>',
    `<p>Submitted: ${submittedAt}</p>`,
  ];

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: PLEDGE_NOTIFY_TO }],
      bcc: [{ email: PLEDGE_NOTIFY_BCC }],
      replyTo: { email: submission.email },
      subject: 'New Gr8ful Project Pledge',
      textContent: textLines.join('\n'),
      htmlContent: htmlLines.join('\n'),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Brevo responded ${response.status} ${detail.slice(0, 200)}`);
  }
}

export const POST: APIRoute = async ({ request }) => {
  const reply = (ok: boolean, status: number, message?: string) =>
    new Response(JSON.stringify({ ok, message }), {
      status,
      headers: { 'content-type': 'application/json' },
    });

  let submission: Submission;
  try {
    const body = await request.json();
    submission = readSubmission(body);
  } catch {
    return reply(false, 400, 'That submission could not be read.');
  }

  const validationError = validate(submission);
  if (validationError) {
    return reply(false, 400, validationError);
  }

  try {
    await sendNotification(submission);
  } catch (error) {
    // Deliberately no submitted name/email/zip here — just enough to find
    // the failure in the logs (Brevo's status/error text, no secrets).
    console.error('[join-pledge] notification failed:', error instanceof Error ? error.message : error);
    return reply(false, 502, 'We couldn’t submit that just now. Please try again in a moment.');
  }

  console.log('[join-pledge] notification sent');
  return reply(true, 200);
};
