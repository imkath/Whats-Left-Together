/**
 * @jest-environment node
 */

import { POST } from '../route';

const ORIGIN = 'https://whatslefttogether.com';

const valid = {
  type: 'bug',
  message: 'Peru does not show up when typed without the accent.',
  email: '',
  locale: 'es',
  website: '',
  elapsedMs: 12000,
};

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request(`${ORIGIN}/api/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN, ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );
}

describe('POST /api/feedback', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 201 }));
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.BREVO_API_KEY = 'test-key';
    process.env.FEEDBACK_FROM = 'sender@example.com';
    process.env.FEEDBACK_TO = 'inbox@example.com';
  });

  it('sends a valid message as plain text', async () => {
    const res = await post(valid);
    expect(res.status).toBe(202);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.to).toEqual([{ email: 'inbox@example.com' }]);
    expect(sent.textContent).toContain(valid.message);
    expect(sent.htmlContent).toBeUndefined();
  });

  it('rejects other origins', async () => {
    const res = await post(valid, { origin: 'https://evil.example' });
    expect(res.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('quietly drops honeypot and instant submissions', async () => {
    expect((await post({ ...valid, website: 'http://spam' })).status).toBe(202);
    expect((await post({ ...valid, elapsedMs: 200 })).status).toBe(202);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid, oversized and non-JSON bodies', async () => {
    expect((await post({ ...valid, message: 'hi' })).status).toBe(400);
    expect((await post({ ...valid, email: 'not-an-email' })).status).toBe(400);
    expect((await post('{oops')).status).toBe(400);
    expect((await post({ ...valid, message: 'x'.repeat(9000) })).status).toBe(413);
    expect((await post(valid, { 'content-type': 'text/plain' })).status).toBe(415);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports a missing configuration instead of pretending it worked', async () => {
    delete process.env.BREVO_API_KEY;
    expect((await post(valid)).status).toBe(503);
  });

  it('reports a failed delivery', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    expect((await post(valid)).status).toBe(502);
  });
});
