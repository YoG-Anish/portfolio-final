const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.json': 'application/json; charset=utf-8'
};

const WWW_ROOT = path.join(__dirname, '..', '..', 'www');

/**
 * Serves a file from /www for a given URL pathname. The whole
 * site is static now, so this does almost all of the server's
 * work — there's no page-building logic left in this project.
 *
 * Returns true if it handled the request (served a file, or
 * cleanly responded with an error), false if there's nothing to
 * serve at that path.
 */
function serveStatic(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;

  const decoded = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  const safeRelative = path.normalize(decoded).replace(/^([.][.][/\\])+/, '');
  const filePath = path.join(WWW_ROOT, safeRelative);

  // Defensive: refuse anything that resolves outside of /www, even
  // via a crafted ".." or absolute-path style URL.
  if (!filePath.startsWith(WWW_ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return true;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false; // let the caller fall through to a 404 page
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  });

  if (req.method === 'HEAD') {
    res.end();
    return true;
  }

  fs.createReadStream(filePath).pipe(res);
  return true;
}

module.exports = { serveStatic, WWW_ROOT };
