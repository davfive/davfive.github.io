# davfive.github.io

Home for my `/teach` courses — a parent landing page linking out to
individually published courses, each of which can be plain HTML or a
framework app (React, Vite, etc.).

## How it's structured

```
site/               source for the landing page (plain HTML/CSS)
courses/<name>/      one course per directory (see courses/README.md)
scripts/build.mjs    assembles dist/ from site/ + courses/
```

- `main` — source for everything (landing page, courses, build tooling).
- `gh-pages` — generated output only, pushed by `npm run publish`. Don't edit
  it by hand; it's overwritten on every deploy.

## Adding a course

See [`courses/README.md`](courses/README.md).

## Building locally

```
npm run build   # writes dist/
npm run serve   # serves dist/ at http://localhost:3000
```

## Deployment

Deployment is manual — pushing to `main` does not publish anything by itself.

```
npm run publish   # builds dist/, then pushes it straight to gh-pages
```

This uses the [`gh-pages`](https://github.com/tschaub/gh-pages) package to
build and push `dist/` to the `gh-pages` branch directly. GitHub Pages is
configured (Settings → Pages) to serve from the `gh-pages` branch, root.
