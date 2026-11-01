/**
 * Shared text helpers, used by the app in the browser and by scripts/build.mjs
 * (which pre-renders the pages for search engines). Keep it plain ES2015+ with no DOM access.
 */
(function (root) {
  'use strict';

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Minimal Markdown: paragraphs, - / 1. lists, `code`, **bold**, ``` fenced blocks.
  function inline(t) {
    return esc(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
  function codeBlock(code) {
    return `<div class="codeblock"><pre><code>${esc(code)}</code></pre><button type="button" class="copy">Copy</button></div>`;
  }
  function md(src) {
    let out = '';
    src.split(/```\w*\n([\s\S]*?)```/).forEach((part, i) => {
      if (i % 2) { out += codeBlock(part.replace(/\n$/, '')); return; }
      let listType = null;
      const close = () => { if (listType) { out += `</${listType}>`; listType = null; } };
      part.split('\n').forEach(line => {
        const ul = line.match(/^\s*- (.*)/), ol = line.match(/^\s*\d+\. (.*)/);
        const m = ul || ol, type = ul ? 'ul' : ol ? 'ol' : null;
        if (m) {
          if (listType !== type) { close(); out += `<${type}>`; listType = type; }
          out += `<li>${inline(m[1])}</li>`;
        } else {
          close();
          if (line.trim()) out += `<p>${inline(line)}</p>`;
        }
      });
      close();
    });
    return out;
  }

  // URL slug for a question's own page, e.g. "What are closures?" -> "what-are-closures".
  // The build fails if two questions in one track get the same slug.
  function slugify(text) {
    let s = String(text).toLowerCase()
      .replace(/[`*]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (s.length > 80) s = s.slice(0, 80).replace(/-[^-]*$/, '');
    return s;
  }

  root.MD = { esc, inline, codeBlock, md, slugify };
})(typeof window !== 'undefined' ? window : globalThis);
