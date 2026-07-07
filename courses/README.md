# Courses

Each subdirectory here is one published course, served at
`https://davfive.github.io/courses/<name>/`. `_template/` is a starting point,
not a published course — directories prefixed with `_` or `.` are skipped by
the build.

## Adding a static (plain HTML/CSS/JS) course

1. Copy `_template/` to `courses/<your-course-name>/`.
2. Edit `index.html` and add any assets you need.
3. Edit `course.json` (`title`, `description`) — used on the home page.

## Adding a framework-based course (React, Vite, etc.)

1. Scaffold the app inside `courses/<your-course-name>/`, e.g.:
   ```
   npm create vite@latest courses/<your-course-name> -- --template react-ts
   ```
2. Set `base: "/courses/<your-course-name>/"` in the app's build config
   (e.g. `vite.config.ts`) so built asset URLs resolve correctly once deployed
   under a subpath.
3. Make sure `npm run build` outputs to `dist/` or `build/` in that
   directory — the root build script picks either up automatically.
4. Add a `course.json` next to `package.json` (`title`, `description`).

## How publishing works

`scripts/build.mjs` (run in CI on every push to `main`) walks this
directory, builds or copies each course into `dist/courses/<name>/`, and
generates the course list on the home page from each `course.json`. The
result is pushed to the `gh-pages` branch, which GitHub Pages serves. See the
root `README.md` for the full pipeline.
