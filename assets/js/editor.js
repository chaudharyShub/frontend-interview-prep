/**
 * In-page code editor for the coding questions (data in challenges.js).
 *
 * - JavaScript: "Run" shows console output, "Check" runs the tests. Code runs in a
 *   fresh Web Worker (runner.js) that is stopped after 2 seconds.
 * - React: "Run" renders the component in a sandboxed iframe (react-preview.html).
 * - Drafts are saved in localStorage.
 */
(function () {
  'use strict';

  const CH = window.CHALLENGES || {};
  const FIP = window.FIP;
  if (!FIP) return;
  const { $, esc, inline, store, confirmDialog } = FIP;

  const KEY_DRAFTS = 'fip-drafts-v1';
  const TIMEOUT_MS = 2000;
  const drafts = store.get(KEY_DRAFTS, {});
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const MOD = isMac ? '⌘' : 'Ctrl';
  const CHEV_SM = '<svg class="chev-sm" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  let saveTimer = null;
  const saveDrafts = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.set(KEY_DRAFTS, drafts), 300);
  };
  const theme = () => document.documentElement.dataset.theme ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  // ---------- Text editing helpers (Tab indent, auto-indent, undo-friendly) ----------
  const INDENT = '  ';
  function insert(ta, text) {
    // execCommand keeps the browser's undo history; setRangeText is the fallback.
    if (!document.execCommand || !document.execCommand('insertText', false, text)) {
      ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, 'end');
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  function indentLines(ta, outdent) {
    const v = ta.value;
    const start = v.lastIndexOf('\n', ta.selectionStart - 1) + 1;
    let end = v.indexOf('\n', ta.selectionEnd - (ta.selectionEnd > ta.selectionStart && v[ta.selectionEnd - 1] === '\n' ? 1 : 0));
    if (end === -1) end = v.length;
    const lines = v.slice(start, end).split('\n');
    const changed = lines.map(l => outdent ? l.replace(/^( {1,2}|\t)/, '') : INDENT + l).join('\n');
    ta.setSelectionRange(start, end);
    insert(ta, changed);
    ta.setSelectionRange(start, start + changed.length);
  }
  function onKey(e, ta, ed) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      ed.primary();
      return;
    }
    if (e.key === 'Escape') { ed.escaped = true; return; }
    if (e.key === 'Tab') {
      if (ed.escaped) { ed.escaped = false; return; } // let focus leave the editor
      e.preventDefault();
      const multi = ta.value.slice(ta.selectionStart, ta.selectionEnd).includes('\n');
      if (e.shiftKey || multi) indentLines(ta, e.shiftKey);
      else insert(ta, INDENT);
      return;
    }
    ed.escaped = false;
    // Typing a closing bracket on a blank indented line steps back one level.
    if ('}])'.includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && ta.selectionStart === ta.selectionEnd) {
      const pos = ta.selectionStart;
      const before = ta.value.slice(ta.value.lastIndexOf('\n', pos - 1) + 1, pos);
      if (before.length >= INDENT.length && /^\s+$/.test(before)) {
        e.preventDefault();
        ta.setSelectionRange(pos - INDENT.length, pos);
        insert(ta, e.key);
      }
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      const v = ta.value, pos = ta.selectionStart;
      const line = v.slice(v.lastIndexOf('\n', pos - 1) + 1, pos);
      const base = line.match(/^\s*/)[0];
      const opener = /[{[(]\s*$/.test(line);
      const closer = /^\s*[}\])]/.test(v.slice(pos, v.indexOf('\n', pos) === -1 ? v.length : v.indexOf('\n', pos)));
      if (opener && closer) {
        insert(ta, '\n' + base + INDENT + '\n' + base);
        const caret = pos + 1 + base.length + INDENT.length;
        ta.setSelectionRange(caret, caret);
      } else {
        insert(ta, '\n' + base + (opener ? INDENT : ''));
      }
    }
  }
  function autoSize(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(Math.max(ta.scrollHeight + 2, 160), 640) + 'px';
  }

  // ---------- Output panel ----------
  function makeOutput(box) {
    return {
      box,
      clear() { box.innerHTML = ''; box.classList.add('hidden'); },
      hasContent() { return !!box.children.length; },
      add(cls, html) {
        box.classList.remove('hidden');
        const el = document.createElement('div');
        el.className = cls;
        el.innerHTML = html;
        box.appendChild(el);
        return el;
      },
      log(level, text) {
        let con = $('.ed-console', box);
        if (!con) {
          con = this.add('ed-console', '<p class="ed-label">Console</p>');
        }
        const line = document.createElement('pre');
        line.className = 'ed-line ed-' + level;
        line.textContent = text;
        con.appendChild(line);
      },
      error(text) { this.add('ed-error', esc(text)); },
      status(text, cls = '') { return this.add('ed-status ' + cls, esc(text)); },
    };
  }

  // ---------- JavaScript runner ----------
  // Opened from disk (file://), browsers refuse `new Worker(url)`. In that case the worker is
  // built from source instead: runner.js is loaded as a normal script (it only defines
  // fipRunner there) and combined with challenges.js into a blob.
  const FROM_DISK = location.protocol === 'file:';
  let runnerLoad = null, blobUrl = null;
  function loadRunnerSource() {
    if (!runnerLoad) {
      runnerLoad = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'assets/js/runner.js';
        s.onload = resolve;
        s.onerror = () => { runnerLoad = null; reject(new Error("Couldn't load assets/js/runner.js.")); };
        document.head.appendChild(s);
      });
    }
    return runnerLoad;
  }
  function startWorker(out) {
    try {
      if (!FROM_DISK) return new Worker('assets/js/runner.js');
      if (!blobUrl) {
        const src = `(${window.defineChallenges})(self);
(${window.fipRunner})();
`;
        blobUrl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      }
      return new Worker(blobUrl);
    } catch (e) {
      out.error(`Couldn't start the code runner: ${e.message}`);
      return null;
    }
  }

  function runJS(ed, mode) {
    stop(ed);
    if (FROM_DISK && !window.fipRunner) {
      loadRunnerSource().then(() => runJS(ed, mode), e => ed.out.error(e.message));
      return;
    }
    const { out, id } = ed;
    out.clear();
    const worker = startWorker(out);
    if (!worker) return;
    ed.worker = worker;
    setBusy(ed, true);

    const ch = CH[id];
    const tests = mode === 'check' ? ch.tests : [];
    const rows = [];
    let ran = false, current = -1, currentName = '', passed = 0, done = false;

    let list = null, summary = null;
    if (mode === 'check') {
      summary = out.status('Running tests…');
      list = out.add('ed-tests', '');
    }

    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(ed.timer);
      worker.terminate();
      ed.worker = null;
      setBusy(ed, false);
      if (mode === 'check' && summary) showSummary();
      if (mode === 'run' && !out.hasContent()) out.status('Ran with no output. Use console.log to print values.', 'ed-muted');
    };

    const showSummary = () => {
      const total = tests.length;
      const errored = !rows.length && !list.children.length;
      if (errored) { summary.remove(); list.remove(); return; }
      const all = passed === total;
      summary.className = 'ed-status ' + (all ? 'ed-pass' : 'ed-fail');
      summary.textContent = `${passed} of ${total} tests passed`;
      const cb = $('.check', ed.li);
      if (all && cb && !cb.checked) {
        const tip = out.add('ed-tip', 'All tests pass. Tick the question once you can explain your solution out loud. <button type="button" class="linkbtn ed-tick">Tick it off</button>');
        $('.ed-tick', tip).addEventListener('click', () => { cb.click(); tip.remove(); });
      }
    };

    const addRow = r => {
      rows.push(r);
      if (r.pass) passed++;
      const li = document.createElement('div');
      li.className = 'ed-test ' + (r.pass ? 'ok' : 'bad');
      let html = `<span class="ed-icon" aria-hidden="true">${r.pass ? '✅' : '❌'}</span><span class="ed-name"><span class="visually-hidden">${r.pass ? 'Passed: ' : 'Failed: '}</span>${esc(r.name)}</span>`;
      if (!r.pass) {
        html += '<dl class="ed-diff">';
        if (r.expected !== undefined) html += `<dt>Expected</dt><dd><code>${esc(r.expected)}</code></dd>`;
        if (r.error) html += `<dt>Error</dt><dd><code>${esc(r.error)}</code></dd>`;
        else if (r.actual !== undefined) html += `<dt>Received</dt><dd><code>${esc(r.actual)}</code></dd>`;
        html += '</dl>';
      }
      li.innerHTML = html;
      list.appendChild(li);
    };

    worker.onmessage = e => {
      const m = e.data;
      if (m.type === 'log') out.log(m.level, m.text);
      else if (m.type === 'error') out.error(m.text);
      else if (m.type === 'ran') ran = true;
      else if (m.type === 'test-start') { current = m.index; currentName = m.name; }
      else if (m.type === 'result') addRow(m);
      else if (m.type === 'done') finish();
    };
    worker.onerror = e => {
      e.preventDefault();
      out.error(e.message || 'The code runner failed to load.');
      finish();
    };
    ed.timer = setTimeout(() => {
      if (mode === 'check') {
        const stuck = tests[current];
        if (current >= 0 && stuck) {
          addRow({ name: currentName, pass: false, error: 'Timed out after 2 s. Is there an infinite loop?' });
          for (let i = current + 1; i < tests.length; i++) addRow({ name: tests[i].name || `${ch.fn}(${tests[i].args.map(x => JSON.stringify(x)).join(', ')})`, pass: false, error: 'Not run' });
        } else {
          out.error('Stopped after 2 s. Is there an infinite loop?');
        }
      } else {
        out.error(ran ? 'Stopped waiting for timers after 2 s.' : 'Stopped after 2 s. Is there an infinite loop?');
      }
      finish();
    }, TIMEOUT_MS);

    worker.postMessage({ mode, id, code: ed.ta.value });
  }

  function stop(ed) {
    if (ed.worker) { ed.worker.terminate(); ed.worker = null; }
    clearTimeout(ed.timer);
    setBusy(ed, false);
  }

  function setBusy(ed, busy) {
    ed.panel.classList.toggle('busy', busy);
    ed.panel.querySelectorAll('.ed-run, .ed-check').forEach(b => { b.disabled = busy; });
  }

  // ---------- React preview ----------
  // The preview runs its own loop guard (loop-guard.js). As a backup, if the frame stops
  // answering (no "rendered" after a render, or no reply to a ping), it is removed.
  const RENDER_TIMEOUT_MS = 3000;
  const PING_EVERY_MS = 2000;
  const frames = new Map(); // iframe window → editor
  window.addEventListener('message', e => {
    const ed = frames.get(e.source);
    const m = e.data;
    if (!ed || !m || m.source !== 'fip-preview') return;
    if (m.type === 'ready') { ed.ready = true; startPing(ed); if (ed.pending) { ed.pending = false; sendRender(ed); } }
    else if (m.type === 'rendered') clearTimeout(ed.watchdog);
    else if (m.type === 'pong') ed.lastPong = Date.now();
    else if (m.type === 'log') ed.out.log(m.level, m.text);
    else if (m.type === 'error') { clearTimeout(ed.watchdog); ed.out.error(m.text); }
    else if (m.type === 'size') ed.frame.style.height = Math.min(Math.max(m.height, 80), 640) + 'px';
  });

  function sendRender(ed) {
    ed.out.clear();
    clearTimeout(ed.watchdog);
    ed.watchdog = setTimeout(() => killFrame(ed), RENDER_TIMEOUT_MS);
    ed.frame.contentWindow.postMessage({ type: 'render', code: ed.ta.value, theme: theme() }, '*');
  }

  function startPing(ed) {
    clearInterval(ed.ping);
    ed.lastPong = Date.now();
    ed.ping = setInterval(() => {
      if (!ed.frame) return clearInterval(ed.ping);
      if (ed.panel.classList.contains('hidden')) { ed.lastPong = Date.now(); return; }
      if (Date.now() - ed.lastPong > PING_EVERY_MS + RENDER_TIMEOUT_MS) return killFrame(ed);
      ed.frame.contentWindow.postMessage({ type: 'ping' }, '*');
    }, PING_EVERY_MS);
  }

  function killFrame(ed) {
    if (!ed.frame) return;
    clearTimeout(ed.watchdog);
    clearInterval(ed.ping);
    frames.delete(ed.frame.contentWindow);
    ed.frame.remove();
    ed.frame = null;
    ed.ready = false;
    ed.pending = false;
    ed.panel.querySelector('.ed-preview-wrap').classList.add('hidden');
    ed.out.error('The preview stopped responding, so it was shut down. Is there an infinite loop? Fix the code and press Run preview again.');
  }

  function runReact(ed) {
    if (!ed.frame) {
      const wrap = ed.panel.querySelector('.ed-preview-wrap');
      wrap.classList.remove('hidden');
      const f = document.createElement('iframe');
      f.className = 'ed-preview';
      f.title = 'Preview of your component';
      // A sandboxed frame can't load local files, so the sandbox is only used when served over http.
      if (!FROM_DISK) f.setAttribute('sandbox', 'allow-scripts');
      f.src = 'react-preview.html';
      wrap.appendChild(f);
      ed.frame = f;
      frames.set(f.contentWindow, ed);
      ed.pending = true;
      ed.out.clear();
      return;
    }
    if (ed.ready) sendRender(ed); else ed.pending = true;
  }

  // ---------- Build an editor for a question ----------
  function build(li) {
    const id = li.dataset.id;
    const ch = CH[id];
    const react = !!ch.react;
    const panel = document.createElement('div');
    panel.className = 'editor hidden';
    const n = li.querySelector('.qn').textContent;
    panel.innerHTML = `
      ${ch.task ? `<p class="ed-task">${inline(ch.task)}</p>` : ''}
      <textarea class="ed-code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"
        aria-label="Code editor for question ${esc(n)}" aria-describedby="ed-hint-${esc(id)}"></textarea>
      <div class="ed-bar">
        <button type="button" class="btn ed-run${react ? ' btn-primary' : ''}">${react ? 'Run preview' : 'Run'}</button>
        ${react ? '' : '<button type="button" class="btn btn-primary ed-check">Check</button>'}
        <button type="button" class="btn ed-reset">Reset code</button>
        <span class="ed-hint" id="ed-hint-${esc(id)}">${MOD}+Enter to ${react ? 'run' : 'check'} · Esc then Tab to leave the editor</span>
      </div>
      ${react ? '<div class="ed-preview-wrap hidden"></div>' : ''}
      <div class="ed-out hidden" aria-live="polite"></div>`;
    li.querySelector('.more').appendChild(panel);

    const ta = $('.ed-code', panel);
    const box = $('.ed-out', panel);
    const out = makeOutput(box);
    if (FROM_DISK && !react) loadRunnerSource().catch(() => {});
    const ed = { id, li, panel, ta, out, escaped: false, worker: null, timer: null, frame: null, ready: false, pending: false, watchdog: null, ping: null, lastPong: 0 };
    ed.primary = () => (react ? runReact(ed) : runJS(ed, 'check'));

    // An empty draft isn't worth keeping: show the starter code again.
    const blank = v => !v || !v.trim();
    ta.value = blank(drafts[id]) ? ch.starter : drafts[id];
    ta.addEventListener('keydown', e => onKey(e, ta, ed));
    ta.addEventListener('input', () => {
      autoSize(ta);
      if (ta.value === ch.starter || blank(ta.value)) delete drafts[id]; else drafts[id] = ta.value;
      saveDrafts();
    });
    ta.addEventListener('blur', () => { ed.escaped = false; });

    $('.ed-run', panel).addEventListener('click', () => (react ? runReact(ed) : runJS(ed, 'run')));
    const checkBtn = $('.ed-check', panel);
    if (checkBtn) checkBtn.addEventListener('click', () => runJS(ed, 'check'));
    $('.ed-reset', panel).addEventListener('click', async () => {
      if (ta.value === ch.starter) return;
      // Only ask when there is code to lose.
      const ok = blank(ta.value) || await confirmDialog({
        title: 'Reset code?',
        message: 'This replaces your code for this question with the starter code.',
        confirmText: 'Reset code',
      });
      if (!ok) return;
      stop(ed);
      ta.value = ch.starter;
      delete drafts[id];
      saveDrafts();
      autoSize(ta);
      out.clear();
      ta.focus();
    });
    return ed;
  }

  // ---------- Add a "Try it" button to each coding question ----------
  document.querySelectorAll('.qitem').forEach(li => {
    const ch = CH[li.dataset.id];
    const btns = li.querySelector('.more-btns');
    if (!ch || !btns) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'linkbtn trybtn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = `${ch.react ? 'Try it in React' : 'Try it'} ${CHEV_SM}`;
    btns.prepend(btn);

    let ed = null;
    btn.addEventListener('click', () => {
      if (!ed) ed = build(li);
      const open = ed.panel.classList.contains('hidden');
      ed.panel.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', String(open));
      btn.firstChild.textContent = `${open ? 'Hide editor' : (ch.react ? 'Try it in React' : 'Try it')} `;
      if (open) { autoSize(ed.ta); ed.ta.focus({ preventScroll: true }); }
      else stop(ed);
    });
  });
})();
