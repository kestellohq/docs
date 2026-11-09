# Themes and design

A theme decides how every page of your site looks: the layout, the colours, the type and the shared pieces such as the header and footer. This page covers switching themes, changing colours and fonts under **Appearance → Styles**, writing custom CSS, changing page layouts under **Appearance → Templates**, making your own theme from the current look, and moving a theme from one Kestello site to another. Read it when you first set up the look of a site, and again before you switch themes on a site that is already live.

All three screens are under **Appearance** in the admin menu: **Themes**, **Styles** and **Templates**.

## Two kinds of theme

Every theme in **Appearance → Themes** shows one of two labels under its description:

- **Developer theme with code**: written by a developer, with its own page designs and program code. Kestello comes with one, **Base**, which is active on a new site. You can change its styles and templates in the admin, but the theme itself is installed, updated and removed by a developer.
- **Made in the admin, no code**: a theme you or someone else made with **New theme**. It holds only design data: colours and other style values, custom CSS, templates, parts, patterns and fonts. It cannot run anything on the server, which is why it can be exported and imported from the admin.

A theme made in the admin always builds on another theme, called its parent. The card then says **Builds on** followed by the parent's name. It looks exactly like the parent, with its own changes on top. This is what developers call a child theme. The parent must stay installed for as long as a theme builds on it.

## Who can do what

Three permissions cover design work. You give them to people through roles; see [People and roles](/guide/people).

| Permission | What it allows |
|---|---|
| *Create, switch, export and import themes* | The **Themes** screen. |
| *Change the site's styles, templates and patterns* | The **Styles** and **Templates** screens. |
| *Write custom CSS* | The **Custom CSS** box on the **Styles** screen. Without it, people who may change styles see the published CSS but cannot edit it. |

Administrators have all three.

## Switch to another theme

1. Open **Appearance → Themes**. The theme in use has a dark border and the badge **Active**.
2. On the theme you want, choose **Use this theme**.
3. If you signed in more than ten minutes ago, Kestello asks you to **Confirm your password**. Enter it and continue.

![The Themes screen with the active Base theme.](/screenshots/appearance-themes.png)

You see **The site now uses** followed by the theme's name. Visitors get the new theme straight away: Kestello empties the page cache when the theme changes. If a message says **The site switches to** a theme **with the next page load**, the switch is saved and the next page anyone opens uses it.

::: warning
Style changes, custom CSS, and template changes belong to the theme you made them in. After a switch you see the other theme's own styles. Your changes to the old theme are kept, and come back if you switch back to it.
:::

If you want to keep your current look and try a variation of it, make a new theme from it first (see below) and switch to that. Switching back is one click.

## Change colours, fonts and shapes

**Appearance → Styles** shows the settings the active theme offers, with a live preview of your real site next to them. Nothing changes for visitors until you choose **Publish**. You can reach the same screen from the active theme's card with **Change its styles**.

![The Styles screen: style presets and colour settings on the left, a preview of the site on the right.](/screenshots/appearance-styles.png)

What you see in the left column depends on the theme. Base, for example, offers groups such as **Enamel**, **Wall and text**, **Type** and **Shape and rhythm**. If a theme offers no settings, the screen says **This theme declares no styles to change (no styles.json).**

1. Open **Appearance → Styles**.
2. Under **Style**, pick a ready-made look, or keep **As designed** for the theme's own colours. Each button shows a few of its colours.
3. Change single values in the groups below:
   - colours: use the colour picker, or type a hex code such as `#1e3a8a` into the box next to it,
   - fonts: pick one from the list,
   - sizes and spacing: drag the slider. The current value is shown next to it.
4. Watch the preview. Use the **Phone**, **Tablet** and **Desktop** buttons above it to check other screen sizes. To preview another page, type its address (for example `/about`) in the box above the preview and choose **Show**.
5. Check **Readability**, below the settings. It lists the text and background pairs the theme declares, with their contrast ratio. A pair that is hard to read has a **Fix** button, which darkens or lightens the text colour, keeping its hue, until the pair passes.
6. Choose **Publish**.

You see **Published. Every page uses the new styles now.**

A value you changed is marked, and has a reset button that puts it back to the style's value. While you have unpublished changes the badge **Not published** shows at the top; **Discard** throws them away and returns the preview to what visitors see.

### Readability rules

**Readability** follows WCAG AA, the common accessibility standard: ordinary text needs a contrast ratio of at least 4.5:1 against its background, large lettering at least 3:1. When every pair passes, the section says **Every pairing meets WCAG AA.** Kestello lets you publish colours that fail, but people with poor eyesight, and everyone reading a phone in sunlight, will struggle with them.

### Go back to an earlier version

In a layout that pages are built from, such as a pattern, a block's **What editors can't change** section (at the bottom of its **Block** tab) locks it for editors, for example so the order of a page's sections stays fixed. People who may design can still change everything.

Every publish is kept under **History** on the **Styles** screen, newest first. The live one has the badge **Live**.

- To go back to an earlier version, choose **Restore** next to it. It is published at once. Custom CSS in that version comes back only if it still passes today's checks.
- To drop all of this site's style changes, choose **Back to the theme's styles**. The site then uses the theme as designed. This, too, is kept in the history, so you can restore what you had.

## Fonts from Google Fonts

If the theme lets you choose fonts, the **Styles** screen has a section **Fonts on this site**. Fonts added here are downloaded from Google Fonts once and then served from your own site. Visitors' browsers never contact Google, so you do not need a cookie or consent notice for fonts.

1. In **Google font**, type the family name exactly as Google Fonts shows it, for example `Inter` or `Playfair Display`.
2. Under **Weights**, tick the weights you need. Each weight is a separate file, so pick only what the design uses (often 400 for text and 700 for bold).
3. Choose the kind of font (**Sans-serif**, **Serif**, **Display**, **Handwriting** or **Monospace**). It decides which font browsers fall back to while the file loads.
4. Turn on **Italics** if you need italic text.
5. Choose **Add font**.

You see that the family **is now served from this site**. It is now in the font lists above; pick it for the text you want and **Publish**.

To remove a font, use the bin button next to it. Text set in that font falls back to the theme's font. Its files are deleted from `storage/fonts/` on the server.

Your server must be able to reach Google Fonts when you add a font. Visitors never need to.

## Custom CSS {#custom-css}

CSS is the language web pages use for their appearance. The **Custom CSS** box below **Readability** on the **Styles** screen adds your own rules after the theme's styles, so they win over the theme's. The preview shows the result as you type, and the rules reach visitors when you **Publish**.

Kestello checks custom CSS before it publishes it, so that it cannot run scripts, break out of the stylesheet, or make visitors' browsers contact other sites. These are refused:

| Refused | Why |
|---|---|
| Images from another site, such as `url(https://cdn.example.com/bg.jpg)` | Every address in `url()`, `image-set()` and `src()` must start with `/` (a file on your own site) or be a `data:image/` address. Inside `url()`, an address starting with `#` is allowed too. Upload the image under **Media** and use its address on your site instead. |
| Fonts loaded from another site in `@font-face` | Add the font under **Fonts on this site** instead, or upload the font file to your own site. |
| `@import`, `@charset`, `@namespace` | They load other files or change how the file is read. |
| HTML tags (anything with `<`) | CSS never needs them. |
| `expression()`, `behavior`, `-moz-binding`, `javascript:` and `vbscript:` addresses | Old ways to run code from CSS. |
| Escaped characters, a backslash followed by a code such as `\41` | They could spell any of the above. |
| More than 50 KB | Keep large stylesheets in a theme. |

Comments (`/* ... */`) are allowed.

## Change page layouts: templates, parts and patterns

![The Templates screen with the Templates, Parts and Patterns tabs.](/screenshots/appearance-templates.png)

**Appearance → Templates** holds the block layouts of the active theme. Blocks are the same building pieces you use in the content editor (headings, text, images, columns and so on). The screen has three tabs:

- **Templates** lay out entries (pages, posts and other content). A template can be used for every entry without a template of its own, for every entry of one content type, or only by entries that choose it under **Details → Template** in the editor.
- **Parts** are shared pieces such as a header or footer, placed into templates with the **Template part** block.
- **Patterns** are ready-made groups of blocks that appear in the block inserter of the editor. A **Synced** pattern stays the same everywhere: change the pattern and every page that uses it changes. An unsynced pattern gives each page its own copy to change freely.

Each row shows where it comes from: **From the theme**, **Changed on this site** or **Made on this site**.

### Edit a template, part or pattern

1. Open **Appearance → Templates** and choose the tab.
2. Choose the row you want to change.
3. Change the blocks. It opens in the same [visual editor](/guide/visual-editor) as pages, with the real site around it. For a template, **Preview with** at the top picks the entry it is shown with: any published entry, or a draft you may edit. A template needs an **Entry content** block where the entry's own blocks should go; without one, they appear after the template's own blocks.
4. Choose **Save draft**. You see **Draft saved. Visitors still see the published version.**
5. To check it on the real site, type a page address under **Preview** and choose **Open**. Only people who may design see drafts.
6. Choose **Publish**.

Every publish is kept under **History**, where **Restore** brings back an earlier version. For something that came from the theme, **Back to the theme's version** removes this site's changes.

### Make a new one

1. Open **Appearance → Templates** and choose the tab.
2. Choose **New template**, **New part** or **New pattern**.
3. Enter a **Name**. For templates, choose what it is **Used for**; for parts, the **Area** (headers become a page header, footers a page footer); for patterns, an optional **Category** and whether it is **Synced**.
4. If the form shows **Name in code**, check it. It is filled in from the name, uses lowercase letters, digits and hyphens, and cannot be changed later.
5. Choose **Create and edit**, then build it as described above.

### When the theme is updated

If a developer updates the theme and the theme brings a new version of a template you changed on this site, the template shows **The theme has a new version of this template**. You can:

- **Keep mine**: stay with your version,
- **Open theirs as a draft**: load the theme's version as a draft, so you can bring your changes over while yours stays live,
- **Use the theme's**: replace your version. Yours stays in the history.

**What changed** lists the differences.

## Make your own theme from the current look

**New theme** saves the current look (styles, custom CSS, templates, parts, patterns and fonts) as a theme of its own. Do this before experimenting, to move a design to another site, or to keep several looks to switch between.

1. Open **Appearance → Themes** and choose **New theme**.
2. Enter a **Name** (up to 60 characters).
3. Check **Folder name**. It is filled in from the name and uses lowercase letters, digits and hyphens. Other sites see the theme under this name, so pick something that will not clash, such as `acme-2026`.
4. Under **Start from**, choose the theme to build on. The active theme is marked **(running)** and is chosen by default.
5. If you start from the running theme:
   - **Starting look** picks one of its ready-made styles, if it has any,
   - **Include this site's changes** copies everything changed on this site into the new theme. The note below it says how many things have changed.
6. Optionally add a **Description**.
7. Turn on **Switch the site to it now** if visitors should get it straight away.
8. Choose **Create theme**.

The new theme appears in the list with the label **Made in the admin, no code** and **Builds on** the theme you started from.

## Export a theme

You can export any theme labelled **Made in the admin, no code**, for a copy or to install it on another Kestello site.

1. Open **Appearance → Themes**.
2. On the theme's card, choose **Export**.

Your browser downloads a zip named after the folder name and the date, such as `acme-2026-2026-11-05.zip`. For the active theme, the zip includes this site's current changes, so the other site looks the same after importing it. Fonts the theme uses are included.

Developer themes cannot be exported here. A developer packages them with their own tools.

## Import a theme

1. Open **Appearance → Themes** and choose **Import**.
2. Under **Theme zip**, choose a zip exported from **Appearance → Themes** on any Kestello site.
3. If a theme with the same folder name is already installed here and you want to update it, turn on **Replace an installed theme with the same name**.
4. Choose **Import**. If Kestello asks you to **Confirm your password**, enter it.

You see that the theme **was installed. Switch to it when you are ready.** (or **was updated** when it replaced one). Importing never switches the site to the theme; use **Use this theme** when you are ready.

The theme it builds on must already be installed on this site. A theme exported from a site running Base builds on Base, which every Kestello site has.

## Delete a theme

You can delete a theme made in the admin when it is not active and no other theme builds on it.

1. Export it first if you may want it back.
2. On its card, choose the bin button.
3. Confirm with **Delete theme**.

Its files and this site's changes to it are deleted.

## Themes with code

A theme labelled **Developer theme with code** cannot be uploaded, exported or deleted from the admin, because it contains program code. A developer installs it by copying its folder into `content/themes/` or with the command line:

```bash
php bin/cms theme:install path/to/theme.zip
```

and creates a child theme of one with:

```bash
php bin/cms make:theme my-theme --parent=base
```

Once installed, it appears in **Appearance → Themes** and you switch to it with **Use this theme** like any other. The theme commands are listed in the [command line reference](/developers/cli). Updating such a theme is covered under [Updates](/guide/updates).

## If something goes wrong

**"Images in custom CSS must come from this site (addresses starting with /), so visitors' browsers don't contact other sites."** A `url()`, `image-set()` or `src()` in your custom CSS points at another site. Upload the image under **Media** and use its address starting with `/`.

**"Fonts must come from this site."** An `@font-face` rule loads a font from another address. Add the font under **Fonts on this site** instead.

**"Custom CSS can't contain @import."** (or HTML tags, `expression()` and the others in the table above). Remove that part. Copy the rules from the imported file into the box instead of importing it.

**"Escaped characters (\ followed by a code) aren't allowed in custom CSS: they could spell anything."** Write the character itself instead of its code.

**"Custom CSS is limited to 50 KB."** Move the bulk of it into a theme made by a developer.

**"Writing custom CSS needs the "Write custom CSS" permission."** Your role may change styles but not custom CSS. Ask an administrator.

**"A colour like #1e3a8a."** A colour value is not a hex code. Use `#` followed by 3, 6 or 8 hex digits.

**"Use the family name as Google Fonts shows it, such as "Inter" or "Playfair Display"."** The font name has characters Google family names do not use. Copy the name from the Google Fonts page.

**"Google Fonts has no font "…" with those weights."** The family does not exist under that name, or not in all the weights you ticked. Check the spelling and untick weights the font does not have.

**"Google Fonts could not be reached: …"** Your server cannot open outside addresses. Some hosts block this; ask your host, or ask a developer to add the font to the theme.

**"This font is already installed."** It is already under **Fonts on this site**. Pick it from the font list.

**"A theme with this folder name already exists."** Choose another **Folder name**.

**"Site changes can only be copied from the running theme."** **Include this site's changes** works only when **Start from** is the active theme.

**"Only data-only themes can be imported here, and this one contains: …"** The zip contains program code or other files a theme made in the admin cannot have. It is a developer theme; a developer installs it.

**"The zip has no theme.json. Export themes from Appearance → Themes."** The zip was not exported from Kestello, or it was unpacked and packed again with a different folder layout. Use the zip exactly as it was downloaded.

**"This theme builds on "…", which is not installed here. Install that theme first."** Install the parent theme on this site, then import again.

**"A theme called "…" is already installed. Replace it to update it."** Turn on **Replace an installed theme with the same name**, or give the theme a different folder name on the other site and export it again.

**"The installed "…" contains code and can't be replaced from the admin."** The zip has the same folder name as a developer theme here. Rename the theme on the site it came from and export again.

**"The theme's CSS is refused: …"** The theme's custom CSS breaks one of the rules above. Fix it on the site it came from and export again.

**"Choose a theme zip of up to 32 MB."** The file is too big, or the upload did not arrive. Your hosting's upload limit also applies.

**"Switch to another theme before deleting this one."** You cannot delete the active theme.

**""…" builds on this theme. Delete it first."** Another theme uses this one as its parent. Delete that one first, or keep both.

**"Cannot activate theme "…": parent theme "…" is not installed"** The theme builds on a theme that is missing from `content/themes/`. Install the parent again.

**"That zip holds a theme. Themes are added under Appearance → Themes."** You uploaded a theme under **Plugins**. Import it under **Appearance → Themes** if it was made in the admin; a developer theme is installed by a developer.

**Visitors still see the old look.** Styles and theme switches empty the page cache themselves. If a page still looks old, reload it without the browser's cache (Ctrl+Shift+R, or Cmd+Shift+R on a Mac). If that does not help, see [Troubleshooting](/guide/troubleshooting).

## Next

- [Menus](/guide/menus), to build the menus your theme shows.
- [Backups](/guide/backups), to make a backup before large design changes.
- [People and roles](/guide/people), to decide who may change the design.
