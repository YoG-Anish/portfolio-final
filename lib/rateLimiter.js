/**
 * Very small in-memory rate limiter, keyed by IP.
 *
 * IMPORTANT (Vercel-specific): serverless functions don't run as one
 * long-lived process — Vercel may spin up several instances of this
 * function under load, and each gets its own copy of `hits`. So this
 * limiter is "best effort" here, not a hard guarantee, the way it was
 * when this app ran as a single Node process. It still stops simple,
 * repeated abuse from one warm instance. For a strict guarantee across
 * all instances, swap this for a shared store (Vercel KV / Upstash
 * Redis) — ask if you want that wired in.
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

module.exports = { isRateLimited };
