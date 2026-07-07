# TODO

## Tasks

- [ ] Sync claude-cca-guide course content from Downloads update
  - **Files:** `courses/claude-cca-guide/index.html`, `courses/claude-cca-guide/assets/quiz.js`, `courses/claude-cca-guide/assets/style.css`, `courses/claude-cca-guide/assets/results.js` (new file), `courses/claude-cca-guide/lessons/*.html` (30 files)
  - **Acceptance Criteria:** All files from `/Users/davfive/Downloads/claude-cca-guide` copied into `courses/claude-cca-guide`, overwriting the existing lesson/index/asset files and adding `assets/results.js`; `course.json` is left untouched (it doesn't exist in the source and must be preserved — the build script already excludes it when copying to `dist/`); `glossary.html` and `reference/domain-*.html` are unaffected (already byte-identical between source and repo); `npm run build` succeeds afterward and `dist/courses/claude-cca-guide/index.html` contains the new results panel wiring (`assets/results.js` script tag).
  - **Verify:** `npm run build`
  - **Out of Scope:** editing `course.json`; changing `glossary.html` or `reference/` content; any change to lesson content beyond what's in the Downloads source
