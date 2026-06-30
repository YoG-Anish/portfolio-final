/**
 * Reads and parses a POST body as either JSON or
 * application/x-www-form-urlencoded, with a hard size cap so a
 * malicious or broken client can't stream an unbounded body at
 * the server and exhaust memory.
 */
const MAX_BODY_BYTES = 64 * 1024; // 64KB is generous for a contact form

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      const contentType = req.headers['content-type'] || '';

      try {
        if (contentType.includes('application/json')) {
          resolve(raw ? JSON.parse(raw) : {});
        } else {
          resolve(Object.fromEntries(new URLSearchParams(raw)));
        }
      } catch (err) {
        reject(Object.assign(new Error('Malformed request body'), { statusCode: 400 }));
      }
    });

    req.on('error', reject);
  });
}

module.exports = { readBody, MAX_BODY_BYTES };
