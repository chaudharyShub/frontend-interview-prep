/**
 * Track: React. Loaded on every page (see assets/js/app.js).
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
  "slug": "react",
  "title": "React",
  "description": "Core concepts, hooks, Redux, performance and data fetching, plus machine coding questions with a live preview.",
  "tabs": [
    {
      "slug": "theory",
      "title": "Theory",
      "sections": [
        {
          "title": "Core concepts",
          "items": [
            {
              "id": "1",
              "q": "What is React.js, and why do we use it?",
              "a": "React is an open-source JavaScript library (by Meta) for building user interfaces out of **reusable components**.\n- **Declarative**: you describe *what* the UI should look like for a given state; React figures out the DOM updates.\n- **Component-based**: UI is split into small, reusable, testable pieces.\n- **Efficient updates** via the Virtual DOM and reconciliation.\n- **Unidirectional data flow** makes state changes predictable.\n- Huge ecosystem (Redux, React Router, Next.js, React Native) and strong community."
            },
            {
              "id": "2",
              "q": "What is Virtual DOM? How does React update the actual DOM?",
              "a": "The Virtual DOM is a lightweight JavaScript object tree that represents the real DOM.\n- When state/props change, React re-runs the component and creates a **new** virtual tree.\n- It **diffs** the new tree against the previous one (reconciliation).\n- It computes the minimal set of changes and applies them to the real DOM in a batch (the **commit** phase).\nReal DOM operations (layout, paint) are expensive; JS object comparisons are cheap, so this keeps updates fast and lets you write code as if you re-render everything."
            },
            {
              "id": "3",
              "q": "Explain React reconciliation.",
              "a": "Reconciliation is the algorithm React uses to decide what changed between two renders. It uses heuristics to run in O(n) instead of O(n³):\n- **Different element type** (e.g. `<div>` → `<span>`, or `CompA` → `CompB`): tear down the old subtree (unmount, lose state) and build a new one.\n- **Same type**: keep the DOM node / component instance, only update changed attributes/props, then recurse into children.\n- **Lists**: children are matched by `key`, so items can be reordered, inserted or removed efficiently.\nSince React 16, reconciliation is done by **Fiber**, which splits the work into units that can be paused, prioritized and resumed (enables concurrent features like `useTransition`). Rendering is split into the **render phase** (pure, interruptible) and the **commit phase** (DOM mutations, synchronous)."
            },
            {
              "id": "4",
              "q": "What is the purpose of the key prop when rendering lists?",
              "a": "`key` gives each list item a stable identity so React can match items between renders.\n- Without keys React matches by position, so inserting at the top makes every item \"change\".\n- With keys React knows which item was added, removed or moved, and keeps the right component state and DOM node for each item.\nKeys must be **unique among siblings** and **stable** (e.g. a database id). They are not passed to the component as a prop.\n```jsx\n{users.map(u => <UserRow key={u.id} user={u} />)}\n```"
            },
            {
              "id": "5",
              "q": "Why should we avoid using array indexes as keys?",
              "a": "If the list can be **reordered, filtered, or have items inserted/removed**, index keys break identity: the item at index 0 is now a different item but has the same key.\nConsequences:\n- Wrong component **state** sticks to the wrong row (e.g. a checked checkbox or typed input \"jumps\" to another item).\n- Unnecessary re-renders / DOM updates for every item after the change.\nIndex keys are acceptable only when the list is static (never reordered/filtered) and items have no state. Otherwise use a stable unique id (or generate one when data is created, not during render)."
            },
            {
              "id": "6",
              "q": "What is the difference between functional and class components?",
              "a": "- **Class components**: ES6 classes extending `React.Component`, state in `this.state`, updated with `this.setState`, lifecycle methods (`componentDidMount`, etc.), need `this` binding.\n- **Functional components**: plain functions that take props and return JSX; use **Hooks** (`useState`, `useEffect`…) for state and side effects.\nWhy functional is preferred today:\n- Less boilerplate, no `this` confusion.\n- Logic reuse via custom hooks (instead of HOCs / render props).\n- Easier to test and better fit for concurrent React features.\nClasses are still required only for **Error Boundaries** (no hook equivalent yet)."
            },
            {
              "id": "7",
              "q": "Explain the component lifecycle methods.",
              "a": "Class component lifecycle has three phases:\n- **Mounting**: `constructor` → `static getDerivedStateFromProps` → `render` → `componentDidMount` (API calls, subscriptions).\n- **Updating** (props/state change): `getDerivedStateFromProps` → `shouldComponentUpdate` (return false to skip) → `render` → `getSnapshotBeforeUpdate` (e.g. read scroll position) → `componentDidUpdate(prevProps, prevState, snapshot)`.\n- **Unmounting**: `componentWillUnmount` (clean up timers, listeners, subscriptions).\n- **Error handling**: `static getDerivedStateFromError`, `componentDidCatch`.\nLegacy methods like `componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate` are deprecated (prefixed `UNSAFE_`)."
            },
            {
              "id": "8",
              "q": "How do lifecycle methods work in functional components?",
              "a": "Functional components use `useEffect` (and `useLayoutEffect`) to cover lifecycle behaviour:\n```jsx\nuseEffect(() => {\n  // componentDidMount\n  return () => { /* componentWillUnmount */ };\n}, []);\n\nuseEffect(() => {\n  // componentDidUpdate for `id` (also runs on mount)\n}, [id]);\n```\n- `shouldComponentUpdate` → `React.memo` (and `useMemo`).\n- `getSnapshotBeforeUpdate` / synchronous DOM reads → `useLayoutEffect`.\nMental model: think in terms of \"synchronise this effect with these values\", not lifecycle events."
            },
            {
              "id": "9",
              "q": "What is the difference between props and state?",
              "a": "- **Props**: inputs passed from parent to child. Read-only inside the child. Changing them is the parent's job.\n- **State**: data owned and managed inside the component; changing it (via `setState`/setter) triggers a re-render.\nBoth trigger re-renders when they change. Rule of thumb: if the data can be computed from props or other state, it should not be state at all (derive it during render)."
            },
            {
              "id": "10",
              "q": "What is the difference between controlled and uncontrolled components?",
              "a": "- **Controlled**: the form value lives in React state; the input shows `value` and updates through `onChange`. React is the single source of truth — easy validation, formatting, conditional disabling.\n- **Uncontrolled**: the DOM keeps the value; you read it with a `ref` when needed (`defaultValue` for initial value). Less code, fewer re-renders, good for simple forms or file inputs (`<input type=\"file\">` is always uncontrolled).\n```jsx\n// controlled\n<input value={name} onChange={e => setName(e.target.value)} />\n// uncontrolled\nconst ref = useRef();\n<input defaultValue=\"\" ref={ref} />  // read ref.current.value on submit\n```\nLibraries like React Hook Form use uncontrolled inputs for performance."
            },
            {
              "id": "11",
              "q": "What is prop drilling? How can you avoid it?",
              "a": "Prop drilling is passing props through several intermediate components that don't use them, just so a deeply nested child can get them. It makes code noisy and refactoring hard.\nWays to avoid it:\n- **Context API** for widely shared data (theme, user, locale).\n- **State management** library (Redux Toolkit, Zustand) for global/app state.\n- **Component composition**: pass components as `children` so the parent renders the deep child directly.\n- Move state closer to where it is used (colocation)."
            },
            {
              "id": "12",
              "q": "What is lifting state up?",
              "a": "Lifting state up means moving shared state to the **closest common parent** of the components that need it, then passing the value and an updater function down as props. This keeps a single source of truth so siblings stay in sync.\n```jsx\nfunction Parent() {\n  const [temp, setTemp] = useState('');\n  return <>\n    <CelsiusInput value={temp} onChange={setTemp} />\n    <FahrenheitView celsius={temp} />\n  </>;\n}\n```"
            },
            {
              "id": "13",
              "q": "How can a child component update the state of its parent?",
              "a": "The parent passes a **callback function** as a prop; the child calls it with new data.\n```jsx\nfunction Parent() {\n  const [msg, setMsg] = useState('');\n  return <Child onSend={setMsg} />;\n}\nfunction Child({ onSend }) {\n  return <button onClick={() => onSend('Hi from child')}>Send</button>;\n}\n```\nOther options: shared Context with a setter, or a global store (Redux). Data still flows down; events flow up."
            },
            {
              "id": "14",
              "q": "What is Context API? When would you prefer it over Redux?",
              "a": "Context provides a way to share values with a whole subtree without passing props at every level.\n```jsx\nconst ThemeContext = createContext('light');\n<ThemeContext.Provider value={theme}><App /></ThemeContext.Provider>\nconst theme = useContext(ThemeContext);\n```\n**Prefer Context** for low-frequency, app-wide values: theme, auth user, locale, feature flags, or small apps.\n**Prefer Redux** when state is large, updated frequently, shared by many components, needs middleware (async flows, logging), DevTools/time travel, or strict patterns for a big team.\nKey limitation: every consumer re-renders when the context value changes (no built-in selectors), so Context is not ideal for high-frequency updates."
            },
            {
              "id": "15",
              "q": "What is the difference between conditional rendering and directly manipulating the DOM?",
              "a": "- **Conditional rendering**: you decide in JSX what to render based on state (`{isOpen && <Modal/>}`, ternaries, early returns). React stays in control and keeps the virtual DOM and real DOM in sync.\n- **Direct DOM manipulation** (`document.getElementById(...).style.display = 'none'`): bypasses React. React doesn't know about the change, so the next render can overwrite it or get out of sync; it's imperative, harder to test and can cause bugs.\nUse refs for direct DOM access only for things React doesn't handle: focus, measuring size, scrolling, integrating third-party libraries."
            },
            {
              "id": "16",
              "q": "What are Higher Order Components (HOCs)?",
              "a": "A HOC is a function that takes a component and returns a new, enhanced component. It's a pattern for reusing logic.\n```jsx\nfunction withAuth(Component) {\n  return function Wrapped(props) {\n    const user = useUser();\n    if (!user) return <Navigate to=\"/login\" />;\n    return <Component {...props} user={user} />;\n  };\n}\nexport default withAuth(Dashboard);\n```\nExamples: `connect()` from React-Redux, `withRouter`. Downsides: \"wrapper hell\", prop name collisions, harder to type. Custom hooks have mostly replaced HOCs for logic reuse."
            },
            {
              "id": "17",
              "q": "What are React Fragments, and why do we use them?",
              "a": "Fragments let a component return multiple elements without adding an extra DOM node.\n```jsx\nreturn (\n  <>\n    <td>Name</td>\n    <td>Age</td>\n  </>\n);\n```\nWhy: keeps DOM clean, avoids breaking layouts (CSS grid/flex, tables where an extra `<div>` would be invalid). Use `<React.Fragment key={id}>` when you need a key in a list (the short syntax `<>` cannot take a key)."
            },
            {
              "id": "18",
              "q": "What is React.cloneElement()? Where would you use it?",
              "a": "`React.cloneElement(element, newProps, ...children)` creates a copy of a React element with extra/overridden props.\nUsed when a parent needs to inject props into the `children` it receives:\n```jsx\nfunction Tabs({ children, active, onSelect }) {\n  return React.Children.map(children, (child, i) =>\n    React.cloneElement(child, { isActive: i === active, onClick: () => onSelect(i) })\n  );\n}\n```\nUse cases: compound components (Tabs, RadioGroup), adding event handlers or classNames to children. Today it's considered legacy-ish; Context or render props are usually clearer."
            },
            {
              "id": "19",
              "q": "What are Error Boundaries? Can we implement them using functional components?",
              "a": "Error Boundaries are components that catch JavaScript errors during **rendering, lifecycle methods and constructors** of their child tree, log them, and show a fallback UI instead of crashing the whole app.\nThey must be **class components** (no hook equivalent):\n```jsx\nclass ErrorBoundary extends React.Component {\n  state = { hasError: false };\n  static getDerivedStateFromError() { return { hasError: true }; }\n  componentDidCatch(error, info) { logToService(error, info); }\n  render() { return this.state.hasError ? <h2>Something went wrong</h2> : this.props.children; }\n}\n```\nThey do **not** catch errors in event handlers, async code (setTimeout, promises), SSR, or in the boundary itself. With functional components you can use the `react-error-boundary` library, but it still uses a class internally."
            },
            {
              "id": "20",
              "q": "What are portals in React?",
              "a": "Portals render children into a DOM node **outside** the parent component's DOM hierarchy, while keeping them in the same React tree.\n```jsx\nreturn createPortal(<div className=\"modal\">...</div>, document.getElementById('modal-root'));\n```\nUse cases: modals, tooltips, dropdowns, toasts — to escape `overflow: hidden` or `z-index` stacking issues.\nContext still works, and events **bubble through the React tree** (to React parents), not the DOM tree."
            }
          ]
        },
        {
          "title": "Hooks",
          "items": [
            {
              "id": "21",
              "q": "What are React Hooks? Why were they introduced?",
              "a": "Hooks are functions (`useState`, `useEffect`, …) that let functional components use state, lifecycle-like effects, context, refs, etc. Introduced in React 16.8.\nWhy:\n- Reuse stateful logic without HOCs/render props (custom hooks).\n- Class components scattered related logic across lifecycle methods (setup in `componentDidMount`, cleanup in `componentWillUnmount`); hooks keep related code together.\n- Avoid `this` and binding confusion; less boilerplate; easier to optimize and test."
            },
            {
              "id": "22",
              "q": "What are the rules of Hooks?",
              "a": "1. **Only call hooks at the top level** — not inside loops, conditions, nested functions or after an early return.\n2. **Only call hooks from React functions** — functional components or custom hooks (not regular JS functions or classes).\nReason: React stores hook state in a list per component and identifies each hook by its **call order**. If the order changes between renders, state gets mixed up. Custom hooks must start with `use`. Enforced by `eslint-plugin-react-hooks`."
            },
            {
              "id": "23",
              "q": "Explain useState() with an example.",
              "a": "`useState` adds local state to a functional component. It returns the current value and a setter; calling the setter schedules a re-render.\n```jsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>Clicked {count} times</button>\n  );\n}\n```\n- Use the **functional update** `setCount(c => c + 1)` when the new value depends on the old.\n- **Lazy initial state**: `useState(() => expensiveCalc())` runs only on first render.\n- For objects/arrays, always create a new copy: `setUser(u => ({ ...u, name }))`."
            },
            {
              "id": "24",
              "q": "What is the difference between useState() and useRef()?",
              "a": "- **Re-render**: updating state triggers a re-render; changing `ref.current` does not.\n- **Update timing**: state updates are asynchronous/batched (new value visible on next render); ref changes are immediate and synchronous.\n- **Use for**: state = anything shown in the UI. Ref = DOM element access (focus, scroll, measure), and mutable values that must persist between renders without re-rendering (timer ids, previous value, \"is mounted\" flag, latest callback).\n```jsx\nconst inputRef = useRef(null);\n<input ref={inputRef} />;  inputRef.current.focus();\n```"
            },
            {
              "id": "25",
              "q": "What happens when you update a state variable using useState?",
              "a": "- The setter **schedules** an update; the variable does not change immediately in the current function (it's a constant for that render — logging it right after shows the old value).\n- React **batches** multiple updates (in React 18, automatically everywhere: events, timeouts, promises).\n- React re-renders the component with the new state, reconciles, and commits DOM changes.\n- If the new value is the same as the current one (`Object.is`), React bails out and skips re-rendering children.\n- Objects/arrays must be replaced, not mutated, or React won't detect the change."
            },
            {
              "id": "26",
              "q": "Does updating a useRef value trigger a re-render?",
              "a": "No. `useRef` returns the same mutable object `{ current }` on every render; changing `current` is just a plain mutation React doesn't track, so no re-render happens. The new value will show up in the UI only when something else causes a re-render. That's why refs are good for timer ids, previous values and DOM nodes, but not for data displayed on screen."
            },
            {
              "id": "27",
              "q": "Explain useEffect() and its execution lifecycle.",
              "a": "`useEffect` runs side effects (API calls, subscriptions, timers, manual DOM work, logging) **after** React has rendered and painted the screen.\nLifecycle:\n1. Component renders, DOM is updated, browser paints.\n2. Effect runs.\n3. On the next render, if dependencies changed: the previous effect's **cleanup** runs, then the new effect.\n4. On unmount: the cleanup runs.\n```jsx\nuseEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => clearInterval(id);   // cleanup\n}, []);\n```\nIn development with StrictMode (React 18), effects run mount → cleanup → mount once to help you find missing cleanups."
            },
            {
              "id": "28",
              "q": "What is the purpose of the dependency array in useEffect()?",
              "a": "The dependency array tells React **when to re-run** the effect: it compares each value with `Object.is` against the previous render.\n- No array → runs after every render.\n- `[]` → runs once after mount (cleanup on unmount).\n- `[a, b]` → runs on mount and whenever `a` or `b` change.\nInclude every reactive value (props, state, functions defined in the component) used inside the effect; otherwise you get stale values. Objects/functions created during render are new each time, so they trigger the effect every render — memoize them with `useMemo`/`useCallback` or move them inside the effect."
            },
            {
              "id": "29",
              "q": "What happens in the following three scenarios?",
              "code": "useEffect(() => {\n  console.log(\"Executed\");\n});\n\nuseEffect(() => {\n  console.log(\"Executed\");\n}, []);\n\nuseEffect(() => {\n  console.log(\"Executed\");\n}, [count]);",
              "a": "- **No dependency array** → logs \"Executed\" after **every** render (mount and every update).\n- **Empty array `[]`** → logs **once**, after the first render (mount). In dev StrictMode you may see it twice because React mounts, unmounts and re-mounts.\n- **`[count]`** → logs after the first render and then **every time `count` changes**."
            },
            {
              "id": "30",
              "q": "What is the cleanup function in useEffect()? When does it execute?",
              "a": "The cleanup is the function you return from `useEffect`. It undoes what the effect did (clear timers, remove listeners, unsubscribe, abort fetches).\nIt runs:\n- **Before the effect runs again** (when dependencies change) — with the *old* values.\n- **When the component unmounts.**\n```jsx\nuseEffect(() => {\n  const onResize = () => setWidth(window.innerWidth);\n  window.addEventListener('resize', onResize);\n  return () => window.removeEventListener('resize', onResize);\n}, []);\n```"
            },
            {
              "id": "31",
              "q": "How do you prevent memory leaks using useEffect()?",
              "a": "Always clean up what an effect starts:\n- Clear `setInterval` / `setTimeout`.\n- Remove event listeners, close WebSockets, unsubscribe from observables/stores.\n- Abort in-flight requests with `AbortController` so you don't set state on an unmounted component:\n```jsx\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch(`/api/users/${id}`, { signal: controller.signal })\n    .then(r => r.json()).then(setUser)\n    .catch(e => { if (e.name !== 'AbortError') setError(e); });\n  return () => controller.abort();\n}, [id]);\n```\n- Avoid holding large objects in closures/refs longer than needed."
            },
            {
              "id": "32",
              "q": "What is the difference between useEffect() and useLayoutEffect()?",
              "a": "- `useEffect` runs **asynchronously after the browser paints**. It doesn't block the screen — use it for most side effects (data fetching, subscriptions).\n- `useLayoutEffect` runs **synchronously after DOM mutations but before paint**. It blocks painting — use it when you must read layout (element size/position) and update synchronously to avoid flicker, e.g. positioning a tooltip, measuring, scroll restoration.\nPrefer `useEffect`; use `useLayoutEffect` only when you see visual flicker. `useLayoutEffect` doesn't run on the server (SSR warning)."
            },
            {
              "id": "33",
              "q": "What is useMemo()? When should you use it?",
              "a": "`useMemo` caches the **result** of a calculation between renders and recomputes only when dependencies change.\n```jsx\nconst filtered = useMemo(\n  () => products.filter(p => p.name.includes(search)),\n  [products, search]\n);\n```\nUse it when:\n- A calculation is genuinely expensive (big lists, sorting, heavy math).\n- You need a **stable reference** for an object/array passed to a `React.memo` child or used as an effect dependency.\nDon't wrap every value — memoization has its own cost and makes code harder to read."
            },
            {
              "id": "34",
              "q": "What is useCallback()? When should you use it?",
              "a": "`useCallback` caches a **function** definition between renders so it keeps the same reference until dependencies change. `useCallback(fn, deps)` ≈ `useMemo(() => fn, deps)`.\n```jsx\nconst handleDelete = useCallback(id => {\n  setItems(items => items.filter(i => i.id !== id));\n}, []);\n<Row onDelete={handleDelete} />   // Row is React.memo\n```\nUse it when passing callbacks to **memoized children**, or when the function is a dependency of `useEffect`/another hook. Without a memoized child it gives no benefit."
            },
            {
              "id": "35",
              "q": "What is the difference between React.memo(), useMemo(), and useCallback()?",
              "a": "- **`React.memo(Component)`**: a HOC that memoizes a **component** — skips re-rendering if props are shallowly equal to last time.\n- **`useMemo(() => value, deps)`**: memoizes a **computed value** inside a component.\n- **`useCallback(fn, deps)`**: memoizes a **function reference** inside a component.\nThey work together: `React.memo` on a child is useless if the parent passes a new object/function every render, so the parent uses `useMemo`/`useCallback` to keep those props stable."
            },
            {
              "id": "36",
              "q": "What is useReducer()? How is it different from useState()?",
              "a": "`useReducer` manages state with a reducer function `(state, action) => newState`, similar to Redux but local.\n```jsx\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'increment': return { count: state.count + 1 };\n    case 'reset': return { count: 0 };\n    default: return state;\n  }\n}\nconst [state, dispatch] = useReducer(reducer, { count: 0 });\ndispatch({ type: 'increment' });\n```\nPrefer it over `useState` when state is complex (many related fields), the next state depends on the previous in several ways, or you want update logic in one testable place. `dispatch` is stable, so it's easy to pass down (often combined with Context)."
            },
            {
              "id": "37",
              "q": "What are custom hooks? Have you created any in your project?",
              "a": "A custom hook is a function whose name starts with `use` and which calls other hooks. It extracts reusable stateful logic; each component calling it gets its own independent state.\n```jsx\nfunction useDebounce(value, delay = 300) {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const t = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(t);\n  }, [value, delay]);\n  return debounced;\n}\n```\nTypical examples to mention from projects: `useFetch`/`useApi`, `useDebounce`, `useLocalStorage`, `useAuth`, `usePagination`, `useWindowSize`, `useOnClickOutside`, `usePermissions`."
            },
            {
              "id": "38",
              "q": "Can we call a hook conditionally? Why not?",
              "a": "No. React identifies hooks by their **call order** on each render. If a hook is skipped in one render (inside `if`, loop, or after an early return), all following hooks shift position and get the wrong state, causing bugs or the error \"Rendered fewer hooks than expected\".\nInstead, call the hook unconditionally and put the condition **inside** it:\n```jsx\nuseEffect(() => {\n  if (!userId) return;\n  fetchUser(userId);\n}, [userId]);\n```\n(Exception: the new `use()` API in React 19 can be called conditionally.)"
            },
            {
              "id": "39",
              "q": "What is a stale closure in React?",
              "a": "A stale closure happens when a function (effect, callback, timer) captured variables from an **old render**, so it keeps seeing outdated state/props.\n```jsx\nuseEffect(() => {\n  const id = setInterval(() => setCount(count + 1), 1000); // always sees count = 0\n  return () => clearInterval(id);\n}, []);\n```\nFixes:\n- Functional updates: `setCount(c => c + 1)`.\n- Add the values to the dependency array.\n- Store the latest value in a `useRef` and read `ref.current`."
            },
            {
              "id": "40",
              "q": "How do you share logic between multiple components using custom hooks?",
              "a": "Move the shared logic (state + effects) into a custom hook and call it from every component that needs it. Each call gets its own isolated state — hooks share **logic**, not **state** (to share state, use Context or a store).\n```jsx\nfunction useFetch(url) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  useEffect(() => {\n    const c = new AbortController();\n    setLoading(true);\n    fetch(url, { signal: c.signal })\n      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })\n      .then(setData)\n      .catch(e => e.name !== 'AbortError' && setError(e))\n      .finally(() => setLoading(false));\n    return () => c.abort();\n  }, [url]);\n  return { data, loading, error };\n}\n// const { data, loading } = useFetch('/api/users');\n```"
            },
            {
              "id": "b1",
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
              "q": "What is Redux, and why do we need it?",
              "a": "Redux is a predictable state container: the whole app's global state lives in a single **store**, and it can only change by dispatching **actions** handled by pure **reducers**.\nWhy we need it:\n- Many components across the tree share and update the same data (user, cart, permissions).\n- Avoids prop drilling and scattered state.\n- Predictable, traceable updates (Redux DevTools, time-travel debugging, logging).\n- Middleware for async logic and side effects; clear patterns for large teams.\nNot every app needs it — server state is often better handled by RTK Query / React Query, and local UI state by `useState`."
            },
            {
              "id": "42",
              "q": "Explain the complete Redux data flow.",
              "a": "1. The user does something in the UI (clicks \"Add to cart\").\n2. The component **dispatches an action**: `dispatch({ type: 'cart/add', payload: item })`.\n3. The action passes through any **middleware** (thunk, saga, logger) — async work happens here.\n4. The store calls the **reducer** with `(currentState, action)`; the reducer returns a **new state** (immutably).\n5. The store saves the new state and notifies subscribers.\n6. Components subscribed via `useSelector` re-render only if the selected slice changed.\nData flows in one direction: **View → Action → (Middleware) → Reducer → Store → View**."
            },
            {
              "id": "43",
              "q": "What are Store, Actions, Reducers, and Dispatch?",
              "a": "- **Store**: the single object holding the app state. Created with `configureStore`; exposes `getState()`, `dispatch()`, `subscribe()`.\n- **Action**: a plain object describing what happened: `{ type: 'todos/added', payload: {...} }`. Action creators are functions that return actions.\n- **Reducer**: a pure function `(state, action) => newState`. No side effects, no mutation (RTK uses Immer so \"mutating\" code is safe), no API calls.\n- **Dispatch**: the method used to send an action to the store: `store.dispatch(action)` / `useDispatch()` in components. It's the only way to trigger a state change."
            },
            {
              "id": "44",
              "q": "What is Redux middleware?",
              "a": "Middleware sits between dispatching an action and the moment it reaches the reducer. It can inspect, modify, delay, log, cancel actions, or dispatch other actions — the standard place for side effects.\nSignature: `store => next => action => { ...; return next(action); }`\n```js\nconst logger = store => next => action => {\n  console.log('dispatching', action);\n  const result = next(action);\n  console.log('next state', store.getState());\n  return result;\n};\n```\nCommon middleware: **redux-thunk** (async logic; included by default in RTK), **redux-saga**, redux-logger, RTK Query middleware, custom middleware for analytics or auth-token refresh."
            },
            {
              "id": "45",
              "q": "What is the difference between Redux Thunk and Redux Saga?",
              "a": "- **Redux Thunk**: lets you dispatch a **function** instead of an object. The function receives `dispatch` and `getState` and can do async work with promises/async-await. Simple, small learning curve, good for most API calls.\n- **Redux Saga**: uses **generator functions** that listen for actions and run side effects declaratively (`call`, `put`, `takeLatest`, `fork`, `race`). Better for complex flows: cancellation, debouncing, retries, polling, parallel tasks, websockets; very testable. Larger learning curve and more boilerplate.\n```js\n// thunk\nexport const fetchUsers = () => async dispatch => {\n  dispatch({ type: 'users/loading' });\n  const data = await api.getUsers();\n  dispatch({ type: 'users/loaded', payload: data });\n};\n```\nToday Redux recommends Thunk (`createAsyncThunk`) or RTK Query by default."
            },
            {
              "id": "46",
              "q": "What are generator functions? How are they used in Redux Saga?",
              "a": "A generator is a function declared with `function*` that can **pause** with `yield` and resume later. Calling it returns an iterator; each `next()` runs until the next `yield`.\n```js\nfunction* gen() { yield 1; yield 2; }\nconst it = gen(); it.next(); // {value: 1, done: false}\n```\nIn Redux Saga, sagas are generators. You `yield` **effect descriptions** (plain objects) and the saga middleware executes them, then resumes the generator with the result:\n```js\nfunction* fetchUserSaga(action) {\n  try {\n    const user = yield call(api.getUser, action.payload);\n    yield put({ type: 'user/success', payload: user });\n  } catch (e) {\n    yield put({ type: 'user/failure', error: e.message });\n  }\n}\nfunction* rootSaga() { yield takeLatest('user/request', fetchUserSaga); }\n```\nBecause effects are just objects, sagas are easy to test step by step, and `takeLatest` automatically cancels the previous call."
            },
            {
              "id": "47",
              "q": "What is Redux Toolkit? Why is it preferred over traditional Redux?",
              "a": "Redux Toolkit (RTK) is the official, recommended way to write Redux. It removes most boilerplate:\n- `configureStore`: store setup with good defaults (thunk, DevTools, dev-time checks for mutation/serializability).\n- `createSlice`: reducers + action creators + action types in one place.\n- **Immer** built in: write \"mutating\" code that produces immutable updates.\n- `createAsyncThunk` for async logic with pending/fulfilled/rejected actions.\n- `createEntityAdapter` for normalized data; `createSelector` for memoized selectors.\n- **RTK Query** for data fetching and caching.\nLess code, fewer bugs (no accidental mutation), consistent structure."
            },
            {
              "id": "48",
              "q": "What is createSlice()?",
              "a": "`createSlice` takes a name, initial state and reducer functions, and generates action creators and action types automatically.\n```js\nconst counterSlice = createSlice({\n  name: 'counter',\n  initialState: { value: 0 },\n  reducers: {\n    increment: state => { state.value += 1; },          // Immer makes this immutable\n    addBy: (state, action) => { state.value += action.payload; },\n  },\n  extraReducers: builder => {\n    builder.addCase(fetchCount.fulfilled, (state, action) => { state.value = action.payload; });\n  },\n});\nexport const { increment, addBy } = counterSlice.actions;\nexport default counterSlice.reducer;\n```\n`extraReducers` handles actions defined elsewhere (e.g. async thunks or other slices)."
            },
            {
              "id": "49",
              "q": "What are useSelector() and useDispatch()?",
              "a": "Hooks from `react-redux` for using the store in functional components (replacing `connect`):\n- **`useSelector(selector)`**: reads data from the store. The component re-renders only when the selected value changes (strict `===` comparison by default).\n- **`useDispatch()`**: returns the store's `dispatch` function to send actions.\n```jsx\nconst count = useSelector(state => state.counter.value);\nconst dispatch = useDispatch();\n<button onClick={() => dispatch(increment())}>{count}</button>\n```\nTip: don't return a new object from a selector (`state => ({a, b})`) — it re-renders every time; select primitives separately, use `shallowEqual`, or memoized selectors."
            },
            {
              "id": "50",
              "q": "How do you handle asynchronous API calls using Redux Toolkit?",
              "a": "Use `createAsyncThunk` + `extraReducers` (or RTK Query):\n```js\nexport const fetchUsers = createAsyncThunk('users/fetch', async (_, { rejectWithValue }) => {\n  try {\n    const res = await axios.get('/api/users');\n    return res.data;\n  } catch (err) {\n    return rejectWithValue(err.response?.data);\n  }\n});\n\nconst usersSlice = createSlice({\n  name: 'users',\n  initialState: { list: [], status: 'idle', error: null },\n  reducers: {},\n  extraReducers: builder => {\n    builder\n      .addCase(fetchUsers.pending,   s => { s.status = 'loading'; })\n      .addCase(fetchUsers.fulfilled, (s, a) => { s.status = 'succeeded'; s.list = a.payload; })\n      .addCase(fetchUsers.rejected,  (s, a) => { s.status = 'failed'; s.error = a.payload; });\n  },\n});\n// in component: useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);\n```"
            },
            {
              "id": "51",
              "q": "What is the difference between Context API and Redux?",
              "a": "- **Purpose**: Context is a dependency-injection mechanism (pass values down the tree). Redux is a full state-management library.\n- **Re-renders**: all Context consumers re-render when the value changes; Redux `useSelector` re-renders only components whose selected slice changed.\n- **Tooling**: Redux has DevTools, time travel, middleware, logging; Context has none.\n- **Async/side effects**: Redux has thunks/sagas/RTK Query; Context needs your own pattern.\n- **Setup**: Context is built in and simple; Redux adds a dependency and structure.\nUse Context for rarely changing global values (theme, auth, locale); Redux for large, frequently updated, shared business state."
            },
            {
              "id": "52",
              "q": "How would you manage global state in a large-scale application?",
              "a": "- Separate state types: **server state** (API data) → RTK Query / React Query; **global client state** (auth, preferences, cart) → Redux Toolkit; **local UI state** → `useState`; **URL state** → router query params; **form state** → React Hook Form.\n- Organize Redux by **feature slices** (`features/cart/cartSlice.js`), not by file type.\n- **Normalize** data (by id, `createEntityAdapter`) to avoid duplication.\n- Use **memoized selectors** and keep components subscribed to the smallest slice.\n- Keep state minimal; derive values with selectors instead of storing them.\n- Lazy-load reducers for large / micro-frontend apps; use TypeScript for typed state and actions."
            },
            {
              "id": "53",
              "q": "How do you prevent unnecessary component re-renders when using Redux?",
              "a": "- Select the **smallest** piece of state needed: `useSelector(s => s.user.name)` instead of the whole `s.user`.\n- Avoid selectors that return new objects/arrays each time; use `createSelector` (Reselect) for derived data, or `shallowEqual` as the equality function.\n- Normalize state so updating one item doesn't change references of unrelated data.\n- Wrap list items in `React.memo` and pass ids, letting each item select its own data.\n- Keep frequently changing data (e.g. form typing) out of Redux.\n- Use React DevTools Profiler to verify."
            },
            {
              "id": "54",
              "q": "What is the purpose of selectors in Redux?",
              "a": "Selectors are functions that read or derive data from the state: `const selectCartTotal = state => ...`.\n- **Encapsulation**: components don't depend on the state shape; if it changes, only selectors change.\n- **Reuse**: the same logic used across components.\n- **Derived data**: compute totals, filtered lists instead of storing them.\n- **Performance**: memoized selectors (`createSelector`) only recompute when inputs change and return the same reference, preventing re-renders.\n```js\nconst selectVisibleTodos = createSelector(\n  [state => state.todos, state => state.filter],\n  (todos, filter) => todos.filter(t => filter === 'all' || t.status === filter)\n);\n```"
            },
            {
              "id": "55",
              "q": "Have you used RTK Query? How does createApi() work?",
              "a": "RTK Query is the data fetching and caching tool built into Redux Toolkit. It removes hand-written thunks/loading flags for API data.\n`createApi` defines a base query and endpoints; it auto-generates hooks:\n```js\nexport const api = createApi({\n  reducerPath: 'api',\n  baseQuery: fetchBaseQuery({ baseUrl: '/api', prepareHeaders: h => { h.set('Authorization', `Bearer ${token}`); return h; } }),\n  tagTypes: ['Post'],\n  endpoints: build => ({\n    getPosts: build.query({ query: () => 'posts', providesTags: ['Post'] }),\n    addPost: build.mutation({ query: body => ({ url: 'posts', method: 'POST', body }), invalidatesTags: ['Post'] }),\n  }),\n});\nexport const { useGetPostsQuery, useAddPostMutation } = api;\n// const { data, isLoading, error } = useGetPostsQuery();\n```\nFeatures: caching and request de-duplication, loading/error states, cache invalidation via tags (refetch after mutation), polling, refetch on focus, optimistic updates. Add `api.reducer` and `api.middleware` to the store."
            }
          ]
        },
        {
          "title": "Performance",
          "items": [
            {
              "id": "79",
              "q": "How do you optimize the performance of a React application?",
              "a": "Measure first (React DevTools Profiler, Lighthouse, Performance tab), then:\n- **Avoid unnecessary re-renders**: `React.memo`, `useMemo`, `useCallback`, keep state close to where it's used, split contexts.\n- **Code splitting / lazy loading** routes and heavy components (`React.lazy`, dynamic `import()`).\n- **Virtualize** long lists (react-window).\n- **Bundle size**: tree-shaking, remove heavy libs (moment → dayjs), analyze with webpack-bundle-analyzer.\n- **Network**: caching (RTK Query/React Query), debounce search, pagination, compression, CDN, HTTP caching.\n- **Images**: lazy loading, modern formats (WebP/AVIF), correct sizes.\n- Concurrent features: `useTransition`, `useDeferredValue` for heavy updates.\n- SSR/SSG (Next.js) for faster first paint; production build."
            },
            {
              "id": "80",
              "q": "What causes unnecessary re-renders in React?",
              "a": "A component re-renders when: its state changes, its parent re-renders, or a context it uses changes. Common avoidable causes:\n- Parent re-renders and children aren't memoized.\n- New object/array/function props created each render (`style={{...}}`, `onClick={() => ...}`) breaking `React.memo`.\n- State placed too high in the tree (e.g. form input state in App).\n- Large Context values that change often (every consumer re-renders), or a context value object recreated each render.\n- Redux selectors returning new references.\n- Storing derived data in state + effects that set state.\n- Unstable keys (index or random keys) causing remounts."
            },
            {
              "id": "81",
              "q": "How do you identify unnecessary re-renders?",
              "a": "- **React DevTools Profiler**: record an interaction, see which components rendered, how long, and \"Why did this render?\" (enable in settings).\n- DevTools setting **\"Highlight updates when components render\"**.\n- `why-did-you-render` library to log avoidable re-renders.\n- Temporary `console.log` or a render counter (`useRef` incremented each render).\n- Chrome Performance tab for long tasks and scripting time.\nThen fix with memoization, moving state down, or splitting components."
            },
            {
              "id": "82",
              "q": "What is memoization?",
              "a": "Memoization is caching the result of a function call based on its inputs, so repeated calls with the same inputs return the cached result instead of recomputing.\n```js\nfunction memoize(fn) {\n  const cache = new Map();\n  return arg => {\n    if (cache.has(arg)) return cache.get(arg);\n    const result = fn(arg);\n    cache.set(arg, result);\n    return result;\n  };\n}\n```\nIn React: `React.memo` (components), `useMemo` (values), `useCallback` (functions), Reselect's `createSelector` (selectors). Trade-off: uses memory and comparison costs, so apply it where it measurably helps."
            },
            {
              "id": "83",
              "q": "How do you use React.memo() to optimize a component?",
              "a": "Wrap the component; React skips re-rendering it when its props are shallowly equal to the previous props.\n```jsx\nconst UserCard = React.memo(function UserCard({ user, onSelect }) {\n  return <div onClick={() => onSelect(user.id)}>{user.name}</div>;\n});\n\n// Parent: keep props stable\nconst handleSelect = useCallback(id => setSelected(id), []);\n<UserCard user={user} onSelect={handleSelect} />\n```\n- Optional second arg: custom comparison `(prev, next) => boolean` (return true to skip render).\n- It still re-renders if its own state or a used context changes.\n- Best for components that render often with the same props and are expensive (list rows, charts)."
            },
            {
              "id": "84",
              "q": "What is code splitting?",
              "a": "Code splitting breaks the app bundle into smaller chunks that are loaded **on demand** instead of shipping one huge JS file upfront. This reduces initial load time and Time to Interactive.\n- Done with dynamic `import()`; bundlers (Webpack, Vite) create separate chunks automatically.\n- In React: `React.lazy` + `Suspense` for components; split by **route** first (biggest win), then heavy components (charts, editors, modals).\n- Also `splitChunks` to separate vendor code for better caching.\n```js\nimport('./utils/heavy').then(mod => mod.run());\n```"
            },
            {
              "id": "85",
              "q": "What is lazy loading in React?",
              "a": "Lazy loading means loading a resource only when it's needed rather than on initial page load.\nIn React:\n- **Components/routes**: `React.lazy(() => import('./Dashboard'))` wrapped in `<Suspense fallback={...}>`.\n- **Images**: `<img loading=\"lazy\">` or IntersectionObserver.\n- **Data**: fetch when a section scrolls into view or a tab opens.\nBenefit: smaller initial bundle, faster first load. Cost: a small delay when the user first opens that part, so show a good fallback and consider prefetching likely routes."
            },
            {
              "id": "86",
              "q": "How does React.lazy() work?",
              "a": "`React.lazy` takes a function returning a dynamic `import()` promise that resolves to a module with a **default export** component.\n```jsx\nconst Reports = React.lazy(() => import('./pages/Reports'));\n\n<Suspense fallback={<Spinner />}>\n  <Routes>\n    <Route path=\"/reports\" element={<Reports />} />\n  </Routes>\n</Suspense>\n```\nHow it works: on first render, the lazy component **throws the promise**; the nearest `Suspense` catches it and shows the fallback. When the chunk loads, React re-renders with the real component (cached afterwards). Wrap with an Error Boundary to handle chunk load failures. For named exports: `import('./X').then(m => ({ default: m.Named }))`."
            },
            {
              "id": "87",
              "q": "What is the purpose of Suspense?",
              "a": "`Suspense` lets you show a **fallback UI** (spinner, skeleton) while its children are \"not ready yet\" — waiting for lazy-loaded code or, with Suspense-enabled data libraries/frameworks (Next.js, React Query suspense mode, React 19 `use()`), data.\n```jsx\n<Suspense fallback={<Skeleton />}>\n  <Comments />\n</Suspense>\n```\n- Boundaries can be nested to reveal parts of the page progressively.\n- In SSR (Next.js App Router), Suspense enables **streaming** HTML chunks.\n- Combine with `useTransition` to keep showing old content instead of a fallback during updates."
            },
            {
              "id": "88",
              "q": "How do you handle a large list of records coming from an API?",
              "a": "- **Server-side pagination** or **infinite scroll** — don't fetch 10,000 rows at once if avoidable.\n- **Virtualization** (react-window / react-virtuoso / TanStack Virtual): render only visible rows.\n- Memoize rows (`React.memo`) with stable keys and stable callbacks.\n- Debounce search/filter; move heavy filtering/sorting to the server or a Web Worker; use `useDeferredValue`/`useTransition` for client-side filtering.\n- Cache responses (RTK Query/React Query); normalize data.\n- Show skeleton loaders; request only the fields needed."
            },
            {
              "id": "89",
              "q": "What is list virtualization? Have you used react-window or a similar library?",
              "a": "List virtualization (windowing) renders only the items currently visible in the viewport (plus a small buffer), instead of thousands of DOM nodes. As you scroll, rows are recycled and positioned absolutely inside a tall container to keep the scrollbar correct.\n```jsx\nimport { FixedSizeList as List } from 'react-window';\n<List height={500} itemCount={items.length} itemSize={40} width=\"100%\">\n  {({ index, style }) => <div style={style}>{items[index].name}</div>}\n</List>\n```\nBenefits: fast initial render, low memory, smooth scrolling. Libraries: react-window, react-virtualized, react-virtuoso (variable heights), TanStack Virtual. Caveats: Ctrl+F browser search doesn't find off-screen items; variable heights need measurement; accessibility needs care."
            },
            {
              "id": "90",
              "q": "How would you implement pagination or infinite scrolling?",
              "a": "**Pagination**: keep `page` (and `pageSize`) in state or URL; fetch `/api/items?page=2&limit=20`; show next/prev buttons using `total`/`totalPages` from the API.\n**Infinite scroll**: append the next page when a sentinel element at the bottom becomes visible:\n```jsx\nconst loaderRef = useRef(null);\nuseEffect(() => {\n  const obs = new IntersectionObserver(([entry]) => {\n    if (entry.isIntersecting && hasMore && !loading) setPage(p => p + 1);\n  });\n  if (loaderRef.current) obs.observe(loaderRef.current);\n  return () => obs.disconnect();\n}, [hasMore, loading]);\n// useEffect on [page] → fetch and setItems(prev => [...prev, ...newItems])\n```\nPrefer **cursor-based** pagination for changing data. Combine infinite scroll with virtualization for huge lists; RTK Query/React Query (`useInfiniteQuery`) simplify this."
            },
            {
              "id": "91",
              "q": "How would you optimize an application with multiple API calls?",
              "a": "- Run independent calls **in parallel** with `Promise.all` / `allSettled`, not one by one.\n- **Cache** and de-duplicate requests (RTK Query, React Query, SWR) so multiple components share one request.\n- Combine endpoints on the backend (BFF / GraphQL) to reduce round trips.\n- Lazy-load data for parts not visible yet (tabs, below-the-fold).\n- Debounce/throttle user-triggered calls; cancel outdated ones with AbortController.\n- Prefetch likely next data; show progressive UI (skeletons per section with Suspense).\n- HTTP caching headers, compression, CDN."
            },
            {
              "id": "92",
              "q": "How do you prevent unnecessary API calls when a component re-renders?",
              "a": "- Use correct `useEffect` dependencies; avoid objects/functions created during render as dependencies (memoize or use primitives).\n- Never call APIs directly in the component body — only in effects or event handlers.\n- Use a caching library (RTK Query/React Query) that de-duplicates and caches by key.\n- Lift the fetch to a parent or store so remounting children don't refetch.\n- Debounce input-driven requests; use a ref flag to prevent duplicate submits.\n- Remember StrictMode intentionally runs effects twice in development only."
            },
            {
              "id": "93",
              "q": "How would you improve the initial loading performance of a React application?",
              "a": "- **Code splitting** by route and lazy-load heavy components.\n- Reduce bundle size: tree-shaking, remove unused/heavy libraries, analyze bundle.\n- **SSR/SSG** (Next.js) or prerendering for faster First Contentful Paint and SEO.\n- Optimize assets: compressed (gzip/brotli), minified, CDN, long-term caching with hashed filenames.\n- Images: lazy loading, responsive sizes, WebP/AVIF; fonts: `font-display: swap`, preload critical ones.\n- `preload`/`prefetch`/`preconnect` for critical resources; defer non-critical scripts (analytics).\n- Skeleton screens to improve perceived performance.\n- Measure with Lighthouse / Web Vitals (LCP, INP, CLS)."
            }
          ]
        },
        {
          "title": "Data fetching & APIs",
          "items": [
            {
              "id": "111",
              "q": "How do you make an API call in React?",
              "a": "Usually inside `useEffect` (for data on load) or an event handler (for user actions), with `fetch` or `axios`. Track loading/error, and cancel on unmount.\n```jsx\nuseEffect(() => {\n  const controller = new AbortController();\n  (async () => {\n    try {\n      setLoading(true);\n      const { data } = await axios.get(`/api/users/${id}`, { signal: controller.signal });\n      setUser(data);\n    } catch (e) {\n      if (!axios.isCancel(e)) setError(e);\n    } finally {\n      setLoading(false);\n    }\n  })();\n  return () => controller.abort();\n}, [id]);\n```\nIn real projects: a central API service (axios instance with base URL and interceptors) plus RTK Query / React Query for caching. (The effect callback itself can't be `async`, so define an async function inside.)"
            },
            {
              "id": "113",
              "q": "How do you handle loading and error states?",
              "a": "Keep explicit states — `loading`, `error`, `data` (or a `status`: `'idle' | 'loading' | 'success' | 'error'`) — and render each case:\n```jsx\nif (status === 'loading') return <Skeleton />;\nif (status === 'error') return <ErrorMessage message={error} onRetry={refetch} />;\nif (!data.length) return <EmptyState />;\nreturn <List items={data} />;\n```\nGood practices: reset error before retrying, show a retry button, user-friendly messages (log technical details), skeletons instead of spinners for layout stability, disable buttons while submitting, global toast for mutation errors, Error Boundaries for render errors. RTK Query/React Query give `isLoading`, `isError`, `error` out of the box."
            },
            {
              "id": "117",
              "q": "How do you prevent duplicate API calls?",
              "a": "- **Disable the button** / ignore clicks while a request is in flight (`if (loadingRef.current) return;`).\n- **Debounce** input-driven calls (search).\n- **De-duplicate** with a caching layer: RTK Query/React Query share one in-flight request per key.\n- Keep an in-flight map of pending promises keyed by URL and return the existing promise.\n- **Cancel** the previous request with AbortController when a new one starts (`takeLatest` behaviour).\n- Correct `useEffect` dependencies; fetch higher in the tree instead of in every child.\n- Backend: idempotency keys for critical POSTs (payments)."
            },
            {
              "id": "118",
              "q": "How do you cancel an API request when a component unmounts?",
              "a": "Use `AbortController` and abort in the effect cleanup:\n```jsx\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch(url, { signal: controller.signal })\n    .then(r => r.json())\n    .then(setData)\n    .catch(err => { if (err.name !== 'AbortError') setError(err); });\n  return () => controller.abort();      // runs on unmount or when url changes\n}, [url]);\n```\nAxios supports the same `signal` option (older: `CancelToken`). RTK Query/React Query handle this automatically. This prevents setting state on unmounted components and avoids race conditions."
            },
            {
              "id": "119",
              "q": "How do you handle token expiration in a React application?",
              "a": "Common approach: **short-lived access token + long-lived refresh token** (refresh token in an httpOnly secure cookie).\n- An **axios response interceptor** catches `401`, calls `/refresh`, stores the new access token, and **retries the original request**.\n- Queue concurrent requests while one refresh is in progress so you refresh only once.\n- If refresh fails → clear state and redirect to login.\n- Optionally refresh proactively before expiry (decode `exp` from the JWT).\n```js\nlet refreshing = null;\napi.interceptors.response.use(r => r, async error => {\n  const original = error.config;\n  if (error.response?.status === 401 && !original._retry) {\n    original._retry = true;\n    refreshing = refreshing || api.post('/auth/refresh').finally(() => { refreshing = null; });\n    const { data } = await refreshing;\n    setAccessToken(data.accessToken);\n    original.headers.Authorization = `Bearer ${data.accessToken}`;\n    return api(original);\n  }\n  return Promise.reject(error);\n});\n```"
            },
            {
              "id": "120",
              "q": "How do you implement authentication and authorization?",
              "a": "- **Authentication** (who you are): user logs in → backend returns a token (JWT) or sets a session cookie. Store tokens securely (httpOnly cookie preferred; memory over localStorage due to XSS). Keep the user in an `AuthContext`/Redux; attach token in an axios request interceptor; handle refresh/expiry and logout. Or use OAuth/OIDC providers (Azure AD, Auth0, Cognito).\n- **Authorization** (what you can do): the backend returns roles/permissions; the frontend uses them to protect routes, hide/disable UI (`<Can permission=\"edit\">`), and show menus.\nImportant: frontend checks are only for UX — the **backend must always enforce** authorization on every API."
            },
            {
              "id": "121",
              "q": "How would you implement protected routes?",
              "a": "Wrap routes in a component that checks auth and redirects (React Router v6):\n```jsx\nfunction ProtectedRoute({ allowedRoles }) {\n  const { user, loading } = useAuth();\n  const location = useLocation();\n  if (loading) return <Spinner />;\n  if (!user) return <Navigate to=\"/login\" replace state={{ from: location }} />;\n  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to=\"/unauthorized\" replace />;\n  return <Outlet />;\n}\n\n<Routes>\n  <Route path=\"/login\" element={<Login />} />\n  <Route element={<ProtectedRoute />}>\n    <Route path=\"/dashboard\" element={<Dashboard />} />\n  </Route>\n  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>\n    <Route path=\"/admin\" element={<Admin />} />\n  </Route>\n</Routes>\n```\nAfter login, redirect back to `location.state.from`. In Next.js, use middleware for route protection."
            },
            {
              "id": "122",
              "q": "How do you handle pagination when the backend returns thousands of records?",
              "a": "- Ask the backend for **server-side pagination** (`?page=&limit=` or cursor-based `?after=`), returning items + total/next cursor. Don't load thousands of records at once.\n- Keep page/filter/sort in the URL so links and refresh work.\n- Cache visited pages (RTK Query/React Query), prefetch the next page, keep previous data while loading (`keepPreviousData`).\n- Server-side filtering/sorting so pagination stays correct.\n- If you must load everything: virtualization + client-side pagination, maybe in a Web Worker.\n- Cursor pagination avoids duplicates/missing rows when data changes between pages."
            },
            {
              "id": "123",
              "q": "What happens if the user clicks the Submit button multiple times before the API responds?",
              "a": "Each click can send a new request → duplicate orders/records, race conditions, inconsistent UI.\nPrevent it:\n- Disable the button and show a spinner while submitting (`isSubmitting`).\n- Guard with a ref (state updates are async, so a fast double click can slip through):\n```jsx\nconst submittingRef = useRef(false);\nasync function handleSubmit() {\n  if (submittingRef.current) return;\n  submittingRef.current = true;\n  setSubmitting(true);\n  try { await api.createOrder(form); }\n  finally { submittingRef.current = false; setSubmitting(false); }\n}\n```\n- Debounce/throttle the handler.\n- Backend: **idempotency key** so duplicate requests are processed once."
            },
            {
              "id": "124",
              "q": "How would you handle a slow API response in production?",
              "a": "- First **measure** where it's slow (network tab, APM, backend logs) and work with the backend: indexes, caching, pagination, smaller payloads.\n- Frontend UX: skeletons, progressive loading, optimistic updates, show cached/stale data while revalidating.\n- Set **timeouts** with clear messages and a retry option; retry with backoff for transient errors.\n- Cache responses; prefetch; avoid blocking the whole page — load sections independently with Suspense boundaries.\n- Cancel outdated requests; move long jobs to async processing with polling/websockets.\n- Monitor with RUM/Sentry/New Relic and alert on latency."
            },
            {
              "id": "125",
              "q": "How do you handle race conditions when multiple API calls update the same component?",
              "a": "A race condition happens when an older, slower response arrives after a newer one and overwrites it (e.g. typing \"re\" then \"react\" — \"re\" results show last).\nFixes:\n- **Abort** the previous request on change (AbortController in effect cleanup).\n- **Ignore stale responses** with a flag or request id:\n```jsx\nuseEffect(() => {\n  let ignore = false;\n  search(query).then(res => { if (!ignore) setResults(res); });\n  return () => { ignore = true; };\n}, [query]);\n```\n- Libraries: RTK Query/React Query (keyed by query), redux-saga `takeLatest`, RxJS `switchMap`.\n- For mutations, use optimistic updates with rollback and server versions/timestamps."
            }
          ]
        },
        {
          "title": "Senior-level follow-ups",
          "items": [
            {
              "id": "d1",
              "q": "When would you avoid useMemo?",
              "a": "Avoid `useMemo` when:\n- The calculation is cheap (simple math, short arrays, string concatenation) — the memo bookkeeping and dependency comparison can cost more than recomputing.\n- Dependencies change on almost every render, so the cache never hits.\n- The value isn't passed to a memoized child or used as a dependency (referential stability doesn't matter).\n- You're using it to \"fix\" a design problem — better to move state down, split components, or derive data differently.\nMemoize based on measurements (Profiler), not by default. The React Compiler (React 19) can auto-memoize, reducing the need for manual `useMemo`."
            },
            {
              "id": "d2",
              "q": "Can React.memo still cause re-renders?",
              "a": "Yes. `React.memo` only does a **shallow props comparison**, so it still re-renders when:\n- A prop is a new object/array/function each render (inline `{}` / `[]` / arrow functions) — the most common case.\n- `children` is passed as JSX (new element each render).\n- The component's **own state** changes.\n- A **Context** it consumes changes (`useContext` bypasses memo).\n- A Redux `useSelector` value changes (or returns a new reference).\n- Its `key` changes (that's a remount).\nFix with `useMemo`/`useCallback` in the parent, passing primitives, or a custom compare function."
            },
            {
              "id": "d3",
              "q": "How does React batching work internally?",
              "a": "- When you call `setState`, React doesn't render immediately; it **enqueues an update** on the component's Fiber with a priority **lane** (e.g. click = sync/discrete lane, transition = lower lane) and schedules a render for the root.\n- Updates scheduled in the same tick share the same render: React processes the update queue once, applying each update in order (functional updaters receive the previous result), then renders and commits once.\n- **React 17**: batching happened only inside React event handlers; updates in `setTimeout`/promises rendered one by one.\n- **React 18 (createRoot)**: **automatic batching** everywhere — events, timeouts, promises, native listeners — because updates are scheduled through the scheduler (microtask for sync lanes) rather than flushed synchronously.\n- `flushSync(() => setX(1))` forces an immediate synchronous render when you need the DOM updated right away.\nResult: fewer renders and no inconsistent intermediate UI."
            },
            {
              "id": "d4",
              "q": "How would you optimize a page displaying 10,000 records?",
              "a": "- Don't send 10,000 rows if not needed — **server-side pagination/infinite scroll** with filtering and sorting on the backend.\n- If all are needed on the client: **virtualize** (react-window/TanStack Virtual) so only ~20–30 DOM rows exist.\n- `React.memo` rows with stable `key`s; pass ids and stable callbacks (`useCallback`); avoid inline objects.\n- Memoize filtering/sorting (`useMemo`), debounce search, use `useDeferredValue`/`useTransition` to keep typing responsive; move heavy processing to a Web Worker.\n- Normalize data and select per-row from the store to avoid re-rendering the whole list.\n- Cache data (RTK Query), skeleton loading, measure with the Profiler before/after."
            },
            {
              "id": "d5",
              "q": "How would you structure Redux in a large application?",
              "a": "- Use **Redux Toolkit** with `configureStore` and **feature slices** (`features/orders/ordersSlice.ts`) — organize by domain, not by actions/reducers folders.\n- Keep only global client state in Redux; **server data in RTK Query** (one `createApi`, endpoints split with `injectEndpoints` per feature, tag-based invalidation).\n- **Normalize** collections with `createEntityAdapter`; store ids, not duplicated objects.\n- **Selectors** colocated with slices, memoized with `createSelector`; components never read raw state shape.\n- Typed hooks (`useAppDispatch`, `useAppSelector`) with TypeScript; `createAsyncThunk` or listener middleware for side effects.\n- Lazy-inject reducers for code-split features; avoid putting form/UI-local state in Redux; persist only what's needed (redux-persist with whitelist)."
            },
            {
              "id": "d6",
              "q": "How would you debug an unexpected production re-render?",
              "a": "1. **Reproduce** in the production build (with source maps or a profiling build `react-dom/profiling`).\n2. **React DevTools Profiler**: record, enable \"Record why each component rendered\", find the component and the cause (props changed / hooks changed / parent rendered / context changed).\n3. Look for typical causes: unstable props (new objects/functions), context value recreated every render, selectors returning new references, effects that set state on every render (loops), changing `key` causing remounts, state stored too high.\n4. Use `why-did-you-render`, render-count logs, or React's `<Profiler onRender>` in production to capture data from real users.\n5. Fix (memoization, split context, stable selectors, move state down), add a test or monitoring, and verify the render count dropped."
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
          "title": "Machine coding",
          "items": [
            {
              "id": "m1",
              "q": "Create a counter with increment, decrement and reset",
              "a": "```jsx\nimport { useState } from 'react';\n\nexport default function Counter({ initial = 0, step = 1 }) {\n  const [count, setCount] = useState(initial);\n  return (\n    <div>\n      <h2>{count}</h2>\n      <button onClick={() => setCount(c => c - step)} disabled={count <= 0}>-</button>\n      <button onClick={() => setCount(c => c + step)}>+</button>\n      <button onClick={() => setCount(initial)}>Reset</button>\n    </div>\n  );\n}\n```\nTalking points: functional updates (avoid stale state), optional min limit, props for initial/step. Follow-ups: move logic into a `useCounter` hook, or use `useReducer`."
            },
            {
              "id": "m2",
              "q": "Fetch users from an API and display usernames",
              "note": "Include: loading state, error handling, empty state, response handling, cleanup, correct dependencies.",
              "a": "```jsx\nimport { useEffect, useState } from 'react';\n\nexport default function UserList() {\n  const [users, setUsers] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch('https://jsonplaceholder.typicode.com/users', { signal: controller.signal })\n      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })\n      .then(setUsers)\n      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })\n      .finally(() => setLoading(false));\n    return () => controller.abort();\n  }, []);\n\n  if (loading) return <p>Loading…</p>;\n  if (error) return <p role=\"alert\">Error: {error}</p>;\n  if (!users.length) return <p>No users found.</p>;\n  return <ul>{users.map(u => <li key={u.id}>{u.username}</li>)}</ul>;\n}\n```\nNote: `fetch` doesn't reject on 404/500, so check `res.ok`."
            },
            {
              "id": "m3",
              "q": "Create a searchable and filterable list",
              "a": "```jsx\nimport { useMemo, useState } from 'react';\n\nexport default function SearchableList({ items }) {   // items: [{id, name, category}]\n  const [query, setQuery] = useState('');\n  const [category, setCategory] = useState('all');\n  const categories = useMemo(() => ['all', ...new Set(items.map(i => i.category))], [items]);\n\n  const visible = useMemo(() => {\n    const q = query.trim().toLowerCase();\n    return items.filter(i =>\n      (category === 'all' || i.category === category) &&\n      i.name.toLowerCase().includes(q));\n  }, [items, query, category]);\n\n  return (\n    <div>\n      <input value={query} onChange={e => setQuery(e.target.value)} placeholder=\"Search…\" />\n      <select value={category} onChange={e => setCategory(e.target.value)}>\n        {categories.map(c => <option key={c} value={c}>{c}</option>)}\n      </select>\n      {visible.length ? (\n        <ul>{visible.map(i => <li key={i.id}>{i.name}</li>)}</ul>\n      ) : <p>No results</p>}\n    </div>\n  );\n}\n```\nTalking points: filtered list is **derived** (not stored in state), `useMemo` for big lists, debounce the query (or `useDeferredValue`) if filtering is slow or done via API."
            },
            {
              "id": "m4",
              "q": "Create an N × N dynamic grid based on user input",
              "a": "```jsx\nimport { useState } from 'react';\n\nexport default function Grid() {\n  const [n, setN] = useState(3);\n  const [active, setActive] = useState(new Set());\n\n  const toggle = i => setActive(prev => {\n    const next = new Set(prev);\n    next.has(i) ? next.delete(i) : next.add(i);\n    return next;\n  });\n\n  return (\n    <div>\n      <input type=\"number\" min=\"1\" max=\"20\" value={n}\n        onChange={e => { setN(Math.max(1, Math.min(20, +e.target.value || 1))); setActive(new Set()); }} />\n      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 40px)`, gap: 4 }}>\n        {Array.from({ length: n * n }, (_, i) => (\n          <div key={i} onClick={() => toggle(i)}\n            style={{ width: 40, height: 40, border: '1px solid #999',\n                     background: active.has(i) ? 'teal' : 'white' }} />\n        ))}\n      </div>\n    </div>\n  );\n}\n```\nTalking points: CSS grid with `repeat(n, …)`, validate input, immutable Set update, row = `Math.floor(i / n)`, col = `i % n`. Common follow-ups: click order then un-color in reverse, tic-tac-toe winner check."
            },
            {
              "id": "m5",
              "q": "Create pagination for an API-based product listing",
              "note": "Include: loading state, error handling, empty state, response handling, cleanup, correct dependencies.",
              "a": "```jsx\nimport { useEffect, useState } from 'react';\nconst PAGE_SIZE = 10;\n\nexport default function ProductList() {\n  const [page, setPage] = useState(1);\n  const [data, setData] = useState({ products: [], total: 0 });\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    const controller = new AbortController();\n    setLoading(true); setError(null);\n    const skip = (page - 1) * PAGE_SIZE;\n    fetch(`https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`, { signal: controller.signal })\n      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })\n      .then(d => setData({ products: d.products, total: d.total }))\n      .catch(e => e.name !== 'AbortError' && setError(e.message))\n      .finally(() => setLoading(false));\n    return () => controller.abort();   // cancels the old request if page changes fast\n  }, [page]);\n\n  const totalPages = Math.ceil(data.total / PAGE_SIZE);\n  if (error) return <p>Error: {error}</p>;\n  return (\n    <div>\n      {loading ? <p>Loading…</p> : (\n        <ul>{data.products.map(p => <li key={p.id}>{p.title} – ${p.price}</li>)}</ul>\n      )}\n      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>\n      <span> Page {page} of {totalPages} </span>\n      <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>\n    </div>\n  );\n}\n```\nExtras to mention: keep `page` in the URL (`useSearchParams`), cache pages, page-number buttons, abort to avoid race conditions."
            },
            {
              "id": "m6",
              "q": "Build a reusable custom hook for API requests",
              "note": "Include: loading state, error handling, empty state, response handling, cleanup, correct dependencies.",
              "a": "```jsx\nimport { useCallback, useEffect, useRef, useState } from 'react';\n\nexport function useApi(url, options = {}, { immediate = true } = {}) {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(immediate);\n  const [error, setError] = useState(null);\n  const optionsRef = useRef(options);\n  optionsRef.current = options;               // latest options without re-triggering\n  const controllerRef = useRef(null);\n\n  const execute = useCallback(async (overrideBody) => {\n    controllerRef.current?.abort();\n    const controller = new AbortController();\n    controllerRef.current = controller;\n    setLoading(true); setError(null);\n    try {\n      const { body, ...rest } = optionsRef.current;\n      const payload = overrideBody ?? body;\n      const res = await fetch(url, {\n        ...rest,\n        body: payload ? JSON.stringify(payload) : undefined,\n        headers: { 'Content-Type': 'application/json', ...rest.headers },\n        signal: controller.signal,\n      });\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      const json = await res.json();\n      setData(json);\n      return json;\n    } catch (e) {\n      if (e.name !== 'AbortError') setError(e);\n    } finally {\n      if (controllerRef.current === controller) setLoading(false);\n    }\n  }, [url]);\n\n  useEffect(() => {\n    if (immediate) execute();\n    return () => controllerRef.current?.abort();\n  }, [execute, immediate]);\n\n  return { data, loading, error, refetch: execute };\n}\n\n// const { data, loading, error, refetch } = useApi('/api/users');\n// const { refetch: save } = useApi('/api/users', { method: 'POST' }, { immediate: false });\n```\nTalking points: loading/error/data states, abort on unmount and on new request (race conditions), `refetch` for manual calls, stable options via ref. In production, RTK Query / React Query add caching, retries and de-duplication."
            }
          ]
        }
      ]
    }
  ]
});
