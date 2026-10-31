(function () {
  'use strict';

  const DATA = window.QUESTIONS || [];

  // ---------- Storage ----------
  // Progress used to live under an older key; migrate it so existing visitors keep their ticks.
  const KEY = 'fip-progress-v1';
  const KEY_CLOSED = 'fip-closed-v1';
  const KEY_THEME = 'fip-theme';
  const LEGACY_KEY = 'infosys-react-checklist-v1';

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
    },
  };

  (function migrate() {
    try {
      if (localStorage.getItem(KEY) == null && localStorage.getItem(LEGACY_KEY) != null) {
        localStorage.setItem(KEY, localStorage.getItem(LEGACY_KEY));
        const oldClosed = localStorage.getItem(LEGACY_KEY + '-closed');
        if (oldClosed != null) localStorage.setItem(KEY_CLOSED, oldClosed);
        localStorage.removeItem(LEGACY_KEY);
        localStorage.removeItem(LEGACY_KEY + '-closed');
      }
    } catch (e) { /* ignore */ }
  })();

  const state = store.get(KEY, {});
  const closed = new Set(store.get(KEY_CLOSED, []));
  const save = () => store.set(KEY, state);
  const saveClosed = () => store.set(KEY_CLOSED, [...closed]);

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CHEV = '<svg class="chev" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHEV_SM = '<svg class="chev-sm" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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
  const plain = s => (s || '').replace(/[`*]/g, '').toLowerCase();

  // ---------- Render ----------
  const list = $('#list');
  const toc = $('#toc');
  const ANSWERS = {};
  const CODE = {};
  let totalQuestions = 0, priorityCount = 0;

  DATA.forEach((sec, si) => {
    const sid = `topic-${si + 1}`;
    const el = document.createElement('section');
    el.className = 'section' + (closed.has(si) ? ' closed' : '');
    el.id = sid;
    el.dataset.si = si;

    let html = `<button type="button" class="section-head" aria-expanded="${!closed.has(si)}" aria-controls="${sid}-body">
        <span class="section-num">${si + 1}</span>
        <h2 class="section-title">${esc(sec.title)}</h2>
        <span class="section-meta"><span class="section-count"></span><span class="bar"><span class="bar-fill"></span></span></span>
        ${CHEV}
      </button><div class="section-body" id="${sid}-body">`;

    let group = null, open = false;
    sec.items.forEach(it => {
      totalQuestions++;
      if (it.top) priorityCount++;
      if (it.a) ANSWERS[it.id] = it.a;
      if (it.code) CODE[it.id] = it.code;

      if (it.group && it.group !== group) {
        if (open) html += '</ul>';
        html += `<div class="group">${esc(it.group)}</div><ul class="qlist">`;
        group = it.group; open = true;
      } else if (!open) { html += '<ul class="qlist">'; open = true; }

      const cid = `q-${esc(it.id)}`;
      const badges = (it.top ? '<span class="badge badge-star">★ Priority</span>' : '');
      const search = plain(it.q + ' ' + (it.note || '') + ' ' + (it.a || '') + ' ' + (it.code || ''));

      html += `<li class="qitem" data-id="${esc(it.id)}" data-text="${esc(search)}"${it.top ? ' data-top="1"' : ''}>
        <label class="qrow" for="${cid}">
          <input type="checkbox" class="check" id="${cid}">
          <span class="qn">${esc(it.n)}</span>
          <span class="qbody"><span class="qt">${esc(it.q)}</span>${badges ? `<span class="badges">${badges}</span>` : ''}
          ${it.note ? `<span class="note">${esc(it.note)}</span>` : ''}</span>
        </label>
        ${it.code || it.a ? `<div class="more"><div class="more-btns">
          ${it.code ? `<button type="button" class="linkbtn codebtn" aria-expanded="false">Show code ${CHEV_SM}</button>` : ''}
          ${it.a ? `<button type="button" class="linkbtn ansbtn" aria-expanded="false">Show answer ${CHEV_SM}</button>` : ''}
        </div>
        ${it.code ? '<div class="qcode hidden"></div>' : ''}
        ${it.a ? '<div class="answer hidden"></div>' : ''}</div>` : ''}
      </li>`;
    });
    html += '</ul></div>';
    el.innerHTML = html;
    list.appendChild(el);

    const li = document.createElement('li');
    li.innerHTML = `<a href="#${sid}" data-si="${si}"><span>${esc(sec.title)}</span><span class="toc-count"></span><span class="bar"><span class="bar-fill"></span></span></a>`;
    toc.appendChild(li);
  });

  $('#statTotal').textContent = totalQuestions;
  $('#statSections').textContent = DATA.length;
  $('#statPriority').textContent = priorityCount;

  const allItems = $$('.qitem');
  const sections = $$('.section');
  const tocLinks = $$('#toc a');

  // ---------- Questions ----------
  function setLabel(btn, open, noun) {
    btn.setAttribute('aria-expanded', String(open));
    btn.firstChild.textContent = `${open ? 'Hide' : 'Show'} ${noun} `;
  }
  function setAnswer(li, show) {
    const box = $('.answer', li);
    if (!box) return;
    if (show && !box.innerHTML) box.innerHTML = md(ANSWERS[li.dataset.id]);
    box.classList.toggle('hidden', !show);
    setLabel($('.ansbtn', li), show, 'answer');
  }
  function setCode(li, show) {
    const box = $('.qcode', li);
    if (!box) return;
    if (show && !box.innerHTML) box.innerHTML = codeBlock(CODE[li.dataset.id]);
    box.classList.toggle('hidden', !show);
    setLabel($('.codebtn', li), show, 'code');
  }

  allItems.forEach(li => {
    const cb = $('.check', li);
    cb.checked = !!state[li.dataset.id];
    li.classList.toggle('done', cb.checked);
    cb.addEventListener('change', () => {
      if (cb.checked) state[li.dataset.id] = 1; else delete state[li.dataset.id];
      li.classList.toggle('done', cb.checked);
      save(); refresh();
    });
    const cbtn = $('.codebtn', li);
    if (cbtn) cbtn.addEventListener('click', () => setCode(li, $('.qcode', li).classList.contains('hidden')));
    const abtn = $('.ansbtn', li);
    if (abtn) abtn.addEventListener('click', () => setAnswer(li, $('.answer', li).classList.contains('hidden')));
  });

  // Copy buttons (delegated, since code blocks render lazily).
  list.addEventListener('click', e => {
    const btn = e.target.closest('.copy');
    if (!btn) return;
    const text = btn.previousElementSibling.textContent;
    const done = ok => {
      btn.textContent = ok ? 'Copied' : 'Copy failed';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
    else done(false);
  });

  let answersOpen = false;
  $('#toggleAnswers').addEventListener('click', e => {
    answersOpen = !answersOpen;
    allItems.forEach(li => setAnswer(li, answersOpen));
    e.currentTarget.textContent = answersOpen ? 'Hide all answers' : 'Show all answers';
  });

  // ---------- Sections ----------
  function setSectionOpen(s, open) {
    const si = +s.dataset.si;
    s.classList.toggle('closed', !open);
    $('.section-head', s).setAttribute('aria-expanded', String(open));
    open ? closed.delete(si) : closed.add(si);
  }
  sections.forEach(s => $('.section-head', s).addEventListener('click', () => {
    setSectionOpen(s, s.classList.contains('closed'));
    saveClosed(); updateToggleLabel();
  }));

  function updateToggleLabel() {
    $('#toggleAll').textContent = $('.section:not(.closed)') ? 'Collapse all' : 'Expand all';
  }
  $('#toggleAll').addEventListener('click', () => {
    const collapse = !!$('.section:not(.closed)');
    sections.forEach(s => setSectionOpen(s, !collapse));
    saveClosed(); updateToggleLabel();
  });

  // Opening a topic from the sidebar expands it if collapsed.
  tocLinks.forEach(a => a.addEventListener('click', () => {
    const s = sections[+a.dataset.si];
    if (s.classList.contains('closed')) { setSectionOpen(s, true); saveClosed(); updateToggleLabel(); }
  }));

  // ---------- Filter & search ----------
  let filter = 'all';
  const search = $('#q');

  function refresh() {
    const term = search.value.trim().toLowerCase();
    let total = 0, done = 0, anyVisible = false, matches = 0;

    sections.forEach((s, si) => {
      const items = $$('.qitem', s);
      const d = items.filter(li => $('.check', li).checked).length;
      total += items.length; done += d;
      const pct = items.length ? (100 * d / items.length) : 0;
      const complete = d === items.length;

      $('.section-count', s).textContent = `${d} / ${items.length}`;
      $('.section-meta .bar-fill', s).style.width = pct + '%';
      s.classList.toggle('complete', complete);

      const link = tocLinks[si];
      $('.toc-count', link).textContent = `${d}/${items.length}`;
      $('.bar-fill', link).style.width = pct + '%';
      link.classList.toggle('complete', complete);

      let vis = 0;
      items.forEach(li => {
        const c = $('.check', li).checked;
        const show = (!term || li.dataset.text.includes(term)) &&
          (filter === 'all' || (filter === 'done' && c) || (filter === 'todo' && !c) || (filter === 'top' && li.dataset.top));
        li.classList.toggle('hidden', !show);
        if (show) vis++;
      });
      $$('.group', s).forEach(g => {
        g.classList.toggle('hidden', !$('.qitem:not(.hidden)', g.nextElementSibling));
      });
      s.classList.toggle('hidden', vis === 0);
      // While searching, show matches even inside collapsed sections.
      $('.section-body', s).classList.toggle('force-open', !!term);
      link.parentElement.classList.toggle('hidden', vis === 0);
      if (vis) anyVisible = true;
      matches += vis;
    });

    const pct = total ? Math.round(100 * done / total) : 0;
    $('#statPct').textContent = pct + '%';
    $('#statDone').textContent = `${done} of ${total} done`;
    $('#ovbar').style.width = (total ? 100 * done / total : 0) + '%';
    $('#ovbarWrap').setAttribute('aria-valuenow', String(pct));
    $('#empty').classList.toggle('hidden', anyVisible);
    $('#resultCount').textContent = term || filter !== 'all'
      ? `Showing ${matches} of ${total} questions` : '';
  }

  search.addEventListener('input', refresh);
  $$('#filter button').forEach(b => b.addEventListener('click', () => {
    $$('#filter button').forEach(x => {
      x.classList.toggle('on', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    filter = b.dataset.f;
    refresh();
  }));

  $('#reset').addEventListener('click', () => {
    if (!confirm('Reset all progress? This unticks every question.')) return;
    for (const k in state) delete state[k];
    save();
    allItems.forEach(li => { $('.check', li).checked = false; li.classList.remove('done'); });
    refresh();
  });

  // Keyboard: "/" focuses search, Escape clears it.
  document.addEventListener('keydown', e => {
    const t = e.target;
    const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); search.focus(); search.select();
    } else if (e.key === 'Escape' && t === search) {
      search.value = ''; refresh(); search.blur();
    }
  });

  // ---------- Sidebar: highlight the topic in view ----------
  if ('IntersectionObserver' in window) {
    const visible = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => visible.set(en.target, en.isIntersecting));
      const current = sections.find(s => visible.get(s));
      tocLinks.forEach(a => a.classList.toggle('active', !!current && +a.dataset.si === +current.dataset.si));
    }, { rootMargin: '-140px 0px -55% 0px' });
    sections.forEach(s => io.observe(s));
  }

  // ---------- Theme ----------
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const effectiveTheme = () => root.dataset.theme || (media.matches ? 'dark' : 'light');
  $('#themeBtn').addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem(KEY_THEME, next); } catch (e) { /* ignore */ }
  });

  updateToggleLabel();
  refresh();
})();
