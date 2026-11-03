/**
 * Track: Next.js. Loaded on every page (see assets/js/app.js).
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
  "slug": "nextjs",
  "title": "Next.js",
  "description": "Server and Client Components, the App Router, data fetching and caching, Server Actions, rendering strategies and auth.",
  "tabs": [
    {
      "slug": "theory",
      "title": "Theory",
      "sections": [
        {
          "title": "Next.js essentials",
          "items": [
            {
              "id": "159",
              "q": "What is the difference between React.js and Next.js?",
              "a": "- **React** is a UI **library**: components and rendering. You choose routing, data fetching, bundling, SSR setup yourself; typically a client-rendered SPA.\n- **Next.js** is a **framework** built on React that adds: file-based routing, SSR/SSG/ISR, React Server Components, API routes/route handlers, server actions, image/font/script optimization, middleware, built-in code splitting, and easy deployment (Vercel or Node).\nNext.js gives better SEO and initial load and full-stack capability; plain React (Vite) is simpler for internal dashboards or apps behind login where SEO doesn't matter."
            },
            {
              "id": "129",
              "q": "What is the difference between CSR, SSR, and SSG?",
              "a": "- **CSR (Client-Side Rendering)**: server sends a mostly empty HTML + JS bundle; browser builds the UI. Slower first paint, weaker SEO, but rich interactivity and cheap hosting (Create React App / Vite SPA).\n- **SSR (Server-Side Rendering)**: HTML is generated **on each request** on the server, then hydrated in the browser. Fast first paint, good SEO, always fresh data; higher server cost and TTFB.\n- **SSG (Static Site Generation)**: HTML generated **at build time** and served from a CDN. Fastest, cheapest; data can go stale — use **ISR** (Incremental Static Regeneration) to re-generate periodically.\nNext.js lets you mix these per page/route."
            },
            {
              "id": "161",
              "q": "What is server-side rendering?",
              "a": "Server-side rendering generates the page's HTML **on the server for each request**, sends it to the browser (so content is visible immediately), then React **hydrates** it to make it interactive.\n- **Pros**: faster first contentful paint, better SEO and social previews, data is fresh per request, works on slow devices.\n- **Cons**: more server load and cost, slower TTFB than static, hydration cost, need to handle browser-only APIs carefully.\nIn Next.js: Pages Router `getServerSideProps`; App Router — server components with dynamic data (`cache: 'no-store'` / `dynamic = 'force-dynamic'`)."
            },
            {
              "id": "130",
              "q": "What is hydration in React/Next.js?",
              "a": "Hydration is the process where React, on the client, takes the HTML rendered on the server and **attaches event listeners and state** to it, making it interactive — instead of rebuilding the DOM from scratch. (`hydrateRoot` in React 18.)\n- The client render must produce the **same markup** as the server, otherwise you get hydration mismatch warnings (common causes: `Date.now()`, `Math.random()`, `window` checks, locale formatting during render). Move browser-only logic into `useEffect`.\n- React 18 supports **selective/streaming hydration** with Suspense; Next.js App Router uses **Server Components** that don't need hydration at all, reducing JS shipped."
            },
            {
              "id": "164",
              "q": "How does Next.js improve SEO?",
              "a": "- **Pre-rendered HTML** (SSR/SSG/ISR): crawlers see full content immediately instead of an empty `div` waiting for JS.\n- **Metadata API** (`export const metadata` / `generateMetadata`) or `next/head`: titles, descriptions, Open Graph/Twitter tags, canonical URLs per page.\n- **Performance / Core Web Vitals** (ranking factor): automatic code splitting, `next/image` (lazy, responsive, modern formats), `next/font` (no layout shift), `next/script` strategies.\n- Clean, file-based URLs and dynamic routes; `sitemap.js` and `robots.js` generation; structured data (JSON-LD)."
            }
          ]
        },
        {
          "title": "App Router",
          "items": [
            {
              "id": "160",
              "q": "What is the difference between App Router and Pages Router?",
              "a": "- **Pages Router** (`pages/` dir, older): each file is a route; data fetching with `getServerSideProps`, `getStaticProps`, `getStaticPaths`; all components are client components; layouts via `_app.js`/`_document.js`; API routes in `pages/api`.\n- **App Router** (`app/` dir, Next 13+, recommended): built on **React Server Components** (server by default, `'use client'` to opt in); nested **layouts** (`layout.js`), `loading.js` and `error.js` per segment; data fetching with `async` components and `fetch` caching options; streaming with Suspense; **Server Actions**; route handlers (`route.js`).\nApp Router ships less JS and gives more flexible layouts; Pages Router is simpler and still supported."
            },
            {
              "id": "nx1",
              "q": "What is the difference between Server Components and Client Components?",
              "a": "In the App Router, every component is a **Server Component by default**. You opt a file into the client with `'use client'` at the top.\n- **Server Components** run only on the server (at build time or per request). They can be `async`, read databases and secrets directly, and **send no JavaScript** to the browser. They can't use state, effects, event handlers or browser APIs.\n- **Client Components** are rendered to HTML on the server too, then **hydrated** in the browser. Use them for interactivity: `useState`, `useEffect`, `onClick`, browser APIs, and most UI libraries that use context.\n```tsx\n// app/products/page.tsx (Server Component)\nimport AddToCart from './add-to-cart';\nexport default async function Page() {\n  const products = await db.product.findMany();       // runs on the server\n  return products.map(p => <div key={p.id}>{p.name} <AddToCart id={p.id} /></div>);\n}\n\n// app/products/add-to-cart.tsx\n'use client';\nexport default function AddToCart({ id }: { id: string }) {\n  const [added, setAdded] = useState(false);\n  return <button onClick={() => setAdded(true)}>{added ? 'Added' : 'Add'}</button>;\n}\n```\nKey rules:\n- `'use client'` marks a **boundary**: everything that file imports becomes client code too. Keep it on small leaf components.\n- Props from server to client must be **serializable** (no functions, except Server Actions).\n- A Client Component can't import a Server Component, but it can **receive one as `children`** or another prop."
            },
            {
              "id": "nx2",
              "q": "What are the special files in an App Router route segment?",
              "a": "Each folder in `app/` is a route segment. These file names have a special meaning:\n- **`page.tsx`**: the UI for that URL. A folder without `page` isn't a public route.\n- **`layout.tsx`**: wraps the segment and its children. It **stays mounted** across navigation, so its state is kept. The root layout must render `<html>` and `<body>`.\n- **`template.tsx`**: like a layout, but **re-mounts** on every navigation (useful for enter animations or resetting state).\n- **`loading.tsx`**: shown instantly while the segment loads. Next wraps the page in a Suspense boundary for you.\n- **`error.tsx`**: an error boundary for the segment. It must be a Client Component and receives `error` and `reset`.\n- **`not-found.tsx`**: shown when `notFound()` is called or no route matches.\n- **`route.ts`**: an API endpoint (Route Handler) instead of a page.\n- Also: `global-error.tsx`, `default.tsx` (parallel routes), and metadata files like `opengraph-image.tsx`, `sitemap.ts`, `robots.ts`.\n\nNesting order for one segment: `layout` → `template` → `error` → `loading` → `not-found` → `page`."
            },
            {
              "id": "162",
              "q": "What is dynamic routing in Next.js?",
              "a": "Routes with variable segments, defined by brackets in the file name:\n- App Router: `app/products/[id]/page.js` → `/products/123`; access with `params` prop (`params.id`) or `useParams()` in client components.\n- Catch-all: `[...slug]` (`/docs/a/b`), optional catch-all: `[[...slug]]`.\n- Pages Router: `pages/products/[id].js` with `useRouter().query.id`.\n- Pre-generate pages at build time with `generateStaticParams` (App Router) or `getStaticPaths` (Pages Router).\n```jsx\n// app/products/[id]/page.js\nexport default async function Product({ params }) {\n  const { id } = await params;   // params is a promise in Next 15+\n  const product = await getProduct(id);\n  return <h1>{product.title}</h1>;\n}\n```"
            },
            {
              "id": "nx3",
              "q": "What are route groups, parallel routes and intercepting routes?",
              "a": "- **Route groups** `(name)`: a folder in brackets organises routes **without changing the URL**. Use them to give sections different layouts, for example `app/(marketing)/about` and `app/(dashboard)/settings`, each group with its own `layout.tsx`.\n- **Parallel routes** `@slot`: render **several pages in one layout at the same time**, each with its own loading and error states. The layout receives them as props:\n```tsx\n// app/dashboard/layout.tsx with app/dashboard/@analytics and app/dashboard/@team\nexport default function Layout({ children, analytics, team }) {\n  return <>{children}<section>{analytics}</section><section>{team}</section></>;\n}\n```\n- **Intercepting routes** `(.)photo/[id]`: show a route **inside the current page** during client navigation, while a direct visit or refresh shows the full page.\n\nEach slot needs a `default.tsx` for URLs it has no page for (from Next 16 the build fails without one; returning `null` is fine).\n\nTogether, parallel and intercepting routes make the common **modal pattern**: clicking a photo in a feed opens it in a modal with a shareable URL (`/photo/42`), and opening that URL directly shows the full photo page."
            },
            {
              "id": "nx4",
              "q": "How does navigation work in the App Router? What is prefetching?",
              "a": "- **`<Link href>`** does client-side (soft) navigation. Only the segments that change are fetched and rendered; shared layouts stay mounted and keep their state.\n- **Prefetching**: in production, links in the viewport are prefetched in the background. Static routes are prefetched fully; dynamic routes are prefetched up to the nearest `loading.tsx`, so the loading state shows instantly on click.\n- **`useRouter()`** (from `next/navigation`) for navigation in code: `router.push`, `replace`, `back`, `refresh`. `refresh()` re-fetches Server Components for the current route without losing client state.\n- **`redirect()`** and **`permanentRedirect()`** in Server Components, Server Actions and Route Handlers.\n- **`usePathname()`**, **`useSearchParams()`** and **`useParams()`** read the URL in Client Components.\n```tsx\n'use client';\nimport { useRouter, useSearchParams } from 'next/navigation';\n\nfunction Filter() {\n  const router = useRouter();\n  const params = useSearchParams();\n  const setSort = (sort: string) => {\n    const next = new URLSearchParams(params);\n    next.set('sort', sort);\n    router.push(`?${next}`);   // URL is the source of truth for filters\n  };\n}\n```\nNote: `useRouter` from `next/router` is the Pages Router version; mixing them up is a common bug."
            },
            {
              "id": "nx5",
              "q": "What is middleware in Next.js, and what is it good for?",
              "a": "Middleware runs **before a request is matched to a route**, so it can redirect, rewrite, or change request and response headers. In Next.js 16 it was renamed to **proxy**: the file is `proxy.ts`, the exported function is `proxy`, and it runs on the Node.js runtime. The logic is the same; `middleware.ts` still works but is deprecated.\n```ts\n// proxy.ts at the project root (middleware.ts before Next 16)\nimport { NextResponse, type NextRequest } from 'next/server';\n\nexport function proxy(req: NextRequest) {   // named `middleware` before Next 16\n  const session = req.cookies.get('session');\n  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {\n    return NextResponse.redirect(new URL('/login', req.url));\n  }\n  return NextResponse.next();\n}\n\nexport const config = { matcher: ['/dashboard/:path*'] };\n```\nGood uses: auth **redirects**, locale detection and i18n rewrites, A/B test bucketing, bot blocking, adding security headers.\n\nLimits and cautions:\n- It runs on **every matched request**, so keep it fast. No slow database calls.\n- It should be an **optimistic check** only. Always verify auth again where data is read (Server Components, Server Actions, Route Handlers). In 2025 a vulnerability (CVE-2025-29927) let attackers skip middleware with a crafted header, which broke apps that relied on it alone."
            }
          ]
        },
        {
          "title": "Data fetching & caching",
          "items": [
            {
              "id": "nx6",
              "q": "How do you fetch data in the App Router? How do you avoid request waterfalls?",
              "a": "Fetch directly in **async Server Components**: no `useEffect`, no loading state on the client, and secrets stay on the server.\n```tsx\nexport default async function Page({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params;\n  // Start both requests at once instead of one after the other\n  const [user, orders] = await Promise.all([getUser(id), getOrders(id)]);\n  return <Profile user={user} orders={orders} />;\n}\n```\nWays to avoid waterfalls:\n- **Start requests in parallel** with `Promise.all` when they don't depend on each other.\n- **Stream with Suspense**: let the fast part render first and wrap slow parts in `<Suspense>` with their own async component.\n- **Fetch where the data is used**. Identical `fetch` calls in one render are deduplicated (request memoization), and `React.cache()` does the same for database calls, so you don't need to fetch at the top and drill props.\n- **Preload**: call a data function early (without awaiting) so it's already running when a child needs it.\n\nClient-side fetching (TanStack Query, SWR) is still right for data that changes after load: polling, infinite scroll, or user-specific data in highly interactive views."
            },
            {
              "id": "nx7",
              "q": "Explain caching in the Next.js App Router.",
              "a": "There are several layers. Interviewers mainly want to know what each one stores and how to invalidate it.\n- **Request memoization**: the same `fetch` (same URL and options) in one render runs once. It lasts for one request only.\n- **Data cache**: `fetch` results stored on the server **across requests and deploys**. Opt in with `fetch(url, { cache: 'force-cache' })` or `{ next: { revalidate: 60, tags: ['products'] } }`.\n- **Full route cache**: static routes are rendered to HTML and RSC payload at build time and served like static files.\n- **Router cache**: the browser keeps visited and prefetched segments in memory for fast back/forward navigation.\n\nInvalidation:\n- **Time-based**: `revalidate` (seconds) on a fetch, or `export const revalidate = 60` for a route.\n- **On demand**: `revalidatePath('/products')` or `revalidateTag('products', 'max')` after a mutation, usually in a Server Action. Next 16 also adds `updateTag('products')` for Server Actions, so the user sees their own change immediately (read-your-writes).\n- `router.refresh()` clears the router cache for the current route.\n\nVersion notes worth mentioning: **Next 15 changed the defaults**, so `fetch` and GET Route Handlers are **not cached** unless you opt in (in Next 13–14 they were cached by default, which surprised many teams). **Next 16** adds **Cache Components** (`cacheComponents: true` in `next.config`): caching becomes fully opt-in with the `'use cache'` directive on a page, component or function, and everything else runs at request time."
            },
            {
              "id": "nx8",
              "q": "What is ISR, and how does on-demand revalidation work?",
              "a": "**Incremental Static Regeneration** serves a static page from the cache, then **regenerates it in the background** after a set time. Visitors get static speed, and content stays fresh without a full rebuild.\n```tsx\n// app/blog/[slug]/page.tsx\nexport const revalidate = 3600;   // regenerate at most once an hour\n\nexport async function generateStaticParams() {\n  const posts = await getPosts();\n  return posts.map(p => ({ slug: p.slug }));   // pre-build known posts\n}\n```\nHow it behaves (stale-while-revalidate): after the time passes, the **next visitor still gets the old page**, which triggers a rebuild; later visitors get the new one. Paths not returned by `generateStaticParams` are built on their first request and then cached.\n\n**On-demand revalidation** updates the page right away when content changes, instead of waiting:\n```ts\n// e.g. a CMS webhook calls this Route Handler, or a Server Action after saving\nimport { revalidateTag, revalidatePath } from 'next/cache';\n\nrevalidatePath('/blog/my-post');\nrevalidateTag('posts', 'max');   // every fetch tagged 'posts' (Next 16 needs the 2nd argument)\n```\nPages Router equivalent: `getStaticProps` returning `{ revalidate: 60 }`, and `res.revalidate(path)`."
            },
            {
              "id": "nx9",
              "q": "What are Server Actions? How do you use them safely?",
              "a": "Server Actions are **async functions that run on the server** but can be called from forms or client code. Next creates the POST endpoint for you.\n```tsx\n// app/todos/actions.ts\n'use server';\nimport { z } from 'zod';\nimport { revalidatePath } from 'next/cache';\n\nconst Todo = z.object({ title: z.string().min(1).max(200) });\n\nexport async function addTodo(prevState: unknown, formData: FormData) {\n  const user = await getCurrentUser();                 // 1. auth check\n  if (!user) return { error: 'Please sign in' };\n  const parsed = Todo.safeParse({ title: formData.get('title') });   // 2. validate\n  if (!parsed.success) return { error: 'Title is required' };\n  await db.todo.create({ data: { ...parsed.data, userId: user.id } });\n  revalidatePath('/todos');                              // 3. refresh cached UI\n  return { error: null };\n}\n\n// In a Client Component:\nconst [state, formAction, pending] = useActionState(addTodo, { error: null });\n<form action={formAction}><input name=\"title\" /><button disabled={pending}>Add</button></form>\n```\n- Forms with actions work **before JavaScript loads** (progressive enhancement).\n- **Every Server Action is a public endpoint.** Anyone can call it with any data, so always check auth and **validate input** inside it, as you would in an API route.\n- Return plain, serializable results (errors as values), and use `revalidatePath`/`revalidateTag` or `redirect()` afterwards."
            },
            {
              "id": "163",
              "q": "How do you handle API routes in Next.js?",
              "a": "- **Pages Router**: files in `pages/api/` become endpoints: `export default function handler(req, res) { res.status(200).json({...}) }`.\n- **App Router**: **Route Handlers** in `app/api/.../route.js` exporting functions per HTTP method:\n```js\n// app/api/users/route.js\nexport async function GET(request) {\n  const users = await db.user.findMany();\n  return Response.json(users);\n}\nexport async function POST(request) {\n  const body = await request.json();\n  const user = await db.user.create({ data: body });\n  return Response.json(user, { status: 201 });\n}\n```\nThey run on the server (Node or Edge runtime), so you can use secrets, DB access, and act as a BFF/proxy. For form mutations, **Server Actions** are an alternative. Add auth checks, validation and error handling."
            },
            {
              "id": "nx10",
              "q": "When would you use a Route Handler instead of a Server Action?",
              "a": "- **Server Actions**: mutations triggered by **your own UI**, such as form submits, likes and saves. Less code, built-in progressive enhancement, and they work with `revalidatePath` and `useActionState`. They're always POST and aren't meant to be called from outside your app.\n- **Route Handlers** (`app/api/…/route.ts`): a real **HTTP API** you control. Use them for webhooks from other services (Stripe, a CMS), endpoints for mobile apps or third parties, GET endpoints you want to cache or call with `fetch` from the client, non-JSON responses (file downloads, streaming, RSS, images), and whenever you need specific methods, status codes, headers or CORS.\n\nReading data in Server Components needs **neither**: call your data layer directly. A common mistake is having a Server Component `fetch` its own `/api` route, which adds an extra network hop and fails at build time."
            },
            {
              "id": "nx11",
              "q": "How does streaming work in Next.js?",
              "a": "Streaming sends the page **in pieces**: the server sends HTML for the parts that are ready, then streams in each slow part when its data arrives. Users see content sooner, and slow requests don't block the whole page.\n- **`loading.tsx`**: an instant loading UI for a whole route segment.\n- **`<Suspense>`**: finer control around any async component.\n```tsx\nexport default function Dashboard() {\n  return (\n    <>\n      <Header />                                   {/* sent immediately */}\n      <Suspense fallback={<CardSkeleton />}>\n        <Revenue />                                {/* async: streamed when ready */}\n      </Suspense>\n      <Suspense fallback={<TableSkeleton />}>\n        <LatestOrders />\n      </Suspense>\n    </>\n  );\n}\n```\n- Each Suspense boundary hydrates on its own (**selective hydration**), and React hydrates the part the user interacts with first.\n- Skeletons the same size as the final content avoid layout shift (CLS).\n- After streaming starts, the status code is already sent. Call `notFound()` or `redirect()` before the first `await` that streams, or the user gets a 200 with the not-found UI.\n- **Partial Prerendering** goes further: a static shell is served from the CDN, with dynamic holes streamed in the same response."
            },
            {
              "id": "nx12",
              "q": "How do you handle errors and not-found pages in the App Router?",
              "a": "- **`error.tsx`**: an error boundary for a route segment. It catches errors from the segment's pages and children (but not its own `layout.tsx`, which needs the parent's `error.tsx`). It must be a Client Component.\n```tsx\n'use client';\nexport default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {\n  useEffect(() => { reportError(error); }, [error]);\n  return <div><p>Something went wrong.</p><button onClick={() => reset()}>Try again</button></div>;\n}\n```\n- **`global-error.tsx`**: catches errors in the root layout. It replaces the whole page, so it renders its own `<html>` and `<body>`.\n- **`notFound()`** from `next/navigation` shows the nearest **`not-found.tsx`** and returns a 404.\n```tsx\nconst post = await getPost(slug);\nif (!post) notFound();\n```\n- In production, error messages from Server Components are **hidden** from the browser and replaced with a `digest` you can match in server logs, so secrets don't leak.\n- For expected errors in Server Actions (validation, \"email taken\"), **return them as values** and show them in the form. Throwing is for unexpected failures."
            }
          ]
        },
        {
          "title": "Rendering & production",
          "items": [
            {
              "id": "nx13",
              "q": "What makes a route static or dynamic in the App Router?",
              "a": "Next decides at build time whether a route can be **prerendered once (static)** or must render **per request (dynamic)**.\n\nA route becomes **dynamic** when it uses request-time information:\n- `cookies()`, `headers()`, `draftMode()`\n- `searchParams` in a page\n- `fetch` with `cache: 'no-store'` or other uncached data (the default from Next 15)\n- `connection()`, or `export const dynamic = 'force-dynamic'`\n\nOtherwise it's **static**, built at deploy time and served from the CDN.\n```tsx\nexport const dynamic = 'force-static';   // or 'force-dynamic', 'error' (fail the build if dynamic)\nexport const revalidate = 300;           // static, but rebuilt at most every 5 minutes (ISR)\n```\n- The build output shows each route as static (○), SSG (●) or dynamic (ƒ), which is a quick way to spot a page that became dynamic by accident (for example, a layout that reads `cookies()` makes everything under it dynamic).\n- The goal is to keep **as much static as possible** and move request-specific parts into small Suspense-wrapped components. Partial Prerendering and Cache Components (Next 16) apply this inside one page: a static shell with dynamic pieces."
            },
            {
              "id": "nx14",
              "q": "How do you add authentication to a Next.js App Router app?",
              "a": "Check auth in **layers**, close to the data:\n1. **Session**: store a session id or signed token in an **httpOnly, Secure, SameSite** cookie, set on the server after login (Server Action or Route Handler). Libraries: Auth.js (NextAuth), Clerk, Better Auth, Supabase Auth.\n2. **Middleware / proxy**: an **optimistic** check that reads the cookie and redirects signed-out users away from protected routes. Fast, but not a security boundary on its own.\n3. **Data access layer**: a `verifySession()` function called by **every Server Component, Server Action and Route Handler** that reads or changes protected data. This is the real check.\n```ts\n// lib/dal.ts\nimport 'server-only';\nimport { cache } from 'react';\n\nexport const verifySession = cache(async () => {\n  const token = (await cookies()).get('session')?.value;\n  const session = await decrypt(token);\n  if (!session?.userId) redirect('/login');\n  return { userId: session.userId, role: session.role };\n});\n```\nCommon mistakes:\n- Checking only in a **layout**: layouts don't re-render on every navigation, and Server Actions and Route Handlers bypass them.\n- Hiding a button but not checking permissions in the action behind it.\n- Passing whole user objects (with hashes or tokens) to Client Components. Pass only the fields the UI needs."
            },
            {
              "id": "nx15",
              "q": "How do environment variables work in Next.js? How do you keep secrets server-only?",
              "a": "- Variables in `.env`, `.env.local`, `.env.production` and so on are loaded automatically. `.env*.local` is for secrets and shouldn't be committed.\n- By default, variables are **only available on the server** (`process.env.DATABASE_URL`).\n- Variables prefixed **`NEXT_PUBLIC_`** are **inlined into the client bundle at build time**. Anyone can read them, so never put secrets there. Because they're inlined, changing one needs a **rebuild**, not just a restart.\n- To stop server code from being imported into a Client Component by accident, add `import 'server-only';` at the top of the module. The build then fails if it ends up in client code.\n```ts\n// lib/payments.ts\nimport 'server-only';\nconst stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);   // never reaches the browser\n```\n- **Validate** env variables at startup (for example with Zod or `@t3-oss/env-nextjs`) so a missing value fails the deploy instead of breaking at runtime.\n- Values a client needs at runtime (not build time) should come from the server, for example passed as props from a Server Component."
            },
            {
              "id": "nx16",
              "q": "What does next/image do, and how do you use it well?",
              "a": "`next/image` wraps `<img>` and handles the usual image performance work for you:\n- **Resizes and converts** images on demand to modern formats (WebP/AVIF) and serves a `srcset`, so phones don't download desktop-sized files.\n- **Lazy-loads** images below the fold by default.\n- **Prevents layout shift**: it needs `width` and `height` (or `fill` with a sized parent) so space is reserved.\n```tsx\nimport Image from 'next/image';\nimport hero from './hero.jpg';   // static import: size and blur placeholder are automatic\n\n<Image src={hero} alt=\"Team at work\" loading=\"eager\" fetchPriority=\"high\" placeholder=\"blur\" />\n\n<div style={{ position: 'relative', aspectRatio: '16 / 9' }}>\n  <Image src={product.imageUrl} alt={product.name} fill sizes=\"(max-width: 768px) 100vw, 33vw\" />\n</div>\n```\nUsing it well:\n- Don't lazy-load the **LCP image** (usually the hero): use `loading=\"eager\"` or `fetchPriority=\"high\"`. Older code uses the `priority` prop, which Next 16 deprecated in favour of `preload`.\n- Always set **`sizes`** with `fill` or responsive layouts. Without it, the browser may pick an image far larger than needed.\n- Remote images need their hosts allowed in `next.config` (`images.remotePatterns`), which stops others using your optimiser as a free proxy.\n- Write meaningful `alt` text, or `alt=\"\"` for decorative images."
            },
            {
              "id": "nx17",
              "q": "What is the difference between the Edge and Node.js runtimes?",
              "a": "- **Node.js runtime** (default): full Node APIs and npm packages, database drivers, file system. Runs in a region (or serverless function). Use it for most pages, Server Actions and Route Handlers.\n- **Edge runtime**: a lightweight runtime built on Web APIs (`fetch`, `Request`, `Response`, Web Crypto). It starts very fast and can run close to the user, but has **no Node APIs**, a code size limit, and many npm packages and database drivers don't work there.\n```ts\nexport const runtime = 'edge';   // per route; 'nodejs' is the default\n```\nThings to say in an interview:\n- Edge helps with **latency for simple, global logic**: redirects, rewrites, A/B tests, geolocation, auth token checks. That's why middleware traditionally ran on Edge.\n- Running a page on the edge doesn't help if its **database is in one region**: each query still travels back to that region, often making it slower. Keep data-heavy work in Node, close to the database.\n- Next has moved toward Node as the default everywhere: in Next 16, `proxy.ts` (formerly middleware) runs on Node."
            }
          ]
        }
      ]
    }
  ]
});
