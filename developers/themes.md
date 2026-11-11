<script setup>
const components = [
    { title: 'The active theme', text: 'resources/js/pages/, including overrides such as @core/auth/Login.', tone: 'brand' },
    { title: 'Its parent, then the parent’s parent', text: 'At most three themes in a chain.' },
    { title: 'Active plugins', text: 'Only their own names, @<slug>/...' },
    { title: 'Core', text: '@core/... and the fallback layouts/Site.', tone: 'muted' },
];
const tokens = [
    { title: 'The site’s changes', text: 'Appearance → Styles, saved per site.', tone: 'brand' },
    { title: 'The chosen variation', text: 'A ready-made look from variations in styles.json.' },
    { title: 'A child theme’s values', text: 'New defaults for tokens its parent declares.' },
    { title: 'The theme’s defaults', text: 'The value of each token in styles.json.', tone: 'muted' },
];
const entryTemplate = {
    question: 'Did the editor choose a template for this entry, and may its type use it?',
    answers: [
        { label: 'Yes', result: 'That template.', tone: 'brand' },
        { label: 'No', next: {
            question: 'Is there a templates/entry-<type>.json?',
            answers: [
                { label: 'Yes', result: 'entry-<type>.' },
                { label: 'No', next: {
                    question: 'Is there a templates/entry.json?',
                    answers: [
                        { label: 'Yes', result: 'entry.' },
                        { label: 'No', result: 'The theme’s own Vue page.', tone: 'muted' },
                    ],
                } },
            ],
        } },
    ],
};
</script>

# Themes

This page shows how to build a Kestello theme: the manifest, the folders, layouts and page components, child themes, design tokens, stylesheets, fonts, menu locations and block templates. Read it when you start a theme for a client site or a child theme that changes an existing one. How pages reach the browser once your theme renders them is on [Frontend](/developers/frontend).

A theme is presentation. It provides Vue page components, a layout, stylesheets and design tokens, and it may have a small PHP provider for its own routes and menu locations. Features belong in plugins.

## Scaffold a theme

```bash
php bin/cms make:theme acme --name="Acme"
```

```text
  Created content/themes/acme
  Pages live in resources/js/pages, layouts in resources/js/layouts (Site.vue is the shell).
  Build it: npm run build
  Activate it: php bin/cms theme:activate acme
```

This creates:

```text
content/themes/acme/
├── theme.json
├── assets/css/theme.css
└── resources/js/
    ├── layouts/Site.vue
    └── pages/Home.vue
```

For a child theme, pass the parent's slug. The child gets an empty `resources/js/pages/` and a stylesheet with a comment, and inherits everything else:

```bash
php bin/cms make:theme acme-child --parent=base
```

The slug must be lowercase letters, digits and single dashes. `make:theme` refuses a slug that is already a folder under `content/themes/`.

## Folder layout

| Path | Required | What it holds |
|---|---|---|
| `theme.json` | Yes | The manifest. |
| `styles.json` | No | Design tokens, fonts, contrast pairs and style variations. |
| `resources/js/pages/**/*.vue` | No | Page components. A file's path below `pages/` is its name: `pages/Blog/Post.vue` is `Blog/Post`. |
| `resources/js/layouts/*.vue` | No | Layouts. `layouts/Site.vue` is the one pages ask for with `layout: 'Site'`. |
| `resources/js/components/` | No | Components your pages import. Not registered on their own. |
| `assets/` | No | Anything the browser loads: CSS, fonts, images, the built output. Served at `/assets/themes/<slug>/...`. |
| `assets/build/` | Yes, if `resources/js` exists | The Vite output. Committed and shipped, so servers never need Node.js. |
| `src/` | No | PHP classes, autoloaded from the manifest's `namespace`. |
| `templates/`, `parts/`, `patterns/` | No | Block templates as JSON (see [Block templates and patterns](#block-templates-and-patterns)). |
| `emails/` | No | `layout.html` lays out every email the site sends, `<email id>.html` one of them (see [Lay out emails in a theme](/developers/emails#lay-out-emails-in-a-theme)). |
| `screenshot.png` (or `.jpg`, `.webp`) | No | Shown on **Appearance → Themes**. |
| `tools/` | No | Your own build helpers. Not needed at run time. |

The folder name must equal the manifest's `slug`. Kestello refuses to load a theme whose folder and slug differ.

## theme.json

The base theme's manifest:

```json
{
    "slug": "base",
    "name": "Base",
    "version": "1.1.0",
    "description": "The default Kestello theme: enamel-sign plates on a modular wall, re-enamelled from one colour.",
    "requires": {
        "core": "^0.1"
    },
    "namespace": "Themes\\Base\\",
    "provider": "Themes\\Base\\Theme",
    "stylesheets": [
        "css/theme.css"
    ]
}
```

| Key | Type | Required | Meaning |
|---|---|---|---|
| `slug` | string | Yes | Lowercase letters, digits and single dashes, at most 64 characters. Must match the folder name. |
| `name` | string | Yes | Shown in the admin. |
| `version` | string | Yes | Semantic version, such as `1.0.0`. It is part of every asset URL, so bump it when you ship. |
| `description` | string | No | Shown on **Appearance → Themes**. |
| `requires.core` | string | Yes | Kestello versions the theme runs on, such as `^0.1`. |
| `requires.php` | string | No | A PHP version constraint. |
| `requires.extensions` | list of strings | No | PHP extensions the theme needs. |
| `parent` | string | No | The slug of the theme this one builds on. |
| `namespace` | string | No | PHP namespace for `src/`, such as `Themes\\Acme\\`. May not start with `Kestello\`. |
| `provider` | string | No | A class inside `namespace` that extends `Kestello\Cms\Extension\ThemeProvider`. |
| `stylesheets` | list of strings | No | Global stylesheets for every site page (see [Stylesheets](#stylesheets)). |

Plugins and themes share one manifest format. The keys only plugins use, such as `dependencies`, `conflicts` and `permissions`, are on [Plugin manifest](/developers/manifest).

## Activate a theme

```bash
php bin/cms theme:activate acme
```

Or use **Appearance → Themes** in the admin. Kestello checks the theme's requirements, that its parent is installed and that its email files pass their check before it switches. If the active theme or any theme in its chain cannot load, the site falls back to `base`, the default theme, and the reason shows on the Themes screen.

## The provider

A theme needs PHP only for its own routes, menu locations, blocks or shared props. The base theme's provider:

```php
<?php

declare(strict_types=1);

namespace Themes\Base;

use Kestello\Cms\Cms;
use Kestello\Cms\Extension\ThemeProvider;
use Themes\Base\Controllers\PageController;

final class Theme extends ThemeProvider
{
    public function boot(Cms $cms): void
    {
        $cms->routes->get('/', [PageController::class, 'home'])->name('home');
        $cms->routes->get('/about', [PageController::class, 'about'])->name('about');

        $cms->menus->location('primary', 'Main navigation', 'Across the top of every page.');
        $cms->menus->location('footer', 'Footer links', 'A row of links at the bottom of every page.');
    }
}
```

And its controller:

```php
<?php

declare(strict_types=1);

namespace Themes\Base\Controllers;

use Kestello\Cms\View\Page;
use Kestello\Framework\Core\Response;
use Kestello\Kernel;

final class PageController
{
    public function home(): Response
    {
        return Page::render('Home', ['title' => 'Home']);
    }

    public function about(): Response
    {
        return Page::render('About', ['title' => 'About', 'kestelloVersion' => Kernel::version()]);
    }
}
```

`make:theme` does not create a provider. Without one, your theme's pages render only where something asks for them by name: content entries, core pages you override, plugin pages you override. Add `namespace`, `provider` and a class under `src/` when you need routes.

If the site picks a home page under **Settings → Reading**, that entry renders at `/` ahead of the theme's own `/` route. Without a choice, or when that entry is not published, the theme's route answers.

Providers in a theme chain register parents first, then the child, so a child's provider can build on its parent's services. The provider lifecycle is the same as a plugin's; see [Service providers](/developers/providers).

## Pages and layouts

A page component is a Vue single-file component under `resources/js/pages/`. It names its layout in a plain `<script>` block, declares the props it uses, and reads shared data with `usePage()`:

```vue
<script>
export default { layout: 'Site' };
</script>

<script setup>
import { Head } from '@kestello/app';

defineProps({ kestelloVersion: { type: String, default: '' } });
</script>

<template>
    <Head title="About" />
    <section class="about">
        <h1>About</h1>
        <p>Running Kestello {{ kestelloVersion }}.</p>
    </section>
</template>

<style scoped>
.about {
    max-width: 68rem;
    margin: 0 auto;
    padding: 48px 24px;
}
</style>
```

Kestello ships no CSS framework. A theme styles its own markup; scoped styles in each component keep it tidy.

A page receives only the props it declares. Everything else that was sent, such as `site`, `auth` and `menus`, is on `usePage().props`.

`layout: 'Site'` resolves to `layouts/Site` from the active theme chain, so plugin pages that ask for `Site` wear your theme's frame too. If no theme provides it, Kestello uses core's fallback `layouts/Site`. A layout renders the page in its default slot:

```vue
<script setup>
import { computed } from 'vue';
import { Link, usePage } from '@kestello/app';

const page = usePage();
const site = computed(() => page.props.site?.name ?? '');
</script>

<template>
    <header><Link href="/">{{ site }}</Link></header>
    <main><slot /></main>
</template>
```

What you can import:

| Module | Gives you |
|---|---|
| `vue` | Vue 3, served from the site as one pinned file. |
| `@kestello/app` | `usePage`, `useRouter`, `useForm`, `Link`, `Head`, `KImage` (responsive media library images; `dark` takes a second image for dark mode), `BlockTree` (renders a block tree). |
| `@kestello/ui` | The admin UI kit. |
| `@kestello/sdk` | A client for the REST API. |

These stay external in the build: the page shell's import map points every package at the same copy.

### Override pages from core and plugins

Theme pages are named by their path, with no prefix, so a theme can also ship pages with other packages' names. The first match wins, in this order: the active theme, its parents, then plugins (`@<slug>/...` only), then core (`@core/...`).

<Layers :layers="components" caption="Where a page or layout component is found: the top layer that has it wins" />

| To replace | Put a file at |
|---|---|
| Core's sign-in page `@core/auth/Login` | `resources/js/pages/@core/auth/Login.vue` |
| The hello plugin's `@hello/Greeting` | `resources/js/pages/@hello/Greeting.vue` |
| The parent theme's `About` | `resources/js/pages/About.vue` |

The [`base-child` example theme](https://github.com/kestellohq/examples/tree/main/themes/base-child) overrides `About` and `@hello/Greeting` this way. An override receives the same props as the original, so check the original component's `defineProps` first.

Core's sign-in pages wear the admin's look. To give them your site's look instead, override any of them:

| Page | Address | Props |
|---|---|---|
| `@core/auth/Login` | `/login` | `providers`, `canRegister` (sign-up is open) |
| `@core/auth/Register` | `/register` | `domains` (when sign-up is limited to some) |
| `@core/auth/CompleteRegistration` | `/register/complete` | `token`, `email`, `valid`, `minLength` |
| `@core/auth/ForgotPassword` | `/forgot-password` | none |
| `@core/auth/ResetPassword` | `/reset-password` | `token`, `valid`, `minLength` |
| `@core/auth/TwoFactorChallenge` | `/login/two-factor` | none |

Keep each form's field names and the address it posts to, which is the page's own address. Messages arrive in `page.props.flash` (`success`, `error`) and errors per field in the form's `errors`.

## Child themes

A child theme names its parent and contains only what it changes:

```json
{
    "slug": "base-child",
    "name": "Base Child",
    "version": "1.0.0",
    "description": "Example child theme: inherits everything from Base, overrides the About page and the hello plugin's greeting page.",
    "requires": {
        "core": "^0.1"
    },
    "parent": "base"
}
```

What a child inherits and how it changes it:

| Part | Rule |
|---|---|
| Page and layout components | A child's component replaces the parent's of the same name. |
| `stylesheets` | Added after the parent's, so the child's rules win. |
| `styles.json` | Merged over the parent's: the child adds tokens, fonts, groups, contrast pairs and variations, and may set `values` and `custom_css` (see below). |
| `templates/`, `parts/`, `patterns/` | A child's file replaces the parent's file with the same name. |
| `emails/` | A child's file replaces the parent's file with the same name, and an email's own file wins over a `layout.html` anywhere in the chain. |
| Provider | Both run, parent first. |

A chain holds at most three themes (a theme, its parent and the parent's parent). A longer chain, a loop, a missing parent or a suspended member makes the whole chain unusable, and the site falls back to `base`.

Build the child as well: it has its own `assets/build/`.

## Design tokens: styles.json

`styles.json` declares the settings a site owner can change on **Appearance → Styles** without touching CSS. Each token becomes a CSS custom property of the same name (`--plate`, `--radius`, `--font`) in a stylesheet Kestello loads after your theme's own. Write your CSS against custom properties and it restyles without a build.

Part of the base theme's file:

```json
{
    "groups": {
        "enamel": "Enamel",
        "type": "Type",
        "shape": "Shape and rhythm"
    },
    "tokens": {
        "plate": { "type": "color", "label": "Enamel", "group": "enamel", "value": "#1e3a8a", "help": "The colour of every plate. Darker and lighter shades follow it." },
        "font": { "type": "font", "label": "Typeface", "group": "type", "value": "archivo" },
        "radius": { "type": "size", "label": "Plate corners", "group": "shape", "value": 18, "unit": "px", "min": 0, "max": 40 },
        "unit": { "type": "size", "label": "Grid row", "group": "shape", "value": 64, "unit": "px", "min": 48, "max": 96, "step": 4 }
    },
    "fonts": {
        "archivo": { "label": "Archivo (the theme's)", "stack": "'Archivo', 'Helvetica Neue', Arial, sans-serif", "preload": "fonts/archivo-latin.woff2" }
    },
    "contrast": [
        { "fg": "enamel-white", "bg": "plate", "label": "Lettering on enamel", "large": true }
    ],
    "variations": {
        "bottle-green": { "label": "Bottle green", "values": { "plate": "#1f5130" } },
        "slate": { "label": "Slate", "values": { "plate": "#334155", "wall": "#e6e6e3" } }
    }
}
```

| Key | Meaning |
|---|---|
| `groups` | Section headings on the Styles screen, `name: label`. Names match `^[a-z][a-z0-9-]{0,30}$`. |
| `tokens` | The settings. Names match `^[a-z][a-z0-9-]{0,40}$`. |
| `fonts` | Font choices for `font` tokens, `name: { label, stack, preload }`. |
| `contrast` | Colour pairs the Styles screen checks for contrast as the owner edits. `fg` and `bg` must both be `color` tokens; `large: true` uses the large-text threshold. |
| `variations` | Ready-made looks, `name: { label, values }`. `values` may set any token. |
| `values` | Child themes: new defaults for tokens the parent declares. |
| `custom_css` | Child themes: extra CSS served after the token rules. Checked like the site's custom CSS. |

Token fields:

| Field | Applies to | Meaning |
|---|---|---|
| `type` | all | `color`, `size`, `number` or `font`. |
| `label` | all | Shown on the Styles screen (80 characters at most). |
| `group` | all | A key from `groups`. Defaults to `other`. |
| `help` | all | A line of help (200 characters at most). |
| `value` | all | The default. A token with an invalid default is ignored. |
| `unit` | `size` | `px`, `rem`, `em`, `%`, `ch` or `vw`. Defaults to `px`. |
| `min`, `max`, `step` | `size`, `number` | The allowed range. Defaults are `0`, `100` and `1`. |

Values are checked by type: colours must be `#rgb`, `#rrggbb` or `#rrggbbaa`; sizes and numbers must be within `min` and `max`; fonts must name a font from `fonts`, one of the system stacks, or a font downloaded to the site. Nothing typed in the admin reaches CSS unchecked.

Every theme can offer these system stacks for `font` tokens with no downloads: `system-sans`, `system-serif`, `humanist`, `geometric`, `old-style` and `mono`.

The final value of each token is the theme's default (with a child theme's `values` applied over its parent's), then the chosen variation, then the site's own changes.

<Layers :layers="tokens" caption="Where a token's value comes from: the top layer that sets it wins" />

The generated stylesheet is served at `/system/theme/styles.css?v=<hash>`. Kestello links it only once the site has changed something (or a child theme sets `values`, `custom_css` or uses a downloaded font), because until then your theme's own CSS already holds the defaults. Keep the defaults in `styles.json` and in your `:root` rules the same.

A broken `styles.json` does not stop the site. Invalid JSON, invalid tokens and refused `custom_css` are skipped and logged:

```text
[kestello] acme/styles.json is not valid JSON; its tokens are ignored.
[kestello] acme/styles.json: token "Brand" is invalid and ignored.
[kestello] acme/styles.json: token "radius" has an invalid default and is ignored.
```

## Stylesheets

List global stylesheets in `theme.json`:

```json
"stylesheets": ["css/theme.css"]
```

An entry is either relative to the theme's `assets/` folder (`css/theme.css`) or a site path starting with `/` (`/assets/css/print.css`). Entries must end in `.css`, and relative entries may not contain `..`.

Kestello links these on every page that wears the site theme: your own pages, plugin pages outside the admin, and core's site pages (errors, content entries, blocks, the fallback `layouts/Site`). Admin pages never get them. The order in the page `<head>` is: parent theme's sheets, child theme's sheets, then the generated global styles.

Styles inside a component's `<style>` block are built into the component's own CSS file and loaded with that page.

## Theme asset URLs

Themes live outside the web root, so their files go through `Kestello\Cms\Extension\AssetController`:

```text
/assets/themes/<slug>/<path>              cached for 5 minutes
/assets/themes/<slug>/<path>?v=<anything> cached for a year
/assets/themes/<slug>/~<version>/<path>   cached for a year (what Kestello itself links)
```

`<path>` is relative to the theme's `assets/` folder. Only the active theme chain is served. Only these file types are served: `css`, `js`, `mjs`, `map`, `json`, `svg`, `png`, `jpg`, `jpeg`, `gif`, `webp`, `avif`, `ico`, `woff`, `woff2`, `ttf`, `otf`, `txt`. Hidden files (such as `.vite/manifest.json`) and anything under `build/ssr/` are never served. SVG files are sent with a sandboxing Content Security Policy, so a script inside one cannot run.

In your CSS, refer to images and fonts with relative URLs (`url('../fonts/archivo-latin.woff2')`). The browser resolves them against the stylesheet's versioned URL, so they are versioned too.

## Fonts

Visitors' browsers never contact a font CDN. Fonts are served from the site, in one of two ways.

**Fonts in the theme.** Put the WOFF2 file in `assets/fonts/`, declare it in your CSS, and add it to `styles.json` so `font` tokens can choose it:

```css
@font-face {
    font-family: 'Archivo';
    src: url('../fonts/archivo-latin.woff2') format('woff2');
    font-weight: 400 900;
    font-display: swap;
}
```

```json
"fonts": {
    "archivo": { "label": "Archivo (the theme's)", "stack": "'Archivo', 'Helvetica Neue', Arial, sans-serif", "preload": "fonts/archivo-latin.woff2" }
}
```

`preload` names the main `.woff2` file in the declaring theme's `assets/`. Kestello adds a `<link rel="preload" as="font">` for it on site pages, so it starts downloading with the HTML. At most two font files are preloaded. A font `stack` may hold letters, digits, spaces, commas, quotes, dots, underscores and dashes, at most 300 characters. Ship the font's licence beside it, as the base theme does with `assets/fonts/OFL.txt`.

**Fonts downloaded to the site.** On **Appearance → Styles**, someone with the `theme.design` capability can add a Google font. Kestello downloads the WOFF2 files once, on the server, from `fonts.gstatic.com` only, keeps the Latin and Latin Extended subsets, and stores them in `storage/fonts/<slug>/`. They are served from `/system/fonts/<slug>/<file>` with a one-year cache, and every `font` token can choose them. The generated stylesheet adds the `@font-face` rules.

The site's custom CSS refuses `@font-face` rules whose `src` points at another site, with the message `Fonts must come from this site.`

## Menu locations

A location is a named place in your theme where a menu goes. Declare locations in your provider's `boot()`:

```php
$cms->menus->location('primary', 'Main navigation', 'Across the top of every page.');
$cms->menus->location('footer', 'Footer links', 'A row of links at the bottom of every page.');
```

Names match `^[a-z0-9][a-z0-9_.-]{0,63}$`. A plugin's locations must start with its slug and a dot (`acme-shop.footer`); a theme names them freely. Site owners build menus on **Appearance → Menus** and assign them to your locations.

Every page receives the assigned menus as `usePage().props.menus`, keyed by location. Each menu is a tree of `{ label, url, target, children }`. Unpublished entries are left out. Use `Link` for internal addresses so navigation stays in the page, and a plain `<a>` for the rest:

```vue
<script setup>
import { computed } from 'vue';
import { Link, usePage } from '@kestello/app';

const page = usePage();
const primary = computed(() => page.props.menus?.primary ?? []);
const internal = (item) => item.url.startsWith('/') && !item.url.startsWith('//') && !item.target;
</script>

<template>
    <nav aria-label="Main">
        <template v-for="item in primary" :key="item.url + item.label">
            <Link v-if="internal(item)" :href="item.url">{{ item.label }}</Link>
            <a v-else :href="item.url" :target="item.target ?? undefined" rel="noopener">{{ item.label }}</a>
        </template>
    </nav>
</template>
```

A location with no menu assigned is an empty list. Give your layout a fallback, as the base theme does, so a fresh site still has navigation.

On a site in several languages, each language can have its own menu in a location; `menus` already holds the one for the page's language. To add a language switcher, see [Content in several languages](/developers/multilingual#add-a-language-switcher-to-a-theme).

## Block templates and patterns

A theme can ship block trees as JSON files that site owners then change on **Appearance → Templates**:

| File | What it is |
|---|---|
| `templates/entry-<type>.json` | Lays out every entry of that content type, such as `templates/entry-post.json`. |
| `templates/entry.json` | Lays out any entry without a template of its own. |
| `templates/<name>.json` | A custom template that editors choose per entry. `"for": ["page"]` limits which types may choose it. |
| `parts/<name>.json` | A template part, such as a header, placed with the `core/template-part` block. |
| `patterns/<name>.json` | A ready-made arrangement offered in the block inserter. `"synced": true` keeps copies linked. |

File names match `^[a-z0-9][a-z0-9-]{0,60}$`. Every file has `title`, `description` and `blocks`. Templates also take `layout`: `site` (the default, inside your `layouts/Site`) or `bare` (no layout; for templates that bring their own header and footer parts). Parts take `area`: `header`, `footer`, `sidebar` or `general`. Patterns take `category`.

A pattern from the base theme:

```json
{
    "title": "Call to action",
    "description": "A dark panel with a heading, a line of text and a button.",
    "category": "Calls to action",
    "blocks": [
        {
            "type": "core/group", "id": "cta1", "props": { "tag": "section", "width": "wide", "tone": "inverse" },
            "children": [
                { "type": "core/heading", "id": "cta2", "props": { "text": "Order for the weekend", "level": "2" }, "children": [] },
                { "type": "core/text", "id": "cta3", "props": { "text": "<p>Tell us by Thursday and your loaves are waiting on Saturday morning.</p>" }, "children": [] },
                { "type": "core/button", "id": "cta4", "props": { "text": "Get in touch", "link": "/about", "variant": "primary" }, "children": [] }
            ]
        }
    ]
}
```

Plugins ship the same three folders. A plugin's file names start with its slug (`patterns/acme-events-upcoming.json`), or are the entry template of a type it declares (`templates/entry-acme-event.json`); other names are skipped and logged. A theme file with the same name replaces the plugin's, so a theme can restyle what a plugin brings.

For an entry, Kestello uses the entry's chosen template if its type may use it, then `entry-<type>`, then `entry`, and finally your theme's own Vue page. A theme without templates keeps working as before.

<Decide :tree="entryTemplate" caption="Which template lays out an entry" />

When a site owner changes a template, the published version is stored in the database and replaces your file for that site. When a later version of your theme changes the same file, the editor shows what changed and lets the owner keep theirs, take yours, or open yours as a draft. A file with invalid JSON is skipped and logged; blocks that fail validation are dropped from it and logged.

Core blocks read a few custom properties for colours and corners. Set them in your CSS so blocks match your theme:

```css
:root {
    --block-accent: var(--plate);
    --block-accent-deep: var(--plate-deep);
    --block-accent-ink: var(--enamel-white);
    --block-muted-bg: var(--plate-soft);
    --block-inverse-bg: var(--plate-deep);
    --block-inverse-ink: var(--cream);
    --block-radius: calc(var(--radius) * .6);
}
```

### Blocks of your own

A theme with a provider can register blocks. Their names must start with the theme's slug:

```php
use Kestello\Cms\Blocks\BlockDefinition;
use Kestello\Cms\Content\Field;

$cms->blocks->register(BlockDefinition::make('acme/notice')
    ->label('Notice')
    ->category('widgets')
    ->fields([Field::text('title')->required()]));
```

The component defaults to `@acme/blocks/Notice`. Because theme pages are named by path, put it at `resources/js/pages/@acme/blocks/Notice.vue`. In a plugin, the component lives at `resources/js/pages/blocks/Notice.vue`.

### Data for bindings

A text, heading, link or image prop can show data instead of typed text: `{"bind": "entry.title"}`. Core offers the current entry's fields and public site settings. A plugin or theme adds its own source, named after itself, with the paths it offers and a function that resolves them for the entry being shown:

```php
$cms->blocks->bindings->source('acme', ['acme.price' => 'Price', 'acme.seats' => 'Seats left'],
    static function (string $path, \Kestello\Cms\Blocks\BlockContext $ctx): ?string {
        $entry = $ctx->entry;            // the entry on the page, or each entry inside an entry list
        if ($entry === null || $entry->type !== 'acme-event') {
            return null;                 // nothing to show: the block keeps its own text
        }
        return match ($path) {
            'acme.price' => number_format((float) $entry->field('price'), 2),
            'acme.seats' => (string) Seats::left((int) $entry->getKey()),
            default => null,
        };
    });
```

The editor lists the paths with their labels. Values pass through the same sanitizer as typed text, so a source cannot add markup a person could not.

## Build

```bash
npm install
npm run build                                   # core, every plugin and every theme
node core/build/build.mjs content/themes/acme   # this theme only
```

The build turns every `resources/js/pages/**/*.vue` and `resources/js/layouts/*.vue` into an entry, writes the browser build to `assets/build/` and a second build for server-side rendering to `assets/build/ssr/`. A theme without its own `vite.config.js` uses the shared preset in `core/build/preset.mjs`. Commit `assets/build/`. Node.js 22.12 or newer is needed on your machine only; see [Local development](/developers/local-development#changing-vue-components).

A new build changes the page registry's version, so open tabs reload on their next click and the page cache starts fresh. You do not need to clear anything.

## The theme builder

Site owners change a theme from the admin without code:

| Screen | Capability | What it changes |
|---|---|---|
| **Appearance → Themes** | `theme.manage` | Switches, creates, exports and imports themes. |
| **Appearance → Styles** | `theme.design` | Token values, style variations, downloaded fonts. Custom CSS needs `theme.custom_css`. |
| **Appearance → Templates** | `theme.design` | Templates, parts and patterns, with drafts and history. |

Your theme takes part through the files on this page: tokens, variations and contrast pairs in `styles.json`, and templates, parts and patterns as JSON. Nothing else is needed.

A theme created on **Appearance → Themes** is a data-only child theme of the one it starts from: `theme.json`, `styles.json`, templates, parts, patterns, fonts and a screenshot, with no PHP and no Vue. The site's chosen look becomes the child's `values` and `custom_css`. Such a theme can be exported as a zip and imported on another site (also with `theme:export` and `theme:import`). A theme that contains code is installed the developer way, with `theme:install` or a signed package; see [Packaging](/developers/packaging).

## If something goes wrong

| Message | Meaning |
|---|---|
| `Missing theme.json in <dir>.` | The folder has no manifest. |
| `directory name "<dir>" must match slug "<slug>"` | Rename the folder or fix `slug`. |
| `provider must be a class inside the declared namespace` | `provider` does not start with `namespace`, or `namespace` is missing. |
| `parent must be the slug of another theme` | `parent` is invalid or names the theme itself. |
| `stylesheets entries must be .css paths ("/assets/…" or relative to assets/)` | A `stylesheets` entry is not a `.css` path, or a relative entry contains `..`. |
| `Cannot activate theme "<slug>":` followed by `parent theme "<parent>" is not installed` | Install the parent first. |
| `Provider class <class> not found in <path>.` | The class name, namespace or file path under `src/` does not match. The theme is suspended and the site falls back to `base`. |
| `Page component "<name>" is not registered (is its package active and built?)` | The component was not built, or its file is not under `resources/js/pages/`. With `app.debug` off, visitors see "Page unavailable" and the message goes to the log. |
| `Usage: make:theme <slug> [--parent=base]` | The slug is missing or not lowercase letters, digits and dashes. |
| `content/themes/<slug> already exists.` | Pick another slug or remove the folder. |
| `Invalid menu location [<name>].` | The location name does not match the pattern above. |
| `Blocks of theme:<slug> are named "<slug>/…".` | Rename the block to start with your theme's slug. |

Your page looks unstyled after you add a stylesheet: check that the path is relative to `assets/`, that the file exists, and that you activated the theme you are editing, not its parent.

## Next

- [Frontend](/developers/frontend): rendering, shared props, client navigation, SSR and the page cache.
- [Packaging](/developers/packaging): build and sign a theme for other sites.
- [Plugin manifest](/developers/manifest) and [Service providers](/developers/providers).
