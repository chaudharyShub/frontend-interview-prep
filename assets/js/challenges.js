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
  };
})(typeof self !== 'undefined' ? self : this);
