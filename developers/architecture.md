# Architecture

This page explains how Kestello is put together: its layers, how a request is handled, how plugins and themes are loaded, and how pages reach the browser. Read it before writing your first plugin; the rest of the developer docs assume these ideas.

## Layers

Kestello is built in layers. Each layer may use the layers below it and never the ones above.

| Layer | Namespace or place | What it does |
|---|---|---|
| Site data | the database, `config/`, `content/uploads/` | The client's content and settings. Never touched by updates. |
| Theme | `content/themes/<slug>/` | Presentation: page components, blocks, styles. |
| Plugins | `content/plugins/<slug>/` | Features added to a site. |
| Core modules | `Kestello\Cms\*` | Kestello's own features: content, media, admin, API, forms, backups. |
| Contracts | `Kestello\Contracts\*` | Stable interfaces that plugins depend on, such as `Cache\Store` or `Mail\Mailer`. |
| Framework | `Kestello\Framework\*` | The kernel, router, container, database, cache, queue, sessions. Knows nothing about content, plugins or themes. |
| Support | `Kestello\Support\*` | Plain helpers: strings, arrays, dates, HTML sanitising, zip, JSON. |

Plugins should depend on contracts, support classes and classes marked `@api`. Those keep working across minor releases. Anything else is internal and can change.

## The `Cms` object

Nearly everything a plugin does goes through one object, `Kestello\Cms\Cms`, which providers receive in `boot()`. Its properties are the registries you extend:

| Property | Use it to |
|---|---|
| `$cms->events` | Listen to and dispatch typed events. |
| `$cms->filters` | Change values that core passes through named filters. |
| `$cms->routes` | Add web routes. |
| `$cms->api` | Add REST endpoints under `/api/v1`. |
| `$cms->admin` | Add admin pages, menu groups and settings groups. |
| `$cms->content` | Declare content types and fields. |
| `$cms->auth` | Declare capabilities and roles, add sign-in methods. |
| `$cms->console` | Add `bin/cms` commands. |
| `$cms->drivers` | Add or replace infrastructure drivers (cache, mail, storage, search). |
| `$cms->health` | Add Site Health checks. |
| `$cms->container` | Register and resolve services. |
| `$cms->config`, `$cms->paths` | Read configuration and find folders. |

## How a request is handled

Every web request enters through `public/index.php`, which loads the active core release and calls `Kestello\Kernel::create($root)->handleHttp()`. From there:

1. **Installer check.** If `config/installed.php` does not exist, every request is sent to the installer at `/install`. Once it exists, `/install` redirects to the home page.
2. **Maintenance check.** If maintenance mode is on (during a restore or an update), the request may get a self-contained 503 page. This happens before the database is touched, because during a restore the database is being rebuilt.
3. **Bootstrap.** Configuration is loaded, the database connection is made, the session object and the auth state are prepared.
4. **Recovery mode.** A signed recovery link (from `bin/cms recovery:link`) sets a cookie that boots the site with every plugin off and the default theme. This is how an owner gets back into a site that a plugin broke.
5. **Extensions boot.** Core modules, active plugins and the active theme are registered, then booted. See the next section.
6. **Session start.** The session starts after providers boot, so a plugin can supply the session driver. Visitors reading pages get no session cookie until something is stored.
7. **Routing.** The router matches the request. Global middleware (CSRF protection, the API gateway with CORS) runs, then the route's own middleware, then the handler.
8. **After the response.** If no real cron is running, the web runner may run due scheduled tasks and queued jobs after the response has been sent to the visitor.

Console commands (`bin/cms`) follow the same path without the HTTP parts: configuration, database, extensions, then the command.

## Modules, plugins and themes

Core features and plugins have the same shape: a **service provider** with two methods.

```php
use Kestello\Cms\Cms;
use Kestello\Cms\Extension\Provider;
use Kestello\Framework\Core\Container;

final class ShopProvider extends Provider
{
    public function register(Container $container): void
    {
        // bind services; nothing else is ready yet
    }

    public function boot(Cms $cms): void
    {
        // routes, events, admin pages, endpoints, content types
    }
}
```

The boot sequence:

1. **Discovery.** Kestello reads every `plugin.json` and `theme.json` under `content/`.
2. **Resolution.** Active plugins are checked against the running Kestello version, the PHP version, required PHP extensions, other plugins they depend on and plugins they conflict with. A plugin that cannot run is left out, and so is anything that depends on it. The reason is shown on the Plugins screen.
3. **Register.** Every provider's `register()` runs: core modules first, then plugins in dependency order, then the theme and its parent.
4. **Boot.** Every provider's `boot()` runs in the same order.
5. **Upgrades.** A plugin whose files are newer than the version recorded in the database gets its pending migrations and its `upgrade()` hook.

Each plugin's code runs inside a guard. If a plugin throws during register, boot or its upgrade, Kestello **suspends** it (records the error and stops loading it), drops its providers for the rest of the request, and carries on. A broken plugin costs the site a feature, not the whole site. The owner sees the reason on the Plugins screen and can fix or remove the plugin.

Plugins and themes are trusted PHP code. Kestello does not try to sandbox PHP, which is not realistic. Safety comes from three places instead: plugins declare what they do in their manifest, packages installed from the admin must be signed by a publisher the server trusts, and `plugin:check` refuses code with dangerous constructs such as `eval()`.

## Extension points

| Mechanism | When to use it | Example |
|---|---|---|
| **Events** | React to something that happened | Send a notification when an entry is published. |
| **Filters** | Change a value core is about to use | Add a tag to the page `<head>`. |
| **Providers** | Register services, routes, endpoints, admin pages | Everything a plugin sets up. |
| **Drivers** | Replace infrastructure | A mail driver for a provider's HTTP API, a storage driver for a cloud service. |
| **Blocks and page components** | Add to what pages can show | A theme's hero block, a plugin's booking form. |

## Pages and the frontend

Vue 3 is the only way markup is produced. A PHP handler returns a page:

```php
return Page::render('@acme-events/Event', ['event' => $event->toArray()]);
```

- On a visitor's first request, the response is an HTML document with the component name and props embedded. The browser loads the prebuilt component and Vue renders it.
- When the visitor navigates within the site, the next page arrives as JSON (component name and props) and Vue swaps it in without a full reload.
- Optionally, a small Node.js process renders pages on the server first (SSR) for faster first paint and for search engines. If that process is missing or fails, Kestello falls back to rendering in the browser. A site never breaks because SSR is down.

Components are compiled with Vite ahead of time and the built files are committed, so a server never needs Node.js. Vue itself is served from the site as one pinned file, with a strict Content Security Policy and no `eval`.

Themes and plugins provide components under their own prefix (`@acme-events/...`). A theme can override a core page component by providing one with the same name.

## The API

The admin is a client of the public REST API under `/api/v1`. An endpoint is one PHP class that declares its route, the capability it needs, the token scopes that may call it, its request schema and its rate limit. From that one definition Kestello does the routing, validation, authorisation and error format, and publishes an OpenAPI description of every endpoint, plugins' endpoints included.

Two ways to authenticate:

- **The admin's session**, with a CSRF token on every change.
- **Personal access tokens** (`Authorization: Bearer ...`), with scopes that limit what a token can do. Some actions, such as installing a plugin or applying an update, refuse tokens and need a recent interactive sign-in.

## Infrastructure drivers

Every infrastructure service is a contract with drivers that can be swapped. The defaults need nothing but PHP and the database (file cache, database sessions, database queue, database search, local disks, SMTP or PHP mail). Cache, sessions, queue and search drivers, Redis and search engines among them, are switched from **System → Infrastructure** or `bin/cms platform:set`, and tested before they are saved. Their settings come from three layers, in this order of precedence: environment variables, `config/platform.php`, then what an administrator saved in the admin. Storage disks (local or S3-compatible) are defined in `config/storage.php`, and mail is set under **Settings → Email**.

## Updates and packages

Kestello, plugins and themes are all delivered as signed zip packages, and all three update through the same pipeline: verify the signature, check compatibility, back up the database, switch on maintenance mode for visitors, put the new files in place, check the site in a fresh PHP process, then keep the update or roll everything back.

Kestello itself is installed as release folders, `core/releases/<version>/`, next to each other. The file `core/current.php` names the one that runs, and switching versions is a single atomic rename of that file.
