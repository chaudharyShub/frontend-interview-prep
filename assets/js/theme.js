// Runs before first paint so the saved theme is applied without a flash.
(function () {
  try {
    var t = localStorage.getItem('fip-theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch (e) { /* storage unavailable */ }
})();

// Entrance motion plays only while data-intro is set (see "Motion" in styles.css),
// so lists that are hidden and shown again later don't replay it.
(function () {
  var root = document.documentElement;
  root.dataset.intro = '';
  setTimeout(function () { delete root.dataset.intro; }, 2000);
})();

// On a track or starred page (/app/react, /app/starred), hide the track list before first paint.
// app.html shows it by default so search engines can read it.
(function () {
  try {
    var page = location.protocol === 'file:' ? '' : location.pathname.split('/').filter(Boolean)[1];
    if (page || /[?&]track=/.test(location.search)) document.documentElement.dataset.view = 'list';
  } catch (e) { /* ignore */ }
})();
