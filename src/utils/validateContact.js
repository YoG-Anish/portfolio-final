const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and trims contact form fields. Returns { valid, errors, data }.
 * Nothing here trusts the client — every field is re-checked even
 * though the form also has client-side `required`/`maxlength` hints.
 */
function validateContact(body) {
  const errors = [];
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const message = String(body.message || '').trim();
  const honeypot = String(body.website || '').trim();

  if (honeypot) {
    // Filled-in honeypot = almost certainly a bot. Fail closed but
    // don't tell the caller why — no need to teach bots what tripped it.
    errors.push('Submission rejected.');
  }

  if (!name) errors.push('Name is required.');
  if (name.length > 100) errors.push('Name is too long.');

  if (!email) errors.push('Email is required.');
  else if (!EMAIL_RE.test(email) || email.length > 150) errors.push('Please enter a valid email address.');

  if (!message) errors.push('Message is required.');
  if (message.length > 2000) errors.push('Message is too long.');

  return { valid: errors.length === 0, errors, data: { name, email, message } };
}

module.exports = { validateContact };
