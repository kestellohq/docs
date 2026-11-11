<script setup>
const firstVisit = [
    { title: 'Page cache', text: 'A visitor who is not signed in may get a stored copy, without routing or rendering.', note: 'X-Kestello-Cache: HIT ends the request here.' },
    { title: 'Page::render()', text: 'Your handler names a component and passes props.' },
    { title: 'Shared props', text: 'Core’s, then $cms->pages->share(), then the page.shared filter. The handler’s props win on a clash.' },
    { title: 'Component lookup', text: 'The theme chain, then plugins (@<slug>/), then core (@core/).' },
    { title: 'Server HTML', text: 'The SSR renderer within app.ssr.timeout (1.5 seconds), or saved page HTML when there is no renderer.', note: 'Neither: the browser draws the page.' },
    { title: 'HTML shell', text: 'Stylesheets, modulepreload links, the import map, the page object and the nonced boot script.', tone: 'brand' },
    { title: 'Stored', text: 'The page cache keeps the response when it may.' },
    { title: 'Boot', text: 'Vue hydrates the server HTML (data-ssr) or renders the page from the page object.' },
];
const navigation = [
    { title: 'Click a Link', text: 'The router asks for the next page with X-Kestello and X-Kestello-Version.' },
    { title: 'Version check', text: 'The server compares the version with the current one.', fail: '409 with X-Kestello-Location: the browser loads the address in full, with the new files.' },
    { title: 'Page JSON', text: 'The same page object, with X-Kestello: true.', tone: 'brand' },
    { title: 'Swap', text: 'The router renders the new component, updates usePage() and the history.' },
];
</script>

# Frontend

This page explains how a Kestello page gets from a PHP handler to the browser: `Page::render()`, the props every page shares, `usePage()`, client navigation, server-side rendering, the page cache and the Content Security Policy. Read it when you write a route that renders a page, share data with every page, or need to know why a visitor sees an old version of one. The short version is in [Architecture](/developers/architecture#pages-and-the-frontend); building the components themselves is on [Themes](/developers/themes).

## Render a page

A handler returns `Kestello\Cms\View\Page::render()`:

```php
<?php

declare(strict_types=1);

namespace Plugins\Hello;

use Kestello\Cms\View\Page;
use Kestello\Framework\Core\Request;
use Kestello\Framework\Core\Response;

final class GreetingController
{
    public function show(Request $request, string $name): Response
    {
        return Page::render('@hello/Greeting', [
            'title' => "Hello {$name}",
            'name' => $name,
        ]);
    }
}
```

```php
Page::render(string $component, array $props = [], int $status = 200, array $preload = []): Response
```

| Argument | Meaning |
|---|---|
| `$component` | A registered component name (see below). |
| `$props` | Data for the page. It is sent to the browser as JSON, so pass only what the page needs: select columns, never whole rows, never secrets. |
| `$status` | The HTTP status. `Page::render('@acme/NotFound', [], 404)` renders a page with a 404. |
| `$preload` | Other registered components the page will render, such as block components. Their scripts get `modulepreload` links and their stylesheets are linked in the first response. |

A `title` prop sets the document title through the site's title pattern from **Settings → Search and sharing**: by default `{title} - {site}`, and the site name alone on the home page or when the title is empty. A `seo.title` prop takes the place of `title` in it.

### Component names

| Name | Comes from |
|---|---|
| `Home`, `Blog/Post` | The active theme, then its parents: `resources/js/pages/Home.vue`. |
| `@acme-events/Event` | The plugin `acme-events`: `content/plugins/acme-events/resources/js/pages/Event.vue`. |
| `@core/errors/Error` | Core: `core/resources/js/pages/errors/Error.vue`. |
| `layouts/Site` | The active theme's layout, else core's fallback. |

A theme that ships its own `errors/Error` page gets the props `status`, `heading`, `message` and `home` (the link's label), already in the site's language.

The first match wins, in this order: the theme chain, plugins, core. A theme can therefore replace any page by shipping a file with the same name; a plugin can only provide names under its own `@<slug>/`. Only registered components can be loaded by the browser or the SSR server.

## What the browser gets

A first visit runs these steps on the server:

<Flow :steps="firstVisit" caption="From the request to a page in the browser, on a first visit" />

The response is an HTML document. It carries:

- the component's stylesheets, and `modulepreload` links with Subresource Integrity hashes;
- an import map that points `vue`, `@kestello/app`, `@kestello/sdk` and `@kestello/ui` at the single copy the site serves;
- the page object in `<script type="application/json" id="kestello-page">`;
- one module script, with the request's nonce, that boots the app.

The page object is the same thing client navigation receives as JSON:

```bash
curl -s -H 'X-Kestello: true' http://localhost:8080/about
```

```text
{"component":"About","props":{"site":{"name":"My CMS","url":"http://localhost:8080"},"auth":{"user":null},"csrfToken":"","flash":{"success":null,"error":null},"errors":{},"old":{},"i18n":{"locale":"en","translations":null},"recoveryMode":false,"menus":{"primary":[],"footer":[]},"hello":{"badge":"23 greetings served"},"title":"About","kestelloVersion":"0.1.0"},"url":"/about","version":"6936f94e90d4"}
```

| Field | Meaning |
|---|---|
| `component` | The component to render. |
| `props` | Shared props, then the handler's props (the handler's win on a clash). |
| `url` | The request path and query, without tracking parameters. |
| `version` | A hash of the core version and every active build's manifest. It changes whenever a build, theme or plugin changes. |

## Shared props

Every page receives these props from core:

| Prop | Value |
|---|---|
| `site` | `{ name, url, titles }`: the name and address from **Settings**, falling back to `app.name` and `app.url`, and `titles`, the title patterns from **Settings → Search and sharing** (`{ page, home, sep, tagline }`), so the browser writes the same document title as the server. |
| `auth` | `{ user: null }` or `{ user: { id, username, email, role, admin } }`. `admin` is `true` when the person's role may open the admin (`admin.access`): use it, not the role's name, to show a link there. A hint for the interface only; the server checks every permission. |
| `csrfToken` | The session's CSRF token, or `''` when there is no session. |
| `flash` | `{ success, error }` messages flashed by the last request. |
| `errors` | Validation errors from the last form post, `{ field: [messages] }`. |
| `old` | The last form post's input, without fields whose names contain `pass`, `secret`, `token` or `key`. |
| `i18n` | `{ locale, translations }`: the site's language, and the address of the active plugins' and theme's translations for it (`null` when there are none, as for English). The page loads them before it is drawn, so `__()` in their components shows the site's language. |
| `recoveryMode` | `true` while the site runs in recovery mode. |
| `menus` | The menus assigned to the active theme's locations, `{ primary: [...], footer: [...] }`. See [Themes](/developers/themes#menu-locations). |
| `demo` | Only on a public demo site (`app.demo`): `{ username, password, next_reset, every }`, the account to sign in with, the Unix time of the next reset and the minutes between resets. |

Add your own with `$cms->pages->share()` in a provider's `boot()`:

```php
public function boot(Cms $cms): void
{
    $cms->pages->share('hello', fn(): array => [
        'badge' => sprintf('%d greetings served', $cms->container->make(Greetings::class)->count()),
    ]);
}
```

A closure runs once per page render, as the package that registered it, and only when a page is rendered. A plain value is sent as is.

To change shared props after everyone has added theirs, use the `page.shared` filter. It receives the whole array:

```php
$cms->filters->add('page.shared', function (array $shared): array {
    unset($shared['hello']);
    return $shared;
});
```

::: warning
Shared props go to every visitor's browser and into the page cache. Never share secrets or anything that differs per visitor without reading [the page cache](#the-page-cache) section.
:::

## Read props in Vue

A component receives only the props it declares in `defineProps`. Shared data is on `usePage()`:

```vue
<script>
export default { layout: 'Site' };
</script>

<script setup>
import { Head, usePage } from '@kestello/app';

defineProps({ name: { type: String, required: true } });
const page = usePage();
</script>

<template>
    <Head :title="`Hello ${name}`" />
    <h1>Hello, {{ name }}</h1>
    <p>{{ page.props.hello?.badge }}</p>
</template>
```

`usePage()` returns the reactive page object: `component`, `props`, `url` and `version`. It updates when the visitor navigates.

`<Head title="...">` sets the document title through the same title pattern as the server (in the admin, always `Title - Site`). `<Head title="..." raw />` uses the title as given.

## Client navigation

`Link` and the router fetch the next page as JSON and swap it in without a full reload:

```vue
<script setup>
import { Link, useRouter } from '@kestello/app';

const router = useRouter();
</script>

<template>
    <Link href="/about">About</Link>
    <Link href="/logout" method="post" as="button">Sign out</Link>
    <button type="button" @click="router.get('/search', { q: 'bread' })">Search</button>
</template>
```

| `Link` prop | Meaning |
|---|---|
| `href` | The address. Another origin gets a full page load. |
| `method` | `get` (default), `post`, `put`, `patch` or `delete`. Anything but `get` renders a `<button>` unless `as` says otherwise. |
| `data` | Query parameters for `get`, the JSON body for the rest. |
| `as` | The element to render. |
| `replace` | Replace the history entry instead of adding one. |
| `preserveScroll` | Keep the scroll position. |
| `preserveState` | Keep the component's state when the next page is the same component. |

A click with a modifier key, a middle click or `target="_blank"` is left to the browser.

The router (`useRouter()`) has `visit(url, options)`, `get(url, data, options)`, `post`, `put`, `patch`, `delete(url, options)` and `reload(options)`. `useForm()` wraps it for forms:

```js
const form = useForm({ email: '', password: '' });
form.post('/login');   // form.errors.email, form.processing
```

### What a navigation request looks like

<Flow :steps="navigation" caption="A click on a Link, from request to swap" />

Every navigation request carries these headers:

| Header | Value |
|---|---|
| `X-Kestello` | `true` |
| `X-Kestello-Version` | The `version` of the page the browser is showing. |
| `X-CSRF-TOKEN` | `props.csrfToken`, on anything but `GET`. |

The server then:

1. **Checks the version.** On a `GET` whose `X-Kestello-Version` differs from the current one, it answers `409 Conflict` with `X-Kestello-Location: <url>`, and the browser loads that address in full. This is how open tabs pick up a deploy: the next click after new builds reloads the page with the new files.
2. **Renders the page as JSON** with `X-Kestello: true` and `Vary: X-Kestello`.
3. **Turns redirects into 303** after `PUT`, `PATCH` and `DELETE`, so the browser follows them with a `GET`.

A response without `X-Kestello` (a file download, a page from outside Kestello) makes the browser load the address in full. A non-page answer to a form post is shown as is.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -H 'X-Kestello: true' -H 'X-Kestello-Version: stale' http://localhost:8080/about
```

```text
409
```

## Head and body filters

Plugins add HTML to every rendered page with these filters. Each receives the HTML so far and returns the new HTML; all but `page.icons` also receive the page object. Higher priority runs first.

| Filter | Where the HTML goes |
|---|---|
| `page.icons` | The favicon and theme colour links. Core's default is Kestello's icons; a theme replaces it. |
| `page.head` | The end of `<head>`. |
| `page.body_open` | Right after `<body>`. |
| `page.footer` | Right before `</body>`. |
| `security.csp` | Not HTML: the CSP directives (see [Content Security Policy](#content-security-policy)). |

```php
$cms->filters->add('page.head', fn(string $html): string => $html . '<meta name="hello-plugin" content="active">');
```

The page object's `props.admin` is set on admin pages. Check it when your HTML belongs on the public site only:

```php
$cms->filters->add('page.head', function (string $html, array $data = []): string {
    return isset($data['props']['admin']) ? $html : $html . '<link rel="alternate" type="application/rss+xml" href="/feed">';
});
```

What these filters return is inserted without escaping. Escape anything that came from users.

## Server-side rendering

Server-side rendering (SSR) renders a page's HTML in a small Node.js process before it is sent, for a faster first paint and for crawlers that do not run JavaScript. It is optional, and a site never depends on it.

### Turn it on

1. On the server, install the Node dependencies in the site's root folder (the renderer resolves `vue` from the site's `package.json`) and make sure every package has its `assets/build/ssr/` build. `npm run build` writes both builds.
2. Start the renderer from the site's root folder:

   ```bash
   node core/ssr/server.mjs
   ```

   ```text
   [kestello-ssr] listening on http://127.0.0.1:13714 (root /var/www/site)
   ```

   It reads `SSR_HOST` (default `127.0.0.1`), `SSR_PORT` (default `13714`) and `KESTELLO_ROOT` (default: the current folder). Run it under systemd or supervisor so it restarts; see [Deployment](/developers/deployment).
3. Point Kestello at it with `app.ssr.url` in `config/app.php`, or the `KESTELLO_SSR_URL` environment variable, which core's default reads:

   ```php
   'ssr' => [
       'url' => 'http://127.0.0.1:13714',
       'timeout' => 1.5,
   ],
   ```

In the Docker setup, start the `ssr` profile and set `KESTELLO_SSR_URL=http://ssr:13714` in `.env`; see [Local development](/developers/local-development#optional-services).

| Key | Default | Meaning |
|---|---|---|
| `app.ssr.url` | `KESTELLO_SSR_URL`, else `null` | The renderer's address. `null` renders every page in the browser. |
| `app.ssr.timeout` | `1.5` | Seconds to wait for the renderer. |

The renderer only accepts `POST /render` with a JSON body up to 2 MB, and `GET /health`. It only imports `.mjs` files under an `assets/build/ssr/` folder inside `KESTELLO_ROOT`, and never fetches anything. Keep it bound to localhost or a private network.

Admin pages are never server-rendered: they are per user and need no search engine.

### Saved page HTML, without the renderer

A site without the Node renderer still sends real HTML for its public pages, once an administrator's browser has drawn them. This is on by default (`app.prerender`, `true`), and off when `app.ssr.url` is set or on a public demo.

1. A visitor who is not signed in, with no session data (no form errors, no flash message), opens a page whose address has no query string except `page`.
2. When no HTML is saved for that page yet, the page goes out as usual and its data waits in `storage/framework/prerender/`.
3. An administrator's browser, in the admin, draws the waiting pages to HTML in a hidden frame and sends it back.
4. The next visitor gets the saved HTML, and Vue takes it over.

A page's key is a SHA-256 hash of the exact page data the browser receives, so saved HTML never goes stale: when the page, a menu or a list changes, the key changes too. Up to 2000 pages are kept and up to 100 wait at once; the oldest go first.

### When the renderer is down

If the renderer does not answer within the timeout, answers with anything but `200`, or returns no body, Kestello:

1. logs `[kestello] SSR unavailable (<status or "no response">), rendering client-side` when there was no answer or the status was not `200`;
2. sends the normal HTML shell, and the browser renders the page as it does without SSR;
3. caps that response's page cache lifetime at 60 seconds, so a page cached during the outage does not stay without its server HTML for the whole cache lifetime.

### Write components that render on both sides

The same component runs in Node and in the browser. Do not touch `window`, `document` or `localStorage` during setup; do it in `onMounted()`, which runs only in the browser. When the HTML came from the renderer, the root element has `data-ssr` and Vue hydrates it instead of rendering from scratch.

## The page cache

Kestello stores whole pages for visitors who are not signed in and serves them without routing, touching the database or rendering. It is on by default, and off while `app.debug` is on unless an administrator turns it on under **Settings → Performance**.

| Setting (admin label) | Key | Default | Meaning |
|---|---|---|---|
| **Cache pages** | `page_cache` | on, off while debugging | Whether pages are cached. |
| **Keep pages for** | `page_cache_ttl` | `86400` | Seconds a page is kept when nothing changes (60 to 604800). |
| **CDN cache time** | `cdn_max_age` | `0` | Seconds a CDN or proxy may keep pages (0 to 86400). |

### What is cached

A response is stored when all of these hold:

- the request is `GET` or `HEAD`, without a session cookie and without an `Authorization` header;
- the path does not start with `/admin`, `/api/`, `/login`, `/logout`, `/install`, `/system/`, `/auth/`, `/forgot-password`, `/reset-password`, `/register/`, `/uploads/`, `/assets/`, `/storage/` or `/search`;
- the query string is empty, or holds only allowed parameters (by default `page`, with a value from `1` to `99999`); parameters in the ignored list below do not count;
- the status is `200`, with no cookies set, no session started while rendering, and no `Cache-Control: private` or `no-store`;
- the content type is HTML, JSON, XML, RSS, Atom or plain text, and the body is at most 2 MB;
- nothing called `PageTags::uncacheable()`.

HTML and the JSON of client navigation are stored separately. The page registry's version is part of every key, so a deploy, a new build, or a theme or plugin change starts a fresh cache without a purge.

Responses carry `X-Kestello-Cache: HIT` or `MISS`, an `ETag`, and `Cache-Control: public, max-age=0, must-revalidate`, so browsers always ask again and get a `304` when nothing changed. With **CDN cache time** above 0, `s-maxage` and `stale-while-revalidate` are added for shared caches.

### Ignored tracking parameters

These query parameters do not change the cache key and are left out of the page's `url`, so one visitor's campaign id never ends up in another's page:

`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`, `gclid`, `fbclid`, `msclkid`, `mc_cid`, `mc_eid`, `_ga`, `_gl`.

Any other parameter makes the request skip the cache, because every value would be a new page to store. To cache pages that take a parameter of your own, allow it with the `pagecache.query` filter:

```php
$cms->filters->add('pagecache.query', fn(array $allowed): array => [...$allowed, 'category']);
```

Values longer than 50 characters still skip the cache.

### Tag what a page shows

While a page renders, code records what it depends on with `Kestello\Cms\Cache\PageTags`. Purging a tag drops every page that carries it.

| Method | Use it when |
|---|---|
| `PageTags::add(string ...$tags)` | The page shows something that can change. Tags match `^[a-z0-9][a-z0-9:._-]{0,100}$`; others are ignored. |
| `PageTags::uncacheable()` | Something personal or one-off ended up in this response. |
| `PageTags::until(int $timestamp)` | The page changes by itself at that moment (a block shown from or until a date). It is cached until then at most. |

Core's tags:

| Tag | On pages that show |
|---|---|
| `entry:<id>` | That entry, including as a menu link or an ancestor. |
| `list:<type>` | Lists that can show a content type: archives, terms, dates, authors, query blocks. |
| `terms` | Term names. |
| `form:<id>` | That form. |
| `content` | Anything, without saying what. A page that adds no tags gets this one. |
| `all` | Every cached page has it. |

A plugin page that lists its own records:

```php
use Kestello\Cms\Cache\PageTags;
use Kestello\Cms\View\Page;

public function index(): Response
{
    PageTags::add('acme-events:list');

    return Page::render('@acme-events/Index', ['events' => $this->events->upcoming()]);
}
```

And the purge when one changes:

```php
use Kestello\Contracts\Cache\PageCache;

$cms->container->make(PageCache::class)->purge('acme-events:list');
```

A page that was purged while it was rendering is not stored, because it may hold the old content.

### What is purged when

| Change | Purged tags |
|---|---|
| An entry is saved, deleted or restored | `entry:<id>`, `list:<type>`, `content`, and `terms` unless it was saved with the same status and publish date |
| A term is saved, deleted or restored | `terms`, `content`, and `list:<type>` for each type of its taxonomy |
| A form is saved | `form:<id>` |
| Settings, menus, media updated or deleted, platform settings, profiles, users, content types, themes and styles | `all` |
| A deploy, a new build, a plugin activated or deactivated | Nothing: the version in the key changes |

To empty the page cache by hand, for example after editing a theme's files on a server:

```bash
php bin/cms cache:pages
```

`Kestello\Contracts\Cache\PageCache` is a contract. Core binds `TaggedPageCache`, which keeps pages in the configured cache store; a plugin can bind another, such as one that also purges a CDN.

## Content Security Policy

Every HTML response gets a `Content-Security-Policy` header with a fresh nonce:

```text
script-src 'nonce-<nonce>' 'strict-dynamic' https: 'unsafe-inline'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'; form-action 'self'
```

With `'strict-dynamic'`, scripts loaded by the nonced boot script (Vue, page components) are trusted. Inline event handlers (`onclick="..."`) and `<script>` tags without the nonce do not run. `https:` and `'unsafe-inline'` are ignored by browsers that support nonces; they only keep very old browsers working.

A `<script>` you add through `page.head` or another filter needs the nonce:

```php
use Kestello\Cms\Frontend\Csp;

$cms->filters->add('page.footer', function (string $html) use ($cms): string {
    $nonce = htmlspecialchars($cms->container->make(Csp::class)->nonce(), ENT_QUOTES);

    return $html . '<script nonce="' . $nonce . '" src="/assets/plugins/acme-chat/~1.0.0/chat.js"></script>';
});
```

Cached pages never share a nonce: the page cache stores a placeholder and puts the current request's nonce in on every hit. Snippets added under **Settings → Code** get the nonce automatically.

To allow more sources, change the directives with the `security.csp` filter:

```php
$cms->filters->add('security.csp', fn(array $d): array => [...$d, 'connect-src' => "'self' https://api.example.com"]);
```

Directive names must be lowercase letters and dashes, and values may not contain `;` or line breaks; entries that break these rules are dropped. A response that already has a `Content-Security-Policy` header, or is not HTML, is left alone.

## If something goes wrong

| What you see | Meaning |
|---|---|
| `Page component "<name>" is not registered (is its package active and built?)` | The name is wrong, the package is not active, or it was not built. With `app.debug` on this is an exception; with it off visitors see "Page unavailable" and the message is logged. |
| `Core frontend is not built: run "npm run build".` | `core/resources/assets/build/` is missing. |
| `[kestello] page component "<name>" is not registered` in the browser console | The browser asked for a component outside the registry, such as a layout name the theme does not have. |
| `[kestello] SSR unavailable (no response), rendering client-side` in the PHP log | The renderer is not running or not reachable at `app.ssr.url`. Pages still work. |
| `[kestello-ssr] component not allowed` in the renderer's output | The component has no SSR build. Run `npm run build` for its package. |
| `[kestello] page cache unavailable: ...` or `[kestello] page cache write failed: ...` | The cache store failed. Pages are rendered for every request until it recovers. |
| A page keeps showing old content | It shows something it did not tag. Add a tag and purge it when the data changes, or call `PageTags::uncacheable()`. |
| A visitor sees another visitor's data | Personal data reached a page with no session. Do not put it in shared props; render it from an API call after the page loads, or call `PageTags::uncacheable()`. |
| `X-Kestello-Cache` never appears | The page cache is off (debug mode), or one of the conditions under [What is cached](#what-is-cached) fails. |
| A script does not run and the console reports a CSP violation | The `<script>` has no nonce, or it uses an inline event handler. |

## Next

- [Themes](/developers/themes): pages, layouts, styles and menus.
- [REST API](/developers/rest-api): data for pages that load it after rendering.
- [Configuration](/developers/configuration) and [Deployment](/developers/deployment): `app.ssr.url`, running the renderer and the cache store.
