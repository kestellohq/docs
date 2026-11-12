<script setup>
const bootOrder = [
    { title: 'Core modules register()', text: 'Auth, admin, API, content, media and the rest.' },
    { title: 'Plugins register()', text: 'Active plugins in dependency order: a plugin’s dependencies first, ties broken by slug.', tone: 'brand' },
    { title: 'Theme chain register()', text: 'Parent before child, up to three themes.' },
    { title: 'Every boot()', text: 'In the same order: core, plugins, theme chain.' },
    { title: 'Pending upgrades', text: 'Plugins, then the themes of the chain, whose files have a new version.', tone: 'muted' },
];
const pluginStates = [
    { id: 'inactive', title: 'Inactive', text: 'Installed, not loaded. Its data is kept.' },
    { id: 'active', title: 'Active', text: 'Registered and booted on every request.', tone: 'brand' },
    { id: 'suspended', title: 'Suspended', text: 'Turned off by Kestello after it threw or hit a fatal error. The reason is recorded.' },
    { id: 'failed', title: 'Failed to start', text: 'Active, but skipped: a requirement or dependency is missing.' },
    { id: 'deleted', title: 'Deleted', text: 'Its tables, settings and files are gone.', tone: 'muted' },
];
const pluginMoves = [
    { from: 'inactive', to: 'active', label: 'Activate', note: 'checks, migrations, a test boot, then activate()' },
    { from: 'inactive', to: 'deleted', label: 'Delete plugin and data', note: 'uninstall(), migrations rolled back, settings and folder removed' },
    { from: 'active', to: 'inactive', label: 'Deactivate', note: 'deactivate(); refused while another active plugin needs it' },
    { from: 'active', to: 'suspended', label: 'register(), boot() or an upgrade throws', note: 'or a fatal error in its files' },
    { from: 'active', to: 'failed', label: 'A requirement stops being met', note: 'such as a dependency that was suspended or removed' },
    { from: 'suspended', to: 'inactive', label: 'Deactivate', note: 'clears the suspension' },
    { from: 'suspended', to: 'active', label: 'plugin:activate', note: 'after the fix; the test boot runs first' },
    { from: 'failed', to: 'inactive', label: 'Deactivate' },
];
</script>

# Providers

A provider is the class a plugin or theme names in its manifest. Kestello calls it at fixed points: on every request to set things up, and once when the package is activated, upgraded, deactivated or uninstalled. This page explains each hook, the order they run in, how Kestello knows which package a piece of code belongs to, and what happens when that code throws. Read it before you put anything in `boot()` beyond the examples, and when a plugin shows as **suspended**.

## The class

A plugin provider extends `Kestello\Cms\Extension\PluginProvider`, a theme provider extends `Kestello\Cms\Extension\ThemeProvider`. Both extend `Kestello\Cms\Extension\Provider`, which core modules use too. Every hook is optional.

```php
<?php

declare(strict_types=1);

namespace Plugins\Notices;

use Kestello\Cms\Cms;
use Kestello\Cms\Extension\PluginProvider;
use Kestello\Framework\Core\Container;

final class NoticesProvider extends PluginProvider
{
    public function register(Container $container): void
    {
        // NoticeFeed and FeedController are classes of this plugin, in src/.
        $container->singleton(NoticeFeed::class, fn() => new NoticeFeed($this->secret('feed.token')));
    }

    public function boot(Cms $cms): void
    {
        $cms->routes->get('/notices.json', [FeedController::class, 'show'])->name('notices.feed');
    }

    public function activate(Cms $cms): void {}

    public function upgrade(Cms $cms, string $fromVersion, string $toVersion): void {}

    public function deactivate(Cms $cms): void {}

    public function uninstall(Cms $cms): void {}
}
```

The class is created with `new`, without arguments. Do not give it a constructor with parameters.

## Hooks

| Hook | When it runs | Use it to |
|---|---|---|
| `register(Container $container)` | Every request and command, before any provider boots. | Bind services into the container. Nothing else is ready yet. |
| `boot(Cms $cms)` | Every request and command, after every provider registered. | Routes, API endpoints, admin pages, listeners, filters, jobs, schedules, commands, content types, capabilities. |
| `activate(Cms $cms)` | Once, when the plugin is activated, after its migrations ran and after a test boot. Plugins only. | Seed default rows, log, warm a cache. |
| `upgrade(Cms $cms, string $fromVersion, string $toVersion)` | Once, when the files on disk have a different version from the one recorded, after the new migrations ran. | Move data between formats, rename settings. |
| `deactivate(Cms $cms)` | Once, when the plugin is deactivated. Data is kept. | Clear caches, stop external webhooks. |
| `uninstall(Cms $cms)` | Once, before the plugin's tables and settings are removed. The plugin must be inactive. | Remove files under `storage/plugins/<slug>/`, tell an external service. |

### register and boot order

On every request:

1. Core modules `register()` (auth, admin, API, content, media and the rest).
2. Active plugins `register()`, in dependency order (a plugin's dependencies first, ties broken by slug).
3. The active theme chain `register()`, parent before child.
4. Every `boot()`, in the same order: core, plugins, theme.
5. Pending upgrades (see below).

<Flow :steps="bootOrder" caption="The order providers run in on every request" />

Because core boots first, a plugin can grant capabilities to core roles such as `editor`, extend core resources with `$cms->api->extend('users')` and use the core admin menu groups. A plugin that builds on another plugin's registries must list it in `dependencies`, so it boots after it.

### Activation

`plugin:activate <slug>`, or activating the plugin on the **Plugins** screen, does this:

1. Checks the plugin against Kestello, PHP, extensions, dependencies and conflicts. Refuses with `Cannot activate "<slug>":` and the list of problems.
2. Checks the dependency order for cycles.
3. Runs the plugin's pending migrations.
4. If the plugin was replaced by another version while it was off, calls `upgrade()` with the recorded and the new version.
5. Calls `register()` and `boot()` once as a test. If either throws, activation fails with `Cannot activate "<slug>": it failed to boot: <message> (<file>:<line>)`. The migrations from step 3 stay. Content types and taxonomies declared in this test boot are checked the way every request checks them (known field types, fields that can be indexed, no address used twice), then set aside: they are declared for real on the next request. A plugin whose type takes an address another type already uses is refused here, for example with `Content types [post] and [acme-news] share the path "/blog".`, instead of breaking the site on the next request.
6. Calls `activate()`.
7. Records the plugin as active with its version, and clears any suspension.

The test boot in step 5 means `boot()` runs one extra time during activation. Keep `boot()` free of side effects: it should only register things.

### Upgrades

Kestello records each active package's version. When the files on disk have a different version (after `package:update`, an upload, or a deploy that copied new files), the next request or command runs, as the package:

1. The package's new migrations.
2. `upgrade($cms, $fromVersion, $toVersion)`.
3. Records the new version.

This happens once, after every provider booted. If it throws, the package is suspended and the version is not recorded, so the upgrade runs again after the fix. Themes in the active chain get upgrades the same way.

```php
public function upgrade(Cms $cms, string $fromVersion, string $toVersion): void
{
    // 0.2.0 renamed a setting.
    if (\Kestello\Framework\Support\Semver::compare($fromVersion, '0.2.0') < 0) {
        $settings = \Kestello\Framework\Settings\Settings::getInstance();
        $old = $settings->get('plugin.notices.display.count');
        if ($old !== null) {
            $settings->set('plugin.notices.display.limit', (string) $old, 'plugin.notices');
            $settings->delete('plugin.notices.display.count');
        }
    }
}
```

### Deactivation and uninstall

`deactivate()` errors are logged (`[kestello] <slug> deactivate() failed: ...`) and deactivation goes ahead anyway, so a broken plugin can always be turned off. Deactivating a plugin that another active plugin depends on is refused: `Cannot deactivate "notices": required by acme-events.`

`plugin:uninstall <slug>` (or deleting the plugin on the **Plugins** screen) runs, in order:

1. `uninstall()`. This is where a plugin removes the content it created (see below).
2. Every migration of the plugin rolled back, newest first (their `down()` methods).
3. Every setting whose key starts with `plugin.<slug>.` deleted.
4. The plugin's state and any suspension removed.
5. The folder deleted, unless `--keep-files`.

A plugin that is still active is refused: `Deactivate "<slug>" before uninstalling it.`

Entries of a plugin's content types and terms of its taxonomies are ordinary content, so deactivating a plugin keeps them (they come back when it is activated again). To remove them on uninstall, call the purge helpers from `uninstall()`. They delete entries for good, trashed ones included, with their revisions, term links and search documents, and they only accept the plugin's own type and taxonomy names:

```php
public function uninstall(Cms $cms): void
{
    $cms->container->make(\Kestello\Cms\Content\Entries::class)->purgeType('acme-event');
    $cms->container->make(\Kestello\Cms\Content\Terms::class)->purgeTaxonomy('acme-event-topic');
}
```

Rows in your own tables that point at entries can use a foreign key with `cascadeOnDelete()`, so they go with the entry.

## Helpers on the provider

| Method | Returns |
|---|---|
| `$this->package()` | The `Kestello\Cms\Extension\Package` (manifest, slug, version, paths). `null` for core modules. |
| `$this->path('database/seed.json')` | An absolute path inside the package. |
| `$this->setting('display.limit', 1)` | The setting `plugin.<slug>.display.limit`, or the default. Values come back as strings. |
| `$this->secret('feed.token')` | A sealed secret, opened. `''` (or your default) when it is not set or cannot be opened. |
| `$this->loadRoutes($cms, 'routes.php')` | Includes a file from the package with `$router` in scope. |

`setting()` and `secret()` are covered in [Settings](/developers/settings).

## Execution context

Kestello tracks which package is running at any moment. The owner is a string: `core`, `plugin:<slug>` or `theme:<slug>`. `Kestello\Framework\Core\ExecutionContext` keeps a stack of owners, and everything that calls package code pushes the package onto it:

- the provider hooks,
- event listeners and filters (as the package that added them),
- web route handlers and API endpoint handlers (as the package that registered them),
- shared page data closures (`$cms->pages->share()`),
- queued jobs (as the package that registered the job class, not whatever the queue row claims),
- scheduled tasks,
- sign-in methods added with `$cms->auth->authenticator()`.

The owner is used for three things:

1. **Permissions.** The HTTP client checks the current owner against the `permissions.network` list in its manifest.
2. **Names.** Capabilities, scopes, admin menu ids, settings tabs, task names and API paths are checked against the current owner's slug.
3. **Blame.** When code throws inside `ExecutionContext::run()`, the exception is tagged with the innermost owner that saw it. The log line names it:

   ```text
   [2026-11-05 10:12:03] [plugin:notices] RuntimeException: Feed unavailable in /var/www/content/plugins/notices/src/NoticeFeed.php:41
   ```

   For API endpoints the line is `[kestello] API GET /api/v1/notices/notices failed [<request id>] in plugin:notices: ...`, and the response carries the same id in `X-Request-Id`.

### Core work inside plugin code

When plugin code calls a core service (the storage layer, a core driver making an HTTP request for itself), core runs that work with `ExecutionContext::run('core', ...)`. Inside it, `ExecutionContext::current()` is `core`, so core's own rights apply (for example, a core driver is not limited by the plugin's `network` list). The plugin's frame is still on the stack below, so an exception thrown there is still blamed on the plugin and safe mode still works.

Plugins should not call `ExecutionContext::run('core', ...)` themselves. Kestello cannot prevent it, because PHP cannot be sandboxed, but a plugin that does is doing work its manifest does not disclose.

## Safe mode and suspension

A plugin's mistake costs the site that plugin, not the whole site.

| What happens | Result |
|---|---|
| `register()`, `boot()` or an upgrade throws | The package is **suspended**: the reason is recorded, its providers are dropped for the rest of the request, and it is not loaded on later requests. |
| A fatal error (`E_ERROR`, `E_PARSE` and similar) in a file inside the package, or while it is on the execution stack | The package is suspended from the shutdown handler. The next request runs without it. |
| An exception in a route, listener, endpoint or job at run time | Not suspended. That request gets an error response (or the job is retried) and the log names the owner. Suspending on one bad request would let one visitor turn a plugin off. |
| A theme, or a theme's parent, cannot load | The site uses the default theme `base`. |
| A core module throws | Not contained. The error propagates. |

Suspensions are stored in `storage/framework/suspended.json`, not the database, because they may be written after the database failed. The reason looks like:

```text
plugin:notices failed during boot: Unknown role [editors]. (/var/www/content/plugins/notices/src/NoticesProvider.php:17)
```

It shows on the **Plugins** screen, where the plugin's status is **Suspended**. To clear it, fix the code and run `plugin:activate <slug>` (the test boot runs first), or **Deactivate** the plugin on the screen and **Activate** it again. Deactivating or uninstalling also clears it.

A plugin that is active but whose requirements are no longer met (a dependency was suspended or removed, the PHP version changed) is not loaded either, and shows as **Failed to start**, with the reason.

<States :states="pluginStates" :moves="pluginMoves" caption="A plugin's statuses on the Plugins screen, and what moves it between them" />

### Recovery mode

If a plugin locks everyone out of the admin, use recovery mode, which boots with every plugin off and the default theme:

```bash
php bin/cms recovery:link
```

Open the printed link. While its cookie is valid, a banner shows on the site and in the admin. On the command line, add `--safe` to any command for the same effect:

```bash
php bin/cms plugin:deactivate notices --safe
```

## What not to do in boot

`boot()` runs on every request, including requests for assets and API calls, and before some things exist.

- **Do not read or write the session.** The session starts after providers boot, so that a plugin can supply the session driver. Read it in a route handler, a middleware, an endpoint, or a listener of `Kestello\Cms\Events\KernelBooted`, which is dispatched after the session has started.
- **Do not ask who is signed in.** Authentication happens per request, later. In an endpoint use `$request->principal`. In a web route, call `$cms->auth->authenticate($request)`.
- **Do not query the database or call other servers for every request.** Put the work in a closure that runs when needed (`$cms->pages->share('key', fn() => ...)`, a route, a listener), or cache it.
- **Do not send output** or headers.
- **Do not depend on another plugin's registrations** unless it is in your `dependencies`, which makes it boot first.
- **Do not resolve services you bind in `register()` of other packages during `register()`.** Other providers may not have registered yet. Resolve them in `boot()` or later.

## Logging

Write to the site's log with `Kestello\Framework\Log\Log`, not `error_log()`:

```php
use Kestello\Framework\Log\Log;

Log::warning('the feed could not be read', ['feed' => $url, 'status' => $status]);
Log::error('the sync stopped', ['exception' => $e]);
```

Each entry is one JSON line with the level, your message, your package as `owner` (from the [execution context](#execution-context)), the request's ID and the context you pass. The levels are `debug`, `info`, `warning`, `error` and `critical`; the site writes `info` and up unless it sets `KESTELLO_LOG_LEVEL`. Put details in the context rather than the message, so they can be searched. Keys that look like secrets (`password`, `token`, `api_key`, `secret`, `authorization`, `cookie`) are written as `[redacted]`, and an exception becomes its class, message, file, line and trace. Logging never throws.

Where the log goes is the site's choice: daily files in `storage/logs/`, or the process's output with `KESTELLO_LOG=stderr`. See [Configuration](/developers/configuration#environment-variables).

## If something goes wrong

| Message | What it means |
|---|---|
| `Provider class Plugins\Notices\NoticesProvider not found in <folder>/src.` | The class is not at the PSR-4 path for the namespace in the manifest, or its namespace line is wrong. |
| `Plugins\Notices\NoticesProvider must extend Kestello\Cms\Extension\Provider.` | Extend `PluginProvider` (or `ThemeProvider`). |
| `Cannot activate "notices": it failed to boot: ...` | `register()` or `boot()` threw during the activation test. |
| `plugin:notices failed during register: ...` | Recorded as a suspension: `register()` threw on a normal request. |
| `plugin:notices failed during upgrade: ...` | A new migration or `upgrade()` threw. The version stays at the old one, so it runs again after the fix. |
| `fatal error: ...` | Recorded as a suspension after a PHP fatal error in the package's files. |
| `Unknown role [editors].` | `grantTo` or `grant()` named a role that does not exist. Core roles are `admin`, `user`, `editor`, `author` and `contributor`. |
| `Extensions already booted.` | Internal: something called `ExtensionManager::boot()` twice. |
| `Plugins\Notices\NoticesProvider is not attached to a package.` | `path()`, `setting()` or `secret()` was called on a provider that Kestello did not create (for example, one you created with `new` yourself). |

## Related pages

- [Manifest](/developers/manifest): naming the provider and the namespace.
- [Events and filters](/developers/events): what to put in `boot()`.
- [Migrations](/developers/migrations): what runs on activate and upgrade.
- [Permissions](/developers/permissions): capabilities and roles a provider declares.
- [Command line](/developers/cli): `plugin:activate`, `plugin:deactivate`, `plugin:uninstall`, `recovery:link`.
