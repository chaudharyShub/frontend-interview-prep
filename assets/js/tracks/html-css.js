/**
 * Track: HTML & CSS. Loaded on every page (see assets/js/app.js).
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
  "slug": "html-css",
  "title": "HTML & CSS",
  "description": "Semantic HTML, accessibility, the cascade, Flexbox and Grid, responsive design and rendering, plus layout challenges with a live preview.",
  "tabs": [
    {
      "slug": "theory",
      "title": "Theory",
      "sections": [
        {
          "title": "HTML & semantics",
          "items": [
            {
              "id": "h1",
              "q": "What is semantic HTML and why does it matter?",
              "a": "Semantic HTML uses elements for their **meaning**, not their look: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`, `<button>`, `<h1>`–`<h6>`, `<ul>`, `<table>`, instead of a `<div>` for everything.\n- **Accessibility**: screen readers use landmarks and headings to navigate, and native elements bring keyboard support and roles for free (a `<button>` is focusable and fires on Enter and Space; a clickable `<div>` is neither).\n- **SEO**: search engines understand the structure and the main content better.\n- **Maintainability**: the markup explains itself, and less CSS and JS is needed to patch missing behaviour.\n```html\n<!-- div soup -->\n<div class=\"header\"><div class=\"nav\">…</div></div>\n<div class=\"btn\" onclick=\"save()\">Save</div>\n\n<!-- semantic -->\n<header><nav aria-label=\"Main\">…</nav></header>\n<main><article><h1>Title</h1>…</article></main>\n<button type=\"button\">Save</button>\n```\nRule of thumb: if a native element does the job, use it before reaching for ARIA."
            },
            {
              "id": "h2",
              "q": "What does <!DOCTYPE html> do?",
              "a": "It tells the browser to render the page in **standards mode**. Without it, browsers fall back to **quirks mode**, which mimics old browser bugs for backwards compatibility: for example, a different box model for some elements, odd table and line-height behaviour, and percentage heights that act differently.\nIt isn't an HTML tag; it's an instruction that must be the very first thing in the document. The short HTML5 form `<!DOCTYPE html>` is all you need today."
            },
            {
              "id": "h3",
              "q": "What is the difference between block, inline and inline-block elements?",
              "a": "- **block** (`div`, `p`, `h1`, `section`): starts on a new line and takes the full width available. Width, height, margin and padding all apply.\n- **inline** (`span`, `a`, `strong`, `em`): flows inside text and is only as wide as its content. **width and height are ignored**, and vertical margins don't push other lines away (vertical padding paints but doesn't affect layout).\n- **inline-block**: flows inline like text, but respects width, height and vertical margins. Useful for buttons, badges and nav items.\n```css\n.badge { display: inline-block; padding: 2px 8px; width: 80px; }\n```\nGotcha: whitespace between inline-block elements in the HTML shows up as a small gap. Flexbox avoids it."
            },
            {
              "id": "h4",
              "q": "What is the difference between <script>, <script async> and <script defer>?",
              "a": "- **No attribute**: HTML parsing **stops** while the script downloads and runs. Blocks rendering.\n- **async**: downloads in parallel with parsing and **runs as soon as it arrives**, pausing parsing then. Order between async scripts isn't guaranteed. Good for independent scripts like analytics.\n- **defer**: downloads in parallel and runs **after the HTML is parsed**, before `DOMContentLoaded`, **in document order**. Best default for your own scripts that touch the DOM.\n```html\n<script src=\"analytics.js\" async></script>\n<script src=\"vendor.js\" defer></script>\n<script src=\"app.js\" defer></script>  <!-- runs after vendor.js -->\n```\n`type=\"module\"` scripts are deferred by default. Putting scripts at the end of `<body>` was the old workaround for blocking."
            },
            {
              "id": "h5",
              "q": "What goes in the <head>, and why is the viewport meta tag important?",
              "a": "The `<head>` holds metadata, not visible content: `<meta charset=\"UTF-8\">` (first, so text decodes correctly), `<title>`, the description, `<link rel=\"stylesheet\">`, icons, canonical link, Open Graph tags, preload hints and scripts.\n```html\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n```\nWithout the viewport tag, mobile browsers lay the page out at a fake desktop width (about 980px) and zoom out, so text is tiny and **media queries don't fire** as expected. With it, the layout width matches the device width.\nAvoid `user-scalable=no` or `maximum-scale=1`: they stop people from zooming, which is an accessibility failure."
            },
            {
              "id": "h6",
              "q": "What are data-* attributes and when would you use them?",
              "a": "Custom attributes for storing extra information on an element without inventing non-standard attributes.\n```html\n<button data-product-id=\"42\" data-action=\"add\">Add to cart</button>\n```\n```js\nbtn.dataset.productId;   // \"42\"  (kebab-case becomes camelCase)\n```\n```css\n[data-state=\"open\"] { display: block; }\n```\nGood for: hooks for JS (separate from styling classes), state for CSS selectors, test ids (`data-testid`). Don't use them for content that should be visible or accessible, and remember values are always strings."
            },
            {
              "id": "h7",
              "q": "How do you build an accessible form?",
              "a": "- Every input has a **visible `<label>`** linked with `for`/`id` (or wrapping the input). Placeholders are not labels: they disappear and often have poor contrast.\n- Use the **right input type** (`email`, `tel`, `number`, `date`) for the right mobile keyboard and built-in validation, plus `autocomplete` values like `email` and `current-password`.\n- Group related controls with `<fieldset>` and `<legend>` (radio groups).\n- Use `required`, `minlength`, `pattern` for native validation.\n- Link error and help text with `aria-describedby`, set `aria-invalid=\"true\"` on invalid fields, and don't rely on colour alone.\n- On submit, move focus to the first error or an error summary.\n```html\n<label for=\"email\">Email</label>\n<input id=\"email\" type=\"email\" autocomplete=\"email\" required\n       aria-describedby=\"email-err\" aria-invalid=\"true\">\n<p id=\"email-err\" class=\"error\">Enter a valid email address.</p>\n```"
            },
            {
              "id": "h8",
              "q": "How do you serve responsive images? Explain srcset, sizes and <picture>.",
              "a": "- **srcset + sizes**: give the browser several sizes of the **same image** and say how wide it will display. The browser picks the best file for the screen width and pixel density.\n```html\n<img src=\"hero-800.jpg\"\n     srcset=\"hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w\"\n     sizes=\"(max-width: 600px) 100vw, 50vw\"\n     width=\"1600\" height=\"900\" alt=\"Team at work\" loading=\"lazy\">\n```\n- **<picture>**: for **art direction** (a different crop on mobile) or **format fallbacks**. The browser uses the first `<source>` that matches.\n```html\n<picture>\n  <source type=\"image/avif\" srcset=\"hero.avif\">\n  <source type=\"image/webp\" srcset=\"hero.webp\">\n  <img src=\"hero.jpg\" alt=\"Team at work\" width=\"1600\" height=\"900\">\n</picture>\n```\nAlso: set `width`/`height` to prevent layout shift, `loading=\"lazy\"` for images below the fold (not the main hero image), and `fetchpriority=\"high\"` for the LCP image."
            }
          ]
        },
        {
          "title": "Accessibility",
          "items": [
            {
              "id": "h9",
              "q": "What is ARIA, and what is the first rule of ARIA?",
              "a": "ARIA (Accessible Rich Internet Applications) adds **roles, states and properties** to elements so assistive technology understands custom widgets: `role=\"dialog\"`, `aria-expanded`, `aria-label`, `aria-controls`, `aria-live`.\n**First rule: don't use ARIA if a native HTML element does the job.** A `<button>` beats `<div role=\"button\">`, because ARIA only changes what is **announced**; it adds no keyboard support or behaviour. \"No ARIA is better than bad ARIA.\"\nCommon, useful attributes:\n- `aria-label` / `aria-labelledby`: a name for elements with no visible text (icon buttons).\n- `aria-expanded`, `aria-pressed`, `aria-selected`: state of toggles, menus and tabs.\n- `aria-hidden=\"true\"`: hide decorative icons from screen readers.\n- `aria-live=\"polite\"`: announce updates (toasts, search result counts)."
            },
            {
              "id": "h10",
              "q": "How do you make a custom interactive element (like a div button) accessible?",
              "a": "Best answer: **use a `<button>`** and style it. If you really must use a `<div>`, you have to add everything the button gave you for free:\n```html\n<div role=\"button\" tabindex=\"0\" aria-pressed=\"false\">Bold</div>\n```\n```js\nel.addEventListener('click', toggle);\nel.addEventListener('keydown', e => {\n  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }\n});\n```\n- `role` so it's announced as a button.\n- `tabindex=\"0\"` so it can be reached with Tab.\n- Enter and Space handling.\n- A visible focus style, and a disabled state (`aria-disabled`).\nThat's a lot of work for something one native element does, which is the point interviewers want to hear."
            },
            {
              "id": "h11",
              "q": "How do you handle keyboard focus and focus styles?",
              "a": "- Keep the **DOM order logical**; tab order follows it. Avoid positive `tabindex` values (1, 2…), which break the natural order. Use `0` to make something focusable and `-1` to focus it from code only.\n- **Never remove focus outlines without a replacement.** Use `:focus-visible` to show a ring for keyboard users but not on mouse click:\n```css\nbutton:focus { outline: none; }\nbutton:focus-visible { outline: 2px solid #4f46e5; outline-offset: 2px; }\n```\n- **Modals**: move focus into the dialog when it opens, trap Tab inside it, close on Escape, and return focus to the trigger when it closes. The native `<dialog>` with `showModal()` does most of this.\n- Add a **skip link** (\"Skip to content\") as the first focusable element.\n- After route changes in a single-page app, move focus to the new page's heading."
            },
            {
              "id": "h12",
              "q": "How do you write good alt text?",
              "a": "Alt text replaces the image for screen reader users and when it fails to load. Describe its **purpose in context**, not every pixel.\n- **Informative image**: say what matters. `alt=\"Bar chart: sales doubled from 2023 to 2024\"`.\n- **Image inside a link or button**: describe the action or destination. `alt=\"Home\"` for a logo link, not \"logo\".\n- **Decorative image**: use an **empty alt** `alt=\"\"` so it's skipped. Leaving alt out entirely makes some screen readers read the file name.\n- Don't start with \"Image of…\"; the screen reader already says it's an image.\n- Long content (complex charts) needs a text alternative nearby, such as a caption or data table."
            },
            {
              "id": "h13",
              "q": "What do colour contrast, prefers-reduced-motion and prefers-color-scheme have to do with accessibility?",
              "a": "- **Contrast**: WCAG AA needs at least **4.5:1** for normal text and **3:1** for large text and UI parts like input borders and focus rings. Low contrast is one of the most common failures. Also don't use **colour alone** to show meaning (add an icon or text to errors).\n- **prefers-reduced-motion**: some people get dizzy or nauseous from motion. Tone down or remove animations for them:\n```css\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }\n}\n```\n- **prefers-color-scheme**: follow the system light/dark setting, with a manual override if you offer a toggle.\n- Also respect user font size: use `rem` and don't block zoom."
            }
          ]
        },
        {
          "title": "CSS fundamentals",
          "items": [
            {
              "id": "h14",
              "q": "Explain the CSS box model and box-sizing.",
              "a": "Every element is a box made of **content → padding → border → margin** (inside out).\n- `box-sizing: content-box` (the default): `width` sets the **content** only. Padding and border are **added on top**, so `width: 200px; padding: 20px; border: 1px` renders 242px wide.\n- `box-sizing: border-box`: `width` includes padding and border, so the box is exactly 200px. Much easier to reason about.\n```css\n*, *::before, *::after { box-sizing: border-box; }\n```\nMargins sit outside the border and are never included in width. Background colour fills content and padding (up to the border), not the margin."
            },
            {
              "id": "h15",
              "q": "How does specificity work, and how does the cascade decide which rule wins?",
              "a": "When rules conflict, the browser compares, in order:\n1. **Origin and importance**: `!important` declarations beat normal ones (user-agent < user < author for normal rules; reversed for important ones).\n2. **Cascade layers** (`@layer`): later layers win; unlayered styles beat layered ones.\n3. **Specificity**, counted as (IDs, classes/attributes/pseudo-classes, elements/pseudo-elements). Inline `style=\"\"` beats any selector.\n4. **Order**: the later rule wins.\n```css\n#nav a        /* (1,0,1) */\n.nav .link    /* (0,2,0) */\na:hover       /* (0,1,1) */\nul li a       /* (0,0,3) */\n```\n(1,0,1) beats (0,2,0), because one ID outranks any number of classes. The universal selector and combinators add nothing. `:where()` has zero specificity; `:is()` and `:not()` take the specificity of their most specific argument.\nKeep specificity low and flat (one class per selector) so you never need `!important`."
            },
            {
              "id": "h16",
              "q": "Explain the position values: static, relative, absolute, fixed and sticky.",
              "a": "- **static** (default): normal flow; `top`/`left` and `z-index` do nothing.\n- **relative**: stays in the flow (its space is kept) but can be **offset from where it would be**. Commonly used just to be the **containing block** for absolute children.\n- **absolute**: **removed from the flow**; positioned against the nearest **positioned ancestor** (anything not static), or the initial containing block if there is none.\n- **fixed**: removed from the flow; positioned against the **viewport**, so it stays put on scroll. Gotcha: an ancestor with `transform`, `filter` or `perspective` becomes its containing block instead.\n- **sticky**: acts like relative until the element reaches a threshold (`top: 0`) while scrolling, then sticks within its **parent**. Doesn't work if an ancestor has `overflow: hidden`/`auto` in the way, or if no threshold is set.\n```css\n.card { position: relative; }\n.card .badge { position: absolute; top: 8px; right: 8px; }\n.header { position: sticky; top: 0; }\n```"
            },
            {
              "id": "h17",
              "q": "What is the difference between display: none, visibility: hidden and opacity: 0?",
              "a": "- **display: none**: removed from layout entirely; no space, not focusable, hidden from screen readers. Can't transition (except with newer `transition-behavior: allow-discrete`).\n- **visibility: hidden**: **keeps its space**, invisible, not clickable or focusable, hidden from screen readers. Children can override with `visibility: visible`. Can be transitioned (it flips at the end).\n- **opacity: 0**: keeps its space, invisible but **still clickable and focusable**, and still read by screen readers. Animates smoothly.\nTo hide something visually but keep it for screen readers, use a \"visually-hidden\" class (1px clip), not any of these."
            },
            {
              "id": "h18",
              "q": "What is the difference between px, em, rem, %, vw and vh?",
              "a": "- **px**: fixed (a CSS pixel, not a device pixel). Fine for borders and shadows.\n- **em**: relative to the **current element's font size** (for `font-size` itself, the parent's). Compounds when nested, which can surprise you; handy for padding that scales with a button's text.\n- **rem**: relative to the **root (`html`) font size**, 16px by default. Predictable, and respects the user's browser font setting, so it's the usual choice for font sizes and spacing.\n- **%**: relative to the parent (width for widths and even for vertical padding/margin; the parent's font size for `font-size`).\n- **vw / vh**: 1% of the viewport width/height. On mobile, `100vh` can be taller than the visible area because of the browser toolbar; use `100dvh` (dynamic), `svh` or `lvh`.\nFluid type often combines them: `font-size: clamp(1rem, 0.8rem + 1vw, 1.5rem);`"
            },
            {
              "id": "h19",
              "q": "What is the difference between pseudo-classes and pseudo-elements?",
              "a": "- **Pseudo-classes** (one colon) select an element in a certain **state or position**: `:hover`, `:focus-visible`, `:checked`, `:disabled`, `:first-child`, `:nth-child(2n)`, `:not()`, `:is()`, `:has()`.\n- **Pseudo-elements** (two colons) style a **part of an element**, or insert generated content: `::before`, `::after`, `::first-line`, `::placeholder`, `::marker`, `::selection`.\n```css\nli:nth-child(odd) { background: #f5f5f5; }\n.required::after { content: \" *\"; color: crimson; }\n```\n`::before`/`::after` need a `content` property (even `content: \"\"`) to render, and don't work on replaced elements like `<img>` and `<input>`."
            },
            {
              "id": "h20",
              "q": "What is margin collapsing?",
              "a": "Vertical margins of **block** elements in normal flow can merge into one margin equal to the **larger** of them, instead of adding up.\n- **Adjacent siblings**: `margin-bottom: 20px` above `margin-top: 30px` gives a 30px gap, not 50px.\n- **Parent and first/last child**: a child's top margin can \"leak\" out through a parent that has no border, padding or other content in between.\n- **Empty blocks**: their own top and bottom margins collapse.\nIt **does not** happen with horizontal margins, flex or grid items, floats, absolutely positioned elements, or across a new block formatting context (`display: flow-root`, `overflow` other than visible).\nPractical fix: use `gap` in flex/grid layouts, or only set margins in one direction (e.g. only `margin-bottom`)."
            },
            {
              "id": "h21",
              "q": "What is a stacking context, and why is my z-index not working?",
              "a": "`z-index` only orders elements **within the same stacking context**. A stacking context is created by, among others:\n- a positioned element (not static) with a `z-index` other than auto,\n- `opacity` below 1, `transform`, `filter`, `will-change`, `isolation: isolate`,\n- flex/grid children with a `z-index`, and `position: fixed`/`sticky`.\nCommon reasons z-index \"doesn't work\":\n1. The element isn't positioned (and isn't a flex/grid item), so z-index is ignored.\n2. A **parent** formed a stacking context with a low z-index. Children can never escape it, so `z-index: 9999` on a child doesn't help.\n```css\n.header { position: relative; z-index: 1; }\n.page   { position: relative; z-index: 2; transform: translateZ(0); }\n.page .dropdown { z-index: 9999; }  /* still trapped inside .page */\n```\nFix by raising the parent, or render overlays (modals, tooltips) in a portal at the end of `<body>`. Keep a small z-index scale (e.g. 10, 20, 30) in variables."
            },
            {
              "id": "h22",
              "q": "What are :is(), :where() and :has()?",
              "a": "- **:is()**: matches any selector in the list; shortens repetitive selectors. Specificity is its **most specific** argument.\n- **:where()**: same as `:is()` but with **zero specificity**, so it's ideal for base and reset styles that should be easy to override.\n- **:has()**: the \"parent selector\": matches an element **if it contains** something (or something follows it).\n```css\n:is(h1, h2, h3):hover { color: teal; }\n:where(ul, ol) { padding-left: 1.25rem; }       /* easy to override */\n.card:has(img) { padding-top: 0; }              /* cards with an image */\nlabel:has(+ input:invalid) { color: crimson; }  /* label before an invalid input */\nform:has(:focus-visible) { outline: 1px solid; }\n```\n`:has()` removes a lot of \"add a class from JS\" code. It's supported in all modern browsers."
            },
            {
              "id": "h23",
              "q": "Which CSS properties are inherited?",
              "a": "Mostly **text-related** properties inherit: `color`, `font-*`, `line-height`, `letter-spacing`, `text-align`, `visibility`, `cursor`, `list-style`. Custom properties (`--x`) inherit too.\n**Box and layout** properties don't: `margin`, `padding`, `border`, `width`, `background`, `display`, `position`.\nYou can control it with keywords:\n- `inherit`: take the parent's value.\n- `initial`: the property's spec default (e.g. `display: inline`).\n- `unset`: inherit if the property inherits, otherwise initial.\n- `revert`: go back to the browser's default style for that element.\n```css\nbutton { font: inherit; color: inherit; }  /* form controls don't inherit fonts by default */\n```"
            }
          ]
        },
        {
          "title": "Layout: Flexbox & Grid",
          "items": [
            {
              "id": "h24",
              "q": "When would you use Flexbox and when Grid?",
              "a": "- **Flexbox** is **one-dimensional**: lays items out in a row **or** a column, sized by their content. Great for nav bars, toolbars, button groups, centring, and \"push this to the end\" (`margin-left: auto`).\n- **Grid** is **two-dimensional**: rows **and** columns at once, with the layout defined on the container. Great for page layouts, card galleries, forms with aligned labels, and anything that must line up in both directions.\n```css\n.toolbar { display: flex; gap: 8px; align-items: center; }\n.toolbar .spacer { margin-left: auto; }\n\n.page { display: grid; grid-template-columns: 240px 1fr; gap: 24px; }\n```\nRule of thumb: content-out (let items decide their size) → Flexbox; layout-in (the container decides the tracks) → Grid. They combine well: a grid page with flex components inside."
            },
            {
              "id": "h25",
              "q": "What are the different ways to centre an element horizontally and vertically?",
              "a": "```css\n/* 1. Grid: shortest */\n.parent { display: grid; place-items: center; }\n\n/* 2. Flexbox */\n.parent { display: flex; justify-content: center; align-items: center; }\n\n/* 3. Flex/grid child with auto margins */\n.parent { display: flex; }\n.child  { margin: auto; }\n\n/* 4. Absolute + transform (unknown size, e.g. overlays) */\n.parent { position: relative; }\n.child  { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }\n\n/* 5. Absolute + inset + margin auto (child needs a size) */\n.child  { position: absolute; inset: 0; margin: auto; width: 200px; height: 100px; }\n```\nHorizontal only: `margin: 0 auto` on a block with a width, or `text-align: center` for inline content. Remember the parent needs a height for vertical centring to be visible."
            },
            {
              "id": "h26",
              "q": "What does flex: 1 mean? Explain flex-grow, flex-shrink and flex-basis.",
              "a": "`flex` is shorthand for **flex-grow flex-shrink flex-basis**.\n- **flex-basis**: the starting size before free space is shared (`auto` = use width/content).\n- **flex-grow**: how much of the **leftover** space the item takes, relative to siblings.\n- **flex-shrink**: how much it shrinks when there isn't enough space (0 = never shrink).\n```css\nflex: 1;       /* 1 1 0%   → equal widths, ignoring content size */\nflex: auto;    /* 1 1 auto → grow/shrink, but start from content size */\nflex: none;    /* 0 0 auto → fixed at content size */\nflex: 0 0 200px; /* exactly 200px */\n```\nGotcha: flex items have `min-width: auto`, so long words or wide children stop them shrinking and cause overflow. Add `min-width: 0` to the item (common with text truncation inside flex)."
            },
            {
              "id": "h27",
              "q": "How do you build a responsive grid of cards without media queries?",
              "a": "Use `repeat()` with `auto-fit` (or `auto-fill`) and `minmax()`:\n```css\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));\n  gap: 16px;\n}\n```\nThe browser fits as many 220px-or-wider columns as possible, then stretches them to fill the row. On a phone you get one column, on a desktop four or five.\n- **auto-fit**: collapses empty tracks, so a few items stretch across the whole row.\n- **auto-fill**: keeps empty tracks, so items keep their column width.\n`min(220px, 100%)` stops overflow when the container is narrower than 220px."
            },
            {
              "id": "h28",
              "q": "What are grid-template-areas and why are they useful?",
              "a": "They let you name regions and draw the layout as ASCII art, which makes page layouts readable and easy to rearrange at breakpoints.\n```css\n.page {\n  display: grid;\n  grid-template-columns: 220px 1fr;\n  grid-template-rows: auto 1fr auto;\n  grid-template-areas:\n    \"header header\"\n    \"sidebar main\"\n    \"footer footer\";\n  min-height: 100vh;\n}\nheader { grid-area: header; }\naside  { grid-area: sidebar; }\nmain   { grid-area: main; }\nfooter { grid-area: footer; }\n\n@media (max-width: 700px) {\n  .page { grid-template-columns: 1fr; grid-template-areas: \"header\" \"main\" \"sidebar\" \"footer\"; }\n}\n```\nBe careful: reordering visually doesn't change the DOM order, which is what keyboard and screen reader users follow. Keep the source order sensible."
            },
            {
              "id": "h29",
              "q": "What were floats used for, and what is a clearfix?",
              "a": "`float` was made for **wrapping text around images**. Before Flexbox and Grid, it was abused for whole page layouts.\nFloated children are taken out of the normal flow, so a parent containing only floats **collapses to zero height**. A **clearfix** makes the parent contain them:\n```css\n.clearfix::after { content: \"\"; display: block; clear: both; }\n/* modern equivalent */\n.parent { display: flow-root; }\n```\n`clear: both` on an element makes it start below any earlier floats. Today, use floats only for text wrapping, and Flexbox/Grid for layout."
            }
          ]
        },
        {
          "title": "Responsive & modern CSS",
          "items": [
            {
              "id": "h30",
              "q": "What is mobile-first design and how do you write media queries for it?",
              "a": "Write the base styles for **small screens** first, then add `min-width` media queries to enhance for larger screens.\n```css\n.grid { display: grid; gap: 16px; }                 /* phones: one column */\n@media (min-width: 640px)  { .grid { grid-template-columns: 1fr 1fr; } }\n@media (min-width: 1024px) { .grid { grid-template-columns: repeat(4, 1fr); } }\n```\nWhy: phones get the least CSS to override, it forces you to prioritise content, and it matches how most traffic arrives. Pick breakpoints where **your content** breaks, not for specific devices.\nMedia queries can also check features: `(hover: hover)`, `(pointer: coarse)`, `(prefers-color-scheme: dark)`, `(prefers-reduced-motion: reduce)`, `(orientation: landscape)`."
            },
            {
              "id": "h31",
              "q": "What are container queries, and how are they different from media queries?",
              "a": "**Media queries** respond to the **viewport**. **Container queries** respond to the size of a **parent container**, so a component can adapt to wherever it's placed (a wide main column or a narrow sidebar).\n```css\n.card-wrap { container-type: inline-size; }\n\n.card { display: grid; gap: 12px; }\n@container (min-width: 400px) {\n  .card { grid-template-columns: 120px 1fr; }  /* image beside text when there's room */\n}\n```\nThey make components truly reusable in design systems. Container query units (`cqi`, `cqw`) also size things relative to the container. Supported in all modern browsers."
            },
            {
              "id": "h32",
              "q": "What are CSS custom properties (variables), and how do they differ from Sass variables?",
              "a": "```css\n:root { --accent: #4f46e5; --space: 8px; }\n.btn { background: var(--accent); padding: calc(var(--space) * 1.5); }\n.btn.danger { --accent: #dc2626; }                     /* override for this subtree */\n:root[data-theme=\"dark\"] { --accent: #818cf8; }       /* theming */\n```\n- **Custom properties** are **live at runtime**: they cascade and inherit, can be changed per element, by media queries, or from JS (`el.style.setProperty('--x', '10px')`). Perfect for theming and dark mode.\n- **Sass variables** are replaced at **compile time** with fixed values; they don't exist in the browser and can't change per element or at runtime.\n`var(--x, fallback)` takes a fallback. Use `@property` to give a variable a type, which lets it be animated."
            },
            {
              "id": "h33",
              "q": "How do you implement dark mode with CSS?",
              "a": "1. Define colours as **custom properties** and use them everywhere.\n2. Switch the values with `prefers-color-scheme`, plus a data attribute for a manual toggle.\n3. Set `color-scheme` so form controls and scrollbars match.\n```css\n:root { --bg: #fff; --text: #111; color-scheme: light; }\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) { --bg: #111; --text: #eee; color-scheme: dark; }\n}\n:root[data-theme=\"dark\"] { --bg: #111; --text: #eee; color-scheme: dark; }\nbody { background: var(--bg); color: var(--text); }\n```\nSave the user's choice in localStorage and apply it **in a small blocking script in the `<head>`** before first paint, to avoid a flash of the wrong theme. Newer CSS also has `light-dark(#fff, #111)`."
            },
            {
              "id": "h34",
              "q": "Compare ways of organising CSS: BEM, CSS Modules, CSS-in-JS and utility classes (Tailwind).",
              "a": "- **BEM** (`.card__title--large`): a naming convention for plain CSS. Flat, low specificity, no tooling, but it relies on discipline and names get long. Styles are still global.\n- **CSS Modules**: class names are **scoped per file** at build time (`styles.title` → `Card_title__x7a`). Plain CSS, no runtime cost, no naming clashes. A common default in React and Next.js.\n- **CSS-in-JS** (styled-components, Emotion): styles live in components and can use props. Good developer experience, but a **runtime cost** and trouble with React Server Components. Zero-runtime options (vanilla-extract, Panda, Linaria) extract CSS at build time.\n- **Utility-first** (Tailwind): small single-purpose classes in the markup. Fast to build with, consistent design tokens, tiny CSS output; markup gets busy, and the team must learn the vocabulary.\nA good answer explains the trade-offs and why your team chose one: scoping, performance, design-system consistency and how well it fits the framework."
            },
            {
              "id": "h35",
              "q": "What do clamp(), min() and max() do?",
              "a": "- `min(a, b)`: the smaller value. `width: min(100%, 720px)` = full width, but never more than 720px.\n- `max(a, b)`: the larger value. `padding: max(16px, 4vw)` = at least 16px.\n- `clamp(min, preferred, max)`: the preferred value, kept between min and max.\n```css\nh1 { font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3rem); }   /* fluid type */\n.container { width: min(100% - 2rem, 1100px); margin-inline: auto; }\n```\nThey replace many media queries with smooth, fluid scaling. Mixing `rem` into the preferred value keeps text zoomable."
            }
          ]
        },
        {
          "title": "Rendering & performance",
          "items": [
            {
              "id": "h36",
              "q": "What is the critical rendering path?",
              "a": "The steps the browser takes to turn HTML, CSS and JS into pixels:\n1. Parse HTML into the **DOM**.\n2. Parse CSS into the **CSSOM**. CSS is **render-blocking**: nothing paints until it's loaded.\n3. Combine them into the **render tree** (only visible elements).\n4. **Layout** (reflow): work out the size and position of every box.\n5. **Paint**: fill in pixels (text, colours, borders, shadows).\n6. **Composite**: draw the layers in the right order on the GPU.\nSynchronous scripts block HTML parsing, and they also wait for any CSS before them.\nTo speed up first render: inline critical CSS and load the rest without blocking, use `defer` for scripts, preload key fonts and the hero image, keep the HTML small, and use `font-display: swap`."
            },
            {
              "id": "h37",
              "q": "What is the difference between reflow and repaint? Which properties are cheap to animate?",
              "a": "- **Reflow (layout)**: geometry changed (`width`, `height`, `top`, `margin`, `font-size`, adding DOM nodes), so the browser recalculates positions, often for much of the page. Expensive.\n- **Repaint**: only looks changed (`color`, `background`, `box-shadow`, `visibility`). Cheaper, no layout.\n- **Composite only**: `transform` and `opacity` can usually be handled by the GPU on their own layer, without layout or paint. **Animate these.**\n```css\n/* janky */ .panel { transition: left .3s, height .3s; }\n/* smooth */ .panel { transition: transform .3s, opacity .3s; }\n```\nAlso avoid **layout thrashing** in JS: reading layout (`offsetHeight`, `getBoundingClientRect`) right after writing styles, in a loop, forces repeated reflows. Batch reads, then writes. Use `will-change: transform` sparingly, only on elements about to animate."
            },
            {
              "id": "h38",
              "q": "What is Cumulative Layout Shift (CLS) and how do you prevent it with HTML and CSS?",
              "a": "CLS is a Core Web Vital measuring how much visible content **jumps around** while the page loads. Good is under **0.1**.\nCommon causes and fixes:\n- **Images and videos without dimensions** → set `width` and `height` attributes (the browser reserves the space from the ratio) or CSS `aspect-ratio`.\n- **Ads, embeds, banners injected later** → reserve space with a `min-height` container.\n- **Web fonts swapping** → `font-display: swap` plus a fallback font with matching metrics (`size-adjust`), and preload key fonts.\n- **Content inserted above existing content** (cookie bars, \"new posts\") → overlay it, or insert below the viewport.\n- **Animating layout properties** → animate `transform` instead.\n```css\nimg, video { max-width: 100%; height: auto; }\n.video { aspect-ratio: 16 / 9; }\n```"
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
          "title": "Layout",
          "items": [
            {
              "id": "hc1",
              "q": "Centre a box horizontally and vertically inside its container.",
              "note": "Do it with Grid or Flexbox; be ready to name a second way.",
              "a": "```css\n/* Grid */\n.stage { display: grid; place-items: center; }\n\n/* Flexbox */\n.stage { display: flex; justify-content: center; align-items: center; }\n\n/* Absolute + transform (works without knowing the box size) */\n.stage { position: relative; }\n.box { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }\n```\nMention why the container needs a height, and that `margin: auto` on a flex or grid child also centres it."
            },
            {
              "id": "hc2",
              "q": "Build a page layout with a header, sidebar, main area and footer. Stack it on small screens.",
              "note": "The footer should stay at the bottom even when the content is short.",
              "a": "```css\n.page {\n  display: grid;\n  min-height: 100vh;\n  grid-template-columns: 200px 1fr;\n  grid-template-rows: auto 1fr auto;   /* the middle row takes the spare height */\n  grid-template-areas:\n    \"header header\"\n    \"sidebar main\"\n    \"footer footer\";\n}\nheader { grid-area: header; }\naside  { grid-area: sidebar; }\nmain   { grid-area: main; }\nfooter { grid-area: footer; }\n\n@media (max-width: 600px) {\n  .page {\n    grid-template-columns: 1fr;\n    grid-template-rows: auto auto 1fr auto;\n    grid-template-areas: \"header\" \"sidebar\" \"main\" \"footer\";\n  }\n}\n```\nThe `1fr` row plus `min-height: 100vh` keeps the footer at the bottom when there's little content. Mention `100dvh` for mobile browser toolbars."
            },
            {
              "id": "hc3",
              "q": "Build a responsive card grid that changes the number of columns without media queries.",
              "a": "```css\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));\n  gap: 16px;\n}\n```\nExplain `auto-fit` vs `auto-fill` (whether empty columns collapse), why `min(180px, 100%)` avoids overflow on tiny screens, and that grid rows make cards in the same row equal height for free.\nFlexbox alternative: `display: flex; flex-wrap: wrap; gap: 16px;` with `flex: 1 1 180px` on the cards. The last row then stretches differently, which is a good point to discuss."
            },
            {
              "id": "hc4",
              "q": "Build a navigation bar with the logo on the left and links on the right.",
              "note": "Links should wrap below the logo on narrow screens, and be keyboard accessible.",
              "a": "```css\n.nav {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px 24px;\n}\n.links { display: flex; flex-wrap: wrap; gap: 4px; }\n.links a { display: block; padding: 6px 10px; border-radius: 6px; }\n.links a:hover { background: #1f2937; color: white; }\n.links a:focus-visible { outline: 2px solid #818cf8; outline-offset: 2px; }\n.links a[aria-current=\"page\"] { color: white; background: #374151; }\n```\nPoints to mention: a `<nav>` with a list of links (screen readers announce \"list, 4 items\"), `aria-current=\"page\"` for the active link, padding on the links for bigger touch targets, and `gap` instead of margins. A hamburger menu needs a `<button aria-expanded>` and a little JS."
            }
          ]
        },
        {
          "title": "Components & effects",
          "items": [
            {
              "id": "hc5",
              "q": "Truncate text to one line with an ellipsis, and clamp a paragraph to 3 lines.",
              "a": "```css\n.title {\n  white-space: nowrap;      /* one line */\n  overflow: hidden;         /* hide the rest */\n  text-overflow: ellipsis;  /* show … */\n}\n.desc {\n  display: -webkit-box;\n  -webkit-box-orient: vertical;\n  -webkit-line-clamp: 3;\n  line-clamp: 3;\n  overflow: hidden;\n}\n```\nThe single-line version needs all three properties and a constrained width. Inside a flex row, the text element also needs `min-width: 0`, or it won't shrink. Make sure the full text is still available (a tooltip, or the detail page), since truncation hides content."
            },
            {
              "id": "hc6",
              "q": "Build a CSS-only tooltip that shows on hover and on keyboard focus.",
              "a": "```css\n.tooltip {\n  position: absolute;\n  bottom: calc(100% + 8px);\n  left: 50%;\n  translate: -50% 4px;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n  transition: opacity .15s, translate .15s, visibility .15s;\n}\n.tooltip::after {             /* the arrow */\n  content: \"\";\n  position: absolute;\n  top: 100%;\n  left: 50%;\n  translate: -50% 0;\n  border: 6px solid transparent;\n  border-top-color: #111827;\n}\n.tip-wrap:hover .tooltip,\n.tip-wrap:focus-within .tooltip {\n  opacity: 1;\n  visibility: visible;\n  translate: -50% 0;\n}\n```\n`visibility: hidden` (not just opacity) keeps it out of the accessibility tree until shown, `aria-describedby` makes screen readers read it, and `:focus-within` covers keyboard users. A full solution also closes it on Escape, which needs JS. The CSS triangle uses one coloured border on a zero-size box."
            },
            {
              "id": "hc7",
              "q": "Build a modal dialog layout: a dimmed backdrop with a centred panel.",
              "note": "Talk about how you would make it accessible.",
              "a": "```css\n.backdrop {\n  position: fixed;\n  inset: 0;                         /* top/right/bottom/left: 0 */\n  display: grid;\n  place-items: center;\n  padding: 16px;\n  background: rgb(0 0 0 / .5);\n  z-index: 100;\n}\n.dialog {\n  width: min(100%, 420px);\n  max-height: calc(100vh - 32px);\n  overflow: auto;\n  box-shadow: 0 20px 50px rgb(0 0 0 / .3);\n}\n```\nAccessibility: `role=\"dialog\"`, `aria-modal` and a label; move focus into the dialog on open, trap Tab inside, close on Escape, return focus to the trigger, and stop the page behind from scrolling. The native `<dialog>` element with `showModal()` handles focus, Escape, the top layer and a `::backdrop` pseudo-element for you."
            },
            {
              "id": "hc8",
              "q": "Build a loading spinner with CSS animations that respects reduced motion.",
              "a": "```css\n.spinner {\n  border: 4px solid #e5e7eb;\n  border-top-color: #4f46e5;\n  border-radius: 50%;\n  animation: spin .8s linear infinite;\n}\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n@media (prefers-reduced-motion: reduce) {\n  .spinner { animation-duration: 3s; }\n}\n```\nAnimating `transform` keeps it on the compositor (no layout or paint each frame). `role=\"status\"` announces \"Loading…\" politely, and `aria-hidden` hides the decorative ring. For reduced motion you can also swap the spinner for static text."
            },
            {
              "id": "hc9",
              "q": "Style a custom checkbox or toggle switch that stays accessible.",
              "a": "```css\n.switch input {                      /* visually hidden, still focusable */\n  position: absolute; opacity: 0; width: 1px; height: 1px;\n}\n.track { position: relative; transition: background .2s; }\n.track::after {                      /* the knob */\n  content: \"\";\n  position: absolute; top: 3px; left: 3px;\n  width: 18px; height: 18px; border-radius: 50%;\n  background: white;\n  box-shadow: 0 1px 2px rgb(0 0 0 / .3);\n  transition: transform .2s;\n}\n.switch input:checked + .track { background: #4f46e5; }\n.switch input:checked + .track::after { transform: translateX(20px); }\n.switch input:focus-visible + .track { outline: 2px solid #4f46e5; outline-offset: 2px; }\n```\nNever use `display: none` on the input, which removes it from keyboard and screen reader access. The `<label>` makes the whole row clickable. Newer option: `appearance: none` on the input and style it directly. For a real switch, `role=\"switch\"` makes screen readers say \"on/off\" instead of \"checked\"."
            },
            {
              "id": "hc10",
              "q": "Make a sticky table header and a horizontally scrollable table on small screens.",
              "a": "```css\n.table-wrap {\n  overflow: auto;              /* scrolls both ways; becomes the sticky container */\n}\nth {\n  position: sticky;\n  top: 0;\n  z-index: 1;                  /* stay above the body cells */\n}\n```\nKey points: `position: sticky` sticks relative to the nearest **scrolling ancestor**, so the scroll must happen on `.table-wrap`, not on an element in between. The header needs a background, or rows show through. `white-space: nowrap` plus `overflow: auto` gives sideways scrolling on phones instead of squashed columns. For accessibility, make the wrapper focusable (`tabindex=\"0\"`) with a label so keyboard users can scroll it, and keep a real `<table>` with `<th>` cells."
            }
          ]
        }
      ]
    }
  ]
});
