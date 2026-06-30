/* ============================================================
   MAIN.JS
   Shell interactions only: theme toggle, sidebar collapse,
   mobile drawer, active-nav highlighting, copy-link, scroll
   progress, back-to-top, reveal-on-scroll. No content rendering
   happens here — see render.js for that.
   ============================================================ */

(function () {
  'use strict';

  function qs(sel, scope) { return (scope || document).querySelector(sel); }
  function qsa(sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable, ignore */ }
  }

  /* ---------- active nav link, from <body data-page="..."> ---------- */
  function highlightActiveNav() {
    const page = document.body.getAttribute('data-page');
    if (!page) return;
    qsa('.nav-link').forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('data-page') === page);
    });
  }

  /* ---------- theme toggle ---------- */
  function initTheme() {
    const root = document.documentElement;
    const btn = qs('#theme-toggle');
    if (safeGet('theme') === 'light') root.setAttribute('data-theme', 'light');
    if (btn) {
      btn.setAttribute('aria-pressed', String(root.getAttribute('data-theme') === 'light'));
      btn.addEventListener('click', function () {
        const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        btn.setAttribute('aria-pressed', String(next === 'light'));
        safeSet('theme', next);
      });
    }
  }

  /* ---------- sidebar collapse (desktop) ---------- */
  function initCollapse() {
    const sidebar = qs('.sidebar');
    const btn = qs('#collapse-toggle');
    if (!sidebar || !btn) return;

    function apply(collapsed) {
      sidebar.classList.toggle('is-collapsed', collapsed);
      document.body.setAttribute('data-sidebar', collapsed ? 'collapsed' : 'expanded');
    }

    apply(safeGet('sidebarCollapsed') === '1');
    btn.addEventListener('click', function () {
      const collapsed = !sidebar.classList.contains('is-collapsed');
      apply(collapsed);
      safeSet('sidebarCollapsed', collapsed ? '1' : '0');
    });
  }

  /* ---------- mobile drawer ---------- */
  function initMobileNav() {
    const sidebar = qs('.sidebar');
    const overlay = qs('#mobile-overlay');
    const openBtn = qs('#mobile-open');
    const closeBtn = qs('#mobile-close');
    if (!sidebar || !overlay || !openBtn) return;

    function open() {
      sidebar.classList.add('is-mobile-open');
      overlay.classList.add('is-visible');
      openBtn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      sidebar.classList.remove('is-mobile-open');
      overlay.classList.remove('is-visible');
      openBtn.setAttribute('aria-expanded', 'false');
    }
    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    qsa('.nav-link').forEach((link) => link.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ---------- copy current page link ---------- */
  function initCopyLink() {
    const btn = qs('#copy-link');
    if (!btn) return;
    btn.addEventListener('click', async function () {
      const url = window.location.href;
      let copied = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
          copied = true;
        }
      } catch (e) { copied = false; }
      if (!copied) {
        try { window.prompt('Copy this link:', url); } catch (e) { /* ignore */ }
        return;
      }
      const label = qs('.util-label', btn);
      if (label) {
        const original = label.textContent;
        label.textContent = 'Copied';
        setTimeout(() => { label.textContent = original; }, 1500);
      }
    });
  }

  /* ---------- scroll progress + back-to-top ---------- */
  function initScrollUi() {
    const progress = qs('#scroll-progress');
    const backToTop = qs('#back-to-top');

    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progress) progress.style.width = pct + '%';
      if (backToTop) backToTop.classList.toggle('is-visible', scrollTop > 480);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (backToTop) {
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  /* ---------- reveal-on-scroll ---------- */
  function initReveal() {
    const items = qsa('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
  }

  function setFooterYear() {
    const el = qs('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', function () {
    highlightActiveNav();
    initTheme();
    initCollapse();
    initMobileNav();
    initCopyLink();
    initScrollUi();
    initReveal();
    setFooterYear();
  });
})();
