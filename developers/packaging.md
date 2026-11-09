# Packaging and signing

This page covers turning a plugin or theme folder into a zip that a site can install, signing it so the admin accepts it, checking a package before you ship it, and what happens on a site when it updates to your new version. It also covers building and applying releases of Kestello itself. Read it when your plugin works locally and you want to put it on a real site.

## The short version

```bash
php bin/cms package:keygen --out=/home/you/keys/acme.key --name="Acme Plugins"   # once
npm run build                                                            # if the package has Vue components
php bin/cms package:build content/plugins/acme-events --key=/home/you/keys/acme.key
php bin/cms package:verify dist/acme-events-1.4.0.zip
```

Then add the public key printed by `package:keygen` to `app.packages.trusted_keys` on each site that should accept your packages, and upload the zip under **Plugins → Manage plugins** with **Upload a plugin**.

## What a package is

A package is one zip file named `<slug>-<version>.zip`, holding the plugin or theme in a folder named after its slug, plus a `SIGNATURE` file when it is signed. The slug and version come from `plugin.json` or `theme.json` (see [The manifest](/developers/manifest)).

When a site reads a zip, it accepts the package at the root of the zip or inside one top folder. The folder's name does not matter; the manifest's `slug` does.

`package:build` leaves out:

- `node_modules/` at any depth,
- every file or folder whose name starts with a dot (`.env`, `.git`, `.DS_Store`), except `.vite`, which holds the Vite manifest of the built components and must ship,
- the `tests/` and `dist/` folders at the top of the package, so your tests and earlier builds stay out.

Everything else in the folder goes in, including `vendor/` if you have one, and it is all checked (see [What the code check refuses](#what-the-code-check-refuses)).

Next to the zip, the build writes `<zip>.sha256` with the zip's SHA-256 in the format `sha256sum -c` reads.

## Build a package

1. Build the Vue components, if the package has any. Built output in `assets/build/` ships with the package, because sites never run Node.js.

   ```bash
   node core/build/build.mjs content/plugins/acme-events
   ```

2. Build the zip:

   ```bash
   php bin/cms package:build content/plugins/acme-events
   ```

   ```text
     dist/acme-events-1.4.0.zip
     sha256 4861aed4ba96cbf0dd09f121a77d03c1b5c9300250ef6552da7357ea9df11ccd
   ```

`package:build <dir>` works out from `plugin.json` or `theme.json` whether the folder is a plugin or a theme.

| Option | Default | Meaning |
|---|---|---|
| `--out=<dir>` | `dist` (relative to where you run the command) | Where the zip and its `.sha256` are written. The folder is created if needed. |
| `--key=<file>` | none | Sign the zip with this key file from `package:keygen`. Without it the package is unsigned. |

The build runs the code check first. Any error stops the build and lists the problems; warnings are printed after a successful build.

## Signing

Signatures use Ed25519 through PHP's `sodium` extension, which Kestello requires anyway.

The signature covers every file in the zip: Kestello hashes each file, lists `<sha256> <name>` lines sorted by name, hashes that list, and signs the result. Changing, adding or removing any file afterwards breaks the signature. The signature is stored inside the zip as `SIGNATURE`, so a package stays one file:

```json
{
    "format": 1,
    "alg": "ed25519",
    "key": "2019ce5f5797949e",
    "digest": "…",
    "signature": "…",
    "signed_at": "2026-11-05T17:40:12+00:00"
}
```

`key` is the key id: the first 16 hex characters of the SHA-256 of the raw public key.

### Make a signing key

```bash
php bin/cms package:keygen --out=/home/you/keys/acme.key --name="Acme Plugins"
```

```text
  Secret key written to /home/you/keys/acme.key (key 2019ce5f5797949e). Keep it off your sites and out of git.

  Sites that should trust packages signed with it add this to config/app.php:
    'packages' => ['trusted_keys' => [['name' => 'Acme Plugins', 'public_key' => 'f3AkALMs1t6AfYYdDJM7UNq+5Oky2DLM5jnNxWVVni4=']]],
```

| Option | Required | Meaning |
|---|---|---|
| `--out=<file>` | yes | Where the secret key is written. The command refuses to overwrite an existing file. The file is made readable only by you (`0600`). |
| `--name=<text>` | no | The publisher name stored in the key file and used in the `trusted_keys` line the command prints. Default `Package signing key`. |

The key file is JSON with `id`, `name` and `secret_key`. It is the publisher's secret: keep it on your build machine or in your CI secrets, never on a site and never in a repository. Anyone who has it can publish packages that every site trusting you will install.

### Sign an existing zip

```bash
php bin/cms package:sign dist/acme-events-1.4.0.zip --key=/home/you/keys/acme.key
```

An existing signature is replaced. If `<zip>.sha256` exists next to the zip, it is rewritten with the new hash, since signing changes the zip.

### Trust a publisher on a site

Trusted keys come only from the server's configuration, never from the admin. Add the line `package:keygen` printed to the site's `config/app.php`:

```php
<?php

return [
    // … the rest of the site's settings
    'packages' => [
        'trusted_keys' => [
            ['name' => 'Acme Plugins', 'public_key' => 'f3AkALMs1t6AfYYdDJM7UNq+5Oky2DLM5jnNxWVVni4='],
        ],
    ],
];
```

`app.packages.trusted_keys` is a list of entries with `name` (shown in the admin, cut to 80 characters) and `public_key` (the base64 Ed25519 public key). An entry whose `public_key` is not a 32-byte base64 key is skipped, and this line goes to the PHP error log:

```text
[kestello] app.packages.trusted_keys: an entry is not a base64 Ed25519 public key and is ignored.
```

There is no package registry yet, so this list is the only source of trust.

### Who may install what

A package's signature has one of four states:

| State | Meaning | Admin | Command line |
|---|---|---|---|
| `signed` | Signed by a key in `app.packages.trusted_keys`. | Installs | Installs |
| `untrusted` | A signature by a key this site does not trust. The file digest matches, but the signature cannot be checked without the key. | Refused, unless `app.packages.admin_unsigned` is `true` | Installs |
| `unsigned` | No `SIGNATURE` file. | Refused, unless `app.packages.admin_unsigned` is `true` | Installs |
| `tampered` | The files do not match the signature. | Refused | Refused |

The command line (`plugin:install`, `theme:install`, `package:update`, `core:update`) always accepts unsigned and untrusted packages, because whoever runs commands on the server can change the code anyway. It never accepts a tampered one.

`app.packages.admin_unsigned` (default `false`) lets the admin install unsigned and untrusted packages too. Turn it on only on development and staging sites.

The admin installs plugins under **Plugins → Manage plugins** and Kestello releases under **Site → Updates**. **Appearance → Themes** imports only themes without code (themes made in the admin and exported); a theme with PHP or Vue code is installed on the server with `theme:install`.

## Check a package

### Check a folder

```bash
php bin/cms plugin:check content/plugins/acme-events
php bin/cms plugin:check content/themes/acme --theme
```

The argument is a folder path, or a slug that is looked up in `content/plugins/` (or `content/themes/` with `--theme`). Errors print with `✗`, warnings with `!`. The command exits with `1` when there is at least one error, so it fits in CI.

### Check a zip

```bash
php bin/cms package:verify dist/acme-events-1.4.0.zip
```

```text
  Package  Acme Events 1.4.0 (plugin acme-events)
  Signature  signed by key 2019ce5f5797949e, which this site does not trust
  Installed  no
```

`package:verify` reads the zip the way an install would (manifest, signature against this site's trusted keys, code check) and installs nothing. It exits with `1` when the signature is `tampered` or the code check finds an error. An untrusted or unsigned package exits with `0`, since the command line may install it.

### What the code check refuses

`plugin:check`, `package:build`, `package:verify` and every install run the same checks (`Kestello\Cms\Extension\PackageChecker`). It is a review aid, not a sandbox. Errors stop a build and refuse an install; warnings are shown and allowed.

**Which files are checked.** Every file in the folder, at any depth, except inside `node_modules/` and `.git/`. `vendor/` is checked like your own code, because it runs like your own code.

**Which files count as PHP.** A file is scanned as PHP when its extension is `php`, `phtml`, `php3` to `php8`, `phps` or `inc`, or when it holds `<?php` or `<?=` anywhere and its extension is not one of `js`, `mjs`, `vue`, `html`, `css`, `png`, `jpg`, `jpeg`, `gif`, `webp`, `avif`, `svg`, `ico`, `woff`, `woff2`, `ttf`, `otf`, `map` (files over 5 MB are not read for this test). `include` runs PHP from a file of any name, so a `.txt` or `.json` with PHP in it is PHP.

| Finding | Level |
|---|---|
| A `.phar` file anywhere ("PHP archives (.phar) cannot be checked: ship their source instead") | error |
| A PHP file under `assets/` ("PHP files are not allowed in assets/") | error |
| `eval()`, backtick shell execution | error |
| Calls to `exec`, `shell_exec`, `system`, `passthru`, `proc_open`, `popen`, `pcntl_exec`, `create_function` | error |
| A `namespace` outside the manifest's declared `namespace` | error |
| Pages or layouts under `resources/js/` with no `assets/build/.vite/manifest.json` ("Vue sources are not built") | error |
| A stylesheet named in the manifest that is not in `assets/` | error |
| `eval(` or `new Function(` in `.js`, `.mjs`, `.vue` or `.html` files | error |
| A manifest that cannot be read | error |
| Calls to `assert`, `unserialize`, `extract`, `curl_init`, `curl_exec`, `fsockopen`, `stream_socket_client`, `mail`, `phpinfo` | warning |
| Reading `$_GET`, `$_POST`, `$_REQUEST`, `$_COOKIE` or `$_FILES` directly | warning |
| `include` or `require` of a variable path | warning |
| `requires.core` set to `"*"` | warning |
| `v-html` in components | warning |
| String templates (`template: '…'`) or `compile(` in JavaScript, which need the Vue compiler that Kestello does not ship | warning |

Method calls with the same names (`$this->exec()`, `Foo::system()`) are not flagged; only plain function calls are.

## Publish updates {#publish-updates}

Name where your releases are in the manifest (`updates`, see [the manifest](/developers/manifest#updates)), and sites find them by themselves: every 12 hours, and when the administrator chooses **Check now** on **Site → Updates**. They download the new zip only when the administrator chooses **Review**, check it like an upload, and apply it through the [update pipeline](#updating-a-package-on-a-site). A site offers the newest version above the installed one whose `requires.core` its Kestello meets, and pre-releases only when `app.updates.prereleases` is on.

Sign every release with the same key. From the admin, a site applies an update only when the key that signed the installed version signed it too (or a key that version listed under [`signing_keys`](/developers/manifest#signing-keys)). An update signed by another key is refused with "Acme Events 1.5.0 is not signed by the publisher of the installed version (key …).", even when the site trusts that other key.

### From GitHub releases

With `"updates": {"github": "acme/events"}`, a release counts when it is published (not a draft), its tag is `v<version>`, and it carries two assets: `<slug>-<version>.zip` and `<slug>-<version>.zip.sha256`, exactly as `package:build` writes them to `dist/`. Releases without both are skipped. For `acme-events` 1.5.0:

```bash
php bin/cms package:build ../acme-events --key=acme.key
gh release create v1.5.0 dist/acme-events-1.5.0.zip dist/acme-events-1.5.0.zip.sha256 --notes-file NOTES.md
```

The release notes are shown to the administrator, as Markdown. GitHub allows each server 60 checks an hour without a token, shared with Kestello's own update check.

### From your own feed

With `"updates": {"url": "https://updates.acme.test/kestello/acme-events.json"}`, Kestello requests that address (`Accept: application/json`, at most 1 MB, 10 seconds) and expects:

```json
{
    "format": 1,
    "type": "plugin",
    "slug": "acme-events",
    "links": ["account.acme.test"],
    "releases": [
        {
            "version": "1.5.0",
            "published_at": "2026-11-20T10:00:00Z",
            "requires": { "core": "^0.1", "php": ">=8.4" },
            "notes": "### Fixed\n\n- Ticket counts on sold-out events.",
            "download": "https://cdn.acme.test/acme-events-1.5.0.zip?expires=1763640000&sig=…",
            "sha256": "9b1c…64 hexadecimal characters"
        }
    ]
}
```

- `type` and `slug` must be the package's, or the whole feed is refused: "The update feed is for another package, not the plugin "acme-events"."
- A release is skipped when its `version` is not semver, its `download` is not `https`, or `sha256` is not 64 hexadecimal characters. At most 100 releases.
- `download` may be a short-lived signed address. Kestello asks the feed again right before downloading and never stores it.
- `links` lists other hosts of yours that may appear as a renew link (below). Optional.

### License keys

Add `"license": true` to `updates`. The administrator enters the key on **Site → Updates**. Kestello then sends it with every request to the feed's host, and to the `download` address only when that is on the same host:

```text
Authorization: Bearer <license key>
X-Kestello-Site: https://client.example
```

Without a key, Kestello does not request the feed at all. The key is never put in an address, so it stays out of your server's access logs; never ask for it in the query string.

Answer `401`, `402` or `403` when the key is wrong or expired. The body may say why and where to renew:

```json
{ "error": "Your license expired on 1 March.", "renew_url": "https://account.acme.test/renew" }
```

The administrator sees "The license key for Acme Events was refused: Your license expired on 1 March." `error` is shown as plain text, up to 300 characters. `renew_url` is shown as a **Renew** link only when it is `https` on the feed's own host or a host in the feed's `links`.

A feed can be a small script that checks the key against your license provider, then answers with the releases the key may download. This one reads keys from a file, to show the shape:

```php
<?php
// https://updates.acme.test/kestello/acme-events.json
$key = preg_match('/^Bearer (.+)$/', $_SERVER['HTTP_AUTHORIZATION'] ?? '', $m) ? $m[1] : '';
$licenses = json_decode(file_get_contents(__DIR__ . '/licenses.json'), true); // {"<key>": {"expires": "2027-03-01"}}
$license = $licenses[$key] ?? null;

header('Content-Type: application/json');
if ($license === null || $license['expires'] < date('Y-m-d')) {
    http_response_code(403);
    echo json_encode(['error' => $license === null ? 'This license key is not known.' : "Your license expired on {$license['expires']}.", 'renew_url' => 'https://updates.acme.test/renew']);
    exit;
}
echo file_get_contents(__DIR__ . '/acme-events.json');
```

On a server, check sources and save a key with:

```bash
php bin/cms package:check-updates plugin:acme-events
php bin/cms package:license plugin:acme-events
```

```text
  plugin:acme-events: 1.5.0 is available.
```

`package:license` reads the key from what you type or pipe in; `--remove` forgets it.

## Updating a package on a site

When a site already has your plugin or theme, a newer zip goes through the update pipeline instead of a plain install. In the admin, uploading a newer version of an active plugin under **Plugins → Manage plugins** offers the update. On the server:

```bash
php bin/cms package:update dist/acme-events-1.4.0.zip
```

```text
  Backing up, updating and checking the site…
  Updated acme-events 1.3.2 → 1.4.0. Backup: …
```

Before anything changes, Kestello checks that:

- the package is installed (otherwise install it instead),
- the version differs from the installed one and is newer, unless you pass `--downgrade`,
- its requirements are met: Kestello version, PHP version, extensions, other plugins, and the version constraints other active plugins have on it; for a theme, that its parent theme is installed.

Then, holding the update lock (`storage/framework/update.lock`) and the backup lock so a scheduled backup cannot start halfway:

1. **Backup.** A database backup of kind `before-update` is made. Files are not included: the old package folder is kept instead.
2. **Maintenance.** Visitors get a 503 page for up to 30 minutes. Signed-in people, the admin and the API keep working.
3. **Swap.** The installed folder is moved to `storage/app/backups/packages/<slug>-<old version>-<date>-<time>-<random>/` and the new folder takes its place. OPcache and the page cache are cleared.
4. **Probe.** A fresh PHP process runs the hidden `update:probe` command. Booting the new code runs the package's pending migrations and its `upgrade()` hook. The probe then requests `/` and `/api/v1/status` inside that process.
5. **Commit or roll back.** The update is kept when the package is not suspended, its requirements still resolve, the site records the new version, it still runs if it ran before, every plugin that ran before still runs, and neither page answered with a 5xx status. Otherwise the new folder is removed, the old one is moved back, the database backup is restored, and the probe runs again on the old version.

Old package folders are kept for the three most recent updates of each package, for a manual way back.

### How the probe runs

`app.updates.health` chooses the probe:

| Value | Probe |
|---|---|
| `auto` (default) | A PHP process when `proc_open` is available, else HTTP. |
| `process` | `php bin/cms update:probe <owner>` in a new process, with a 120 second limit. The PHP binary is `app.updates.php`, or the running PHP when that is not set. |
| `http` | Requests to the site itself, through maintenance mode with a one-time bypass token in `X-Kestello-Bypass`: first `/system/update/probe`, then `/` and `/api/v1/status`. The base address is `app.updates.health_url`, or `app.url` when that is not set. |

When the update starts from the command line, the running PHP is the one running `bin/cms`. When it starts from the admin under PHP-FPM, Kestello uses `php` in PHP's binary folder (`PHP_BINDIR`). If no CLI binary is there, set `app.updates.php`, for example to `/usr/bin/php8.5`. See [Configuration](/developers/configuration) for the `app.updates` keys.

## Releases of Kestello

Kestello itself ships as two zips, for every release and pre-release (`0.1.0-rc.1`). `kestello-<version>.zip` is for new sites: a `kestello/` folder to upload and install (see [The install zip](#install-zip)). `kestello-core-<version>.zip` updates sites that already run. Everything in it is inside a `core/` folder, and it must hold `core/VERSION`, `core/core.json`, `core/bootstrap.php` and `core/src/Kernel.php`. Signing works exactly as for packages.

### Build a release

```bash
php bin/cms core:release --key=/home/you/keys/kestello.key
```

`core:release [<core dir>]` zips the running core, or the core folder you name.

| Option | Default | Meaning |
|---|---|---|
| `<core dir>` | the running core | The folder to package. |
| `--out=<dir>` | `dist/` in the site root | Where the zip and its `.sha256` go. |
| `--key=<file>` | none | Sign with this key file. Without it the release is unsigned. |

The version is read from `VERSION` and must be a semantic version. `core.json` declares what the release needs, which sites check before they switch:

```json
{
    "name": "Kestello",
    "requires": {
        "php": ">=8.4"
    },
    "extensions": ["json", "mbstring", "pdo", "sodium"]
}
```

A site's own `releases/` folder and `current.php` never go into a release, and neither do `node_modules/` and dotfiles (except `.vite`).


### The install zip {#install-zip}

```bash
php bin/cms core:install-zip
```

`core:install-zip [--out=dist]` writes `kestello-<version>.zip` and its `.sha256` from a checkout. It holds the top-level `.htaccess`, `bin/cms`, `public/`, `core/`, the base theme, and the license, readme, changelog and security policy, all inside one `kestello/` folder. It is built from that list, so tests, tooling, Docker files, other plugins and themes, `config/` and `storage/` never go in, nor do hidden files other than `.htaccess` and the Vite manifests. The folders Kestello writes to are left out on purpose: the installer creates them. The release workflow builds this zip for every release; it is not signed, because nothing installs it automatically.
### Apply a release

In the admin, **Site → Updates** with **Upload a Kestello release** applies releases signed by a trusted key (or any untampered release when `app.packages.admin_unsigned` is `true`). On the server:

```bash
php bin/cms core:update kestello-core-0.2.0.zip
php bin/cms core:update --status
```

`--downgrade` allows an older version. The checks before anything changes: the version differs from the running one, the server's PHP version satisfies `requires.php`, every extension in `extensions` is loaded, PHP can write to `core/` and `core/releases/`, and every active plugin and theme accepts the new version in its `requires.core`.

The pipeline is the same as for packages, with the switch done by files instead of a folder swap:

1. Database backup, maintenance mode for visitors.
2. The release is unpacked to `core/releases/<version>/`.
3. `core/current.php` is written to a temporary file and renamed over the old one, so the switch is atomic. After a comment line, it holds `return '0.2.0';`.
4. The probe boots the new release in a fresh process, runs core's pending migrations, checks that every plugin that ran before still runs, and requests `/` and `/api/v1/status`.
5. On failure, `current.php` is put back (or removed, on a development checkout that had none), the new release folder is deleted, and the database backup is restored.

After a successful update, Kestello keeps the running release, the one before it, and one more, and deletes older release folders. The release layout is described in [Deployment](/developers/deployment#core-releases).

### Where sites get releases {#where-sites-get-releases}

Official releases are GitHub releases of [kestellohq/cms](https://github.com/kestellohq/cms/releases). A maintainer pushes a `vX.Y.Z` tag, and the release workflow builds `kestello-core-X.Y.Z.zip`, signs it with the release key, checks it with `core:verify`, and publishes it with its `.sha256` file and `kestello.stub.php` (see [Editor setup](/developers/editor-setup)).

Sites ask the GitHub releases API every `release.check_every` hours (the `updates.check` scheduled task), on **Check now** under **Site → Updates**, or with `php bin/cms core:check`. A release counts only when it is published (not a draft), its tag is `v` plus a semantic version, and it carries both `kestello-core-<version>.zip` and `kestello-core-<version>.zip.sha256` downloaded from the same repository. Anything else is ignored.

Pre-releases (a version with a hyphen, published as a GitHub pre-release) are offered when `release.prereleases` is on, or when the site already runs a pre-release of the same version: a site on `0.1.0-rc.1` gets `0.1.0-rc.2`, then `0.1.0`, and only releases after that. Their notes are the changelog's Unreleased section at the time, because a pre-release has no changelog section of its own.

**Review the update** asks GitHub again where the zip is, downloads it, and throws it away unless its SHA-256 matches the published checksum. Then it goes through the same review and update as an uploaded zip. From the admin, the signature must come from a key in `release.keys`, made with `core:release --key`. Keys in `app.packages.trusted_keys` sign plugins and themes only, and a zip signed with `package:sign` is never accepted as a core release.

To publish your own builds, for a fork or an agency distribution, point your sites at your repository and your key in `config/release.php`:

```php
<?php

return [
    'repository' => 'acme/kestello',
    'keys' => [
        ['name' => 'Acme releases', 'public_key' => 'eLw1o7…'],
    ],
];
```

Publish releases there with the same assets: `kestello-core-<version>.zip`, signed with `core:release --key=<file>`, and its `.sha256`, which `core:release` writes next to it.

Check a release zip before you publish it:

```bash
php bin/cms core:verify dist/kestello-core-1.5.0.zip
```

```text
  Release  Kestello 1.5.0
  Signature  signed by Acme releases (3f9c2a7d1e8b4c60)
```

It fails unless a key in `core/config/release.php` signed the zip and the `.sha256` file next to it matches.

## If something goes wrong

**"plugin:check found problems:"** from `package:build`. The listed files hold code the checker refuses. Fix them; there is no option to skip the check.

**"Vue sources are not built: run "npm run build" (built output in assets/build/ ships with the package)".** Build the components before packaging.

**"There is no plugin.json or theme.json in that directory."** `package:build` was pointed at the wrong folder.

**"&lt;file&gt; exists; choose another file."** `package:keygen` never overwrites a key. Pick another `--out` path.

**"&lt;file&gt; is not a key file from package:keygen."** The `--key` file is missing or is not the JSON file `package:keygen` wrote. A public key will not work here.

**"The PHP sodium extension is needed to sign and verify packages."** Install or enable `sodium`.

**"This package is signed by a key this site does not trust. A developer can install it from the command line, or add the key to app.packages.trusted_keys."** The site does not list your key. Add it to `app.packages.trusted_keys`, or install with `plugin:install` on the server.

**"This package is not signed. Packages with code are installed here only when signed by a trusted publisher; a developer can install it from the command line."** Sign the package, or install it from the command line.

**"The package was changed after it was signed. It was not installed."** A file in the zip changed after signing. Sign again, and check where the zip came from.

**"There is no plugin.json or theme.json in the zip (at its root or in one folder)."** The zip has several top folders, or the manifest is deeper than one folder.

**"&lt;Name&gt; is not installed: install it instead of updating."**, **"&lt;Name&gt; &lt;version&gt; is already installed."**, **"This is &lt;Name&gt; &lt;version&gt;, older than the installed &lt;version&gt;."** The update checks. Use `plugin:install`, raise the version, or pass `--downgrade`.

**"Another update is running. Try again when it has finished."** Another update holds `storage/framework/update.lock`.

**"The update to &lt;version&gt; failed its check:"** followed by the problems, then "&lt;slug&gt; &lt;version&gt; and the database were put back." The probe found a problem and the rollback worked. Typical problems: "It did not start after the update.", "The upgrade to &lt;version&gt; did not finish (the site still records …).", "/ answered 500: …".

**"Rolling back failed: …"** The rollback itself failed. The message names the database backup and the folder that holds the old files. Kestello keeps the maintenance page on for visitors (signed-in administrators still get in) until someone looks. Restore the old folder and the backup by hand, then delete `storage/framework/maintenance.json`.

**"The check could not start a PHP process."** or **"The site did not start after the update: …"** The process probe failed. Set `app.updates.php` to the CLI binary, or set `app.updates.health` to `http`.

**"The site could not be reached at &lt;url&gt; to check the update (…). Set app.updates.health_url to an address the server can reach itself at."** The HTTP probe could not reach the site from the server itself, often because of DNS or a firewall. Set `app.updates.health_url`, for example `http://127.0.0.1`.

**"This is not a Kestello core release (everything in it must be in a core folder)."** The zip was not made by `core:release`.

**"Kestello &lt;version&gt; needs PHP &lt;constraint&gt;; this server runs &lt;version&gt;."**, **"Kestello &lt;version&gt; needs the PHP extension "&lt;name&gt;"."**, **"The plugin &lt;Name&gt; &lt;version&gt; supports Kestello &lt;constraint&gt;, not &lt;version&gt;."** The release cannot run here yet. Upgrade PHP, add the extension, or update the plugin first.

**"The core folder is not writable by PHP, so the release cannot be put in place."** PHP cannot write to `core/`. Fix the permissions or apply the update as the user that owns the files.

**"This is Kestello &lt;version&gt;, older than the running &lt;version&gt;. Going back is done by restoring a backup."** Restore the backup made before the update, or pass `--downgrade` on the command line if you know the older release works with the current database.

## Next

- [The manifest](/developers/manifest): versions, requirements and permissions a package declares.
- [Deployment](/developers/deployment): the server side of updates and the release folders.
- [Updates](/guide/updates): the same process from a site owner's point of view.
