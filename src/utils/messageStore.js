const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', '..', 'data-store', 'messages.json');

// Node is single-threaded, so a simple promise chain is enough to
// stop two near-simultaneous submissions from corrupting the file
// by both reading the old contents and writing over each other.
let writeQueue = Promise.resolve();

function readAll() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return []; // missing or corrupt file -> start fresh rather than crash
  }
}

function appendMessage(message) {
  writeQueue = writeQueue.then(() => {
    const all = readAll();
    all.push(message);
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(all, null, 2), 'utf8');
  });
  return writeQueue;
}

module.exports = { appendMessage, readAll, STORE_PATH };
