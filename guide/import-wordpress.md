# Moving from WordPress

This page covers bringing a WordPress site into Kestello: what comes over, how to run the import, how to read its report, and what to do when something is left behind. Read it when you have a WordPress site to replace with Kestello, your own or one you are moving for a client, before you switch the domain over.

The import happens under **System → Import**. Administrators can use it. To let another role import, give it the permission *Import a site from WordPress* under **People → Roles**.

## What comes over

| From WordPress | Here |
|---|---|
| Posts and pages | Posts and pages, with their title, text, excerpt, address, publish date, last-changed date and author. Drafts stay drafts, posts set to publish later stay scheduled, private posts stay private. Pages keep their parent page. |
| Categories and tags | Categories (with their parent category) and tags, attached to the same posts. |
| Media library | Files in the media library, with their title, alt text and caption. Images and other files linked from posts that were not in the media library come over too, when they are in the old site's `wp-content/uploads` folder, or on the host the old site kept its files on (a CDN, or `files.wordpress.com` for a WordPress.com site). |
| Featured images | The post's featured image. |
| Menus | Menus with their links, nested up to 4 levels. Links to posts, pages and categories point at what was imported. |
| SEO plugin settings | What Yoast SEO, Rank Math, SEOPress or All in One SEO (before version 4) kept on each post: the SEO title, the meta description, "noindex", the social sharing image, and a canonical address pointing at another site. They go into the post's **Search and sharing** fields. A title such as `%%title%% %%sep%% %%sitename%%` becomes no search title at all, since the [title pattern](/guide/content#titles-and-the-default-image-for-the-whole-site) adds the site name here; a written title keeps its words without the site name. A canonical address on the old site is left out: every page here names its own address. The report says which plugin they came from. |
| Old addresses | A redirect from each old address to the new one, so links and search results keep working. Sites that kept WordPress's plain addresses, such as `/?p=123` or `/?page_id=45`, are covered too. |

Text written in the block editor becomes Kestello blocks: paragraphs, headings, lists, quotes, images, galleries, buttons, columns, groups, embeds from YouTube and Vimeo, and the rest of the common blocks. Posts written in the classic editor are converted the same way. When a block cannot be rebuilt here without losing something, its HTML is kept as it was, so no text is lost. Links inside posts that pointed at the old site are changed to point at the imported pages and files.

Some things do not come over, and the import says so each time:

- **Comments.** Kestello has no visitor comments. The review step shows how many the export holds.
- **Post types and taxonomies this site does not have.** A plugin's custom post type, such as a portfolio, is skipped unless this site has a content type with the same name. The same goes for taxonomies other than categories and tags.
- **Passwords on posts.** A password-protected post becomes private, since Kestello has no post passwords.
- **Plugin features inside posts.** A shortcode such as `[contact-form-7]` stays as text, so you can find it and replace it with a Kestello form. Scripts and embedded frames from other sites are left out. An embed from a site other than YouTube or Vimeo becomes a link.
- **Things WordPress keeps for itself.** Revisions, items in the WordPress trash, automatic drafts, theme settings and widgets, and the users' passwords.

A few things change on the way:

- Addresses are written in plain letters: a post at `/здраво/` is at `/zdravo` here, and the old address redirects to it.
- A post whose address is already taken by Kestello, such as `admin`, gets a number added (`admin-2`). The report lists each one.
- Category addresses are not nested here: `/category/news/releases/` redirects to `/category/releases`.
- Blocks that showed something WordPress made as the page loaded, such as **Latest posts**, a search box or the site title, are left out. The report lists them in one line.
- A video in a **Media & Text** block becomes a link next to the text, and the video behind a **Cover** is left out, since covers here take an image.
- Social icons become a list of links.

## Before you start

1. In WordPress, open **Tools → Export**, choose **All content** and choose **Download Export File**. You get an `.xml` file.
2. Keep the WordPress site online while you import. The files in its media library are downloaded from it.
3. Make a backup of this site under **System → Backups**, so you can go back to how it was.

The export file holds the text of your site, not the files. If the old site is already offline, you can still import its files from a copy of its `wp-content/uploads` folder with the command line (see [Large sites and old sites that are offline](#large-sites-and-old-sites-that-are-offline)).

## Run the import

1. Open **System → Import**.
2. Under **WordPress export file**, choose the file you downloaded, then choose **Read the file**. Nothing is imported yet.
3. Check what will come over. The table lists, for posts and pages, files, files linked from posts, categories and tags, menus and redirects, how many will be imported and how many are skipped. Under it, each reason for skipping is listed with a few examples, such as **In the WordPress trash.** or **This site has no content type "portfolio".**
4. Under **Authors**, choose whose name each WordPress author's posts carry here. People are matched by email address first, then by username. Authors with no match are credited to **Me, the person importing**. To credit them to someone else, choose that person in the list.
5. Under **Options**, decide:
   - **Copy files from the old site**: on by default. Turn it off when the old site is offline. Images then keep pointing at the old site.
   - **Redirect old addresses**: on by default. A redirect only applies where nothing else lives at that address, so it never hides a page of this site.
6. Choose **Import**.

A progress bar shows how far it is and which part it is on: categories and tags, files, posts and pages, links between posts, menus and redirects.

How long it takes depends mostly on how many files are downloaded.

::: warning
On a site without a background worker (most shared hosting), the import runs while the **System → Import** screen is open. Closing it pauses the import; opening it again carries on where it stopped. When a background worker runs, you can leave the screen. **System → Background jobs** shows whether one runs.
:::

To stop an import, choose **Stop**. What was imported stays.

## Read the report

When the import is done, you see one of these:

- Your site's name followed by **is here**: everything that could come over did.
- **Imported, with some things left behind**: some items could not be imported. The reason is next to each.
- **The import was stopped**: you chose **Stop**. **Try again** carries on with the rest.
- **The import stopped by itself**: something went wrong that was not about one item, such as the server running out of disk space. The reason is shown. Fix it, then choose **Try again**.

The table counts, for each kind of item, what was **New**, **Updated**, **Unchanged**, **Kept as edited**, **Skipped** and **Failed**. Under it:

- **Not imported** lists each item that failed, with the reason, such as **The old site no longer has this file (404).**
- **Kept as edited here** lists items you changed on this site after an earlier import (see [Import the same site again](#import-the-same-site-again)).
- **Changed on the way** lists posts that came over with a change worth knowing, such as a new address or being made private, and how often something in a post could not be carried over exactly, such as **An embed from twitter.com became a link.**
- **Skipped** lists what was left out and why.

To try the failed items again, for example after the old site is back online, choose **Try again**. Posts that used a file or page that failed before are updated to use it once it comes over, including their featured image, unless you edited them here in between.

Earlier imports are listed under **Earlier imports**, with their report. **Forget** removes an import and its report from the list. What it imported stays.

## Import the same site again

You can import the same WordPress site again, for example to bring over posts written since the first import. Running it again updates instead of copying:

- Posts, pages, categories, files and menus that came over before are updated with any changes from WordPress, and left alone when nothing changed. Files are not downloaded again.
- Anything you changed on this site since the last import is kept as you left it, and listed under **Kept as edited here**. Publishing a scheduled post does not count as a change.
- Posts keep the author they got the first time. To credit them to someone else, choose that person under **Authors** before you import again.
- Categories and tags that were already on this site before the first import are used as they are and never changed by an import.
- Anything you deleted on this site is not brought back.
- New posts and files are added.

Make a new export in WordPress each time: Kestello recognises the site by its address, not by the file.

## Large sites and old sites that are offline

The upload is limited by the server's largest upload (shown under the file field as **Up to** a size). For a larger export, or to take the files from a copy of the uploads folder, use the command line on the server. Copy the export, and the `wp-content/uploads` folder if the old site is offline, to the server, then run:

```bash
bin/cms import:wordpress export.xml --uploads=/path/to/uploads
```

It shows the same review, asks before importing, and prints the same report. Files are taken from the uploads folder when they are there, and downloaded from the old site otherwise. The options are listed in [Command line](/developers/cli#import).

## If something goes wrong

**This is not a WordPress export. Make one in WordPress under Tools → Export → All content.**
The file is not the one WordPress makes under **Tools → Export**. Some backup plugins make other kinds of `.xml` files; use the export from **Tools → Export**.

**The export file is damaged near line …**
The file is cut off or was changed. Download it from WordPress again. If it happens again, the upload may be cut off by the server: use the command line instead.

**The file is larger than this server accepts**
Use the command line (see [Large sites and old sites that are offline](#large-sites-and-old-sites-that-are-offline)), or ask your host to raise `upload_max_filesize`.

**The old site no longer has this file (404).**
The export lists a file the old site does not have any more. If you have a copy, add it to the media library by hand, or import with `--uploads` pointing at a folder that has it.

**The old site did not answer**, or **The old site answered 503 instead of the file.**
The old site was offline or busy. When it is back, choose **Try again**.

**This server is not allowed to fetch that address (only public web addresses are).**
The export points at an address on a private network, such as a WordPress site on your own computer. Copy its uploads folder to the server and use `--uploads`.

**Importing this stopped the server each time it was tried (it may be too large for this server).**
A post or file made the server stop three times in a row, usually by running out of memory or time. The rest of the import carries on. Ask your host to raise the PHP memory limit, then choose **Try again**, or use the command line.

**Another import is running. Wait for it to finish, or stop it.**
Only one import runs at a time. Open **System → Import** to see it.

## Next steps

- Check the imported posts and pages, and replace any shortcodes that stayed as text.
- Pick or adjust a theme under [Themes and design](/guide/themes).
- Review the menus under [Menus](/guide/menus) and the redirects under [Redirects](/guide/redirects).
- When it looks right, point the domain at this site.
