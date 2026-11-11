# Writing the Kestello docs

These rules keep the docs readable for two very different readers: the person who runs a site and has never opened a terminal, and the developer who builds plugins. Read them before writing or changing a page.

## Who is reading

- **Guide pages** (`guide/`) are for site owners and editors. Assume they know how to use a browser and an FTP client or a hosting control panel, and nothing else. Explain every term the first time it appears on a page. Never ask them to read code.
- **Developer pages** (`developers/`) are for people who write PHP and Vue. Assume PHP 8.4 and basic Vue. Show real code that runs.

## Voice

- Write to the reader as "you". Write about the product as "Kestello".
- Say what to do, then why, in that order. One idea per sentence.
- Use the exact words the admin uses, in bold: **Site → Backups**, **Upload a plugin**. Check the label in the admin before writing it.
- Prefer short, common words. "Use", not "utilize". "Start", not "initiate". "Help", not "facilitate".
- Do not use these words: seamless, robust, leverage, powerful, effortless, cutting-edge, delve, unlock, elevate, streamline, game-changer, simply, just, easy, obviously.
- No em dashes and no en dashes in prose. Use a comma, a colon, parentheses or a new sentence. Ranges are written with "to": "PHP 8.4 to 8.5".
- No exclamation marks, no emoji, no rhetorical questions as headings.
- Do not promise what is not built. If something is planned, say "not available yet" and leave it at that.

## Structure of a page

1. A first paragraph that says what the page covers and when the reader needs it.
2. The task or concept, in the order the reader will meet it.
3. Numbered steps for anything the reader does. One action per step. Put what they should see after the step when it helps them check they are on track.
4. "If something goes wrong": the real errors this task can produce and what each one means.
5. Links to the next page they are likely to need.

Headings are sentence case ("Restore a backup", not "Restore A Backup") and say what the section does.

## Facts

- Every command, setting, path, label and error message must come from the code or the running system. Run it before you write it down.
- Config keys are written in full: `app.packages.trusted_keys`, not "the trusted keys setting".
- Paths are relative to the site's root folder unless said otherwise: `config/app.php`, `content/plugins/`.
- When behaviour differs between hosting types (shared hosting, VPS, Docker), say so in the step where it matters.

## Formatting

- Commands go in `bash` code blocks, prefixed with nothing (no `$`). Output, when shown, goes in a separate `text` block.
- Use tables for reference material (settings, commands, fields), not for steps.
- Use `::: tip` for a helpful shortcut, `::: warning` for something that can lose data or lock someone out, `::: danger` only for things that cannot be undone.

## Screenshots

- Show the screen the reader is about to use, once, where the task starts: after the first paragraph of the section, or before a lead-in that ends with a colon. Not one per step.
- Take them with the scripts in `tools/screenshots/` from the sample bakery site, never by hand, so they can be taken again after a release. See `tools/screenshots/README.md`.
- Alt text says what the picture shows, with the labels a reader will look for: "The Backups screen: the schedule at the top and the list of backups below it." Not "Screenshot".
- When the text explains a screen part by part, mark the parts with numbers (`mark()`) and use the same numbers in a list under the picture.
- The text must make sense without the picture. Never write "click the button shown above".

## Diagrams

Draw a diagram when the text describes an order of steps, or layers that sit on each other, and a reader would otherwise hold it all in their head. Two components are available on every page (`.vitepress/theme/components/`):

- `<Flow :steps="…" />`: steps in order. Up to four sit in a row of cards; more, or `vertical`, become a timeline. Mark the step the page is about with `tone: 'brand'`, optional ones with `tone: 'muted'`, and where it can stop with `note`.
- `<Layers :layers="…" />`: what sits on what, the top one winning, such as where an email's look comes from.

Put the data in a `<script setup>` block at the top of the page, so the Markdown stays readable. Every label comes from the code or the admin, like any other fact. Give each diagram a `caption` that says what it shows. The text must still make sense without it: a diagram sums up, it never holds a fact the text leaves out.
