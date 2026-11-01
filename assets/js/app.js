(function () {
  'use strict';

  const TRACKS = (window.TRACKS || []);
  const FROM_DISK = location.protocol === 'file:';

  // ---------- Storage ----------
  // Progress used to live under an older key; migrate it so existing visitors keep their ticks.
  const KEY = 'fip-progress-v1';
  const KEY_CLOSED = 'fip-closed-v2';   // collapsed sections, keyed by "track/tab/section title"
  const KEY_STARRED = 'fip-starred-v1';
  const KEY_LAST = 'fip-last-v1';       // last track and tab visited
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
        localStorage.removeItem(LEGACY_KEY);
        localStorage.removeItem(LEGACY_KEY + '-closed');
      }
      localStorage.removeItem('fip-closed-v1'); // was keyed by topic position, which no longer exists
    } catch (e) { /* ignore */ }
  })();

  const state = store.get(KEY, {});
  const closed = new Set(store.get(KEY_CLOSED, []));
  const starred = new Set(store.get(KEY_STARRED, []));
  const save = () => store.set(KEY, state);
  const saveClosed = () => store.set(KEY_CLOSED, [...closed]);
  const saveStarred = () => store.set(KEY_STARRED, [...starred]);

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  const CHEV = '<svg class="chev" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const STAR = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
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

  // ---------- Question index ----------
  // Every question, with where it lives: { item, track, tab, section, text }.
  const ENTRIES = [];
  TRACKS.forEach(track => track.tabs.forEach(tab => tab.sections.forEach(section => section.items.forEach(item => {
    ENTRIES.push({ item, track, tab, section, text: plain(`${item.q} ${item.note || ''} ${item.a || ''} ${item.code || ''}`) });
  }))));
  const idsOf = pred => ENTRIES.filter(pred).map(e => e.item.id);
  const countDone = ids => ids.filter(id => state[id]).length;
  const label = t => t.short || t.title;

  // ---------- Routing ----------
  // Over http: /react, /react?tab=coding, /starred (Vercel rewrites these to index.html).
  // From disk:  index.html?track=react&tab=coding. `?track=` also works over http.
  function link(track, tab, hash) {
    let url;
    if (FROM_DISK) url = 'index.html' + (track ? `?track=${track}${tab ? `&tab=${tab}` : ''}` : '');
    else url = track ? `${track}${tab ? `?tab=${tab}` : ''}` : './';
    return url + (hash ? `#${hash}` : '');
  }
  const params = new URLSearchParams(location.search);
  let slug = params.get('track') || '';
  if (!slug && !FROM_DISK) slug = decodeURIComponent(location.pathname.split('/').filter(Boolean).pop() || '');
  const track = TRACKS.find(t => t.slug === slug) || null;
  const view = slug === 'starred' ? 'starred' : track ? 'track' : 'home';
  const tab = track ? (track.tabs.find(t => t.slug === params.get('tab')) || track.tabs[0] || null) : null;

  // ---------- Page meta (title, description, canonical) ----------
  function setMeta(title, description, path) {
    document.title = title;
    const set = (sel, attr, v) => { const el = $(sel); if (el) el.setAttribute(attr, v); };
    set('meta[name="description"]', 'content', description);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', description);
    const canonical = $('link[rel="canonical"]');
    if (canonical) {
      const url = new URL(path, canonical.href).href;
      canonical.href = url;
      set('meta[property="og:url"]', 'content', url);
    }
  }

  // ---------- Breadcrumbs ----------
  // crumbs: [{ name, href }]; the last one is the current page (no link).
  // Also adds BreadcrumbList data for search engines (a data block, so the security policy allows it).
  function setBreadcrumbs(crumbs) {
    const nav = $('#breadcrumb');
    nav.innerHTML = '<ol>' + crumbs.map((c, i) => i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.href}">${esc(c.name)}</a></li>`).join('') + '</ol>';
    nav.classList.remove('hidden');
    $('#heroEyebrow').classList.add('hidden');

    const canonical = $('link[rel="canonical"]');
    if (!canonical) return;
    const site = new URL('./', canonical.href);
    const data = document.createElement('script');
    data.type = 'application/ld+json';
    data.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: new URL(c.path, site).href,
      })),
    });
    document.head.appendChild(data);
  }

  // ---------- Header: track links ----------
  $('#trackNav').innerHTML = TRACKS.filter(t => !t.comingSoon).map(t =>
    `<a href="${link(t.slug)}"${track === t ? ' aria-current="page"' : ''}>${esc(label(t))}</a>`).join('') +
    `<a href="${link('starred')}"${view === 'starred' ? ' aria-current="page"' : ''}>★ Starred</a>`;

  // ---------- Hero stats ----------
  function setStats(ids, secondCount, secondLabel) {
    const done = countDone(ids);
    const pct = ids.length ? Math.round(100 * done / ids.length) : 0;
    $('#statTotal').textContent = ids.length;
    $('#statSections').textContent = secondCount;
    $('#statSectionsLabel').textContent = secondLabel;
    $('#statStarred').textContent = ids.filter(id => starred.has(id)).length;
    $('#statPct').textContent = pct + '%';
    $('#statDone').textContent = `${done} of ${ids.length} done`;
    $('#ovbar').style.width = (ids.length ? 100 * done / ids.length : 0) + '%';
    $('#ovbarWrap').setAttribute('aria-valuenow', String(pct));
  }

  // ---------- Confirm dialog (replaces the browser's confirm()) ----------
  const dlg = $('#confirmDialog');
  let settle = null;
  function confirmDialog({ title, message, confirmText = 'Confirm' }) {
    if (typeof dlg.showModal !== 'function') return Promise.resolve(confirm(`${title}\n\n${message}`));
    $('#confirmTitle').textContent = title;
    $('#confirmMsg').textContent = message;
    $('#confirmOk').textContent = confirmText;
    dlg.showModal();
    $('#confirmCancel').focus(); // safer default for destructive actions
    return new Promise(resolve => { settle = resolve; });
  }
  function finish(ok) {
    if (dlg.open) dlg.close();
    if (settle) { const s = settle; settle = null; s(ok); }
  }
  $('#confirmOk').addEventListener('click', () => finish(true));
  $('#confirmCancel').addEventListener('click', () => finish(false));
  dlg.addEventListener('click', e => { if (e.target === dlg) finish(false); }); // backdrop
  dlg.addEventListener('cancel', e => { e.preventDefault(); finish(false); });  // Escape
  dlg.addEventListener('close', () => finish(false));                          // any other close

  async function resetProgress(ids, scopeText) {
    const done = countDone(ids);
    const ok = await confirmDialog({
      title: 'Reset progress?',
      message: done
        ? `This unticks the ${plural(done, 'question')} you've marked as done ${scopeText}. Your starred questions and code are kept. This can't be undone.`
        : `You haven't ticked any questions ${scopeText} yet, so there's nothing to reset.`,
      confirmText: 'Reset progress',
    });
    if (!ok) return false;
    ids.forEach(id => { delete state[id]; });
    save();
    return true;
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

  // Shared helpers for the code editor (editor.js).
  window.FIP = { $, esc, inline, store, confirmDialog };

  if (view === 'home') renderHome();
  else renderList();

  // =====================================================================
  // Home: track cards, continue link, global search
  // =====================================================================
  function renderHome() {
    $('#homeView').classList.remove('hidden');
    $('.skip-link').setAttribute('href', '#homeView');
    $('.skip-link').textContent = 'Skip to tracks';
    const live = TRACKS.filter(t => !t.comingSoon);
    const allIds = ENTRIES.map(e => e.item.id);
    const updateStats = () => setStats(allIds, live.length, 'Tracks');
    updateStats();
    $('#starredLink').href = link('starred');

    // Continue where you left off.
    const last = store.get(KEY_LAST, null);
    const lastTrack = last && TRACKS.find(t => t.slug === last.track && !t.comingSoon);
    const lastTab = lastTrack && lastTrack.tabs.find(t => t.slug === last.tab);
    if (lastTrack && lastTab) {
      const c = $('#continue');
      c.href = link(lastTrack.slug, lastTab.slug === lastTrack.tabs[0].slug ? '' : lastTab.slug);
      c.innerHTML = `<span class="continue-label">Continue where you left off</span><span class="continue-where">${esc(label(lastTrack))} · ${esc(lastTab.title)} →</span>`;
      c.classList.remove('hidden');
    }

    // Track cards.
    const grid = $('#trackGrid');
    function renderCards() {
      grid.innerHTML = TRACKS.map(t => {
        if (t.comingSoon) {
          return `<div class="track-card soon"><div class="track-top"><h3>${esc(t.title)}</h3><span class="badge">Coming soon</span></div><p>${esc(t.description)}</p></div>`;
        }
        const ids = idsOf(e => e.track === t);
        const done = countDone(ids);
        const stars = ids.filter(id => starred.has(id)).length;
        const tabs = t.tabs.map(tb => `${t.tabs.length > 1 ? `${tb.sections.reduce((n, s) => n + s.items.length, 0)} ` : ''}${tb.title.toLowerCase()}`);
        return `<a class="track-card${done === ids.length && ids.length ? ' complete' : ''}" href="${link(t.slug)}">
          <div class="track-top"><h3>${esc(t.title)}</h3>${stars ? `<span class="track-stars" title="Starred">★ ${stars}</span>` : ''}</div>
          <p>${esc(t.description)}</p>
          <p class="track-tabs">${t.tabs.length > 1 ? esc(tabs.join(' · ')) : esc(plural(ids.length, 'question'))}</p>
          <div class="track-progress"><span class="bar"><span class="bar-fill" data-pct="${ids.length ? 100 * done / ids.length : 0}"></span></span><span class="track-done">${done} / ${ids.length}</span></div>
        </a>`;
      }).join('');
      // Widths are set here, not in a style attribute, because the page's security policy blocks inline styles.
      $$('.bar-fill[data-pct]', grid).forEach(b => { b.style.width = b.dataset.pct + '%'; });
    }
    renderCards();

    // Global search.
    const gq = $('#gq'), results = $('#gresults'), body = $('#homeBody');
    function runSearch() {
      const term = gq.value.trim().toLowerCase();
      body.classList.toggle('hidden', !!term);
      results.classList.toggle('hidden', !term);
      if (!term) { results.innerHTML = ''; return; }
      // Within each track, questions whose title matches come before answer-only matches.
      const inTitle = e => e.item.q.toLowerCase().includes(term) ? 0 : 1;
      const hits = ENTRIES.filter(e => e.text.includes(term))
        .map((e, i) => ({ e, i }))
        .sort((x, y) => TRACKS.indexOf(x.e.track) - TRACKS.indexOf(y.e.track) || inTitle(x.e) - inTitle(y.e) || x.i - y.i)
        .map(x => x.e);
      if (!hits.length) {
        results.innerHTML = '<p class="gr-empty">No questions match. Try a different search term.</p>';
        return;
      }
      const LIMIT = 80;
      let html = `<p class="result-count">${hits.length > LIMIT ? `Showing the first ${LIMIT} of ${hits.length} matches` : `${plural(hits.length, 'question')} found`}</p>`;
      let current = null;
      hits.slice(0, LIMIT).forEach(e => {
        if (e.track !== current) {
          if (current) html += '</ul>';
          html += `<h3 class="gr-track">${esc(e.track.title)}</h3><ul class="gr-list">`;
          current = e.track;
        }
        const id = e.item.id;
        const tabSlug = e.tab === e.track.tabs[0] ? '' : e.tab.slug;
        html += `<li><a href="${link(e.track.slug, tabSlug, 'question-' + id)}">
          <span class="gr-q">${esc(e.item.q)}</span>
          <span class="gr-meta">${esc(e.tab.title)} · ${esc(e.section.title)}${state[id] ? ' · <span class="gr-done">Done</span>' : ''}${starred.has(id) ? ' · <span class="gr-star">★ Starred</span>' : ''}</span>
        </a></li>`;
      });
      results.innerHTML = html + '</ul>';
    }
    gq.addEventListener('input', runSearch);
    if (gq.value) runSearch(); // the browser may restore the field on back/forward

    $('#resetAll').addEventListener('click', async () => {
      if (await resetProgress(allIds, 'across all tracks')) { updateStats(); renderCards(); runSearch(); }
    });

    document.addEventListener('keydown', e => {
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault(); gq.focus(); gq.select();
      } else if (e.key === 'Escape' && t === gq) {
        gq.value = ''; runSearch(); gq.blur();
      }
    });
  }

  // =====================================================================
  // Track tab or starred list
  // =====================================================================
  function renderList() {
    $('#trackView').classList.remove('hidden');
    let sections, scope, scopeIds;

    if (view === 'track') {
      store.set(KEY_LAST, tab ? { track: track.slug, tab: tab.slug } : null);
      const firstTab = track.tabs[0];
      const isFirst = !tab || tab === firstTab;
      setMeta(
        `${track.title} interview questions${tab && track.tabs.length > 1 ? ` – ${tab.title}` : ''} – Frontend Interview Prep`,
        track.description,
        track.slug + (isFirst ? '' : `?tab=${tab.slug}`));
      const crumbs = [{ name: 'Home', href: link(), path: '' }];
      if (tab && track.tabs.length > 1) {
        crumbs.push({ name: track.title, href: link(track.slug), path: track.slug });
        crumbs.push({ name: tab.title, path: track.slug + (isFirst ? '' : `?tab=${tab.slug}`) });
      } else {
        crumbs.push({ name: track.title, path: track.slug });
      }
      setBreadcrumbs(crumbs);
      $('#heroTitle').textContent = `${track.title} interview questions`;
      $('#heroLead').textContent = track.description;
      scope = `${track.slug}/${tab ? tab.slug : ''}`;
      sections = tab ? tab.sections.map(s => ({ key: `${scope}/${s.title}`, title: s.title, items: s.items })) : [];
      scopeIds = idsOf(e => e.track === track);

      // Tabs (only when the track has more than one).
      if (track.tabs.length > 1) {
        const tabsEl = $('#tabs');
        tabsEl.classList.remove('hidden');
        const renderTabs = () => {
          tabsEl.innerHTML = track.tabs.map(tb => {
            const ids = idsOf(e => e.track === track && e.tab === tb);
            const on = tb === tab;
            return `<a class="tab${on ? ' on' : ''}" href="${link(track.slug, tb === firstTab ? '' : tb.slug)}"${on ? ' aria-current="page"' : ''}>${esc(tb.title)} <span class="tab-count">${countDone(ids)}/${ids.length}</span></a>`;
          }).join('');
        };
        renderTabs();
        renderList.afterRefresh = renderTabs;
      }
    } else {
      setMeta('Starred questions – Frontend Interview Prep', 'Your starred frontend interview questions, from every track.', 'starred');
      setBreadcrumbs([{ name: 'Home', href: link(), path: '' }, { name: 'Starred', path: 'starred' }]);
      $('#heroTitle').textContent = 'Starred questions';
      $('#heroLead').textContent = 'Every question you starred, from all tracks. Unstar a question once you can answer it confidently.';
      $('#tocTitle').textContent = 'Tracks';
      $('.seg button[data-f="star"]').remove(); // everything here is starred
      $('#reset').remove();
      scope = 'starred';
      sections = TRACKS.map(t => ({
        key: `starred/${t.slug}`,
        title: t.title,
        items: ENTRIES.filter(e => e.track === t && starred.has(e.item.id)).map(e => e.item),
      })).filter(s => s.items.length);
      scopeIds = sections.flatMap(s => s.items.map(it => it.id));
    }

    // Stats cover the whole track (all tabs), or everything starred.
    const secondCount = view === 'starred' ? sections.length : track.tabs.reduce((n, t) => n + t.sections.length, 0);
    const secondLabel = view === 'starred' ? (secondCount === 1 ? 'Track' : 'Tracks') : (secondCount === 1 ? 'Section' : 'Sections');
    const updateStats = () => setStats(scopeIds, secondCount, secondLabel);

    // ---------- Render sections ----------
    const list = $('#list');
    const toc = $('#toc');
    const ANSWERS = {};
    const CODE = {};
    let num = 0;

    sections.forEach((sec, si) => {
      const sid = `section-${si + 1}`;
      const isClosed = closed.has(sec.key);
      const el = document.createElement('section');
      el.className = 'section' + (isClosed ? ' closed' : '');
      el.id = sid;
      el.dataset.si = si;
      el.dataset.key = sec.key;

      let html = `<button type="button" class="section-head" aria-expanded="${!isClosed}" aria-controls="${sid}-body">
          <span class="section-num">${si + 1}</span>
          <h2 class="section-title">${esc(sec.title)}</h2>
          <span class="section-meta"><span class="section-count"></span><span class="bar"><span class="bar-fill"></span></span></span>
          ${CHEV}
        </button><div class="section-body" id="${sid}-body"><ul class="qlist">`;

      sec.items.forEach(it => {
        num++;
        if (it.a) ANSWERS[it.id] = it.a;
        if (it.code) CODE[it.id] = it.code;
        const cid = `q-${esc(it.id)}`;
        const search = plain(it.q + ' ' + (it.note || '') + ' ' + (it.a || '') + ' ' + (it.code || ''));
        html += `<li class="qitem" id="question-${esc(it.id)}" data-id="${esc(it.id)}" data-text="${esc(search)}">
          <div class="qline">
            <label class="qrow" for="${cid}">
              <input type="checkbox" class="check" id="${cid}">
              <span class="qn">${num}</span>
              <span class="qbody"><span class="qt">${esc(it.q)}</span>
              ${it.note ? `<span class="note">${esc(it.note)}</span>` : ''}</span>
            </label>
            <button type="button" class="starbtn" aria-pressed="false" aria-label="Star question ${num} for review" title="Star for review">${STAR}</button>
          </div>
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

    const allItems = $$('.qitem');
    const sectionEls = $$('.section');
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
      const sbtn = $('.starbtn', li);
      const setStar = on => { li.classList.toggle('starred', on); sbtn.setAttribute('aria-pressed', String(on)); };
      setStar(starred.has(li.dataset.id));
      sbtn.addEventListener('click', () => {
        const on = !starred.has(li.dataset.id);
        on ? starred.add(li.dataset.id) : starred.delete(li.dataset.id);
        setStar(on); saveStarred(); refresh();
      });
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
      s.classList.toggle('closed', !open);
      $('.section-head', s).setAttribute('aria-expanded', String(open));
      open ? closed.delete(s.dataset.key) : closed.add(s.dataset.key);
    }
    sectionEls.forEach(s => $('.section-head', s).addEventListener('click', () => {
      setSectionOpen(s, s.classList.contains('closed'));
      saveClosed(); updateToggleLabel();
    }));

    function updateToggleLabel() {
      $('#toggleAll').textContent = $('.section:not(.closed)') ? 'Collapse all' : 'Expand all';
    }
    $('#toggleAll').addEventListener('click', () => {
      const collapse = !!$('.section:not(.closed)');
      sectionEls.forEach(s => setSectionOpen(s, !collapse));
      saveClosed(); updateToggleLabel();
    });

    // Opening a section from the sidebar expands it if collapsed.
    tocLinks.forEach(a => a.addEventListener('click', () => {
      const s = sectionEls[+a.dataset.si];
      if (s.classList.contains('closed')) { setSectionOpen(s, true); saveClosed(); updateToggleLabel(); }
    }));

    // ---------- Filter & search ----------
    let filter = 'all';
    const search = $('#q');
    search.placeholder = view === 'starred' ? 'Search starred questions…' : `Search ${track.title} questions…`;

    function refresh() {
      const term = search.value.trim().toLowerCase();
      let total = 0, anyVisible = false, matches = 0;

      sectionEls.forEach((s, si) => {
        const items = $$('.qitem', s);
        const d = items.filter(li => $('.check', li).checked).length;
        total += items.length;
        const pct = items.length ? (100 * d / items.length) : 0;
        const complete = d === items.length;

        $('.section-count', s).textContent = `${d} / ${items.length}`;
        $('.section-meta .bar-fill', s).style.width = pct + '%';
        s.classList.toggle('complete', complete);

        const linkEl = tocLinks[si];
        $('.toc-count', linkEl).textContent = `${d}/${items.length}`;
        $('.bar-fill', linkEl).style.width = pct + '%';
        linkEl.classList.toggle('complete', complete);

        let vis = 0;
        items.forEach(li => {
          const c = $('.check', li).checked;
          const show = (!term || li.dataset.text.includes(term)) &&
            (filter === 'all' || (filter === 'done' && c) || (filter === 'todo' && !c) || (filter === 'star' && li.classList.contains('starred')));
          li.classList.toggle('hidden', !show);
          if (show) vis++;
        });
        s.classList.toggle('hidden', vis === 0);
        // While searching, show matches even inside collapsed sections.
        $('.section-body', s).classList.toggle('force-open', !!term);
        linkEl.parentElement.classList.toggle('hidden', vis === 0);
        if (vis) anyVisible = true;
        matches += vis;
      });

      updateStats();
      if (renderList.afterRefresh) renderList.afterRefresh();

      let title = 'No questions match', hint = 'Try a different search term or filter.';
      if (view === 'track' && track.comingSoon) {
        title = 'Coming soon';
        hint = `${track.title} questions are on the way. Explore the other tracks in the meantime.`;
      } else if (view === 'starred' && !total) {
        title = 'No starred questions yet';
        hint = 'Tap the ☆ next to any question to save it for review here.';
      } else if (filter === 'star' && !term && !matches) {
        title = 'No starred questions here yet';
        hint = 'Tap the ☆ next to any question to save it for review.';
      }
      $('#emptyTitle').textContent = title;
      $('#emptyHint').textContent = hint;
      $('#empty').classList.toggle('hidden', anyVisible);
      $('#toolbar').classList.toggle('hidden', !total);
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

    const resetBtn = $('#reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (!(await resetProgress(scopeIds, `in ${track.title}`))) return;
        allItems.forEach(li => { $('.check', li).checked = false; li.classList.remove('done'); });
        refresh();
      });
    }

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

    // ---------- Sidebar: highlight the section in view ----------
    if ('IntersectionObserver' in window) {
      const visible = new Map();
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => visible.set(en.target, en.isIntersecting));
        const current = sectionEls.find(s => visible.get(s));
        tocLinks.forEach(a => a.classList.toggle('active', !!current && +a.dataset.si === +current.dataset.si));
      }, { rootMargin: '-140px 0px -55% 0px' });
      sectionEls.forEach(s => io.observe(s));
    }

    updateToggleLabel();
    refresh();

    // ---------- Links to a question (#question-<id>, e.g. from the home search) ----------
    function revealFromHash() {
      const m = location.hash.match(/^#question-(.+)$/);
      const li = m && document.getElementById('question-' + decodeURIComponent(m[1]));
      if (!li) return;
      const s = li.closest('.section');
      if (s && s.classList.contains('closed')) { setSectionOpen(s, true); saveClosed(); updateToggleLabel(); }
      li.scrollIntoView({ block: 'center' });
      li.classList.remove('flash');
      void li.offsetWidth; // restart the highlight animation
      li.classList.add('flash');
    }
    revealFromHash();
    window.addEventListener('hashchange', revealFromHash);
  }
})();
