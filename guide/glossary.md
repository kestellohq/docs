# Words you'll meet

A short explanation of the words this guide and the admin use, in plain terms. Each one links to where it is explained in full.

## Your content

**Entry**
: Any single page, post or other item you write. Kestello says "entry" when something applies to all of them. See [Pages, posts and other content](/guide/content).

**Page**
: A standalone page such as About or Contact. Pages can be nested under each other: `/about/team`.

**Post**
: A dated article, listed on your blog under `/blog`.

**Content type**
: A kind of entry, with its own fields. Pages and posts are built in; a site can add more, such as events or team members. See [Content types](/guide/content#content-types).

**Draft**, **Scheduled**, **Published**, **Private**
: Where an entry stands: only saved, set to go live at a later time, on the site, or kept off the public site. See [Statuses](/guide/content#statuses).

**Revision**
: A saved earlier version of an entry. You can compare versions and go back to one. See [Revisions](/guide/content#revisions).

**Address**
: The part of a web address after your domain that leads to one entry, such as `/blog/fresh-bread`. Other systems call it a slug or permalink. See [Addresses](/guide/content#addresses).

**Excerpt**
: A short summary of a post, shown in lists of posts and sometimes in search results.

**Featured image**
: The picture that stands for a post in lists and in shared links.

**Category** and **tag**
: Two ways to sort posts. Categories are the broad sections of your blog and can nest; tags are free keywords. See [Categories and tags](/guide/categories-and-tags).

## Building pages

**Block**
: One building piece of a page: a heading, a paragraph, an image, a set of columns, a button. You build pages by adding and arranging blocks. See [The visual editor](/guide/visual-editor).

**Pattern**
: A ready-made group of blocks from your theme, such as a pricing table, that you add to a page in one go. A synced pattern stays the same everywhere it is used.

**Template**
: The layout around an entry's own blocks, such as where the header, the title and the sidebar go. See [Templates, parts and patterns](/guide/themes#change-page-layouts-templates-parts-and-patterns).

**Template part**
: A shared piece of a template, such as the header or the footer, that every page uses.

**Theme**
: The design of the whole site: layout, colours, fonts and templates. See [Themes and design](/guide/themes).

**Menu**
: A list of links visitors use to find their way around, usually across the top. See [Menus](/guide/menus).

## Pictures and files

**Media library**
: Every picture and file uploaded to the site, in one place. See [Media library](/guide/media).

**Alt text**
: A short description of a picture, read aloud to people who can't see it and shown when the picture doesn't load.

**Focal point**
: The part of a picture that must stay in view when the picture is cropped to fit a smaller space. See [Set the focal point](/guide/media#set-the-focal-point).

## Visitors and search engines

**Redirect**
: A rule that sends anyone who opens an old address to the new one. See [Redirects](/guide/redirects).

**Sitemap**
: A list of your public pages that Kestello keeps at `/sitemap.xml` for search engines.

**robots.txt**
: A small file that tells search engines which parts of the site to leave alone. Kestello writes it for you.

**Page cache**
: Ready-made copies of your pages that Kestello keeps for visitors, so pages open fast. They are refreshed whenever the content on them changes.

## People and access

**Role**
: A named set of things a person may do, such as Editor or Author. Every account has one. See [People and roles](/guide/people).

**Permission**
: One thing a role allows, such as *Change site settings*. The admin and developers also call it a capability.

**Two-step sign-in**
: Signing in with a code from an app on your phone as well as your password, so a stolen password alone isn't enough.

**Access token**
: A long secret that lets another program, such as an app or a script, use the site on your behalf, with only the rights you give it.

## Running the site

**Plugin**
: An add-on that gives the site new features. See [Plugins](/guide/plugins).

**Backup**
: A copy of the site's database, and optionally its files, that you can bring back later. See [Backups](/guide/backups).

**Cron job**, **scheduled tasks**
: Kestello's jobs that run by the clock, such as the nightly backup and publishing scheduled posts. The cron job is a line in your hosting control panel that wakes Kestello up every minute to run them. See [Background tasks](/guide/installation#background-tasks).

**Background worker**
: A program on the server that runs longer jobs, such as an import, without anyone keeping a screen open. Most shared hosting doesn't have one, and Kestello works without it.

**Site Health**
: The page that checks the site and the server and says what needs attention. See [Site Health](/guide/health).

**Maintenance page**
: The short "Back in a moment" page visitors see during an update or a restore.

**Document root**
: The folder on the server that a domain shows to the web. For Kestello, it should be the `public` folder. See [Installing Kestello](/guide/installation).

**DNS**
: The address book of the internet. Changing your domain's DNS settings is how you point the domain at a new site.

**HTTPS**
: The secure connection shown by the padlock in the browser. Your host turns it on for your domain.

**SMTP**
: The way email is sent through a real mail provider, so messages from the site don't land in spam. See [Settings](/guide/settings#email).
