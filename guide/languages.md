<script setup>
const addresses = [
    {
        title: 'English, the main language',
        text: 'The site’s own addresses, with nothing in front.',
        items: ['`/about`', '`/projects/house`', '`/blog`', '`/search`', '`/feed`'],
    },
    {
        title: 'Spanish, another language',
        text: 'The same pages under /es, with Spanish words where you give them.',
        items: ['`/es/sobre-nosotros`', '`/es/proyectos/casa`', '`/es/noticias`', '`/es/search`', '`/es/feed`'],
        tone: 'brand',
    },
];
const translate = [
    { title: 'Translate into Spanish', text: 'In the Translations card of the page you wrote first.' },
    { title: 'A draft opens', text: 'A copy of the page in Spanish, with the same fields, categories and parent.' },
    { title: 'Write it in Spanish', text: 'The title, the address and the text. Shared fields stay as they are.', tone: 'brand' },
    { title: 'Publish', text: 'Visitors find it at /es/… and the language switcher links the two.' },
];
const visit = {
    question: 'Is the page published in Spanish?',
    answers: [
        { label: 'Yes', result: 'The Spanish page is shown. If its address differs, /es/about takes the visitor to /es/sobre-nosotros.', tone: 'brand' },
        {
            label: 'No',
            next: {
                question: 'Is there a page at /about in the main language?',
                answers: [
                    {
                        label: 'Yes',
                        result: 'The English page is shown inside the Spanish menus, with a note that it is not in Spanish yet. Search engines are asked not to list it.',
                        link: '#pages-not-translated-yet',
                    },
                    { label: 'No', result: 'The not found page, in Spanish.', tone: 'muted' },
                ],
            },
        },
    ],
};
const shared = [
    { title: 'Written in each language', items: ['Title, address and excerpt', 'Text and rich text', 'Blocks', 'Links to other pages and categories', 'Groups and repeaters'] },
    { title: 'The same in every language', items: ['Numbers', 'Dates', 'Yes or no', 'Colours', 'Choices from a list', 'Images and files', 'People'], tone: 'brand' },
];
</script>

# A site in several languages

Kestello can hold your content in more than one language: an English site with a Spanish version, for example. Each page has its own translation, at its own address, and visitors switch between them with a language switcher. This page shows how to add a language, translate pages, categories and menus, and what visitors and search engines see.

This is about your content. To change the language of the admin and of the emails Kestello sends, see [Settings](/guide/settings#general). To translate Kestello itself, see [Translating Kestello](/guide/translating).

**Who can do this:** adding languages needs the permission *Change site settings*, which administrators have. Anyone who can edit a page can translate it.

## How addresses work

The site's main language keeps the addresses it has. Every other language lives under its code: Spanish under `/es`, German under `/de`. Each translation has an address of its own, so `/about` in Spanish can be `/es/sobre-nosotros`.

<Compare :columns="addresses" caption="The same site in its main language and in Spanish" />

The address alone decides the language. Kestello does not guess from the visitor's browser and does not remember a choice: a link to `/es/noticias` always opens the Spanish page. This keeps one address per page and language, which is what search engines need.

## Add a language

1. Open **Site → Settings** and stay on **General**.
2. Under **Other languages**, pick the language in **Choose a language**. If it isn't in the list, pick **Another language…** and type its code, such as `gd` for Scottish Gaelic.
3. Click **Add**. The language appears in the list with its address, such as `/es`.
4. Click **Save general**.

The language of the site you set in **Language** is the main one. A site can have up to 20 other languages.

A code is refused when something already lives at that address, such as a page called `es`. The message names it: change its address first, then add the language.

### Remove a language

Click the **×** next to the language, then **Save general**. Before you save, Kestello says how many entries are written in it. They are not deleted: visitors no longer see them, and adding the language again brings them back.

## Name the site in each language

Under **Name and tagline in other languages** on the same tab, give each language its own **Site name** and **Tagline**. Pages, titles, search engine data, feeds and emails in that language use them. Leave a field empty and that language uses the main one, shown greyed in the field.

## Give addresses their own words

Content types and categories have a word in their address: `/projects`, `/blog`, `/category`. Under **Addresses in other languages** you can give each one a word in each language. Write `proyectos` for Projects and Spanish projects live at `/es/proyectos/casa` instead of `/es/projects/casa`.

Old links keep working: `/es/projects/casa` takes visitors to `/es/proyectos/casa`.

A word is refused when the language already uses it, for the site itself, for another content type, or for a page in that language. The message says which.

## Translate a page

Write the page in the main language first, then translate it:

<Flow :steps="translate" caption="From a page in English to its Spanish translation" />

1. Open the page in the editor.
2. In the **Translations** card on the right, click **Translate into Spanish**.
3. A draft opens in Spanish, with the same fields filled in. Translate the title and the text, and change the address under the title (the slug) to Spanish words.
4. Publish it.

The **Translations** card now links the two. Each language shows its status: a green badge is published.

You can also write a page in another language from the start: when you create it, choose its **Language** in the **Details** card. A page's language can't be changed after it is saved.

### Find pages in a language

The list of pages and posts has a **Language** filter: the main language, each other language, or **All languages**. The **Translations** column shows which languages a page is in, and a button to translate it into the others.

### Fields shared by every language

Some fields are the same in every language: a project's year, its photos, an event's date. When you save one of these in any language, its translations get the new value too. In the editor, these fields say so under them once the page has a translation.

<Compare :columns="shared" caption="Which fields each language writes, and which they share, unless a content type says otherwise" />

Whoever sets up a content type can change this per field: in the content type's editor, **In other languages** chooses **Written in each language** or **The same in every language**.

::: tip
If someone else has the Spanish page open while you change a shared field in English, saving theirs says that someone else saved it. Reload it to see the new value before saving.
:::

### Links to other pages

A field that links to another page, such as a project's related projects, can be filled in either language. On a Spanish page, each link opens the Spanish translation when it is published, and the original when there is none yet.

## Categories and tags

Categories and tags are translated the same way. On **Content → Categories** (or **Content → Tags**), switch the **Language** at the top, and use the **Translations** column to translate one. Kestello adds the translation with the same name; rename it and give it its own address.

When you translate a page, its categories become their translations where they have one.

## Menus

Each language can have its own menu in each place of your theme. On **Appearance → Menus**, in the **Theme locations** card, switch the language and choose a menu for each place. Leave it at **Same as English** and that language uses the main language's menu.

Links to pages and categories in a menu follow the visitor's language: on a Spanish page, a link to **About** opens the Spanish **Sobre nosotros**.

## What visitors see

When a visitor opens a Spanish address, Kestello decides what to show:

<Decide :tree="visit" caption="What /es/about shows, depending on the translations you have" />

Everything around the page is in Spanish too: its menus, the words the theme shows by itself (such as "Read more"), dates and numbers. The site's search at `/es/search` finds Spanish pages, and `/es/feed` lists Spanish posts.

Themes can show a language switcher. The Base theme lists the languages at the bottom of every page, each linking to the same page in that language.

### Pages not translated yet

A page that has no Spanish translation still opens at its Spanish address, `/es/about`. It is shown in English, inside the Spanish menus, with a note at the top: "This page is not available in Spanish yet. Here it is in English." Search engines are asked not to list it, so they only find real translations.

## What search engines see

Each translation tells search engines where the others are (the `hreflang` links), and the sitemap lists every language with its translations. You don't need to set anything for this. Only published translations are listed, never a page shown in the wrong language.

## If something goes wrong

**"/es already belongs to …"** when adding a language. A page, a content type or a plugin already uses that address. Change the page's address, or ask the developer of the plugin, then add the language again.

**"This page is already in that language"** or **"already has that translation"**. Each page can have one translation per language. Open the existing one from the **Translations** card.

**A Spanish page shows in English.** Its translation isn't published yet, or is scheduled for later. Open it from the **Translations** card and check its status.

**A word in Addresses in other languages is refused.** The word is already used in that language, by the site itself (such as `search` or `feed`), by another content type, or by a page. Pick another word.

**The menu is in English on Spanish pages.** That place has no Spanish menu yet, so it uses the main one. Choose one on **Appearance → Menus**, in **Theme locations**, with the language set to Spanish.

## Related pages

- [Pages, posts and other content](/guide/content)
- [Menus](/guide/menus)
- [Categories and tags](/guide/categories-and-tags)
- [Search and sharing](/guide/search-and-sharing)
- For developers: [Content in several languages](/developers/multilingual)
