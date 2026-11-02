/**
 * HTML & CSS preview, running inside a sandboxed iframe (html-preview.html).
 * The editor posts { type: 'render', code }; this puts the user's markup in the body and their
 * <style> blocks in the head. The page starts with no styles of its own, like a fresh browser tab.
 *
 * No user JavaScript runs: script-like elements and on* attributes are removed, and the page's
 * security policy blocks anything left. The iframe has `sandbox="allow-scripts"` (for this file
 * only, no allow-same-origin), so nothing here can read the main page or its saved progress.
 */
(function () {
  'use strict';

  const parentWin = window.parent;
  const send = msg => parentWin.postMessage(Object.assign({ source: 'fip-preview' }, msg), '*');

  // Elements that would run code, load other pages or change how this page works.
  const REMOVE = 'script, iframe, frame, frameset, object, embed, base, meta, link, noscript, portal';

  function copyAttributes(from, to) {
    [...to.attributes].forEach(a => to.removeAttribute(a.name));
    [...from.attributes].forEach(a => to.setAttribute(a.name, a.value));
  }

  function render(code) {
    const doc = new DOMParser().parseFromString(code, 'text/html');
    const removed = new Set();

    doc.querySelectorAll(REMOVE).forEach(el => { removed.add(`<${el.localName}>`); el.remove(); });
    doc.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(a => {
        if (/^on/i.test(a.name)) { removed.add('on… event attributes'); el.removeAttribute(a.name); }
        else if (/^\s*javascript:/i.test(a.value)) { removed.add('javascript: links'); el.removeAttribute(a.name); }
      });
    });

    // Styles go in the head, in source order, replacing the previous render's.
    document.querySelectorAll('style[data-user]').forEach(s => s.remove());
    doc.querySelectorAll('style').forEach(s => {
      const copy = document.createElement('style');
      copy.dataset.user = '';
      if (s.media) copy.media = s.media;
      copy.textContent = s.textContent;
      document.head.appendChild(copy);
      s.remove();
    });

    copyAttributes(doc.documentElement, document.documentElement);
    copyAttributes(doc.body, document.body);
    if (!document.documentElement.lang) document.documentElement.lang = 'en';
    document.body.replaceChildren(...[...doc.body.childNodes].map(n => document.importNode(n, true)));

    if (removed.size) {
      send({ type: 'note', text: `Removed ${[...removed].join(', ')}. JavaScript doesn't run in the HTML & CSS preview.` });
    }
    send({ type: 'rendered' });
  }

  // Links and forms would navigate the frame away from this page. Same-page #links still scroll.
  document.addEventListener('click', e => {
    const a = e.target instanceof Element && e.target.closest('a[href]');
    if (!a) return;
    e.preventDefault();
    const hash = a.getAttribute('href');
    if (hash.length > 1 && hash[0] === '#') {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }, true);
  document.addEventListener('submit', e => e.preventDefault(), true);

  window.addEventListener('message', e => {
    if (e.source !== parentWin) return;
    const msg = e.data || {};
    if (msg.type === 'ping') send({ type: 'pong' });
    else if (msg.type === 'render') render(String(msg.code || ''));
  });

  send({ type: 'ready' });
})();
