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
  "description": "Types vs interfaces, any vs unknown, utility types and typing React components.",
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
              "id": "157",
              "q": "Explain Partial, Required, Pick and Omit.",
              "a": "Built-in utility types that transform other types:\n```ts\ninterface User { id: number; name: string; email?: string }\n\ntype A = Partial<User>;          // all optional: { id?; name?; email? }  — e.g. update payloads\ntype B = Required<User>;         // all required, email no longer optional\ntype C = Pick<User, 'id' | 'name'>;   // only id and name\ntype D = Omit<User, 'email'>;    // everything except email\n```\nOthers worth mentioning: `Readonly<T>`, `Record<K, V>`, `ReturnType<F>`, `Parameters<F>`, `Exclude`, `Extract`, `NonNullable`, `Awaited`."
            },
            {
              "id": "158",
              "q": "How do you define props for a TypeScript functional component?",
              "a": "```tsx\ninterface ButtonProps {\n  label: string;\n  variant?: 'primary' | 'secondary';      // optional with union\n  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;\n  children?: React.ReactNode;\n}\n\nfunction Button({ label, variant = 'primary', onClick, children }: ButtonProps) {\n  return <button className={variant} onClick={onClick}>{label}{children}</button>;\n}\n\n// extend native element props\ntype InputProps = React.ComponentPropsWithoutRef<'input'> & { label: string };\n\n// generic component\nfunction List<T>({ items, render }: { items: T[]; render: (item: T) => React.ReactNode }) {\n  return <ul>{items.map(render)}</ul>;\n}\n```\n`React.FC` is optional; most teams type props directly. Use `React.ReactNode` for children."
            }
          ]
        }
      ]
    }
  ]
});
