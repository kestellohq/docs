# Manifest: plugin.json and theme.json

Every plugin has a `plugin.json` and every theme a `theme.json` in its root folder. The manifest names the package, says which versions of Kestello and PHP it runs on, what it depends on, where its PHP code lives, and what it is allowed to do. This page lists every key Kestello reads, with the rules it checks. Read it when you write a manifest by hand, when a package is refused with `Invalid plugin.json`, or before you publish a package.

Validation is strict on purpose. A package whose manifest is invalid is never loaded, so it cannot half work. The rules on this page come from `Kestello\Cms\Extension\Manifest`.

## A full example

```json
{
    "slug": "acme-events",
    "name": "Acme Events",
    "version": "1.4.0",
    "description": "Event listings with tickets from the Acme box office.",
    "author": { "name": "Acme Studio" },
    "homepage": "https://acme.test/events",
    "requires": {
        "core": "^0.1",
        "php": ">=8.4",
        "extensions": ["intl"]
    },
    "dependencies": { "notices": "^0.1" },
    "conflicts": ["old-events"],
    "namespace": "Acme\\Events\\",
    "provider": "Acme\\Events\\EventsProvider",
    "replaces": [],
    "permissions": {
        "network": ["api.acme.test", "*.tickets.acme.test"]
    }
}
```

This file lives at `content/plugins/acme-events/plugin.json`. The folder name must be the slug.

## Keys

| Key | Type | Required | Rules |
|---|---|---|---|
| `slug` | string | yes | Lowercase letters and digits, words joined by single dashes, at most 64 characters: `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Must equal the folder name. |
| `name` | string | yes | Shown in the admin. Any non-empty string. |
| `version` | string | yes | Semantic version (`1.4.0`, `2.0.0-beta.1`). A leading `v` is accepted and dropped. |
| `description` | string | no | Shown on the **Plugins** screen and before installing. |
| `requires.core` | string | yes | Version constraint for Kestello (see below). |
| `requires.php` | string | no | Version constraint for PHP. |
| `requires.extensions` | list of strings | no | PHP extensions that must be loaded, such as `intl` or `gd`. Compared case-insensitively. |
| `dependencies` | object | no | Other plugins this one needs: `{ "slug": "constraint" }`. A package cannot depend on itself. |
| `conflicts` | list of strings | no | Plugin slugs that cannot be active at the same time. |
| `namespace` | string | no | The PHP namespace of the `src/` folder, such as `Acme\\Events\\`. A missing trailing backslash is added. |
| `provider` | string | no | The provider class. Must be inside `namespace`. |
| `parent` | string | no (themes only) | The slug of the parent theme. Ignored in `plugin.json`. |
| `stylesheets` | list of strings | no | Stylesheets added to pages (used by themes). |
| `replaces` | list of strings | no | The contracts this package rebinds in the container, as class names. |
| `permissions` | object | no | What the package does that the site owner should know about. |
| `author` | string, or object with `name` | no | Shown on the **Plugins** screen. |
| `homepage` | string | no | Returned by the plugins API (`GET /api/v1/plugins`) when it starts with `https://`. Other values are ignored. |

Kestello keeps the whole decoded file, so you may add keys of your own (for example `"license"`). Unknown keys are not an error.

### `slug`

The slug is the package's identity. It decides:

| Derived from the slug `acme-events` | Value |
|---|---|
| Folder | `content/plugins/acme-events/` |
| Execution owner (logs, blame) | `plugin:acme-events` |
| Table prefix | `p_acme_events_` (themes: `t_acme_events_`) |
| Settings prefix | `plugin.acme-events.` (themes: `theme.acme-events.`) |
| Capabilities | `acme-events.*` |
| Token scopes | `acme-events:*` |
| API paths | `/api/v1/acme-events/...` |
| Admin pages | `/admin/p/acme-events/...` |
| Vue components | `@acme-events/...` |
| Scheduled task names | `acme-events.*` or `acme-events:*` |
| Assets URL | `/assets/plugins/acme-events/...` |

Dashes become underscores in the table prefix. Changing the slug of a released plugin makes it a different plugin: its tables, settings and grants stay with the old slug.

### `version`

Kestello compares the version in the file with the version recorded when the plugin was activated. When the two differ, the next request runs the new migrations and the provider's `upgrade()` hook. Raise the version every time you ship a change, or sites will not run your new migrations.

### Version constraints

`requires.core`, `requires.php` and every value in `dependencies` use the same syntax:

| Constraint | Matches |
|---|---|
| `1.2.3`, `=1.2.3` | Exactly 1.2.3 |
| `>1.2`, `>=1.2.0`, `<2`, `<=2.1`, `!=1.5.0` | Comparisons |
| `^1.2` | 1.2.0 up to, not including, 2.0.0 |
| `^0.3` | 0.3.0 up to, not including, 0.4.0 |
| `~1.2` | 1.2.0 up to, not including, 1.3.0 |
| `~1` | 1.0.0 up to, not including, 2.0.0 |
| `1.2.*`, `1.x` | Any 1.2 release, any 1 release |
| `*` | Anything |
| `>=1.2 <2.0`, `>=1.2, <2.0` | Both (space or comma means AND) |
| `^1.0 \|\| ^2.0` | Either (OR) |

Pre-releases (`1.0.0-beta.1`) sort before their release. In `dependencies` that is strict: `^2.0` does not match `2.0.0-beta.1`. For `requires.core` a pre-release of Kestello counts as the version it leads to, so a plugin with `^0.1` runs on `0.1.0-rc.1` too and site owners can try a release candidate with their plugins.

Use `^0.<minor>` before Kestello 1.0, since minors may break, and `^<major>.0` after. That is what `make:plugin` writes. `plugin:check` warns when `requires.core` is `*`.

A development checkout of Kestello (version `dev`) satisfies every `requires.core`.

### `dependencies` and `conflicts`

Before plugins boot, Kestello checks each active plugin against the running Kestello and PHP versions, the loaded extensions, its dependencies and its conflicts. A plugin that cannot run is left out, and so is every plugin that depends on it. The reason is shown on the **Plugins** screen, for example `requires plugin "notices" ^0.1 (not active)`.

- Dependencies boot first. Plugins load in dependency order, ties broken by slug.
- Activating a plugin whose dependency is not active fails with `Cannot activate "acme-events":` and the list of problems.
- Deactivating a plugin that another active plugin depends on fails with `Cannot deactivate "notices": required by acme-events.`
- A conflict counts in both directions: if either manifest lists the other, they cannot run together.
- A dependency cycle is refused at activation with `Dependency cycle: a → b → a`.

Dependencies are between plugins only. A theme cannot be a dependency.

### `namespace` and `provider`

Kestello autoloads the namespace from the package's `src/` folder with PSR-4 rules: `Acme\Events\Api\ListEvents` is `src/Api/ListEvents.php`. Only that one namespace is mapped.

- It must be a valid PHP namespace whose parts start with a capital letter: `^[A-Z][A-Za-z0-9_]*(\\[A-Z][A-Za-z0-9_]*)*\\$`.
- It must not start with `Kestello\`, which is reserved for core.
- `provider` must start with the namespace. The class must exist and extend `Kestello\Cms\Extension\Provider` (plugins use `PluginProvider`, themes `ThemeProvider`).
- `plugin:check` reports a PHP file that declares a namespace outside the declared one.

In JSON, each backslash is written twice: `"Acme\\Events\\"`.

A package without a `provider` is allowed. A theme made only of Vue components and `styles.json` needs neither key.

### `parent` (themes)

A child theme names its parent: `"parent": "base"`. The parent must be installed for the child to activate (`parent theme "base" is not installed`). The chain is at most three themes deep. A theme that cannot be used, or whose parent is broken, makes the site fall back to the default theme `base`. See [Themes](/developers/themes).

### `stylesheets`

A list of `.css` files added to every page rendered in the theme. Each entry is either a site path starting with `/` (`/assets/css/site.css`) or a path inside the package's `assets/` folder (`css/theme.css`). Paths may not contain `..`. `plugin:check --theme` reports an entry that does not exist under `assets/`.

### `replaces`

The contracts the package rebinds, as class names, for example `["Kestello\\Contracts\\Mail\\Transport"]`. The `mail-log` example plugin uses it. The list is shown to the site owner before installing. It does not do the rebinding: the provider does that in `register()`.

### `updates`

Where new versions of the package are published. Without it, the package is updated by uploading a zip. With it, sites look for new versions every 12 hours (`app.updates.check_every`) and offer them on **Site → Updates**. See [Publish updates](/developers/packaging#publish-updates).

```json
"updates": { "github": "acme/events" }
```

```json
"updates": { "url": "https://updates.acme.test/kestello/acme-events.json", "license": true }
```

| Key | Rules |
|---|---|
| `github` | A GitHub repository, `owner/name`. Its releases are the versions. Takes no `license`. |
| `url` | An `https` address on port 443, with no user name, password or `#fragment`: your update feed. |
| `license` | `true` when the feed needs a license key. The site's administrator enters it; Kestello sends it only to the feed's host. Default `false`. |

Exactly one of `github` and `url`. Any other key is refused.

### `signing_keys`

Key ids (16 hexadecimal characters, as `package:keygen` prints them) that may sign the next versions of this package, besides the key that signed this one. Sites refuse an update from the admin unless the key that signed the installed version, or one it listed here, signed it. List your new key here in a release signed with your old key before you switch keys. At most 10.

```json
"signing_keys": ["3f8a1c0d9b7e6a52"]
```

### `permissions`

`permissions` is an object of lists. It is shown to the site owner before the package is installed, on the **Plugins** screen and by `plugin:install`. Where Kestello can enforce a permission at run time, it does:

| Key | Values | Enforced |
|---|---|---|
| `network` | Host names the package may call, such as `api.github.com`. `*.example.com` matches any subdomain of `example.com`, not `example.com` itself. | Yes. The core HTTP client refuses any other host when the call comes from the package's code: `plugin:acme-events may not contact maps.example.org: add it to "permissions.network" in the manifest.` |
| `auth` | `["authenticator"]` to add a sign-in method. | Yes. Without it, `$cms->auth->authenticator()` throws `plugin:acme-events must declare "permissions": {"auth": ["authenticator"]} in its manifest to add a sign-in method.` |
| `users` | For example `["create", "link-identities"]`. | No, disclosure only. |
| `mail` | For example `["intercept"]`. | No, disclosure only. |

Other keys are allowed and shown as they are. The `plugin.json` of the [Social Login plugin](https://github.com/kestellohq/plugins/tree/main/social-login) is a complete example:

```json
"permissions": {
    "network": ["accounts.google.com", "oauth2.googleapis.com", "www.googleapis.com", "openidconnect.googleapis.com", "github.com", "api.github.com"],
    "auth": ["authenticator"],
    "users": ["create", "link-identities"]
}
```

`plugin:check` warns about `curl_init()`, `curl_exec()`, `fsockopen()` and `stream_socket_client()` because they bypass the HTTP client and with it the `network` list.

## theme.json

A theme manifest uses the same keys. In practice it is shorter. The default theme:

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

A child theme:

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

Theme tables use the prefix `t_<slug>_`. Leave `dependencies` out of `theme.json`: a theme is checked on its own, without the list of active plugins, so any dependency counts as not active and the site falls back to `base`.

## If something goes wrong

All validation errors are reported together, in one message:

```text
Invalid content/plugins/x/plugin.json:
  - slug is required: lowercase letters, digits and single dashes, max 64 chars
  - version is required and must be semver (e.g. 1.0.0)
  - requires.core is required and must be a version constraint (e.g. "^1.0")
  - namespace must not be inside Kestello\ (reserved for core)
  - provider must be a class inside the declared namespace
```

| Message | What it means |
|---|---|
| `Missing plugin.json in <folder>.` | The folder (or the root of the zip) has no manifest. |
| `<file> is not valid JSON: ...` | A syntax error, often a single backslash in `namespace`. Write `\\`. |
| `<file> must contain a JSON object.` | The file holds a list or a plain value. |
| `directory name "acme_events" must match slug "acme-events"` | Rename the folder, or fix the slug. |
| `name is required` | `name` is missing or empty. |
| `requires.php must be a version constraint` | The PHP constraint does not parse. |
| `requires.extensions must be a list of extension names` | Use a JSON list of strings. |
| `dependencies must be an object of slug: constraint` | `dependencies` is a string or a number. Use `{ "notices": "^0.1" }`. |
| `dependencies.<slug> must be a valid slug with a version constraint` | A key is not a valid slug or a value does not parse. A JSON list such as `["notices"]` gives `dependencies.0 must be ...`. |
| `a package cannot depend on itself` | Remove the package's own slug from `dependencies`. |
| `conflicts must be a list of slugs` | Use a JSON list of strings. |
| `namespace must be a valid PHP namespace (e.g. "Acme\\Seo\\")` | A part starts with a lowercase letter or digit, or contains other characters. |
| `parent must be the slug of another theme` | `parent` is not a valid slug, or is the theme's own slug. |
| `replaces must be a list of contract names` | Use a JSON list of strings. |
| `permissions must be an object` | `permissions` is a string or a number. Use `{}` when there are none. |
| `stylesheets must be a list` | Use a JSON list. |
| `stylesheets entries must be .css paths ("/assets/…" or relative to assets/)` | An entry does not end in `.css`, contains `..`, or has other characters. |
| `requires Kestello ^0.2 (running 0.1.0)` | Shown on the **Plugins** screen: the package does not accept this Kestello version. |
| `requires the PHP extension "intl"` | The extension is not loaded on this server. |
| `conflicts with plugin "old-events"` | Both are active. Deactivate one. |
| `Provider class Acme\Events\EventsProvider not found in <folder>/src.` | The class file is missing or not at the PSR-4 path. |
| `Acme\Events\EventsProvider must extend Kestello\Cms\Extension\Provider.` | The provider class extends something else. |

## Related pages

- [Providers](/developers/providers): what the `provider` class does.
- [Permissions](/developers/permissions): capabilities and token scopes, which are not part of the manifest.
- [Packaging](/developers/packaging): signed zips and how the manifest is checked on install.
- [Themes](/developers/themes): `theme.json`, parent themes and `styles.json`.
