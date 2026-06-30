const { readBody } = require('../utils/readBody');
const { validateContact } = require('../utils/validateContact');
const { isRateLimited } = require('../utils/rateLimiter');
const { appendMessage } = require('../utils/messageStore');

function getClientIp(req) {
  // Only trust the socket address by default. If this is ever
  // deployed behind a reverse proxy, set TRUST_PROXY and read
  // X-Forwarded-For there instead — trusting it unconditionally
  // lets a client spoof their own rate-limit bucket.
  return req.socket.remoteAddress || 'unknown';
}

async function handleContactSubmit(req, res) {
  const isAjax = (req.headers['x-requested-with'] || '').toLowerCase() === 'fetch';

  function respond(statusCode, ok, message) {
    if (isAjax) {
      res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok, message }));
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

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    respond(err.statusCode || 400, false, 'Your message could not be read. Please try again.');
    return;
  }

  const { valid, errors, data } = validateContact(body);
  if (!valid) {
    respond(400, false, errors[0] || 'Please check your message and try again.');
    return;
  }

  try {
    await appendMessage({
      ...data,
      ip,
      receivedAt: new Date().toISOString()
    });
  } catch (err) {
    respond(500, false, 'Your message could not be saved right now. Please try again shortly.');
    return;
  }

  respond(200, true, "Thanks — your message is in. I'll get back to you soon.");
}

module.exports = { handleContactSubmit };
