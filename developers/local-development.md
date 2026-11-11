<script setup>
const containers = [
    { title: 'Always on', tone: 'brand', items: ['web (nginx): localhost:8080', 'app (PHP 8.5 FPM)', 'db (MySQL 9.7): localhost:3306', 'phpmyadmin: localhost:8081'] },
    { title: 'Optional profiles', items: ['pgsql: PostgreSQL 18 on localhost:5432', 'redis: Valkey on localhost:6379', 's3: MinIO, console on localhost:9001', 'search: Meilisearch and Typesense', 'workers: a queue worker and the scheduler', 'ssr: Node.js 26'] },
];
</script>

# Local development

This page sets up Kestello on your own machine for building plugins and themes or working on Kestello itself. The repository includes a Docker setup with everything a production server has, plus the optional services (PostgreSQL, Redis, S3-compatible storage, search engines) so you can test against them.

## What you need

- **Docker** with Compose (Docker Desktop on macOS and Windows).
- **Node.js 22.15 or newer** (26 is the current LTS). A checkout has no built admin or page scripts: you build them once with `npm`, and again after you change Vue components.
- **Git**.

PHP is not needed on your machine: it runs inside the container.

## Start it

```bash
git clone <repository> kestello
cd kestello
cp .env.example .env
docker compose up -d
npm ci && npm run build   # the admin and page scripts: built here, not stored in git
```

The Compose project is named `kestello`, so its containers, network and volumes are the same wherever the repository is checked out.

| Service | Container | Address |
|---|---|---|
| The site (nginx) | `cms_web` | http://localhost:8080 |
| PHP 8.5 (FPM) | `cms_app` | runs PHP and `bin/cms` |
| MySQL 9.7 | `cms_db` | `localhost:3306`, inside Docker `db:3306` |
| phpMyAdmin | `cms_phpmyadmin` | http://localhost:8081 |

<Compare :columns="containers" caption="The containers: four always run, the rest start with a Compose profile" />

The images follow the latest stable releases: PHP 8.5, MySQL 9.7 (the current long-term release), PostgreSQL 18, Valkey 9.2, nginx 1.30 (the stable line) and Node.js 26 (the current LTS) for the optional SSR service. The site itself needs only PHP 8.4 or newer; see [Requirements](/guide/requirements).

### Coming from an older checkout

Earlier versions of this setup used MySQL 8.0 and PostgreSQL 16. Their data files cannot be opened by MySQL 9.7 and PostgreSQL 18, so the new versions use new volumes (`kestello_cms_db97_data`, `kestello_cms_pg18_data`) and start empty. Your old volumes are left alone. To bring your local site over, export it before you pull the change and import it afterwards:

```bash
docker exec cms_db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --databases "$MYSQL_DATABASE"' > site.sql
# pull the change, then:
docker compose up -d --build
docker exec -i cms_db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < site.sql
```

Remove the old volumes yourself once you no longer need them (`docker volume ls` lists them).

Open http://localhost:8080. The installer starts. Use these database details, which match `.env`:

| Field | Value |
|---|---|
| Database | MySQL / MariaDB |
| Host | `db` (the service name inside Docker) |
| Database name | `kestello` |
| Username | `kestello` |
| Password | `secret` |

The ports and database credentials come from `.env`. Change them there before the first `docker compose up` if they clash with something on your machine.

### Optional services

Each optional service has a Compose profile. Start the ones you need:

```bash
docker compose --profile pgsql up -d pgsql          # PostgreSQL 18 on localhost:5432
docker compose --profile redis up -d redis          # Valkey (Redis-compatible) on localhost:6379
docker compose --profile s3 up -d minio             # S3-compatible storage, console on localhost:9001
docker compose --profile search up -d meilisearch typesense
docker compose --profile workers up -d              # a queue worker and the scheduler
docker compose --profile ssr up -d ssr              # server-side rendering
```

Credentials for these are in `docker-compose.yml`. They are for local development only.

Without the `workers` profile, background jobs and scheduled tasks still run: the web runner works through them after page requests. Run them by hand when you want to see them happen:

```bash
docker exec cms_app php bin/cms schedule:run
docker exec cms_app php bin/cms queue:work --stop-when-empty
```

## Running commands

`bin/cms` runs inside the PHP container:

```bash
docker exec cms_app php bin/cms list
docker exec cms_app php bin/cms plugin:list
```

A shell alias saves typing:

```bash
alias cms='docker exec cms_app php bin/cms'
cms health
```

The [command line reference](/developers/cli) lists every command.

## Changing Vue components

Core's components live in `core/resources/js`, a plugin's in `content/plugins/<slug>/resources/js`. After changing them, build:

```bash
npm install
npm run build          # core, plugins and themes
npm run build:core     # core only
```

Built files go to an `assets/build/` folder. Core's (`core/resources/assets/build/`) are not committed: CI builds them for its checks and the release workflow for the zips. A plugin or theme commits its own, since its zip ships them. Reload the page to see the change. To build a single plugin or theme, pass its folder: `node core/build/build.mjs content/plugins/acme-events`.

## Running the tests

The suite runs on SQLite in memory by default:

```bash
docker exec cms_app php bin/cms test
docker exec cms_app php bin/cms test --filter=Backups
docker exec cms_app php bin/cms test tests/Package
docker exec cms_app php bin/cms test tests/Package/UpdatesTest.php
```

Tests that touch the database can also run against MySQL and PostgreSQL, and the cache and session tests against Redis, as CI does. One command starts the `pgsql` and `redis` services and runs the suite on all of them:

```bash
npm run test:php:matrix
npm run test:php:matrix -- tests/Package
```

It uses a `kestello_test` database on MySQL and on PostgreSQL. A fresh database volume creates both on its first start. On a volume made before that, create them once, with the `pgsql` service running:

```bash
docker exec cms_db sh /docker-entrypoint-initdb.d/10-test-database.sh
docker exec cms_pgsql sh /docker-entrypoint-initdb.d/10-test-database.sh
```

The command passes the connections to `bin/cms test` in `KESTELLO_TEST_DATABASES` and a Redis address in `KESTELLO_TEST_REDIS`, and turns on APCu for the command line (`-d apc.enable_cli=1`) so the APCu cache store is tested too. Set those variables yourself to test against other servers.

::: warning
The tests empty the test databases they are given. Never point `KESTELLO_TEST_DATABASES` at a database you care about.
:::

## Checks before a pull request

CI runs the same checks. Run them from the repository's root folder. PHP runs on your machine when it is 8.4 or newer, and in the `app` container otherwise:

```bash
npm run format        # fix the PHP and JavaScript formatting
npm run check         # lint, static analysis, the JavaScript tests and the PHP tests
npm run i18n:check    # the translation template is up to date
npm run ide -- --check  # .phpstorm.meta.php is up to date
```

`npm run format`, `npm run lint` and `npm run analyse` install the development tools (PHP-CS-Fixer, PHPStan) with Composer, so they need Composer on your machine. When `i18n:check` fails, run `npm run i18n` and commit the template; when the IDE check fails, run `npm run ide` (see [Editor setup](/developers/editor-setup)).

## Starting over

To reinstall from scratch, empty the database and delete the installed marker:

```bash
docker exec cms_db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE $MYSQL_DATABASE; CREATE DATABASE $MYSQL_DATABASE;"'
rm config/installed.php
```

`php bin/cms migrate:fresh` is not enough for this: it rolls back and runs again only core's migrations, so plugins' tables stay.

The installer starts again on the next visit.

::: warning
Do not run `docker compose down -v` to start over. The `-v` deletes the database volumes, with no way back.
:::

## Without Docker

Any machine with PHP 8.4 or newer and the [required extensions](/guide/requirements#extensions) can run Kestello with PHP's built-in server and SQLite:

```bash
php bin/cms serve                      # http://127.0.0.1:8000
php bin/cms serve --host=0.0.0.0 --port=8090
```

The installer offers SQLite when `pdo_sqlite` is available. This is enough for theme and plugin work; use Docker when you need the full stack.
