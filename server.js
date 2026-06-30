const http = require('http');
const { handleRequest } = require('./src/routes');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error('Unhandled error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Something went wrong on our end.');
    } else {
      res.end();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  console.log('(Or just double-click www/index.html to view it without this server.)');
});
