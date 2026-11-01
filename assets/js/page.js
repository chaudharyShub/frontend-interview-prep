/**
 * Script for the static pages (one page per question, and the 404 page).
 * The checklist pages use app.js instead.
 */
(function () {
  'use strict';

  // Theme toggle (same behaviour and storage key as app.js).
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const btn = document.getElementById('themeBtn');
  if (btn) btn.addEventListener('click', () => {
    const next = (root.dataset.theme || (media.matches ? 'dark' : 'light')) === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('fip-theme', next); } catch (e) { /* ignore */ }
  });

  // Copy buttons on code blocks.
  document.addEventListener('click', e => {
    const copy = e.target.closest('.copy');
    if (!copy) return;
    const done = ok => {
      copy.textContent = ok ? 'Copied' : 'Copy failed';
      setTimeout(() => { copy.textContent = 'Copy'; }, 1500);
    };
    const text = copy.previousElementSibling.textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
    else done(false);
  });
})();
