# Command line

`bin/cms` is Kestello's command line. Everything it does can also be done in the admin or through the API; the command line is there for servers without a browser, for scripts and deploys, and for developers.

Run it from the site's root folder:

```bash
php bin/cms <command> [arguments] [options]
php bin/cms list                 # every command, including those plugins add
```

In the Docker development setup, prefix it with `docker exec cms_app` (see [Local development](/developers/local-development#running-commands)).

Commands that change data ask for confirmation unless you pass `--yes` (or `--force` where noted). Exit code `0` means success; anything else is a failure, so commands can be chained in scripts.

## Everyday

| Command | What it does |
|---|---|
| `health` | Runs the Site Health checks and prints the results. Exits with code `2` when something is critical, so it can be used in monitoring. |
| `cache:clear` | Clears all caches and compiled files. Safe at any time. |
| `cache:pages` | Clears only the page cache. |
| `routes` | Lists every registered route. |
| `serve` | Starts PHP's built-in web server for local work. `--host`, `--port`. |

## Backups

| Command | What it does |
|---|---|
| `backup:create` | Backs up the database and files. `--no-files` for the database only, `--note="..."` to label it. |
| `backup:list` | Lists backups, newest first. |
| `backup:restore <name\|file.zip>` | Replaces this site with a backup. A safety backup of the current site is made first unless `--no-safety`. `--with-code` also restores plugins and themes. While it runs, the site shows a maintenance page and cron and queue workers wait. |
| `backup:delete <name>` | Deletes a backup. |

::: warning
A restore replaces the whole database. Everyone is signed out, and anything changed since the backup was made is gone (except in the safety backup).
:::

## Import

| Command | What it does |
|---|---|
| `import:wordpress <export.xml>` | Imports a WordPress export, the same import as **Site → Import**. It shows what will come over and asks before importing; `--yes` skips the question and `--dry-run` only shows it. `--uploads=<folder>` takes files from a copy of `wp-content/uploads` before downloading them. `--no-media` leaves files out, `--no-redirects` makes no redirects. `--as=<username>` names the administrator it runs as (needed when the site has more than one), `--author=<username>` credits posts whose author has no account here. Exits with code `2` when some items could not be imported; they are listed, and **Try again** under **Site → Import** retries them. |

See [Moving from WordPress](/guide/import-wordpress) for what comes over.

## Plugins and themes

| Command | What it does |
|---|---|
| `plugin:list` | Installed plugins and their status. |
| `plugin:install <dir\|zip>` | Installs a plugin. `--force` replaces an installed copy, `--activate` activates it. Unlike the admin, the command line also installs unsigned packages. |
| `plugin:activate <slug>` | Activates a plugin: runs its migrations and its activate hook. |
| `plugin:deactivate <slug>` | Deactivates a plugin. Its data is kept. |
| `plugin:uninstall <slug>` | Removes a plugin with its tables and settings. `--keep-files` leaves the folder, `--yes` skips the question. |
| `plugin:config <slug> [key=value ...]` | Shows or changes a plugin's settings. `--secret=key` asks for a secret value without echoing it, `--unset=key` removes one. |
| `plugin:check <dir>` | Checks a plugin's code for unsafe constructs. `--theme` for a theme. |
| `theme:list` | Installed themes. |
| `theme:install <dir\|zip>` | Installs a theme. `--force`, `--activate`. |
| `theme:activate <slug>` | Switches the active theme. |
| `theme:export <slug>` | Exports a theme made in the admin as a zip. |
| `theme:import <zip>` | Imports a theme zip exported from **Appearance → Themes**. |

## Packages and updates

| Command | What it does |
|---|---|
| `package:keygen --out=<file>` | Makes an Ed25519 signing key. The secret key goes to the file (readable only by you); the command prints the line sites add to trust it. `--name="Publisher"`. |
| `package:build <dir>` | Builds `<slug>-<version>.zip` from a plugin or theme folder. `--out=dist`, `--key=<file>` to sign it. Refuses code that `plugin:check` rejects. |
| `package:sign <zip> --key=<file>` | Signs an existing package. |
| `package:verify <zip>` | Checks a package's signature, manifest and code without installing it. |
| `package:update <zip>` | Updates an installed plugin or theme: backup, swap, health check, automatic rollback. `--downgrade` to install an older version. |
| `package:check-updates [<plugin:slug\|theme:slug>]` | Asks the update sources plugins and themes name (`updates` in their manifest) for new versions now, and prints what each one has. Installs nothing. Exits 1 when a source could not be checked. |
| `package:license <plugin:slug\|theme:slug>` | Saves the license key a paid plugin or theme needs, read from what you type or pipe in so it stays out of the shell history. `--remove` forgets it. |
| `core:release [<dir>]` | Builds a Kestello release zip from this core (or the core folder given). `--out=dist`, `--key=<file>`. |
| `core:install-zip` | Builds `kestello-<version>.zip`, the folder people upload to install a new site. `--out=dist`. |
| `core:update <zip>` | Updates Kestello itself: backup, switch release, health check, automatic switch back. `--downgrade`. |
| `core:update --status` | Shows the running version and the releases on disk. |
| `update:recover` | Finishes or puts back an update that stopped halfway, also after the site stopped trying by itself. Plugins are not loaded while it runs. |
| `core:check` | Asks GitHub whether a new Kestello version is out (`config/release.php`). Installs nothing. |
| `core:verify <zip>` | Checks a release zip is signed by a key in `core/config/release.php` and matches its `.sha256`. Works without an installed site; the release workflow runs it. |

## Development tools

These work in a checkout that was never installed.

| Command | What it does |
|---|---|
| `i18n:extract` | Writes the translation template for core, `core/resources/lang/kestello.pot`. `--path=<folder> --domain=<slug>` for a plugin or theme, `--check` to fail when the template is out of date. See [Translations](/developers/translations). |
| `ide:helpers` | Writes `.phpstorm.meta.php`. `--stubs` also writes `kestello.stub.php` for plugins and themes developed in their own repositories, `--out=<folder>`, `--check`. See [Editor setup](/developers/editor-setup). |

## Database

| Command | What it does |
|---|---|
| `migrate` | Runs pending core migrations. |
| `migrate:status` | Shows which migrations have run. |
| `migrate:rollback` | Rolls back the last batch. |
| `migrate:reset` | Rolls back every migration. |
| `migrate:fresh` | Drops every table and runs all migrations again. Development only. |

## Background work

| Command | What it does |
|---|---|
| `schedule:run` | Runs the scheduled tasks that are due. Put this in cron, every minute. |
| `schedule:list` | Scheduled tasks with their next and last runs. |
| `schedule:test <name>` | Runs one task now. |
| `schedule:enable <name>`, `schedule:disable <name>` | Resumes or stops a task. |
| `schedule:work` | Runs the scheduler every minute in the foreground (development). |
| `queue:work` | Runs queued jobs, reading settings again before each one, so a changed mail server is used without a restart. `--queue=high,default,mail,media,low` sets the order, `--stop-when-empty`, `--max-jobs=N`, `--max-time=S`, `--memory=128` (MB), `--sleep=3`. |
| `queue:monitor` | Queue sizes, the last worker heartbeat and failed jobs. |
| `queue:failed [id]` | Lists failed jobs, or shows one. |
| `queue:retry <id\|all>` | Retries failed jobs. |
| `queue:forget <id\|all>` | Deletes failed jobs. |
| `queue:clear <queue\|all> --yes` | Deletes waiting jobs. |
| `queue:restart` | Asks running workers to exit after their current job. Run after deploying new code. |
| `cron:token` | Enables `POST /system/cron` for an external cron service and prints its token. Each run makes a new token; `--revoke` turns it off. |

## Infrastructure

| Command | What it does |
|---|---|
| `platform:show [subsystem]` | Shows the driver of each infrastructure subsystem (cache, sessions, queue, search, and any a plugin adds) and where each setting comes from. `--json`. |
| `platform:test <subsystem> [driver] [key=value ...]` | Tests the current or a proposed driver without saving. |
| `platform:set <subsystem> <driver> [key=value ...]` | Changes a driver, after testing it. A value written as `key=@env:VAR` is read from an environment variable instead of being stored. `--skip-test`. |
| `platform:reset <subsystem\|all>` | Drops settings made in the admin, back to config files, environment and defaults. |
| `platform:compile` | Rebuilds `storage/framework/platform.php` from the database. Run on each server after deploys when several servers share a database. |
| `storage:disks` | Lists storage disks and where they point. |
| `storage:test [disk]` | Writes, reads and deletes a test file on a disk (every disk by default). |
| `media:move --to=<disk>` | Moves the media library to another disk. `--keep-source`, `--stop`. |
| `media:variants` | Makes missing image sizes and PDF previews and deletes outdated ones. `--id=N`, `--prune-only`, `--rebuild`. |
| `search:reindex` | Rebuilds the search index. `--collection=content`. |
| `content:relations` | Records again which entries link to which (two-way relationships), after an upgrade, an import or a restore. |

## Accounts and security

| Command | What it does |
|---|---|
| `token:create <user>` | Creates a personal access token for the API. `--name=`, `--scopes=a,b`, `--days=`. The token is shown once. |
| `user:password <username\|email>` | Sets a user's password when email cannot be used. Asks for it twice without showing it, or reads it from standard input when piped. `--generate` makes one and prints it once. A password given as an argument is refused, so it does not end up in the shell history. |
| `demo:snapshot` | On a [public demo](/guide/demo): takes the snapshot every hourly reset goes back to, from the site as it is now, and sets the `demo` account's password back to `demo`. |
| `demo:reset` | On a public demo: puts the site back to its snapshot now. Everyone is signed out. |
| `auth:reset-2fa <username\|email>` | Turns off two-step sign-in for a user who lost their device and recovery codes. |
| `recovery:link` | Prints a signed link that opens the site with every plugin off and the default theme. Use it when a plugin locks you out of the admin. |
| `key:generate` | Makes a new secret key. The old one is kept for decrypting existing data; `--forget-old` drops it. |
| `config:publish` | Adds the commented config files `config/cron.php`, `config/queue.php`, `config/auth.php` and `config/audit.php` with every option at its default. A file that exists is never changed. |
| `audit:prune` | Deletes audit log entries older than `--days=365` and expired reset tokens. |

## For developers

| Command | What it does |
|---|---|
| `make:plugin` | Scaffolds a plugin in `content/plugins/`. |
| `make:theme` | Scaffolds a theme, or a child theme with `--parent=<slug>`. |
| `make:migration`, `make:model`, `make:controller`, `make:middleware`, `make:command` | Create a class or file from a template inside a plugin. `--plugin=<slug>` is required. |
| `hooks:list` | Lists the events and filters of core and the active plugins. `--events`, `--filters`, `--owner=<slug>`, `--deprecated`, `--json`, `--markdown`. See [Events and filters](/developers/events#declare-your-hooks). |
| `test [path]` | Runs the test suite, a folder of it, or one `*Test.php` file. `--filter=Text` runs only the tests whose `Class::method` name contains that text. |
