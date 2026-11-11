---
name: write-page
description: How to write or change a page in the Kestello docs, for site owners (guide/) or developers (developers/), with every fact checked against the Kestello code. Load it before adding a page, documenting a new feature, or correcting an existing page.
---

# Writing a docs page

## Pick the audience

- **`guide/`**: someone who runs a site through the admin and an FTP client or hosting panel. Explain each term the first time. No code to read; commands only where there is no other way, given in full.
- **`developers/`**: someone who writes PHP 8.4 and Vue. Real code that runs, with the `use` lines it needs.

A feature usually needs both: the guide says what to click, the developer page says how to extend or configure it.

## Find the facts

Work from the Kestello source ([kestellohq/cms](https://github.com/kestellohq/cms)):

| You need | Where it is |
| --- | --- |
| An admin label or message | The Vue page under `core/resources/js/pages/admin/`, the text inside `__()`. Copy it exactly. |
| A menu path such as **Site → Updates** | The `admin->page()` registration in the module (`core/src/Cms/**/*Module.php`): its group and label. |
| A command and its options | `core/src/Cms/Console/**/*Command.php`: `$name`, `$description`, and the options `handle()` reads. Run it and copy the output. |
| A config key and its default | `core/config/*.php`; the site's own files in `config/` override them. |
| An API endpoint | `core/src/Cms/Api/Endpoints/`, or the explorer at **System → API**. |
| An error message | `throw` and `ApiProblem` calls in the code path, word for word. |

## Shape the page

Follow STYLE.md, "Structure of a page": what the page covers and when you need it; the task in the order the reader meets it, with numbered steps (one action each); "If something goes wrong" with the real messages in bold quotes and what each means; "Next" with links.

- Admin labels in bold, exactly as shown: **Review the update**, **Site → Settings**.
- Commands in `bash` blocks without `$`; output in a separate `text` block, copied from a real run.
- Tables for reference (settings, commands, fields), never for steps.
- `::: warning` for data loss or lock-out, `::: danger` only for what cannot be undone.

## Pictures

- A screenshot where the task starts (STYLE.md, "Screenshots"), taken with `tools/screenshots/`.
- A diagram for an order of steps or a stack of layers: `<Flow>` or `<Layers>` (STYLE.md, "Diagrams").

## VitePress gotchas

- Angle brackets outside code become HTML tags and break the build: write `&lt;zip&gt;` in prose, or put it in code.
- Double braces are interpolated even in inline code. Rephrase, or use a fenced block (fenced blocks are safe).
- Internal links are absolute and without `.md`: `/guide/updates#new-versions`. The build fails on a dead one.

## Check and finish

```bash
npm run style
npm run check
```

- [ ] Every label, command, key and message was checked in the code or the running admin.
- [ ] The page is in the sidebar (`.vitepress/config.mts`) and linked from the pages a reader comes from.
- [ ] `npm run check` passes.
