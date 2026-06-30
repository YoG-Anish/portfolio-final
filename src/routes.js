const { serveStatic, WWW_ROOT } = require('./utils/staticServer');
const { applySecurityHeaders } = require('./middleware/security');
const { handleContactSubmit } = require('./controllers/contactController');

const path = require('path');
const fs = require('fs');

function send404(res) {
  const notFoundPath = path.join(WWW_ROOT, '404.html');
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  if (fs.existsSync(notFoundPath)) {
    fs.createReadStream(notFoundPath).pipe(res);
  } else {
    res.end('Not found');
  }
}

async function handleRequest(req, res) {
  applySecurityHeaders(res);

  let parsedUrl;
  try {
    parsedUrl = new URL(req.url, 'http://localhost');
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }
  const pathname = parsedUrl.pathname;

  // The contact form is the only real "route" left — everything
  // else is just a file in /www.
  if (pathname === '/api/contact' && req.method === 'POST') {
    await handleContactSubmit(req, res);
    return;
  }

  if (serveStatic(req, res, pathname)) return;

  send404(res);
}

module.exports = { handleRequest };
