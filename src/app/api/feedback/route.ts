import { z } from 'zod';

export const runtime = 'edge';

// Sender, recipient and Brevo key live in the Cloudflare Pages project settings,
// never in the repository.
type FeedbackEnv = {
  BREVO_API_KEY?: string;
  FEEDBACK_FROM?: string;
  FEEDBACK_TO?: string;
};

const ALLOWED_ORIGINS = new Set([
  'https://whatslefttogether.com',
  'https://www.whatslefttogether.com',
]);

const MAX_BODY_BYTES = 8 * 1024;
// Humans need a few seconds to write something; scripts post instantly.
const MIN_FILL_MS = 3000;

const FeedbackSchema = z.object({
  type: z.enum(['suggestion', 'bug', 'other']),
  message: z.string().trim().min(5).max(2000),
  email: z.union([z.literal(''), z.email().max(254)]).optional(),
  locale: z.enum(['es', 'en']),
  elapsedMs: z.number().int().nonnegative(),
  // Honeypot: hidden from people, filled in by most bots.
  website: z.string().max(200).optional(),
});

const TYPE_LABEL = { suggestion: 'Sugerencia', bug: 'Problema', other: 'Otro' } as const;

async function readEnv(): Promise<FeedbackEnv> {
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    return getRequestContext().env as FeedbackEnv;
  } catch {
    // Outside Cloudflare (local dev) the values come from .env.local.
    return process.env as FeedbackEnv;
  }
}

function json(status: number, body?: Record<string, string>) {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  const isLocal = process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost');
  if (!ALLOWED_ORIGINS.has(origin) && !isLocal) return json(403, { error: 'forbidden' });

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json(415, { error: 'unsupported' });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'too_large' });

  let parsed;
  try {
    parsed = FeedbackSchema.safeParse(JSON.parse(raw));
  } catch {
    return json(400, { error: 'invalid' });
  }
  if (!parsed.success) return json(400, { error: 'invalid' });

  const data = parsed.data;
  // Answer bots as if it worked, so they learn nothing from the response.
  if (data.website || data.elapsedMs < MIN_FILL_MS) return json(202);

  const env = await readEnv();
  if (!env.BREVO_API_KEY || !env.FEEDBACK_FROM || !env.FEEDBACK_TO) {
    return json(503, { error: 'unavailable' });
  }

  const lines = [
    `Tipo: ${TYPE_LABEL[data.type]}`,
    `Idioma del sitio: ${data.locale}`,
    `Correo para responder: ${data.email || 'no dejó correo'}`,
    '',
    data.message,
  ];

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: "What's Left Together", email: env.FEEDBACK_FROM },
      to: [{ email: env.FEEDBACK_TO }],
      subject: `What's Left Together, comentario nuevo (${TYPE_LABEL[data.type].toLowerCase()})`,
      // Plain text only: whatever the visitor typed is never rendered as HTML.
      textContent: lines.join('\n'),
    }),
  });

  if (!res.ok) return json(502, { error: 'send_failed' });
  return json(202);
}
