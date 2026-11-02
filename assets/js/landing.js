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
