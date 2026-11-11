<script setup>
const fallbacks = [
    { title: "Title", items: ["Search title", "or the entry's title", "set inside Page titles for the browser tab and search results"] },
    { title: "Description", items: ["Search description", "or the excerpt", "or the first lines of the text", "or the site's tagline"] },
    { title: "Picture in link previews", items: ["Sharing image", "or the featured image", "or the Default sharing image"] },
];
</script>

# Search and sharing

When your site shows up in Google, or someone shares a link to it, a title, a short description and often a picture appear. Kestello fills all of these in from your content, so most pages need nothing from you. This page shows where to change them when you want something different, and how to tell search engines who runs the site. For the search box visitors use on your own site, see [Site search](/guide/search).

## The fields of each entry

Every entry of a public type has a **Search and sharing** section, on the type's tab in the visual editor and in the sidebar of the form view:

- **Search title**: shown as the title in search engine results, in link previews and on the browser tab, in place of the entry's title. The page itself still shows its title. Use it for a title written for search, such as "Rye bread in three days" for a post called "Rye". Left empty, the title is used.
- **Search description**: shown under the title in search engine results and in link previews on social networks, up to 300 characters. Left empty, Kestello uses the excerpt, or the first lines of the text. On a page built from blocks, that is the text every visitor sees; blocks shown only to signed-in people, to some roles or for a limited time are left out. A page with none of these gets the site's **Tagline**.
- **Sharing image**: the picture shown when someone shares a link to the entry on a social network or in a chat. Left empty, the featured image (the first image field of the type) is used. Pages have no image field by default, so choose a sharing image to give a page a picture in link previews.
- **Canonical address**: only for text you first published somewhere else, such as an article you also wrote on Medium. Enter the full address there, starting with `https://`. Search engines then list that address instead of this page, and the entry is left out of the sitemap. Leave it empty for everything else: every page already names its own address.
- **Hide from search engines**: the entry stays public, but it is left out of the sitemap and search engines are asked not to list it.

Each empty field falls back to the next thing in its column, top to bottom:

<Compare :columns="fallbacks" caption="What fills the title, the description and the picture when a field is empty" />

## Checks while you edit

The **Checks** tab of the visual editor also looks at these fields as you type, before you save:

- a title, or search title, longer than about 60 characters, which search results cut off;
- no search description and no excerpt, so search engines pick lines from the page themselves;
- a search description longer than about 160 characters;
- a page hidden from search engines;
- a canonical address that sends search engines to another page.

They are advice: you can publish with any of them.

## Titles and the default image for the whole site

**Site → Settings → Search and sharing** sets how every page's title is written:

- **Page titles**: the pattern for every page, `{title} {sep} {site}` to begin with, which gives "Rye - Bakery". `{title}` is the page's title, or its search title when it has one. `{site}` is the site name, `{tagline}` the tagline and `{sep}` the separator.
- **Home page title**: the pattern for the home page, `{site}` to begin with. For "Bakery - Bread, daily." use `{site} {sep} {tagline}`.
- **Separator**: what `{sep}` becomes, such as `-`, `|` or `·`.
- **Default sharing image**: the picture in link previews of pages that have no sharing image and no featured image, such as your logo.

When a placeholder is empty, such as a tagline you never set, its separator is left out too, so a title never ends in a stray `-`. The admin keeps its own titles.

## Who is behind the site

The same tab tells search engines who runs the site, for the panel some of them show next to results:

- **The site belongs to**: an organization or business, or a person.
- **Name**: left empty, the site name is used.
- **Logo or photo**: a square logo for an organization, a photo for a person, at least 112 pixels wide.
- **Profiles on other sites**: one address per line, such as your LinkedIn, Mastodon or GitHub page. Only addresses starting with `https://` or `http://` are used.

## What search engines get

Without anything to set up, every public page gives search engines:

- its title, description, canonical address and sharing picture, for search results and link previews;
- a description of the page in schema.org terms (JSON-LD): the site and who runs it, the page, an article with its author and dates for posts, and the trail of pages leading to it;
- a place in the sitemap at `/sitemap.xml`, which `robots.txt` points to.

Pages hidden from search engines, and every page while the whole site is hidden, get none of the description and stay out of the sitemap.

To hide the whole site from search engines while you build it, use **Hide the site from search engines** on the **Reading** tab of **Site → Settings**.

## Related pages

- [Pages, posts and other content](/guide/content): the entries these fields belong to.
- [The visual editor](/guide/visual-editor#details-outline-and-checks): the **Checks** tab.
- [Site search](/guide/search): what visitors find on your own site.
