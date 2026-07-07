# davfive.github.io

Home for my `/teach` courses — a parent landing page linking out to
individually published courses, each of which can be plain HTML or a
framework app (React, Vite, etc.).

## How it's structured

```
site/               source for the landing page (plain HTML/CSS)
courses/<name>/      one course per directory (see courses/README.md)
scripts/build.mjs    assembles dist/ from site/ + courses/
.github/workflows/   CI: builds and deploys dist/ to gh-pages on every push to main
```

- `main` — source for everything (landing page, courses, build tooling).
- `gh-pages` — generated output only, pushed automatically by CI. Don't edit
  it by hand; it's overwritten on every deploy.

## Adding a course

See [`courses/README.md`](courses/README.md).

## Building locally

```
npm run build   # writes dist/
npm run serve   # serves dist/ at http://localhost:3000
```

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which runs
`npm run build` and pushes the resulting `dist/` to the `gh-pages` branch via
[peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages).
GitHub Pages is configured (Settings → Pages) to serve from the `gh-pages`
branch, root.
