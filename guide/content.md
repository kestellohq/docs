# Pages, posts and other content

This page covers everything you write in Kestello: pages, posts and any content types your site adds. It explains how to create and edit entries, how the block editor works, what each status means, how scheduling, revisions and the trash work, how addresses are made, how categories and tags behave, and how to choose the page visitors see first. Read it before you start adding content to a new site, or when something you published does not show up where you expected.

## Content types

Every piece of content in Kestello is an **entry** of some **content type**. A content type decides which fields an entry has and where its public address lives. Two types are built in:

| Type | What it is for | Where it lives | Main field |
|---|---|---|---|
| **Pages** | Standalone pages such as About or Contact. Pages can be nested under each other. | At the top of the site: `/about`, `/about/team` | **Content**, built with the block editor |
| **Posts** | Dated articles listed on the blog. | Under `/blog`: `/blog/hello-world` | **Content**, a formatted text field, plus **Featured image** and **Excerpt** |

Each type has its own screen under **Content** in the admin menu: **Content → Pages**, **Content → Posts**, and one entry for each type your site adds. Categories and tags (see [Categories and tags](#categories-and-tags)) sit in the same group.

### Your own content types

A site can have more types, such as events, team members or products. They come from two places:

- **Built in the admin**, under **System → Content types**. **New content type** asks for a name, then you add the fields it needs. Types built here work like the built-in ones: the editor, search and public pages all follow them.
- **From the theme or a plugin.** These are listed on the same screen under **From the theme and plugins**. They are defined in code, so you cannot change them in the admin.

Building content types needs the permission *Build content types, fields and taxonomies*, which administrators have. Editors and authors only see the types; they cannot change them.

On **System → Content types**, each type's **Public pages** card decides whether entries get public addresses at all. A type with an empty **Address** is for editors only: its entries never appear on the site. Its **Before publishing** card sets what an entry must have before it goes live; see [Before publishing](#before-publishing).

## Find your way around a content list

Open **Content → Pages** (or any other type). The list shows each entry's title and address, its author, its status and a date.

- **Search titles** filters the list as you type.
- **Order** sorts by **Last edited** (the default) or **Newest published**, among others. Pages can also be sorted by **Page order**.
- The tabs filter by status: **All**, **Published**, **Drafts**, **Scheduled**, **Private** and **Trash**. Tabs with nothing in them are hidden, so on a new site you may only see **All**.

The date column changes with the status: **Goes live** for scheduled entries, **Published** for published ones and **Edited** for drafts.

## Create an entry

1. Open **Content → Pages** (or the type you want) and choose **New page** (the button is named after the type, for example **New post**).
2. Type a title where it says **Add a title**. The address is made from it.
3. Write the entry. Pages and posts open in the [visual editor](/guide/visual-editor); content types without blocks show a form with their fields.
4. Set what the type offers: a parent page, categories and tags, a featured image, the **Search and sharing** fields. In the visual editor they are on the tab named after the type, such as **Page** or **Post**.
5. Choose **Save draft** to keep it private for now, or **Publish** to put it on the site.

You can also press Ctrl+S (Cmd+S on a Mac) to save. On a new entry this saves a draft.

After the first save, the address bar changes to the entry's own address in the admin, and the **Revisions** card starts filling up.

::: tip
While you work on an entry that has been saved once, Kestello keeps a backup of your unsaved changes every 30 seconds. The top of the editor shows "backup kept" and when. If your browser crashes or you close the tab, the next time you open the entry you see **You have unsaved changes from** a date, with **Bring them back** and **Dismiss**.
:::

## Edit an entry

Open the entry from the list. The bar at the top shows whether you have unsaved changes (**Unsaved** in the visual editor, **Unsaved changes** in the form view). The form view also shows the status and a **View on site** link once the entry is published.

How you save depends on the status:

- **Draft**: **Publish** (or **Schedule**, when the date is in the future) and **Save draft**.
- **Published**: **Update** saves your changes to the live page. **Unpublish (back to draft)** takes it off the site.
- **Scheduled**: **Update schedule** and **Unpublish (back to draft)**.

There is no separate working copy of a published entry. **Update** changes the live page straight away. If you want to rework a published page without visitors seeing the half-finished state, unpublish it first, or make your changes in a new draft and copy them over.

If you try to leave the editor with unsaved changes, the browser asks you to confirm.

### When two people edit at once

Each save increases the entry's **Version** (shown in the sidebar). If someone else saved the entry after you opened it, your save stops and you see **Someone else saved this while you were editing**. You have two choices:

- **Load their version**: their changes appear in the editor and yours are lost.
- **Save mine anyway**: your version replaces theirs. Their changes stay in **Revisions**, so nothing is gone for good.

### What each role may do

What you can do with an entry depends on your role. The built-in roles work like this for posts and other non-nested types:

| Role | Create | Publish | Edit other people's entries | Delete |
|---|---|---|---|---|
| **Editor** | Yes | Yes | Yes | Anyone's |
| **Author** | Yes | Their own | No | Their own |
| **Contributor** | Yes | No | No | No |

Pages (and any other type whose entries can have a parent) are for editors only by default. On posts, a contributor saves drafts and submits them for review; see [Reviews](#reviews). Once an entry is published, only someone who may publish can change it. Roles can be changed under **People → Roles**; see [People, roles and sign-in](/guide/people).

## The block editor

Pages and posts are built from **blocks**: a heading, a paragraph of text, an image, a list of posts. You write them in the [visual editor](/guide/visual-editor), where the page looks the way visitors will see it. That page covers adding, moving and styling blocks, and choosing who sees each one.

### The form view

Choose **Form** in the visual editor's bar to edit the same entry as a list of fields instead, and **Visual editor** to go back. In the form view the blocks are a list:

1. Choose **Add block** at the bottom of the list. The **Add a block** window opens.
2. Type in **Search blocks** to filter, or pick from the groups. Press Enter to take the first match.
3. The new block opens at the end of the list with its settings showing. Fill them in.
4. Use the arrows on the right of a block to move it up or down, the copy icon to duplicate it, and the bin icon to remove it. With the keyboard, hold Alt and press the up or down arrow on a block.

Blocks that hold other blocks (**Group**, **Columns**) show their own **Add to** button inside them. A block from a plugin that is turned off shows **Not available: its plugin may be off. It is kept, but not shown on the site.** Its content stays saved; turn the plugin back on and it returns.

## Statuses

| Status | Who sees it | How it gets there |
|---|---|---|
| **Draft** | Only people who can edit it in the admin. | **Save draft**, or **Unpublish (back to draft)**. |
| **In review** | Only people who can edit it in the admin. | **Submit for review**. See [Reviews](#reviews). |
| **Scheduled** | Only the admin, until its time comes. Then it becomes **Published** by itself. | **Schedule**, with a date in the future. |
| **Published** | Everyone, at its address. | **Publish**. |
| **Private** | Not shown on the public site. | The editor has no button for this. Entries can get it from a plugin or the Kestello API. |

A draft never needs its required fields filled in. Kestello only checks them when you publish; the field editor calls these **Required to publish**. A title is needed too: publishing without one shows **Add a title before publishing.**

## Reviews

People who may write but not publish, such as contributors, send their work to an editor for review. The editor publishes it, or sends it back saying what to change. Everyone involved is told at each step.

### Submit for review

1. Write the entry and choose **Submit for review**. Like publishing, this needs a title and every field marked **Required to publish**.
2. The status changes to **In review**. If the entry is assigned to someone, they are told; otherwise everyone who may publish it is.

While it waits you can keep editing it: **Save changes** keeps it in review. **Withdraw (back to draft)** takes it out of review.

### Review an entry

Entries waiting for review are under **In review** at the top of the content list. Open one and choose:

- **Approve and publish** to publish it. If **Publish on** is in the future, the button says **Approve and schedule** instead.
- **Request changes** to send it back. Write what should change and choose **Send back**. The entry becomes a draft again, and the person who submitted it is told, with your note.
- **Save without deciding** to save your own edits and leave it in review.

Either way, the person who submitted it hears what you decided.

### Comments

The **Review** card in the editor's sidebar holds the conversation about an entry: comments, and the review steps between them, such as "eddie asked for changes" with the note. Type in **Add a comment** and choose **Comment**, or press Ctrl+Enter (Cmd+Enter on a Mac).

Comments are only seen in the admin, never on the site. Anyone who can open the entry may comment. A comment reaches the entry's author, the person it is assigned to and everyone who wrote on it before. You can delete your own comments; editors can delete anyone's. The review steps stay.

### Assign an entry

Under **Assigned to** in the **Review** card, pick the person who should look after the entry. They are told, and when it is submitted for review only they are, instead of every editor. Only people who may edit entries of that type are listed. The content list shows who each entry is assigned to.

### Notifications

Review steps and comments arrive in the bell at the top of the admin, and by email. To choose which you get by email, open your profile, then **Notifications**, and change **Reviews** or **Editorial comments**.

Submissions, decisions and assignments are recorded in the [audit log](/guide/people#audit-log).

## Before publishing {#before-publishing}

A content type can have a checklist of what its entries must, or should, have before they are published, such as a featured image or at least one category. Nothing is on the list until someone adds it, so the built-in types have none.

### Set up the checklist

1. Open **System → Content types** and the type.
2. In **Before publishing**, choose **Add a check** and pick one:

   | Check | Done when |
   |---|---|
   | **Has an excerpt** | The excerpt is filled in. Only for types with **A short summary field**. |
   | **Has a featured image** | The type's first image field has an image. |
   | **Has a term of a taxonomy** | At least one term of the taxonomy you choose, such as a category. |
   | **Has a minimum number of words** | The text of the entry, the same text site search reads, has at least that many words. |
   | **Has a search description** | **Search description** under **Search and sharing** is filled in. |

   Plugins can add checks of their own; they appear in the same list.
3. Set **Level**: **Required** holds publishing back until the check is done, **Recommended** only shows it in the editor.
4. Choose **Save**.

### In the editor

While a type has a checklist, the editor's sidebar shows a **Before publishing** card under the publish card. It is checked as you type, so you see an item turn done before you save. The top line says how many required items publishing waits for.

Choosing **Publish** or **Schedule** while a required item is not done keeps the entry as it was and names what is missing, for example "Before publishing: Has a featured image." Saving a draft and **Submit for review** always work, so a contributor can hand in an entry for an editor to finish.

The checklist applies when an entry is about to go live. An entry that is already published, or a check added after it was published, does not stop you from saving changes to it. If a check comes from a plugin that is no longer active, it shows as not available and never holds publishing back.

### For developers

Types declared in code get a checklist with `checklist()`, and a plugin can add a check of its own, named after the plugin:

```php
$cms->content->type('acme-recipe')
    ->label('Recipe', 'Recipes')
    ->checklist([
        ['check' => 'featured_image', 'level' => 'required'],
        ['check' => 'terms', 'taxonomy' => 'acme-cuisine'],          // recommended
        ['check' => 'words', 'min' => 150],
        ['check' => 'acme.tested', 'level' => 'required'],
    ]);

$cms->content->checks->define('acme.tested', 'Tested in our kitchen',
    fn (array $entry, array $item): bool => !empty($entry['data']['tested_on']));
```

A check gets the entry as `['title', 'excerpt', 'data', 'terms' => [taxonomy => count]]`, with the unsaved values while someone types. The editor asks `POST /api/v1/content/{type}/checklist`; a refused publish answers `422` with the missing items under `checklist`. **View as PHP** on a type built in the admin includes its checklist.

## Schedule an entry

1. In the visual editor, open the tab named after the type (such as **Page**) and choose **Set a time** next to **Goes live**. In the form view, find **Publish on** in the sidebar.
2. Pick a date and time in the future. In the visual editor, choose **Done**: **Goes live** shows the time, marked in yellow. In the form view, the help text changes to **Goes live automatically at this time**, followed by your time zone.
3. Choose **Schedule**. A message says "Scheduled for" followed by the date and time, and the status changes to **Scheduled**.

The time is entered in your computer's time zone, which the editor names under the field. Kestello stores it so that it goes live at that moment wherever the other editors are.

Scheduled entries are published by a background task that runs every minute. If your site has no cron job, they go live after the next visit to the site instead, which on a quiet site can be later than planned. See [Installing Kestello](/guide/installation#background-tasks).

Some details worth knowing:

- **Set no time** and **Publish** uses the current time.
- **A date in the past** publishes straight away and keeps that date. Use it to backdate a post.
- **Moving a published entry's date into the future** takes it off the site until that time. It becomes **Scheduled** again.

## Preview before publishing

Choose **Preview** (the eye) in the bar at the top of the editor to see the entry on your site, in your theme, before anyone else can. It opens in a new tab with a dark bar at the top that says it is a preview and what the entry's status is.

The preview shows what is in the editor, including changes you have not saved yet. The preview link only works for you and stops working after an hour; choose **Preview** again for a new one. Content types without pages on the site, such as a list of team members only used inside other pages, have no **Preview** button.

### Share a preview

To show a draft to someone without an account, such as a client:

1. In the editor's sidebar, find **Share a preview**.
2. Under **Who is it for?**, type a name so you recognise the link later. This is optional.
3. Under **Works for**, choose how long the link should work: 1, 7, 14 or 30 days.
4. Choose **Create link**. The link is copied, and shown once under **Preview link**. Paste it into an email or a chat.

Whoever opens the link sees the entry as it is saved. Unsaved changes in your editor are never shown to them, so save before you share. Search engines are told not to index preview pages.

The links you made are listed under the button with who they are for, when they expire and how often they were opened. Choose **Revoke** next to a link to stop it working at once. A link also stops working when it expires or when the entry is moved to the trash. An entry can have up to 20 share links at a time.

Anyone who can edit the entry can make and revoke its share links. Every share link made or revoked is recorded in the [audit log](/guide/people#audit-log).

## Links between entries

A **Linked entry** field points from one entry to others: a talk names its speakers, a product its brand, a recipe the posts it builds on. You add one to a type under **System → Content types**, and choose which types it may point to.

Links work in both directions. When an entry is linked from others, its sidebar shows a **Linked from** card: each entry that points here, its type, the field that holds the link, and its status when it is not published. Open one with a click. Entries in the trash are not listed, and you only see entries you may open yourself. The card stays hidden while nothing links to the entry.

To show these links on the site, add an **Entry list** block and set **Which ones**:

- **Those that link to the entry being viewed**: on a speaker's page, the talks that name them.
- **Those the entry being viewed links to**: on a talk's page, its speakers.

With **All of them**, the default, the list shows every published entry of the type. The other two choices only show something on an entry's own page, or inside a template for entries.

## Revisions

Every save that changes something records a **revision**: a copy of the title, address, fields, categories and tags, template, parent and dates at that moment. The **Revisions** card in the sidebar lists them, newest first, with who saved each one and what changed, for example "Changed title, categories and tags".

Each entry keeps its 25 most recent revisions. Older ones are removed as new ones arrive. For content types built in the admin, **Keep revisions** on **System → Content types** sets the number (0 keeps none, and then the card is hidden).

### See what changed

Choose **Compare** next to a revision to see what that save changed. Each field that changed is shown on its own, with added text underlined on a green background and removed text struck through on a red one. Inside a changed sentence only the words that differ are marked. Long stretches that did not change are folded away; choose **unchanged lines** to show them.

Fields are shown the way you know them, not the way they are stored: linked pages by their titles, images by their file names, choices by their labels, and blocks as one line each, with the block's name and its text.

Under **Compare with** you can choose what the revision is compared to:

- **The version before it** shows what that one save changed. This is the default.
- **The current version** shows everything that differs between that revision and the entry as it is now. Use it to check what a restore would bring back.

From the comparison, **Restore this version** restores the revision, the same as **Restore** in the list.

### Go back to an earlier version

1. In **Revisions**, find the version you want.
2. Choose **Restore** next to it. If you have unsaved changes, Kestello asks you to confirm first.
3. The content comes back and is saved as a new revision, so you can undo the restore the same way.

Restoring brings back the title, address, fields, excerpt, template, page order and categories and tags. It does not change the status: restoring an old revision of a published page updates the live page.

## Trash and restore

Deleting an entry moves it to the **Trash** first.

1. Open the entry and choose **Move to trash** at the bottom of the sidebar, or use the bin icon in the list.
2. To get it back, open the **Trash** tab in the list and choose **Restore**.

A restored entry comes back with the status it had. A page that was published before you trashed it is public again straight away.

To delete an entry for good, open the **Trash** tab and choose **Delete**, then **Delete permanently**. Its revisions are deleted with it. This cannot be undone.

::: info
Kestello does not empty the trash by itself. Entries stay there until someone deletes them.

An entry in the trash still holds its address. A new entry with the same title gets `-2` added to its address.
:::

## Addresses

Every entry of a public type has an address (also called a slug or permalink): `/about`, `/blog/hello-world`.

### How the address is made

Kestello makes the address from the title. Until the entry first gets a publish date (when you publish or schedule it), the address keeps following the title, which the editor says (**Follows the title until it is published.** in the visual editor, **follows the title until published** in the form view). After that it stays fixed, so links people have shared keep working even if you change the title.

To set the address yourself, choose **Change** next to **Address** on the type's tab in the visual editor (or **Edit** next to the address under the title in the form view), type the new one and press Enter. Kestello writes it in lowercase, turns accented letters into plain ones and replaces anything other than letters and digits with hyphens.

If the address is already taken by another entry of the same type (for pages, one under the same parent), Kestello adds `-2`, `-3` and so on.

Some top-level addresses belong to the site itself and cannot be used by a page, such as `/admin`, `/login`, `/search`, `/feed` and `/blog` (where posts live). Choosing one shows an error such as **The address /search belongs to the site itself. Pick another.** When the address is made from the title, Kestello takes `search-2` instead.

### Change an address

When you change the address of a **published** entry, Kestello adds a redirect from the old address to the new one by itself. For a page, the redirect covers everything below it too: `/services/web` follows when `/services` moves to `/what-we-do`. You can see these redirects under **Site → Redirects**. See [Redirects](/guide/redirects#automatic-redirects).

### Post addresses

Posts can carry their date in the address. Open **Site → Settings**, then the **Reading** tab. **Post addresses** offers four patterns, each shown as an example address:

- `/blog/sample-post` (the default: no date)
- `/blog/2026/sample-post`
- `/blog/2026/11/sample-post`
- `/blog/2026/11/05/sample-post`

Pick one and save. The dates follow the site's **Timezone** from the **General** tab.

You can change this at any time. Old addresses keep working: they redirect to the new pattern, and you do not need any redirect rules. The same is true when you change a post's date. Other content types that have a listing page and no parent entries get their own setting, named after the type (for example **Event addresses**).

Whatever pattern you choose, visitors can open `/blog/2026` or `/blog/2026/11` to see the posts from that year or month.

## Parent pages

Pages can be nested. In the page editor, the **Details** card has:

- **Parent**: the page this one sits under. Its address goes under the parent's: a page `team` under `about` lives at `/about/team`. Leave it empty for **Top level**.
- **Page order**: lower numbers come first when pages are listed in order.

A page can be nested at most 25 levels deep, and it cannot be placed inside itself or one of its own sub-pages.

::: warning A draft parent hides its children
A page is only public when every page above it is published too. If you unpublish, schedule or trash a parent page, all of its sub-pages disappear from the site, the sitemap, site search and menus, even the published ones. Publish or restore the parent and they come back.
:::

## Categories and tags

Posts can be sorted with **categories** (broad sections, which can be nested) and **tags** (free keywords). Each has its own screen: **Content → Categories** and **Content → Tags**.

### Assign them while writing

In the post editor, the **Categories** card in the sidebar lists what exists. Tick the ones that apply. To add a new one, type it in the box at the bottom of the card and choose **Add**. In the **Tags** card, type to find a tag; for a new one, choose **Add** followed by its name. Either way, a new one is marked **new** and created when you save the post.

Authors and contributors can pick categories and tags, and can add new tags while writing. Only editors can add new categories, and only editors can rename or delete either.

### Manage the list

1. Open **Content → Categories** (or **Content → Tags**).
2. On the left, fill in **Name**. **Address** is made from the name if you leave it empty. For categories you can also pick a **Parent**. **Description** is optional; some themes show it on the category page.
3. Choose **Add category** (or **Add tag**).
4. To change one, select its name in the list on the right, edit it on the left and choose **Save**.
5. To delete one, use the bin icon. Posts that used it lose it; the posts themselves stay. Sub-categories of a deleted category move up a level.

The **Published** column counts the published posts that use each one.

### Category and tag pages

Each category and tag has a public page listing its posts, at `/category/news` or `/tag/recipes`.

A category or tag that is used only by drafts, scheduled posts or trashed posts has no public page yet: its address shows "not found", it is left out of the sitemap, and the list in the admin does not link to it. It appears as soon as one post that uses it is published.

Changing the address of a category or tag does not add a redirect. If the old address was shared, add one yourself under **Site → Redirects**.

## Search and sharing

Every entry of a public type has a **Search and sharing** section, on the type's tab in the visual editor and in the sidebar of the form view:

- **Search title**: shown as the title in search engine results, in link previews and on the browser tab, in place of the entry's title. The page itself still shows its title. Use it for a title written for search, such as "Rye bread in three days" for a post called "Rye". Left empty, the title is used.
- **Search description**: shown under the title in search engine results and in link previews on social networks, up to 300 characters. Left empty, Kestello uses the excerpt, or the first lines of the text. On a page built from blocks, that is the text every visitor sees; blocks shown only to signed-in people, to some roles or for a limited time are left out.
- **Sharing image**: the picture shown when someone shares a link to the entry on a social network or in a chat. Left empty, the featured image (the first image field of the type) is used. Pages have no image field by default, so choose a sharing image to give a page a picture in link previews.
- **Canonical address**: only for text you first published somewhere else, such as an article you also wrote on Medium. Enter the full address there, starting with `https://`. Search engines then list that address instead of this page, and the entry is left out of the sitemap. Leave it empty for everything else: every page already names its own address.
- **Hide from search engines**: the entry stays public, but it is left out of the sitemap and search engines are asked not to list it.

### Checks while you edit

The **Checks** tab of the visual editor also looks at these fields as you type, before you save:

- a title, or search title, longer than about 60 characters, which search results cut off;
- no search description and no excerpt, so search engines pick lines from the page themselves;
- a search description longer than about 160 characters;
- a page hidden from search engines;
- a canonical address that sends search engines to another page.

They are advice: you can publish with any of them.

### Titles and the default image for the whole site

**Site → Settings → Search and sharing** sets how every page's title is written:

- **Page titles**: the pattern for every page, `{title} {sep} {site}` to begin with, which gives "Rye - Bakery". `{title}` is the page's title, or its search title when it has one. `{site}` is the site name, `{tagline}` the tagline and `{sep}` the separator.
- **Home page title**: the pattern for the home page, `{site}` to begin with. For "Bakery - Bread, daily." use `{site} {sep} {tagline}`.
- **Separator**: what `{sep}` becomes, such as `-`, `|` or `·`.
- **Default sharing image**: the picture in link previews of pages that have no sharing image and no featured image, such as your logo.

When a placeholder is empty, such as a tagline you never set, its separator is left out too, so a title never ends in a stray `-`. The admin keeps its own titles.

### Who is behind the site

The same tab tells search engines who runs the site, for the panel some of them show next to results:

- **The site belongs to**: an organization or business, or a person.
- **Name**: left empty, the site name is used.
- **Logo or photo**: a square logo for an organization, a photo for a person, at least 112 pixels wide.
- **Profiles on other sites**: one address per line, such as your LinkedIn, Mastodon or GitHub page. Only addresses starting with `https://` or `http://` are used.

### What search engines get

Without anything to set up, every public page gives search engines:

- its title, description, canonical address and sharing picture, for search results and link previews;
- a description of the page in schema.org terms (JSON-LD): the site and who runs it, the page, an article with its author and dates for posts, and the trail of pages leading to it;
- a place in the sitemap at `/sitemap.xml`, which `robots.txt` points to.

Pages hidden from search engines, and every page while the whole site is hidden, get none of the description and stay out of the sitemap.

To hide the whole site from search engines while you build it, use **Hide the site from search engines** on the **Reading** tab of **Site → Settings**.

## The home page

By default, your theme decides what visitors see at your site's address, often a list of the newest posts. To show one of your pages instead:

1. Open **Site → Settings**, then the **Reading** tab.
2. Under **Home page**, pick the page. Only published pages are listed. **The theme's home page** goes back to the default.
3. Save.

The chosen page then lives at `/`. Its own address, such as `/welcome`, redirects there, so search engines see only one address for it. Its sub-pages keep their addresses, such as `/welcome/team`.

If the chosen page is later unpublished or trashed, the theme's home page comes back until you publish it again or pick another.

## If something goes wrong

**"Add a title before publishing."** You chose **Publish** or **Schedule** on an entry without a title. Drafts may be untitled; published entries may not.

**"One field needs attention." or "3 fields need attention."** Some fields are not valid. The editor scrolls to the first one and shows the problem under each field. Required fields are only checked when publishing.

**"Pick a date in the future to schedule."** The **Publish on** time had already passed when you saved a scheduled entry. Pick a later time, or choose **Publish** to publish now.

**"You can't publish posts; save it as a draft or submit it for review."** Your role may create entries but not publish them. Choose **Submit for review**.

**"Add a title before submitting it for review."** A submission needs a title, like a published entry.

**"Only an entry in review can be sent back."** Someone else already published it or sent it back. Reload the page.

**"This person cannot edit posts."** You tried to assign the entry to someone whose role may not edit that type. Pick someone from the list, or change their role.

**"This post is published; only someone who can publish may change it."** Once an entry is live, only people who may publish can edit it. Contributors see **You can read this post but not change it.**

**"The address /blog belongs to the posts archive. Pick another."** The address you typed is used by another part of the site. Choose a different one.

**"Use letters or digits."** The address you typed has no letters or digits left once it is cleaned up.

**"An entry cannot be its own parent." or "That would put the entry inside itself."** The parent you chose is the page itself or one of its sub-pages.

**"Someone else saved this while you were editing."** See [When two people edit at once](#when-two-people-edit-at-once).

**"One block needs attention" (or "3 problems need attention") above the block editor.** A block is missing something it needs, such as the text of a **Heading** or the image of an **Image** block. The list under the message names each block and the problem.

**"Preview not available"** when opening a preview link. The link expired, was revoked, or the entry was moved to the trash. A link made with the **Preview** button only works for the person who made it, signed in, for an hour. Ask for a new link.

**The preview opens in the editor's tab instead of a new one.** Your browser blocks new tabs from your site's admin. Your unsaved changes were kept as a backup before the preview opened, and **Bring them back** offers them when you return to the editor. To get a new tab next time, allow pop-ups for your site.

**"This content type does not exist, or you cannot edit it."** The type was removed, its plugin is off, or your role has no access to it.

**"This entry does not exist, or you cannot see it."** The entry was deleted for good, or it belongs to someone else and your role only lets you edit your own.

**A published page shows "not found".** Check, in order: that a parent page above it is published (see [Parent pages](#parent-pages)); that its **Publish on** date is not in the future; that it is not in the **Trash**. If you recently changed its address, the old address redirects only if the page was published at the time.

**A scheduled post did not go live on time.** The background task that publishes it did not run. Check **System → Scheduled tasks**: the task "Publishes scheduled entries whose time has come." should have run within the last minute. If not, set up the cron job described in [Installing Kestello](/guide/installation#background-tasks).

## Related pages

- [The visual editor](/guide/visual-editor): adding, arranging and styling blocks.
- [Media](/guide/media): images and files for your entries.
- [Menus](/guide/menus): add your pages and categories to the site's navigation.
- [Redirects](/guide/redirects): what happens to old addresses.
- [Site search](/guide/search): what visitors find when they search.
- [People, roles and sign-in](/guide/people): who may write, publish and delete.
