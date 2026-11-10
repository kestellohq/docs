# Reading the registry

The Kestello registry lists the plugins and themes sites can install from **Plugins → Add new**. Every site keeps its own checked copy of it. A plugin or theme can read that copy through `$cms->registry()`: to show a directory of packages, an organisation's page or a list of security advisories. Read this page when your plugin shows what is in the registry. To get a package listed, see [Packaging and signing](/developers/packaging).

The reader shows what the site would install. It reads the copy the site has already fetched and checked, never a publisher's server, and it decides nothing about trust: installing still goes through the same review as an uploaded zip.

## Read packages

```php
$registry = $cms->registry();

foreach ($registry->packages('plugin') as $package) {
    echo $package['name'], ' ', $package['stable'];
}

$events = $registry->package('events');   // null when the registry doesn't list it
```

| Method | Returns |
|---|---|
| `status()` | Where the site's copy stands: `enabled`, `usable`, `checked_at`, `expires_at`, `packages` and `error`, the reason it can't be used. |
| `refresh()` | Fetches the registry's list now and checks it, then returns `status()`. On failure the previous copy stays in use. |
| `packages(?string $type = null)` | Every free package, or every `plugin` or `theme`, sorted by name. |
| `package(string $slug)` | One free package in full, or `null`. |
| `organisations()` | Every organisation, sorted by name: `id`, `name` and `verified`, the domain it proved it holds. |
| `organisation(string $id)` | One organisation with `homepage` and the slugs of its `packages`, or `null`. |
| `advisories()` | Every security advisory, newest first. |
| `categories()` | Category id => label in the site's language, such as `Shops and payments` for `commerce`. A category Kestello doesn't know yet is labelled with its id. |

A package in `packages()` has `slug`, `type`, `name`, `summary`, `organisation`, `categories`, `icon`, `stable` and `prerelease` (the newest versions), `requires_core` and `updated_at`. `package()` adds:

| Key | Holds |
|---|---|
| `description_html` | The description as safe HTML. |
| `license`, `homepage`, `support`, `source` | As the publisher gave them; the addresses can be `null`. |
| `screenshots` | A list of `url` and `caption`. |
| `versions` | Newest first: `version`, `prerelease`, `released_at`, `requires` (`core`, `php`, `extensions`), `dependencies`, `permissions` (what the version may do, as in its [manifest](/developers/manifest#permissions)), `notes_html`, `size`, and `withdrawn`, with `at` and `reason`, for a version the registry withdrew. |
| `advisories` | The package's security advisories, newest first. |

Times are Unix timestamps.

## What the reader keeps out

- **Images from publishers.** Descriptions and release notes come as HTML without images, and links in them carry `rel="nofollow ugc"`. `icon` and screenshot addresses point to the registry's own copies, so showing them tells no publisher who is looking.
- **Paid packages.** They are left out until sites can buy them.

## When the registry can't be read

With the registry turned off (`'enabled' => false` in the site's `config/registry.php`) or before the site has a usable copy, the lists are empty and `status()` says why. Show that state rather than an empty page.

`package()`, `organisation()` and `advisories()` may have to fetch a file the registry's list names. They throw `Kestello\Cms\Package\Registry\RegistryException` when that file can't be fetched or doesn't match the list. The message says what went wrong, in words an administrator can act on.

## Keep your own copy up to date

Sites fetch the registry's list every `app.updates.check_every` hours (12 by default). A plugin that keeps its own copy, in its tables or a cache, listens for `RegistryRefreshed`. It names what changed, so the plugin updates only that:

```php
use Kestello\Cms\Events\RegistryRefreshed;

$cms->events->on(RegistryRefreshed::class, function (RegistryRefreshed $e) use ($cms): void {
    foreach ($e->packages as $slug) {
        $package = $cms->registry()->package($slug);   // null: no longer listed
        // update or remove your copy of $slug
    }
});
```

The event is not dispatched when a refresh fails or the list is the same. Its properties are in the [hook reference](/developers/hooks#registryrefreshed).
