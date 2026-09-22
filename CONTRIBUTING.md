# Contributing

Keep the project small, readable and dependency-free. Open an issue before proposing a framework, backend or model integration. Do not submit real source credentials in issues, screenshots or fixtures.

Run `npm test` on Node.js 20+ and `npm start` for local preview. Core tests should exercise behavior and meaningful edge cases. For UI changes, check:

- Demo import, file selection, search, task presets, custom ignore and clearing.
- Folder and multi-file input, non-UTF-8 rejection and size limits.
- Copy success or its manual fallback, plus Markdown download.
- Over-budget files are visibly listed and exported files are complete.
- English / Chinese switch, keyboard access, desktop and narrow layouts.
- No user content inserted as HTML and no remote assets or network calls.

Useful small improvements: better redaction fixtures using fake values, clearer translations, improved keyboard navigation, and documented browser compatibility. Avoid claiming complete secret detection or exact tokens.
