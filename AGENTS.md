# Kestello docs: instructions for AI agents

This repository is the VitePress site for the Kestello documentation. People follow the same rules, written out in [CONTRIBUTING.md](CONTRIBUTING.md).

## Before you start

1. Read [STYLE.md](STYLE.md) and follow it on every line you write.
2. Load the skill for the task from [.agents/skills/](.agents/skills/).
3. Have the Kestello code at hand ([kestellohq/cms](https://github.com/kestellohq/cms)). Facts come from it, never from memory or from another product.

| Task | Skill |
| --- | --- |
| Write or change a page | [write-page](.agents/skills/write-page/SKILL.md) |

## Hard rules

- **Facts from the code.** Every admin label (exact, in bold), command, option, config key, path and error message is checked against the Kestello source or the running admin. If you can't check something, leave it out and say so.
- **Two readers.** `guide/` pages never ask the reader to read code. `developers/` pages show code that runs.
- **Style:** sentence-case headings; no en or em dashes; none of the banned words in STYLE.md; no exclamation marks, emoji or rhetorical questions.
- **Never promise what is not built.** Say "not available yet" and stop there.
- **Never push, tag or publish** unless the person you work for asks for that action in so many words.

## Commands

```bash
npm ci
npm run dev       # preview at http://localhost:5173
npm run style     # the STYLE.md rules a machine can check
npm run check     # style, its tests and the full build (also catches dead links)
```

VitePress treats Markdown as Vue templates: text in angle brackets outside code (`<folder>`) is read as an HTML tag, and double braces are interpolated even inside inline code. Write `&lt;folder&gt;`, or rephrase.

## Definition of done

- [ ] Every fact was checked against the code or the running admin.
- [ ] New pages have a sidebar entry in `.vitepress/config.mts`.
- [ ] `npm run check` passes.
- [ ] Commits follow Conventional Commits, with no AI assistant trailers.
