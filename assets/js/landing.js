// Landing page: theme toggle (same behaviour and storage key as app.js).
(function () {
  'use strict';
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var btn = document.getElementById('themeBtn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var current = root.dataset.theme || (media.matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('fip-theme', next); } catch (e) { /* ignore */ }
  });
})();

// Sections fade and rise in as they scroll into view; cards in a grid follow one another.
// Content is hidden only once this runs, so it is always shown without JavaScript,
// with reduced motion, or in browsers without IntersectionObserver.
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var items = [];
  document.querySelectorAll('.lp-section .container > *').forEach(function (el) {
    var isGrid = el.matches('.lp-tracks, .lp-steps, .lp-features');
    var targets = isGrid ? Array.prototype.slice.call(el.children) : [el];
    targets.forEach(function (target, i) {
      target.classList.add('reveal');
      if (isGrid) target.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
      items.push(target);
    });
  });

  // Once shown, drop the classes so hover effects use their normal timing again.
  function done(e) {
    var el = e.currentTarget;
    if (e.target !== el) return;
    el.removeEventListener('transitionend', done);
    el.classList.remove('reveal', 'shown');
    el.style.transitionDelay = '';
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.addEventListener('transitionend', done);
      entry.target.classList.add('shown');
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  items.forEach(function (el) { observer.observe(el); });
})();
