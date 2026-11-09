# What Kestello is

Kestello is a content management system: software you install on your own web hosting to run a website. You write pages and posts, upload images, choose how the site looks and decide who may edit it, all from an admin area in your browser. You do not need to know how to code to run a Kestello site.

![The home page of a sample bakery site made with Kestello: the site name and menu, and a large picture with the heading "Bread from the oven on Fennel Quay".](/screenshots/site-home.png)

To look around before you install it, open the [live demo](https://demo.kestello.com/) and sign in with `demo` and `demo`. You can change anything there; the demo goes back to the start every hour.

This guide is for the people who run a site: owners, editors and whoever looks after the hosting. Often a developer or an agency built the site and set parts of it up for you; this guide covers the work you do day to day. If you build themes or plugins, the [developer docs](/developers/) are the better starting point.

## What you can do with it

**Write and organise content.** Pages and posts are built in. You can add your own content types, such as events, team members or products, each with the fields it needs (a date, a price, a photo), without writing code. Every save keeps a revision, so you can compare versions and go back to an earlier one.

**Manage images and files.** Upload images once and Kestello makes the sizes your theme needs, in modern formats (WebP and AVIF) where the server supports them. You can set the focal point of a photo so it crops well at any size.

**Shape how the site looks.** A theme controls the design. You can change colours, fonts and spacing under **Appearance → Styles**, rearrange page templates under **Appearance → Templates**, and switch themes without losing content.

**Run the site day to day.** Menus, redirects (including automatic ones when you change a page's address), forms with stored submissions, site search, and a list of addresses visitors tried that did not exist.

**Control who can do what.** Each person signs in with their own account. Roles decide what they can reach: an editor can publish content without being able to install plugins. Two-step sign-in can be turned on per account.

**Add features with plugins.** Plugins add features such as search engines, mail services or social sign-in. Each plugin says up front what it will do (which services it contacts, what it stores), and Kestello shows you that before you install it. A plugin that breaks is switched off on its own instead of taking the site down.

**Keep it safe.** Backups of the database and files can run every night and be kept on another server or a storage service. When you update Kestello or a plugin, it backs up first, checks the site with the new version before visitors see it, and goes back to the previous version by itself if anything is wrong.

## How it fits together

A Kestello site has four parts. Knowing them helps when you read the rest of this guide.

| Part | What it is | Where it lives |
|---|---|---|
| Kestello itself | The program that runs the site and the admin | The `core` folder |
| Your theme | The design: layouts, colours, fonts | `content/themes` |
| Plugins | Extra features you chose to add | `content/plugins` |
| Your content and settings | Pages, posts, people, uploads, configuration | The database, `storage/app` (uploads) and `config` |

Updating Kestello replaces only the first part. Your theme, plugins, content and settings are never overwritten by an update.

## How it compares to WordPress

If you have used WordPress, most ideas carry over: pages, posts, media, themes, plugins, menus and users all exist and mean the same thing. The main differences:

- **Structured content is built in.** Custom content types and fields need no extra plugin.
- **Plugins declare what they do.** You see a plugin's permissions before installing it, and plugins from the admin must be signed by a publisher your site trusts.
- **Updates protect you.** A failed update rolls back by itself, database included. WordPress leaves a broken site for you to restore.
- **Backups and moving a site are built in.** A backup made on one server restores on another, even if it uses a different database type.

## Where to go next

1. Check that your hosting meets the [requirements](/guide/requirements).
2. [Install Kestello](/guide/installation).
3. Spend [your first hour](/guide/first-steps) setting the basics up.
4. Bring your old site over, from [WordPress](/guide/import-wordpress) or [Squarespace, Wix or anywhere else](/guide/moving-from-other-sites).
5. Launch with the [going live](/guide/going-live) checklist.

After that, the guide follows the admin: [your content](/guide/content), [media](/guide/media), [menus](/guide/menus) and [forms](/guide/forms) for everyday work, and [backups](/guide/backups), [updates](/guide/updates) and [Site Health](/guide/health) for keeping the site in good shape. When something is not working, start with [troubleshooting](/guide/troubleshooting). A word you don't know is probably in [Words you'll meet](/guide/glossary).
