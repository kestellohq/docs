# Site search

Visitors can search your site for anything public: a recipe, the opening hours, last spring's news. This page shows where search lives, how to put a search box on a page, what search finds and what it leaves out, and what to do when results are missing something or show something they shouldn't.

## How search works

Visitors search at `/search` on your site, for example `https://example.com/search?q=opening+hours`. The results page lists matching entries, best matches first (newer entries first when two match equally well), with the title, a short piece of text around the words found, and the type of each result. When the results come from more than one type, visitors can narrow them to one, such as only **Posts**.

To put a search field on your pages, add the **Search box** block in the block editor (in the **Widgets** group). Its settings are:

- **Label**: the text above the box. The default is "Search".
- **Button text**: the label of the button. The default is "Search".
- **Search in**: **Everything**, or one content type.

Many themes also have a search field of their own, for example in the header.

Kestello does not search the site at the moment someone asks. It keeps a **search index**: a copy of the text of everything public, prepared for fast searching. The index is updated each time an entry is saved, published, unpublished, trashed, restored or deleted, so you do not need to do anything for new content to be found.

## What search finds

Only what any visitor may see goes into the index:

- **Published entries** of searchable types. Drafts, scheduled entries, private entries and anything in the trash are left out, and an entry disappears from results as soon as it is unpublished.
- **The title, the excerpt, and the text fields** of each entry: text, long text, formatted text, choices, groups and repeating groups.
- **The text of blocks**: headings, paragraphs, list items, quotes, button labels and captions.
- **The names of its categories and tags**, so a search for a category name finds the posts in it.

Some things are left out on purpose:

- **Blocks not every visitor sees.** A block set to **Only signed-in members**, or limited with **Show from** or **Hide after** (see [Choose who sees a block](/guide/visual-editor#choose-who-sees-a-block)), is not indexed, and nor are the blocks inside it. Otherwise members-only text could turn up in public results. Blocks hidden only on some **Screens**, or shown only to visitors who are not signed in, are indexed, because some visitors do see them.
- **Fields marked Editors only (never shown publicly)** in a content type.
- **Email addresses, links, numbers, dates and colours.** These are rarely what people search for.
- **Alt text of images.**
- **Data a block shows from elsewhere**, such as an **Entry field** block showing the entry's author. The entry's own fields are indexed already.

**Hide from search engines** in an entry's **Search and sharing** card is about outside search engines such as Google. It does not remove the entry from your own site's search.

### Choose which types are searchable

Pages, posts and every other type with public pages are searchable by default. For content types built in the admin, the **Include in site search** switch under **System → Content types** (in the type's **Public pages** card) takes a type out of search, for example a type for testimonials that should only appear inside other pages. Types without public pages are never searchable, since there would be no page to send visitors to.

After changing this switch, or which fields a type has, rebuild the index (see [Rebuild the search index](#rebuild-the-search-index)) so entries that already exist follow the new setting.

## The search engine

The search engine is the part that stores the index and answers searches. Out of the box, Kestello uses the **Database** engine: it searches inside your site's own database, needs no extra service, and is fine for thousands of entries. How well it matches depends on your database:

| Database | How it searches |
|---|---|
| MySQL or MariaDB | Full-text search, with matching titles ranked higher. |
| PostgreSQL | Full-text search. |
| SQLite | Full-text search (FTS5), with matching titles ranked higher. |
| Any of them, when full-text search is not available | Simple text matching: slower, and results are less well ordered. |

**System → Site Health** has a **Site search** check that shows the engine and how it matches. When it falls back to simple text matching, you see **Search uses simple text matching because the database has no full-text index. Results are less relevant and slower on large sites.**

On PostgreSQL, the **Database** engine has one setting, **language**, under **System → Infrastructure → Search**. The default `simple` matches words exactly as written. A language name such as `english` or `german` also matches other forms of a word, so "running" finds "run".

### Other engines

Plugins can add other search engines, such as a separate search service for very large sites. Once one is installed, choose it under **System → Infrastructure**: open **Search** and choose **Change**. Kestello tests the connection before it saves, and rebuilds the index in the background after switching.

If the chosen engine cannot be reached, search keeps working: Kestello answers from the database engine instead and Site Health shows **The search engine can't be reached, so search answers from the database**. Fix the connection, and the chosen engine takes over again.

## Rebuild the search index

Because the index follows every save, you rarely need to rebuild it. Rebuild it when:

- you changed **Include in site search** or the fields of a content type,
- content was added to the database directly, for example by an import tool that bypasses the admin,
- search results look out of date for no clear reason.

Kestello rebuilds the index by itself after a backup is restored and after the search engine is changed.

To rebuild it yourself you need a terminal on the server (SSH). In the site's folder, run:

```bash
php bin/cms search:reindex
```

It prints how many documents were indexed. On a large site this can take a few minutes; search keeps answering while it runs, but results may be incomplete until it finishes.

If you cannot use a terminal, ask your host or developer to run the command. Saving an entry again in the editor also brings that one entry up to date.

## Limits for visitors

Each visitor can search 30 times a minute. Beyond that, the results page says **Too many searches in a short time. Please wait a minute and try again.** This keeps automated scripts from slowing down your site. Normal visitors never reach the limit.

## If something goes wrong

**A published entry does not show up in results.** Check that its type is searchable, and that the words you search for are in its title or text fields rather than in an image's alt text or a members-only block. If both are fine, save the entry again, or rebuild the index.

**Results show an entry that was unpublished or deleted.** This should not happen, because unpublishing and deleting update the index straight away. If it does, rebuild the index. On a site with another search engine, updates go through the background jobs: check that the cron job runs (see [Installing Kestello](/guide/installation#background-tasks)) and look at **System → Background jobs** for failures.

**A page is missing from the results although it is published.** A page above it is a draft, scheduled or in the trash, so it is not public and is left out of search; see [Parent pages](/guide/content#parent-pages). Publish the parent, or move the page. It is back in the results as soon as the parent is published.

**"Search uses simple text matching because the database has no full-text index."** Your database does not offer full-text search, or the full-text index could not be created. Search still works. On MySQL or MariaDB, ask your host whether full-text indexes are supported. On SQLite, the server's SQLite needs the FTS5 extension.

**"Search is not working:" followed by an error.** The search engine itself failed. With the **Database** engine this points at a database problem; see [Site Health](/guide/health#core-database).

**"Too many searches in a short time."** See [Limits for visitors](#limits-for-visitors). If many visitors share one network address (an office, a school), they share the limit too.

## Related pages

- [Pages, posts and other content](/guide/content): what you publish is what search finds.
- [Site Health](/guide/health#search): the **Site search** check.
- [Plugins](/guide/plugins): adding another search engine.
- [Troubleshooting](/guide/troubleshooting): when something else is wrong.
