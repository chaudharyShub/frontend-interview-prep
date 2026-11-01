#!/usr/bin/env node
/**
 * Builds the static pages that search engines read. No dependencies; needs Node 18+.
 *
 *   node scripts/build.mjs           write the pages
 *   node scripts/build.mjs --check   fail if the committed pages are out of date (for CI)
 *
 * Run it after changing anything in templates/ or assets/js/tracks/. It writes:
 *   index.html                      home page
 *   <track>.html                    a track's first tab, e.g. /react
 *   <track>/<tab>.html              its other tabs, e.g. /react/coding
 *   <track>/<question-slug>.html    one page per question, e.g. /javascript/what-are-closures-give-a-real-world-example
 *   starred.html, 404.html, sitemap.xml, and the ?tab= redirects in vercel.json
 *
 * Every page carries its own title, description, canonical URL and content in plain HTML.
 * The app (assets/js/app.js) then takes over in the browser exactly as before.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://frontend-interview-prepare.vercel.app';
const SITE_NAME = 'Frontend Interview Prep';
const OG_IMAGE = `${SITE}/assets/og-image.png`;
// Track data files, in the order the tracks appear on the site.
const TRACK_FILES = ['javascript', 'typescript', 'react', 'nextjs', 'html-css', 'system-design'];
const CHECK = process.argv.includes('--check');

// ---------- Load the data with the same code the browser runs ----------
// Line endings are normalised so the output is the same on Windows and Linux (CI).
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
const sandbox = vm.createContext({ window: {} });
for (const rel of ['assets/js/markdown.js', ...TRACK_FILES.map(t => `assets/js/tracks/${t}.js`)]) {
  vm.runInContext(read(rel), sandbox, { filename: rel });
}
const { esc, inline, codeBlock, md, slugify } = sandbox.window.MD;
const TRACKS = sandbox.window.TRACKS;
const LIVE = TRACKS.filter(t => !t.comingSoon);

const layout = read('templates/layout.html');
const appMain = read('templates/app.html');
const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in vars)) throw new Error(`No value for {{${k}}}`);
  return vars[k];
});

// ---------- Index of every question ----------
const ENTRIES = [];
for (const track of TRACKS) {
  const seen = new Map();
  const reserved = new Set(track.tabs.map(t => t.slug));
  for (const tab of track.tabs) for (const section of tab.sections) for (const item of section.items) {
    const slug = slugify(item.q);
    if (!slug) throw new Error(`Question ${item.id} has no usable slug`);
    if (reserved.has(slug)) throw new Error(`Question ${item.id}'s slug "${slug}" clashes with a tab of ${track.slug}`);
    if (seen.has(slug)) throw new Error(`Questions ${seen.get(slug)} and ${item.id} in ${track.slug} share the slug "${slug}". Reword one of them.`);
    seen.set(slug, item.id);
    ENTRIES.push({ item, track, tab, section, slug });
  }
}
const count = pred => ENTRIES.filter(pred).length;
const label = t => t.short || t.title;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// ---------- Small helpers ----------
const url = p => `${SITE}/${p}`;                       // absolute URL of a page path ('' = home)
const trackPath = (track, tab) => track.slug + (tab && tab !== track.tabs[0] ? `/${tab.slug}` : '');
const questionPath = e => `${e.track.slug}/${e.slug}`;

// Plain-text summary for meta descriptions: no code, no Markdown, about 155 characters.
function summary(text, max = 155) {
  const s = text.replace(/```[\s\S]*?```/g, ' ').replace(/[`*]/g, '').replace(/^\s*(- |\d+\. )/gm, '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/[\s,.;:–-]+\S*$/, '') + '…';
}
// JSON-LD block. "<" is escaped so the data can never close the script tag.
const jsonLd = (data, attr = '') =>
  `  <script type="application/ld+json"${attr}>${JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c')}</script>\n`;
const breadcrumbLd = crumbs => jsonLd({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: url(c.path) })),
}, ' data-breadcrumbs');

function head({ title, description, path: p, noindex = false, ld = '' }) {
  const t = esc(title), d = esc(description), u = url(p);
  return `  <title>${t}</title>
  <meta name="description" content="${d}">
${noindex ? '  <meta name="robots" content="noindex">\n' : ''}  <meta name="author" content="Shubham Chaudhary">
  <meta name="theme-color" content="#f7f8fa" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0d1017" media="(prefers-color-scheme: dark)">
  <link rel="canonical" href="${u}">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:url" content="${u}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_GB">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image" content="${OG_IMAGE}">
${ld}`;
}

// Links between pages are relative to the page's folder, so `base` is '' at the top level and '../' one level down.
const trackNav = (base, current) =>
  LIVE.map(t => `<a href="${base}${t.slug}"${t === current ? ' aria-current="page"' : ''}>${esc(label(t))}</a>`).join('') +
  `<a href="${base}starred"${current === 'starred' ? ' aria-current="page"' : ''}>★ Starred</a>`;

const breadcrumbHtml = (base, crumbs) => '<ol>' + crumbs.map((c, i) => i === crumbs.length - 1
  ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
  : `<li><a href="${base}${c.path || './'}">${esc(c.name)}</a></li>`).join('') + '</ol>';

const appScripts = base => [...TRACK_FILES.map(t => `tracks/${t}.js`), 'markdown.js', 'app.js', 'challenges.js', 'editor.js']
  .map(f => `  <script src="${base}assets/js/${f}" defer></script>`).join('\n');

function page({ base, headVars, nav, skipHref = '#main', skipText = 'Skip to questions', main, scripts }) {
  return fill(layout, {
    head: head(headVars), base, home: base || './', trackNav: nav, skipHref, skipText, main, scripts,
  });
}

// Same markup app.js renders, so the page doesn't shift when the app takes over.
const CHEV = '<svg class="chev" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const STAR = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const CHEV_SM = '<svg class="chev-sm" viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function listHtml(base, sections) {
  let num = 0, list = '', toc = '';
  sections.forEach((sec, si) => {
    const sid = `section-${si + 1}`;
    list += `<section class="section" id="${sid}"><button type="button" class="section-head" aria-expanded="true" aria-controls="${sid}-body"><span class="section-num">${si + 1}</span><h2 class="section-title">${esc(sec.title)}</h2><span class="section-meta"><span class="section-count">0 / ${sec.items.length}</span><span class="bar"><span class="bar-fill"></span></span></span>${CHEV}</button><div class="section-body" id="${sid}-body"><ul class="qlist">`;
    for (const it of sec.items) {
      num++;
      const e = ENTRIES.find(x => x.item === it);
      list += `<li class="qitem" id="question-${esc(it.id)}"><div class="qline"><label class="qrow" for="q-${esc(it.id)}"><input type="checkbox" class="check" id="q-${esc(it.id)}"><span class="qn">${num}</span><span class="qbody"><span class="qt">${esc(it.q)}</span>${it.note ? `<span class="note">${esc(it.note)}</span>` : ''}</span></label><button type="button" class="starbtn" aria-pressed="false" aria-label="Star question ${num} for review" title="Star for review">${STAR}</button></div>`;
      list += `<div class="more"><div class="more-btns">${it.code ? `<button type="button" class="linkbtn codebtn" aria-expanded="false">Show code ${CHEV_SM}</button>` : ''}${it.a ? `<button type="button" class="linkbtn ansbtn" aria-expanded="false">Show answer ${CHEV_SM}</button>` : ''}<a class="linkbtn pagelink" href="${base}${questionPath(e)}">Open page</a></div></div></li>`;
    }
    list += '</ul></div></section>';
    toc += `<li><a href="#${sid}" data-si="${si}"><span>${esc(sec.title)}</span><span class="toc-count">0/${sec.items.length}</span><span class="bar"><span class="bar-fill"></span></span></a></li>`;
  });
  return { list, toc };
}

// Values for templates/app.html. Track pages and the starred page override some of them.
const appDefaults = {
  breadcrumbHidden: ' hidden', breadcrumb: '', eyebrowHidden: '',
  heroTitle: 'Frontend interview questions,<br class="br-md"> answered and tracked.',
  heroLead: 'A focused checklist for mid- to senior-level frontend roles. Answer each question out loud first, then reveal the model answer to check yourself. Tick it off once you can explain it with confidence, or star it to come back to later.',
  statTotal: ENTRIES.length, statSections: LIVE.length, statSectionsLabel: 'Tracks',
  tabsHidden: ' hidden', tabs: '', homeHidden: ' hidden', trackGrid: '', starredHref: 'starred',
  trackHidden: ' hidden', tocTitle: 'Sections', toc: '', list: '', home: './',
};

// ---------- Collect the output ----------
const out = new Map();   // file path (relative to ROOT) -> contents
const sitemap = [];      // page paths

// Home
{
  const grid = TRACKS.map(t => {
    if (t.comingSoon) return `<div class="track-card soon"><div class="track-top"><h3>${esc(t.title)}</h3><span class="badge">Coming soon</span></div><p>${esc(t.description)}</p></div>`;
    const n = count(e => e.track === t);
    const tabs = t.tabs.length > 1
      ? t.tabs.map(tb => `${tb.sections.reduce((k, s) => k + s.items.length, 0)} ${tb.title.toLowerCase()}`).join(' · ')
      : plural(n, 'question');
    return `<a class="track-card" href="${t.slug}"><div class="track-top"><h3>${esc(t.title)}</h3></div><p>${esc(t.description)}</p><p class="track-tabs">${esc(tabs)}</p><div class="track-progress"><span class="bar"><span class="bar-fill"></span></span><span class="track-done">0 / ${n}</span></div></a>`;
  }).join('');
  const description = `${ENTRIES.length} frontend interview questions with clear answers: JavaScript, React, hooks, Redux, performance, machine coding, TypeScript, Next.js and system design. Practise and track your progress.`;
  out.set('index.html', page({
    base: '',
    headVars: {
      title: 'Frontend Interview Questions and Answers – JavaScript, React, Next.js | Frontend Interview Prep',
      description, path: '',
      ld: jsonLd({ '@type': 'WebSite', name: SITE_NAME, url: url(''), description }) +
        jsonLd({
          '@type': 'ItemList', name: 'Interview question tracks',
          itemListElement: LIVE.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: `${t.title} interview questions`, url: url(t.slug) })),
        }),
    },
    nav: trackNav('', null), skipHref: '#homeView', skipText: 'Skip to tracks',
    main: fill(appMain, { ...appDefaults, homeHidden: '', trackGrid: grid }),
    scripts: appScripts(''),
  }));
  sitemap.push('');
}

// Tracks and tabs
for (const track of TRACKS) {
  const tabs = track.tabs.length ? track.tabs : [null];
  for (const tab of tabs) {
    const p = trackPath(track, tab);
    const base = p.includes('/') ? '../' : '';
    const isFirst = !tab || tab === track.tabs[0];
    const multi = track.tabs.length > 1;
    const n = tab ? count(e => e.tab === tab) : 0;
    const title = isFirst
      ? `${track.title} Interview Questions and Answers${multi ? ` – ${tab.title}` : ''} | ${SITE_NAME}`
      : `${label(track)} ${tab.title} Interview Questions and Answers | ${SITE_NAME}`;
    const description = track.comingSoon
      ? `${track.title} interview questions are coming soon. ${track.description}`
      : `${n} ${label(track)} ${multi ? `${tab.title.toLowerCase()} ` : ''}interview questions with answers. ${track.description}`;

    const crumbs = [{ name: 'Home', path: '' }];
    if (multi) crumbs.push({ name: track.title, path: track.slug }, { name: tab.title, path: p });
    else crumbs.push({ name: track.title, path: track.slug });

    const tabsHtml = multi ? track.tabs.map(tb => {
      const on = tb === tab;
      return `<a class="tab${on ? ' on' : ''}" href="${base}${trackPath(track, tb)}"${on ? ' aria-current="page"' : ''}>${esc(tb.title)} <span class="tab-count">0/${count(e => e.tab === tb)}</span></a>`;
    }).join('') : '';
    const { list, toc } = listHtml(base, tab ? tab.sections : []);

    out.set(`${p}.html`, page({
      base,
      headVars: { title, description: summary(description, 160), path: p, noindex: !!track.comingSoon, ld: breadcrumbLd(crumbs) },
      nav: trackNav(base, track),
      main: fill(appMain, {
        ...appDefaults,
        breadcrumbHidden: '', breadcrumb: breadcrumbHtml(base, crumbs), eyebrowHidden: ' hidden',
        heroTitle: esc(`${track.title} interview questions`), heroLead: esc(track.description),
        statTotal: count(e => e.track === track),
        statSections: track.tabs.reduce((k, t) => k + t.sections.length, 0),
        statSectionsLabel: 'Sections',
        tabsHidden: multi ? '' : ' hidden', tabs: tabsHtml, starredHref: `${base}starred`, home: base || './',
        trackHidden: '', toc, list,
      }),
      scripts: appScripts(base),
    }));
    if (!track.comingSoon) sitemap.push(p);
  }
}

// One page per question
const QUESTION_JS = '  <script src="../assets/js/page.js" defer></script>';
for (const e of ENTRIES) {
  const { item, track, tab, section } = e;
  const p = questionPath(e);
  const base = '../';
  const multi = track.tabs.length > 1;
  const crumbs = [{ name: 'Home', path: '' }, { name: track.title, path: track.slug }];
  if (multi) crumbs.push({ name: tab.title, path: trackPath(track, tab) });
  crumbs.push({ name: item.q, path: p });
  const visibleCrumbs = crumbs.slice(0, -1).concat({ name: 'Question', path: p });

  const inTab = ENTRIES.filter(x => x.tab === tab);
  const i = inTab.indexOf(e);
  const prev = inTab[i - 1], next = inTab[i + 1];
  const related = ENTRIES.filter(x => x.section === section && x !== e);
  const coding = tab.slug === 'coding';
  const practise = `${base}${trackPath(track, tab)}#question-${encodeURIComponent(item.id)}`;

  const main = `  <section class="hero qhero">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">${breadcrumbHtml(base, visibleCrumbs)}</nav>
      <p class="eyebrow">${esc(track.title)} · ${esc(section.title)}</p>
      <h1>${esc(item.q)}</h1>
      ${item.note ? `<p class="lead">${esc(item.note)}</p>` : ''}
    </div>
  </section>

  <main class="container qpage" id="main">
    <article class="qpage-article">
      ${item.code ? `<h2 class="qpage-h">Code</h2>\n      ${codeBlock(item.code)}` : ''}
      <h2 class="qpage-h">Answer</h2>
      <div class="answer">${item.a ? md(item.a) : '<p>No model answer yet.</p>'}</div>
      <div class="qpage-cta">
        <a class="btn btn-primary" href="${practise}">${coding ? 'Solve it in the editor' : 'Practise it in the checklist'} →</a>
        <span>Tick it off when you can explain it, or star it to review later.</span>
      </div>
    </article>
${prev || next ? `
    <nav class="qpage-pn" aria-label="Previous and next question">
      ${prev ? `<a class="qpage-prev" href="${prev.slug}"><span>← Previous</span>${esc(prev.item.q)}</a>` : '<span></span>'}
      ${next ? `<a class="qpage-next" href="${next.slug}"><span>Next →</span>${esc(next.item.q)}</a>` : '<span></span>'}
    </nav>
` : ''}${related.length ? `
    <section class="qpage-related" aria-labelledby="related-h">
      <h2 class="qpage-h" id="related-h">More ${esc(section.title)} questions</h2>
      <ul>${related.map(r => `<li><a href="${r.slug}">${esc(r.item.q)}</a></li>`).join('')}</ul>
      <p><a href="${base}${trackPath(track, tab)}">All ${esc(track.title)} ${multi ? esc(tab.title.toLowerCase()) + ' ' : ''}questions →</a></p>
    </section>
` : ''}  </main>
`;

  out.set(`${p}.html`, page({
    base,
    headVars: {
      title: `${item.q.replace(/\.$/, '')} – ${label(track)} Interview Question | ${SITE_NAME}`,
      description: summary(item.a || item.q),
      path: p,
      ld: breadcrumbLd(crumbs) + jsonLd({
        '@type': 'LearningResource',
        name: item.q,
        description: summary(item.a || item.q),
        url: url(p),
        learningResourceType: 'Interview question',
        educationalLevel: 'Intermediate to advanced',
        inLanguage: 'en',
        teaches: `${track.title}: ${section.title}`,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: url('') },
      }),
    },
    nav: trackNav(base, track), skipText: 'Skip to the answer',
    main, scripts: QUESTION_JS,
  }));
  sitemap.push(p);
}

// Starred (personal, so not indexed)
out.set('starred.html', page({
  base: '',
  headVars: {
    title: `Starred questions | ${SITE_NAME}`,
    description: 'Your starred frontend interview questions, from every track.',
    path: 'starred', noindex: true,
  },
  nav: trackNav('', 'starred'),
  main: fill(appMain, {
    ...appDefaults, eyebrowHidden: ' hidden', heroTitle: 'Starred questions',
    heroLead: 'Every question you starred, from all tracks. Unstar a question once you can answer it confidently.',
    statTotal: 0, statSections: 0, trackHidden: '', tocTitle: 'Tracks',
  }),
  scripts: appScripts(''),
}));

// 404 (served at any depth, so links are absolute)
out.set('404.html', page({
  base: '/',
  headVars: { title: `Page not found | ${SITE_NAME}`, description: 'This page does not exist.', path: '404', noindex: true },
  nav: trackNav('/', null),
  main: `  <section class="hero">
    <div class="container">
      <p class="eyebrow">404</p>
      <h1>Page not found</h1>
      <p class="lead">That page doesn't exist, or the question was renamed. Pick a track to keep practising.</p>
    </div>
  </section>
  <main class="container home" id="main">
    <div class="track-grid">${LIVE.map(t => `<a class="track-card" href="/${t.slug}"><div class="track-top"><h3>${esc(t.title)}</h3></div><p>${esc(t.description)}</p></a>`).join('')}</div>
  </main>
`,
  scripts: '  <script src="/assets/js/page.js" defer></script>',
}));

// Sitemap
out.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(p => `  <url><loc>${esc(url(p))}</loc></url>`).join('\n')}
</urlset>
`);

// Old ?tab= links (e.g. /react?tab=coding) now live at /react/coding.
{
  const vercel = JSON.parse(read('vercel.json'));
  delete vercel.rewrites;
  vercel.redirects = TRACKS.flatMap(t => t.tabs.slice(1).map(tb => ({
    source: `/${t.slug}`,
    has: [{ type: 'query', key: 'tab', value: tb.slug }],
    destination: `/${t.slug}/${tb.slug}`,
    permanent: true,
  })));
  const ordered = {};
  for (const k of ['$schema', 'cleanUrls', 'trailingSlash', 'redirects']) if (k in vercel) ordered[k] = vercel[k];
  Object.assign(ordered, vercel);
  out.set('vercel.json', JSON.stringify(ordered, null, 2) + '\n');
}

// ---------- Write, or check ----------
// Track folders are fully generated: stale question pages (from renamed questions) are removed.
const generatedDirs = TRACKS.map(t => t.slug);
const existing = generatedDirs.flatMap(d => {
  const dir = path.join(ROOT, d);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => `${d}/${f}`) : [];
});
const stale = existing.filter(f => !out.has(f));

if (CHECK) {
  const changed = [...out].filter(([f, c]) => !fs.existsSync(path.join(ROOT, f)) || read(f) !== c).map(([f]) => f);
  if (changed.length || stale.length) {
    console.error(`Generated pages are out of date (${changed.length + stale.length} files). Run: node scripts/build.mjs`);
    [...changed, ...stale].slice(0, 20).forEach(f => console.error('  ' + f));
    process.exit(1);
  }
  console.log(`All ${out.size} generated files are up to date.`);
} else {
  for (const f of stale) fs.unlinkSync(path.join(ROOT, f));
  for (const [f, c] of out) {
    fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, f), c);
  }
  console.log(`Wrote ${out.size} files (${ENTRIES.length} question pages)${stale.length ? `, removed ${stale.length} stale` : ''}.`);
}
