/**
 * Track: System design & behavioural. Loaded on every page (see assets/js/app.js).
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
  "slug": "system-design",
  "title": "System design & behavioural",
  "short": "System design",
  "description": "Frontend architecture, microfrontends, debugging at scale, and questions about your projects and how you work.",
  "tabs": [
    {
      "slug": "architecture",
      "title": "Architecture",
      "sections": [
        {
          "title": "Microfrontends",
          "items": [
            {
              "id": "126",
              "q": "What is Microfrontend architecture?",
              "a": "Micro-frontend architecture splits a large frontend into smaller, **independently developed and deployed** apps, each owned by a team (e.g. Catalog, Cart, Account), composed into one product by a **shell/host** app.\nImplementation options:\n- **Webpack 5 Module Federation** (most common) — load remote modules at runtime.\n- single-spa, iframes, Web Components, or build-time integration via npm packages.\nBenefits: independent deploys, team autonomy, smaller codebases, incremental migration (e.g. Angular → React). Costs: complexity, duplicated dependencies, consistent UX/design system, shared state and routing, performance overhead."
            },
            {
              "id": "127",
              "q": "When would you choose Microfrontends over a monolithic frontend?",
              "a": "Choose micro-frontends when:\n- **Multiple teams** work on a large product and need independent release cycles.\n- Domains are clearly separable (checkout, search, profile).\n- You need **incremental migration** of a legacy app or mixed frameworks.\n- Different parts scale or change at very different rates.\nStay with a (well-modularized) monolith when the team is small, the app is medium-sized, or features are tightly coupled — micro-frontends add infra, versioning and performance overhead that's not worth it there."
            },
            {
              "id": "128",
              "q": "How do you share common components and libraries between Microfrontends?",
              "a": "- **Shared design system / component library** published as a versioned npm package (often in a monorepo with Nx/Turborepo + Storybook).\n- **Module Federation `shared`** config to share singletons like `react`, `react-dom`, `react-router` (same version, `singleton: true`) so they're loaded once.\n- Expose common components/utilities from a remote (\"shared\" app) and consume at runtime.\n- Shared design tokens/CSS variables for consistent styling.\n- Communication via props from the shell, custom events, or a small shared event bus — avoid tightly coupled global stores.\n- Semantic versioning and contracts to avoid breaking other teams."
            }
          ]
        },
        {
          "title": "Application architecture",
          "items": [
            {
              "id": "131",
              "q": "How would you design a scalable React application?",
              "a": "- **Feature-based folder structure** with clear boundaries.\n- Reusable **design system** components; consistent styling approach.\n- Clear **state strategy**: server state (RTK Query/React Query), global client state (Redux/Zustand), local state, URL state.\n- Central **API layer** (axios instance, interceptors, typed services).\n- **TypeScript**, ESLint, Prettier, Husky pre-commit hooks.\n- **Routing** with lazy-loaded routes; code splitting.\n- **Testing**: Jest + React Testing Library, Cypress/Playwright E2E.\n- Error handling (Error Boundaries, logging), performance budgets, accessibility.\n- CI/CD, environment configs, feature flags, monitoring (Sentry, analytics).\n- Documentation (Storybook, README, ADRs)."
            },
            {
              "id": "132",
              "q": "How would you structure a large React project?",
              "a": "Feature-based (domain) structure scales better than grouping by file type:\n```\nsrc/\n  app/            # store setup, providers, router\n  features/\n    auth/         # components, hooks, slice, api, types, tests for auth\n    orders/\n    products/\n  components/     # shared UI (Button, Modal, Table) – design system\n  hooks/          # shared hooks (useDebounce, useMediaQuery)\n  services/       # api client, interceptors\n  utils/          # helpers, formatters\n  constants/\n  types/\n  assets/\n  styles/\n```\nPrinciples: colocate files that change together; each feature exposes a public `index.ts`; avoid deep cross-feature imports; absolute import aliases (`@/features/...`)."
            },
            {
              "id": "133",
              "q": "How do you manage common API services across multiple modules?",
              "a": "- Create a **single API client** (axios instance) with base URL, timeout, default headers, and **interceptors** for auth token, refresh on 401, global error handling, and logging.\n- Wrap endpoints in **service modules** per domain (`userService.getUser(id)`), so components never build URLs directly.\n- Or use **RTK Query** `createApi` with `injectEndpoints` so each module adds its own endpoints to one shared API.\n- Environment-specific config via `.env`; typed request/response models (TypeScript); consistent error format.\n```js\nexport const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 15000 });\napi.interceptors.request.use(cfg => { cfg.headers.Authorization = `Bearer ${getToken()}`; return cfg; });\nexport const userService = { getUser: id => api.get(`/users/${id}`).then(r => r.data) };\n```"
            },
            {
              "id": "134",
              "q": "How do you handle application-wide error management?",
              "a": "Layered approach:\n- **Error Boundaries** at app level and around risky widgets/routes for render errors, with a friendly fallback + retry.\n- **API errors**: axios interceptor normalizes errors, handles 401 (refresh/logout), 403 (unauthorized page), 500 (toast); per-request handling in components where needed.\n- **Async/event handler errors**: try/catch; `window.onerror` and `unhandledrejection` listeners as a safety net.\n- **User feedback**: toasts, inline form errors, retry buttons; never show raw stack traces.\n- **Logging/monitoring**: Sentry/Datadog with user context, release version and source maps.\n- Form validation (Zod/Yup) to prevent invalid requests."
            },
            {
              "id": "135",
              "q": "How do you implement role-based access control?",
              "a": "- Backend returns the user's **roles/permissions** after login (in the token or a `/me` endpoint).\n- Store them in Auth context/Redux; prefer **permission-based** checks (`orders:edit`) over hard-coded role names.\n- **Route level**: `ProtectedRoute` with `allowedRoles`/`requiredPermission`.\n- **Component level**: a `<Can>` component or `usePermission()` hook to show/hide/disable buttons and menu items.\n```jsx\nfunction Can({ permission, children, fallback = null }) {\n  const { permissions } = useAuth();\n  return permissions.includes(permission) ? children : fallback;\n}\n<Can permission=\"user:delete\"><DeleteButton /></Can>\n```\n- Build menus/navigation from a config filtered by permission.\n- The **backend must enforce** every permission — frontend RBAC is UX only."
            }
          ]
        },
        {
          "title": "Debugging & quality",
          "items": [
            {
              "id": "136",
              "q": "How do you debug a React application with high CPU utilization?",
              "a": "1. **Reproduce** and open Chrome DevTools **Performance** tab — record, look for long tasks, which functions use the most scripting time (flame chart).\n2. **React DevTools Profiler** — find components re-rendering too often or taking long, and why.\n3. Common culprits: infinite re-render loops (effect setting state it depends on), unthrottled scroll/resize/mousemove handlers, `setInterval` without cleanup, huge lists without virtualization, heavy computations every render, animations via JS instead of CSS, polling too frequently, memory leaks causing GC pressure.\n4. Fix: memoize, throttle/debounce, virtualize, move heavy work to a Web Worker, use `useTransition`/`useDeferredValue`, clean up effects.\n5. Verify with the profiler again and add monitoring."
            },
            {
              "id": "137",
              "q": "How do you identify and fix a memory leak?",
              "a": "**Identify**: Chrome DevTools **Memory** tab — take heap snapshots before/after repeating an action (e.g. open/close a page) and compare; look for growing **Detached DOM nodes** and objects that should have been freed. The Performance monitor shows JS heap growth over time.\n**Common causes in React apps**:\n- Event listeners, intervals, timeouts, subscriptions, WebSockets not cleaned up.\n- Async calls setting state after unmount (cancel with AbortController).\n- Global variables/caches growing forever; closures holding big objects.\n- Third-party libraries (charts, maps) not destroyed on unmount.\n**Fix**: return cleanup functions from `useEffect`, remove listeners, `destroy()` library instances, bound caches (LRU, WeakMap), then re-check with snapshots."
            },
            {
              "id": "138",
              "q": "How do you approach performance monitoring after deploying an application?",
              "a": "- **Real User Monitoring**: track **Core Web Vitals** (LCP, INP, CLS, plus TTFB/FCP) with the `web-vitals` library and send to analytics (GA4, Datadog RUM, New Relic).\n- **Error monitoring**: Sentry with source maps, release tracking and alerts.\n- **Synthetic monitoring**: Lighthouse CI in the pipeline with performance budgets; scheduled checks.\n- Monitor API latency/error rates (APM) and bundle size per release.\n- Dashboards + alerts; compare releases; fix regressions with profiling.\n- React `<Profiler>` API for specific critical components if needed."
            },
            {
              "id": "139",
              "q": "How do you implement accessibility in React?",
              "a": "- Use **semantic HTML** (`button`, `nav`, `main`, `label`, headings in order) instead of clickable `div`s.\n- Every input has a `<label htmlFor>` (`htmlFor` in JSX); images have meaningful `alt` text.\n- **Keyboard support**: everything reachable with Tab, visible focus styles, Escape closes modals, manage focus (move focus into modals and trap it, restore on close) with refs.\n- **ARIA** only when needed: `aria-label`, `aria-expanded`, `aria-live` for dynamic messages, `role=\"alert\"`.\n- Sufficient color contrast; don't rely on color alone.\n- Tools: `eslint-plugin-jsx-a11y`, axe DevTools, Lighthouse, screen reader testing (NVDA/VoiceOver), React Testing Library queries by role.\n- Accessible component libraries (Radix UI, Headless UI, MUI). Target WCAG 2.1 AA."
            },
            {
              "id": "140",
              "q": "How do you use browser DevTools to debug rendering and performance problems?",
              "a": "- **Elements panel**: inspect DOM/CSS, see layout shifts, force states (:hover).\n- **Performance panel**: record an interaction; find long tasks (>50 ms), layout thrashing (\"forced reflow\"), heavy scripting, and paint events. Use CPU throttling to simulate slow devices.\n- **Rendering tab**: Paint flashing, Layout Shift Regions, FPS meter.\n- **Network panel**: slow/duplicate requests, waterfall, large bundles, caching; throttle to 3G.\n- **Memory panel**: heap snapshots for leaks.\n- **Lighthouse**: overall performance/accessibility audit.\n- **React DevTools**: Components tab (props/state/hooks), Profiler (render time and why each component rendered), highlight updates.\n- Sources panel: breakpoints, conditional breakpoints, logpoints."
            }
          ]
        }
      ]
    },
    {
      "slug": "behavioural",
      "title": "Behavioural",
      "sections": [
        {
          "title": "Project & behavioural",
          "items": [
            {
              "id": "141",
              "q": "Explain your current project architecture.",
              "a": "Prepare a 2–3 minute structured answer about your real project:\n- **Business context**: what the product does, who uses it, scale (users, modules).\n- **Frontend stack**: React + TypeScript, state management (Redux Toolkit / RTK Query), routing, UI library, styling, build tool (Vite/Webpack), testing.\n- **Architecture**: folder structure, micro-frontends or monolith, shared component library, API layer with interceptors, auth (JWT/SSO).\n- **Backend & infra**: REST/GraphQL APIs, microservices, cloud (AWS/Azure), CI/CD, environments.\n- **Data flow**: UI → API service → backend → DB, and back.\nDraw it on a whiteboard if possible and mention one design decision you made and why."
            },
            {
              "id": "142",
              "q": "What is your role and responsibility in the project?",
              "a": "Answer with specifics and ownership, e.g.:\n- Developing features end-to-end on the frontend: understanding requirements, breaking them into tasks, building reusable components and API integration.\n- Technical ownership of a module (name it), code reviews, defining coding standards.\n- Performance improvements, bug fixing, production support.\n- Collaborating with backend, QA, designers, product owners; sprint planning, estimation in Agile/Scrum.\n- Mentoring juniors, onboarding, documentation.\nUse numbers where you can (\"reduced load time by 40%\", \"led a team of 3\")."
            },
            {
              "id": "143",
              "q": "Explain the complete flow of one feature, from the UI to the backend API.",
              "a": "Pick a real feature (e.g. \"create order\") and walk through:\n1. **UI**: form component with validation (React Hook Form + Zod), state management.\n2. **Action**: on submit → dispatch thunk / RTK Query mutation; button disabled, loading shown.\n3. **API layer**: axios instance adds auth token via interceptor → `POST /api/orders`.\n4. **Backend**: API gateway → auth middleware validates JWT → controller → service with business logic → DB transaction; returns response/status code.\n5. **Response handling**: success → update cache/store (invalidate tags), toast, navigate; error → show message, log to Sentry.\n6. **Cross-cutting**: permissions, error handling, tests (unit + E2E), monitoring."
            },
            {
              "id": "144",
              "q": "What was the most challenging technical problem you faced?",
              "a": "Use the **STAR** format (Situation, Task, Action, Result). Example outline:\n- **Situation**: a dashboard page with 10,000+ rows froze for several seconds / a production memory leak / complex form with dynamic validation.\n- **Task**: what you were responsible for.\n- **Action**: how you investigated (Profiler, heap snapshots, logs), options you considered, what you implemented (virtualization, memoization, pagination with backend, refactor).\n- **Result**: measurable outcome (\"render time from 4s to 300ms\", \"zero crash reports since\") and what you learned.\nPick a story that shows technical depth and ownership."
            },
            {
              "id": "145",
              "q": "Have you improved the performance of an existing application?",
              "a": "Have a concrete story:\n- **Measured** first: Lighthouse, Web Vitals, React Profiler, bundle analyzer.\n- **Changes** (pick yours): route-based code splitting and lazy loading; removed/replaced heavy libraries (moment → dayjs, full lodash → per-method imports); virtualization for big tables; memoized expensive components/selectors; API caching with RTK Query and fewer duplicate calls; image optimization; debounced search.\n- **Result** with numbers: \"bundle 2.1MB → 900KB\", \"LCP 4.2s → 1.8s\", \"Lighthouse 55 → 90\".\n- How you kept it from regressing: performance budgets in CI, monitoring."
            },
            {
              "id": "146",
              "q": "How did you identify and resolve a production issue?",
              "a": "STAR story, e.g.:\n- **Detection**: alert from Sentry/monitoring or user reports (e.g. blank page for some users after a release).\n- **Triage**: check impact and severity, reproduce in the same browser/env, read logs and error traces with source maps, check what changed in the last release.\n- **Root cause**: e.g. an API returned `null` for an optional field and the UI called `.map` on it; or a cached old chunk caused \"ChunkLoadError\" after deploy.\n- **Fix**: hotfix or rollback first to restore service, then proper fix with tests.\n- **Prevention**: defensive checks / schema validation, Error Boundary, added test case, RCA document, monitoring alert."
            },
            {
              "id": "147",
              "q": "How do you handle a production bug reported by a client?",
              "a": "1. **Acknowledge** quickly, gather details: steps, environment, browser, user, screenshots, time.\n2. **Assess severity/impact** (P1 blocks business → immediate response; minor → plan in sprint).\n3. **Reproduce** (same data/role/browser), check logs, Sentry, network traces.\n4. Find the **root cause**; for critical issues, apply a hotfix or rollback / feature flag off.\n5. Test the fix (QA, regression), deploy through the proper pipeline.\n6. **Communicate** status and ETA to the client throughout.\n7. **RCA** and preventive action: tests, monitoring, process change."
            },
            {
              "id": "148",
              "q": "What would you do if a client requested a last-minute change during UAT?",
              "a": "- Understand the request and **why** it's needed (business urgency).\n- Analyse **impact**: effort, risk, affected areas, testing needed, effect on the release date.\n- Communicate options to the client/PO: include it now with a revised timeline, ship it in a fast follow-up release, or release behind a **feature flag**.\n- Get a decision from the product owner/stakeholders — don't silently absorb scope.\n- If accepted: follow change management, update estimates, ensure regression testing, document it.\nShow that you balance flexibility with quality and transparency."
            },
            {
              "id": "149",
              "q": "How do you handle code reviews?",
              "a": "**As a reviewer**:\n- Check correctness, readability, edge cases, error handling, performance (re-renders, unnecessary API calls), security (XSS, secrets), accessibility, tests, and adherence to standards.\n- Keep comments constructive and specific; explain *why*; distinguish blocking issues from suggestions (\"nit:\"); praise good solutions.\n- Review small PRs promptly.\n**As an author**: small focused PRs, clear description and screenshots, self-review first, respond openly to feedback.\nAutomate the trivial stuff (ESLint, Prettier, type checks, tests in CI) so humans focus on logic and design."
            },
            {
              "id": "150",
              "q": "How do you ensure code quality across a development team?",
              "a": "- **Standards**: documented coding guidelines, TypeScript strict mode, ESLint + Prettier, consistent folder structure.\n- **Automation**: Husky + lint-staged pre-commit hooks; CI that runs lint, type-check, unit tests, build; SonarQube for code smells/coverage.\n- **Testing**: unit (Jest/Vitest + React Testing Library), E2E (Cypress/Playwright), coverage targets for critical areas.\n- **Process**: mandatory PR reviews, PR templates, definition of done.\n- **Reusability**: shared component library + Storybook.\n- **Knowledge sharing**: tech talks, pairing, documentation, ADRs; tracking tech debt."
            },
            {
              "id": "151",
              "q": "How do you handle disagreements about technical implementation?",
              "a": "- Listen to the other person's reasoning fully; focus on the problem, not the person.\n- Compare options with **objective criteria**: requirements, performance, maintainability, team familiarity, timeline, cost.\n- Back arguments with data — build a quick POC, benchmark, or reference docs/best practices.\n- If still no agreement, involve the tech lead/architect and **commit to the decision** once made (\"disagree and commit\").\n- Document the decision (ADR).\nGive a short real example if you have one."
            },
            {
              "id": "152",
              "q": "How do you estimate development effort?",
              "a": "- Clarify requirements and acceptance criteria first; break the feature into small tasks (UI, API integration, state, validation, tests, edge cases).\n- Estimate each task using past experience/similar work; in Agile, use **story points** (Planning Poker) relative to reference stories.\n- Add time for code review, testing, bug fixing, and **buffer for unknowns/risks**; do a spike if something is new.\n- Consider dependencies (backend APIs, design).\n- Communicate assumptions; re-estimate when scope changes; track actual vs estimate to improve."
            },
            {
              "id": "153",
              "q": "Have you mentored junior developers?",
              "a": "Give concrete examples:\n- Onboarding new joiners: walking through architecture, setup, coding standards.\n- Detailed, educational code reviews; pair programming on tough tasks.\n- Assigning progressively harder tasks and being available for questions.\n- Knowledge sessions (hooks, Redux Toolkit, testing), writing docs/guides.\n- Result: \"two juniors became independent on module X within 3 months\".\nIf you haven't formally, describe informal mentoring and your approach."
            },
            {
              "id": "154",
              "q": "How do you decide whether to use an existing library or build a custom solution?",
              "a": "Evaluate:\n- **Requirements fit**: does the library solve our case fully, or would we fight it?\n- **Quality and health**: maintenance activity, community, open issues, documentation, TypeScript support.\n- **Cost**: bundle size, performance, license (MIT vs GPL/commercial), security vulnerabilities.\n- **Customization** needs and long-term maintenance cost of a custom build.\n- **Time-to-market** and team familiarity.\nRule of thumb: use well-maintained libraries for solved, complex problems (dates, forms, data fetching, charts, accessibility primitives); build custom when the need is small/simple or core to the business and the library would add a lot of weight. Wrap third-party libraries behind your own interface so they can be replaced."
            }
          ]
        }
      ]
    }
  ]
});
