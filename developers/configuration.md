# Configuration

This page lists every setting Kestello reads from files in `config/` and from environment variables, with its type, default and effect. Use it when you set up a server, pin infrastructure for a host, or need to know why a value in the admin is locked. For the folders themselves, see [Folders and files](/developers/layout); for running a site in production, see [Deployment](/developers/deployment).

## How configuration is loaded

Configuration files are plain PHP files that return an array. The file name is the first part of the key: `config/app.php` holds `app.*`, `config/storage.php` holds `storage.*`, `config/cron.php` holds `cron.*`, and so on.

Kestello reads two folders for each group:

1. `core/config/<group>.php` inside the running release: core's defaults. Never edit these on a site; a core update replaces them.
2. `config/<group>.php` in the site's root folder: your values.

The site file is merged over the core file key by key (`array_replace_recursive`), so you only write the keys you change.

The installer writes `config/app.php` and `config/database.php`, and also `config/cron.php`, `config/queue.php`, `config/auth.php` and `config/audit.php` with every option at its default and a comment on each, so you can see what there is to change without opening this page. Sites installed before these files existed can add them with `php bin/cms config:publish`. Neither the installer nor that command overwrites a file that is already there. A group is loaded the first time one of its keys is read. A group with no file in either folder is empty, and every key in it has the default written in the code that reads it. Those defaults are the ones in the tables below.

```php
<?php
// config/cron.php: the whole file. Every other cron.* key keeps its default.

declare(strict_types=1);

return [
    'web_runner' => false,
];
```

::: warning
A group belongs to its own file. `cron.web_runner` is read from `config/cron.php`. Writing `'cron' => [...]` inside `config/app.php` creates `app.cron.web_runner`, which nothing reads.
:::

### Where values come from

There are two kinds of settings, and they are layered differently.

**Infrastructure settings** (the drivers for cache, sessions, the queue and search) have four layers. The first layer that sets a value wins:

| Order | Layer | Where |
|---|---|---|
| 1 | Environment | `KESTELLO_<SUBSYSTEM>_DRIVER`, `KESTELLO_<SUBSYSTEM>_<OPTION>` |
| 2 | Config file | `config/platform.php` |
| 3 | Admin | **System → Infrastructure**, stored in the database and compiled to `storage/framework/platform.php` |
| 4 | Core defaults | `core/config/platform.php`, then the driver's own option defaults |

A value from layer 1 or 2 is locked in the admin, which shows where it comes from. See [Infrastructure: `config/platform.php`](#infrastructure-config-platform-php).

**Everything else** (`app.*`, `database.*`, `storage.*`, `cron.*` and the other groups) has two layers: the site's `config/` file over core's defaults. There is no automatic environment layer for these keys, with one exception (`KESTELLO_SSR_URL`, below). Because config files are PHP, you can read the environment yourself:

```php
<?php
// config/database.php

declare(strict_types=1);

return [
    'driver' => 'mysql',
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'port' => 3306,
    'database' => 'kestello',
    'username' => 'kestello',
    'password' => getenv('DB_PASSWORD') ?: '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];
```

::: tip
PHP-FPM clears the environment of its workers by default (`clear_env = yes`). Pass the variables you need with `env[DB_PASSWORD] = ...` lines in the pool configuration, or set `clear_env = no`. The command line (`bin/cms`, cron, queue workers) sees the shell's environment, so set the variables in both places.
:::

A few `app.*` values are also edited in the admin under **Site → Settings**, on the **General** tab: **Site name**, **Tagline**, **Site address** and **Timezone**. Saving that tab stores them in the database and writes them back into `config/app.php` as `app.name`, `app.description`, `app.url` and `app.timezone`, if that file is writable and holds only plain values. A file with code in it (`getenv()`, `$_ENV`, `define()`, functions, `require`) is left alone. When the file is not written, the database copy is what pages, emails and the API show, and `config/app.php` keeps its older values.

## `config/app.php`

The installer writes this file with `name`, `description`, `url`, `timezone`, `debug` (set to `false`) and a fresh `secret_key`. Add the other keys as you need them.

### Site

| Key | Type | Default | Meaning |
|---|---|---|---|
| `app.name` | string | `'Kestello'` | The site name, used when the **Site name** setting is empty. |
| `app.description` | string | `''` | One sentence about the site. |
| `app.url` | string | `''` | The public address, such as `https://example.com`. Used for absolute links, signed file URLs, the sitemap, and as the address the update health check calls when `app.updates.health_url` is not set. Set it correctly on every server. |
| `app.timezone` | string | `'UTC'` | A PHP timezone identifier, such as `Europe/Berlin`. |
| `app.locale` | string | `'en'` | The language of the admin and the site. Language packs live in `core/resources/lang` and in a plugin's or theme's `resources/lang`. |
| `app.fallback_locale` | string | `'en'` | The language used when a string is missing from `app.locale`. |
| `app.debug` | bool | `false` | Shows full error pages with stack traces and turns the page cache off unless it is turned on under **Site → Settings → Performance**. Never `true` on a public site. |

### Security and sessions

| Key | Type | Default | Meaning |
|---|---|---|---|
| `app.secret_key` | string | `''` | The site's secret: 64 hexadecimal characters written by the installer or `key:generate`. It encrypts stored secrets (SMTP and driver passwords, plugin secrets, two-step sign-in secrets) and signs recovery links. Without it, secrets cannot be saved. |
| `app.previous_keys` | list of strings | `[]` | Older secret keys, still used to decrypt values stored before a key change. `key:generate` moves the current key here (it keeps up to 5); `key:generate --forget-old` does not. |
| `app.trusted_proxies` | list of strings | `[]` | IP addresses or CIDR ranges (IPv4 and IPv6) of reverse proxies allowed to set `X-Forwarded-For`. See [Trusted proxies](#trusted-proxies). |
| `app.secure_cookies` | bool or null | not set | Forces the `Secure` flag on the session cookie on (`true`) or off (`false`). When not set, the flag is on when PHP sees HTTPS (`$_SERVER['HTTPS']` or port 443), or when a proxy listed in `app.trusted_proxies` sends `X-Forwarded-Proto: https`. Set it to `true` behind a proxy that ends TLS and sends no `X-Forwarded-Proto`. |
| `app.session_lifetime` | int | `7200` | Seconds a session stays valid without activity. Values below `300` are raised to `300`. Also used by the hourly `sessions.gc` task. |

### Packages

These control which plugin and theme packages the admin accepts. See [Packaging](/developers/packaging) for building and signing them.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `app.packages.trusted_keys` | list | `[]` | Publishers whose signed packages may be installed from the admin. Each entry is `['name' => 'Acme Plugins', 'public_key' => '<base64 Ed25519 public key>']`. `package:keygen` prints the line to add. An entry whose `public_key` is not a base64 Ed25519 key is ignored and logged. |
| `app.packages.admin_unsigned` | bool | `false` | Lets the admin install unsigned packages too. For development sites. The command line (`plugin:install`, `theme:install`) installs unsigned packages whatever this says, because whoever runs it can change the code anyway. |

```php
'packages' => [
    'trusted_keys' => [
        ['name' => 'Acme Plugins', 'public_key' => 'mS0e8bCq1z3WkqH6v2bE0Yx1p9ZtNw4uT7cR5aJ2LfQ='],
    ],
    'admin_unsigned' => false,
],
```

### Updates

Every update of a plugin, theme or Kestello itself checks the site after the new files are in place, and rolls back when the check fails. These keys choose how that check runs. See [Updates](/guide/updates).

| Key | Type | Default | Meaning |
|---|---|---|---|
| `app.updates.health` | string | `'auto'` | `auto`: a fresh PHP process when `proc_open` works, otherwise an HTTP request. `process`: always the PHP process. `http`: always the HTTP request. |
| `app.updates.php` | string or null | `null` | The PHP command line binary for the process check, such as `/usr/bin/php8.5`. `null` finds it from the running PHP. |
| `app.updates.health_url` | string or null | `null` | The address at which the server can reach its own site for the HTTP check. `null` uses `app.url`. Set it when the server cannot reach its public address, for example `http://127.0.0.1`. |
| `app.updates.check_every` | int | `12` | Hours between checks of the update sources plugins and themes name (`updates` in their manifest). `0` turns the scheduled check off; **Check now** still works. |
| `app.updates.prereleases` | bool | `false` | Also offer plugin and theme pre-releases, such as `1.3.0-beta.1`. |

### Server-side rendering

| Key | Type | Default | Meaning |
|---|---|---|---|
| `app.ssr.url` | string or null | `getenv('KESTELLO_SSR_URL') ?: null` | The address of the SSR process (`core/ssr/server.mjs`), such as `http://127.0.0.1:13714`. It must be an `http` or `https` address; anything else is ignored, and redirects from it are not followed. `null` renders pages in the browser only. See [Frontend](/developers/frontend). |
| `app.ssr.timeout` | float | `1.5` | Seconds to wait for the SSR process before falling back to rendering in the browser. |

The environment variable is read by core's default file. If the site's `config/app.php` sets `ssr.url`, that value wins over the variable.

### A complete example

```php
<?php

declare(strict_types=1);

return [
    'name' => 'Acme',
    'description' => 'Garden tools since 1952',
    'url' => 'https://acme.example',
    'timezone' => 'Europe/Berlin',
    'debug' => false,
    'secret_key' => '3f8a...64 hexadecimal characters...',
    'previous_keys' => [],
    'trusted_proxies' => ['10.0.0.0/8'],
    'secure_cookies' => true,
    'packages' => [
        'trusted_keys' => [],
        'admin_unsigned' => false,
    ],
    'updates' => [
        'health' => 'auto',
        'php' => null,
        'health_url' => 'http://127.0.0.1',
    ],
    'ssr' => [
        'url' => 'http://127.0.0.1:13714',
        'timeout' => 1.5,
    ],
];
```

## Kestello releases: `config/release.php`

Where Kestello's own updates come from. The defaults are in `core/config/release.php`; a site's `config/release.php` changes any of them. See [Packaging and signing](/developers/packaging#where-sites-get-releases).

| Key | Type | Default | Meaning |
|---|---|---|---|
| `release.repository` | string | `'kestellohq/cms'` | The GitHub repository whose releases are Kestello versions, as `owner/name`. |
| `release.check_every` | int | `12` | Hours between scheduled checks. `0` turns them off; **Check now** and `core:check` still work. |
| `release.prereleases` | bool | `false` | Also offer pre-releases, such as `1.6.0-beta.1`. For test sites. |
| `release.keys` | list | official keys | The public keys official releases are signed with: `['name' => 'Kestello releases', 'public_key' => '<base64>']`. Trusted for core releases only, never for plugins. |

## `config/database.php`

The installer writes this file. Kestello reads it before anything else that needs the database, so the connection can only come from this file (which may call `getenv()`, as shown above). It is not an infrastructure setting and cannot be changed in the admin.

| Key | Type | Default | Meaning |
|---|---|---|---|
| `database.driver` | string | `'mysql'` | `mysql` (MySQL and MariaDB), `pgsql` or `sqlite`. |
| `database.host` | string | `'127.0.0.1'` | Server host. MySQL and PostgreSQL. |
| `database.port` | int | `3306` for MySQL, `5432` for PostgreSQL | Server port. |
| `database.database` | string | `''` | Database name. For SQLite, the path to the file: a relative path is taken from the site's root folder (the installer writes `storage/database/<name>.sqlite`). An empty value on SQLite means an in-memory database. |
| `database.username` | string | none | Database user. |
| `database.password` | string | none | Database password. |
| `database.charset` | string | `'utf8mb4'` | MySQL connection character set. |
| `database.collation` | string | `'utf8mb4_unicode_ci'` | MySQL connection collation. |
| `database.schema` | string | not set | PostgreSQL `search_path`. The installer writes `'public'`. |
| `database.sslmode` | string | not set | PostgreSQL `sslmode`, such as `require` or `verify-full`. |
| `database.busy_timeout` | int | `5000` | SQLite: milliseconds to wait for a locked database. |

SQLite files on disk are opened with WAL journaling and foreign keys on.

## Infrastructure: `config/platform.php`

This file pins infrastructure drivers so the admin cannot change them. Each top-level key is a subsystem; inside it, `driver` names the driver and every other key is one of that driver's options. Options may also be nested under `options`.

```php
<?php
// config/platform.php

declare(strict_types=1);

return [
    'admin_editable' => false,   // lock the whole System → Infrastructure screen
    'cache' => ['driver' => 'redis', 'host' => 'redis', 'password' => getenv('REDIS_PASSWORD') ?: null, 'prefix' => 'site1:'],
    'session' => ['driver' => 'redis', 'host' => 'redis', 'database' => 1],
    'queue' => ['driver' => 'database'],
];
```

| Key | Type | Default | Meaning |
|---|---|---|---|
| `admin_editable` | bool | `true` | `false` makes **System → Infrastructure** read-only. The same as `KESTELLO_PLATFORM_LOCKED=1`. |
| `cache` | array | `['driver' => 'file']` | The cache store. Also backs locks and rate limits. |
| `session` | array | `['driver' => 'database']` | Where sessions are kept. |
| `queue` | array | `['driver' => 'database']` | Where background jobs wait. |
| `search` | array | `['driver' => 'database']` | The site search engine. Plugins add more engines. |

A layer that names a different driver than the winning one contributes nothing: its options belong to that other driver. A layer without `driver` (usual for environment variables) applies its options to whichever driver wins.

### Core drivers and their options

| Subsystem | Driver | Options | Notes |
|---|---|---|---|
| `cache` | `file` | none | Files in `storage/cache`. One server only. The default. |
| `cache` | `database` | `prefix` | The cache table. Shared by every server. |
| `cache` | `redis` | Redis options | Redis, Valkey, KeyDB, Dragonfly or a managed service. |
| `cache` | `apcu` | `prefix` | Shared memory of this server's PHP workers. Not shared with cron or other servers. Needs the `apcu` extension, enabled. |
| `cache` | `array` | none | Nothing kept between requests. Development, and the fallback when the configured store fails. |
| `session` | `database` | none | The sessions table, with the device list and remote sign-out. The default. |
| `session` | `redis` | Redis options | Sessions in Redis, with the device list and remote sign-out. |
| `session` | `file` | none | Files in `storage/sessions`. No device list. The fallback. |
| `queue` | `database` | none | The jobs table. Works everywhere, with any number of workers. The default and the fallback. |
| `queue` | `redis` | Redis options | Jobs in Redis. When Redis is unreachable, jobs go to the database queue instead of being lost. Use a Redis that persists to disk (`appendonly`). |
| `queue` | `sync` | none | Jobs run inside the request that pushes them. Development only. |
| `search` | `database` | `language` | Full-text search in the site database. `language` (default `'simple'`) is the PostgreSQL text search configuration, such as `english`. |

The Redis options, shared by every `redis` driver:

| Option | Type | Default | Meaning |
|---|---|---|---|
| `url` | string | not set | `redis://user:pass@host:6379/0` or `rediss://...`. Overrides the fields below. |
| `host` | string | `'127.0.0.1'` | Host. |
| `port` | int | `6379` | Port, `1` to `65535`. |
| `username` | string | not set | ACL user name. |
| `password` | string | not set | Password. Encrypted with `app.secret_key` when saved in the admin. |
| `database` | int | `0` | Database number, `0` to `15`. |
| `tls` | bool | `false` | Connect with TLS. |
| `timeout` | float | `2.0` | Connect timeout in seconds, `0.1` to `30`. |
| `prefix` | string | `''` | Key prefix (letters, digits, `:_.-`, up to 60 characters). Empty derives one from the site's folder (starting `kst:<hash>:`), so sites sharing one Redis never collide. |

When a configured driver cannot be built (Redis is down, an option is invalid), Kestello logs `platform: <subsystem> driver failed (...); using fallback "<driver>".` and runs that subsystem on its fallback driver, so the site keeps working. Site Health reports it.

Inspect and test the effective settings from the command line:

```bash
php bin/cms platform:show
php bin/cms platform:show cache --json
php bin/cms platform:test cache redis host=127.0.0.1
```

```text
Cache (cache)
  driver  file   [default]
  available: file, database, redis, apcu, array
Sessions (session)
  driver  database   [default]
  available: database, redis, file
```

The value in brackets is the layer the setting came from: `default`, `admin`, `file` or `env`.

### Several servers sharing a database

The admin layer is stored in the database and compiled into `storage/framework/platform.php` on the server where it was saved. Other servers keep their compiled copy until it is rebuilt, so run `php bin/cms platform:compile` on each server after a deploy or a change in the admin. With `config/platform.php` or environment variables on every server instead, there is nothing to compile. See [Deployment](/developers/deployment).

## Environment variables

These are all the environment variables Kestello reads.

| Variable | Read by | Meaning |
|---|---|---|
| `KESTELLO_<SUBSYSTEM>_DRIVER` | infrastructure, layer 1 | The driver of a subsystem: `KESTELLO_CACHE_DRIVER`, `KESTELLO_SESSION_DRIVER`, `KESTELLO_QUEUE_DRIVER`, `KESTELLO_SEARCH_DRIVER`. |
| `KESTELLO_<SUBSYSTEM>_<OPTION>` | infrastructure, layer 1 | One driver option, the option name in capitals: `KESTELLO_CACHE_HOST`, `KESTELLO_CACHE_PASSWORD`, `KESTELLO_SESSION_URL`, `KESTELLO_QUEUE_PREFIX`, `KESTELLO_SEARCH_LANGUAGE`. A hyphen in a subsystem name becomes `_`. Only options the driver declares are picked up. |
| `KESTELLO_PLATFORM_LOCKED` | infrastructure | `1`, `true`, `yes` or `on` makes **System → Infrastructure** read-only, like `admin_editable => false`. |
| `KESTELLO_SSR_URL` | `core/config/app.php` | Default for `app.ssr.url`. |
| `SSR_HOST` | `core/ssr/server.mjs` | Address the SSR process listens on. Default `127.0.0.1`. |
| `SSR_PORT` | `core/ssr/server.mjs` | Port the SSR process listens on. Default `13714`. |
| `KESTELLO_ROOT` | `core/ssr/server.mjs` | The site's root folder. The SSR process only loads built files under it. Default: the current folder. |
| `PATH` | `Kestello\Support\Process` | Searched for external programs such as image optimizers and Ghostscript. Default `/usr/local/bin:/usr/bin:/bin`. |
| `KESTELLO_TEST_DATABASES`, `KESTELLO_TEST_REDIS` | the test suite | Extra databases and a Redis URL for `bin/cms test`. See [Local development](/developers/local-development#running-the-tests). |

Any environment variable can feed a value set from the command line: `php bin/cms platform:set cache redis password=@env:REDIS_PASSWORD` reads `REDIS_PASSWORD` instead of taking the secret from the shell history. The value is then stored (encrypted) in the admin layer.

The variables in the repository's `.env` file (`APP_DEBUG`, `DB_HOST` and the rest) are read by Docker Compose to build the development containers, not by Kestello.

## Background work: `config/cron.php` and `config/queue.php`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `cron.web_runner` | `'auto'`, bool | `'auto'` | Runs due scheduled tasks (and with them queued jobs) after a page has been sent to a visitor, for hosts without cron. `auto`: only while no real cron or external pinger has run in the last 5 minutes. `true`: always. `false`: never. Needs PHP-FPM or LiteSpeed, so the visitor is not kept waiting, and runs at most once a minute. |
| `cron.web_runner_seconds` | int | `20` | How long one web runner pass may work. Kept between `5` and `55`. |
| `cron.http_seconds` | int | `25` | How long one `POST /system/cron` call (from an external cron service, enabled with `cron:token`) may work. At least `5`. |
| `queue.worker` | string | `'cron'` | `cron`: the scheduler runs queued jobs every minute (task `queue.work`). `daemon`: that task is not registered, because a `queue:work` process does the work. Set `daemon` when you run workers under systemd or supervisor. |
| `queue.failed_retention_days` | int | `30` | Days failed jobs and finished batches are kept. |

```php
<?php
// config/queue.php on a server with a queue:work service

declare(strict_types=1);

return [
    'worker' => 'daemon',
];
```

## Accounts: `config/auth.php`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `auth.revoke_on_password_change` | bool | `true` | When a user's password changes, their other sessions end and all their API tokens are revoked. With `false`, sessions and tokens survive a password change. |
| `auth.password_min_length` | int | `12` | Shortest accepted password. Values below `8` are raised to `8`. |
| `auth.two_factor_roles` | list of strings | `['admin']` | Roles expected to use two-step sign-in. A user in one of these roles is told it is expected for their account. It is not enforced. |
| `auth.registration` | string | `'closed'` | Who can create an account, by email sign-up or by signing in with a provider: `closed`, `open` or `domains`. |
| `auth.registration_domains` | list or comma-separated string | `[]` | Email domains allowed to register when `auth.registration` is `domains`. |
| `auth.default_role` | string | `'user'` | Role given to accounts people create themselves. `admin` and unknown roles become `user`. |
| `auth.link_by_verified_email` | bool | `false` | Links an external sign-in to an existing account with the same verified e-mail address. |
| `auth.trust_provider_mfa` | bool | `false` | Accepts the sign-in provider's two-step check instead of asking for Kestello's. |

The last five keys are defaults: a value saved under **Site → Settings**, **Accounts** wins over the file.

## File storage: `config/storage.php`

| Key | Type | Default | Meaning |
|---|---|---|---|
| `storage.disks` | array | `[]` | Disks to add or change. Core defines `media` (`storage/app/media`, served at `/uploads`), `public` (`storage/app/public`, served at `/files`), `private` and `backups`. An entry with a different `driver` replaces the core disk; otherwise its keys are merged in. Core drivers: `local`, `s3`, `scoped`, `readonly`, `mirror`, `cached`. |
| `storage.sendfile` | string or null | `null` | `x-accel-redirect` (nginx) or `x-sendfile` (Apache) to let the web server send private files. `null`: PHP streams them. |
| `storage.sendfile_prefix` | string | `'/protected-storage'` | The internal location the web server maps to the storage folder for `x-accel-redirect`. |

```php
<?php
// config/storage.php

declare(strict_types=1);

return [
    'disks' => [
        'backups' => [
            'driver' => 's3',
            'bucket' => 'acme-backups',
            'region' => 'eu-central-1',
            'key' => getenv('BACKUP_S3_KEY'),
            'secret' => getenv('BACKUP_S3_SECRET'),
        ],
    ],
    'sendfile' => 'x-accel-redirect',
];
```

Check a disk with `php bin/cms storage:test backups`.

### Media in an S3 bucket

Point the `media` disk at a bucket to keep uploads there. The S3 driver also takes `endpoint` and `path_style` for S3-compatible services, `url` for the public address of the files (a CDN, for example), `acl` and `direct_uploads`.

| Key | Default | Meaning |
|---|---|---|
| `acl` | `false` | `true`: Kestello makes each file public with an object ACL. `false`: the bucket policy decides what is public. |
| `direct_uploads` | `false` | `true`: browsers send files straight to the bucket instead of through your server. The bucket's CORS rules must allow `POST` from the site's address. |

With direct uploads, the browser puts the file at a private key, `incoming/<upload id>`. Kestello then checks it like any other upload and copies it to the key it chose, where it becomes public. A file that fails the checks, or an upload that is never finished, is deleted from `incoming/` and is never public.

When `acl` is `false` and the bucket policy makes files public, keep `incoming/` out of it. Otherwise an upload could be read before it is checked:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        { "Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::acme-media/*" },
        { "Effect": "Deny", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::acme-media/incoming/*" }
    ]
}
```

## Other groups

| Key | Type | Default | Meaning |
|---|---|---|---|
| `api.cors.origins` | list of strings | `[]` | Origins allowed to call the API from a browser, such as `['https://app.example.com']`. Empty turns CORS off. See [REST API](/developers/rest-api). |
| `api.cors.credentials` | bool | `false` | Allows cookies from those origins. Never combined with `'*'`. |
| `media.engine` | string or null | not set | Forces the image engine: `gd` or `imagick`. Not set, or `auto`, uses the first one available. |
| `audit.retention_days` | int | `365` | Days audit log entries are kept by the daily `audit.prune` task. |
| `notifications.read_retention_days` | int | `90` | Days read notifications are kept. |
| `notifications.retention_days` | int | `365` | Days any notification is kept. |

## Settings kept in the admin

Some settings have no config key and live only in the database, edited under **Site → Settings**:

| Tab | Settings |
|---|---|
| **Email** | From address and name, SMTP server, port, encryption, user name and password. Without an SMTP server, PHP `mail()` is used. |
| **Performance** | `page_cache` (on unless `app.debug` is `true`), `page_cache_ttl` (default `86400` seconds), `cdn_max_age` (default `0`). |
| **Media** | Upload limits, allowed file kinds, image sizes and quality. |

Plugin settings are stored the same way and can be changed with `php bin/cms plugin:config <slug>`.

## Trusted proxies

Without `app.trusted_proxies`, the client address is always the connecting address (`REMOTE_ADDR`), and `X-Forwarded-For` is ignored. That stops a visitor from spoofing their address to get around per-address rate limits and sign-in throttling.

Behind a load balancer, a CDN or a reverse proxy, list the proxies' addresses:

```php
'trusted_proxies' => ['127.0.0.1', '10.0.0.0/8', 'fd00::/8'],
```

When the connecting address is a trusted proxy, Kestello walks `X-Forwarded-For` from the right and takes the first address that is not a trusted proxy. If any entry in the header is not a valid IP address, the whole header is ignored.

`app.trusted_proxies` decides which proxies are believed. From those, Kestello reads the client address from `X-Forwarded-For` and whether the visitor used HTTPS from `X-Forwarded-Proto`, which sets the `Secure` flag on cookies. Headers from any other address are ignored. If your proxy sends neither header, set `app.secure_cookies` to `true`.

## If something goes wrong

| Message | Where | What it means |
|---|---|---|
| `Platform settings are locked by the host (config/platform.php or KESTELLO_PLATFORM_LOCKED).` | admin, `platform:set` | `admin_editable` is `false` or `KESTELLO_PLATFORM_LOCKED` is set. Change the file or the variable instead. |
| `Some settings are pinned by the host.` with `Set by an environment variable` or `Set by config/platform.php` | admin, `platform:set` | You tried to change a key that layer 1 or 2 sets. |
| `Unknown driver [<driver>] for [<subsystem>].` | admin, `platform:*` | No driver of that name is registered. It may belong to a plugin that is not active. |
| `platform: <subsystem> driver failed (...); using fallback "<driver>".` | PHP error log | The configured driver could not be built. The site runs on the fallback until you fix the settings. |
| `No app key is configured, so secrets cannot be stored. Run "php bin/cms key:generate".` | admin, `platform:set` | `app.secret_key` is empty. |
| `This secret was sealed with an unknown app key. Re-enter it, or add the old key to app.previous_keys.` | admin, logs | The secret key changed and the old one is not in `app.previous_keys`. |
| `Environment variable <NAME> is not set.` | `platform:set` with `@env:` | The variable is missing from the shell that runs the command. |
| `app.packages.trusted_keys: an entry is not a base64 Ed25519 public key and is ignored.` | PHP error log | An entry in `app.packages.trusted_keys` is malformed. |
| `The site could not be reached at <url> to check the update (...). Set app.updates.health_url to an address the server can reach itself at.` | update screen, `package:update`, `core:update` | The HTTP health check could not call `app.url` from the server. Set `app.updates.health_url`. |
| `Config file not found: config/app.php` | `key:generate` | The site is not installed yet, or the command runs from the wrong folder. |

A value that seems to have no effect is most often in the wrong file: check that `cron.*` is in `config/cron.php`, `queue.*` in `config/queue.php` and `auth.*` in `config/auth.php`, not inside `config/app.php`. After editing a config file on a server with OPcache and `opcache.validate_timestamps=0`, reload PHP-FPM so the change is read.

## Next

- [Deployment](/developers/deployment): running Kestello in production.
- [Packaging](/developers/packaging): signing packages for `app.packages.trusted_keys`.
- [Command line](/developers/cli): `platform:*`, `key:generate` and the other commands named here.
