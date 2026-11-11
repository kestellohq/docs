<script setup>
const request = [
    { title: 'Request', text: 'GET /es/noticias/hola, before routing and the page cache.' },
    { title: 'Language', text: 'es: content, interface text and dates in Spanish.', tone: 'brand' },
    { title: 'Address', text: '/noticias is Spanish for /blog: routes see /blog/hola.' },
    { title: 'Page', text: 'The Spanish post, with localized links.' },
];
const model = [
    { title: 'English', text: "locale ''", items: ['id 12', 'slug house', 'translation_group 01J…'] },
    { title: 'Spanish', text: 'locale es', items: ['id 31', 'slug casa', 'translation_group 01J…'], tone: 'brand' },
];
const fallbacks = [
    { title: 'The value in the page’s language', text: 'SiteText::translated(), a translated path, a translated term or entry.', tone: 'brand' },
    { title: 'The main language’s', text: 'Used when the language has none of its own.' },
];
</script>

# Content in several languages

This page explains how Kestello stores and serves content in several languages, and what plugins and themes need to do to follow it. Read it before you write a theme layout, a plugin that renders entries, or code that builds links to content. Site owners set languages up as explained in [A site in several languages](/guide/languages).

## The model

A site has a main language (the setting `language`) and up to 20 others (the setting `languages`, else `app.languages` in `config/app.php`). Codes are written as they appear in addresses: lowercase, with a hyphen, such as `es` or `pt-br`.

Entries and terms carry two columns:

- `locale`: `''` for the main language, or the code of another. The main language has no code, so changing it rewrites nothing.
- `translation_group`: an id shared by an entry and its translations, null until it has one. There is one entry per group and language.

<Compare :columns="model" caption="A project and its Spanish translation: two entries, one group" />

Slugs are unique per type, language and parent, so `/about` and `/es/about` can both exist. Read the language of a model with `$entry->language()` and find a translation with `$entry->translation('es')` (published only, unless you pass `published: false`).

## A request in another language

<Flow :steps="request" caption="How /es/noticias/hola reaches the post it shows" />

A global middleware, `LanguagePrefix`, reads the first segment of the path. When it is one of the site's other languages, it:

1. sets the current content language (`ContentLanguages::current()`) and the interface language (`Translator::locale()`) for the rest of the request,
2. maps a translated type or taxonomy prefix back to the declared one (`TranslatedPaths::in()`), and
3. passes the rest of the path to routing, so `/es/noticias/hola` matches the route `/blog/{path}`.

A request for the declared prefix under a language that translates it (`/es/blog/hola`) gets a 301 to the translated one. The site's own addresses, such as `/admin`, `/api`, `/login` and `/assets/…`, never take a language. `/search`, `/feed` and `/author/…` do.

The language comes from the address only: there is no cookie and no `Accept-Language` negotiation. The page cache is keyed on the path, so each language is cached on its own.

## Links

Never put `/es` in front of a path yourself. `Entry::url()` and `Term::url()` already include the language prefix and the translated type prefix. For any other path, use `ContentLanguages::localize()`:

```php
use Kestello\Cms\I18n\ContentLanguages;

ContentLanguages::localize('/blog', 'es');          // "/es/noticias" when Spanish translates /blog
ContentLanguages::localize('/contact', 'es');       // "/es/contact"
ContentLanguages::localize('/', 'es');              // "/es"
ContentLanguages::localize('/blog', ContentLanguages::current());   // the page's own language
```

To run code as if the request were in another language, for example in a background job that writes a Spanish digest, use `ContentLanguages::within()`. Inside it, `current()` is `es`, so lists, links to archives and interface text are Spanish:

```php
use Kestello\Support\Translator;

[$archive, $more] = ContentLanguages::within('es', fn () => [
    ContentLanguages::localize('/blog', ContentLanguages::current()),   // "/es/noticias"
    Translator::get('Read more'),                                       // from the Spanish language pack
]);
```

An entry's own `url()` always uses the entry's language, whatever the current one is.

## What themes get

Every public page shares an `i18n` prop:

| Key | What it holds |
|---|---|
| `locale` | The interface language, such as `es`. |
| `prefix` | The current language's address prefix: `''` in the main language, `/es` in Spanish. Use it for site paths that aren't content, such as `${prefix}/search`. |
| `languages` | The page in each language, for a language switcher: `[{ code, name, url, current, missing }]`. Empty on a single-language site. |

`url` points at the page's published translation in that language. `missing` is true when there is none: the url is then the page's address under that language, which shows the original with a note.

An entry shown in a language it isn't translated into also gets the prop `translation_missing: true`, and the page carries `noindex`. The core entry page shows the note "This page is not available in Spanish yet. Here it is in English." above the content. If your theme replaces that page, show something similar.

### Add a language switcher to a theme

Read `i18n.languages` from the page props and render a link for each language. This is the switcher in the Base theme's footer (`content/themes/base/resources/js/layouts/Site.vue`):

```vue
<script setup>
import { computed } from 'vue';
import { usePage } from '@kestello/app';
import { useI18n } from '@kestello/sdk';

const { __ } = useI18n('my-theme'); // your theme's slug
const page = usePage();
const languages = computed(() => page.props.i18n?.languages ?? []);
</script>

<template>
    <nav v-if="languages.length" class="site-languages" :aria-label="__('Language')">
        <template v-for="l in languages" :key="l.code">
            <span v-if="l.current" :lang="l.code" aria-current="true">{{ l.name }}</span>
            <a v-else :href="l.url" :lang="l.code" :hreflang="l.code">{{ l.name }}</a>
        </template>
    </nav>
</template>
```

A few things it gets right:

- It renders nothing on a single-language site, because the list is empty.
- It uses a plain `<a>`, not `<Link>`: the other language has its own menus and interface text, so a full page load is the right one.
- Each name is in its own language, with `lang` and `hreflang`, so screen readers pronounce it correctly.
- The current language is marked with `aria-current`, not only with a colour.

## Fields in each language

Each field is written per language or shared by every translation. By default number, boolean, date, datetime, colour, select, multi-select, media and user fields are shared (`Field::SHARED_TYPES`), and every other type is written per language. Set it on the field to change it:

```php
use Kestello\Cms\Content\Field;

$cms->content->type('projects')->fields([
    Field::text('client'),                                  // per language, as its type
    Field::number('year'),                                  // shared, as its type
    Field::text('reference')->translatable(false),          // shared, by choice
    Field::select('stage', [...])->translatable(),          // per language, by choice
]);
```

When an entry is saved, the shared fields that save changed are written to each of its translations, which are reindexed and get a new version. An editor still open on a translation is then refused with the usual conflict, instead of writing the old values back. Only top-level fields are shared: a group or repeater is shared or not as a whole. The flag is in `isTranslatable()` and in the API's field descriptions as `translatable`.

### Links between entries

Entry and term fields store ids. On public pages, `ContentController::present()` maps each id to its published translation in the page's language when there is one, so a theme never has to. Use `Translations::idsIn()` for the same lookup in your own code:

```php
use Kestello\Cms\Content\Translations;
use Kestello\Cms\I18n\ContentLanguages;

$ids = Translations::idsIn('entries', [12, 40], ContentLanguages::current());   // [12 => 31, 40 => 40]
```

Ids picked inside block attributes are not mapped yet.

## The site's own texts

The site name and tagline can differ per language (setting `site_translations`), and so can the type and taxonomy prefixes (`path_translations`). Read them through their helpers, which fall back to the main language's value:

<Layers :layers="fallbacks" caption="Where a translated value comes from: the top one wins when it is set" />

```php
use Kestello\Cms\I18n\SiteText;

$name = SiteText::translated('site_name') ?? $settings->get('site_name');     // in the page's language
$tagline = SiteText::translated('site_description', 'es') ?? $settings->get('site_description');
```

The shared `site.name` prop, the `site.name` and `site.tagline` block bindings, titles, structured data, feeds and email branding already do this.

## Search, feeds and search engines

- **Search:** each document is tagged with its language. `SearchManager::search()` searches the page's language by default on a multilingual site. Pass `'language' => null` to search every language, or a code for one.
- **Feeds:** `/es/feed` lists Spanish entries, with `<language>` in RSS and `xml:lang` in Atom.
- **Search engines:** the `seo.alternates` filter gets the page's `hreflang` alternates, with `x-default` for the main language, when at least two languages have a real page. The sitemap adds `xhtml:link` alternates for each translation. A plugin can add its own through the same filter.

A plugin that renders an entry from its own route can tell the language switcher about it with `PageLanguages::forEntry($entry, $type)`, so each language links to that entry's translation. Without it, each language links to the same path under its prefix.

## The REST API

| Endpoint | What it does |
|---|---|
| `GET /content/languages` | The main language and the others: `code`, `name`, `prefix`, `entries` and their translated `paths`, plus the `choices` an admin can add. |
| `GET /content/{type}/entries?locale=` | One language: `main`, a code such as `es`, or `any` (the default). |
| `POST /content/{type}/entries` | Takes `locale` to create an entry in another language. |
| `POST /content/{type}/entries/{id}/translations` | `{ "locale": "es" }`: creates a draft translation with the same fields and returns it. |
| `POST /taxonomies/{taxonomy}/terms/{id}/translations` | The same for a term. |

Each entry carries `locale`, `translation_group` and `translations: [{ locale, id, status, title }]`.

## If something goes wrong

**Links in your theme lose the language.** A path was built by hand, such as `` `/blog/${slug}` ``. Use the entry's `path` from the props, or `ContentLanguages::localize()` in PHP.

**A route of your plugin answers under `/es` with the wrong content.** Your route runs in Spanish, but your query doesn't filter by language. Filter entries with `where('locale', ContentLanguages::current())`.

**A language code is refused in Settings.** Something already answers at `/{code}`: a top-level page, a type's prefix or a route. Rename it, or register your plugin's route under another prefix.

## Next

- [Themes](/developers/themes)
- [Translations](/developers/translations), for the interface text rather than content
- [Search engines](/developers/seo)
- [REST API](/developers/rest-api)
