// Registers the service worker (sw.js) so the app can be installed and used offline.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () { /* unsupported or blocked */ });
  });
}
