# Context Pocket

**Pocket your code. Give AI the full picture.**

A small, browser-only tool that turns local source files into focused Markdown context for AI conversations. **No install, no dependencies, no API key, no code uploads.**

[Open the app](https://tuitangziz.github.io/context-pocket-web/) · [简体中文](README.zh-CN.md) · [Report a bug](https://github.com/tuitangziz/context-pocket-web/issues)

![Context Pocket showing the local demo project](docs/screenshot.png)

## Try it in 30 seconds

1. [Open Context Pocket](https://tuitangziz.github.io/context-pocket-web/) and click **EN** for English.
2. Click **Try a demo**, or choose a local project folder.
3. Select the files that matter and describe your task.
4. Review the generated context, then **Copy context** or **Download .md**.
5. Paste it into your preferred AI conversation.

Context Pocket prepares context; it does not call or run an AI model.

## Why another context tool?

Sometimes you only need to ask AI about a small project, without installing a CLI or giving a service access to your repository. Context Pocket focuses on that short workflow: **pick → preview → copy**.

- **Local processing:** source files are read in browser memory. No analytics, external fonts, CDN scripts or upload endpoints. A `connect-src 'none'` policy blocks script network connections.
- **Focused context:** search and select files, choose a task preset, and add ignore globs.
- **Whole-file budgets:** includes task, file list and Markdown overhead; skips files that do not fit instead of cutting code midway.
- **Visible filtering:** dependencies, build output, common credential filenames, unsupported files and large files are skipped with reasons.
- **Best-effort masking:** recognizable API tokens, private key blocks and secret assignments are replaced with `[REDACTED]`.
- **中文 / English:** bilingual interface and task presets. Chinese is the initial language.
- **Works offline:** download the repository ZIP, extract it, and open `index.html`. Keep `app.js`, `core.js`, `style.css` and `icon.svg` alongside it.

For large repositories, exact model tokenization, full `.gitignore` behavior or a CLI, consider [Repomix](https://github.com/yamadashy/repomix) or [Gitingest](https://github.com/coderamp-labs/gitingest). This is an independent, smaller project, not a replacement for every feature they offer.

## Run locally

**No runtime needed:** download via GitHub **Code → Download ZIP**, extract, then double-click `index.html` in a modern desktop browser.

Or use Node.js 20+ for a localhost preview:

```sh
git clone https://github.com/tuitangziz/context-pocket-web.git
cd context-pocket-web
npm start
```

Open `http://127.0.0.1:8765`. There is **no `npm install` step**. The optional server binds only to loopback and serves an explicit list of app assets.

Clipboard access can be restricted on `file://`. When that happens, the preview is selected: press **Ctrl+C / ⌘C**, or download the Markdown file. Folder picking is intended for desktop Chrome/Edge; use **Choose files** when your browser does not support folder selection.

## Ignore rules

Use the ignore box, or add a `.contextignore` file at the root of the folder you select:

```gitignore
# One glob per line
tests/
*.csv
docs/**
src/**/generated?.py
```

- `*` matches within a path segment, `**` matches across directories, `?` matches one character.
- Patterns with `/` are relative to the selected root; simple names match at any depth.
- A trailing `/` excludes a directory's contents.
- Blank lines and lines beginning with `#` are ignored.
- This deliberately small format has **no negation, escaping or full Git semantics**. `.gitignore` files are not interpreted. Nested `.contextignore` files are not applied.
- Custom rules hide matching files from selection; removing a rule restores their previous selection state. Search only filters the visible list, not the exported selection.

## Limits and privacy

| Item | v1 behavior |
| --- | --- |
| Text encoding | UTF-8; binary / invalid UTF-8 files are skipped |
| File size | At most 256 KiB per source file |
| Import | At most 2,000 eligible files and 20 MiB of source bytes |
| Output budget | 8,000–200,000 JavaScript string characters (UTF-16 code units) |
| Ordering | Deterministic, case-sensitive path order; smaller later files may fit after a skipped file |
| Token count | Rough ASCII/CJK heuristic, **not** a model-specific tokenizer |
| State | In memory only; reload / close clears the project |

**Masking is a convenience, not a security guarantee.** It can miss secrets, personal information, custom credential formats or sensitive filenames, and may mask harmless code. Review the output before pasting it into another service. Files marked as common secret files cannot be manually re-enabled in v1; even `.env.example` is excluded. Python notebooks are treated as raw JSON, including outputs, so review them carefully.

The hosted version retrieves the app assets from GitHub Pages, whose normal hosting logs/policies apply. Your selected file contents are not sent to that host. Opening the downloaded files avoids that initial hosting request. Nothing is automatically sent to an AI provider; copying or sharing the output is your separate action.

## Development

```sh
npm test
npm start
```

Tests use Node's built-in test runner. No package dependencies, framework or build step.

| File | Purpose |
| --- | --- |
| `core.js` | Filtering, glob matching, decoding, masking and budgeted Markdown |
| `app.js` | File selection, bilingual UI, preview and export |
| `index.html`, `style.css` | Accessible controls and responsive layout |
| `serve.cjs` | Optional loopback-only preview server |
| `tests/core.test.cjs` | Core behavior and edge cases |

See [CONTRIBUTING.md](CONTRIBUTING.md) for manual checks and focused contribution ideas. If this saves you a few minutes, a star helps other people discover it. Bug reports and small improvements are welcome.

## License

[MIT](LICENSE)
