// Runs before first paint so the saved theme is applied without a flash.
(function () {
  try {
    var t = localStorage.getItem('fip-theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch (e) { /* storage unavailable */ }
})();
