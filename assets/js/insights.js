// Loads Vercel Web Analytics (anonymous, cookie-free visit counts) and Speed Insights (page
// speed). Both are served from this site, so the CSP is unchanged.
//
// The site owner's own browsers are left out. Opening the site with the secret token after `#`
// marks that browser as the owner's; adding `.on` to it undoes that. Only the token's SHA-256
// is here, so reading this code doesn't reveal it, and the browser stores the token itself
// (checked on every visit), so a hand-made localStorage value doesn't work either. The part
// after `#` is never sent to a server. Nothing analytics-related loads until the check is done.
(function () {
  var OWNER_TOKEN_SHA256 = '00ad41f213985ec4c69bf6fd3eb60c220399829190ca21e5c4001ddfc9dbe05b';
  var TURN_ON_SUFFIX = '.on';
  var STORAGE_KEY = 'fip-owner-device';
  var SCRIPTS = ['/_vercel/insights/script.js', '/_vercel/speed-insights/script.js'];
  var loaded = false;

  function sha256Hex(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (digest) {
      return Array.from(new Uint8Array(digest), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function matchesToken(token) {
    if (!token) return Promise.resolve(false);
    return sha256Hex(token).then(function (hex) { return hex === OWNER_TOKEN_SHA256; });
  }

  // Resolves true when this browser belongs to the owner. Handles the secret link first.
  function isOwnerDevice() {
    var fromLink = decodeURIComponent(location.hash.slice(1));
    var turnOn = fromLink.slice(-TURN_ON_SUFFIX.length) === TURN_ON_SUFFIX;
    var token = turnOn ? fromLink.slice(0, -TURN_ON_SUFFIX.length) : fromLink;
    return matchesToken(token).then(function (fromLinkMatches) {
      if (fromLinkMatches) {
        // Take the token out of the address bar (and so out of history and anything shared).
        history.replaceState(null, '', location.pathname + location.search);
        if (turnOn) {
          localStorage.removeItem(STORAGE_KEY);
          alert('Analytics is back on for this browser.');
          return false;
        }
        localStorage.setItem(STORAGE_KEY, token);
        alert("This browser won't be counted in analytics.");
        return true;
      }
      return matchesToken(localStorage.getItem(STORAGE_KEY));
    });
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    SCRIPTS.forEach(function (src) {
      var s = document.createElement('script');
      s.src = src;
      s.defer = true;
      document.head.appendChild(s);
    });
  }

  function check() {
    // If the check fails (no crypto.subtle, storage blocked), count the visit as normal.
    Promise.resolve()
      .then(isOwnerDevice)
      .catch(function () { return false; })
      .then(function (owner) { if (!owner) loadAnalytics(); });
  }

  check();
  // So pasting the link into an already open tab works too.
  addEventListener('hashchange', check);
})();
