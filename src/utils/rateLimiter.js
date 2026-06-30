/**
 * Very small in-memory rate limiter, keyed by IP.
 * Good enough for a single-process portfolio site. If this ever
 * runs behind multiple processes/instances, swap this for a
 * shared store (Redis, etc.) instead.
 */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count += 1;
  hits.set(ip, entry);

  return entry.count > MAX_REQUESTS;
}

// Periodic cleanup so the map doesn't grow forever on a long-running process.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of hits) {
    if (now - entry.windowStart > WINDOW_MS) hits.delete(ip);
  }
}, WINDOW_MS).unref();

module.exports = { isRateLimited };
