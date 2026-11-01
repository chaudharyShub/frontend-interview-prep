/**
 * Infinite-loop protection for the React preview.
 *
 * protectLoops(code, guardName) adds a call to `guardName()` to the condition of every
 * `while`, `do … while` and `for (;;)` loop in already-compiled JavaScript:
 *
 *   while (x)          →  while (guard() && (x))
 *   for (i = 0; c; i++) →  for (i = 0; guard() && (c); i++)
 *   for (;;)           →  for (; guard(); )
 *
 * `for … in` / `for … of` loops are left alone (they walk a finite collection).
 * A small tokenizer skips strings, template literals, comments and regex literals,
 * so text like "while (" inside a string isn't touched.
 *
 * makeLoopGuard(limitMs) returns the guard function: it throws once loops have run
 * for more than `limitMs` within one task (one render, one click handler, …).
 */
(function (root) {
  'use strict';

  const REGEX_AFTER_WORD = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);

  function tokenize(src) {
    const tokens = [];
    const braces = []; // 'b' for a normal brace, 't' for a `${` inside a template
    const parens = []; // true when the ( opens an if / while / for / with header
    const n = src.length;
    let i = 0;

    const prevAllowsRegex = () => {
      const p = tokens[tokens.length - 1];
      if (!p) return true;
      if (p.type === 'word') return REGEX_AFTER_WORD.has(p.value);
      if (p.type === 'punct') return p.ctrl || !/[)\]}]/.test(p.value);
      return false;
    };

    // Scans template text from i (just after ` or a closing } of ${…}).
    const scanTemplate = () => {
      while (i < n) {
        const c = src[i];
        if (c === '\\') { i += 2; continue; }
        if (c === '`') { i++; return; }
        if (c === '$' && src[i + 1] === '{') { i += 2; braces.push('t'); return; }
        i++;
      }
    };

    while (i < n) {
      const c = src[i];
      const start = i;
      if (/\s/.test(c)) { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e === -1 ? n : e + 2; continue; }
      if (c === '"' || c === "'") {
        i++;
        while (i < n && src[i] !== c && src[i] !== '\n') i += src[i] === '\\' ? 2 : 1;
        i++;
        tokens.push({ type: 'str', start, end: i });
        continue;
      }
      if (c === '`') { i++; scanTemplate(); tokens.push({ type: 'str', start, end: i }); continue; }
      if (c === '}' && braces[braces.length - 1] === 't') {
        braces.pop(); i++; scanTemplate();
        tokens.push({ type: 'str', start, end: i });
        continue;
      }
      if (c === '/' && prevAllowsRegex()) {
        i++;
        let inClass = false;
        while (i < n && src[i] !== '\n') {
          const d = src[i];
          if (d === '\\') { i += 2; continue; }
          if (d === '[') inClass = true;
          else if (d === ']') inClass = false;
          else if (d === '/' && !inClass) break;
          i++;
        }
        i++;
        while (i < n && /[a-z]/i.test(src[i])) i++;
        tokens.push({ type: 'regex', start, end: i });
        continue;
      }
      if (/[A-Za-z_$\u0080-￿]/.test(c)) {
        while (i < n && /[\w$\u0080-￿]/.test(src[i])) i++;
        tokens.push({ type: 'word', value: src.slice(start, i), start, end: i });
        continue;
      }
      if (/[0-9]/.test(c)) {
        while (i < n && /[\w.]/.test(src[i])) i++;
        tokens.push({ type: 'num', start, end: i });
        continue;
      }
      if (c === '{') braces.push('b');
      else if (c === '}') braces.pop();
      const tok = { type: 'punct', value: c, start, end: i + 1 };
      if (c === '(') {
        const p = tokens[tokens.length - 1];
        parens.push(!!p && p.type === 'word' && /^(if|while|for|with)$/.test(p.value));
      } else if (c === ')') {
        tok.ctrl = parens.pop(); // `if (x) /re/` – a regex can follow a control header
      }
      i++;
      tokens.push(tok);
    }
    return tokens;
  }

  function protectLoops(src, guardName) {
    const tokens = tokenize(src);
    const inserts = []; // [position, text]
    const isP = (t, v) => t && t.type === 'punct' && t.value === v;

    for (let k = 0; k < tokens.length; k++) {
      const t = tokens[k];
      if (t.type !== 'word' || (t.value !== 'while' && t.value !== 'for')) continue;
      const prev = tokens[k - 1];
      if (isP(prev, '.')) continue;                 // obj.while(...) is a property
      const open = tokens[k + 1];
      if (!isP(open, '(')) continue;                // e.g. `for await (`

      // Find the matching ")" and, for `for`, the two top-level ";".
      let depth = 0, close = -1;
      const semis = [];
      for (let j = k + 1; j < tokens.length; j++) {
        const u = tokens[j];
        if (u.type !== 'punct') continue;
        if ('([{'.includes(u.value)) depth++;
        else if (')]}'.includes(u.value)) { depth--; if (depth === 0) { close = j; break; } }
        else if (u.value === ';' && depth === 1) semis.push(j);
      }
      if (close === -1) continue;

      if (t.value === 'while') {
        inserts.push([open.end, `${guardName}() && (`], [tokens[close].start, ')']);
      } else if (semis.length === 2) {
        const a = tokens[semis[0]], b = tokens[semis[1]];
        if (semis[1] === semis[0] + 1) inserts.push([a.end, ` ${guardName}()`]);
        else inserts.push([a.end, ` ${guardName}() && (`], [b.start, ')']);
      }
    }

    inserts.sort((x, y) => y[0] - x[0]);
    let out = src;
    for (const [pos, text] of inserts) out = out.slice(0, pos) + text + out.slice(pos);
    return out;
  }

  function makeLoopGuard(limitMs) {
    let started = 0, calls = 0;
    return function loopGuard() {
      if (!started) {
        started = performance.now();
        setTimeout(() => { started = 0; }, 0); // runs once the current task is over
      } else if ((++calls & 127) === 0 && performance.now() - started > limitMs) {
        throw new Error(`Stopped a loop that ran for over ${limitMs / 1000} s. Is it an infinite loop?`);
      }
      return true;
    };
  }

  root.LoopGuard = { protectLoops, makeLoopGuard, tokenize };
})(typeof self !== 'undefined' ? self : this);
