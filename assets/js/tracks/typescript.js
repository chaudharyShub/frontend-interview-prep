/**
 * Track: TypeScript. Loaded on every page (see assets/js/app.js).
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
  "slug": "typescript",
  "title": "TypeScript",
  "description": "Narrowing, generics, utility and advanced types, and typing React, plus typed coding problems you can run and test in the browser.",
  "tabs": [
    {
      "slug": "theory",
      "title": "Theory",
      "sections": [
        {
          "title": "TypeScript essentials",
          "items": [
            {
              "id": "155",
              "q": "What is the difference between interface and type?",
              "a": "Both describe object shapes and are mostly interchangeable for objects.\n- **interface**: only object shapes; can be **extended** with `extends` and **merged** by re-declaring (declaration merging — useful for augmenting libraries); classes can `implements` them.\n- **type**: can describe anything — **unions**, intersections, primitives, tuples, mapped and conditional types (`type Status = 'idle' | 'loading'`); can't be re-opened.\n```ts\ninterface User { id: number; name: string }\ninterface Admin extends User { role: 'admin' }\n\ntype ID = string | number;\ntype AdminT = User & { role: 'admin' };\n```\nCommon convention: `interface` for object/props/public API shapes, `type` for unions and utility compositions."
            },
            {
              "id": "156",
              "q": "What is the difference between any and unknown?",
              "a": "- **any**: turns off type checking — you can do anything with it, and it spreads silently. Unsafe.\n- **unknown**: the type-safe counterpart: any value can be assigned to it, but you **must narrow it** (typeof, instanceof, type guard) before using it.\n```ts\nlet a: any = JSON.parse(text);\na.foo.bar();               // compiles, may crash at runtime\n\nlet u: unknown = JSON.parse(text);\n// u.foo;                  // error\nif (typeof u === 'object' && u !== null && 'foo' in u) { /* safe */ }\n```\nUse `unknown` for API responses, `catch (e)` errors, and third-party input; validate with a schema library (Zod)."
            },
            {
              "id": "ts1",
              "q": "What are union and intersection types?",
              "a": "- **Union** (`A | B`): the value is **one of** the types. You can only use members that exist on every option until you narrow it.\n- **Intersection** (`A & B`): the value is **all of** the types at once. Used to combine object shapes.\n```ts\ntype Id = string | number;\nfunction show(id: Id) {\n  // id.toUpperCase();          // error: number has no toUpperCase\n  return typeof id === 'string' ? id.toUpperCase() : id.toFixed(0);\n}\n\ntype Timestamps = { createdAt: Date; updatedAt: Date };\ntype Post = { title: string } & Timestamps;   // has all three fields\n```\nA common trap: intersecting two primitives or conflicting properties gives `never` (`string & number` is `never`), because no value can be both."
            },
            {
              "id": "ts2",
              "q": "What is type narrowing? Name the ways to narrow a type.",
              "a": "Narrowing is how TypeScript works out a **more specific type** inside a branch, based on checks you write.\n- **`typeof`**: `typeof x === 'string'`.\n- **Truthiness / equality**: `if (user)` removes `null` and `undefined`; `x === 'a'` narrows to that literal.\n- **`instanceof`**: `if (err instanceof Error)`.\n- **`in`**: `if ('swim' in animal)`.\n- **Discriminated unions**: checking a shared literal field like `kind` or `status`.\n- **Custom type guards**: a function returning `value is Type`.\n- **Assertion functions**: `function assert(v: unknown): asserts v is string`.\n```ts\nfunction isFish(pet: Fish | Bird): pet is Fish {\n  return 'swim' in pet;\n}\nif (isFish(pet)) pet.swim();   // pet is Fish here\nelse pet.fly();                // and Bird here\n```\nTypeScript trusts a custom guard completely, so a wrong guard creates wrong types. Keep guards small and test them."
            },
            {
              "id": "ts3",
              "q": "What is a discriminated union, and how do you make a switch exhaustive?",
              "a": "A discriminated (tagged) union is a union of object types that share one **literal field** (the discriminant). Checking that field narrows to the matching member.\n```ts\ntype State =\n  | { status: 'loading' }\n  | { status: 'success'; data: User[] }\n  | { status: 'error'; error: string };\n\nfunction render(s: State) {\n  switch (s.status) {\n    case 'loading': return 'Loading…';\n    case 'success': return `${s.data.length} users`;   // data exists here\n    case 'error':   return s.error;\n    default: {\n      const unreachable: never = s;   // compile error if a case is missing\n      return unreachable;\n    }\n  }\n}\n```\nAssigning to `never` in the `default` branch makes the compiler **fail when someone adds a new status** and forgets to handle it. This pattern is great for request state and reducer actions, because impossible combinations (like `data` while loading) can't be written."
            },
            {
              "id": "ts4",
              "q": "What are never, void and unknown, and when do you see each?",
              "a": "- **`void`**: a function returns nothing useful. `() => void` callbacks may still return a value; it is just ignored.\n- **`never`**: a value that **can't exist**. It's the return type of functions that always throw or loop forever, what's left after narrowing away every option, and the result of impossible types like `string & number`.\n- **`unknown`**: any value, but you must narrow it before use. The safe top type.\n```ts\nfunction fail(msg: string): never { throw new Error(msg); }\n\ntype NonString<T> = T extends string ? never : T;\ntype R = NonString<string | number | boolean>;   // number | boolean\n```\n`never` disappears from unions (`A | never` is `A`), which is why it's used in conditional types to filter members out."
            },
            {
              "id": "ts10",
              "q": "What is the difference between a type annotation, a type assertion (as), the non-null assertion (!) and satisfies?",
              "a": "- **Annotation** (`const x: T = …`): the value must match `T`, and the variable **becomes** `T` (losing anything more specific).\n- **Assertion** (`value as T`): you tell the compiler to trust you. **Nothing is checked at runtime**, so a wrong assertion hides bugs. Use it at boundaries where you know more than the compiler.\n- **Non-null assertion** (`value!`): removes `null | undefined`. Same risk: it crashes at runtime if you're wrong.\n- **`satisfies`** (TS 4.9+): checks the value matches `T` but **keeps the inferred, more specific type**.\n```ts\ntype Theme = Record<'primary' | 'text', string | [number, number, number]>;\n\nconst a: Theme = { primary: '#4f46e5', text: [17, 24, 39] };\n// a.text is string | [number, number, number], so a.text.map(...) is an error\n\nconst b = { primary: '#4f46e5', text: [17, 24, 39] } satisfies Theme;\nb.text.map(n => n / 255);      // fine: still known to be a tuple\n// A typo like `primry` is still caught by satisfies.\n\nconst input = document.querySelector('#email') as HTMLInputElement;  // assertion\n```\nPrefer narrowing, then `satisfies`, then annotations. Use `as` and `!` rarely, and never to silence an error you don't understand."
            },
            {
              "id": "ts11",
              "q": "What does as const do? How is it different from readonly?",
              "a": "`as const` makes TypeScript infer the **narrowest possible type**: literal values instead of `string`/`number`, `readonly` properties, and readonly tuples instead of arrays.\n```ts\nconst a = { method: 'GET', retries: 3 };           // { method: string; retries: number }\nconst b = { method: 'GET', retries: 3 } as const;  // { readonly method: 'GET'; readonly retries: 3 }\n\nconst sizes = ['sm', 'md', 'lg'] as const;          // readonly ['sm', 'md', 'lg']\ntype Size = typeof sizes[number];                   // 'sm' | 'md' | 'lg'\n\nfetch(url, a);   // can fail: method is string, not a valid method literal\nfetch(url, b);   // fine\n```\n- **`readonly`** is a modifier you write on a property or array type (`readonly string[]`).\n- **`as const`** applies deep readonly and literal types to a whole **value**.\nBoth are **compile-time only**. At runtime the object can still be changed; use `Object.freeze` if you need that."
            },
            {
              "id": "ts12",
              "q": "Should you use enums or union types?",
              "a": "- **Enums** are one of the few TypeScript features that **produce runtime JavaScript** (an object). Numeric enums also allow reverse mapping and accept any number, which is a known source of bugs.\n- **String literal unions** (`'idle' | 'loading'`) are erased at compile time, have zero runtime cost, and work with plain strings from APIs.\n```ts\nenum Status { Idle = 'idle', Loading = 'loading' }\nsetStatus(Status.Loading);   // must import the enum\n// setStatus('loading');     // error, even though the value is the same\n\ntype Status2 = 'idle' | 'loading';\nsetStatus2('loading');       // fine, autocompletes\n\n// If you want a runtime object too:\nconst STATUS = { Idle: 'idle', Loading: 'loading' } as const;\ntype Status3 = typeof STATUS[keyof typeof STATUS];   // 'idle' | 'loading'\n```\nMost teams today prefer unions or the `as const` object. `const enum` is also discouraged because it breaks with tools that compile files one at a time (Babel, esbuild, `isolatedModules`). Newer Node versions can strip types but not run enums, which is another reason to avoid them."
            },
            {
              "id": "ts13",
              "q": "TypeScript is structurally typed. What does that mean, and what are excess property checks and branded types?",
              "a": "**Structural typing**: a type is compatible if it has the **required shape**, regardless of its name. Two interfaces with the same fields are interchangeable.\n```ts\ninterface Point { x: number; y: number }\nconst p = { x: 1, y: 2, z: 3 };\nconst q: Point = p;          // fine: p has x and y\n\nconst r: Point = { x: 1, y: 2, z: 3 };   // error: excess property 'z'\n```\n**Excess property checks** only apply to **fresh object literals** assigned straight to a typed spot. They catch typos; they're not a strict \"exact types\" rule.\n\n**Branded types** fake nominal typing when two values share a primitive type but must not be mixed:\n```ts\ntype UserId = string & { readonly __brand: 'UserId' };\ntype OrderId = string & { readonly __brand: 'OrderId' };\nconst toUserId = (s: string) => s as UserId;   // validate here in real code\n\nfunction getUser(id: UserId) { /* … */ }\ngetUser(toUserId('u_1'));      // fine\n// getUser('u_1' as OrderId);  // error\n```"
            },
            {
              "id": "ts14",
              "q": "What does \"strict\": true turn on in tsconfig, and why does it matter?",
              "a": "`strict` enables a family of checks. The important ones:\n- **`strictNullChecks`**: `null` and `undefined` aren't assignable to other types, so you must handle them. This alone catches a large share of runtime crashes.\n- **`noImplicitAny`**: error when a type can't be inferred and would silently become `any`.\n- **`strictFunctionTypes`**: checks function parameter types safely (contravariance).\n- **`strictPropertyInitialization`**: class fields must be set in the constructor.\n- **`useUnknownInCatchVariables`**: `catch (e)` gives `e: unknown` instead of `any`.\n- **`alwaysStrict`**, **`strictBindCallApply`**, **`noImplicitThis`**.\n\nUseful extras that `strict` does **not** include:\n- **`noUncheckedIndexedAccess`**: `arr[i]` and `record[key]` include `undefined`.\n- **`exactOptionalPropertyTypes`**, **`noImplicitOverride`**, **`noFallthroughCasesInSwitch`**.\n\nTo migrate an existing codebase, turn the flags on one by one and fix the errors in batches, rather than flipping `strict` everywhere at once."
            }
          ]
        },
        {
          "title": "Generics & advanced types",
          "items": [
            {
              "id": "ts5",
              "q": "What are generics? Explain constraints and default type parameters.",
              "a": "Generics let a function, type or component work with **many types while keeping the link between input and output**, instead of falling back to `any`.\n```ts\nfunction first<T>(items: T[]): T | undefined {\n  return items[0];\n}\nfirst([1, 2]);        // number | undefined\nfirst(['a']);         // string | undefined\n\n// Constraint: T must have a length\nfunction longest<T extends { length: number }>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}\n\n// Constraint with keyof: key must exist on the object\nfunction getProp<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\n// Default type parameter\ntype ApiResponse<T = unknown> = { data: T; error?: string };\n```\n- TypeScript usually **infers** the type argument, so you rarely write `first<number>(…)`.\n- Add a constraint (`extends`) when the body needs something from the type.\n- Don't add a generic that's used only once. `function f<T>(x: T): void` gives nothing over `unknown`."
            },
            {
              "id": "157",
              "q": "Explain Partial, Required, Pick and Omit.",
              "a": "Built-in utility types that transform other types:\n```ts\ninterface User { id: number; name: string; email?: string }\n\ntype A = Partial<User>;          // all optional: { id?; name?; email? }  — e.g. update payloads\ntype B = Required<User>;         // all required, email no longer optional\ntype C = Pick<User, 'id' | 'name'>;   // only id and name\ntype D = Omit<User, 'email'>;    // everything except email\n```\nOthers worth mentioning: `Readonly<T>`, `Record<K, V>`, `ReturnType<F>`, `Parameters<F>`, `Exclude`, `Extract`, `NonNullable`, `Awaited`."
            },
            {
              "id": "ts6",
              "q": "What do keyof, typeof and indexed access types do?",
              "a": "They build types from other types or values, so you don't repeat yourself.\n- **`keyof T`**: union of the property names of `T`.\n- **`typeof value`** (in a type position): the type of a JavaScript value.\n- **`T[K]`** (indexed access): the type of property `K` on `T`.\n```ts\nconst config = { apiUrl: 'https://api.example.com', retries: 3 };\ntype Config = typeof config;          // { apiUrl: string; retries: number }\ntype ConfigKey = keyof Config;        // 'apiUrl' | 'retries'\ntype Retries = Config['retries'];     // number\n\nconst ROLES = ['admin', 'editor', 'viewer'] as const;\ntype Role = typeof ROLES[number];     // 'admin' | 'editor' | 'viewer'\n```\nThe last line is a common interview pattern: one array is the single source of truth for both the runtime list and the type."
            },
            {
              "id": "ts7",
              "q": "What are mapped types? How would you write Partial and Readonly yourself?",
              "a": "A mapped type loops over keys (usually `keyof T`) and builds a new object type.\n```ts\ntype MyPartial<T>  = { [K in keyof T]?: T[K] };\ntype MyReadonly<T> = { readonly [K in keyof T]: T[K] };\ntype MyRequired<T> = { [K in keyof T]-?: T[K] };       // -? removes optional\ntype Mutable<T>    = { -readonly [K in keyof T]: T[K] };\n\n// Key remapping with `as` (TS 4.1+)\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\ntype G = Getters<{ name: string; age: number }>;\n// { getName: () => string; getAge: () => number }\n\n// Filtering keys: map unwanted ones to never\ntype OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };\n```\nMost built-in utility types (`Partial`, `Readonly`, `Pick`, `Record`) are short mapped types like these."
            },
            {
              "id": "ts8",
              "q": "What are conditional types and the infer keyword?",
              "a": "A conditional type picks a type based on a check: `T extends U ? X : Y`.\n- When `T` is a union, the condition is applied to **each member** separately (distributive). Wrap in brackets, `[T] extends [U]`, to turn that off.\n- **`infer`** declares a type variable inside the check, so you can pull a type out of another type.\n```ts\ntype IsString<T> = T extends string ? true : false;\n\ntype MyExclude<T, U> = T extends U ? never : T;\ntype A = MyExclude<'a' | 'b' | 'c', 'a'>;     // 'b' | 'c'\n\ntype MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;\ntype ElementOf<T> = T extends (infer E)[] ? E : never;\ntype Unwrap<T> = T extends Promise<infer V> ? Unwrap<V> : T;   // like Awaited\n\ntype R = MyReturnType<() => Promise<number>>;  // Promise<number>\ntype V = Unwrap<Promise<Promise<string>>>;      // string\n```\nBuilt-ins made this way: `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`."
            },
            {
              "id": "ts9",
              "q": "What are template literal types? Give a practical use.",
              "a": "Template literal types build string literal types with the same syntax as template strings. With unions, they produce every combination.\n```ts\ntype Size = 'sm' | 'md' | 'lg';\ntype Color = 'primary' | 'danger';\ntype ButtonClass = `btn-${Color}-${Size}`;   // 6 combinations\n\ntype EventName<T extends string> = `on${Capitalize<T>}`;\ntype Click = EventName<'click'>;              // 'onClick'\n\n// Typed CSS lengths and route params\ntype Px = `${number}px`;\nconst gap: Px = '12px';                        // '12 px' would be an error\n\ntype Params<P> = P extends `${string}:${infer Name}/${infer Rest}`\n  ? Name | Params<`/${Rest}`>\n  : P extends `${string}:${infer Name}` ? Name : never;\ntype P = Params<'/users/:userId/posts/:postId'>;   // 'userId' | 'postId'\n```\nTyped routers and typed event emitters use this to catch typos in strings at compile time."
            },
            {
              "id": "ts15",
              "q": "What are declaration files (.d.ts), and how do you type a library that has no types?",
              "a": "A `.d.ts` file holds **only types**, no runtime code. It describes the shape of JavaScript that exists elsewhere.\n- Many packages ship their own types (`\"types\"` in package.json). Others have community types in **DefinitelyTyped**: `npm i -D @types/lodash`.\n- For an untyped package, write a declaration yourself:\n```ts\n// src/types/legacy-chart.d.ts\ndeclare module 'legacy-chart' {\n  export interface ChartOptions { el: HTMLElement; data: number[] }\n  export function render(options: ChartOptions): void;\n}\n\n// Quick escape hatch (types everything as any):\ndeclare module 'some-untyped-lib';\n\n// Non-code imports\ndeclare module '*.svg' { const src: string; export default src; }\n\n// Add to a global\ndeclare global {\n  interface Window { analytics?: { track(event: string): void } }\n}\nexport {};\n```\nMake sure the folder is covered by `include` in tsconfig. **Module augmentation** (re-declaring an interface from a library) is how you add fields, for example a custom theme type for a UI library."
            }
          ]
        },
        {
          "title": "TypeScript with React",
          "items": [
            {
              "id": "158",
              "q": "How do you define props for a TypeScript functional component?",
              "a": "```tsx\ninterface ButtonProps {\n  label: string;\n  variant?: 'primary' | 'secondary';      // optional with union\n  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;\n  children?: React.ReactNode;\n}\n\nfunction Button({ label, variant = 'primary', onClick, children }: ButtonProps) {\n  return <button className={variant} onClick={onClick}>{label}{children}</button>;\n}\n\n// extend native element props\ntype InputProps = React.ComponentPropsWithoutRef<'input'> & { label: string };\n\n// generic component\nfunction List<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {\n  return <ul>{items.map(render)}</ul>;\n}\n```\n`React.FC` is optional; most teams type props directly. Use `React.ReactNode` for children."
            },
            {
              "id": "ts16",
              "q": "How do you type useState, useRef and useReducer?",
              "a": "```tsx\n// useState: inferred from the initial value; annotate when it starts empty\nconst [count, setCount] = useState(0);                 // number\nconst [user, setUser] = useState<User | null>(null);\nconst [tags, setTags] = useState<string[]>([]);        // [] alone would be never[]\n\n// useRef: two different uses\nconst inputRef = useRef<HTMLInputElement>(null);       // DOM ref, starts null\ninputRef.current?.focus();\nconst timerRef = useRef<number | undefined>(undefined); // mutable box\ntimerRef.current = window.setTimeout(save, 500);\n\n// useReducer: a discriminated union of actions\ntype Action =\n  | { type: 'add'; item: Item }\n  | { type: 'remove'; id: string }\n  | { type: 'clear' };\n\nfunction reducer(state: Item[], action: Action): Item[] {\n  switch (action.type) {\n    case 'add':    return [...state, action.item];\n    case 'remove': return state.filter(i => i.id !== action.id);\n    case 'clear':  return [];\n  }\n}\nconst [items, dispatch] = useReducer(reducer, []);\ndispatch({ type: 'remove', id: '1' });   // id is required, typos are errors\n```"
            },
            {
              "id": "ts17",
              "q": "How do you type event handlers and form inputs in React?",
              "a": "Use React's event types, with the element as the generic.\n```tsx\nfunction Search({ onSearch }: { onSearch: (q: string) => void }) {\n  const [q, setQ] = useState('');\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value);\n\n  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {\n    e.preventDefault();\n    onSearch(q);\n  };\n\n  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {\n    if (e.key === 'Escape') setQ('');\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input value={q} onChange={handleChange} onKeyDown={handleKey} />\n    </form>\n  );\n}\n```\n- Inline handlers (`onChange={e => setQ(e.target.value)}`) are typed for you, so no annotation is needed.\n- For a handler prop type, use `React.MouseEventHandler<HTMLButtonElement>` or `(e: React.MouseEvent<HTMLButtonElement>) => void`.\n- To reuse all native props: `React.ComponentPropsWithoutRef<'button'>`.\n- `e.target` is typed loosely for some events; `e.currentTarget` is always the element the handler is on."
            },
            {
              "id": "ts18",
              "q": "How do you type React Context and a custom hook safely?",
              "a": "Create the context with `undefined` as the default, and use a custom hook that throws if the provider is missing. Consumers then get a non-null type without `!` everywhere.\n```tsx\ntype AuthContextValue = {\n  user: User | null;\n  login: (email: string, password: string) => Promise<void>;\n  logout: () => void;\n};\n\nconst AuthContext = createContext<AuthContextValue | undefined>(undefined);\n\nexport function useAuth(): AuthContextValue {\n  const ctx = useContext(AuthContext);\n  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');\n  return ctx;\n}\n\n// A generic custom hook\nfunction useFetch<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  const [error, setError] = useState<Error | null>(null);\n  // … fetch and set …\n  return { data, error } as const;\n}\nconst { data } = useFetch<User[]>('/api/users');   // data: User[] | null\n```\nReturn a tuple with `as const` (`return [value, setValue] as const`) so callers get `[T, setter]` instead of an array of a union type."
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
          "title": "Typed utilities",
          "items": [
            {
              "id": "tc1",
              "q": "Write a generic groupBy function in TypeScript.",
              "code": "type Person = { name: string; team: 'web' | 'api' };\nconst people: Person[] = [\n  { name: 'Ana', team: 'web' },\n  { name: 'Ben', team: 'api' },\n  { name: 'Cy', team: 'web' },\n];\n\ngroupBy(people, p => p.team);\n// { web: [Ana, Cy], api: [Ben] }",
              "a": "```ts\nfunction groupBy<T, K extends PropertyKey>(\n  items: readonly T[],\n  getKey: (item: T) => K,\n): Partial<Record<K, T[]>> {\n  const groups: Partial<Record<K, T[]>> = {};\n  for (const item of items) {\n    const key = getKey(item);\n    (groups[key] ??= []).push(item);\n  }\n  return groups;\n}\n\nconst byTeam = groupBy(people, p => p.team);\nbyTeam.web;   // Person[] | undefined\n```\nPoints to mention:\n- **Two generics**: `T` for the items and `K` for the key, so the result is keyed by the real key type (`'web' | 'api'`), not just `string`.\n- `K extends PropertyKey` (`string | number | symbol`) because only those can be object keys.\n- The return type is `Partial<Record<…>>` because a key may have no items. Plain `Record<K, T[]>` would claim every key is present.\n- `readonly T[]` accepts both normal and readonly arrays.\n- Modern runtimes have `Object.groupBy(items, fn)`, which does the same thing."
            },
            {
              "id": "tc2",
              "q": "Write a type guard that checks unknown API data is a valid User.",
              "code": "type User = {\n  id: number;\n  name: string;\n  email: string;\n  roles: string[];\n};\n\nconst data: unknown = await res.json();\nif (isUser(data)) {\n  data.email.toLowerCase();   // data is User here\n}",
              "a": "```ts\nfunction isRecord(value: unknown): value is Record<string, unknown> {\n  return typeof value === 'object' && value !== null && !Array.isArray(value);\n}\n\nfunction isUser(value: unknown): value is User {\n  return (\n    isRecord(value) &&\n    typeof value.id === 'number' &&\n    typeof value.name === 'string' &&\n    typeof value.email === 'string' &&\n    Array.isArray(value.roles) &&\n    value.roles.every(r => typeof r === 'string')\n  );\n}\n```\nPoints to mention:\n- The return type **`value is User`** is what makes TypeScript narrow `data` after the `if`.\n- Check `null` separately: `typeof null === 'object'`.\n- TypeScript **trusts** a type guard without checking its logic, so a guard that forgets a field gives you a wrong type. That's why it's worth unit testing.\n- For bigger shapes, use a schema library such as **Zod**: `const User = z.object({ … }); type User = z.infer<typeof User>;`. The schema then becomes the single source of truth for both the runtime check and the type."
            },
            {
              "id": "tc3",
              "q": "Use a discriminated union to calculate the area of different shapes, with an exhaustive check.",
              "code": "type Shape =\n  | { kind: 'circle'; radius: number }\n  | { kind: 'square'; size: number }\n  | { kind: 'rectangle'; width: number; height: number };\n\narea({ kind: 'circle', radius: 1 });               // 3.14159…\narea({ kind: 'rectangle', width: 2, height: 3 });  // 6",
              "a": "```ts\nfunction assertNever(value: never): never {\n  throw new Error(`Unknown shape: ${JSON.stringify(value)}`);\n}\n\nfunction area(shape: Shape): number {\n  switch (shape.kind) {\n    case 'circle':\n      return Math.PI * shape.radius ** 2;\n    case 'square':\n      return shape.size ** 2;\n    case 'rectangle':\n      return shape.width * shape.height;\n    default:\n      return assertNever(shape);\n  }\n}\n```\nPoints to mention:\n- Inside each `case`, TypeScript **narrows** `shape`, so `shape.radius` only exists in the circle branch.\n- `assertNever(shape)` only compiles when every kind is handled. Add `{ kind: 'triangle' }` to `Shape` and this line becomes a compile error, pointing at the code you need to update.\n- It also throws at runtime, which protects you when bad data arrives from an API, where types don't exist."
            },
            {
              "id": "tc4",
              "q": "Write a type-safe pick function: pick(obj, ['a', 'b']).",
              "code": "const user = { id: 1, name: 'Ana', email: 'ana@example.com', password: 'secret' };\n\nconst publicUser = pick(user, ['id', 'name']);\n// { id: 1, name: 'Ana' }, typed as { id: number; name: string }\n// pick(user, ['nope']);   // should be a compile error",
              "a": "```ts\nfunction pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {\n  const result = {} as Pick<T, K>;\n  for (const key of keys) {\n    if (key in obj) result[key] = obj[key];\n  }\n  return result;\n}\n\nfunction omit<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Omit<T, K> {\n  const result = { ...obj };\n  for (const key of keys) delete result[key];\n  return result;\n}\n```\nPoints to mention:\n- `K extends keyof T` makes `'nope'` a compile error and gives autocomplete for the keys.\n- The return type `Pick<T, K>` is built from the keys actually passed, so `publicUser.password` is an error.\n- `{} as Pick<T, K>` is one of the few fair uses of `as`: the object is filled in by the loop right after.\n- The `key in obj` check skips keys missing at runtime, instead of adding them as `undefined`."
            },
            {
              "id": "tc5",
              "q": "Build a typed event emitter with on, off and emit.",
              "code": "type Events = {\n  login: { userId: string };\n  logout: undefined;\n};\n\nconst emitter = createEmitter<Events>();\nconst unsubscribe = emitter.on('login', e => console.log(e.userId));\nemitter.emit('login', { userId: 'u1' });\n// emitter.emit('login', { id: 1 });   // compile error\nunsubscribe();",
              "a": "```ts\ntype Handler<T> = (payload: T) => void;\n\nfunction createEmitter<E extends Record<string, unknown>>() {\n  const handlers: { [K in keyof E]?: Set<Handler<E[K]>> } = {};\n\n  function on<K extends keyof E>(event: K, handler: Handler<E[K]>) {\n    (handlers[event] ??= new Set()).add(handler);\n    return () => off(event, handler);\n  }\n\n  function off<K extends keyof E>(event: K, handler: Handler<E[K]>) {\n    handlers[event]?.delete(handler);\n  }\n\n  function emit<K extends keyof E>(event: K, payload: E[K]) {\n    // Copy first, so a handler that unsubscribes doesn't break the loop.\n    [...(handlers[event] ?? [])].forEach(h => h(payload));\n  }\n\n  return { on, off, emit };\n}\n```\nPoints to mention:\n- One `Events` map drives everything: the event name is `keyof E`, and the payload is `E[K]`, so names and payloads can't be mismatched.\n- A **`Set`** stops the same handler being added twice and makes removal O(1).\n- `on` returns an **unsubscribe function**, which fits React's `useEffect` cleanup well.\n- Follow-ups: `once`, error isolation (one throwing handler shouldn't stop the others), and listener limits to spot leaks."
            },
            {
              "id": "tc6",
              "q": "Write an async retry helper with a typed result.",
              "code": "const user = await retry(() => fetchUser(1), { attempts: 3 });\n// Tries up to 3 times, then throws the last error.",
              "a": "```ts\ntype RetryOptions = { attempts: number; delayMs?: number };\n\nconst sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));\n\nasync function retry<T>(fn: () => Promise<T>, { attempts, delayMs = 0 }: RetryOptions): Promise<T> {\n  let lastError: unknown;\n  for (let i = 1; i <= attempts; i++) {\n    try {\n      return await fn();\n    } catch (err) {\n      lastError = err;\n      if (i < attempts && delayMs > 0) await sleep(delayMs * 2 ** (i - 1));   // exponential backoff\n    }\n  }\n  throw lastError;\n}\n```\nPoints to mention:\n- The generic **`T` flows from `fn` to the result**, so `retry(() => fetchUser(1), …)` returns `Promise<User>` with no annotation.\n- **`return await`** inside `try` matters: without `await`, a rejected promise would skip the `catch`.\n- `lastError` is `unknown`, because anything can be thrown in JavaScript.\n- Production follow-ups: only retry errors that can recover (network errors, 5xx, 429, not 4xx), add jitter to the delay, and support an `AbortSignal` to cancel."
            }
          ]
        }
      ]
    }
  ]
});
