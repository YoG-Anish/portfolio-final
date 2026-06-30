/**
 * VERCEL SERVERLESS FUNCTION — POST /api/contact
 * --------------------------------------------------
 * This file's location (api/contact.js, at the repo root) is what
 * makes Vercel turn it into an endpoint automatically — no router,
 * no config needed for that part.
 *
 * Platform note: Vercel's Node runtime parses the request body for
 * you automatically (req.body is already a usable object for both
 * JSON and form-urlencoded submissions) — so unlike the original
 * Node server version of this file, there's no manual stream-reading
 * step here. Trying to read req as a raw stream on Vercel would hang,
 * since the platform has already consumed it to build req.body.
 *
 * Persistence note: serverless functions don't keep a writable,
 * persistent filesystem — anything written to disk here disappears
 * after the request finishes, and isn't shared between invocations.
 * So instead of trying to save messages to a JSON file (which worked
 * on the plain Node server but would silently NOT work here), this
 * logs each message to the function's logs (visible in your Vercel
 * dashboard → Project → Logs) so nothing is lost without you knowing.
 * For real message delivery, wire up an email API — see the README.
 */

const { validateContact } = require('../lib/validateContact');
const { isRateLimited } = require('../lib/rateLimiter');

function getClientIp(req) {
  // Vercel sits in front of every request, so x-forwarded-for is
  // trustworthy here (unlike on a bare server you control yourself,
  // where it could be spoofed unless you control the proxy).
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

module.exports = async function handler(req, res) {
  // Mirror the same security headers the static pages get.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, message: 'Method not allowed.' });
    return;
  }

  const isAjax = (req.headers['x-requested-with'] || '').toLowerCase() === 'fetch';

  function respond(statusCode, ok, message) {
    if (isAjax) {
      res.status(statusCode).json({ ok, message });
    } else {
      const status = ok ? 'success' : 'error';
      res.writeHead(303, { Location: `/contact.html?status=${status}&message=${encodeURIComponent(message)}` });
      res.end();
    }
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    respond(429, false, 'Too many messages from this connection — please try again later.');
    return;
  }

  // req.body is pre-parsed by Vercel for JSON and form-urlencoded
  // submissions. Defensive fallback to {} in case of an empty body.
  const body = req.body || {};

  const { valid, errors, data } = validateContact(body);
  if (!valid) {
    respond(400, false, errors[0] || 'Please check your message and try again.');
    return;
  }

  // No persistent disk here — this is the "storage" for now.
  // Check Vercel dashboard → your project → Logs to see submissions.
  console.log('[contact-form]', JSON.stringify({ ...data, ip, receivedAt: new Date().toISOString() }));

  respond(200, true, "Thanks — your message is in. I'll get back to you soon.");
};
