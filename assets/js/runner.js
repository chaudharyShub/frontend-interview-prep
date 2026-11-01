/**
 * Code runner (Web Worker). Runs the user's code away from the page, so an infinite
 * loop can be stopped by terminating the worker. The page creates a fresh worker for
 * every run, which also means prototype changes (polyfills) never leak between runs.
 *
 * This is the only script allowed to use `new Function` (see vercel.json).
 *
 * In:  { mode: 'run' | 'check', id, code }
 * Out: { type: 'log', level, text }
 *      { type: 'ran' }                       – the code finished its synchronous part
 *      { type: 'test-start', index, name }
 *      { type: 'result', index, name, pass, expected, actual, error }
 *      { type: 'error', text }               – syntax/runtime error outside a test
 *      { type: 'done' }
 */
'use strict';

importScripts('challenges.js');

const post = self.postMessage.bind(self);
const realSetTimeout = self.setTimeout.bind(self);
const MAX_LOGS = 200;

// ---------- Formatting values (a small console.log-style inspector) ----------
function fmt(v, depth = 0, seen = new Set(), top = false) {
  if (typeof v === 'string') return top ? v : JSON.stringify(v);
  if (typeof v === 'number') return Object.is(v, -0) ? '-0' : String(v);
  if (typeof v === 'bigint') return v + 'n';
  if (typeof v === 'symbol' || typeof v === 'boolean' || v == null) return String(v);
  if (typeof v === 'function') return `[Function${v.name ? ': ' + v.name : ' (anonymous)'}]`;
  if (seen.has(v)) return '[Circular]';
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  if (v instanceof Date) return isNaN(v) ? 'Invalid Date' : v.toISOString();
  if (v instanceof RegExp) return String(v);
  if (depth > 4) return Array.isArray(v) ? '[Array]' : '[Object]';
  seen.add(v);
  const inner = x => fmt(x, depth + 1, seen);
  let out;
  if (Array.isArray(v)) {
    const parts = [];
    const n = Math.min(v.length, 100);
    for (let i = 0; i < n; i++) parts.push(i in v ? inner(v[i]) : '<empty>');
    if (v.length > n) parts.push(`… ${v.length - n} more`);
    out = `[${parts.join(', ')}]`;
  } else if (v instanceof Map) {
    out = `Map(${v.size}) {${[...v].map(([k, x]) => ` ${inner(k)} => ${inner(x)}`).join(',')}${v.size ? ' ' : ''}}`;
  } else if (v instanceof Set) {
    out = `Set(${v.size}) {${[...v].map(x => ' ' + inner(x)).join(',')}${v.size ? ' ' : ''}}`;
  } else {
    const keys = Object.keys(v);
    const body = keys.map(k => `${/^[A-Za-z_$][\w$]*$|^\d+$/.test(k) ? k : JSON.stringify(k)}: ${inner(v[k])}`);
    out = keys.length ? `{ ${body.join(', ')} }` : '{}';
  }
  seen.delete(v);
  return out;
}

// ---------- Deep equality (key order doesn't matter) ----------
function eq(a, b) {
  if (a === b || (a !== a && b !== b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (a instanceof Date || b instanceof Date) return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) return false;
    for (const [k, v] of a) if (!b.has(k) || !eq(v, b.get(k))) return false;
    return true;
  }
  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set && b instanceof Set) || a.size !== b.size) return false;
    for (const v of a) if (!b.has(v)) return false;
    return true;
  }
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!eq(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!Object.prototype.hasOwnProperty.call(b, k) || !eq(a[k], b[k])) return false;
  return true;
}
const sorted = v => Array.isArray(v) ? [...v].sort((x, y) => (fmt(x) < fmt(y) ? -1 : fmt(x) > fmt(y) ? 1 : 0)) : v;

// ---------- Console capture ----------
let logCount = 0;
function capture(level) {
  return (...args) => {
    if (++logCount > MAX_LOGS) {
      if (logCount === MAX_LOGS + 1) post({ type: 'log', level: 'warn', text: `… output stopped after ${MAX_LOGS} lines` });
      return;
    }
    post({ type: 'log', level, text: args.map(a => fmt(a, 0, new Set(), true)).join(' ') });
  };
}
self.console = {
  log: capture('log'), info: capture('log'), debug: capture('log'), table: capture('log'),
  dir: capture('log'), warn: capture('warn'), error: capture('error'),
  assert: (ok, ...rest) => { if (!ok) capture('error')('Assertion failed', ...rest); },
  clear() {}, group() {}, groupEnd() {}, time() {}, timeEnd() {},
};

// Errors from the user's code: add the line number when the browser reports one.
function describe(err) {
  if (!(err instanceof Error)) return 'Uncaught ' + fmt(err);
  const m = String(err.stack || '').match(/(?:<anonymous>|> Function):(\d+):(\d+)/);
  const line = m ? +m[1] - 2 : 0; // new Function adds two header lines
  return `${err.name}: ${err.message}${line > 0 ? ` (line ${line})` : ''}`;
}

self.addEventListener('unhandledrejection', e => {
  e.preventDefault();
  post({ type: 'error', text: 'Unhandled promise rejection – ' + describe(e.reason) });
});

// ---------- Fake clock for timing tests (debounce / throttle) ----------
function installFakeClock() {
  const base = Date.now();
  let now = 0, seq = 0;
  const timers = new Map();
  const add = (fn, ms, args, every) => {
    const id = ++seq;
    timers.set(id, { at: now + Math.max(0, +ms || 0), fn, args, every: every ? Math.max(1, +ms || 0) : 0 });
    return id;
  };
  self.setTimeout = (fn, ms, ...args) => add(fn, ms, args, false);
  self.setInterval = (fn, ms, ...args) => add(fn, ms, args, true);
  self.clearTimeout = self.clearInterval = id => { timers.delete(id); };
  Date.now = () => base + now;
  if (self.performance) self.performance.now = () => now;
  return {
    tick(ms) {
      const end = now + ms;
      for (;;) {
        let next = null, nextId = 0;
        for (const [id, t] of timers) if (t.at <= end && (!next || t.at < next.at)) { next = t; nextId = id; }
        if (!next) break;
        now = next.at;
        if (next.every) next.at += next.every; else timers.delete(nextId);
        if (typeof next.fn === 'function') next.fn(...next.args);
      }
      now = end;
    },
    reset() { timers.clear(); },
  };
}

// ---------- Run mode: run the code, wait for its timers, report logs ----------
function trackTimers(onIdle) {
  const pending = new Set();
  const origST = self.setTimeout.bind(self), origCT = self.clearTimeout.bind(self);
  const origSI = self.setInterval.bind(self), origCI = self.clearInterval.bind(self);
  const settle = () => realSetTimeout(() => { if (!pending.size) onIdle(); }, 0);
  self.setTimeout = (fn, ms, ...args) => {
    const id = origST(() => {
      pending.delete(id);
      try { if (typeof fn === 'function') fn(...args); } catch (e) { post({ type: 'error', text: describe(e) }); }
      settle();
    }, ms);
    pending.add(id);
    return id;
  };
  self.clearTimeout = id => { origCT(id); pending.delete(id); settle(); };
  self.setInterval = (fn, ms, ...args) => {
    const id = origSI(() => {
      try { if (typeof fn === 'function') fn(...args); } catch (e) { post({ type: 'error', text: describe(e) }); }
    }, ms);
    pending.add(id);
    return id;
  };
  self.clearInterval = id => { origCI(id); pending.delete(id); settle(); };
  return settle;
}

function compile(code, fnName) {
  const tail = fnName ? `\n;return typeof ${fnName} === 'function' ? ${fnName} : undefined;` : '';
  return new Function(code + tail);
}

function runMode(code) {
  let finished = false;
  const settle = trackTimers(() => { if (!finished) { finished = true; post({ type: 'done' }); } });
  try {
    compile(code)();
  } catch (e) {
    post({ type: 'error', text: describe(e) });
  }
  post({ type: 'ran' });
  settle();
}

// ---------- Check mode: run the tests ----------
const getPath = path => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), self);

async function checkMode(id, code) {
  const ch = self.CHALLENGES[id];
  const clock = ch.fakeTimers ? installFakeClock() : null;
  const t = {
    clock,
    throws(fn) {
      try { fn(); return 'no error'; } catch (e) { return e && e.name ? e.name : 'error'; }
    },
  };

  let fn;
  try {
    fn = compile(code, ch.fn)();
  } catch (e) {
    post({ type: 'error', text: describe(e) });
    post({ type: 'done' });
    return;
  }
  if (ch.fn && typeof fn !== 'function') {
    post({ type: 'error', text: `Couldn't find a function named ${ch.fn}. Keep the name from the starter code.` });
    post({ type: 'done' });
    return;
  }
  if (ch.global && typeof getPath(ch.global) !== 'function') {
    post({ type: 'error', text: `${ch.global} isn't a function yet. Assign it as in the starter code.` });
    post({ type: 'done' });
    return;
  }

  for (let i = 0; i < ch.tests.length; i++) {
    const test = ch.tests[i];
    const name = test.name || `${ch.fn}(${test.args.map(a => fmt(a)).join(', ')})`;
    post({ type: 'test-start', index: i, name });
    const res = { type: 'result', index: i, name, pass: false };
    try {
      if (clock) clock.reset();
      const expected = typeof test.expected === 'function' ? test.expected() : test.expected;
      res.expected = fmt(expected);
      let actual = test.run ? test.run(fn, t) : fn(...structuredClone(test.args));
      if (actual && typeof actual.then === 'function') actual = await actual;
      res.actual = fmt(actual);
      res.pass = ch.unordered ? eq(sorted(actual), sorted(expected)) : eq(actual, expected);
    } catch (e) {
      res.error = describe(e);
    }
    post(res);
  }
  post({ type: 'done' });
}

self.onmessage = e => {
  const { mode, id, code } = e.data || {};
  if (mode === 'check') checkMode(id, code);
  else runMode(code);
};
