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
  "description": "Rendering strategies, hydration, the App Router, routing, API routes and SEO.",
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
              "id": "160",
              "q": "What is the difference between App Router and Pages Router?",
              "a": "- **Pages Router** (`pages/` dir, older): each file is a route; data fetching with `getServerSideProps`, `getStaticProps`, `getStaticPaths`; all components are client components; layouts via `_app.js`/`_document.js`; API routes in `pages/api`.\n- **App Router** (`app/` dir, Next 13+, recommended): built on **React Server Components** (server by default, `'use client'` to opt in); nested **layouts** (`layout.js`), `loading.js` and `error.js` per segment; data fetching with `async` components and `fetch` caching options; streaming with Suspense; **Server Actions**; route handlers (`route.js`).\nApp Router ships less JS and gives more flexible layouts; Pages Router is simpler and still supported."
            },
            {
              "id": "162",
              "q": "What is dynamic routing in Next.js?",
              "a": "Routes with variable segments, defined by brackets in the file name:\n- App Router: `app/products/[id]/page.js` → `/products/123`; access with `params` prop (`params.id`) or `useParams()` in client components.\n- Catch-all: `[...slug]` (`/docs/a/b`), optional catch-all: `[[...slug]]`.\n- Pages Router: `pages/products/[id].js` with `useRouter().query.id`.\n- Pre-generate pages at build time with `generateStaticParams` (App Router) or `getStaticPaths` (Pages Router).\n```jsx\n// app/products/[id]/page.js\nexport default async function Product({ params }) {\n  const { id } = await params;   // params is a promise in Next 15+\n  const product = await getProduct(id);\n  return <h1>{product.title}</h1>;\n}\n```"
            },
            {
              "id": "163",
              "q": "How do you handle API routes in Next.js?",
              "a": "- **Pages Router**: files in `pages/api/` become endpoints: `export default function handler(req, res) { res.status(200).json({...}) }`.\n- **App Router**: **Route Handlers** in `app/api/.../route.js` exporting functions per HTTP method:\n```js\n// app/api/users/route.js\nexport async function GET(request) {\n  const users = await db.user.findMany();\n  return Response.json(users);\n}\nexport async function POST(request) {\n  const body = await request.json();\n  const user = await db.user.create({ data: body });\n  return Response.json(user, { status: 201 });\n}\n```\nThey run on the server (Node or Edge runtime), so you can use secrets, DB access, and act as a BFF/proxy. For form mutations, **Server Actions** are an alternative. Add auth checks, validation and error handling."
            },
            {
              "id": "164",
              "q": "How does Next.js improve SEO?",
              "a": "- **Pre-rendered HTML** (SSR/SSG/ISR): crawlers see full content immediately instead of an empty `div` waiting for JS.\n- **Metadata API** (`export const metadata` / `generateMetadata`) or `next/head`: titles, descriptions, Open Graph/Twitter tags, canonical URLs per page.\n- **Performance / Core Web Vitals** (ranking factor): automatic code splitting, `next/image` (lazy, responsive, modern formats), `next/font` (no layout shift), `next/script` strategies.\n- Clean, file-based URLs and dynamic routes; `sitemap.js` and `robots.js` generation; structured data (JSON-LD)."
            }
          ]
        }
      ]
    }
  ]
});
