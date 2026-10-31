/**
 * Question bank.
 *
 * Each section has a title and a list of items:
 *   id    – stable unique id (used to save progress; never change it)
 *   n     – display number
 *   q     – question text
 *   a     – answer (light Markdown: paragraphs, - lists, 1. lists, `code`, **bold**, ``` fences)
 *   note  – optional hint shown under the question
 *   code  – optional code snippet shown with the question
 *   group – optional sub-heading inside a section
 */
window.QUESTIONS = [
  {
    "title": "React core concepts",
    "items": [
      {
        "id": "1",
        "n": 1,
        "q": "What is React.js, and why do we use it?",
        "a": "React is an open-source JavaScript library (by Meta) for building user interfaces out of **reusable components**.\n- **Declarative**: you describe *what* the UI should look like for a given state; React figures out the DOM updates.\n- **Component-based**: UI is split into small, reusable, testable pieces.\n- **Efficient updates** via the Virtual DOM and reconciliation.\n- **Unidirectional data flow** makes state changes predictable.\n- Huge ecosystem (Redux, React Router, Next.js, React Native) and strong community."
      },
      {
        "id": "2",
        "n": 2,
        "q": "What is Virtual DOM? How does React update the actual DOM?",
        "a": "The Virtual DOM is a lightweight JavaScript object tree that represents the real DOM.\n- When state/props change, React re-runs the component and creates a **new** virtual tree.\n- It **diffs** the new tree against the previous one (reconciliation).\n- It computes the minimal set of changes and applies them to the real DOM in a batch (the **commit** phase).\nReal DOM operations (layout, paint) are expensive; JS object comparisons are cheap, so this keeps updates fast and lets you write code as if you re-render everything."
      },
      {
        "id": "3",
        "n": 3,
        "q": "Explain React reconciliation.",
        "a": "Reconciliation is the algorithm React uses to decide what changed between two renders. It uses heuristics to run in O(n) instead of O(n³):\n- **Different element type** (e.g. `<div>` → `<span>`, or `CompA` → `CompB`): tear down the old subtree (unmount, lose state) and build a new one.\n- **Same type**: keep the DOM node / component instance, only update changed attributes/props, then recurse into children.\n- **Lists**: children are matched by `key`, so items can be reordered, inserted or removed efficiently.\nSince React 16, reconciliation is done by **Fiber**, which splits the work into units that can be paused, prioritized and resumed (enables concurrent features like `useTransition`). Rendering is split into the **render phase** (pure, interruptible) and the **commit phase** (DOM mutations, synchronous)."
      },
      {
        "id": "4",
        "n": 4,
        "q": "What is the purpose of the key prop when rendering lists?",
        "a": "`key` gives each list item a stable identity so React can match items between renders.\n- Without keys React matches by position, so inserting at the top makes every item \"change\".\n- With keys React knows which item was added, removed or moved, and keeps the right component state and DOM node for each item.\nKeys must be **unique among siblings** and **stable** (e.g. a database id). They are not passed to the component as a prop.\n```jsx\n{users.map(u => <UserRow key={u.id} user={u} />)}\n```"
      },
      {
        "id": "5",
        "n": 5,
        "q": "Why should we avoid using array indexes as keys?",
        "a": "If the list can be **reordered, filtered, or have items inserted/removed**, index keys break identity: the item at index 0 is now a different item but has the same key.\nConsequences:\n- Wrong component **state** sticks to the wrong row (e.g. a checked checkbox or typed input \"jumps\" to another item).\n- Unnecessary re-renders / DOM updates for every item after the change.\nIndex keys are acceptable only when the list is static (never reordered/filtered) and items have no state. Otherwise use a stable unique id (or generate one when data is created, not during render)."
      },
      {
        "id": "6",
        "n": 6,
        "q": "What is the difference between functional and class components?",
        "a": "- **Class components**: ES6 classes extending `React.Component`, state in `this.state`, updated with `this.setState`, lifecycle methods (`componentDidMount`, etc.), need `this` binding.\n- **Functional components**: plain functions that take props and return JSX; use **Hooks** (`useState`, `useEffect`…) for state and side effects.\nWhy functional is preferred today:\n- Less boilerplate, no `this` confusion.\n- Logic reuse via custom hooks (instead of HOCs / render props).\n- Easier to test and better fit for concurrent React features.\nClasses are still required only for **Error Boundaries** (no hook equivalent yet)."
      },
      {
        "id": "7",
        "n": 7,
        "q": "Explain the component lifecycle methods.",
        "a": "Class component lifecycle has three phases:\n- **Mounting**: `constructor` → `static getDerivedStateFromProps` → `render` → `componentDidMount` (API calls, subscriptions).\n- **Updating** (props/state change): `getDerivedStateFromProps` → `shouldComponentUpdate` (return false to skip) → `render` → `getSnapshotBeforeUpdate` (e.g. read scroll position) → `componentDidUpdate(prevProps, prevState, snapshot)`.\n- **Unmounting**: `componentWillUnmount` (clean up timers, listeners, subscriptions).\n- **Error handling**: `static getDerivedStateFromError`, `componentDidCatch`.\nLegacy methods like `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate` are deprecated (prefixed `UNSAFE_`)."
      },
      {
        "id": "8",
        "n": 8,
        "q": "How do lifecycle methods work in functional components?",
        "a": "Functional components use `useEffect` (and `useLayoutEffect`) to cover lifecycle behaviour:\n```jsx\nuseEffect(() => {\n  // componentDidMount\n  return () => { /* componentWillUnmount */ };\n}, []);\n\nuseEffect(() => {\n  // componentDidUpdate for `id` (also runs on mount)\n}, [id]);\n```\n- `shouldComponentUpdate` → `React.memo` (and `useMemo`).\n- `getSnapshotBeforeUpdate` / synchronous DOM reads → `useLayoutEffect`.\nMental model: think in terms of \"synchronise this effect with these values\", not lifecycle events."
      },
      {
        "id": "9",
        "n": 9,
        "q": "What is the difference between props and state?",
        "a": "- **Props**: inputs passed from parent to child. Read-only inside the child. Changing them is the parent's job.\n- **State**: data owned and managed inside the component; changing it (via `setState`/setter) triggers a re-render.\nBoth trigger re-renders when they change. Rule of thumb: if the data can be computed from props or other state, it should not be state at all (derive it during render)."
      },
      {
        "id": "10",
        "n": 10,
        "q": "What is the difference between controlled and uncontrolled components?",
        "a": "- **Controlled**: the form value lives in React state; the input shows `value` and updates through `onChange`. React is the single source of truth — easy validation, formatting, conditional disabling.\n- **Uncontrolled**: the DOM keeps the value; you read it with a `ref` when needed (`defaultValue` for initial value). Less code, fewer re-renders, good for simple forms or file inputs (`<input type=\"file\">` is always uncontrolled).\n```jsx\n// controlled\n<input value={name} onChange={e => setName(e.target.value)} />\n// uncontrolled\nconst ref = useRef();\n<input defaultValue=\"\" ref={ref} />  // read ref.current.value on submit\n```\nLibraries like React Hook Form use uncontrolled inputs for performance."
      },
      {
        "id": "11",
        "n": 11,
        "q": "What is prop drilling? How can you avoid it?",
        "a": "Prop drilling is passing props through several intermediate components that don't use them, just so a deeply nested child can get them. It makes code noisy and refactoring hard.\nWays to avoid it:\n- **Context API** for widely shared data (theme, user, locale).\n- **State management** library (Redux Toolkit, Zustand) for global/app state.\n- **Component composition**: pass components as `children` so the parent renders the deep child directly.\n- Move state closer to where it is used (colocation)."
      },
      {
        "id": "12",
        "n": 12,
        "q": "What is lifting state up?",
        "a": "Lifting state up means moving shared state to the **closest common parent** of the components that need it, then passing the value and an updater function down as props. This keeps a single source of truth so siblings stay in sync.\n```jsx\nfunction Parent() {\n  const [temp, setTemp] = useState('');\n  return <>\n    <CelsiusInput value={temp} onChange={setTemp} />\n    <FahrenheitView celsius={temp} />\n  </>;\n}\n```"
      },
      {
        "id": "13",
        "n": 13,
        "q": "How can a child component update the state of its parent?",
        "a": "The parent passes a **callback function** as a prop; the child calls it with new data.\n```jsx\nfunction Parent() {\n  const [msg, setMsg] = useState('');\n  return <Child onSend={setMsg} />;\n}\nfunction Child({ onSend }) {\n  return <button onClick={() => onSend('Hi from child')}>Send</button>;\n}\n```\nOther options: shared Context with a setter, or a global store (Redux). Data still flows down; events flow up."
      },
      {
        "id": "14",
        "n": 14,
        "q": "What is Context API? When would you prefer it over Redux?",
        "a": "Context provides a way to share values with a whole subtree without passing props at every level.\n```jsx\nconst ThemeContext = createContext('light');\n<ThemeContext.Provider value={theme}><App /></ThemeContext.Provider>\nconst theme = useContext(ThemeContext);\n```\n**Prefer Context** for low-frequency, app-wide values: theme, auth user, locale, feature flags, or small apps.\n**Prefer Redux** when state is large, updated frequently, shared by many components, needs middleware (async flows, logging), DevTools/time travel, or strict patterns for a big team.\nKey limitation: every consumer re-renders when the context value changes (no built-in selectors), so Context is not ideal for high-frequency updates."
      },
      {
        "id": "15",
        "n": 15,
        "q": "What is the difference between conditional rendering and directly manipulating the DOM?",
        "a": "- **Conditional rendering**: you decide in JSX what to render based on state (`{isOpen && <Modal/>}`, ternaries, early returns). React stays in control and keeps the virtual DOM and real DOM in sync.\n- **Direct DOM manipulation** (`document.getElementById(...).style.display = 'none'`): bypasses React. React doesn't know about the change, so the next render can overwrite it or get out of sync; it's imperative, harder to test and can cause bugs.\nUse refs for direct DOM access only for things React doesn't handle: focus, measuring size, scrolling, integrating third-party libraries."
      },
      {
        "id": "16",
        "n": 16,
        "q": "What are Higher Order Components (HOCs)?",
        "a": "A HOC is a function that takes a component and returns a new, enhanced component. It's a pattern for reusing logic.\n```jsx\nfunction withAuth(Component) {\n  return function Wrapped(props) {\n    const user = useUser();\n    if (!user) return <Navigate to=\"/login\" />;\n    return <Component {...props} user={user} />;\n  };\n}\nexport default withAuth(Dashboard);\n```\nExamples: `connect()` from React-Redux, `withRouter`. Downsides: \"wrapper hell\", prop name collisions, harder to type. Custom hooks have mostly replaced HOCs for logic reuse."
      },
      {
        "id": "17",
        "n": 17,
        "q": "What are React Fragments, and why do we use them?",
        "a": "Fragments let a component return multiple elements without adding an extra DOM node.\n```jsx\nreturn (\n  <>\n    <td>Name</td>\n    <td>Age</td>\n  </>\n);\n```\nWhy: keeps DOM clean, avoids breaking layouts (CSS grid/flex, tables where an extra `<div>` would be invalid). Use `<React.Fragment key={id}>` when you need a key in a list (the short syntax `<>` cannot take a key)."
      },
      {
        "id": "18",
        "n": 18,
        "q": "What is React.cloneElement()? Where would you use it?",
        "a": "`React.cloneElement(element, newProps, ...children)` creates a copy of a React element with extra/overridden props.\nUsed when a parent needs to inject props into the `children` it receives:\n```jsx\nfunction Tabs({ children, active, onSelect }) {\n  return React.Children.map(children, (child, i) =>\n    React.cloneElement(child, { isActive: i === active, onClick: () => onSelect(i) })\n  );\n}\n```\nUse cases: compound components (Tabs, RadioGroup), adding event handlers or classNames to children. Today it's considered legacy-ish; Context or render props are usually clearer."
      },
      {
        "id": "19",
        "n": 19,
        "q": "What are Error Boundaries? Can we implement them using functional components?",
        "a": "Error Boundaries are components that catch JavaScript errors during **rendering, lifecycle methods and constructors** of their child tree, log them, and show a fallback UI instead of crashing the whole app.\nThey must be **class components** (no hook equivalent):\n```jsx\nclass ErrorBoundary extends React.Component {\n  state = { hasError: false };\n  static getDerivedStateFromError() { return { hasError: true }; }\n  componentDidCatch(error, info) { logToService(error, info); }\n  render() { return this.state.hasError ? <h2>Something went wrong</h2> : this.props.children; }\n}\n```\nThey do **not** catch errors in event handlers, async code (setTimeout, promises), SSR, or in the boundary itself. With functional components you can use the `react-error-boundary` library, but it still uses a class internally."
      },
      {
        "id": "20",
        "n": 20,
        "q": "What are portals in React?",
        "a": "Portals render children into a DOM node **outside** the parent component's DOM hierarchy, while keeping them in the same React tree.\n```jsx\nreturn createPortal(<div className=\"modal\">...</div>, document.getElementById('modal-root'));\n```\nUse cases: modals, tooltips, dropdowns, toasts — to escape `overflow: hidden` or `z-index` stacking issues.\nContext still works, and events **bubble through the React tree** (to React parents), not the DOM tree."
      }
    ]
  },
  {
    "title": "React hooks",
    "items": [
      {
        "id": "21",
        "n": 21,
        "q": "What are React Hooks? Why were they introduced?",
        "a": "Hooks are functions (`useState`, `useEffect`, …) that let functional components use state, lifecycle-like effects, context, refs, etc. Introduced in React 16.8.\nWhy:\n- Reuse stateful logic without HOCs/render props (custom hooks).\n- Class components scattered related logic across lifecycle methods (setup in `componentDidMount`, cleanup in `componentWillUnmount`); hooks keep related code together.\n- Avoid `this` and binding confusion; less boilerplate; easier to optimize and test."
      },
      {
        "id": "22",
        "n": 22,
        "q": "What are the rules of Hooks?",
        "a": "1. **Only call hooks at the top level** — not inside loops, conditions, nested functions or after an early return.\n2. **Only call hooks from React functions** — functional components or custom hooks (not regular JS functions or classes).\nReason: React stores hook state in a list per component and identifies each hook by its **call order**. If the order changes between renders, state gets mixed up. Custom hooks must start with `use`. Enforced by `eslint-plugin-react-hooks`."
      },
      {
        "id": "23",
        "n": 23,
        "q": "Explain useState() with an example.",
        "a": "`useState` adds local state to a functional component. It returns the current value and a setter; calling the setter schedules a re-render.\n```jsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>Clicked {count} times</button>\n  );\n}\n```\n- Use the **functional update** `setCount(c => c + 1)` when the new value depends on the old.\n- **Lazy initial state**: `useState(() => expensiveCalc())` runs only on first render.\n- For objects/arrays, always create a new copy: `setUser(u => ({ ...u, name }))`."
      },
      {
        "id": "24",
        "n": 24,
        "q": "What is the difference between useState() and useRef()?",
        "a": "- **Re-render**: updating state triggers a re-render; changing `ref.current` does not.\n- **Update timing**: state updates are asynchronous/batched (new value visible on next render); ref changes are immediate and synchronous.\n- **Use for**: state = anything shown in the UI. Ref = DOM element access (focus, scroll, measure), and mutable values that must persist between renders without re-rendering (timer ids, previous value, \"is mounted\" flag, latest callback).\n```jsx\nconst inputRef = useRef(null);\n<input ref={inputRef} />;  inputRef.current.focus();\n```"
      },
      {
        "id": "25",
        "n": 25,
        "q": "What happens when you update a state variable using useState?",
        "a": "- The setter **schedules** an update; the variable does not change immediately in the current function (it's a constant for that render — logging it right after shows the old value).\n- React **batches** multiple updates (in React 18, automatically everywhere: events, timeouts, promises).\n- React re-renders the component with the new state, reconciles, and commits DOM changes.\n- If the new value is the same as the current one (`Object.is`), React bails out and skips re-rendering children.\n- Objects/arrays must be replaced, not mutated, or React won't detect the change."
      },
      {
        "id": "26",
        "n": 26,
        "q": "Does updating a useRef value trigger a re-render?",
        "a": "No. `useRef` returns the same mutable object `{ current }` on every render; changing `current` is just a plain mutation React doesn't track, so no re-render happens. The new value will show up in the UI only when something else causes a re-render. That's why refs are good for timer ids, previous values and DOM nodes, but not for data displayed on screen."
      },
      {
        "id": "27",
        "n": 27,
        "q": "Explain useEffect() and its execution lifecycle.",
        "a": "`useEffect` runs side effects (API calls, subscriptions, timers, manual DOM work, logging) **after** React has rendered and painted the screen.\nLifecycle:\n1. Component renders, DOM is updated, browser paints.\n2. Effect runs.\n3. On the next render, if dependencies changed: the previous effect's **cleanup** runs, then the new effect.\n4. On unmount: the cleanup runs.\n```jsx\nuseEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);   // cleanup\n}, []);\n```\nIn development with StrictMode (React 18), effects run mount → cleanup → mount once to help you find missing cleanups."
      },
      {
        "id": "28",
        "n": 28,
        "q": "What is the purpose of the dependency array in useEffect()?",
        "a": "The dependency array tells React **when to re-run** the effect: it compares each value with `Object.is` against the previous render.\n- No array → runs after every render.\n- `[]` → runs once after mount (cleanup on unmount).\n- `[a, b]` → runs on mount and whenever `a` or `b` change.\nInclude every reactive value (props, state, functions defined in the component) used inside the effect; otherwise you get stale values. Objects/functions created during render are new each time, so they trigger the effect every render — memoize them with `useMemo`/`useCallback` or move them inside the effect."
      },
      {
        "id": "29",
        "n": 29,
        "q": "What happens in the following three scenarios?",
        "code": "useEffect(() => {\n  console.log(\"Executed\");\n});\n\nuseEffect(() => {\n  console.log(\"Executed\");\n}, []);\n\nuseEffect(() => {\n  console.log(\"Executed\");\n}, [count]);",
        "a": "- **No dependency array** → logs \"Executed\" after **every** render (mount and every update).\n- **Empty array `[]`** → logs **once**, after the first render (mount). In dev StrictMode you may see it twice because React mounts, unmounts and re-mounts.\n- **`[count]`** → logs after the first render and then **every time `count` changes**."
      },
      {
        "id": "30",
        "n": 30,
        "q": "What is the cleanup function in useEffect()? When does it execute?",
        "a": "The cleanup is the function you return from `useEffect`. It undoes what the effect did (clear timers, remove listeners, unsubscribe, abort fetches).\nIt runs:\n- **Before the effect runs again** (when dependencies change) — with the *old* values.\n- **When the component unmounts.**\n```jsx\nuseEffect(() => {\n  const onResize = () => setWidth(window.innerWidth);\n  window.addEventListener('resize', onResize);\n  return () => window.removeEventListener('resize', onResize);\n}, []);\n```"
      },
      {
        "id": "31",
        "n": 31,
        "q": "How do you prevent memory leaks using useEffect()?",
        "a": "Always clean up what an effect starts:\n- Clear `setInterval` / `setTimeout`.\n- Remove event listeners, close WebSockets, unsubscribe from observables/stores.\n- Abort in-flight requests with `AbortController` so you don't set state on an unmounted component:\n```jsx\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch(`/api/users/${id}`, { signal: controller.signal })\n    .then(r => r.json()).then(setUser)\n    .catch(e => { if (e.name !== 'AbortError') setError(e); });\n  return () => controller.abort();\n}, [id]);\n```\n- Avoid holding large objects in closures/refs longer than needed."
      },
      {
        "id": "32",
        "n": 32,
        "q": "What is the difference between useEffect() and useLayoutEffect()?",
        "a": "- `useEffect` runs **asynchronously after the browser paints**. It doesn't block the screen — use it for most side effects (data fetching, subscriptions).\n- `useLayoutEffect` runs **synchronously after DOM mutations but before paint**. It blocks painting — use it when you must read layout (element size/position) and update synchronously to avoid flicker, e.g. positioning a tooltip, measuring, scroll restoration.\nPrefer `useEffect`; use `useLayoutEffect` only when you see visual flicker. `useLayoutEffect` doesn't run on the server (SSR warning)."
      },
      {
        "id": "33",
        "n": 33,
        "q": "What is useMemo()? When should you use it?",
        "a": "`useMemo` caches the **result** of a calculation between renders and recomputes only when dependencies change.\n```jsx\nconst filtered = useMemo(\n  () => products.filter(p => p.name.includes(search)),\n  [products, search]\n);\n```\nUse it when:\n- A calculation is genuinely expensive (big lists, sorting, heavy math).\n- You need a **stable reference** for an object/array passed to a `React.memo` child or used as an effect dependency.\nDon't wrap every value — memoization has its own cost and makes code harder to read."
      },
      {
        "id": "34",
        "n": 34,
        "q": "What is useCallback()? When should you use it?",
        "a": "`useCallback` caches a **function** definition between renders so it keeps the same reference until dependencies change. `useCallback(fn, deps)` ≈ `useMemo(() => fn, deps)`.\n```jsx\nconst handleDelete = useCallback(id => {\n  setItems(items => items.filter(i => i.id !== id));\n}, []);\n<Row onDelete={handleDelete} />   // Row is React.memo\n```\nUse it when passing callbacks to **memoized children**, or when the function is a dependency of `useEffect`/another hook. Without a memoized child it gives no benefit."
      },
      {
        "id": "35",
        "n": 35,
        "q": "What is the difference between React.memo(), useMemo(), and useCallback()?",
        "a": "- **`React.memo(Component)`**: a HOC that memoizes a **component** — skips re-rendering if props are shallowly equal to last time.\n- **`useMemo(() => value, deps)`**: memoizes a **computed value** inside a component.\n- **`useCallback(fn, deps)`**: memoizes a **function reference** inside a component.\nThey work together: `React.memo` on a child is useless if the parent passes a new object/function every render, so the parent uses `useMemo`/`useCallback` to keep those props stable."
      },
      {
        "id": "36",
        "n": 36,
        "q": "What is useReducer()? How is it different from useState()?",
        "a": "`useReducer` manages state with a reducer function `(state, action) => newState`, similar to Redux but local.\n```jsx\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'increment': return { count: state.count + 1 };\n    case 'reset': return { count: 0 };\n    default: return state;\n  }\n}\nconst [state, dispatch] = useReducer(reducer, { count: 0 });\ndispatch({ type: 'increment' });\n```\nPrefer it over `useState` when state is complex (many related fields), the next state depends on the previous in several ways, or you want update logic in one testable place. `dispatch` is stable, so it's easy to pass down (often combined with Context)."
      },
      {
        "id": "37",
        "n": 37,
        "q": "What are custom hooks? Have you created any in your project?",
        "a": "A custom hook is a function whose name starts with `use` and which calls other hooks. It extracts reusable stateful logic; each component calling it gets its own independent state.\n```jsx\nfunction useDebounce(value, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const t = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(t);\n  }, [value, delay]);\n  return debounced;\n}\n```\nTypical examples to mention from projects: `useFetch`/`useApi`, `useDebounce`, `useLocalStorage`, `useAuth`, `usePagination`, `useWindowSize`, `useOnClickOutside`, `usePermissions`."
      },
      {
        "id": "38",
        "n": 38,
        "q": "Can we call a hook conditionally? Why not?",
        "a": "No. React identifies hooks by their **call order** on each render. If a hook is skipped in one render (inside `if`, loop, or after an early return), all following hooks shift position and get the wrong state, causing bugs or the error \"Rendered fewer hooks than expected\".\nInstead, call the hook unconditionally and put the condition **inside** it:\n```jsx\nuseEffect(() => {\n  if (!userId) return;\n  fetchUser(userId);\n}, [userId]);\n```\n(Exception: the new `use()` API in React 19 can be called conditionally.)"
      },
      {
        "id": "39",
        "n": 39,
        "q": "What is a stale closure in React?",
        "a": "A stale closure happens when a function (effect, callback, timer) captured variables from an **old render**, so it keeps seeing outdated state/props.\n```jsx\nuseEffect(() => {\n  const id = setInterval(() => setCount(count + 1), 1000); // always sees count = 0\n  return () => clearInterval(id);\n}, []);\n```\nFixes:\n- Functional updates: `setCount(c => c + 1)`.\n- Add the values to the dependency array.\n- Store the latest value in a `useRef` and read `ref.current`."
      },
      {
        "id": "40",
        "n": 40,
        "q": "How do you share logic between multiple components using custom hooks?",
        "a": "Move the shared logic (state + effects) into a custom hook and call it from every component that needs it. Each call gets its own isolated state — hooks share **logic**, not **state** (to share state, use Context or a store).\n```jsx\nfunction useFetch(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  useEffect(() => {\n    const c = new AbortController();\n    setLoading(true);\n    fetch(url, { signal: c.signal })\n      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })\n      .then(setData)\n      .catch(e => e.name !== 'AbortError' && setError(e))\n      .finally(() => setLoading(false));\n    return () => c.abort();\n  }, [url]);\n  return { data, loading, error };\n}\n// const { data, loading } = useFetch('/api/users');\n```"
      },
      {
        "id": "b1",
        "n": "★",
        "q": "Batching puzzle: calling setCount(count + 1) four times in one click — what is the final value, why doesn't it increase by 4, and how do you fix it?",
        "code": "const [count, setCount] = useState(0);\n\nconst handleClick = () => {\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n  setCount(count + 1);\n};\n\n// Fix:\nconst handleClick = () => {\n  setCount(prev => prev + 1);\n  setCount(prev => prev + 1);\n  setCount(prev => prev + 1);\n  setCount(prev => prev + 1);\n};",
        "a": "- **Final value: 1** (not 4).\n- **Why**: `count` is a constant in that render's closure (value 0). All four calls are `setCount(0 + 1)`, and React batches them, so the last one wins → 1.\n- **Fix**: use the functional updater. React queues the functions and runs each with the latest pending state: 0→1→2→3→4, so the result is 4.\nThis shows that state updates are batched and that the state variable is a snapshot for that render."
      }
    ]
  },
  {
    "title": "Redux & state management",
    "items": [
      {
        "id": "41",
        "n": 41,
        "q": "What is Redux, and why do we need it?",
        "a": "Redux is a predictable state container: the whole app's global state lives in a single **store**, and it can only change by dispatching **actions** handled by pure **reducers**.\nWhy we need it:\n- Many components across the tree share and update the same data (user, cart, permissions).\n- Avoids prop drilling and scattered state.\n- Predictable, traceable updates (Redux DevTools, time-travel debugging, logging).\n- Middleware for async logic and side effects; clear patterns for large teams.\nNot every app needs it — server state is often better handled by RTK Query / React Query, and local UI state by `useState`."
      },
      {
        "id": "42",
        "n": 42,
        "q": "Explain the complete Redux data flow.",
        "a": "1. The user does something in the UI (clicks \"Add to cart\").\n2. The component **dispatches an action**: `dispatch({ type: 'cart/add', payload: item })`.\n3. The action passes through any **middleware** (thunk, saga, logger) — async work happens here.\n4. The store calls the **reducer** with `(currentState, action)`; the reducer returns a **new state** (immutably).\n5. The store saves the new state and notifies subscribers.\n6. Components subscribed via `useSelector` re-render only if the selected slice changed.\nData flows in one direction: **View → Action → (Middleware) → Reducer → Store → View**."
      },
      {
        "id": "43",
        "n": 43,
        "q": "What are Store, Actions, Reducers, and Dispatch?",
        "a": "- **Store**: the single object holding the app state. Created with `configureStore`; exposes `getState()`, `dispatch()`, `subscribe()`.\n- **Action**: a plain object describing what happened: `{ type: 'todos/added', payload: {...} }`. Action creators are functions that return actions.\n- **Reducer**: a pure function `(state, action) => newState`. No side effects, no mutation (RTK uses Immer so \"mutating\" code is safe), no API calls.\n- **Dispatch**: the method used to send an action to the store: `store.dispatch(action)` / `useDispatch()` in components. It's the only way to trigger a state change."
      },
      {
        "id": "44",
        "n": 44,
        "q": "What is Redux middleware?",
        "a": "Middleware sits between dispatching an action and the moment it reaches the reducer. It can inspect, modify, delay, log, cancel actions, or dispatch other actions — the standard place for side effects.\nSignature: `store => next => action => { ...; return next(action); }`\n```js\nconst logger = store => next => action => {\n  console.log('dispatching', action);\n  const result = next(action);\n  console.log('next state', store.getState());\n  return result;\n};\n```\nCommon middleware: **redux-thunk** (async logic; included by default in RTK), **redux-saga**, redux-logger, RTK Query middleware, custom middleware for analytics or auth-token refresh."
      },
      {
        "id": "45",
        "n": 45,
        "q": "What is the difference between Redux Thunk and Redux Saga?",
        "a": "- **Redux Thunk**: lets you dispatch a **function** instead of an object. The function receives `dispatch` and `getState` and can do async work with promises/async-await. Simple, small learning curve, good for most API calls.\n- **Redux Saga**: uses **generator functions** that listen for actions and run side effects declaratively (`call`, `put`, `takeLatest`, `fork`, `race`). Better for complex flows: cancellation, debouncing, retries, polling, parallel tasks, websockets; very testable. Larger learning curve and more boilerplate.\n```js\n// thunk\nexport const fetchUsers = () => async dispatch => {\n  dispatch({ type: 'users/loading' });\n  const data = await api.getUsers();\n  dispatch({ type: 'users/loaded', payload: data });\n};\n```\nToday Redux recommends Thunk (`createAsyncThunk`) or RTK Query by default."
      },
      {
        "id": "46",
        "n": 46,
        "q": "What are generator functions? How are they used in Redux Saga?",
        "a": "A generator is a function declared with `function*` that can **pause** with `yield` and resume later. Calling it returns an iterator; each `next()` runs until the next `yield`.\n```js\nfunction* gen() { yield 1; yield 2; }\nconst it = gen(); it.next(); // {value: 1, done: false}\n```\nIn Redux Saga, sagas are generators. You `yield` **effect descriptions** (plain objects) and the saga middleware executes them, then resumes the generator with the result:\n```js\nfunction* fetchUserSaga(action) {\n  try {\n    const user = yield call(api.getUser, action.payload);\n    yield put({ type: 'user/success', payload: user });\n  } catch (e) {\n    yield put({ type: 'user/failure', error: e.message });\n  }\n}\nfunction* rootSaga() { yield takeLatest('user/request', fetchUserSaga); }\n```\nBecause effects are just objects, sagas are easy to test step by step, and `takeLatest` automatically cancels the previous call."
      },
      {
        "id": "47",
        "n": 47,
        "q": "What is Redux Toolkit? Why is it preferred over traditional Redux?",
        "a": "Redux Toolkit (RTK) is the official, recommended way to write Redux. It removes most boilerplate:\n- `configureStore`: store setup with good defaults (thunk, DevTools, dev-time checks for mutation/serializability).\n- `createSlice`: reducers + action creators + action types in one place.\n- **Immer** built in: write \"mutating\" code that produces immutable updates.\n- `createAsyncThunk` for async logic with pending/fulfilled/rejected actions.\n- `createEntityAdapter` for normalized data; `createSelector` for memoized selectors.\n- **RTK Query** for data fetching and caching.\nLess code, fewer bugs (no accidental mutation), consistent structure."
      },
      {
        "id": "48",
        "n": 48,
        "q": "What is createSlice()?",
        "a": "`createSlice` takes a name, initial state and reducer functions, and generates action creators and action types automatically.\n```js\nconst counterSlice = createSlice({\n  name: 'counter',\n  initialState: { value: 0 },\n  reducers: {\n    increment: state => { state.value += 1; },          // Immer makes this immutable\n    addBy: (state, action) => { state.value += action.payload; },\n  },\n  extraReducers: builder => {\n    builder.addCase(fetchCount.fulfilled, (state, action) => { state.value = action.payload; });\n  },\n});\nexport const { increment, addBy } = counterSlice.actions;\nexport default counterSlice.reducer;\n```\n`extraReducers` handles actions defined elsewhere (e.g. async thunks or other slices)."
      },
      {
        "id": "49",
        "n": 49,
        "q": "What are useSelector() and useDispatch()?",
        "a": "Hooks from `react-redux` for using the store in functional components (replacing `connect`):\n- **`useSelector(selector)`**: reads data from the store. The component re-renders only when the selected value changes (strict `===` comparison by default).\n- **`useDispatch()`**: returns the store's `dispatch` function to send actions.\n```jsx\nconst count = useSelector(state => state.counter.value);\nconst dispatch = useDispatch();\n<button onClick={() => dispatch(increment())}>{count}</button>\n```\nTip: don't return a new object from a selector (`state => ({a, b})`) — it re-renders every time; select primitives separately, use `shallowEqual`, or memoized selectors."
      },
      {
        "id": "50",
        "n": 50,
        "q": "How do you handle asynchronous API calls using Redux Toolkit?",
        "a": "Use `createAsyncThunk` + `extraReducers` (or RTK Query):\n```js\nexport const fetchUsers = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {\n  try {\n    const res = await axios.get('/api/users');\n    return res.data;\n  } catch (err) {\n    return rejectWithValue(err.response?.data);\n  }\n});\n\nconst usersSlice = createSlice({\n  name: 'users',\n  initialState: { list: [], status: 'idle', error: null },\n  reducers: {},\n  extraReducers: builder => {\n    builder\n      .addCase(fetchUsers.pending,   s => { s.status = 'loading'; })\n      .addCase(fetchUsers.fulfilled, (s, a) => { s.status = 'succeeded'; s.list = a.payload; })\n      .addCase(fetchUsers.rejected,  (s, a) => { s.status = 'failed'; s.error = a.payload; });\n  },\n});\n// in component: useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);\n```"
      },
      {
        "id": "51",
        "n": 51,
        "q": "What is the difference between Context API and Redux?",
        "a": "- **Purpose**: Context is a dependency-injection mechanism (pass values down the tree). Redux is a full state-management library.\n- **Re-renders**: all Context consumers re-render when the value changes; Redux `useSelector` re-renders only components whose selected slice changed.\n- **Tooling**: Redux has DevTools, time travel, middleware, logging; Context has none.\n- **Async/side effects**: Redux has thunks/sagas/RTK Query; Context needs your own pattern.\n- **Setup**: Context is built in and simple; Redux adds a dependency and structure.\nUse Context for rarely changing global values (theme, auth, locale); Redux for large, frequently updated, shared business state."
      },
      {
        "id": "52",
        "n": 52,
        "q": "How would you manage global state in a large-scale application?",
        "a": "- Separate state types: **server state** (API data) → RTK Query / React Query; **global client state** (auth, preferences, cart) → Redux Toolkit; **local UI state** → `useState`; **URL state** → router query params; **form state** → React Hook Form.\n- Organize Redux by **feature slices** (`features/cart/cartSlice.js`), not by file type.\n- **Normalize** data (by id, `createEntityAdapter`) to avoid duplication.\n- Use **memoized selectors** and keep components subscribed to the smallest slice.\n- Keep state minimal; derive values with selectors instead of storing them.\n- Lazy-load reducers for large / micro-frontend apps; use TypeScript for typed state and actions."
      },
      {
        "id": "53",
        "n": 53,
        "q": "How do you prevent unnecessary component re-renders when using Redux?",
        "a": "- Select the **smallest** piece of state needed: `useSelector(s => s.user.name)` instead of the whole `s.user`.\n- Avoid selectors that return new objects/arrays each time; use `createSelector` (Reselect) for derived data, or `shallowEqual` as the equality function.\n- Normalize state so updating one item doesn't change references of unrelated data.\n- Wrap list items in `React.memo` and pass ids, letting each item select its own data.\n- Keep frequently changing data (e.g. form typing) out of Redux.\n- Use React DevTools Profiler to verify."
      },
      {
        "id": "54",
        "n": 54,
        "q": "What is the purpose of selectors in Redux?",
        "a": "Selectors are functions that read or derive data from the state: `const selectCartTotal = state => ...`.\n- **Encapsulation**: components don't depend on the state shape; if it changes, only selectors change.\n- **Reuse**: the same logic used across components.\n- **Derived data**: compute totals, filtered lists instead of storing them.\n- **Performance**: memoized selectors (`createSelector`) only recompute when inputs change and return the same reference, preventing re-renders.\n```js\nconst selectVisibleTodos = createSelector(\n  [state => state.todos, state => state.filter],\n  (todos, filter) => todos.filter(t => filter === 'all' || t.status === filter)\n);\n```"
      },
      {
        "id": "55",
        "n": 55,
        "q": "Have you used RTK Query? How does createApi() work?",
        "a": "RTK Query is the data fetching and caching tool built into Redux Toolkit. It removes hand-written thunks/loading flags for API data.\n`createApi` defines a base query and endpoints; it auto-generates hooks:\n```js\nexport const api = createApi({\n  reducerPath: 'api',\n  baseQuery: fetchBaseQuery({ baseUrl: '/api', prepareHeaders: h => { h.set('Authorization', `Bearer ${token}`); return h; } }),\n  tagTypes: ['Post'],\n  endpoints: build => ({\n    getPosts: build.query({ query: () => 'posts', providesTags: ['Post'] }),\n    addPost: build.mutation({ query: body => ({ url: 'posts', method: 'POST', body }), invalidatesTags: ['Post'] }),\n  }),\n});\nexport const { useGetPostsQuery, useAddPostMutation } = api;\n// const { data, isLoading, error } = useGetPostsQuery();\n```\nFeatures: caching and request de-duplication, loading/error states, cache invalidation via tags (refetch after mutation), polling, refetch on focus, optimistic updates. Add `api.reducer` and `api.middleware` to the store."
      }
    ]
  },
  {
    "title": "JavaScript fundamentals",
    "items": [
      {
        "id": "56",
        "n": 56,
        "q": "What are closures? Give a real-world example.",
        "a": "A closure is a function bundled with references to the variables of the scope where it was created, so it can still access them after the outer function has returned.\n```js\nfunction createCounter() {\n  let count = 0;                 // private\n  return {\n    increment: () => ++count,\n    get: () => count,\n  };\n}\nconst c = createCounter(); c.increment(); c.get(); // 1\n```\nReal-world uses: **data privacy** (module pattern), **debounce/throttle** (keep the timer id), **memoization caches**, function factories/currying, event handlers remembering values, and React hooks themselves (every handler closes over that render's state)."
      },
      {
        "id": "57",
        "n": 57,
        "q": "How are closures related to garbage collection?",
        "a": "Garbage collection (mark-and-sweep) frees memory that's no longer **reachable**. A closure keeps its outer variables reachable as long as the closure itself is reachable, so they won't be collected.\n- Usually fine and intended (that's how closures work).\n- **Memory leaks** happen when closures stay referenced unintentionally: event listeners never removed, intervals never cleared, closures stored in global caches, or a closure holding a large object it doesn't need.\n- Fix: remove listeners/clear timers (React effect cleanup), set references to `null`, avoid capturing large objects, use `WeakMap`/`WeakRef` for caches.\nModern engines only keep variables that a closure actually uses (but closures from the same scope share one context object)."
      },
      {
        "id": "58",
        "n": 58,
        "q": "Explain the JavaScript event loop.",
        "a": "JavaScript is single-threaded with one **call stack**. The event loop lets it handle async work without blocking:\n1. Synchronous code runs on the call stack.\n2. Async APIs (timers, fetch, DOM events) are handled by the browser/Node (Web APIs); when done, their callbacks are queued.\n3. When the call stack is empty, the event loop first runs **all microtasks** (Promise `.then`, `queueMicrotask`, `MutationObserver`, `await` continuations).\n4. Then the browser may render, and the loop takes **one macrotask** (setTimeout, setInterval, I/O, UI events) and repeats.\n```js\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n// 1 4 3 2\n```"
      },
      {
        "id": "59",
        "n": 59,
        "q": "What is the difference between synchronous and asynchronous JavaScript?",
        "a": "- **Synchronous**: code runs line by line; each statement waits for the previous one to finish. A long task blocks the thread (UI freezes).\n- **Asynchronous**: long operations (network, timers, file I/O) are started and the code continues; the result is handled later via callbacks, promises or async/await when the event loop picks it up.\n```js\nconsole.log('A');\nfetch('/api').then(() => console.log('C'));\nconsole.log('B');  // A, B, C\n```\nJS itself is still single-threaded; asynchrony comes from the environment (browser/Node) plus the event loop."
      },
      {
        "id": "60",
        "n": 60,
        "q": "What is the difference between microtasks and macrotasks?",
        "a": "- **Microtasks**: Promise callbacks (`then/catch/finally`), `await` continuation, `queueMicrotask`, `MutationObserver`, `process.nextTick` (Node, even higher priority). The **entire** microtask queue is drained after each task, before rendering.\n- **Macrotasks (tasks)**: `setTimeout`, `setInterval`, `setImmediate` (Node), I/O, UI events, `MessageChannel`. **One** macrotask per loop iteration.\nSo microtasks always run before the next macrotask:\n```js\nsetTimeout(() => console.log('timeout'), 0);\nPromise.resolve().then(() => console.log('promise'));\n// promise, timeout\n```\nInfinite microtasks can starve rendering and macrotasks."
      },
      {
        "id": "61",
        "n": 61,
        "q": "What is the difference between var, let, and const?",
        "a": "- **var**: function-scoped, hoisted and initialized to `undefined`, can be re-declared and re-assigned, creates a property on `window` at global level.\n- **let**: block-scoped, hoisted but in the **Temporal Dead Zone** until declared (ReferenceError if accessed earlier), can be re-assigned, not re-declared in the same scope.\n- **const**: like `let` but must be initialized and cannot be re-assigned. Objects/arrays declared with `const` can still be mutated.\n```js\nfor (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3\nfor (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2\n```\nDefault to `const`, use `let` when reassignment is needed, avoid `var`."
      },
      {
        "id": "62",
        "n": 62,
        "q": "Explain hoisting in JavaScript.",
        "a": "Hoisting: during the creation phase, JS registers declarations in memory before executing code, so they behave as if moved to the top of their scope.\n- **Function declarations**: fully hoisted — can be called before they're defined.\n- **var**: hoisted and initialized to `undefined`.\n- **let/const/class**: hoisted but not initialized (Temporal Dead Zone) → ReferenceError before the declaration.\n- **Function expressions/arrow functions** assigned to variables follow the variable's rules.\n```js\nconsole.log(a); // undefined\nvar a = 5;\ngreet();        // works\nfunction greet() {}\nconsole.log(b); // ReferenceError\nlet b = 1;\nsayHi();        // TypeError: sayHi is not a function\nvar sayHi = () => {};\n```"
      },
      {
        "id": "63",
        "n": 63,
        "q": "What is the difference between normal functions and arrow functions?",
        "a": "- **`this`**: normal functions get `this` from how they are called; arrow functions have no own `this` — they use the `this` of the surrounding scope (lexical).\n- **`arguments`**: normal functions have it; arrows don't (use rest `...args`).\n- **Constructor**: normal functions can be called with `new`; arrows can't (no `prototype`).\n- **Hoisting**: function declarations are hoisted; arrows (as expressions) are not.\n- **Syntax**: arrows are shorter and support implicit return.\n- `call/apply/bind` cannot change an arrow function's `this`.\nUse arrows for callbacks and when you want to keep the outer `this`; normal functions for object methods and constructors."
      },
      {
        "id": "64",
        "n": 64,
        "q": "How does the this keyword behave in arrow and normal functions?",
        "a": "Normal functions — `this` depends on the call site:\n- Method call `obj.fn()` → `obj`.\n- Plain call `fn()` → `undefined` in strict mode, `window`/global in sloppy mode.\n- `new Fn()` → the new object.\n- `fn.call/apply/bind(x)` → `x`.\n- DOM event handler → the element.\nArrow functions — `this` is taken lexically from the enclosing scope at definition time and never changes.\n```js\nconst obj = {\n  name: 'A',\n  normal() { return this.name; },        // 'A'\n  arrow: () => this?.name,                // undefined (outer scope)\n  delayed() { setTimeout(() => console.log(this.name)); } // 'A' (arrow keeps method's this)\n};\n```"
      },
      {
        "id": "65",
        "n": 65,
        "q": "What is the difference between call(), apply(), and bind()?",
        "a": "All three set `this` for a function:\n- **`call(thisArg, a, b)`**: invokes immediately, args one by one.\n- **`apply(thisArg, [a, b])`**: invokes immediately, args as an array.\n- **`bind(thisArg, a)`**: does **not** invoke; returns a new function with `this` (and optionally some args) permanently bound.\n```js\nfunction greet(greeting, punct) { return `${greeting}, ${this.name}${punct}`; }\nconst user = { name: 'Sam' };\ngreet.call(user, 'Hi', '!');      // \"Hi, Sam!\"\ngreet.apply(user, ['Hello', '.']); // \"Hello, Sam.\"\nconst g = greet.bind(user, 'Hey'); g('?'); // \"Hey, Sam?\"\n```\nUse cases: borrowing methods (`Math.max.apply(null, arr)`), binding handlers in class components, partial application."
      },
      {
        "id": "cb1",
        "n": 66,
        "q": "What happens if you bind() an already bound function, or call it with call()/apply()?",
        "a": "A bound function's `this` is **fixed permanently**. Later attempts to change it are ignored:\n```js\nfunction show() { return this.name; }\nconst a = { name: 'A' }, b = { name: 'B' };\n\nconst boundA = show.bind(a);\nboundA.call(b);   // \"A\" – call/apply can't override it\nboundA.bind(b)(); // \"A\" – the second bind's this is ignored\n```\n- Extra **arguments** from a second `bind` are still added: `add.bind(null, 1).bind(null, 2)()` passes `1, 2`.\n- **`new` wins**: calling a bound function with `new` ignores the bound `this` and creates a new object (bound arguments are still used).\n- **Arrow functions** have no own `this`, so `call`, `apply` and `bind` can't change it; only the arguments are passed.\n\nPrecedence for `this`: `new` > explicit binding (`bind`/`call`/`apply`) > method call (`obj.fn()`) > default (`undefined` in strict mode, `globalThis` otherwise)."
      },
      {
        "id": "cb2",
        "n": 67,
        "q": "Why does a method lose its this context when passed as a callback, and how do you fix it?",
        "a": "`this` is decided by **how a function is called**, not where it is defined. Passing `obj.method` as a callback passes only the function, so it is later called without its object:\n```js\nconst counter = {\n  count: 0,\n  inc() { this.count++; },\n};\nsetTimeout(counter.inc, 0);                    // this is window, not counter – bug\nbutton.addEventListener('click', counter.inc); // this is the button – bug\n```\nFixes:\n- **`bind`**: `setTimeout(counter.inc.bind(counter), 0)`\n- **Arrow wrapper**: `setTimeout(() => counter.inc(), 0)`\n- **Arrow class fields** (bound per instance): `handleClick = () => { ... }`. This is the usual fix in React class components, instead of `this.handleClick = this.handleClick.bind(this)` in the constructor.\n\nNote: calling `bind` (or creating an arrow) inside render makes a new function every time, which can defeat `React.memo` / `PureComponent` optimisations."
      },
      {
        "id": "66",
        "n": 68,
        "q": "What is event bubbling and event capturing?",
        "a": "When an event fires on an element, it travels in three phases:\n1. **Capturing**: from `window` down through ancestors to the target.\n2. **Target** phase.\n3. **Bubbling**: from the target back up to `window`.\n`addEventListener(type, handler)` listens in the bubbling phase by default; pass `{ capture: true }` (or `true`) for capturing.\n```js\nparent.addEventListener('click', () => console.log('parent'));\nchild.addEventListener('click', () => console.log('child'));\n// click child → \"child\", then \"parent\"\n```\n`e.stopPropagation()` stops further travel; `e.preventDefault()` only stops the default browser action. Some events don't bubble (`focus`, `blur` — use `focusin/focusout`)."
      },
      {
        "id": "67",
        "n": 69,
        "q": "What is event delegation? Where would you use it?",
        "a": "Event delegation means attaching **one listener to a common parent** instead of a listener on every child, and using `e.target` to find which child was clicked. It works because events bubble.\n```js\ndocument.getElementById('list').addEventListener('click', e => {\n  const item = e.target.closest('li');\n  if (item) console.log('Clicked', item.dataset.id);\n});\n```\nBenefits: fewer listeners (less memory), works for elements added dynamically later, simpler cleanup.\nUse for: long lists, tables, menus, dynamically generated content. React itself uses delegation — it attaches listeners at the root container."
      },
      {
        "id": "68",
        "n": 70,
        "q": "What is the difference between map(), filter(), and forEach()?",
        "a": "- **`forEach`**: runs a function for each element; returns `undefined`. Used for side effects. Can't be broken out of (except by throwing).\n- **`map`**: returns a **new array** of the same length with each element transformed.\n- **`filter`**: returns a **new array** with only elements for which the callback returns truthy.\n```js\nconst nums = [1, 2, 3, 4];\nnums.map(n => n * 2);        // [2, 4, 6, 8]\nnums.filter(n => n % 2 === 0); // [2, 4]\nnums.forEach(n => console.log(n)); // undefined\n```\nNone mutate the original array (unless your callback does). `map` and `filter` are chainable."
      },
      {
        "id": "69",
        "n": 71,
        "q": "What is the difference between shallow copy and deep copy?",
        "a": "- **Shallow copy**: copies the top-level properties only; nested objects/arrays are still **shared references**. Methods: spread `{...obj}`, `[...arr]`, `Object.assign`, `Array.from`, `slice`.\n- **Deep copy**: recursively copies every level, so the copy is fully independent. Methods: `structuredClone(obj)` (modern, handles Dates, Maps, Sets, circular refs; not functions), `JSON.parse(JSON.stringify(obj))` (loses functions, `undefined`, Dates become strings, fails on circular refs), lodash `cloneDeep`.\n```js\nconst a = { user: { name: 'A' } };\nconst s = { ...a };            s.user.name = 'B'; // a.user.name is now 'B'\nconst d = structuredClone(a);  d.user.name = 'C'; // a unchanged\n```\nIn React/Redux, immutable updates are usually shallow copies along the changed path."
      },
      {
        "id": "70",
        "n": 72,
        "q": "What are Promises?",
        "a": "A Promise is an object representing the eventual result of an async operation. States: **pending** → **fulfilled** (with a value) or **rejected** (with a reason). Once settled it never changes.\n```js\nconst p = new Promise((resolve, reject) => {\n  setTimeout(() => resolve('done'), 1000);\n});\np.then(v => console.log(v))\n .catch(e => console.error(e))\n .finally(() => console.log('cleanup'));\n```\nSolves \"callback hell\": chaining (`then` returns a new promise), centralized error handling with `.catch`. Combinators: `Promise.all`, `allSettled`, `race`, `any`. Callbacks run as microtasks."
      },
      {
        "id": "71",
        "n": 73,
        "q": "What is the difference between Promise.all() and Promise.allSettled()?",
        "a": "- **`Promise.all(promises)`**: resolves with an array of all values when **all** fulfil; **rejects immediately** when any one rejects (fail-fast). Use when all results are required (e.g. page needs all data).\n- **`Promise.allSettled(promises)`**: waits for **all** to settle and never rejects; returns `[{status: 'fulfilled', value}, {status: 'rejected', reason}]`. Use when calls are independent and you want partial results (e.g. dashboard widgets).\n```js\nconst results = await Promise.allSettled([getUser(), getOrders()]);\nresults.forEach(r => r.status === 'fulfilled' ? use(r.value) : log(r.reason));\n```\nAlso: `Promise.race` (first to settle) and `Promise.any` (first to fulfil; rejects only if all reject)."
      },
      {
        "id": "72",
        "n": 74,
        "q": "What is the difference between Promises and async/await?",
        "a": "`async/await` is syntax on top of Promises — same mechanism, different style.\n- **Promises**: chain `.then().catch()`; can get nested with complex flows.\n- **async/await**: code reads like synchronous code; errors handled with `try/catch`; easier debugging and conditionals/loops.\n- An `async` function always returns a Promise; `await` pauses that function (not the thread) until the promise settles.\n```js\nasync function load() {\n  try {\n    const user = await getUser();\n    const orders = await getOrders(user.id);\n    return orders;\n  } catch (e) { handle(e); }\n}\n```\nPitfall: sequential `await`s for independent calls are slow — use `await Promise.all([a(), b()])`."
      },
      {
        "id": "73",
        "n": 75,
        "q": "What is a polyfill? Have you written any?",
        "a": "A polyfill is code that implements a modern feature in environments (old browsers) that don't support it natively, usually by checking if it exists first.\n```js\nif (!Array.prototype.includes) {\n  Array.prototype.includes = function (search, from = 0) {\n    for (let i = from; i < this.length; i++) {\n      if (this[i] === search || (Number.isNaN(this[i]) && Number.isNaN(search))) return true;\n    }\n    return false;\n  };\n}\n```\nInterview favourites: `map`, `filter`, `reduce`, `bind`, `Promise.all`, `debounce`, `flat`. In real projects, polyfills come from **core-js** via Babel (`@babel/preset-env` + browserslist). (A polyfill adds missing APIs; a transpiler converts new syntax.)"
      },
      {
        "id": "74",
        "n": 76,
        "q": "What is the difference between debounce and throttle?",
        "a": "Both limit how often a function runs during rapid events.\n- **Debounce**: runs the function only **after the events stop** for X ms; each new event resets the timer. Use for search-as-you-type, autosave, window resize end, form validation.\n- **Throttle**: runs the function **at most once every X ms** during continuous events. Use for scroll, mousemove, infinite scroll checks, button spam protection, analytics.\nExample: typing for 2 seconds with 300 ms wait — debounce calls once (at the end); throttle calls about 7 times."
      },
      {
        "id": "75",
        "n": 77,
        "q": "How would you implement debounce and throttle from scratch?",
        "a": "```js\nfunction debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n\nfunction throttle(fn, limit) {\n  let waiting = false;\n  return function (...args) {\n    if (waiting) return;\n    fn.apply(this, args);\n    waiting = true;\n    setTimeout(() => { waiting = false; }, limit);\n  };\n}\n\nconst onSearch = debounce(q => fetchResults(q), 300);\nwindow.addEventListener('scroll', throttle(handleScroll, 200));\n```\nBoth use a **closure** to keep `timer`/`waiting` between calls. Mention extras: leading/trailing options, a `cancel()` method. In React, create them once with `useMemo`/`useRef` (otherwise a new debounced function is created every render) and cancel in cleanup."
      },
      {
        "id": "76",
        "n": 78,
        "q": "What happens when multiple buttons use the same debounce function?",
        "a": "If **one** debounced instance is shared by multiple buttons, they all share the same `timer` in the closure. Clicking button A then button B quickly cancels A's call — only the last click (B) runs. That's a bug if each button should act independently.\nFix: create a **separate debounced function per button** (or key the timers by id):\n```js\nfunction debounceByKey(fn, delay) {\n  const timers = {};\n  return (key, ...args) => {\n    clearTimeout(timers[key]);\n    timers[key] = setTimeout(() => fn(key, ...args), delay);\n  };\n}\n```\nSharing is fine when you *want* one action overall (e.g. one \"save\" for many inputs)."
      },
      {
        "id": "77",
        "n": 79,
        "q": "What is the difference between Object.freeze() and Object.seal()?",
        "a": "- **`Object.freeze(obj)`**: can't add, delete or **modify** properties. Fully read-only (at top level).\n- **`Object.seal(obj)`**: can't add or delete properties, but **can modify** existing values.\n- (`Object.preventExtensions`: can't add, but can delete and modify.)\nBoth are **shallow** — nested objects can still change unless you deep-freeze recursively. In strict mode, violations throw a TypeError; otherwise they fail silently. Check with `Object.isFrozen` / `Object.isSealed`.\n```js\nconst f = Object.freeze({ a: 1, n: { b: 2 } });\nf.a = 5;     // ignored\nf.n.b = 9;   // works (shallow)\nconst s = Object.seal({ a: 1 });\ns.a = 2;     // works\ns.c = 3;     // ignored\n```"
      },
      {
        "id": "78",
        "n": 80,
        "q": "What is the prototype chain in JavaScript?",
        "a": "Every object has an internal link `[[Prototype]]` (accessible via `Object.getPrototypeOf` or `__proto__`) to another object. When you access a property, JS looks on the object first, then up the chain of prototypes until it finds it or reaches `null`.\n```js\nconst arr = [];\n// arr → Array.prototype → Object.prototype → null\narr.push;      // found on Array.prototype\narr.hasOwnProperty; // found on Object.prototype\n```\n- Functions have a `prototype` property; objects created with `new Fn()` link to `Fn.prototype`.\n- `class` syntax is sugar over prototypes (`extends` sets up the chain).\n- `Object.create(proto)` creates an object with a given prototype.\nThis is how JS implements inheritance and shares methods efficiently across instances."
      }
    ]
  },
  {
    "title": "React performance optimization",
    "items": [
      {
        "id": "79",
        "n": 81,
        "q": "How do you optimize the performance of a React application?",
        "a": "Measure first (React DevTools Profiler, Lighthouse, Performance tab), then:\n- **Avoid unnecessary re-renders**: `React.memo`, `useMemo`, `useCallback`, keep state close to where it's used, split contexts.\n- **Code splitting / lazy loading** routes and heavy components (`React.lazy`, dynamic `import()`).\n- **Virtualize** long lists (react-window).\n- **Bundle size**: tree-shaking, remove heavy libs (moment → dayjs), analyze with webpack-bundle-analyzer.\n- **Network**: caching (RTK Query/React Query), debounce search, pagination, compression, CDN, HTTP caching.\n- **Images**: lazy loading, modern formats (WebP/AVIF), correct sizes.\n- Concurrent features: `useTransition`, `useDeferredValue` for heavy updates.\n- SSR/SSG (Next.js) for faster first paint; production build."
      },
      {
        "id": "80",
        "n": 82,
        "q": "What causes unnecessary re-renders in React?",
        "a": "A component re-renders when: its state changes, its parent re-renders, or a context it uses changes. Common avoidable causes:\n- Parent re-renders and children aren't memoized.\n- New object/array/function props created each render (`style={{...}}`, `onClick={() => ...}`) breaking `React.memo`.\n- State placed too high in the tree (e.g. form input state in App).\n- Large Context values that change often (every consumer re-renders), or a context value object recreated each render.\n- Redux selectors returning new references.\n- Storing derived data in state + effects that set state.\n- Unstable keys (index or random keys) causing remounts."
      },
      {
        "id": "81",
        "n": 83,
        "q": "How do you identify unnecessary re-renders?",
        "a": "- **React DevTools Profiler**: record an interaction, see which components rendered, how long, and \"Why did this render?\" (enable in settings).\n- DevTools setting **\"Highlight updates when components render\"**.\n- `why-did-you-render` library to log avoidable re-renders.\n- Temporary `console.log` or a render counter (`useRef` incremented each render).\n- Chrome Performance tab for long tasks and scripting time.\nThen fix with memoization, moving state down, or splitting components."
      },
      {
        "id": "82",
        "n": 84,
        "q": "What is memoization?",
        "a": "Memoization is caching the result of a function call based on its inputs, so repeated calls with the same inputs return the cached result instead of recomputing.\n```js\nfunction memoize(fn) {\n  const cache = new Map();\n  return arg => {\n    if (cache.has(arg)) return cache.get(arg);\n    const result = fn(arg);\n    cache.set(arg, result);\n    return result;\n  };\n}\n```\nIn React: `React.memo` (components), `useMemo` (values), `useCallback` (functions), Reselect's `createSelector` (selectors). Trade-off: uses memory and comparison costs, so apply it where it measurably helps."
      },
      {
        "id": "83",
        "n": 85,
        "q": "How do you use React.memo() to optimize a component?",
        "a": "Wrap the component; React skips re-rendering it when its props are shallowly equal to the previous props.\n```jsx\nconst UserCard = React.memo(function UserCard({ user, onSelect }) {\n  return <div onClick={() => onSelect(user.id)}>{user.name}</div>;\n});\n\n// Parent: keep props stable\nconst handleSelect = useCallback(id => setSelected(id), []);\n<UserCard user={user} onSelect={handleSelect} />\n```\n- Optional second arg: custom comparison `(prev, next) => boolean` (return true to skip render).\n- It still re-renders if its own state or a used context changes.\n- Best for components that render often with the same props and are expensive (list rows, charts)."
      },
      {
        "id": "84",
        "n": 86,
        "q": "What is code splitting?",
        "a": "Code splitting breaks the app bundle into smaller chunks that are loaded **on demand** instead of shipping one huge JS file upfront. This reduces initial load time and Time to Interactive.\n- Done with dynamic `import()`; bundlers (Webpack, Vite) create separate chunks automatically.\n- In React: `React.lazy` + `Suspense` for components; split by **route** first (biggest win), then heavy components (charts, editors, modals).\n- Also `splitChunks` to separate vendor code for better caching.\n```js\nimport('./utils/heavy').then(mod => mod.run());\n```"
      },
      {
        "id": "85",
        "n": 87,
        "q": "What is lazy loading in React?",
        "a": "Lazy loading means loading a resource only when it's needed rather than on initial page load.\nIn React:\n- **Components/routes**: `React.lazy(() => import('./Dashboard'))` wrapped in `<Suspense fallback={...}>`.\n- **Images**: `<img loading=\"lazy\">` or IntersectionObserver.\n- **Data**: fetch when a section scrolls into view or a tab opens.\nBenefit: smaller initial bundle, faster first load. Cost: a small delay when the user first opens that part, so show a good fallback and consider prefetching likely routes."
      },
      {
        "id": "86",
        "n": 88,
        "q": "How does React.lazy() work?",
        "a": "`React.lazy` takes a function returning a dynamic `import()` promise that resolves to a module with a **default export** component.\n```jsx\nconst Reports = React.lazy(() => import('./pages/Reports'));\n\n<Suspense fallback={<Spinner />}>\n  <Routes>\n    <Route path=\"/reports\" element={<Reports />} />\n  </Routes>\n</Suspense>\n```\nHow it works: on first render, the lazy component **throws the promise**; the nearest `Suspense` catches it and shows the fallback. When the chunk loads, React re-renders with the real component (cached afterwards). Wrap with an Error Boundary to handle chunk load failures. For named exports: `import('./X').then(m => ({ default: m.Named }))`."
      },
      {
        "id": "87",
        "n": 89,
        "q": "What is the purpose of Suspense?",
        "a": "`Suspense` lets you show a **fallback UI** (spinner, skeleton) while its children are \"not ready yet\" — waiting for lazy-loaded code or, with Suspense-enabled data libraries/frameworks (Next.js, React Query suspense mode, React 19 `use()`), data.\n```jsx\n<Suspense fallback={<Skeleton />}>\n  <Comments />\n</Suspense>\n```\n- Boundaries can be nested to reveal parts of the page progressively.\n- In SSR (Next.js App Router), Suspense enables **streaming** HTML chunks.\n- Combine with `useTransition` to keep showing old content instead of a fallback during updates."
      },
      {
        "id": "88",
        "n": 90,
        "q": "How do you handle a large list of records coming from an API?",
        "a": "- **Server-side pagination** or **infinite scroll** — don't fetch 10,000 rows at once if avoidable.\n- **Virtualization** (react-window / react-virtuoso / TanStack Virtual): render only visible rows.\n- Memoize rows (`React.memo`) with stable keys and stable callbacks.\n- Debounce search/filter; move heavy filtering/sorting to the server or a Web Worker; use `useDeferredValue`/`useTransition` for client-side filtering.\n- Cache responses (RTK Query/React Query); normalize data.\n- Show skeleton loaders; request only the fields needed."
      },
      {
        "id": "89",
        "n": 91,
        "q": "What is list virtualization? Have you used react-window or a similar library?",
        "a": "List virtualization (windowing) renders only the items currently visible in the viewport (plus a small buffer), instead of thousands of DOM nodes. As you scroll, rows are recycled and positioned absolutely inside a tall container to keep the scrollbar correct.\n```jsx\nimport { FixedSizeList as List } from 'react-window';\n<List height={500} itemCount={items.length} itemSize={40} width=\"100%\">\n  {({ index, style }) => <div style={style}>{items[index].name}</div>}\n</List>\n```\nBenefits: fast initial render, low memory, smooth scrolling. Libraries: react-window, react-virtualized, react-virtuoso (variable heights), TanStack Virtual. Caveats: Ctrl+F browser search doesn't find off-screen items; variable heights need measurement; accessibility needs care."
      },
      {
        "id": "90",
        "n": 92,
        "q": "How would you implement pagination or infinite scrolling?",
        "a": "**Pagination**: keep `page` (and `pageSize`) in state or URL; fetch `/api/items?page=2&limit=20`; show next/prev buttons using `total`/`totalPages` from the API.\n**Infinite scroll**: append the next page when a sentinel element at the bottom becomes visible:\n```jsx\nconst loaderRef = useRef(null);\nuseEffect(() => {\n  const obs = new IntersectionObserver(([entry]) => {\n    if (entry.isIntersecting && hasMore && !loading) setPage(p => p + 1);\n  });\n  if (loaderRef.current) obs.observe(loaderRef.current);\n  return () => obs.disconnect();\n}, [hasMore, loading]);\n// useEffect on [page] → fetch and setItems(prev => [...prev, ...newItems])\n```\nPrefer **cursor-based** pagination for changing data. Combine infinite scroll with virtualization for huge lists; RTK Query/React Query (`useInfiniteQuery`) simplify this."
      },
      {
        "id": "91",
        "n": 93,
        "q": "How would you optimize an application with multiple API calls?",
        "a": "- Run independent calls **in parallel** with `Promise.all` / `allSettled`, not one by one.\n- **Cache** and de-duplicate requests (RTK Query, React Query, SWR) so multiple components share one request.\n- Combine endpoints on the backend (BFF / GraphQL) to reduce round trips.\n- Lazy-load data for parts not visible yet (tabs, below-the-fold).\n- Debounce/throttle user-triggered calls; cancel outdated ones with AbortController.\n- Prefetch likely next data; show progressive UI (skeletons per section with Suspense).\n- HTTP caching headers, compression, CDN."
      },
      {
        "id": "92",
        "n": 94,
        "q": "How do you prevent unnecessary API calls when a component re-renders?",
        "a": "- Use correct `useEffect` dependencies; avoid objects/functions created during render as dependencies (memoize or use primitives).\n- Never call APIs directly in the component body — only in effects or event handlers.\n- Use a caching library (RTK Query/React Query) that de-duplicates and caches by key.\n- Lift the fetch to a parent or store so remounting children don't refetch.\n- Debounce input-driven requests; use a ref flag to prevent duplicate submits.\n- Remember StrictMode intentionally runs effects twice in development only."
      },
      {
        "id": "93",
        "n": 95,
        "q": "How would you improve the initial loading performance of a React application?",
        "a": "- **Code splitting** by route and lazy-load heavy components.\n- Reduce bundle size: tree-shaking, remove unused/heavy libraries, analyze bundle.\n- **SSR/SSG** (Next.js) or prerendering for faster First Contentful Paint and SEO.\n- Optimize assets: compressed (gzip/brotli), minified, CDN, long-term caching with hashed filenames.\n- Images: lazy loading, responsive sizes, WebP/AVIF; fonts: `font-display: swap`, preload critical ones.\n- `preload`/`prefetch`/`preconnect` for critical resources; defer non-critical scripts (analytics).\n- Skeleton screens to improve perceived performance.\n- Measure with Lighthouse / Web Vitals (LCP, INP, CLS)."
      }
    ]
  },
  {
    "title": "Machine coding & JavaScript programming",
    "items": [
      {
        "id": "95",
        "n": 96,
        "q": "Write a program to find the frequency of each character in a string.",
        "code": "const str = \"aabcabcb\";\n\n// Expected output:\n// { a: 3, b: 3, c: 2 }",
        "group": "JavaScript coding",
        "a": "```js\nfunction charFrequency(str) {\n  const freq = {};\n  for (const ch of str) {\n    freq[ch] = (freq[ch] || 0) + 1;\n  }\n  return freq;\n}\ncharFrequency(\"aabcabcb\"); // { a: 3, b: 3, c: 2 }\n\n// one-liner with reduce\nconst freq = [...str].reduce((acc, ch) => ({ ...acc, [ch]: (acc[ch] ?? 0) + 1 }), {});\n```\nTime O(n), space O(k) for k unique characters. (The reduce + spread version is O(n·k) — mention that the loop is better.)"
      },
      {
        "id": "96",
        "n": 97,
        "q": "Find the frequency of elements in an array.",
        "code": "const arr = [1, 2, 1, 2, 3, 3, 2, 1];\n\n// Expected output:\n// { 1: 3, 2: 3, 3: 2 }",
        "group": "JavaScript coding",
        "a": "```js\nfunction elementFrequency(arr) {\n  return arr.reduce((acc, item) => {\n    acc[item] = (acc[item] || 0) + 1;\n    return acc;\n  }, {});\n}\nelementFrequency([1, 2, 1, 2, 3, 3, 2, 1]); // { 1: 3, 2: 3, 3: 2 }\n\n// Use a Map if you need to keep the original key types (numbers, objects)\nconst m = new Map();\narr.forEach(x => m.set(x, (m.get(x) || 0) + 1));\n```\nTime O(n)."
      },
      {
        "id": "97",
        "n": 98,
        "q": "Find the sum of all elements in an array.",
        "group": "JavaScript coding",
        "a": "```js\nconst sum = arr => arr.reduce((acc, n) => acc + n, 0);\nsum([1, 2, 3, 4]); // 10\n\n// classic loop\nfunction sumLoop(arr) {\n  let total = 0;\n  for (let i = 0; i < arr.length; i++) total += arr[i];\n  return total;\n}\n```\nAlways pass the initial value `0` to `reduce` — otherwise an empty array throws a TypeError."
      },
      {
        "id": "98",
        "n": 99,
        "q": "Merge two arrays and remove duplicate elements.",
        "code": "const arr1 = [1, 2, 3, 7, 8];\nconst arr2 = [1, 4, 5, 9, 10];\n\n// Expected output:\n// [1, 2, 3, 4, 5, 7, 8, 9, 10]",
        "group": "JavaScript coding",
        "a": "```js\nconst arr1 = [1, 2, 3, 7, 8];\nconst arr2 = [1, 4, 5, 9, 10];\n\nconst merged = [...new Set([...arr1, ...arr2])].sort((a, b) => a - b);\n// [1, 2, 3, 4, 5, 7, 8, 9, 10]\n\n// without Set\nconst merged2 = arr1.concat(arr2)\n  .filter((x, i, all) => all.indexOf(x) === i)   // O(n²)\n  .sort((a, b) => a - b);\n```\nNote `sort()` without a comparator sorts as strings (`[10, 9]` → `[10, 9]` wrong order), so always pass `(a, b) => a - b` for numbers. If both arrays are already sorted, a two-pointer merge is O(n + m)."
      },
      {
        "id": "99",
        "n": 100,
        "q": "Convert two arrays into an object.",
        "code": "const keys = [\"name\", \"age\", \"country\"];\nconst values = [\"Bobby\", 30, \"India\"];\n\n// Expected output:\n// { name: \"Bobby\", age: 30, country: \"India\" }",
        "group": "JavaScript coding",
        "a": "```js\nconst keys = [\"name\", \"age\", \"country\"];\nconst values = [\"Bobby\", 30, \"India\"];\n\nconst obj = Object.fromEntries(keys.map((k, i) => [k, values[i]]));\n// { name: \"Bobby\", age: 30, country: \"India\" }\n\n// with reduce\nconst obj2 = keys.reduce((acc, k, i) => { acc[k] = values[i]; return acc; }, {});\n```"
      },
      {
        "id": "100",
        "n": 101,
        "q": "Write a function to find the first non-repeating character in a string.",
        "group": "JavaScript coding",
        "a": "```js\nfunction firstNonRepeating(str) {\n  const count = {};\n  for (const ch of str) count[ch] = (count[ch] || 0) + 1;\n  for (const ch of str) if (count[ch] === 1) return ch;\n  return null;\n}\nfirstNonRepeating(\"aabbcdc\"); // \"d\"\n```\nTwo passes, O(n) time. Alternative: `str.indexOf(ch) === str.lastIndexOf(ch)` — simpler but O(n²)."
      },
      {
        "id": "101",
        "n": 102,
        "q": "Implement debounce from scratch.",
        "group": "JavaScript coding",
        "a": "```js\nfunction debounce(fn, delay = 300) {\n  let timer;\n  function debounced(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  }\n  debounced.cancel = () => clearTimeout(timer);\n  return debounced;\n}\n\nconst input = document.querySelector('#search');\ninput.addEventListener('input', debounce(e => search(e.target.value), 400));\n```\nExplain: closure keeps `timer`; each call resets it; `fn` runs only after `delay` ms of silence; `apply(this, args)` preserves context and arguments."
      },
      {
        "id": "102",
        "n": 103,
        "q": "Implement throttle from scratch.",
        "group": "JavaScript coding",
        "a": "```js\nfunction throttle(fn, limit = 300) {\n  let last = 0;\n  return function (...args) {\n    const now = Date.now();\n    if (now - last >= limit) {\n      last = now;\n      fn.apply(this, args);\n    }\n  };\n}\n\nwindow.addEventListener('scroll', throttle(() => console.log(window.scrollY), 200));\n```\nThis is the \"leading edge\" version. A timer-based version can also guarantee a final trailing call after the events stop."
      },
      {
        "id": "103",
        "n": 104,
        "q": "Sort an array of alphanumeric strings naturally.",
        "code": "const arr = [\"A1\", \"A10\", \"A11\", \"A2\", \"A3\"];\n\n// Expected:\n// [\"A1\", \"A2\", \"A3\", \"A10\", \"A11\"]",
        "group": "JavaScript coding",
        "a": "```js\nconst arr = [\"A1\", \"A10\", \"A11\", \"A2\", \"A3\"];\n\n// simplest: localeCompare with numeric option\narr.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));\n// [\"A1\", \"A2\", \"A3\", \"A10\", \"A11\"]\n\n// manual: compare letter prefix, then number\narr.sort((a, b) => {\n  const [, pa, na] = a.match(/^(\\D*)(\\d*)$/);\n  const [, pb, nb] = b.match(/^(\\D*)(\\d*)$/);\n  return pa === pb ? Number(na) - Number(nb) : pa.localeCompare(pb);\n});\n```\nDefault `sort()` compares strings character by character, so \"A10\" < \"A2\"."
      },
      {
        "id": "104",
        "n": 105,
        "q": "Find the second-largest number in an array.",
        "group": "JavaScript coding",
        "a": "```js\nfunction secondLargest(arr) {\n  let first = -Infinity, second = -Infinity;\n  for (const n of arr) {\n    if (n > first) { second = first; first = n; }\n    else if (n > second && n !== first) second = n;\n  }\n  return second === -Infinity ? null : second;\n}\nsecondLargest([10, 5, 20, 20, 8]); // 10\n```\nSingle pass, O(n), handles duplicates. Shortcut: `[...new Set(arr)].sort((a, b) => b - a)[1]` — O(n log n)."
      },
      {
        "id": "105",
        "n": 106,
        "q": "Flatten a nested array.",
        "group": "JavaScript coding",
        "a": "```js\nconst nested = [1, [2, [3, [4]], 5]];\n\nnested.flat(Infinity); // [1, 2, 3, 4, 5]\n\n// recursive\nfunction flatten(arr) {\n  return arr.reduce((acc, item) =>\n    Array.isArray(item) ? acc.concat(flatten(item)) : acc.concat(item), []);\n}\n\n// with depth (polyfill-like)\nfunction flat(arr, depth = 1) {\n  return depth > 0\n    ? arr.reduce((acc, x) => acc.concat(Array.isArray(x) ? flat(x, depth - 1) : x), [])\n    : arr.slice();\n}\n```\nIterative alternative uses a stack to avoid recursion limits for very deep arrays."
      },
      {
        "id": "106",
        "n": 107,
        "q": "Reverse a string without using the built-in reverse method.",
        "group": "JavaScript coding",
        "a": "```js\nfunction reverseString(str) {\n  let result = '';\n  for (let i = str.length - 1; i >= 0; i--) result += str[i];\n  return result;\n}\nreverseString(\"hello\"); // \"olleh\"\n\n// two-pointer swap on an array\nfunction reverse2(str) {\n  const a = [...str];          // spread handles emoji/unicode better than split('')\n  for (let i = 0, j = a.length - 1; i < j; i++, j--) [a[i], a[j]] = [a[j], a[i]];\n  return a.join('');\n}\n```"
      },
      {
        "id": "107",
        "n": 108,
        "q": "Find duplicate elements in an array.",
        "group": "JavaScript coding",
        "a": "```js\nfunction findDuplicates(arr) {\n  const seen = new Set();\n  const dupes = new Set();\n  for (const x of arr) {\n    if (seen.has(x)) dupes.add(x);\n    else seen.add(x);\n  }\n  return [...dupes];\n}\nfindDuplicates([1, 2, 3, 2, 4, 1, 1]); // [2, 1]\n\n// short version (O(n²))\narr.filter((x, i) => arr.indexOf(x) !== i);  // may repeat values\n```"
      },
      {
        "id": "108",
        "n": 109,
        "q": "Implement a custom map() function.",
        "group": "JavaScript coding",
        "a": "```js\nArray.prototype.myMap = function (callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');\n  const result = new Array(this.length);\n  for (let i = 0; i < this.length; i++) {\n    if (i in this) result[i] = callback.call(thisArg, this[i], i, this); // skip holes\n  }\n  return result;\n};\n[1, 2, 3].myMap(x => x * 2); // [2, 4, 6]\n```\nPoints to mention: callback gets `(element, index, array)`, supports `thisArg`, returns a new array, doesn't mutate the original. Use a normal `function` so `this` is the array."
      },
      {
        "id": "109",
        "n": 110,
        "q": "Implement a custom filter() function.",
        "group": "JavaScript coding",
        "a": "```js\nArray.prototype.myFilter = function (callback, thisArg) {\n  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');\n  const result = [];\n  for (let i = 0; i < this.length; i++) {\n    if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);\n  }\n  return result;\n};\n[1, 2, 3, 4].myFilter(n => n % 2 === 0); // [2, 4]\n```"
      },
      {
        "id": "110",
        "n": 111,
        "q": "Write a polyfill for Array.prototype.reduce().",
        "group": "JavaScript coding",
        "a": "```js\nArray.prototype.myReduce = function (callback, initialValue) {\n  if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');\n  const arr = this;\n  let i = 0;\n  let acc;\n  if (arguments.length >= 2) {\n    acc = initialValue;\n  } else {\n    while (i < arr.length && !(i in arr)) i++;          // skip holes\n    if (i >= arr.length) throw new TypeError('Reduce of empty array with no initial value');\n    acc = arr[i++];\n  }\n  for (; i < arr.length; i++) {\n    if (i in arr) acc = callback(acc, arr[i], i, arr);\n  }\n  return acc;\n};\n[1, 2, 3].myReduce((a, b) => a + b, 0); // 6\n```\nKey details: use `arguments.length` (so `initialValue` of `undefined` still counts), throw on empty array without initial value, callback gets `(acc, cur, index, array)`."
      },
      {
        "id": "cb3",
        "n": 112,
        "q": "Write polyfills for call() and apply().",
        "group": "JavaScript coding",
        "a": "Idea: temporarily attach the function to the target object as a method and call it. A method call sets `this` to that object. Then remove it.\n```js\nFunction.prototype.myCall = function (context, ...args) {\n  if (typeof this !== 'function') throw new TypeError('myCall must be called on a function');\n  // null/undefined -> global object; primitives -> wrapper objects (like non-strict call)\n  context = context == null ? globalThis : Object(context);\n  const key = Symbol('fn');   // unique key, can't clash with existing properties\n  context[key] = this;\n  try {\n    return context[key](...args);\n  } finally {\n    delete context[key];      // clean up even if the function throws\n  }\n};\n\nFunction.prototype.myApply = function (context, args) {\n  return this.myCall(context, ...(args ?? []));\n};\n\nfunction greet(greeting) { return `${greeting}, ${this.name}`; }\ngreet.myCall({ name: 'Sam' }, 'Hi');     // \"Hi, Sam\"\ngreet.myApply({ name: 'Sam' }, ['Hey']); // \"Hey, Sam\"\n```\nWhat interviewers look for: a **Symbol** key, cleanup in `finally`, handling `null`/`undefined` and primitive `context`, and returning the result. Limitation: it can't work on frozen or sealed objects, because it has to add a property."
      },
      {
        "id": "cb4",
        "n": 113,
        "q": "Write a polyfill for bind().",
        "group": "JavaScript coding",
        "a": "`bind` returns a new function that calls the original with a fixed `this`, the preset arguments, and any arguments passed later:\n```js\nFunction.prototype.myBind = function (context, ...preset) {\n  if (typeof this !== 'function') throw new TypeError('myBind must be called on a function');\n  const fn = this;\n  return function bound(...later) {\n    // With `new`, ignore the bound this, like native bind does.\n    if (new.target) return new fn(...preset, ...later);\n    return fn.apply(context, [...preset, ...later]);\n  };\n};\n\nconst user = { name: 'Sam' };\nfunction greet(greeting, punct) { return `${greeting}, ${this.name}${punct}`; }\nconst hi = greet.myBind(user, 'Hi');\nhi('!');                     // \"Hi, Sam!\"\nhi.call({ name: 'X' }, '?'); // \"Hi, Sam?\" – this stays bound\n```\nPoints to mention:\n- **Partial application**: preset arguments come first, later ones are appended.\n- The returned function is a **closure** over `fn`, `context` and `preset`.\n- **`new` support** is the usual follow-up: a bound function used as a constructor ignores the bound `this`.\n- If asked not to use `apply`, call the original through the `myCall` polyfill instead."
      },
      {
        "id": "m1",
        "n": "M1",
        "q": "Create a counter with increment, decrement and reset",
        "group": "React machine coding",
        "note": "",
        "a": "```jsx\nimport { useState } from 'react';\n\nexport default function Counter({ initial = 0, step = 1 }) {\n  const [count, setCount] = useState(initial);\n  return (\n    <div>\n      <h2>{count}</h2>\n      <button onClick={() => setCount(c => c - step)} disabled={count <= 0}>-</button>\n      <button onClick={() => setCount(c => c + step)}>+</button>\n      <button onClick={() => setCount(initial)}>Reset</button>\n    </div>\n  );\n}\n```\nTalking points: functional updates (avoid stale state), optional min limit, props for initial/step. Follow-ups: move logic into a `useCounter` hook, or use `useReducer`."
      },
      {
        "id": "m2",
        "n": "M2",
        "q": "Fetch users from an API and display usernames",
        "group": "React machine coding",
        "note": "Include: loading state, error handling, empty state, response handling, cleanup, correct dependencies.",
        "a": "```jsx\nimport { useEffect, useState } from 'react';\n\nexport default function UserList() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })\n      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })\n      .then(setUsers)\n      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })\n      .finally(() => setLoading(false));\n    return () => controller.abort();\n  }, []);\n\n  if (loading) return <p>Loading…</p>;\n  if (error) return <p role=\"alert\">Error: {error}</p>;\n  if (!users.length) return <p>No users found.</p>;\n  return <ul>{users.map(u => <li key={u.id}>{u.username}</li>)}</ul>;\n}\n```\nNote: `fetch` doesn't reject on 404/500, so check `res.ok`."
      },
      {
        "id": "m3",
        "n": "M3",
        "q": "Create a searchable and filterable list",
        "group": "React machine coding",
        "note": "",
        "a": "```jsx\nimport { useMemo, useState } from 'react';\n\nexport default function SearchableList({ items }) {   // items: [{id, name, category}]\n  const [query, setQuery] = useState('');\n  const [category, setCategory] = useState('all');\n  const categories = useMemo(() => ['all', ...new Set(items.map(i => i.category))], [items]);\n\n  const visible = useMemo(() => {\n    const q = query.trim().toLowerCase();\n    return items.filter(i =>\n      (category === 'all' || i.category === category) &&\n      i.name.toLowerCase().includes(q));\n  }, [items, query, category]);\n\n  return (\n    <div>\n      <input value={query} onChange={e => setQuery(e.target.value)} placeholder=\"Search…\" />\n      <select value={category} onChange={e => setCategory(e.target.value)}>\n        {categories.map(c => <option key={c} value={c}>{c}</option>)}\n      </select>\n      {visible.length ? (\n        <ul>{visible.map(i => <li key={i.id}>{i.name}</li>)}</ul>\n      ) : <p>No results</p>}\n    </div>\n  );\n}\n```\nTalking points: filtered list is **derived** (not stored in state), `useMemo` for big lists, debounce the query (or `useDeferredValue`) if filtering is slow or done via API."
      },
      {
        "id": "m4",
        "n": "M4",
        "q": "Create an N × N dynamic grid based on user input",
        "group": "React machine coding",
        "note": "",
        "a": "```jsx\nimport { useState } from 'react';\n\nexport default function Grid() {\n  const [n, setN] = useState(3);\n  const [active, setActive] = useState(new Set());\n\n  const toggle = i => setActive(prev => {\n    const next = new Set(prev);\n    next.has(i) ? next.delete(i) : next.add(i);\n    return next;\n  });\n\n  return (\n    <div>\n      <input type=\"number\" min=\"1\" max=\"20\" value={n}\n        onChange={e => { setN(Math.max(1, Math.min(20, +e.target.value || 1))); setActive(new Set()); }} />\n      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 40px)`, gap: 4 }}>\n        {Array.from({ length: n * n }, (_, i) => (\n          <div key={i} onClick={() => toggle(i)}\n            style={{ width: 40, height: 40, border: '1px solid #999',\n                     background: active.has(i) ? 'teal' : 'white' }} />\n        ))}\n      </div>\n    </div>\n  );\n}\n```\nTalking points: CSS grid with `repeat(n, …)`, validate input, immutable Set update, row = `Math.floor(i / n)`, col = `i % n`. Common follow-ups: click order then un-color in reverse, tic-tac-toe winner check."
      },
      {
        "id": "m5",
        "n": "M5",
        "q": "Create pagination for an API-based product listing",
        "group": "React machine coding",
        "note": "Include: loading state, error handling, empty state, response handling, cleanup, correct dependencies.",
        "a": "```jsx\nimport { useEffect, useState } from 'react';\nconst PAGE_SIZE = 10;\n\nexport default function ProductList() {\n  const [page, setPage] = useState(1);\n  const [data, setData] = useState({ products: [], total: 0 });\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    setLoading(true); setError(null);\n    const skip = (page - 1) * PAGE_SIZE;\n    fetch(`https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`, { signal: controller.signal })\n      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })\n      .then(d => setData({ products: d.products, total: d.total }))\n      .catch(e => e.name !== 'AbortError' && setError(e.message))\n      .finally(() => setLoading(false));\n    return () => controller.abort();   // cancels the old request if page changes fast\n  }, [page]);\n\n  const totalPages = Math.ceil(data.total / PAGE_SIZE);\n  if (error) return <p>Error: {error}</p>;\n  return (\n    <div>\n      {loading ? <p>Loading…</p> : (\n        <ul>{data.products.map(p => <li key={p.id}>{p.title} – ${p.price}</li>)}</ul>\n      )}\n      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>\n      <span> Page {page} of {totalPages} </span>\n      <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>\n    </div>\n  );\n}\n```\nExtras to mention: keep `page` in the URL (`useSearchParams`), cache pages, page-number buttons, abort to avoid race conditions."
      },
      {
        "id": "m6",
        "n": "M6",
        "q": "Build a reusable custom hook for API requests",
        "group": "React machine coding",
        "note": "Include: loading state, error handling, empty state, response handling, cleanup, correct dependencies.",
        "a": "```jsx\nimport { useCallback, useEffect, useRef, useState } from 'react';\n\nexport function useApi(url, options = {}, { immediate = true } = {}) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(immediate);\n  const [error, setError] = useState(null);\n  const optionsRef = useRef(options);\n  optionsRef.current = options;               // latest options without re-triggering\n  const controllerRef = useRef(null);\n\n  const execute = useCallback(async (overrideBody) => {\n    controllerRef.current?.abort();\n    const controller = new AbortController();\n    controllerRef.current = controller;\n    setLoading(true); setError(null);\n    try {\n      const { body, ...rest } = optionsRef.current;\n      const payload = overrideBody ?? body;\n      const res = await fetch(url, {\n        ...rest,\n        body: payload ? JSON.stringify(payload) : undefined,\n        headers: { 'Content-Type': 'application/json', ...rest.headers },\n        signal: controller.signal,\n      });\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      const json = await res.json();\n      setData(json);\n      return json;\n    } catch (e) {\n      if (e.name !== 'AbortError') setError(e);\n    } finally {\n      if (controllerRef.current === controller) setLoading(false);\n    }\n  }, [url]);\n\n  useEffect(() => {\n    if (immediate) execute();\n    return () => controllerRef.current?.abort();\n  }, [execute, immediate]);\n\n  return { data, loading, error, refetch: execute };\n}\n\n// const { data, loading, error, refetch } = useApi('/api/users');\n// const { refetch: save } = useApi('/api/users', { method: 'POST' }, { immediate: false });\n```\nTalking points: loading/error/data states, abort on unmount and on new request (race conditions), `refetch` for manual calls, stable options via ref. In production, RTK Query / React Query add caching, retries and de-duplication."
      }
    ]
  },
  {
    "title": "API handling & real-world scenarios",
    "items": [
      {
        "id": "111",
        "n": 114,
        "q": "How do you make an API call in React?",
        "a": "Usually inside `useEffect` (for data on load) or an event handler (for user actions), with `fetch` or `axios`. Track loading/error, and cancel on unmount.\n```jsx\nuseEffect(() => {\n  const controller = new AbortController();\n  (async () => {\n    try {\n      setLoading(true);\n      const { data } = await axios.get(`/api/users/${id}`, { signal: controller.signal });\n      setUser(data);\n    } catch (e) {\n      if (!axios.isCancel(e)) setError(e);\n    } finally {\n      setLoading(false);\n    }\n  })();\n  return () => controller.abort();\n}, [id]);\n```\nIn real projects: a central API service (axios instance with base URL and interceptors) plus RTK Query / React Query for caching. (The effect callback itself can't be `async`, so define an async function inside.)"
      },
      {
        "id": "112",
        "n": 115,
        "q": "What is the difference between Fetch API and Axios?",
        "a": "- **Fetch**: built into browsers, no dependency. Returns a `Response`; you must call `res.json()`. **Does not reject on HTTP errors** (404/500) — check `res.ok`. No built-in interceptors or timeout (use AbortController).\n- **Axios**: third-party library. Automatically parses JSON and stringifies request bodies; **rejects on non-2xx**; **interceptors** for adding auth tokens / handling 401 globally; timeouts; upload/download progress; instances with base config; works in Node too.\n```js\nconst res = await fetch('/api/users');\nif (!res.ok) throw new Error(res.status);\nconst users = await res.json();\n\nconst { data: users2 } = await axios.get('/api/users');\n```"
      },
      {
        "id": "113",
        "n": 116,
        "q": "How do you handle loading and error states?",
        "a": "Keep explicit states — `loading`, `error`, `data` (or a `status`: `'idle' | 'loading' | 'success' | 'error'`) — and render each case:\n```jsx\nif (status === 'loading') return <Skeleton />;\nif (status === 'error') return <ErrorMessage message={error} onRetry={refetch} />;\nif (!data.length) return <EmptyState />;\nreturn <List items={data} />;\n```\nGood practices: reset error before retrying, show a retry button, user-friendly messages (log technical details), skeletons instead of spinners for layout stability, disable buttons while submitting, global toast for mutation errors, Error Boundaries for render errors. RTK Query/React Query give `isLoading`, `isError`, `error` out of the box."
      },
      {
        "id": "114",
        "n": 117,
        "q": "Suppose you have three APIs, and API 2 depends on the successful response of API 1. How would you implement this?",
        "a": "Run them **sequentially** where there's a dependency, using `async/await` (and parallelize anything independent):\n```js\nasync function loadDashboard() {\n  try {\n    setLoading(true);\n    const user = await api.getUser();                 // API 1\n    const orders = await api.getOrders(user.id);      // API 2 needs API 1's result\n    const recommendations = await api.getRecs(orders[0]?.id); // API 3\n    setData({ user, orders, recommendations });\n  } catch (err) {\n    setError(err);            // any failure stops the chain\n  } finally {\n    setLoading(false);\n  }\n}\n```\nIf API 3 only depends on API 1, run 2 and 3 together: `await Promise.all([getOrders(user.id), getRecs(user.id)])`.\nWith RTK Query/React Query: use the `skip` / `enabled` option — `useGetOrdersQuery(user?.id, { skip: !user })`. Also cancel with AbortController if the component unmounts."
      },
      {
        "id": "115",
        "n": 118,
        "q": "How would you call multiple APIs simultaneously?",
        "a": "Use `Promise.all` (all required) or `Promise.allSettled` (independent, want partial results):\n```js\nconst [users, products, stats] = await Promise.all([\n  api.get('/users'),\n  api.get('/products'),\n  api.get('/stats'),\n]);\n```\nTotal time ≈ the slowest request instead of the sum. With hooks libraries, simply call several query hooks in the component — they run in parallel. Limit concurrency if there are many requests (e.g. batches of 5)."
      },
      {
        "id": "116",
        "n": 119,
        "q": "How do you handle API failures when multiple requests are running?",
        "a": "- Use **`Promise.allSettled`** so one failure doesn't throw away successful results; render each section with its own error state.\n- With `Promise.all`, wrap each call with its own `.catch` to return a fallback:\n```js\nconst safe = p => p.then(data => ({ data })).catch(error => ({ error }));\nconst [users, stats] = await Promise.all([safe(getUsers()), safe(getStats())]);\n```\n- **Retry** with exponential backoff for transient errors (network, 503), not for 4xx.\n- If one failure makes the rest useless, use `Promise.all` and **abort** the other requests.\n- Show partial UI + \"retry\" per widget; log errors centrally (Sentry); wrap widgets in Error Boundaries."
      },
      {
        "id": "117",
        "n": 120,
        "q": "How do you prevent duplicate API calls?",
        "a": "- **Disable the button** / ignore clicks while a request is in flight (`if (loadingRef.current) return;`).\n- **Debounce** input-driven calls (search).\n- **De-duplicate** with a caching layer: RTK Query/React Query share one in-flight request per key.\n- Keep an in-flight map of pending promises keyed by URL and return the existing promise.\n- **Cancel** the previous request with AbortController when a new one starts (`takeLatest` behaviour).\n- Correct `useEffect` dependencies; fetch higher in the tree instead of in every child.\n- Backend: idempotency keys for critical POSTs (payments)."
      },
      {
        "id": "118",
        "n": 121,
        "q": "How do you cancel an API request when a component unmounts?",
        "a": "Use `AbortController` and abort in the effect cleanup:\n```jsx\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch(url, { signal: controller.signal })\n    .then(r => r.json())\n    .then(setData)\n    .catch(err => { if (err.name !== 'AbortError') setError(err); });\n  return () => controller.abort();      // runs on unmount or when url changes\n}, [url]);\n```\nAxios supports the same `signal` option (older: `CancelToken`). RTK Query/React Query handle this automatically. This prevents setting state on unmounted components and avoids race conditions."
      },
      {
        "id": "119",
        "n": 122,
        "q": "How do you handle token expiration in a React application?",
        "a": "Common approach: **short-lived access token + long-lived refresh token** (refresh token in an httpOnly secure cookie).\n- An **axios response interceptor** catches `401`, calls `/refresh`, stores the new access token, and **retries the original request**.\n- Queue concurrent requests while one refresh is in progress so you refresh only once.\n- If refresh fails → clear state and redirect to login.\n- Optionally refresh proactively before expiry (decode `exp` from the JWT).\n```js\nlet refreshing = null;\napi.interceptors.response.use(r => r, async error => {\n  const original = error.config;\n  if (error.response?.status === 401 && !original._retry) {\n    original._retry = true;\n    refreshing = refreshing || api.post('/auth/refresh').finally(() => { refreshing = null; });\n    const { data } = await refreshing;\n    setAccessToken(data.accessToken);\n    original.headers.Authorization = `Bearer ${data.accessToken}`;\n    return api(original);\n  }\n  return Promise.reject(error);\n});\n```"
      },
      {
        "id": "120",
        "n": 123,
        "q": "How do you implement authentication and authorization?",
        "a": "- **Authentication** (who you are): user logs in → backend returns a token (JWT) or sets a session cookie. Store tokens securely (httpOnly cookie preferred; memory over localStorage due to XSS). Keep the user in an `AuthContext`/Redux; attach token in an axios request interceptor; handle refresh/expiry and logout. Or use OAuth/OIDC providers (Azure AD, Auth0, Cognito).\n- **Authorization** (what you can do): the backend returns roles/permissions; the frontend uses them to protect routes, hide/disable UI (`<Can permission=\"edit\">`), and show menus.\nImportant: frontend checks are only for UX — the **backend must always enforce** authorization on every API."
      },
      {
        "id": "121",
        "n": 124,
        "q": "How would you implement protected routes?",
        "a": "Wrap routes in a component that checks auth and redirects (React Router v6):\n```jsx\nfunction ProtectedRoute({ allowedRoles }) {\n  const { user, loading } = useAuth();\n  const location = useLocation();\n  if (loading) return <Spinner />;\n  if (!user) return <Navigate to=\"/login\" replace state={{ from: location }} />;\n  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to=\"/unauthorized\" replace />;\n  return <Outlet />;\n}\n\n<Routes>\n  <Route path=\"/login\" element={<Login />} />\n  <Route element={<ProtectedRoute />}>\n    <Route path=\"/dashboard\" element={<Dashboard />} />\n  </Route>\n  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>\n    <Route path=\"/admin\" element={<Admin />} />\n  </Route>\n</Routes>\n```\nAfter login, redirect back to `location.state.from`. In Next.js, use middleware for route protection."
      },
      {
        "id": "122",
        "n": 125,
        "q": "How do you handle pagination when the backend returns thousands of records?",
        "a": "- Ask the backend for **server-side pagination** (`?page=&limit=` or cursor-based `?after=`), returning items + total/next cursor. Don't load thousands of records at once.\n- Keep page/filter/sort in the URL so links and refresh work.\n- Cache visited pages (RTK Query/React Query), prefetch the next page, keep previous data while loading (`keepPreviousData`).\n- Server-side filtering/sorting so pagination stays correct.\n- If you must load everything: virtualization + client-side pagination, maybe in a Web Worker.\n- Cursor pagination avoids duplicates/missing rows when data changes between pages."
      },
      {
        "id": "123",
        "n": 126,
        "q": "What happens if the user clicks the Submit button multiple times before the API responds?",
        "a": "Each click can send a new request → duplicate orders/records, race conditions, inconsistent UI.\nPrevent it:\n- Disable the button and show a spinner while submitting (`isSubmitting`).\n- Guard with a ref (state updates are async, so a fast double click can slip through):\n```jsx\nconst submittingRef = useRef(false);\nasync function handleSubmit() {\n  if (submittingRef.current) return;\n  submittingRef.current = true;\n  setSubmitting(true);\n  try { await api.createOrder(form); }\n  finally { submittingRef.current = false; setSubmitting(false); }\n}\n```\n- Debounce/throttle the handler.\n- Backend: **idempotency key** so duplicate requests are processed once."
      },
      {
        "id": "124",
        "n": 127,
        "q": "How would you handle a slow API response in production?",
        "a": "- First **measure** where it's slow (network tab, APM, backend logs) and work with the backend: indexes, caching, pagination, smaller payloads.\n- Frontend UX: skeletons, progressive loading, optimistic updates, show cached/stale data while revalidating.\n- Set **timeouts** with clear messages and a retry option; retry with backoff for transient errors.\n- Cache responses; prefetch; avoid blocking the whole page — load sections independently with Suspense boundaries.\n- Cancel outdated requests; move long jobs to async processing with polling/websockets.\n- Monitor with RUM/Sentry/New Relic and alert on latency."
      },
      {
        "id": "125",
        "n": 128,
        "q": "How do you handle race conditions when multiple API calls update the same component?",
        "a": "A race condition happens when an older, slower response arrives after a newer one and overwrites it (e.g. typing \"re\" then \"react\" — \"re\" results show last).\nFixes:\n- **Abort** the previous request on change (AbortController in effect cleanup).\n- **Ignore stale responses** with a flag or request id:\n```jsx\nuseEffect(() => {\n  let ignore = false;\n  search(query).then(res => { if (!ignore) setResults(res); });\n  return () => { ignore = true; };\n}, [query]);\n```\n- Libraries: RTK Query/React Query (keyed by query), redux-saga `takeLatest`, RxJS `switchMap`.\n- For mutations, use optimistic updates with rollback and server versions/timestamps."
      }
    ]
  },
  {
    "title": "Frontend architecture & senior-level topics",
    "items": [
      {
        "id": "126",
        "n": 129,
        "q": "What is Microfrontend architecture?",
        "a": "Micro-frontend architecture splits a large frontend into smaller, **independently developed and deployed** apps, each owned by a team (e.g. Catalog, Cart, Account), composed into one product by a **shell/host** app.\nImplementation options:\n- **Webpack 5 Module Federation** (most common) — load remote modules at runtime.\n- single-spa, iframes, Web Components, or build-time integration via npm packages.\nBenefits: independent deploys, team autonomy, smaller codebases, incremental migration (e.g. Angular → React). Costs: complexity, duplicated dependencies, consistent UX/design system, shared state and routing, performance overhead."
      },
      {
        "id": "127",
        "n": 130,
        "q": "When would you choose Microfrontends over a monolithic frontend?",
        "a": "Choose micro-frontends when:\n- **Multiple teams** work on a large product and need independent release cycles.\n- Domains are clearly separable (checkout, search, profile).\n- You need **incremental migration** of a legacy app or mixed frameworks.\n- Different parts scale or change at very different rates.\nStay with a (well-modularized) monolith when the team is small, the app is medium-sized, or features are tightly coupled — micro-frontends add infra, versioning and performance overhead that's not worth it there."
      },
      {
        "id": "128",
        "n": 131,
        "q": "How do you share common components and libraries between Microfrontends?",
        "a": "- **Shared design system / component library** published as a versioned npm package (often in a monorepo with Nx/Turborepo + Storybook).\n- **Module Federation `shared`** config to share singletons like `react`, `react-dom`, `react-router` (same version, `singleton: true`) so they're loaded once.\n- Expose common components/utilities from a remote (\"shared\" app) and consume at runtime.\n- Shared design tokens/CSS variables for consistent styling.\n- Communication via props from the shell, custom events, or a small shared event bus — avoid tightly coupled global stores.\n- Semantic versioning and contracts to avoid breaking other teams."
      },
      {
        "id": "129",
        "n": 132,
        "q": "What is the difference between CSR, SSR, and SSG?",
        "a": "- **CSR (Client-Side Rendering)**: server sends a mostly empty HTML + JS bundle; browser builds the UI. Slower first paint, weaker SEO, but rich interactivity and cheap hosting (Create React App / Vite SPA).\n- **SSR (Server-Side Rendering)**: HTML is generated **on each request** on the server, then hydrated in the browser. Fast first paint, good SEO, always fresh data; higher server cost and TTFB.\n- **SSG (Static Site Generation)**: HTML generated **at build time** and served from a CDN. Fastest, cheapest; data can go stale — use **ISR** (Incremental Static Regeneration) to re-generate periodically.\nNext.js lets you mix these per page/route."
      },
      {
        "id": "130",
        "n": 133,
        "q": "What is hydration in React/Next.js?",
        "a": "Hydration is the process where React, on the client, takes the HTML rendered on the server and **attaches event listeners and state** to it, making it interactive — instead of rebuilding the DOM from scratch. (`hydrateRoot` in React 18.)\n- The client render must produce the **same markup** as the server, otherwise you get hydration mismatch warnings (common causes: `Date.now()`, `Math.random()`, `window` checks, locale formatting during render). Move browser-only logic into `useEffect`.\n- React 18 supports **selective/streaming hydration** with Suspense; Next.js App Router uses **Server Components** that don't need hydration at all, reducing JS shipped."
      },
      {
        "id": "131",
        "n": 134,
        "q": "How would you design a scalable React application?",
        "a": "- **Feature-based folder structure** with clear boundaries.\n- Reusable **design system** components; consistent styling approach.\n- Clear **state strategy**: server state (RTK Query/React Query), global client state (Redux/Zustand), local state, URL state.\n- Central **API layer** (axios instance, interceptors, typed services).\n- **TypeScript**, ESLint, Prettier, Husky pre-commit hooks.\n- **Routing** with lazy-loaded routes; code splitting.\n- **Testing**: Jest + React Testing Library, Cypress/Playwright E2E.\n- Error handling (Error Boundaries, logging), performance budgets, accessibility.\n- CI/CD, environment configs, feature flags, monitoring (Sentry, analytics).\n- Documentation (Storybook, README, ADRs)."
      },
      {
        "id": "132",
        "n": 135,
        "q": "How would you structure a large React project?",
        "a": "Feature-based (domain) structure scales better than grouping by file type:\n```\nsrc/\n  app/            # store setup, providers, router\n  features/\n    auth/         # components, hooks, slice, api, types, tests for auth\n    orders/\n    products/\n  components/     # shared UI (Button, Modal, Table) – design system\n  hooks/          # shared hooks (useDebounce, useMediaQuery)\n  services/       # api client, interceptors\n  utils/          # helpers, formatters\n  constants/\n  types/\n  assets/\n  styles/\n```\nPrinciples: colocate files that change together; each feature exposes a public `index.ts`; avoid deep cross-feature imports; absolute import aliases (`@/features/...`)."
      },
      {
        "id": "133",
        "n": 136,
        "q": "How do you manage common API services across multiple modules?",
        "a": "- Create a **single API client** (axios instance) with base URL, timeout, default headers, and **interceptors** for auth token, refresh on 401, global error handling, and logging.\n- Wrap endpoints in **service modules** per domain (`userService.getUser(id)`), so components never build URLs directly.\n- Or use **RTK Query** `createApi` with `injectEndpoints` so each module adds its own endpoints to one shared API.\n- Environment-specific config via `.env`; typed request/response models (TypeScript); consistent error format.\n```js\nexport const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 15000 });\napi.interceptors.request.use(cfg => { cfg.headers.Authorization = `Bearer ${getToken()}`; return cfg; });\nexport const userService = { getUser: id => api.get(`/users/${id}`).then(r => r.data) };\n```"
      },
      {
        "id": "134",
        "n": 137,
        "q": "How do you handle application-wide error management?",
        "a": "Layered approach:\n- **Error Boundaries** at app level and around risky widgets/routes for render errors, with a friendly fallback + retry.\n- **API errors**: axios interceptor normalizes errors, handles 401 (refresh/logout), 403 (unauthorized page), 500 (toast); per-request handling in components where needed.\n- **Async/event handler errors**: try/catch; `window.onerror` and `unhandledrejection` listeners as a safety net.\n- **User feedback**: toasts, inline form errors, retry buttons; never show raw stack traces.\n- **Logging/monitoring**: Sentry/Datadog with user context, release version and source maps.\n- Form validation (Zod/Yup) to prevent invalid requests."
      },
      {
        "id": "135",
        "n": 138,
        "q": "How do you implement role-based access control?",
        "a": "- Backend returns the user's **roles/permissions** after login (in the token or a `/me` endpoint).\n- Store them in Auth context/Redux; prefer **permission-based** checks (`orders:edit`) over hard-coded role names.\n- **Route level**: `ProtectedRoute` with `allowedRoles`/`requiredPermission`.\n- **Component level**: a `<Can>` component or `usePermission()` hook to show/hide/disable buttons and menu items.\n```jsx\nfunction Can({ permission, children, fallback = null }) {\n  const { permissions } = useAuth();\n  return permissions.includes(permission) ? children : fallback;\n}\n<Can permission=\"user:delete\"><DeleteButton /></Can>\n```\n- Build menus/navigation from a config filtered by permission.\n- The **backend must enforce** every permission — frontend RBAC is UX only."
      },
      {
        "id": "136",
        "n": 139,
        "q": "How do you debug a React application with high CPU utilization?",
        "a": "1. **Reproduce** and open Chrome DevTools **Performance** tab — record, look for long tasks, which functions use the most scripting time (flame chart).\n2. **React DevTools Profiler** — find components re-rendering too often or taking long, and why.\n3. Common culprits: infinite re-render loops (effect setting state it depends on), unthrottled scroll/resize/mousemove handlers, `setInterval` without cleanup, huge lists without virtualization, heavy computations every render, animations via JS instead of CSS, polling too frequently, memory leaks causing GC pressure.\n4. Fix: memoize, throttle/debounce, virtualize, move heavy work to a Web Worker, use `useTransition`/`useDeferredValue`, clean up effects.\n5. Verify with the profiler again and add monitoring."
      },
      {
        "id": "137",
        "n": 140,
        "q": "How do you identify and fix a memory leak?",
        "a": "**Identify**: Chrome DevTools **Memory** tab — take heap snapshots before/after repeating an action (e.g. open/close a page) and compare; look for growing **Detached DOM nodes** and objects that should have been freed. The Performance monitor shows JS heap growth over time.\n**Common causes in React apps**:\n- Event listeners, intervals, timeouts, subscriptions, WebSockets not cleaned up.\n- Async calls setting state after unmount (cancel with AbortController).\n- Global variables/caches growing forever; closures holding big objects.\n- Third-party libraries (charts, maps) not destroyed on unmount.\n**Fix**: return cleanup functions from `useEffect`, remove listeners, `destroy()` library instances, bound caches (LRU, WeakMap), then re-check with snapshots."
      },
      {
        "id": "138",
        "n": 141,
        "q": "How do you approach performance monitoring after deploying an application?",
        "a": "- **Real User Monitoring**: track **Core Web Vitals** (LCP, INP, CLS, plus TTFB/FCP) with the `web-vitals` library and send to analytics (GA4, Datadog RUM, New Relic).\n- **Error monitoring**: Sentry with source maps, release tracking and alerts.\n- **Synthetic monitoring**: Lighthouse CI in the pipeline with performance budgets; scheduled checks.\n- Monitor API latency/error rates (APM) and bundle size per release.\n- Dashboards + alerts; compare releases; fix regressions with profiling.\n- React `<Profiler>` API for specific critical components if needed."
      },
      {
        "id": "139",
        "n": 142,
        "q": "How do you implement accessibility in React?",
        "a": "- Use **semantic HTML** (`button`, `nav`, `main`, `label`, headings in order) instead of clickable `div`s.\n- Every input has a `<label htmlFor>` (`htmlFor` in JSX); images have meaningful `alt` text.\n- **Keyboard support**: everything reachable with Tab, visible focus styles, Escape closes modals, manage focus (move focus into modals and trap it, restore on close) with refs.\n- **ARIA** only when needed: `aria-label`, `aria-expanded`, `aria-live` for dynamic messages, `role=\"alert\"`.\n- Sufficient color contrast; don't rely on color alone.\n- Tools: `eslint-plugin-jsx-a11y`, axe DevTools, Lighthouse, screen reader testing (NVDA/VoiceOver), React Testing Library queries by role.\n- Accessible component libraries (Radix UI, Headless UI, MUI). Target WCAG 2.1 AA."
      },
      {
        "id": "140",
        "n": 143,
        "q": "How do you use browser DevTools to debug rendering and performance problems?",
        "a": "- **Elements panel**: inspect DOM/CSS, see layout shifts, force states (:hover).\n- **Performance panel**: record an interaction; find long tasks (>50 ms), layout thrashing (\"forced reflow\"), heavy scripting, and paint events. Use CPU throttling to simulate slow devices.\n- **Rendering tab**: Paint flashing, Layout Shift Regions, FPS meter.\n- **Network panel**: slow/duplicate requests, waterfall, large bundles, caching; throttle to 3G.\n- **Memory panel**: heap snapshots for leaks.\n- **Lighthouse**: overall performance/accessibility audit.\n- **React DevTools**: Components tab (props/state/hooks), Profiler (render time and why each component rendered), highlight updates.\n- Sources panel: breakpoints, conditional breakpoints, logpoints."
      }
    ]
  },
  {
    "title": "Project & behavioural questions",
    "items": [
      {
        "id": "141",
        "n": 144,
        "q": "Explain your current project architecture.",
        "a": "Prepare a 2–3 minute structured answer about your real project:\n- **Business context**: what the product does, who uses it, scale (users, modules).\n- **Frontend stack**: React + TypeScript, state management (Redux Toolkit / RTK Query), routing, UI library, styling, build tool (Vite/Webpack), testing.\n- **Architecture**: folder structure, micro-frontends or monolith, shared component library, API layer with interceptors, auth (JWT/SSO).\n- **Backend & infra**: REST/GraphQL APIs, microservices, cloud (AWS/Azure), CI/CD, environments.\n- **Data flow**: UI → API service → backend → DB, and back.\nDraw it on a whiteboard if possible and mention one design decision you made and why."
      },
      {
        "id": "142",
        "n": 145,
        "q": "What is your role and responsibility in the project?",
        "a": "Answer with specifics and ownership, e.g.:\n- Developing features end-to-end on the frontend: understanding requirements, breaking them into tasks, building reusable components and API integration.\n- Technical ownership of a module (name it), code reviews, defining coding standards.\n- Performance improvements, bug fixing, production support.\n- Collaborating with backend, QA, designers, product owners; sprint planning, estimation in Agile/Scrum.\n- Mentoring juniors, onboarding, documentation.\nUse numbers where you can (\"reduced load time by 40%\", \"led a team of 3\")."
      },
      {
        "id": "143",
        "n": 146,
        "q": "Explain the complete flow of one feature, from the UI to the backend API.",
        "a": "Pick a real feature (e.g. \"create order\") and walk through:\n1. **UI**: form component with validation (React Hook Form + Zod), state management.\n2. **Action**: on submit → dispatch thunk / RTK Query mutation; button disabled, loading shown.\n3. **API layer**: axios instance adds auth token via interceptor → `POST /api/orders`.\n4. **Backend**: API gateway → auth middleware validates JWT → controller → service with business logic → DB transaction; returns response/status code.\n5. **Response handling**: success → update cache/store (invalidate tags), toast, navigate; error → show message, log to Sentry.\n6. **Cross-cutting**: permissions, error handling, tests (unit + E2E), monitoring."
      },
      {
        "id": "144",
        "n": 147,
        "q": "What was the most challenging technical problem you faced?",
        "a": "Use the **STAR** format (Situation, Task, Action, Result). Example outline:\n- **Situation**: a dashboard page with 10,000+ rows froze for several seconds / a production memory leak / complex form with dynamic validation.\n- **Task**: what you were responsible for.\n- **Action**: how you investigated (Profiler, heap snapshots, logs), options you considered, what you implemented (virtualization, memoization, pagination with backend, refactor).\n- **Result**: measurable outcome (\"render time from 4s to 300ms\", \"zero crash reports since\") and what you learned.\nPick a story that shows technical depth and ownership."
      },
      {
        "id": "145",
        "n": 148,
        "q": "Have you improved the performance of an existing application?",
        "a": "Have a concrete story:\n- **Measured** first: Lighthouse, Web Vitals, React Profiler, bundle analyzer.\n- **Changes** (pick yours): route-based code splitting and lazy loading; removed/replaced heavy libraries (moment → dayjs, full lodash → per-method imports); virtualization for big tables; memoized expensive components/selectors; API caching with RTK Query and fewer duplicate calls; image optimization; debounced search.\n- **Result** with numbers: \"bundle 2.1MB → 900KB\", \"LCP 4.2s → 1.8s\", \"Lighthouse 55 → 90\".\n- How you kept it from regressing: performance budgets in CI, monitoring."
      },
      {
        "id": "146",
        "n": 149,
        "q": "How did you identify and resolve a production issue?",
        "a": "STAR story, e.g.:\n- **Detection**: alert from Sentry/monitoring or user reports (e.g. blank page for some users after a release).\n- **Triage**: check impact and severity, reproduce in the same browser/env, read logs and error traces with source maps, check what changed in the last release.\n- **Root cause**: e.g. an API returned `null` for an optional field and the UI called `.map` on it; or a cached old chunk caused \"ChunkLoadError\" after deploy.\n- **Fix**: hotfix or rollback first to restore service, then proper fix with tests.\n- **Prevention**: defensive checks / schema validation, Error Boundary, added test case, RCA document, monitoring alert."
      },
      {
        "id": "147",
        "n": 150,
        "q": "How do you handle a production bug reported by a client?",
        "a": "1. **Acknowledge** quickly, gather details: steps, environment, browser, user, screenshots, time.\n2. **Assess severity/impact** (P1 blocks business → immediate response; minor → plan in sprint).\n3. **Reproduce** (same data/role/browser), check logs, Sentry, network traces.\n4. Find the **root cause**; for critical issues, apply a hotfix or rollback / feature flag off.\n5. Test the fix (QA, regression), deploy through the proper pipeline.\n6. **Communicate** status and ETA to the client throughout.\n7. **RCA** and preventive action: tests, monitoring, process change."
      },
      {
        "id": "148",
        "n": 151,
        "q": "What would you do if a client requested a last-minute change during UAT?",
        "a": "- Understand the request and **why** it's needed (business urgency).\n- Analyse **impact**: effort, risk, affected areas, testing needed, effect on the release date.\n- Communicate options to the client/PO: include it now with a revised timeline, ship it in a fast follow-up release, or release behind a **feature flag**.\n- Get a decision from the product owner/stakeholders — don't silently absorb scope.\n- If accepted: follow change management, update estimates, ensure regression testing, document it.\nShow that you balance flexibility with quality and transparency."
      },
      {
        "id": "149",
        "n": 152,
        "q": "How do you handle code reviews?",
        "a": "**As a reviewer**:\n- Check correctness, readability, edge cases, error handling, performance (re-renders, unnecessary API calls), security (XSS, secrets), accessibility, tests, and adherence to standards.\n- Keep comments constructive and specific; explain *why*; distinguish blocking issues from suggestions (\"nit:\"); praise good solutions.\n- Review small PRs promptly.\n**As an author**: small focused PRs, clear description and screenshots, self-review first, respond openly to feedback.\nAutomate the trivial stuff (ESLint, Prettier, type checks, tests in CI) so humans focus on logic and design."
      },
      {
        "id": "150",
        "n": 153,
        "q": "How do you ensure code quality across a development team?",
        "a": "- **Standards**: documented coding guidelines, TypeScript strict mode, ESLint + Prettier, consistent folder structure.\n- **Automation**: Husky + lint-staged pre-commit hooks; CI that runs lint, type-check, unit tests, build; SonarQube for code smells/coverage.\n- **Testing**: unit (Jest/Vitest + React Testing Library), E2E (Cypress/Playwright), coverage targets for critical areas.\n- **Process**: mandatory PR reviews, PR templates, definition of done.\n- **Reusability**: shared component library + Storybook.\n- **Knowledge sharing**: tech talks, pairing, documentation, ADRs; tracking tech debt."
      },
      {
        "id": "151",
        "n": 154,
        "q": "How do you handle disagreements about technical implementation?",
        "a": "- Listen to the other person's reasoning fully; focus on the problem, not the person.\n- Compare options with **objective criteria**: requirements, performance, maintainability, team familiarity, timeline, cost.\n- Back arguments with data — build a quick POC, benchmark, or reference docs/best practices.\n- If still no agreement, involve the tech lead/architect and **commit to the decision** once made (\"disagree and commit\").\n- Document the decision (ADR).\nGive a short real example if you have one."
      },
      {
        "id": "152",
        "n": 155,
        "q": "How do you estimate development effort?",
        "a": "- Clarify requirements and acceptance criteria first; break the feature into small tasks (UI, API integration, state, validation, tests, edge cases).\n- Estimate each task using past experience/similar work; in Agile, use **story points** (Planning Poker) relative to reference stories.\n- Add time for code review, testing, bug fixing, and **buffer for unknowns/risks**; do a spike if something is new.\n- Consider dependencies (backend APIs, design).\n- Communicate assumptions; re-estimate when scope changes; track actual vs estimate to improve."
      },
      {
        "id": "153",
        "n": 156,
        "q": "Have you mentored junior developers?",
        "a": "Give concrete examples:\n- Onboarding new joiners: walking through architecture, setup, coding standards.\n- Detailed, educational code reviews; pair programming on tough tasks.\n- Assigning progressively harder tasks and being available for questions.\n- Knowledge sessions (hooks, Redux Toolkit, testing), writing docs/guides.\n- Result: \"two juniors became independent on module X within 3 months\".\nIf you haven't formally, describe informal mentoring and your approach."
      },
      {
        "id": "154",
        "n": 157,
        "q": "How do you decide whether to use an existing library or build a custom solution?",
        "a": "Evaluate:\n- **Requirements fit**: does the library solve our case fully, or would we fight it?\n- **Quality and health**: maintenance activity, community, open issues, documentation, TypeScript support.\n- **Cost**: bundle size, performance, license (MIT vs GPL/commercial), security vulnerabilities.\n- **Customization** needs and long-term maintenance cost of a custom build.\n- **Time-to-market** and team familiarity.\nRule of thumb: use well-maintained libraries for solved, complex problems (dates, forms, data fetching, charts, accessibility primitives); build custom when the need is small/simple or core to the business and the library would add a lot of weight. Wrap third-party libraries behind your own interface so they can be replaced."
      }
    ]
  },
  {
    "title": "TypeScript & Next.js",
    "items": [
      {
        "id": "155",
        "n": 158,
        "q": "What is the difference between interface and type?",
        "a": "Both describe object shapes and are mostly interchangeable for objects.\n- **interface**: only object shapes; can be **extended** with `extends` and **merged** by re-declaring (declaration merging — useful for augmenting libraries); classes can `implements` them.\n- **type**: can describe anything — **unions**, intersections, primitives, tuples, mapped and conditional types (`type Status = 'idle' | 'loading'`); can't be re-opened.\n```ts\ninterface User { id: number; name: string }\ninterface Admin extends User { role: 'admin' }\n\ntype ID = string | number;\ntype AdminT = User & { role: 'admin' };\n```\nCommon convention: `interface` for object/props/public API shapes, `type` for unions and utility compositions."
      },
      {
        "id": "156",
        "n": 159,
        "q": "What is the difference between any and unknown?",
        "a": "- **any**: turns off type checking — you can do anything with it, and it spreads silently. Unsafe.\n- **unknown**: the type-safe counterpart: any value can be assigned to it, but you **must narrow it** (typeof, instanceof, type guard) before using it.\n```ts\nlet a: any = JSON.parse(text);\na.foo.bar();               // compiles, may crash at runtime\n\nlet u: unknown = JSON.parse(text);\n// u.foo;                  // error\nif (typeof u === 'object' && u !== null && 'foo' in u) { /* safe */ }\n```\nUse `unknown` for API responses, `catch (e)` errors, and third-party input; validate with a schema library (Zod)."
      },
      {
        "id": "157",
        "n": 160,
        "q": "Explain Partial, Required, Pick and Omit.",
        "a": "Built-in utility types that transform other types:\n```ts\ninterface User { id: number; name: string; email?: string }\n\ntype A = Partial<User>;          // all optional: { id?; name?; email? }  — e.g. update payloads\ntype B = Required<User>;         // all required, email no longer optional\ntype C = Pick<User, 'id' | 'name'>;   // only id and name\ntype D = Omit<User, 'email'>;    // everything except email\n```\nOthers worth mentioning: `Readonly<T>`, `Record<K, V>`, `ReturnType<F>`, `Parameters<F>`, `Exclude`, `Extract`, `NonNullable`, `Awaited`."
      },
      {
        "id": "158",
        "n": 161,
        "q": "How do you define props for a TypeScript functional component?",
        "a": "```tsx\ninterface ButtonProps {\n  label: string;\n  variant?: 'primary' | 'secondary';      // optional with union\n  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;\n  children?: React.ReactNode;\n}\n\nfunction Button({ label, variant = 'primary', onClick, children }: ButtonProps) {\n  return <button className={variant} onClick={onClick}>{label}{children}</button>;\n}\n\n// extend native element props\ntype InputProps = React.ComponentPropsWithoutRef<'input'> & { label: string };\n\n// generic component\nfunction List<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {\n  return <ul>{items.map(render)}</ul>;\n}\n```\n`React.FC` is optional; most teams type props directly. Use `React.ReactNode` for children."
      },
      {
        "id": "159",
        "n": 162,
        "q": "What is the difference between React.js and Next.js?",
        "a": "- **React** is a UI **library**: components and rendering. You choose routing, data fetching, bundling, SSR setup yourself; typically a client-rendered SPA.\n- **Next.js** is a **framework** built on React that adds: file-based routing, SSR/SSG/ISR, React Server Components, API routes/route handlers, server actions, image/font/script optimization, middleware, built-in code splitting, and easy deployment (Vercel or Node).\nNext.js gives better SEO and initial load and full-stack capability; plain React (Vite) is simpler for internal dashboards or apps behind login where SEO doesn't matter."
      },
      {
        "id": "160",
        "n": 163,
        "q": "What is the difference between App Router and Pages Router?",
        "a": "- **Pages Router** (`pages/` dir, older): each file is a route; data fetching with `getServerSideProps`, `getStaticProps`, `getStaticPaths`; all components are client components; layouts via `_app.js`/`_document.js`; API routes in `pages/api`.\n- **App Router** (`app/` dir, Next 13+, recommended): built on **React Server Components** (server by default, `'use client'` to opt in); nested **layouts** (`layout.js`), `loading.js` and `error.js` per segment; data fetching with `async` components and `fetch` caching options; streaming with Suspense; **Server Actions**; route handlers (`route.js`).\nApp Router ships less JS and gives more flexible layouts; Pages Router is simpler and still supported."
      },
      {
        "id": "161",
        "n": 164,
        "q": "What is server-side rendering?",
        "a": "Server-side rendering generates the page's HTML **on the server for each request**, sends it to the browser (so content is visible immediately), then React **hydrates** it to make it interactive.\n- **Pros**: faster first contentful paint, better SEO and social previews, data is fresh per request, works on slow devices.\n- **Cons**: more server load and cost, slower TTFB than static, hydration cost, need to handle browser-only APIs carefully.\nIn Next.js: Pages Router `getServerSideProps`; App Router — server components with dynamic data (`cache: 'no-store'` / `dynamic = 'force-dynamic'`)."
      },
      {
        "id": "162",
        "n": 165,
        "q": "What is dynamic routing in Next.js?",
        "a": "Routes with variable segments, defined by brackets in the file name:\n- App Router: `app/products/[id]/page.js` → `/products/123`; access with `params` prop (`params.id`) or `useParams()` in client components.\n- Catch-all: `[...slug]` (`/docs/a/b`), optional catch-all: `[[...slug]]`.\n- Pages Router: `pages/products/[id].js` with `useRouter().query.id`.\n- Pre-generate pages at build time with `generateStaticParams` (App Router) or `getStaticPaths` (Pages Router).\n```jsx\n// app/products/[id]/page.js\nexport default async function Product({ params }) {\n  const { id } = await params;   // params is a promise in Next 15+\n  const product = await getProduct(id);\n  return <h1>{product.title}</h1>;\n}\n```"
      },
      {
        "id": "163",
        "n": 166,
        "q": "How do you handle API routes in Next.js?",
        "a": "- **Pages Router**: files in `pages/api/` become endpoints: `export default function handler(req, res) { res.status(200).json({...}) }`.\n- **App Router**: **Route Handlers** in `app/api/.../route.js` exporting functions per HTTP method:\n```js\n// app/api/users/route.js\nexport async function GET(request) {\n  const users = await db.user.findMany();\n  return Response.json(users);\n}\nexport async function POST(request) {\n  const body = await request.json();\n  const user = await db.user.create({ data: body });\n  return Response.json(user, { status: 201 });\n}\n```\nThey run on the server (Node or Edge runtime), so you can use secrets, DB access, and act as a BFF/proxy. For form mutations, **Server Actions** are an alternative. Add auth checks, validation and error handling."
      },
      {
        "id": "164",
        "n": 167,
        "q": "How does Next.js improve SEO?",
        "a": "- **Pre-rendered HTML** (SSR/SSG/ISR): crawlers see full content immediately instead of an empty `div` waiting for JS.\n- **Metadata API** (`export const metadata` / `generateMetadata`) or `next/head`: titles, descriptions, Open Graph/Twitter tags, canonical URLs per page.\n- **Performance / Core Web Vitals** (ranking factor): automatic code splitting, `next/image` (lazy, responsive, modern formats), `next/font` (no layout shift), `next/script` strategies.\n- Clean, file-based URLs and dynamic routes; `sitemap.js` and `robots.js` generation; structured data (JSON-LD)."
      }
    ]
  },
  {
    "title": "Senior-level follow-ups",
    "items": [
      {
        "id": "d1",
        "n": "D1",
        "q": "When would you avoid useMemo?",
        "a": "Avoid `useMemo` when:\n- The calculation is cheap (simple math, short arrays, string concatenation) — the memo bookkeeping and dependency comparison can cost more than recomputing.\n- Dependencies change on almost every render, so the cache never hits.\n- The value isn't passed to a memoized child or used as a dependency (referential stability doesn't matter).\n- You're using it to \"fix\" a design problem — better to move state down, split components, or derive data differently.\nMemoize based on measurements (Profiler), not by default. The React Compiler (React 19) can auto-memoize, reducing the need for manual `useMemo`."
      },
      {
        "id": "d2",
        "n": "D2",
        "q": "Can React.memo still cause re-renders?",
        "a": "Yes. `React.memo` only does a **shallow props comparison**, so it still re-renders when:\n- A prop is a new object/array/function each render (inline `{}` / `[]` / arrow functions) — the most common case.\n- `children` is passed as JSX (new element each render).\n- The component's **own state** changes.\n- A **Context** it consumes changes (`useContext` bypasses memo).\n- A Redux `useSelector` value changes (or returns a new reference).\n- Its `key` changes (that's a remount).\nFix with `useMemo`/`useCallback` in the parent, passing primitives, or a custom compare function."
      },
      {
        "id": "d3",
        "n": "D3",
        "q": "How does React batching work internally?",
        "a": "- When you call `setState`, React doesn't render immediately; it **enqueues an update** on the component's Fiber with a priority **lane** (e.g. click = sync/discrete lane, transition = lower lane) and schedules a render for the root.\n- Updates scheduled in the same tick share the same render: React processes the update queue once, applying each update in order (functional updaters receive the previous result), then renders and commits once.\n- **React 17**: batching happened only inside React event handlers; updates in `setTimeout`/promises rendered one by one.\n- **React 18 (createRoot)**: **automatic batching** everywhere — events, timeouts, promises, native listeners — because updates are scheduled through the scheduler (microtask for sync lanes) rather than flushed synchronously.\n- `flushSync(() => setX(1))` forces an immediate synchronous render when you need the DOM updated right away.\nResult: fewer renders and no inconsistent intermediate UI."
      },
      {
        "id": "d4",
        "n": "D4",
        "q": "How would you optimize a page displaying 10,000 records?",
        "a": "- Don't send 10,000 rows if not needed — **server-side pagination/infinite scroll** with filtering and sorting on the backend.\n- If all are needed on the client: **virtualize** (react-window/TanStack Virtual) so only ~20–30 DOM rows exist.\n- `React.memo` rows with stable `key`s; pass ids and stable callbacks (`useCallback`); avoid inline objects.\n- Memoize filtering/sorting (`useMemo`), debounce search, use `useDeferredValue`/`useTransition` to keep typing responsive; move heavy processing to a Web Worker.\n- Normalize data and select per-row from the store to avoid re-rendering the whole list.\n- Cache data (RTK Query), skeleton loading, measure with the Profiler before/after."
      },
      {
        "id": "d5",
        "n": "D5",
        "q": "How would you structure Redux in a large application?",
        "a": "- Use **Redux Toolkit** with `configureStore` and **feature slices** (`features/orders/ordersSlice.ts`) — organize by domain, not by actions/reducers folders.\n- Keep only global client state in Redux; **server data in RTK Query** (one `createApi`, endpoints split with `injectEndpoints` per feature, tag-based invalidation).\n- **Normalize** collections with `createEntityAdapter`; store ids, not duplicated objects.\n- **Selectors** colocated with slices, memoized with `createSelector`; components never read raw state shape.\n- Typed hooks (`useAppDispatch`, `useAppSelector`) with TypeScript; `createAsyncThunk` or listener middleware for side effects.\n- Lazy-inject reducers for code-split features; avoid putting form/UI-local state in Redux; persist only what's needed (redux-persist with whitelist)."
      },
      {
        "id": "d6",
        "n": "D6",
        "q": "How would you debug an unexpected production re-render?",
        "a": "1. **Reproduce** in the production build (with source maps or a profiling build `react-dom/profiling`).\n2. **React DevTools Profiler**: record, enable \"Record why each component rendered\", find the component and the cause (props changed / hooks changed / parent rendered / context changed).\n3. Look for typical causes: unstable props (new objects/functions), context value recreated every render, selectors returning new references, effects that set state on every render (loops), changing `key` causing remounts, state stored too high.\n4. Use `why-did-you-render`, render-count logs, or React's `<Profiler onRender>` in production to capture data from real users.\n5. Fix (memoization, split context, stable selectors, move state down), add a test or monitoring, and verify the render count dropped."
      }
    ]
  }
];
