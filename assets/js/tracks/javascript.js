/**
 * Track: JavaScript. Loaded on every page (see assets/js/app.js).
 *
 * Each tab has sections, and each section a list of items:
 *   id    – stable unique id (progress, stars and drafts are saved against it; never change it)
 *   q     – question text
 *   a     – answer (light Markdown: paragraphs, - lists, 1. lists, `code`, **bold**, ``` fences)
 *   note  – optional hint shown under the question
 *   code  – optional code snippet shown with the question
 * Coding questions can also have an editor entry in challenges.js (same id).
 */
(window.TRACKS = window.TRACKS || []).push({
  "slug": "javascript",
  "title": "JavaScript",
  "description": "Closures, the event loop, this, promises, prototypes, plus coding problems and polyfills you can run and test in the browser.",
  "tabs": [
    {
      "slug": "theory",
      "title": "Theory",
      "sections": [
        {
          "title": "Fundamentals",
          "items": [
            {
              "id": "56",
              "q": "What are closures? Give a real-world example.",
              "a": "A closure is a function bundled with references to the variables of the scope where it was created, so it can still access them after the outer function has returned.\n```js\nfunction createCounter() {\n  let count = 0;                 // private\n  return {\n    increment: () => ++count,\n    get: () => count,\n  };\n}\nconst c = createCounter(); c.increment(); c.get(); // 1\n```\nReal-world uses: **data privacy** (module pattern), **debounce/throttle** (keep the timer id), **memoization caches**, function factories/currying, event handlers remembering values, and React hooks themselves (every handler closes over that render's state)."
            },
            {
              "id": "57",
              "q": "How are closures related to garbage collection?",
              "a": "Garbage collection (mark-and-sweep) frees memory that's no longer **reachable**. A closure keeps its outer variables reachable as long as the closure itself is reachable, so they won't be collected.\n- Usually fine and intended (that's how closures work).\n- **Memory leaks** happen when closures stay referenced unintentionally: event listeners never removed, intervals never cleared, closures stored in global caches, or a closure holding a large object it doesn't need.\n- Fix: remove listeners/clear timers (React effect cleanup), set references to `null`, avoid capturing large objects, use `WeakMap`/`WeakRef` for caches.\nModern engines only keep variables that a closure actually uses (but closures from the same scope share one context object)."
            },
            {
              "id": "58",
              "q": "Explain the JavaScript event loop.",
              "a": "JavaScript is single-threaded with one **call stack**. The event loop lets it handle async work without blocking:\n1. Synchronous code runs on the call stack.\n2. Async APIs (timers, fetch, DOM events) are handled by the browser/Node (Web APIs); when done, their callbacks are queued.\n3. When the call stack is empty, the event loop first runs **all microtasks** (Promise `.then`, `queueMicrotask`, `MutationObserver`, `await` continuations).\n4. Then the browser may render, and the loop takes **one macrotask** (setTimeout, setInterval, I/O, UI events) and repeats.\n```js\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n// 1 4 3 2\n```"
            },
            {
              "id": "59",
              "q": "What is the difference between synchronous and asynchronous JavaScript?",
              "a": "- **Synchronous**: code runs line by line; each statement waits for the previous one to finish. A long task blocks the thread (UI freezes).\n- **Asynchronous**: long operations (network, timers, file I/O) are started and the code continues; the result is handled later via callbacks, promises or async/await when the event loop picks it up.\n```js\nconsole.log('A');\nfetch('/api').then(() => console.log('C'));\nconsole.log('B');  // A, B, C\n```\nJS itself is still single-threaded; asynchrony comes from the environment (browser/Node) plus the event loop."
            },
            {
              "id": "60",
              "q": "What is the difference between microtasks and macrotasks?",
              "a": "- **Microtasks**: Promise callbacks (`then/catch/finally`), `await` continuation, `queueMicrotask`, `MutationObserver`, `process.nextTick` (Node, even higher priority). The **entire** microtask queue is drained after each task, before rendering.\n- **Macrotasks (tasks)**: `setTimeout`, `setInterval`, `setImmediate` (Node), I/O, UI events, `MessageChannel`. **One** macrotask per loop iteration.\nSo microtasks always run before the next macrotask:\n```js\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('promise'));\n// promise, timeout\n```\nInfinite microtasks can starve rendering and macrotasks."
            },
            {
              "id": "61",
              "q": "What is the difference between var, let, and const?",
              "a": "- **var**: function-scoped, hoisted and initialized to `undefined`, can be re-declared and re-assigned, creates a property on `window` at global level.\n- **let**: block-scoped, hoisted but in the **Temporal Dead Zone** until declared (ReferenceError if accessed earlier), can be re-assigned, not re-declared in the same scope.\n- **const**: like `let` but must be initialized and cannot be re-assigned. Objects/arrays declared with `const` can still be mutated.\n```js\nfor (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3\nfor (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2\n```\nDefault to `const`, use `let` when reassignment is needed, avoid `var`."
            },
            {
              "id": "62",
              "q": "Explain hoisting in JavaScript.",
              "a": "Hoisting: during the creation phase, JS registers declarations in memory before executing code, so they behave as if moved to the top of their scope.\n- **Function declarations**: fully hoisted — can be called before they're defined.\n- **var**: hoisted and initialized to `undefined`.\n- **let/const/class**: hoisted but not initialized (Temporal Dead Zone) → ReferenceError before the declaration.\n- **Function expressions/arrow functions** assigned to variables follow the variable's rules.\n```js\nconsole.log(a); // undefined\nvar a = 5;\ngreet();        // works\nfunction greet() {}\nconsole.log(b); // ReferenceError\nlet b = 1;\nsayHi();        // TypeError: sayHi is not a function\nvar sayHi = () => {};\n```"
            },
            {
              "id": "63",
              "q": "What is the difference between normal functions and arrow functions?",
              "a": "- **`this`**: normal functions get `this` from how they are called; arrow functions have no own `this` — they use the `this` of the surrounding scope (lexical).\n- **`arguments`**: normal functions have it; arrows don't (use rest `...args`).\n- **Constructor**: normal functions can be called with `new`; arrows can't (no `prototype`).\n- **Hoisting**: function declarations are hoisted; arrows (as expressions) are not.\n- **Syntax**: arrows are shorter and support implicit return.\n- `call/apply/bind` cannot change an arrow function's `this`.\nUse arrows for callbacks and when you want to keep the outer `this`; normal functions for object methods and constructors."
            },
            {
              "id": "64",
              "q": "How does the this keyword behave in arrow and normal functions?",
              "a": "Normal functions — `this` depends on the call site:\n- Method call `obj.fn()` → `obj`.\n- Plain call `fn()` → `undefined` in strict mode, `window`/global in sloppy mode.\n- `new Fn()` → the new object.\n- `fn.call/apply/bind(x)` → `x`.\n- DOM event handler → the element.\nArrow functions — `this` is taken lexically from the enclosing scope at definition time and never changes.\n```js\nconst obj = {\n  name: 'A',\n  normal() { return this.name; },        // 'A'\n  arrow: () => this?.name,                // undefined (outer scope)\n  delayed() { setTimeout(() => console.log(this.name)); } // 'A' (arrow keeps method's this)\n};\n```"
            },
            {
              "id": "65",
              "q": "What is the difference between call(), apply(), and bind()?",
              "a": "All three set `this` for a function:\n- **`call(thisArg, a, b)`**: invokes immediately, args one by one.\n- **`apply(thisArg, [a, b])`**: invokes immediately, args as an array.\n- **`bind(thisArg, a)`**: does **not** invoke; returns a new function with `this` (and optionally some args) permanently bound.\n```js\nfunction greet(greeting, punct) { return `${greeting}, ${this.name}${punct}`; }\nconst user = { name: 'Sam' };\ngreet.call(user, 'Hi', '!');      // \"Hi, Sam!\"\ngreet.apply(user, ['Hello', '.']); // \"Hello, Sam.\"\nconst g = greet.bind(user, 'Hey'); g('?'); // \"Hey, Sam?\"\n```\nUse cases: borrowing methods (`Math.max.apply(null, arr)`), binding handlers in class components, partial application."
            },
            {
              "id": "cb1",
              "q": "What happens if you bind() an already bound function, or call it with call()/apply()?",
              "a": "A bound function's `this` is **fixed permanently**. Later attempts to change it are ignored:\n```js\nfunction show() { return this.name; }\nconst a = { name: 'A' }, b = { name: 'B' };\n\nconst boundA = show.bind(a);\nboundA.call(b);   // \"A\" – call/apply can't override it\nboundA.bind(b)(); // \"A\" – the second bind's this is ignored\n```\n- Extra **arguments** from a second `bind` are still added: `add.bind(null, 1).bind(null, 2)()` passes `1, 2`.\n- **`new` wins**: calling a bound function with `new` ignores the bound `this` and creates a new object (bound arguments are still used).\n- **Arrow functions** have no own `this`, so `call`, `apply` and `bind` can't change it; only the arguments are passed.\n\nPrecedence for `this`: `new` > explicit binding (`bind`/`call`/`apply`) > method call (`obj.fn()`) > default (`undefined` in strict mode, `globalThis` otherwise)."
            },
            {
              "id": "cb2",
              "q": "Why does a method lose its this context when passed as a callback, and how do you fix it?",
              "a": "`this` is decided by **how a function is called**, not where it is defined. Passing `obj.method` as a callback passes only the function, so it is later called without its object:\n```js\nconst counter = {\n  count: 0,\n  inc() { this.count++; },\n};\nsetTimeout(counter.inc, 0);                    // this is window, not counter – bug\nbutton.addEventListener('click', counter.inc); // this is the button – bug\n```\nFixes:\n- **`bind`**: `setTimeout(counter.inc.bind(counter), 0)`\n- **Arrow wrapper**: `setTimeout(() => counter.inc(), 0)`\n- **Arrow class fields** (bound per instance): `handleClick = () => { ... }`. This is the usual fix in React class components, instead of `this.handleClick = this.handleClick.bind(this)` in the constructor.\n\nNote: calling `bind` (or creating an arrow) inside render makes a new function every time, which can defeat `React.memo` / `PureComponent` optimisations."
            },
            {
              "id": "66",
              "q": "What is event bubbling and event capturing?",
              "a": "When an event fires on an element, it travels in three phases:\n1. **Capturing**: from `window` down through ancestors to the target.\n2. **Target** phase.\n3. **Bubbling**: from the target back up to `window`.\n`addEventListener(type, handler)` listens in the bubbling phase by default; pass `{ capture: true }` (or `true`) for capturing.\n```js\nparent.addEventListener('click', () => console.log('parent'));\nchild.addEventListener('click', () => console.log('child'));\n// click child → \"child\", then \"parent\"\n```\n`e.stopPropagation()` stops further travel; `e.preventDefault()` only stops the default browser action. Some events don't bubble (`focus`, `blur` — use `focusin/focusout`)."
            },
            {
              "id": "67",
              "q": "What is event delegation? Where would you use it?",
              "a": "Event delegation means attaching **one listener to a common parent** instead of a listener on every child, and using `e.target` to find which child was clicked. It works because events bubble.\n```js\ndocument.getElementById('list').addEventListener('click', e => {\n  const item = e.target.closest('li');\n  if (item) console.log('Clicked', item.dataset.id);\n});\n```\nBenefits: fewer listeners (less memory), works for elements added dynamically later, simpler cleanup.\nUse for: long lists, tables, menus, dynamically generated content. React itself uses delegation — it attaches listeners at the root container."
            },
            {
              "id": "68",
              "q": "What is the difference between map(), filter(), and forEach()?",
              "a": "- **`forEach`**: runs a function for each element; returns `undefined`. Used for side effects. Can't be broken out of (except by throwing).\n- **`map`**: returns a **new array** of the same length with each element transformed.\n- **`filter`**: returns a **new array** with only elements for which the callback returns truthy.\n```js\nconst nums = [1, 2, 3, 4];\nnums.map(n => n * 2);        // [2, 4, 6, 8]\nnums.filter(n => n % 2 === 0); // [2, 4]\nnums.forEach(n => console.log(n)); // undefined\n```\nNone mutate the original array (unless your callback does). `map` and `filter` are chainable."
            },
            {
              "id": "69",
              "q": "What is the difference between shallow copy and deep copy?",
              "a": "- **Shallow copy**: copies the top-level properties only; nested objects/arrays are still **shared references**. Methods: spread `{...obj}`, `[...arr]`, `Object.assign`, `Array.from`, `slice`.\n- **Deep copy**: recursively copies every level, so the copy is fully independent. Methods: `structuredClone(obj)` (modern, handles Dates, Maps, Sets, circular refs; not functions), `JSON.parse(JSON.stringify(obj))` (loses functions, `undefined`, Dates become strings, fails on circular refs), lodash `cloneDeep`.\n```js\nconst a = { user: { name: 'A' } };\nconst s = { ...a };            s.user.name = 'B'; // a.user.name is now 'B'\nconst d = structuredClone(a);  d.user.name = 'C'; // a unchanged\n```\nIn React/Redux, immutable updates are usually shallow copies along the changed path."
            },
            {
              "id": "70",
              "q": "What are Promises?",
              "a": "A Promise is an object representing the eventual result of an async operation. States: **pending** → **fulfilled** (with a value) or **rejected** (with a reason). Once settled it never changes.\n```js\nconst p = new Promise((resolve, reject) => {\n  setTimeout(() => resolve('done'), 1000);\n});\np.then(v => console.log(v))\n .catch(e => console.error(e))\n .finally(() => console.log('cleanup'));\n```\nSolves \"callback hell\": chaining (`then` returns a new promise), centralized error handling with `.catch`. Combinators: `Promise.all`, `allSettled`, `race`, `any`. Callbacks run as microtasks."
            },
            {
              "id": "71",
              "q": "What is the difference between Promise.all() and Promise.allSettled()?",
              "a": "- **`Promise.all(promises)`**: resolves with an array of all values when **all** fulfil; **rejects immediately** when any one rejects (fail-fast). Use when all results are required (e.g. page needs all data).\n- **`Promise.allSettled(promises)`**: waits for **all** to settle and never rejects; returns `[{status: 'fulfilled', value}, {status: 'rejected', reason}]`. Use when calls are independent and you want partial results (e.g. dashboard widgets).\n```js\nconst results = await Promise.allSettled([getUser(), getOrders()]);\nresults.forEach(r => r.status === 'fulfilled' ? use(r.value) : log(r.reason));\n```\nAlso: `Promise.race` (first to settle) and `Promise.any` (first to fulfil; rejects only if all reject)."
            },
            {
              "id": "72",
              "q": "What is the difference between Promises and async/await?",
              "a": "`async/await` is syntax on top of Promises — same mechanism, different style.\n- **Promises**: chain `.then().catch()`; can get nested with complex flows.\n- **async/await**: code reads like synchronous code; errors handled with `try/catch`; easier debugging and conditionals/loops.\n- An `async` function always returns a Promise; `await` pauses that function (not the thread) until the promise settles.\n```js\nasync function load() {\n  try {\n    const user = await getUser();\n    const orders = await getOrders(user.id);\n    return orders;\n  } catch (e) { handle(e); }\n}\n```\nPitfall: sequential `await`s for independent calls are slow — use `await Promise.all([a(), b()])`."
            },
            {
              "id": "73",
              "q": "What is a polyfill? Have you written any?",
              "a": "A polyfill is code that implements a modern feature in environments (old browsers) that don't support it natively, usually by checking if it exists first.\n```js\nif (!Array.prototype.includes) {\n  Array.prototype.includes = function (search, from = 0) {\n    for (let i = from; i < this.length; i++) {\n      if (this[i] === search || (Number.isNaN(this[i]) && Number.isNaN(search))) return true;\n    }\n    return false;\n  };\n}\n```\nInterview favourites: `map`, `filter`, `reduce`, `bind`, `Promise.all`, `debounce`, `flat`. In real projects, polyfills come from **core-js** via Babel (`@babel/preset-env` + browserslist). (A polyfill adds missing APIs; a transpiler converts new syntax.)"
            },
            {
              "id": "74",
              "q": "What is the difference between debounce and throttle?",
              "a": "Both limit how often a function runs during rapid events.\n- **Debounce**: runs the function only **after the events stop** for X ms; each new event resets the timer. Use for search-as-you-type, autosave, window resize end, form validation.\n- **Throttle**: runs the function **at most once every X ms** during continuous events. Use for scroll, mousemove, infinite scroll checks, button spam protection, analytics.\nExample: typing for 2 seconds with 300 ms wait — debounce calls once (at the end); throttle calls about 7 times."
            },
            {
              "id": "75",
              "q": "How would you implement debounce and throttle from scratch?",
              "a": "```js\nfunction debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n\nfunction throttle(fn, limit) {\n  let waiting = false;\n  return function (...args) {\n    if (waiting) return;\n    fn.apply(this, args);\n    waiting = true;\n    setTimeout(() => { waiting = false; }, limit);\n  };\n}\n\nconst onSearch = debounce(q => fetchResults(q), 300);\nwindow.addEventListener('scroll', throttle(handleScroll, 200));\n```\nBoth use a **closure** to keep `timer`/`waiting` between calls. Mention extras: leading/trailing options, a `cancel()` method. In React, create them once with `useMemo`/`useRef` (otherwise a new debounced function is created every render) and cancel in cleanup."
            },
            {
              "id": "76",
              "q": "What happens when multiple buttons use the same debounce function?",
              "a": "If **one** debounced instance is shared by multiple buttons, they all share the same `timer` in the closure. Clicking button A then button B quickly cancels A's call — only the last click (B) runs. That's a bug if each button should act independently.\nFix: create a **separate debounced function per button** (or key the timers by id):\n```js\nfunction debounceByKey(fn, delay) {\n  const timers = {};\n  return (key, ...args) => {\n    clearTimeout(timers[key]);\n    timers[key] = setTimeout(() => fn(key, ...args), delay);\n  };\n}\n```\nSharing is fine when you *want* one action overall (e.g. one \"save\" for many inputs)."
            },
            {
              "id": "77",
              "q": "What is the difference between Object.freeze() and Object.seal()?",
              "a": "- **`Object.freeze(obj)`**: can't add, delete or **modify** properties. Fully read-only (at top level).\n- **`Object.seal(obj)`**: can't add or delete properties, but **can modify** existing values.\n- (`Object.preventExtensions`: can't add, but can delete and modify.)\nBoth are **shallow** — nested objects can still change unless you deep-freeze recursively. In strict mode, violations throw a TypeError; otherwise they fail silently. Check with `Object.isFrozen` / `Object.isSealed`.\n```js\nconst f = Object.freeze({ a: 1, n: { b: 2 } });\nf.a = 5;     // ignored\nf.n.b = 9;   // works (shallow)\nconst s = Object.seal({ a: 1 });\ns.a = 2;     // works\ns.c = 3;     // ignored\n```"
            },
            {
              "id": "78",
              "q": "What is the prototype chain in JavaScript?",
              "a": "Every object has an internal link `[[Prototype]]` (accessible via `Object.getPrototypeOf` or `__proto__`) to another object. When you access a property, JS looks on the object first, then up the chain of prototypes until it finds it or reaches `null`.\n```js\nconst arr = [];\n// arr → Array.prototype → Object.prototype → null\narr.push;      // found on Array.prototype\narr.hasOwnProperty; // found on Object.prototype\n```\n- Functions have a `prototype` property; objects created with `new Fn()` link to `Fn.prototype`.\n- `class` syntax is sugar over prototypes (`extends` sets up the chain).\n- `Object.create(proto)` creates an object with a given prototype.\nThis is how JS implements inheritance and shares methods efficiently across instances."
            }
          ]
        },
        {
          "title": "Async & APIs",
          "items": [
            {
              "id": "112",
              "q": "What is the difference between Fetch API and Axios?",
              "a": "- **Fetch**: built into browsers, no dependency. Returns a `Response`; you must call `res.json()`. **Does not reject on HTTP errors** (404/500) — check `res.ok`. No built-in interceptors or timeout (use AbortController).\n- **Axios**: third-party library. Automatically parses JSON and stringifies request bodies; **rejects on non-2xx**; **interceptors** for adding auth tokens / handling 401 globally; timeouts; upload/download progress; instances with base config; works in Node too.\n```js\nconst res = await fetch('/api/users');\nif (!res.ok) throw new Error(res.status);\nconst users = await res.json();\n\nconst { data: users2 } = await axios.get('/api/users');\n```"
            },
            {
              "id": "114",
              "q": "Suppose you have three APIs, and API 2 depends on the successful response of API 1. How would you implement this?",
              "a": "Run them **sequentially** where there's a dependency, using `async/await` (and parallelize anything independent):\n```js\nasync function loadDashboard() {\n  try {\n    setLoading(true);\n    const user = await api.getUser();                 // API 1\n    const orders = await api.getOrders(user.id);      // API 2 needs API 1's result\n    const recommendations = await api.getRecs(orders[0]?.id); // API 3\n    setData({ user, orders, recommendations });\n  } catch (err) {\n    setError(err);            // any failure stops the chain\n  } finally {\n    setLoading(false);\n  }\n}\n```\nIf API 3 only depends on API 1, run 2 and 3 together: `await Promise.all([getOrders(user.id), getRecs(user.id)])`.\nWith RTK Query/React Query: use the `skip` / `enabled` option — `useGetOrdersQuery(user?.id, { skip: !user })`. Also cancel with AbortController if the component unmounts."
            },
            {
              "id": "115",
              "q": "How would you call multiple APIs simultaneously?",
              "a": "Use `Promise.all` (all required) or `Promise.allSettled` (independent, want partial results):\n```js\nconst [users, products, stats] = await Promise.all([\n  api.get('/users'),\n  api.get('/products'),\n  api.get('/stats'),\n]);\n```\nTotal time ≈ the slowest request instead of the sum. With hooks libraries, simply call several query hooks in the component — they run in parallel. Limit concurrency if there are many requests (e.g. batches of 5)."
            },
            {
              "id": "116",
              "q": "How do you handle API failures when multiple requests are running?",
              "a": "- Use **`Promise.allSettled`** so one failure doesn't throw away successful results; render each section with its own error state.\n- With `Promise.all`, wrap each call with its own `.catch` to return a fallback:\n```js\nconst safe = p => p.then(data => ({ data })).catch(error => ({ error }));\nconst [users, stats] = await Promise.all([safe(getUsers()), safe(getStats())]);\n```\n- **Retry** with exponential backoff for transient errors (network, 503), not for 4xx.\n- If one failure makes the rest useless, use `Promise.all` and **abort** the other requests.\n- Show partial UI + \"retry\" per widget; log errors centrally (Sentry); wrap widgets in Error Boundaries."
            }
          ]
        }
      ]
    },
    {
      "slug": "coding",
      "title": "Coding",
      "sections": [
        {
          "title": "Arrays & strings",
          "items": [
            {
              "id": "95",
              "q": "Write a program to find the frequency of each character in a string.",
              "code": "const str = \"aabcabcb\";\n\n// Expected output:\n// { a: 3, b: 3, c: 2 }",
              "a": "```js\nfunction charFrequency(str) {\n  const freq = {};\n  for (const ch of str) {\n    freq[ch] = (freq[ch] || 0) + 1;\n  }\n  return freq;\n}\ncharFrequency(\"aabcabcb\"); // { a: 3, b: 3, c: 2 }\n\n// one-liner with reduce\nconst freq = [...str].reduce((acc, ch) => ({ ...acc, [ch]: (acc[ch] ?? 0) + 1 }), {});\n```\nTime O(n), space O(k) for k unique characters. (The reduce + spread version is O(n·k) — mention that the loop is better.)"
            },
            {
              "id": "96",
              "q": "Find the frequency of elements in an array.",
              "code": "const arr = [1, 2, 1, 2, 3, 3, 2, 1];\n\n// Expected output:\n// { 1: 3, 2: 3, 3: 2 }",
              "a": "```js\nfunction elementFrequency(arr) {\n  return arr.reduce((acc, item) => {\n    acc[item] = (acc[item] || 0) + 1;\n    return acc;\n  }, {});\n}\nelementFrequency([1, 2, 1, 2, 3, 3, 2, 1]); // { 1: 3, 2: 3, 3: 2 }\n\n// Use a Map if you need to keep the original key types (numbers, objects)\nconst m = new Map();\narr.forEach(x => m.set(x, (m.get(x) || 0) + 1));\n```\nTime O(n)."
            },
            {
              "id": "97",
              "q": "Find the sum of all elements in an array.",
              "a": "```js\nconst sum = arr => arr.reduce((acc, n) => acc + n, 0);\nsum([1, 2, 3, 4]); // 10\n\n// classic loop\nfunction sumLoop(arr) {\n  let total = 0;\n  for (let i = 0; i < arr.length; i++) total += arr[i];\n  return total;\n}\n```\nAlways pass the initial value `0` to `reduce` — otherwise an empty array throws a TypeError."
            },
            {
              "id": "98",
              "q": "Merge two arrays and remove duplicate elements.",
              "code": "const arr1 = [1, 2, 3, 7, 8];\nconst arr2 = [1, 4, 5, 9, 10];\n\n// Expected output:\n// [1, 2, 3, 4, 5, 7, 8, 9, 10]",
              "a": "```js\nconst arr1 = [1, 2, 3, 7, 8];\nconst arr2 = [1, 4, 5, 9, 10];\n\nconst merged = [...new Set([...arr1, ...arr2])].sort((a, b) => a - b);\n// [1, 2, 3, 4, 5, 7, 8, 9, 10]\n\n// without Set\nconst merged2 = arr1.concat(arr2)\n  .filter((x, i, all) => all.indexOf(x) === i)   // O(n²)\n  .sort((a, b) => a - b);\n```\nNote `sort()` without a comparator sorts as strings (`[10, 9]` → `[10, 9]` wrong order), so always pass `(a, b) => a - b` for numbers. If both arrays are already sorted, a two-pointer merge is O(n + m)."
            },
            {
              "id": "99",
              "q": "Convert two arrays into an object.",
              "code": "const keys = [\"name\", \"age\", \"country\"];\nconst values = [\"Bobby\", 30, \"India\"];\n\n// Expected output:\n// { name: \"Bobby\", age: 30, country: \"India\" }",
              "a": "```js\nconst keys = [\"name\", \"age\", \"country\"];\nconst values = [\"Bobby\", 30, \"India\"];\n\nconst obj = Object.fromEntries(keys.map((k, i) => [k, values[i]]));\n// { name: \"Bobby\", age: 30, country: \"India\" }\n\n// with reduce\nconst obj2 = keys.reduce((acc, k, i) => { acc[k] = values[i]; return acc; }, {});\n```"
            },
            {
              "id": "100",
              "q": "Write a function to find the first non-repeating character in a string.",
              "a": "```js\nfunction firstNonRepeating(str) {\n  const count = {};\n  for (const ch of str) count[ch] = (count[ch] || 0) + 1;\n  for (const ch of str) if (count[ch] === 1) return ch;\n  return null;\n}\nfirstNonRepeating(\"aabbcdc\"); // \"d\"\n```\nTwo passes, O(n) time. Alternative: `str.indexOf(ch) === str.lastIndexOf(ch)` — simpler but O(n²)."
            },
            {
              "id": "103",
              "q": "Sort an array of alphanumeric strings naturally.",
              "code": "const arr = [\"A1\", \"A10\", \"A11\", \"A2\", \"A3\"];\n\n// Expected:\n// [\"A1\", \"A2\", \"A3\", \"A10\", \"A11\"]",
              "a": "```js\nconst arr = [\"A1\", \"A10\", \"A11\", \"A2\", \"A3\"];\n\n// simplest: localeCompare with numeric option\narr.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));\n// [\"A1\", \"A2\", \"A3\", \"A10\", \"A11\"]\n\n// manual: compare letter prefix, then number\narr.sort((a, b) => {\n  const [, pa, na] = a.match(/^(\\D*)(\\d*)$/);\n  const [, pb, nb] = b.match(/^(\\D*)(\\d*)$/);\n  return pa === pb ? Number(na) - Number(nb) : pa.localeCompare(pb);\n});\n```\nDefault `sort()` compares strings character by character, so \"A10\" < \"A2\"."
            },
            {
              "id": "104",
              "q": "Find the second-largest number in an array.",
              "a": "```js\nfunction secondLargest(arr) {\n  let first = -Infinity, second = -Infinity;\n  for (const n of arr) {\n    if (n > first) { second = first; first = n; }\n    else if (n > second && n !== first) second = n;\n  }\n  return second === -Infinity ? null : second;\n}\nsecondLargest([10, 5, 20, 20, 8]); // 10\n```\nSingle pass, O(n), handles duplicates. Shortcut: `[...new Set(arr)].sort((a, b) => b - a)[1]` — O(n log n)."
            },
            {
              "id": "105",
              "q": "Flatten a nested array.",
              "a": "```js\nconst nested = [1, [2, [3, [4]], 5]];\n\nnested.flat(Infinity); // [1, 2, 3, 4, 5]\n\n// recursive\nfunction flatten(arr) {\n  return arr.reduce((acc, item) =>\n    Array.isArray(item) ? acc.concat(flatten(item)) : acc.concat(item), []);\n}\n\n// with depth (polyfill-like)\nfunction flat(arr, depth = 1) {\n  return depth > 0\n    ? arr.reduce((acc, x) => acc.concat(Array.isArray(x) ? flat(x, depth - 1) : x), [])\n    : arr.slice();\n}\n```\nIterative alternative uses a stack to avoid recursion limits for very deep arrays."
            },
            {
              "id": "106",
              "q": "Reverse a string without using the built-in reverse method.",
              "a": "```js\nfunction reverseString(str) {\n  let result = '';\n  for (let i = str.length - 1; i >= 0; i--) result += str[i];\n  return result;\n}\nreverseString(\"hello\"); // \"olleh\"\n\n// two-pointer swap on an array\nfunction reverse2(str) {\n  const a = [...str];          // spread handles emoji/unicode better than split('')\n  for (let i = 0, j = a.length - 1; i < j; i++, j--) [a[i], a[j]] = [a[j], a[i]];\n  return a.join('');\n}\n```"
            },
            {
              "id": "107",
              "q": "Find duplicate elements in an array.",
              "a": "```js\nfunction findDuplicates(arr) {\n  const seen = new Set();\n  const dupes = new Set();\n  for (const x of arr) {\n    if (seen.has(x)) dupes.add(x);\n    else seen.add(x);\n  }\n  return [...dupes];\n}\nfindDuplicates([1, 2, 3, 2, 4, 1, 1]); // [2, 1]\n\n// short version (O(n²))\narr.filter((x, i) => arr.indexOf(x) !== i);  // may repeat values\n```"
            }
          ]
        },
        {
          "title": "Functions & timing",
          "items": [
            {
              "id": "101",
              "q": "Implement debounce from scratch.",
              "a": "```js\nfunction debounce(fn, delay = 300) {\n  let timer;\n  function debounced(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  }\n  debounced.cancel = () => clearTimeout(timer);\n  return debounced;\n}\n\nconst input = document.querySelector('#search');\ninput.addEventListener('input', debounce(e => search(e.target.value), 400));\n```\nExplain: closure keeps `timer`; each call resets it; `fn` runs only after `delay` ms of silence; `apply(this, args)` preserves context and arguments."
            },
            {
              "id": "102",
              "q": "Implement throttle from scratch.",
              "a": "```js\nfunction throttle(fn, limit = 300) {\n  let last = 0;\n  return function (...args) {\n    const now = Date.now();\n    if (now - last >= limit) {\n      last = now;\n      fn.apply(this, args);\n    }\n  };\n}\n\nwindow.addEventListener('scroll', throttle(() => console.log(window.scrollY), 200));\n```\nThis is the \"leading edge\" version. A timer-based version can also guarantee a final trailing call after the events stop."
            }
          ]
        },
        {
          "title": "Polyfills",
          "items": [
            {
              "id": "108",
              "q": "Implement a custom map() function.",
              "a": "```js\nArray.prototype.myMap = function (callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');\n  const result = new Array(this.length);\n  for (let i = 0; i < this.length; i++) {\n    if (i in this) result[i] = callback.call(thisArg, this[i], i, this); // skip holes\n  }\n  return result;\n};\n[1, 2, 3].myMap(x => x * 2); // [2, 4, 6]\n```\nPoints to mention: callback gets `(element, index, array)`, supports `thisArg`, returns a new array, doesn't mutate the original. Use a normal `function` so `this` is the array."
            },
            {
              "id": "109",
              "q": "Implement a custom filter() function.",
              "a": "```js\nArray.prototype.myFilter = function (callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');\n  const result = [];\n  for (let i = 0; i < this.length; i++) {\n    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);\n  }\n  return result;\n};\n[1, 2, 3, 4].myFilter(n => n % 2 === 0); // [2, 4]\n```"
            },
            {
              "id": "110",
              "q": "Write a polyfill for Array.prototype.reduce().",
              "a": "```js\nArray.prototype.myReduce = function (callback, initialValue) {\n  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');\n  const arr = this;\n  let i = 0;\n  let acc;\n  if (arguments.length >= 2) {\n    acc = initialValue;\n  } else {\n    while (i < arr.length && !(i in arr)) i++;          // skip holes\n    if (i >= arr.length) throw new TypeError('Reduce of empty array with no initial value');\n    acc = arr[i++];\n  }\n  for (; i < arr.length; i++) {\n    if (i in arr) acc = callback(acc, arr[i], i, arr);\n  }\n  return acc;\n};\n[1, 2, 3].myReduce((a, b) => a + b, 0); // 6\n```\nKey details: use `arguments.length` (so `initialValue` of `undefined` still counts), throw on empty array without initial value, callback gets `(acc, cur, index, array)`."
            },
            {
              "id": "cb3",
              "q": "Write polyfills for call() and apply().",
              "a": "Idea: temporarily attach the function to the target object as a method and call it. A method call sets `this` to that object. Then remove it.\n```js\nFunction.prototype.myCall = function (context, ...args) {\n  if (typeof this !== 'function') throw new TypeError('myCall must be called on a function');\n  // null/undefined -> global object; primitives -> wrapper objects (like non-strict call)\n  context = context == null ? globalThis : Object(context);\n  const key = Symbol('fn');   // unique key, can't clash with existing properties\n  context[key] = this;\n  try {\n    return context[key](...args);\n  } finally {\n    delete context[key];      // clean up even if the function throws\n  }\n};\n\nFunction.prototype.myApply = function (context, args) {\n  return this.myCall(context, ...(args ?? []));\n};\n\nfunction greet(greeting) { return `${greeting}, ${this.name}`; }\ngreet.myCall({ name: 'Sam' }, 'Hi');     // \"Hi, Sam\"\ngreet.myApply({ name: 'Sam' }, ['Hey']); // \"Hey, Sam\"\n```\nWhat interviewers look for: a **Symbol** key, cleanup in `finally`, handling `null`/`undefined` and primitive `context`, and returning the result. Limitation: it can't work on frozen or sealed objects, because it has to add a property."
            },
            {
              "id": "cb4",
              "q": "Write a polyfill for bind().",
              "a": "`bind` returns a new function that calls the original with a fixed `this`, the preset arguments, and any arguments passed later:\n```js\nFunction.prototype.myBind = function (context, ...preset) {\n  if (typeof this !== 'function') throw new TypeError('myBind must be called on a function');\n  const fn = this;\n  return function bound(...later) {\n    // With `new`, ignore the bound this, like native bind does.\n    if (new.target) return new fn(...preset, ...later);\n    return fn.apply(context, [...preset, ...later]);\n  };\n};\n\nconst user = { name: 'Sam' };\nfunction greet(greeting, punct) { return `${greeting}, ${this.name}${punct}`; }\nconst hi = greet.myBind(user, 'Hi');\nhi('!');                     // \"Hi, Sam!\"\nhi.call({ name: 'X' }, '?'); // \"Hi, Sam?\" – this stays bound\n```\nPoints to mention:\n- **Partial application**: preset arguments come first, later ones are appended.\n- The returned function is a **closure** over `fn`, `context` and `preset`.\n- **`new` support** is the usual follow-up: a bound function used as a constructor ignores the bound `this`.\n- If asked not to use `apply`, call the original through the `myCall` polyfill instead."
            }
          ]
        }
      ]
    }
  ]
});
