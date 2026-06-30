/* ============================================================
   RENDER.JS
   Turns the data arrays (data/*.js) into DOM nodes for whichever
   page they belong on. Every element is built with
   document.createElement + .textContent — never innerHTML — so
   nothing in a data file can ever be interpreted as markup.

   Each render function bails out immediately if its container
   isn't on the current page, so this one file can be safely
   included on every page without doing anything unnecessary.
   ============================================================ */

(function () {
  'use strict';

  function el(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function text(tag, className, content) {
    const node = el(tag, className);
    node.textContent = content;
    return node;
  }

  function showEmptyState(container, message, hint) {
    const wrap = el('div', 'empty-state');
    wrap.appendChild(text('p', null, message));
    if (hint) wrap.appendChild(text('p', 'hint', hint));
    container.appendChild(wrap);
  }

  /* ---------- Skills ---------- */
  function renderSkills() {
    const container = document.getElementById('skills-columns');
    if (!container || typeof SKILLS_DATA === 'undefined') return;

    SKILLS_DATA.forEach((group) => {
      if (!group || !Array.isArray(group.skills)) return;
      const col = el('div');
      col.appendChild(text('h3', 'skill-group-title', group.title || ''));
      const list = el('ul', 'pill-list');
      group.skills.forEach((skill) => {
        if (typeof skill !== 'string' || !skill.trim()) return;
        const pillClass = group.accent === 'gold' ? 'pill accent-gold' : 'pill';
        list.appendChild(text('li', pillClass, skill));
      });
      col.appendChild(list);
      container.appendChild(col);
    });
  }

  /* ---------- Portfolio ---------- */
  function buildExternalIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '13');
    svg.setAttribute('height', '13');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p1.setAttribute('d', 'M7 17 17 7');
    const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p2.setAttribute('d', 'M9 7h8v8');
    svg.appendChild(p1);
    svg.appendChild(p2);
    return svg;
  }

  function renderPortfolio() {
    const container = document.getElementById('portfolio-grid');
    if (!container || typeof PORTFOLIO_DATA === 'undefined') return;

    if (!Array.isArray(PORTFOLIO_DATA) || PORTFOLIO_DATA.length === 0) {
      showEmptyState(container, 'No projects yet.', 'Add one in data/portfolio.js');
      return;
    }

    const seen = new Set();
    PORTFOLIO_DATA.forEach((project, index) => {
      if (!project || typeof project.title !== 'string' || !project.title.trim()) return;
      const id = project.id !== undefined ? project.id : index;
      if (seen.has(id)) return;
      seen.add(id);

      const card = el('article', 'card');
      card.style.animationDelay = (index * 60) + 'ms';

      const head = el('div', 'card-head');
      head.appendChild(text('span', 'card-tag', project.category || 'Project'));
      if (project.year) head.appendChild(text('span', 'card-year', project.year));
      card.appendChild(head);

      card.appendChild(text('h3', null, project.title));
      card.appendChild(text('p', 'card-desc', project.description || ''));

      if (Array.isArray(project.tools) && project.tools.length) {
        const toolList = el('ul', 'card-tools');
        project.tools.forEach((tool) => {
          if (typeof tool === 'string' && tool.trim()) toolList.appendChild(text('li', null, tool));
        });
        card.appendChild(toolList);
      }

      const hasLink = typeof project.link === 'string' && project.link.trim().length > 0;
      const isSafeLink = hasLink && /^https?:\/\//i.test(project.link.trim());

      if (isSafeLink) {
        const link = document.createElement('a');
        link.className = 'card-link';
        link.href = project.link.trim();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.appendChild(document.createTextNode('View project '));
        link.appendChild(buildExternalIcon());
        card.appendChild(link);
      } else {
        card.appendChild(text('span', 'card-link is-disabled', 'Coming soon'));
      }

      container.appendChild(card);
    });
  }

  /* ---------- Education ---------- */
  function renderEducation() {
    const container = document.getElementById('education-timeline');
    if (!container || typeof EDUCATION_DATA === 'undefined') return;

    if (!Array.isArray(EDUCATION_DATA) || EDUCATION_DATA.length === 0) {
      showEmptyState(container, 'No education entries yet.', 'Add one in data/education.js');
      return;
    }

    EDUCATION_DATA.forEach((entry) => {
      if (!entry || !entry.institution) return;
      const item = el('div', 'timeline-item');
      const head = el('div', 'timeline-head');
      head.appendChild(text('h3', null, entry.institution));
      if (entry.period) head.appendChild(text('span', 'timeline-period', entry.period));
      item.appendChild(head);
      if (entry.program) item.appendChild(text('p', 'timeline-sub', entry.program));
      if (entry.description) item.appendChild(text('p', 'timeline-desc', entry.description));
      container.appendChild(item);
    });
  }

  /* ---------- Experience ---------- */
  function renderExperience() {
    const container = document.getElementById('experience-timeline');
    if (!container || typeof EXPERIENCE_DATA === 'undefined') return;

    if (!Array.isArray(EXPERIENCE_DATA) || EXPERIENCE_DATA.length === 0) {
      showEmptyState(container, 'No experience entries yet.', 'Add one in data/experience.js');
      return;
    }

    EXPERIENCE_DATA.forEach((entry) => {
      if (!entry || !entry.role) return;
      const item = el('div', 'timeline-item accent-teal');
      const head = el('div', 'timeline-head');
      head.appendChild(text('h3', null, entry.role));
      if (entry.duration) head.appendChild(text('span', 'timeline-period', entry.duration));
      item.appendChild(head);
      if (entry.company) item.appendChild(text('p', 'timeline-sub', entry.company));
      if (entry.description) item.appendChild(text('p', 'timeline-desc', entry.description));

      if (Array.isArray(entry.highlights) && entry.highlights.length) {
        const list = el('ul', 'timeline-highlights');
        entry.highlights.forEach((h) => {
          if (typeof h === 'string' && h.trim()) list.appendChild(text('li', null, h));
        });
        item.appendChild(list);
      }
      container.appendChild(item);
    });
  }

  /* ---------- Achievements ---------- */
  function renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container || typeof ACHIEVEMENTS_DATA === 'undefined') return;

    if (!Array.isArray(ACHIEVEMENTS_DATA) || ACHIEVEMENTS_DATA.length === 0) {
      showEmptyState(container, 'No achievements added yet.', 'Add entries in data/achievements.js');
      return;
    }

    ACHIEVEMENTS_DATA.forEach((a, index) => {
      if (!a || !a.title) return;
      const card = el('article', 'card');
      card.style.animationDelay = (index * 60) + 'ms';
      const head = el('div', 'card-head');
      if (a.year) head.appendChild(text('span', 'card-year', a.year));
      card.appendChild(head);
      card.appendChild(text('h3', null, a.title));
      if (a.issuer) card.appendChild(text('p', 'card-desc', a.issuer));
      if (a.description) card.appendChild(text('p', 'card-desc', a.description));
      container.appendChild(card);
    });
  }

  /* ---------- Updates ---------- */
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr || '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderUpdates() {
    const container = document.getElementById('updates-list');
    if (!container || typeof UPDATES_DATA === 'undefined') return;

    if (!Array.isArray(UPDATES_DATA) || UPDATES_DATA.length === 0) {
      showEmptyState(container, 'No updates yet.', 'Add entries in data/updates.js');
      return;
    }

    const sorted = [...UPDATES_DATA].sort((a, b) => new Date(b.date) - new Date(a.date));
    sorted.forEach((u) => {
      if (!u || !u.title) return;
      const item = el('article', 'update-item');
      item.appendChild(text('p', 'update-date', formatDate(u.date)));
      item.appendChild(text('h3', null, u.title));
      if (u.body) item.appendChild(text('p', null, u.body));
      container.appendChild(item);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderSkills();
    renderPortfolio();
    renderEducation();
    renderExperience();
    renderAchievements();
    renderUpdates();
  });
})();
