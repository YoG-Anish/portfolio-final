/* ============================================================
   CONTACT.JS
   Only does anything on contact.html (checks for #contact-form
   first). Submits via fetch to the optional Node backend; if
   the page is opened as a plain file (no server running), it
   says so plainly instead of failing silently.
   ============================================================ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // If we just landed here via the no-JS fallback redirect
    // (real form POST, then 303 back to this page), show the
    // status the server attached as a query param.
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const bannerMessage = params.get('message');
    if (status) {
      const banner = document.createElement('div');
      banner.className = 'form-banner ' + (status === 'success' ? 'is-success' : 'is-error');
      banner.textContent = bannerMessage || (status === 'success' ? 'Thanks — your message is in.' : 'Something went wrong.');
      form.parentNode.insertBefore(banner, form);
      window.history.replaceState({}, '', window.location.pathname);
    }

    const feedback = document.getElementById('contact-feedback');
    const submitBtn = document.getElementById('contact-submit');
    const isFileProtocol = window.location.protocol === 'file:';

    function setFeedback(message, state) {
      if (!feedback) return;
      feedback.textContent = message;
      feedback.className = 'form-feedback' + (state ? ' is-' + state : '');
    }

    if (isFileProtocol) {
      setFeedback("This form needs the small Node server running to actually save messages (see README). Email works either way — link above.", 'pending');
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (isFileProtocol) {
        setFeedback('Please email me directly for now — see the address above.', 'pending');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setFeedback('Sending…', 'pending');

      try {
        const res = await fetch(form.getAttribute('action'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        const result = await res.json();
        setFeedback(result.message || (result.ok ? 'Sent.' : 'Something went wrong.'), result.ok ? 'success' : 'error');
        if (result.ok) form.reset();
      } catch (err) {
        setFeedback('Network error — the server may not be running. Please try again or email directly.', 'error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
})();
