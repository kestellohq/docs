<script setup>
const owners = [
    { title: 'Yours, never touched by updates', tone: 'brand', items: ['`bin/`', '`public/`', '`config/`', '`storage/`'] },
    { title: 'Replaced one package at a time', items: ['`content/plugins/<slug>/`', '`content/themes/<slug>/`'] },
    { title: 'Replaced by core updates', tone: 'muted', items: ['`core/releases/<version>/`', '`core/current.php`'] },
];
const precedence = [
    { title: 'Environment variables', text: 'Such as KESTELLO_CACHE_DRIVER. Locked in the admin.', tone: 'brand' },
    { title: 'The site’s config/', text: 'Such as config/platform.php. Locked in the admin.' },
    { title: 'System → Infrastructure', text: 'What an administrator saved, compiled to storage/framework/platform.php.' },
    { title: 'Core’s defaults', text: 'core/config/ in the running release.', tone: 'muted' },
];
</script>

# Folders and files

A Kestello site and the Kestello development repository have almost the same layout. This page explains each folder, who writes to it, and whether updates touch it.

## A site

```text
site/
├── bin/cms                 command line entry point
├── config/                 the site's configuration (written by the installer)
├── content/
│   ├── plugins/<slug>/     installed plugins
│   ├── themes/<slug>/      installed themes
├── core/
│   ├── current.php         names the running release, e.g. return '0.2.0';
│   └── releases/<version>/ Kestello itself, one folder per release
├── public/
│   ├── index.php           web entry point
│   └── .htaccess
├── storage/                everything Kestello writes at run time
└── .htaccess               for hosts whose document root cannot be public/
```

| Folder | Written by | Touched by updates |
|---|---|---|
| `bin/`, `public/` | Nobody after installation. Both entry points only find the running core release and hand over to it. | No |
| `config/` | The installer, `key:generate`, and you. | No |
| `content/plugins/`, `content/themes/` | Installs and updates of plugins and themes. | Only the package being updated |
| `core/` | Core updates: a new folder under `releases/`, then `current.php` is switched. | Yes, and only this |
| `storage/` | Kestello at run time. | No |

<Compare :columns="owners" caption="Which folders an update replaces" />

A development checkout has no `core/current.php`. Without it, the entry points load `core/` directly, which is what you want while working on Kestello itself.

### `config/`

| File | Holds |
|---|---|
| `app.php` | Site name, address, timezone, debug mode, the secret key, and optional sections such as `packages` and `updates`. |
| `database.php` | The database connection. |
| `installed.php` | The date and version of installation. Its presence is what tells Kestello the site is installed. |
| `platform.php` | Optional. Infrastructure settings you want fixed in a file (see below). |
| `cron.php`, `queue.php`, `auth.php`, `audit.php` | Written by the installer with every option at its default and a comment on each. `php bin/cms config:publish` adds the ones that are missing. |
| Any other group | Optional. `config/<group>.php` changes core's defaults for that group key by key, such as `config/storage.php` or `config/registry.php`. See the [configuration reference](/developers/configuration). |

Sites installed with early versions may also have a `cache.php`. Nothing reads it any more: the cache store is an infrastructure setting like the others, and the file can be deleted.

Core's defaults live in `core/config/` inside each release. For infrastructure settings (the drivers for the cache, sessions, the queue and search; plugins can add more) there are four layers, and the first one that sets a value wins:

1. environment variables, such as `KESTELLO_CACHE_DRIVER`,
2. files in the site's `config/`, such as `config/platform.php`,
3. what an administrator saved under **System → Infrastructure**,
4. core's defaults.

<Layers :layers="precedence" caption="Where an infrastructure setting comes from: the highest layer that sets it wins" />

A value set in an environment variable or a config file shows as locked in the admin, with its source.

The database connection and the secret key are read before the database is, so they come only from `config/database.php` and `config/app.php`. To keep them out of the files, read environment variables inside those files with `getenv()`; see the [configuration reference](/developers/configuration). Kestello then leaves `config/app.php` alone when general settings are saved in the admin, instead of writing the file back.

### `storage/`

The folder can live elsewhere: set `KESTELLO_STORAGE` to its path (see [Environment variables](/developers/configuration#environment-variables)).

| Folder | What is in it |
|---|---|
| `storage/app/` | The local storage disks: `media` (the media library, served at `/uploads`), `public` (served at `/files`), `private` and `backups`. |
| `storage/cache/` | The file cache. Safe to delete. |
| `storage/compiled/` | Compiled files. Safe to delete. |
| `storage/database/` | SQLite databases, when SQLite is used. |
| `storage/fonts/` | Web fonts the site serves itself (downloaded once from the theme builder). |
| `storage/forms/` | Files visitors attached to form submissions, kept privately and downloaded from **Submissions**. |
| `storage/framework/` | Run-time state: maintenance mode, locks, rate limits, the compiled platform settings and saved page HTML. |
| `storage/logs/` | Log files. |
| `storage/plugins/` | Files plugins keep. |
| `storage/registry/` | The site's checked copy of the [plugin and theme registry](/developers/registry). |
| `storage/sessions/` | Session files, when sessions are stored on disk. |
| `storage/tmp/` | Uploads waiting for review, staged packages. Cleaned automatically. |

## A plugin

```text
content/plugins/acme-events/
├── plugin.json                 manifest: name, version, requirements, permissions
├── src/                        PHP classes, autoloaded from the declared namespace
│   └── EventsProvider.php      the service provider named in plugin.json
├── database/migrations/        migrations, run on activation and on upgrade
├── resources/js/
│   ├── pages/                  Vue page components: @acme-events/<Name>
│   └── components/
├── assets/build/               built Vue output (committed, shipped in the package)
└── vite.config.js              build settings for the plugin's components
```

The [`hello` example plugin](https://github.com/kestellohq/examples/tree/main/plugins/hello) uses every part of this layout: a route, a Vue page, a migration, an API endpoint, an event listener, a command, a background job and admin screens. The `catalog` plugin next to it adds `templates/`, `patterns/` and `tests/`.

## A theme

```text
content/themes/acme/
├── theme.json                  manifest; may name a parent theme
├── styles.json                 design tokens: colours, fonts, spacing
├── src/                        PHP, if the theme has a provider
├── resources/js/               page and block components
├── patterns/                   ready-made block arrangements
├── assets/                     fonts, images, built output
└── tools/                      build helpers (not needed at run time)
```

A child theme (the [`base-child` example](https://github.com/kestellohq/examples/tree/main/themes/base-child)) names its parent in `theme.json` and only contains what it changes.

## The development repository

The repository is a site with a few extra folders:

| Folder | What it is |
|---|---|
| `core/` | Kestello itself, run directly (no `current.php`). |
| `core/src/` | PHP, namespace `Kestello\`: `Framework/`, `Contracts/`, `Support/`, `Cms/` (the modules). |
| `core/resources/js/` | The admin app (`app/`), pages, layouts, `@kestello/ui` (`ui/`) and `@kestello/sdk` (`sdk/`). |
| `core/resources/assets/build/` | Built front-end files. Not committed: `npm run build` makes them in a checkout, and the release workflow puts them in every release zip, so servers never need Node.js. |
| `core/build/` | The Vite build scripts. |
| `core/ssr/` | The optional server-side rendering process. |
| `core/database/migrations/` | Core migrations. |
| `docker/`, `docker-compose.yml` | The local development environment. |
| `tests/` | The test suite. |

Example plugins and themes are in [kestellohq/examples](https://github.com/kestellohq/examples), first-party plugins such as Meilisearch, Typesense and Social Login in [kestellohq/plugins](https://github.com/kestellohq/plugins), and this documentation in [kestellohq/docs](https://github.com/kestellohq/docs).
