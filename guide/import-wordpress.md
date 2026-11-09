# Moving from WordPress

You have a WordPress site and you want it here: the posts, the pages, the pictures, the menus, and the old addresses that Google and your customers already know. Kestello reads the export file WordPress makes and rebuilds the site from it, with a redirect from every old address to its new one.

Your WordPress site is not changed by any of this. Kestello only reads the export and downloads the files it lists, so the old site keeps running until you decide to switch, and you can import as often as you like.

::: tip How long it takes
Exporting from WordPress takes a minute. The import itself usually takes minutes, not hours: most of the time goes on downloading pictures, so a site with many images takes longer than one with many posts. Leave yourself an afternoon for checking the result and switching over.
:::

## Before you start

You need:

- **An administrator account on the WordPress site.** Only administrators see **Tools → Export** there.
- **An administrator account here**, or a role with the permission *Import a site from WordPress* under **People → Roles**.
- **The WordPress site still online.** The export file holds your text, not your pictures; Kestello downloads those from the old site. If it is already gone, see [Large sites and old sites that are offline](#large-sites-and-old-sites-that-are-offline).

Then:

1. In WordPress, open **Tools → Export**, choose **All content** and choose **Download Export File**. You get an `.xml` file, usually in your **Downloads** folder, named after your site and the date.
2. Here, make a backup under **Site → Backups**, so you can go back to how this site was before the import.
3. Write down the five or ten pages people use most on the old site: the home page, opening hours, the contact page, your most-read post. You will check them after the import.

## Run the import

1. Open **Site → Import**.
2. Under **WordPress export file**, choose the file you downloaded, or drop it on the field, then choose **Read the file**.

   ![The Import screen: two steps to export from WordPress, then a field to choose or drop the export file, and a Read the file button under it.](/screenshots/import.png)

3. Nothing is imported yet. You now see what will come over: how many posts and pages, files, categories and tags, menus and redirects, and how many are skipped. Under the table, each reason for skipping is listed with a few examples, such as **In the WordPress trash.** or **This site has no content type "portfolio".**

   ![The review before importing Margit's Bakery: 12 posts and pages, 1 file, 8 categories and tags, 1 menu and 21 redirects to import, two authors to match, and the two options, with Import and Cancel at the bottom.](/screenshots/import-review.png)

4. Under **Authors**, choose whose name each WordPress author's posts carry here. People who already have an account here are matched by email address first, then by username. Anyone without a match is credited to **Me, the person importing** until you choose someone else.
5. Under **Options**, leave both on unless you have a reason not to:
   - **Copy files from the old site** brings the pictures and documents into the media library. Turn it off only when the old site is offline; images then keep pointing at it.
   - **Redirect old addresses** sends visitors and search engines from each old address to the same page here. A redirect never hides a page of this site: it only applies where nothing else lives at that address.
6. Choose **Import**. If this is not the site you meant, choose **Cancel**: nothing has changed.

A progress bar shows how far it is and which part it is on: categories and tags, files, posts and pages, links between posts, menus, then redirects. To stop it, choose **Stop**. What was imported so far stays.

::: warning Keep the screen open on shared hosting
On a site without a background worker (most shared hosting), the import runs while the **Site → Import** screen is open. Closing it pauses the import, and opening it again carries on where it stopped. When a background worker runs, you can close the screen and come back later. **System → Background jobs** shows whether one runs.
:::

## Read the report

When the import is done, the heading tells you how it went:

- Your site's name followed by **is here**: everything that could come over did.
- **Imported, with some things left behind**: most of it came over, and the items that didn't are listed with the reason next to each.
- **The import was stopped**: you chose **Stop**. **Try again** carries on with the rest.
- **The import stopped by itself**: something went wrong that was not about one item, such as the server running out of disk space. The reason is shown. Fix it, then choose **Try again**.

The table counts, for each kind of item, what was **New**, **Updated**, **Unchanged**, **Kept as edited**, **Skipped** and **Failed**. Under it:

- **Not imported** lists each item that failed, with the reason, such as **The old site no longer has this file (404).**
- **Kept as edited here** lists items you changed on this site after an earlier import (see [Import the same site again](#import-the-same-site-again)).
- **Changed on the way** lists posts that came over with a change worth a look, such as a new address or being made private, and how often something in a post could not be carried over exactly, such as **An embed from twitter.com became a link.**
- **Skipped** lists what was left out and why.

Failed items are not lost for good. When the cause is fixed, for example when the old site is back online, choose **Try again**. Posts that used a file or page that failed are updated to use it once it comes over, including their featured image, unless you edited them here in between.

Earlier imports stay listed under **Earlier imports**, with their report. **Forget** removes an import and its report from the list. What it imported stays.

## Check the imported site

The import gets the content across; only you know what the site should look like. Before you tell anyone about the new site, go through this list:

1. **Open the pages you wrote down.** Compare each with the old site: the text, the pictures, the links.
2. **Look at a few posts of each kind**: an old one, a recent one, one with a gallery, one with a video.
3. **Replace plugin shortcodes.** Anything in square brackets, such as `[contact-form-7 id="12"]`, was a plugin's feature in WordPress and is plain text here. The report lists each one under **Changed on the way**, as **The shortcode [contact-form-7] belongs to a WordPress plugin: kept as text.** Replace each with what Kestello has, for example a [form](/guide/forms).
4. **Check the menus** under [Menus](/guide/menus). Links to posts, pages and categories point at the imported ones; links to anything that was skipped need a new target.
5. **Try a few old addresses.** Type an old address after this site's address, for example `/2023/03/baking-through-the-night/`, and check that it lands on the right post. Every redirect is listed under [Redirects](/guide/redirects).
6. **Pick the look** under [Themes and design](/guide/themes). The import brings content, not the WordPress theme.

## Switch over to Kestello

When the new site looks right, move your domain to it. Do it in this order, so your site stays reachable the whole time:

1. **Keep the old site running.** Don't cancel the WordPress hosting yet.
2. **Point the domain at this site.** In your domain's DNS settings, or your host's control panel, change where the domain points. Your host can tell you the exact value. The change can take from a few minutes to a day to reach everyone; until then some visitors still see the old site, which is why it stays online.
3. **Turn on HTTPS** for the domain in your host's control panel, then make sure **Site address** on the **General** tab of **Site → Settings** is the real domain and starts with `https://`.
4. **Let search engines in.** If you hid the site while building it, turn off **Hide the site from search engines** on the **Reading** tab of **Site → Settings**.
5. **Try the old addresses again**, this time on the real domain.
6. **Wait a few weeks, then cancel the old hosting.** Keep the WordPress export file and a backup of the old site somewhere safe, in case you ever need something from it.

::: tip Will I lose my place in Google?
The redirects tell search engines that each page has moved, not gone, so your pages keep their place. It is normal to see the numbers move a little for a few weeks while search engines visit the new addresses.
:::

## What comes over

The details, for when you want to know exactly what to expect.

| From WordPress | Here |
|---|---|
| Posts and pages | Posts and pages, with their title, text, excerpt, address, publish date, last-changed date and author. Drafts stay drafts, posts set to publish later stay scheduled, private posts stay private. Pages keep their parent page. |
| Categories and tags | Categories (with their parent category) and tags, attached to the same posts. |
| Media library | Files in the media library, with their title, alt text and caption. Images and other files linked from posts that were not in the media library come over too, when they are in the old site's `wp-content/uploads` folder, or on the host the old site kept its files on (a CDN, or `files.wordpress.com` for a WordPress.com site). |
| Featured images | The post's featured image. |
| Menus | Menus with their links, nested up to 4 levels. Links to posts, pages and categories point at what was imported. |
| SEO plugin settings | What Yoast SEO, Rank Math, SEOPress or All in One SEO (before version 4) kept on each post: the SEO title, the meta description, "noindex", the social sharing image, and a canonical address pointing at another site. They go into the post's **Search and sharing** fields. A title such as `%%title%% %%sep%% %%sitename%%` becomes no search title at all, since the [title pattern](/guide/search-and-sharing#titles-and-the-default-image-for-the-whole-site) adds the site name here; a written title keeps its words without the site name. A canonical address on the old site is left out: every page here names its own address. The report says which plugin they came from. |
| Old addresses | A redirect from each old address to the new one, so links and search results keep working. Sites that kept WordPress's plain addresses, such as `/?p=123` or `/?page_id=45`, are covered too. |

Text written in the block editor becomes Kestello blocks: paragraphs, headings, lists, quotes, images, galleries, buttons, columns, groups, embeds from YouTube and Vimeo, and the rest of the common blocks. Posts written in the classic editor are converted the same way. When a block cannot be rebuilt here without losing something, its HTML is kept as it was, so no text is lost. Links inside posts that pointed at the old site are changed to point at the imported pages and files.

### What stays behind

The review and the report list each of these every time, so nothing disappears without you knowing:

- **Comments.** Kestello has no visitor comments. The review shows how many the export holds.
- **Post types and taxonomies this site does not have.** A plugin's custom post type, such as a portfolio, is skipped unless this site has a content type with the same name. The same goes for taxonomies other than categories and tags.
- **Passwords on posts.** A password-protected post becomes private, since Kestello has no post passwords.
- **Plugin features inside posts.** A shortcode such as `[contact-form-7]` stays as text, so you can find it and replace it. Scripts and embedded frames from other sites are left out. An embed from a site other than YouTube or Vimeo becomes a link.
- **Things WordPress keeps for itself.** Revisions, items in the WordPress trash, automatic drafts, theme settings and widgets, and the users' passwords.

### What changes on the way

- Addresses are written in plain letters: a post at `/здраво/` is at `/zdravo` here, and the old address redirects to it.
- A post whose address is already taken by Kestello, such as `admin`, gets a number added (`admin-2`). The report lists each one.
- Category addresses are not nested here: `/category/news/releases/` redirects to `/category/releases`.
- Blocks that showed something WordPress made as the page loaded, such as **Latest posts**, a search box or the site title, are left out. The report lists them in one line.
- A video in a **Media & Text** block becomes a link next to the text, and the video behind a **Cover** is left out, since covers here take an image.
- Social icons become a list of links.

## Import the same site again

You can import the same WordPress site again, for example to bring over posts written on the old site while you were building the new one. Running it again updates instead of copying:

- Posts, pages, categories, files and menus that came over before are updated with any changes from WordPress, and left alone when nothing changed. Files are not downloaded again.
- Anything you changed on this site since the last import is kept as you left it, and listed under **Kept as edited here**. Publishing a scheduled post does not count as a change.
- Posts keep the author they got the first time. To credit them to someone else, choose that person under **Authors** before you import again.
- Categories and tags that were already on this site before the first import are used as they are and never changed by an import.
- Anything you deleted on this site is not brought back.
- New posts and files are added.

Make a new export in WordPress each time. Kestello recognises the site by its address, not by the file.

## Large sites and old sites that are offline

The largest file you can upload is set by your server and shown under the file field, for example **Up to 2 MB.** A site with a few hundred posts usually fits. For a larger export, or to take the pictures from a copy of the uploads folder, use the command line on the server. Copy the export, and the `wp-content/uploads` folder if the old site is offline, to the server, then run:

```bash
bin/cms import:wordpress export.xml --uploads=/path/to/uploads
```

It shows the same review, asks before importing, and prints the same report. Files are taken from the uploads folder when they are there, and downloaded from the old site otherwise. The options are listed in [Command line](/developers/cli#import). If you don't have command-line access, your host or developer can run it for you.

## If something goes wrong

**This file can't be used here. Choose one of these: XML.**
The file you chose is not an `.xml` file. The WordPress export always is: look for the newest `.xml` file in your **Downloads** folder.

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
Only one import runs at a time. Open **Site → Import** to see it.

### Still stuck?

- **The problem is on the WordPress side**, for example you can't find **Tools → Export**, the export is empty, or the old site is down: your old host, or whoever built the WordPress site, can help.
- **The problem is with the import here**: see [When you ask for help](/guide/troubleshooting#when-you-ask-for-help) for what to include, so someone can help on the first reply.

Next up: [Themes and design](/guide/themes), to give the imported content its new look.
