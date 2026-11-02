/**
 * Coding challenges for the in-page editor, keyed by question id (see assets/js/tracks/).
 *
 * JavaScript challenges:
 *   fn       – name of the function the user writes (looked up after their code runs)
 *   task     – exact spec shown above the editor (return format, edge cases)
 *   starter  – code the editor starts with
 *   unordered – compare arrays ignoring order
 *   fakeTimers – replace setTimeout / Date.now with a fake clock the tests control
 *   tests    – either
 *              { args: [...], expected }                  → calls fn(...args)
 *              { name, run: (fn, t) => actual, expected } → custom check
 *              `expected` may be a function, e.g. to compare against a built-in method.
 *              `t` has helpers: t.clock.tick(ms), t.throws(fn) → error name or 'no error'.
 *
 * React challenges:
 *   react: true, starter – the component code; the preview renders the default export.
 *
 * HTML & CSS challenges:
 *   html: true, starter – HTML with a <style> block; the preview shows it live as you type.
 *
 * This file is loaded by the page (for starters) and by the test runner worker (for tests).
 * Functions in the tests must not use variables from outside this file.
 */
(function defineChallenges(root) {
  'use strict';

  // Kept on root so the editor can rebuild this file inside a worker when opened from disk.
  root.defineChallenges = defineChallenges;

  // Shared fixtures for the call / apply / bind tests.
  function greet(greeting, punct) { return `${greeting}, ${this.name}${punct || ''}`; }

  root.CHALLENGES = {
    '95': {
      fn: 'charFrequency',
      task: 'Return an object mapping each character to how many times it appears. An empty string returns `{}`.',
      starter: 'function charFrequency(str) {\n  \n}\n\nconsole.log(charFrequency("aabcabcb"));\n',
      tests: [
        { args: ['aabcabcb'], expected: { a: 3, b: 3, c: 2 } },
        { args: [''], expected: {} },
        { args: ['x'], expected: { x: 1 } },
        { args: ['a a'], expected: { a: 2, ' ': 1 } },
        { args: ['AaA'], expected: { A: 2, a: 1 } },
      ],
    },

    '96': {
      fn: 'elementFrequency',
      task: 'Return an object mapping each element to its count. An empty array returns `{}`.',
      starter: 'function elementFrequency(arr) {\n  \n}\n\nconsole.log(elementFrequency([1, 2, 1, 2, 3, 3, 2, 1]));\n',
      tests: [
        { args: [[1, 2, 1, 2, 3, 3, 2, 1]], expected: { 1: 3, 2: 3, 3: 2 } },
        { args: [[]], expected: {} },
        { args: [['a', 'b', 'a']], expected: { a: 2, b: 1 } },
        { args: [[7]], expected: { 7: 1 } },
      ],
    },

    '97': {
      fn: 'sum',
      task: 'Return the sum of all numbers in the array. An empty array returns `0`.',
      starter: 'function sum(arr) {\n  \n}\n\nconsole.log(sum([1, 2, 3, 4]));\n',
      tests: [
        { args: [[1, 2, 3, 4]], expected: 10 },
        { args: [[]], expected: 0 },
        { args: [[-5, 5, 10]], expected: 10 },
        { args: [[42]], expected: 42 },
      ],
    },

    '98': {
      fn: 'mergeUnique',
      task: 'Return a new array with the elements of both arrays, without duplicates, sorted in ascending numeric order.',
      starter: 'function mergeUnique(arr1, arr2) {\n  \n}\n\nconsole.log(mergeUnique([1, 2, 3, 7, 8], [1, 4, 5, 9, 10]));\n',
      tests: [
        { args: [[1, 2, 3, 7, 8], [1, 4, 5, 9, 10]], expected: [1, 2, 3, 4, 5, 7, 8, 9, 10] },
        { args: [[], []], expected: [] },
        { args: [[3, 3, 3], [3]], expected: [3] },
        { args: [[10, 2], [1, 100]], expected: [1, 2, 10, 100] },
      ],
    },

    '99': {
      fn: 'toObject',
      task: 'Return an object where `keys[i]` maps to `values[i]`.',
      starter: 'function toObject(keys, values) {\n  \n}\n\nconsole.log(toObject(["name", "age", "country"], ["Bobby", 30, "India"]));\n',
      tests: [
        { args: [['name', 'age', 'country'], ['Bobby', 30, 'India']], expected: { name: 'Bobby', age: 30, country: 'India' } },
        { args: [[], []], expected: {} },
        { args: [['a'], [null]], expected: { a: null } },
      ],
    },

    '100': {
      fn: 'firstNonRepeating',
      task: 'Return the first character that appears exactly once, or `null` if there is none.',
      starter: 'function firstNonRepeating(str) {\n  \n}\n\nconsole.log(firstNonRepeating("aabbcdc"));\n',
      tests: [
        { args: ['aabbcdc'], expected: 'd' },
        { args: ['aabb'], expected: null },
        { args: [''], expected: null },
        { args: ['z'], expected: 'z' },
        { args: ['abcab'], expected: 'c' },
      ],
    },

    '101': {
      fn: 'debounce',
      fakeTimers: true,
      task: 'Return a debounced function that calls `fn` only after `delay` ms have passed without another call. It should use the latest arguments and keep `this`. The tests use a fake clock, so `setTimeout` is controlled by the test.',
      starter: 'function debounce(fn, delay) {\n  \n}\n\nconst log = debounce(msg => console.log(msg), 300);\nlog("a"); log("b"); log("c"); // only "c" after 300ms\n',
      tests: [
        {
          name: 'does not call fn before the delay',
          run: (debounce, t) => { let n = 0; const d = debounce(() => n++, 300); d(); t.clock.tick(299); return n; },
          expected: 0,
        },
        {
          name: 'calls fn once after the delay',
          run: (debounce, t) => { let n = 0; const d = debounce(() => n++, 300); d(); t.clock.tick(300); return n; },
          expected: 1,
        },
        {
          name: 'rapid calls collapse into one, with the latest arguments',
          run: (debounce, t) => {
            const calls = []; const d = debounce(x => calls.push(x), 100);
            d('a'); t.clock.tick(50); d('b'); t.clock.tick(50); d('c'); t.clock.tick(100);
            return calls;
          },
          expected: ['c'],
        },
        {
          name: 'each call restarts the timer',
          run: (debounce, t) => {
            let n = 0; const d = debounce(() => n++, 100);
            d(); t.clock.tick(90); d(); t.clock.tick(90); const before = n; t.clock.tick(10);
            return [before, n];
          },
          expected: [0, 1],
        },
        {
          name: 'keeps `this`',
          run: (debounce, t) => {
            let self; const obj = { name: 'obj', d: debounce(function () { self = this; }, 10) };
            obj.d(); t.clock.tick(10); return self && self.name;
          },
          expected: 'obj',
        },
        {
          name: 'can fire again after the delay',
          run: (debounce, t) => { let n = 0; const d = debounce(() => n++, 50); d(); t.clock.tick(50); d(); t.clock.tick(50); return n; },
          expected: 2,
        },
      ],
    },

    '102': {
      fn: 'throttle',
      fakeTimers: true,
      task: 'Return a leading-edge throttled function: the first call runs `fn` immediately, then further calls are ignored until `limit` ms have passed. Keep `this` and the arguments. The tests use a fake clock for `Date.now` and `setTimeout`.',
      starter: 'function throttle(fn, limit) {\n  \n}\n\nconst log = throttle(msg => console.log(msg), 200);\nlog("a"); log("b"); // only "a"\n',
      tests: [
        {
          name: 'first call runs immediately',
          run: (throttle, t) => { let n = 0; throttle(() => n++, 100)(); return n; },
          expected: 1,
        },
        {
          name: 'calls within the limit are ignored',
          run: (throttle, t) => { let n = 0; const f = throttle(() => n++, 100); f(); t.clock.tick(30); f(); t.clock.tick(30); f(); return n; },
          expected: 1,
        },
        {
          name: 'runs again once the limit has passed',
          run: (throttle, t) => {
            const calls = []; const f = throttle(x => calls.push(x), 100);
            f('a'); t.clock.tick(100); f('b'); t.clock.tick(100); f('c');
            return calls;
          },
          expected: ['a', 'b', 'c'],
        },
        {
          name: 'passes arguments and keeps `this`',
          run: (throttle, t) => {
            let got; const obj = { k: 1, f: throttle(function (x) { got = [this.k, x]; }, 100) };
            obj.f('hi'); return got;
          },
          expected: [1, 'hi'],
        },
      ],
    },

    '103': {
      fn: 'naturalSort',
      task: 'Return a new array of the strings sorted "naturally": the letter part alphabetically, and the number part by numeric value (so "A2" comes before "A10"). Do not mutate the input.',
      starter: 'function naturalSort(arr) {\n  \n}\n\nconsole.log(naturalSort(["A1", "A10", "A11", "A2", "A3"]));\n',
      tests: [
        { args: [['A1', 'A10', 'A11', 'A2', 'A3']], expected: ['A1', 'A2', 'A3', 'A10', 'A11'] },
        { args: [['B2', 'A10', 'A9', 'B1']], expected: ['A9', 'A10', 'B1', 'B2'] },
        { args: [[]], expected: [] },
        { args: [['item20', 'item3', 'item100']], expected: ['item3', 'item20', 'item100'] },
        {
          name: 'does not mutate the input',
          run: fn => { const a = ['A10', 'A2']; fn(a); return a; },
          expected: ['A10', 'A2'],
        },
      ],
    },

    '104': {
      fn: 'secondLargest',
      task: 'Return the second-largest distinct number, or `null` if there isn\'t one (fewer than two distinct values).',
      starter: 'function secondLargest(arr) {\n  \n}\n\nconsole.log(secondLargest([10, 5, 20, 20, 8]));\n',
      tests: [
        { args: [[10, 5, 20, 20, 8]], expected: 10 },
        { args: [[1, 2]], expected: 1 },
        { args: [[5, 5, 5]], expected: null },
        { args: [[]], expected: null },
        { args: [[-1, -5, -3]], expected: -3 },
      ],
    },

    '105': {
      fn: 'flatten',
      task: 'Return a new array with all nested arrays flattened to any depth. Do not use `Array.prototype.flat`.',
      starter: 'function flatten(arr) {\n  \n}\n\nconsole.log(flatten([1, [2, [3, [4]], 5]]));\n',
      tests: [
        { args: [[1, [2, [3, [4]], 5]]], expected: [1, 2, 3, 4, 5] },
        { args: [[]], expected: [] },
        { args: [[[[]]]], expected: [] },
        { args: [[1, 2, 3]], expected: [1, 2, 3] },
        { args: [[['a'], [['b', ['c']]]]], expected: ['a', 'b', 'c'] },
      ],
    },

    '106': {
      fn: 'reverseString',
      task: 'Return the string reversed, without using `Array.prototype.reverse`.',
      starter: 'function reverseString(str) {\n  \n}\n\nconsole.log(reverseString("hello"));\n',
      tests: [
        { args: ['hello'], expected: 'olleh' },
        { args: [''], expected: '' },
        { args: ['a'], expected: 'a' },
        { args: ['ab cd'], expected: 'dc ba' },
      ],
    },

    '107': {
      fn: 'findDuplicates',
      unordered: true,
      task: 'Return an array of the values that appear more than once, each listed once. Order doesn\'t matter.',
      starter: 'function findDuplicates(arr) {\n  \n}\n\nconsole.log(findDuplicates([1, 2, 3, 2, 4, 1, 1]));\n',
      tests: [
        { args: [[1, 2, 3, 2, 4, 1, 1]], expected: [1, 2] },
        { args: [[1, 2, 3]], expected: [] },
        { args: [[]], expected: [] },
        { args: [['a', 'a', 'a']], expected: ['a'] },
      ],
    },

    '108': {
      task: 'Add `Array.prototype.myMap` so it behaves like the built-in `map`: callback gets `(element, index, array)`, supports `thisArg`, returns a new array and doesn\'t change the original. The tests compare it with the built-in.',
      starter: 'Array.prototype.myMap = function (callback, thisArg) {\n  \n};\n\nconsole.log([1, 2, 3].myMap(x => x * 2));\n',
      global: 'Array.prototype.myMap',
      tests: [
        { name: '[1, 2, 3] doubled', run: () => [1, 2, 3].myMap(x => x * 2), expected: () => [1, 2, 3].map(x => x * 2) },
        { name: 'empty array', run: () => [].myMap(x => x), expected: [] },
        { name: 'passes (element, index, array)', run: () => ['a', 'b'].myMap((x, i, arr) => x + i + arr.length), expected: ['a02', 'b12'] },
        { name: 'supports thisArg', run: () => [1, 2].myMap(function (x) { return x * this.k; }, { k: 10 }), expected: [10, 20] },
        { name: 'does not mutate the original', run: () => { const a = [1, 2]; a.myMap(x => x + 1); return a; }, expected: [1, 2] },
        { name: 'throws TypeError for a non-function', run: (fn, t) => t.throws(() => [1].myMap(null)), expected: 'TypeError' },
      ],
    },

    '109': {
      task: 'Add `Array.prototype.myFilter` so it behaves like the built-in `filter`: callback gets `(element, index, array)`, supports `thisArg`, returns a new array. The tests compare it with the built-in.',
      starter: 'Array.prototype.myFilter = function (callback, thisArg) {\n  \n};\n\nconsole.log([1, 2, 3, 4].myFilter(n => n % 2 === 0));\n',
      global: 'Array.prototype.myFilter',
      tests: [
        { name: 'keeps even numbers', run: () => [1, 2, 3, 4].myFilter(n => n % 2 === 0), expected: () => [1, 2, 3, 4].filter(n => n % 2 === 0) },
        { name: 'nothing matches', run: () => [1, 3].myFilter(n => n > 5), expected: [] },
        { name: 'passes the index', run: () => ['a', 'b', 'c'].myFilter((x, i) => i !== 1), expected: ['a', 'c'] },
        { name: 'supports thisArg', run: () => [1, 2, 3].myFilter(function (x) { return x > this.min; }, { min: 1 }), expected: [2, 3] },
        { name: 'returns a new array', run: () => { const a = [1]; return a.myFilter(() => true) !== a; }, expected: true },
        { name: 'throws TypeError for a non-function', run: (fn, t) => t.throws(() => [1].myFilter()), expected: 'TypeError' },
      ],
    },

    '110': {
      task: 'Add `Array.prototype.myReduce` so it behaves like the built-in `reduce`, including: no initial value (start from the first element), and a `TypeError` for an empty array with no initial value. The tests compare it with the built-in.',
      starter: 'Array.prototype.myReduce = function (callback, initialValue) {\n  \n};\n\nconsole.log([1, 2, 3].myReduce((a, b) => a + b, 0));\n',
      global: 'Array.prototype.myReduce',
      tests: [
        { name: 'sum with initial value', run: () => [1, 2, 3].myReduce((a, b) => a + b, 0), expected: () => [1, 2, 3].reduce((a, b) => a + b, 0) },
        { name: 'sum without initial value', run: () => [1, 2, 3].myReduce((a, b) => a + b), expected: 6 },
        { name: 'builds an object', run: () => ['a', 'b'].myReduce((acc, k, i) => { acc[k] = i; return acc; }, {}), expected: { a: 0, b: 1 } },
        { name: 'empty array with initial value', run: () => [].myReduce((a, b) => a + b, 5), expected: 5 },
        { name: 'empty array without initial value throws TypeError', run: (fn, t) => t.throws(() => [].myReduce((a, b) => a + b)), expected: 'TypeError' },
        { name: 'initial value of undefined still counts', run: () => [1].myReduce(acc => acc, undefined), expected: undefined },
        { name: 'passes the index (starting at 1 without initial value)', run: () => [5, 6, 7].myReduce((acc, x, i) => acc + i), expected: 8 },
      ],
    },

    'cb3': {
      task: 'Add `Function.prototype.myCall(context, ...args)` and `Function.prototype.myApply(context, argsArray)` without using the built-in `call`, `apply` or `bind`. Return the result, and leave no extra properties on `context`.',
      starter: 'Function.prototype.myCall = function (context, ...args) {\n  \n};\n\nFunction.prototype.myApply = function (context, args) {\n  \n};\n\nfunction greet(greeting) { return `${greeting}, ${this.name}`; }\nconsole.log(greet.myCall({ name: "Sam" }, "Hi"));\nconsole.log(greet.myApply({ name: "Sam" }, ["Hey"]));\n',
      global: 'Function.prototype.myCall',
      tests: [
        { name: 'myCall sets this and passes arguments', run: () => greet.myCall({ name: 'Sam' }, 'Hi', '!'), expected: () => greet.call({ name: 'Sam' }, 'Hi', '!') },
        { name: 'myApply takes an array of arguments', run: () => greet.myApply({ name: 'Sam' }, ['Hey', '?']), expected: 'Hey, Sam?' },
        { name: 'myApply works with no arguments array', run: () => (function () { return this.v; }).myApply({ v: 1 }), expected: 1 },
        {
          name: 'leaves no extra properties on context',
          run: () => { const ctx = { name: 'A' }; greet.myCall(ctx, 'Hi'); greet.myApply(ctx, ['Yo']); return Reflect.ownKeys(ctx).length; },
          expected: 1,
        },
        {
          name: 'does not overwrite an existing property called "fn"',
          run: () => { const ctx = { fn: 'keep' }; (function () { return 1; }).myCall(ctx); return ctx.fn; },
          expected: 'keep',
        },
        { name: 'primitive context (a number)', run: () => (function () { return typeof this; }).myCall(5), expected: 'object' },
      ],
    },

    'cb4': {
      task: 'Add `Function.prototype.myBind(context, ...preset)`. It returns a new function with `this` fixed to `context`, preset arguments first and later arguments appended. Bonus: when called with `new`, ignore the bound `this`.',
      starter: 'Function.prototype.myBind = function (context, ...preset) {\n  \n};\n\nfunction greet(greeting, punct) { return `${greeting}, ${this.name}${punct}`; }\nconst hi = greet.myBind({ name: "Sam" }, "Hi");\nconsole.log(hi("!"));\n',
      global: 'Function.prototype.myBind',
      tests: [
        { name: 'returns a function', run: () => typeof greet.myBind({ name: 'Sam' }), expected: 'function' },
        { name: 'binds this', run: () => greet.myBind({ name: 'Sam' })('Hi', '!'), expected: () => greet.bind({ name: 'Sam' })('Hi', '!') },
        { name: 'preset arguments come first', run: () => greet.myBind({ name: 'Sam' }, 'Hi')('?'), expected: 'Hi, Sam?' },
        { name: 'this stays bound when called with .call', run: () => greet.myBind({ name: 'Sam' }, 'Hi').call({ name: 'X' }, '.'), expected: 'Hi, Sam.' },
        {
          name: 'bonus: works with new',
          run: () => { function P(a, b) { this.sum = a + b; } const B = P.myBind({ ignored: true }, 1); const p = new B(2); return [p.sum, p.ignored]; },
          expected: [3, undefined],
        },
      ],
    },

    // ---------- React machine coding ----------
    'm1': {
      react: true,
      task: 'Show a count with -, + and Reset buttons. The preview renders your default export.',
      starter: "import { useState } from 'react';\n\nexport default function Counter() {\n  return (\n    <div>\n      <h2>0</h2>\n      <button>-</button>\n      <button>+</button>\n      <button>Reset</button>\n    </div>\n  );\n}\n",
    },
    'm2': {
      react: true,
      task: 'Fetch https://jsonplaceholder.typicode.com/users and list the usernames. Handle loading, errors and the empty case.',
      starter: "import { useEffect, useState } from 'react';\n\nexport default function UserList() {\n  const [users, setUsers] = useState([]);\n\n  return <ul>{users.map(u => <li key={u.id}>{u.username}</li>)}</ul>;\n}\n",
    },
    'm3': {
      react: true,
      task: 'Filter the items by a search box and a category dropdown. Sample data is provided.',
      starter: "import { useState } from 'react';\n\nconst ITEMS = [\n  { id: 1, name: 'Apple', category: 'fruit' },\n  { id: 2, name: 'Banana', category: 'fruit' },\n  { id: 3, name: 'Carrot', category: 'vegetable' },\n  { id: 4, name: 'Broccoli', category: 'vegetable' },\n  { id: 5, name: 'Cheddar', category: 'dairy' },\n];\n\nfunction SearchableList({ items }) {\n  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;\n}\n\nexport default function App() {\n  return <SearchableList items={ITEMS} />;\n}\n",
    },
    'm4': {
      react: true,
      task: 'Let the user enter N and render an N × N grid of cells that toggle colour on click.',
      starter: "import { useState } from 'react';\n\nexport default function Grid() {\n  const [n, setN] = useState(3);\n\n  return (\n    <div>\n      <input type=\"number\" value={n} onChange={e => setN(+e.target.value)} />\n    </div>\n  );\n}\n",
    },
    'm5': {
      react: true,
      task: 'List products from https://dummyjson.com/products?limit=10&skip=… with Prev / Next buttons. Handle loading and errors.',
      starter: "import { useEffect, useState } from 'react';\n\nconst PAGE_SIZE = 10;\n\nexport default function ProductList() {\n  const [page, setPage] = useState(1);\n\n  return (\n    <div>\n      <p>Page {page}</p>\n      <button onClick={() => setPage(p => p - 1)}>Prev</button>\n      <button onClick={() => setPage(p => p + 1)}>Next</button>\n    </div>\n  );\n}\n",
    },
    'm6': {
      react: true,
      task: 'Write a `useApi(url)` hook returning `{ data, loading, error, refetch }`. The App below uses it.',
      starter: "import { useCallback, useEffect, useState } from 'react';\n\nfunction useApi(url) {\n  return { data: null, loading: false, error: null, refetch: () => {} };\n}\n\nexport default function App() {\n  const { data, loading, error, refetch } = useApi('https://jsonplaceholder.typicode.com/todos/1');\n  if (loading) return <p>Loading…</p>;\n  if (error) return <p>Error: {String(error.message || error)}</p>;\n  return (\n    <div>\n      <pre>{JSON.stringify(data, null, 2)}</pre>\n      <button onClick={refetch}>Refetch</button>\n    </div>\n  );\n}\n",
    },
    // ---------- HTML & CSS (live preview) ----------
    'hc1': {
      html: true,
      task: "Centre the `.box` inside `.stage`, both ways. Then try a second technique.",
      starter: "<style>\n  .stage {\n    height: 240px;\n    background: #eef2ff;\n    border: 2px dashed #6366f1;\n  }\n  .box {\n    width: 120px;\n    padding: 16px;\n    background: #4f46e5;\n    color: white;\n    text-align: center;\n  }\n</style>\n\n<div class=\"stage\">\n  <div class=\"box\">Centre me</div>\n</div>\n",
    },
    'hc2': {
      html: true,
      task: "Lay out the page with CSS Grid: header and footer full width, sidebar beside main. Below 600px wide, stack everything in one column. Use the Mobile button to test.",
      starter: "<style>\n  body { margin: 0; font-family: system-ui, sans-serif; }\n  header, aside, main, footer { padding: 16px; }\n  header { background: #1e293b; color: white; }\n  aside  { background: #e2e8f0; }\n  main   { background: #f8fafc; }\n  footer { background: #cbd5e1; }\n\n  .page {\n    /* your layout here */\n  }\n</style>\n\n<div class=\"page\">\n  <header>Header</header>\n  <aside>Sidebar</aside>\n  <main>Main content</main>\n  <footer>Footer</footer>\n</div>\n",
    },
    'hc3': {
      html: true,
      task: "Make the cards wrap into as many columns as fit, each at least 180px wide, with equal gaps. No media queries.",
      starter: "<style>\n  body { font-family: system-ui, sans-serif; }\n  .cards {\n    /* your grid here */\n  }\n  .card {\n    padding: 16px;\n    border: 1px solid #e5e7eb;\n    border-radius: 12px;\n    background: #fff;\n    box-shadow: 0 1px 2px rgb(0 0 0 / .06);\n  }\n</style>\n\n<div class=\"cards\">\n  <div class=\"card\"><h3>One</h3><p>Some text.</p></div>\n  <div class=\"card\"><h3>Two</h3><p>Some longer text that wraps onto a second line.</p></div>\n  <div class=\"card\"><h3>Three</h3><p>Some text.</p></div>\n  <div class=\"card\"><h3>Four</h3><p>Some text.</p></div>\n  <div class=\"card\"><h3>Five</h3><p>Some text.</p></div>\n</div>\n",
    },
    'hc4': {
      html: true,
      task: "Put the logo on the left and the links on the right with Flexbox. On narrow screens, let the links wrap onto their own line. Give the links clear hover and focus-visible styles.",
      starter: "<style>\n  body { margin: 0; font-family: system-ui, sans-serif; }\n  .nav {\n    padding: 12px 20px;\n    background: #111827;\n  }\n  .logo { color: white; font-weight: 700; text-decoration: none; }\n  .links { list-style: none; margin: 0; padding: 0; }\n  .links a { color: #d1d5db; text-decoration: none; }\n</style>\n\n<nav class=\"nav\" aria-label=\"Main\">\n  <a class=\"logo\" href=\"#\">Acme</a>\n  <ul class=\"links\">\n    <li><a href=\"#\" aria-current=\"page\">Home</a></li>\n    <li><a href=\"#\">Pricing</a></li>\n    <li><a href=\"#\">Docs</a></li>\n    <li><a href=\"#\">Contact</a></li>\n  </ul>\n</nav>\n",
    },
    'hc5': {
      html: true,
      task: "Make the title stay on one line with \"…\" at the end, and cut the description off after 3 lines.",
      starter: "<style>\n  body { font-family: system-ui, sans-serif; }\n  .card { width: 260px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; }\n  .title {\n    margin: 0 0 8px;\n  }\n  .desc {\n    margin: 0;\n    color: #4b5563;\n  }\n</style>\n\n<div class=\"card\">\n  <h3 class=\"title\">A very long product title that does not fit on one line</h3>\n  <p class=\"desc\">This description is far too long for the card. It keeps going for several lines so you can see the clamp working, and it should stop after the third line with an ellipsis instead of pushing the card taller and taller.</p>\n</div>\n",
    },
    'hc6': {
      html: true,
      task: "Show the tooltip above the button on hover and when the button has keyboard focus. Add a small arrow with a pseudo-element.",
      starter: "<style>\n  body { font-family: system-ui, sans-serif; padding: 60px 40px; }\n  .tip-wrap { position: relative; display: inline-block; }\n  .tooltip {\n    padding: 6px 10px;\n    border-radius: 6px;\n    background: #111827;\n    color: white;\n    font-size: 13px;\n    white-space: nowrap;\n  }\n</style>\n\n<span class=\"tip-wrap\">\n  <button type=\"button\" aria-describedby=\"tip1\">Save draft</button>\n  <span class=\"tooltip\" role=\"tooltip\" id=\"tip1\">Saved in this browser only</span>\n</span>\n",
    },
    'hc7': {
      html: true,
      task: "Cover the whole frame with a semi-transparent backdrop, and centre the dialog on top of the page content. Long dialog content should scroll inside the panel.",
      starter: "<style>\n  body { font-family: system-ui, sans-serif; }\n  .backdrop {\n  }\n  .dialog {\n    padding: 20px;\n    border-radius: 12px;\n    background: white;\n  }\n  .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }\n</style>\n\n<h1>Page behind the modal</h1>\n<p>This content should be dimmed by the backdrop.</p>\n\n<div class=\"backdrop\">\n  <div class=\"dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"dlg-title\">\n    <h2 id=\"dlg-title\">Delete file?</h2>\n    <p>This can't be undone.</p>\n    <div class=\"actions\">\n      <button type=\"button\">Cancel</button>\n      <button type=\"button\">Delete</button>\n    </div>\n  </div>\n</div>\n",
    },
    'hc8': {
      html: true,
      task: "Turn `.spinner` into a spinning ring with @keyframes. Slow it right down (or stop it) for people who prefer reduced motion. Keep the text for screen readers.",
      starter: "<style>\n  body { font-family: system-ui, sans-serif; padding: 24px; }\n  .spinner {\n    width: 40px;\n    height: 40px;\n  }\n  .visually-hidden {\n    position: absolute; width: 1px; height: 1px; overflow: hidden;\n    clip: rect(0 0 0 0); white-space: nowrap;\n  }\n</style>\n\n<div role=\"status\">\n  <div class=\"spinner\" aria-hidden=\"true\"></div>\n  <span class=\"visually-hidden\">Loading…</span>\n</div>\n",
    },
    'hc9': {
      html: true,
      task: "Make the checkbox look like a toggle switch, but keep the real `<input>` in the page so it works with the keyboard, labels and screen readers. Show a focus ring and a checked state.",
      starter: "<style>\n  body { font-family: system-ui, sans-serif; padding: 24px; }\n  .switch { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; }\n  .switch input {\n  }\n  .track {\n    width: 44px;\n    height: 24px;\n    border-radius: 999px;\n    background: #d1d5db;\n  }\n</style>\n\n<label class=\"switch\">\n  <input type=\"checkbox\">\n  <span class=\"track\" aria-hidden=\"true\"></span>\n  Email notifications\n</label>\n",
    },
    'hc10': {
      html: true,
      task: "Keep the header row visible while the table scrolls vertically inside `.table-wrap`, and let the table scroll sideways instead of breaking the layout on narrow screens.",
      starter: "<style>\n  body { font-family: system-ui, sans-serif; }\n  .table-wrap {\n    max-height: 200px;\n    border: 1px solid #e5e7eb;\n    border-radius: 8px;\n  }\n  table { border-collapse: collapse; width: 100%; }\n  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }\n  th { background: #f3f4f6; }\n</style>\n\n<div class=\"table-wrap\">\n  <table>\n    <thead><tr><th>Name</th><th>Role</th><th>Team</th><th>Location</th><th>Start date</th></tr></thead>\n    <tbody>\n      <tr><td>Asha</td><td>Engineer</td><td>Payments</td><td>Pune</td><td>2022-04-01</td></tr>\n      <tr><td>Ben</td><td>Designer</td><td>Growth</td><td>London</td><td>2021-09-15</td></tr>\n      <tr><td>Chen</td><td>Engineer</td><td>Platform</td><td>Singapore</td><td>2023-01-09</td></tr>\n      <tr><td>Dina</td><td>Manager</td><td>Payments</td><td>Berlin</td><td>2020-06-22</td></tr>\n      <tr><td>Eli</td><td>Engineer</td><td>Search</td><td>Toronto</td><td>2024-02-12</td></tr>\n      <tr><td>Fatima</td><td>Analyst</td><td>Growth</td><td>Dubai</td><td>2023-07-03</td></tr>\n      <tr><td>Gopal</td><td>Engineer</td><td>Platform</td><td>Bengaluru</td><td>2022-11-28</td></tr>\n    </tbody>\n  </table>\n</div>\n",
    },
  };
})(typeof self !== 'undefined' ? self : this);
