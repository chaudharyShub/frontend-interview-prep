<div align="center">

<img src="assets/favicon.svg" width="72" height="72" alt="Frontend Interview Prep logo">

# Frontend Interview Prep

**176 frontend interview questions with clear answers. Practise, check yourself and track your progress.**

[**Open the live app →**](https://frontend-interview-prod.vercel.app)

[![Deployed on Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000?logo=vercel&logoColor=white)](https://frontend-interview-prod.vercel.app)
![Questions](https://img.shields.io/badge/questions-176-4f46e5)
![No dependencies](https://img.shields.io/badge/dependencies-0-059669)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

</div>

<p align="center">
  <img src="docs/screenshot-light.png" alt="Frontend Interview Prep – light theme" width="49%">
  <img src="docs/screenshot-dark.png" alt="Frontend Interview Prep – dark theme" width="49%">
</p>

## About

A focused checklist for mid- to senior-level frontend interviews (around 4–5 years of experience). Each question comes with a concise model answer, and code where it helps.

The recommended way to use it:

1. Read a question and answer it **out loud** first.
2. Open **Show answer** and compare.
3. Tick the question once you can explain it confidently.

## What's covered

| # | Topic | Questions |
|---|-------|:---------:|
| 1 | React core concepts | 20 |
| 2 | React hooks | 21 |
| 3 | Redux & state management | 15 |
| 4 | JavaScript fundamentals | 23 |
| 5 | React performance optimization | 15 |
| 6 | Machine coding & JavaScript programming | 22 |
| 7 | API handling & real-world scenarios | 15 |
| 8 | Frontend architecture & senior-level topics | 15 |
| 9 | Project & behavioural questions | 14 |
| 10 | TypeScript & Next.js | 10 |
| 11 | Senior-level follow-ups | 6 |

28 questions are marked **★ Priority** – the ones that come up most often.

## Features

- **Progress tracking** – ticks are saved in your browser (`localStorage`); no account needed.
- **Search** questions *and* answers. Press <kbd>/</kbd> to jump to search, <kbd>Esc</kbd> to clear.
- **Filters** – All, Remaining, Done and Priority.
- **Topic sidebar** with per-topic progress and the current topic highlighted.
- **Light and dark themes**, following your system setting by default.
- **Copy buttons** on code examples.
- **Accessible** – keyboard friendly, proper ARIA states, respects reduced-motion.
- **Fast and private** – plain HTML, CSS and JavaScript. No frameworks, no build step, no tracking, no third-party requests.

## Run locally

No install needed. Clone the repo and either open `index.html` directly or serve the folder:

```bash
git clone https://github.com/chaudharyShub/frontend-interview-prep.git
cd frontend-interview-prep
npx serve .            # or: python -m http.server
```

## Project structure

```
.
├── index.html              # Page markup and meta tags
├── assets/
│   ├── css/styles.css      # All styles (light + dark themes)
│   ├── js/questions.js     # Question bank – edit this to add questions
│   ├── js/app.js           # Rendering, search, filters, progress
│   ├── js/theme.js         # Applies the saved theme before first paint
│   ├── favicon.svg
│   └── og-image.png        # Link preview image
├── docs/                   # README screenshots
└── vercel.json             # Security headers and caching
```

## Adding or editing questions

All content lives in [`assets/js/questions.js`](assets/js/questions.js). Each topic has a `title` and a list of `items`:

```js
{
  "id": "177",          // unique and stable – progress is saved against it
  "n": 21,              // number shown in the list
  "q": "What is ...?",  // the question
  "a": "Answer text…",  // supports paragraphs, - lists, 1. lists, `code`, **bold** and ``` fences
  "top": true           // optional: mark as ★ Priority
}
```

Never change the `id` of an existing question, or people will lose their progress for it.

## Contributing

Spotted a mistake or have a question worth adding? [Open an issue](https://github.com/chaudharyShub/frontend-interview-prep/issues/new) or send a pull request.

## Deployment

The site is deployed on [Vercel](https://vercel.com). Every push to `main` goes live automatically; no build settings are needed.

## License

[MIT](LICENSE) © Shubham Chaudhary
