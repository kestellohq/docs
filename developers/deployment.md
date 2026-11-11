<script setup>
const topology = [
    { title: 'Answers visitors', text: 'nginx or Apache with the document root at public/, PHP-FPM, and the optional SSR process on 127.0.0.1.', items: ['`public/index.php`', '`core/current.php`', '`app.ssr.url`'] },
    { title: 'Works in the background', text: 'Cron runs the scheduler every minute; an optional worker runs jobs as they come.', items: ['`schedule:run`', '`queue:work`', '`queue.worker`'] },
    { title: 'Holds the state', text: 'The database, the optional Redis for cache, sessions and the queue, and the storage disks.', items: ['`config/database.php`', '`config/platform.php`', '`config/storage.php`'] },
];
const background = {
    question: 'Can the server keep a process running (systemd, supervisor)?',
    answers: [
        { label: 'Yes', result: 'Cron runs schedule:run every minute, queue:work picks up jobs within seconds, and queue.worker is daemon.', tone: 'brand', link: '#queue-workers' },
        { label: 'No', next: {
            question: 'Can you add a cron job?',
            answers: [
                { label: 'Yes', result: 'Cron runs schedule:run every minute. Its queue.work task works the queue for up to 50 seconds.', link: '#cron' },
                { label: 'No', next: {
                    question: 'Can an outside cron service call the site?',
                    answers: [
                        { label: 'Yes', result: 'bin/cms cron:token turns on POST /system/cron for it.', link: '#cron' },
                        { label: 'No', result: 'The web runner runs due tasks after a page is sent, at most once a minute.', tone: 'muted', link: '#cron' },
                    ],
                } },
            ],
        } },
    ],
};
const sharing = [
    { title: 'Shared by every server', tone: 'brand', text: 'The database, sessions and cache (Redis or the database), media and backups (an S3 disk or a shared storage/app), and the same code from your deploy.' },
    { title: 'Kept per server', text: 'Compiled infrastructure settings, maintenance mode, and files changed by an update from the admin.', items: ['`storage/framework/platform.php`', '`storage/framework/maintenance.json`'] },
];
const coreSwitch = [
    { title: 'Unpack', text: 'The release goes to core/releases/0.2.0/, next to the running one.' },
    { title: 'Trial pointer', text: 'core/current.php names 0.2.0 only while the updater holds the update lock.', note: 'If PHP stops here, the next request loads the old release.' },
    { title: 'Probe', text: 'A fresh process boots 0.2.0 and requests / and /api/v1/status.', fail: 'current.php names the old release again and the database backup is restored.' },
    { title: 'Commit', text: 'current.php names 0.2.0 for good, and older release folders are deleted.', tone: 'brand' },
];
</script>

# Deployment

This page covers running Kestello on a server you control: the web server, PHP-FPM, file permissions, cron, queue workers, Redis, HTTPS behind a proxy, several servers sharing one database, backups that leave the server, monitoring, and the release folders that core updates use. Read it when you move a site from your machine or shared hosting to a VPS or a cluster. For shared hosting, the [installation guide](/guide/installation) is enough.

The examples assume the site lives in `/var/www/kestello`, PHP 8.5 runs as `www-data`, and you deploy as a separate user called `deploy`. Change these to match your server.

A production site has three kinds of parts: what answers visitors, what works in the background, and what holds the state. The sections below set up each one.

<Compare :columns="topology" caption="The parts of a production site and the settings that join them" />

## Checklist

| Item | Where |
|---|---|
| Document root is `public/` | [Web server](#web-server) |
| `storage/` writable by PHP | [File permissions](#file-permissions) |
| `app.url` starts with `https://`, `app.debug` is `false` | [Configuration](/developers/configuration) |
| Cron runs `schedule:run` every minute | [Cron](#cron) |
| A queue worker under systemd or supervisor, `queue.worker` set to `daemon` | [Queue workers](#queue-workers) |
| `app.trusted_proxies` set when behind a proxy or load balancer | [HTTPS and proxies](#https-and-proxies) |
| Backups copied off the server | [Backups off the server](#backups-off-the-server) |
| `bin/cms health` in your monitoring | [Health monitoring](#health-monitoring) |

## Web server

Only `public/` is meant to be reachable from the web. It holds `index.php`, `.htaccess`, `favicon.ico` and `assets/`. Everything else (`config/`, `storage/`, `core/`, `content/`) is served through PHP or not at all; each of those folders also holds a deny-all `.htaccess` for Apache, and **Site Health** warns when files in `storage/` can be downloaded: media at `/uploads` and public files at `/files` are streamed by Kestello from `storage/app/`, and plugin and theme assets are served by Kestello from their `assets/` folders.

`public/index.php` reads `core/current.php` when it exists and loads `core/releases/<version>/bootstrap.php`; without it, it loads `core/bootstrap.php`. `bin/cms` does the same.

### nginx

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name example.com;
    root /var/www/kestello/public;
    index index.php;
    charset utf-8;
    client_max_body_size 64M;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_buffers 16 16k;
        fastcgi_buffer_size 32k;
        fastcgi_read_timeout 300;
    }

    location ~ /\. {
        deny all;
    }
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

`$realpath_root` matters: it resolves symlinks, so a deploy that switches a symlinked folder is picked up without stale paths. `fastcgi_read_timeout 300` gives backups and updates started from the admin time to finish.

If your nginx config has a block for static file extensions (`css`, `js`, `woff2` and so on), end its `try_files` with `/index.php?$query_string`, as the development config in `docker/nginx/default.conf` does. Files under `/uploads`, `/files` and plugin assets are not in `public/`, so nginx must hand them to PHP.

#### Let nginx send stored files

By default PHP streams files from local storage disks. To let nginx send them instead (lower memory use, range requests handled by nginx), set `storage.sendfile` in `config/storage.php` and add an internal location that maps to `storage/app/`:

```php
<?php

return [
    'sendfile' => 'x-accel-redirect',
    'sendfile_prefix' => '/protected-storage',
];
```

```nginx
location /protected-storage/ {
    internal;
    alias /var/www/kestello/storage/app/;
}
```

Kestello still checks access and sets every header; nginx only sends the bytes. For Apache or LiteSpeed with `mod_xsendfile`, use `'sendfile' => 'x-sendfile'`.

### Apache

`public/.htaccess` routes every address that is not a real file to `index.php`, passes the `Authorization` header through to PHP (some setups drop it, which breaks API tokens), and refuses hidden files. Point the virtual host at `public/` and allow the file to work:

```apache
<VirtualHost *:443>
    ServerName example.com
    DocumentRoot /var/www/kestello/public

    <Directory /var/www/kestello/public>
        AllowOverride All
        Require all granted
    </Directory>

    <FilesMatch "\.php$">
        SetHandler "proxy:unix:/run/php/php8.5-fpm.sock|fcgi://localhost"
    </FilesMatch>

    SSLEngine on
    SSLCertificateFile    /etc/letsencrypt/live/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/example.com/privkey.pem
</VirtualHost>
```

It needs `mod_rewrite`, `mod_proxy_fcgi` and `mod_ssl`.

The `.htaccess` in the site root is for hosts where the document root cannot be changed. It rewrites every request into `public/`, and refuses everything when `mod_rewrite` is missing rather than expose `config/` or `storage/`. On your own server, set the document root to `public/` instead.

## PHP-FPM

The [requirements](/guide/requirements) list the PHP version, extensions and `php.ini` limits. On a server you run, also check these:

| Setting | Why |
|---|---|
| PHP-FPM (or LiteSpeed), not `mod_php` | Kestello sends the response first and then does deferred work (mail for password resets, the web runner) after `fastcgi_finish_request()`. Without it, the web runner does not run at all. |
| `proc_open` not in `disable_functions` | The update probe runs a fresh `php bin/cms update:probe` process. Without `proc_open`, updates fall back to the HTTP probe. |
| `sodium` loaded | Required by Kestello's `core.json`, and needed to verify package signatures. |
| `opcache.enable=1` | Pages build much faster. |
| `opcache.validate_timestamps=1` | Updates replace PHP files in place and switch `core/current.php`. An update reset clears OPcache only in the process that runs it, so with `validate_timestamps=0` PHP-FPM keeps serving old code after an update from the command line. If you turn timestamps off, reload PHP-FPM after every update and deploy. |
| `clear_env = no` in the pool, or `env[KESTELLO_…]` lines | PHP-FPM hides the environment from PHP by default. Kestello reads `KESTELLO_*` variables (for example `KESTELLO_CACHE_DRIVER`) with `getenv()`. |
| `memory_limit = 256M`, `upload_max_filesize` and `post_max_size` matching nginx's `client_max_body_size` | Image resizing needs memory; Site Health warns when `post_max_size` is smaller than `upload_max_filesize`. |

A pool for one site:

```ini
; /etc/php/8.5/fpm/pool.d/kestello.conf
[kestello]
user = www-data
group = www-data
listen = /run/php/php8.5-fpm.sock
listen.owner = www-data
listen.group = www-data

pm = dynamic
pm.max_children = 20
pm.start_servers = 4
pm.min_spare_servers = 2
pm.max_spare_servers = 6
pm.max_requests = 500

clear_env = no
php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 64M
php_admin_value[post_max_size] = 64M
php_admin_value[max_execution_time] = 300
```

Size `pm.max_children` to your memory: roughly the memory you can give PHP divided by the memory one request uses.

## File permissions

| Folder | PHP needs | Why |
|---|---|---|
| `storage/` | read and write, recursively | Caches, logs, sessions, local storage disks (media, backups), maintenance mode, locks, compiled platform settings, staged packages. Site Health checks `storage/`, `storage/framework`, the logs folder and `storage/app`. |
| `config/` | read; write for the installer and `key:generate` | See below. |
| `content/plugins/`, `content/themes/` | read; write to install and update from the admin | If PHP cannot write here, install and update plugins and themes from the command line as the owner. |
| `core/` | read; write to update Kestello from the admin | The update writes `core/releases/<version>/` and `core/current.php`. |
| everything else | read | |

A setup where the deploy user owns the code and PHP can write only where it must:

```bash
cd /var/www/kestello
sudo chown -R deploy:www-data .
sudo find . -type d -exec chmod 750 {} +
sudo find . -type f -exec chmod 640 {} +
sudo chmod 750 bin/cms
sudo chmod -R ug+rwX storage
sudo find storage -type d -exec chmod g+s {} +
```

Add `sudo chmod -R g+w content/plugins content/themes core` if you want installs and core updates from the admin. Run `bin/cms` as `www-data` (`sudo -u www-data php bin/cms …`), so files it creates in `storage/` stay writable for PHP-FPM.

::: warning
Saving the **General** group under **Settings** in the admin writes the site name, description, address and timezone back into `config/app.php` when PHP can write to it, so they are known before the database is read. A file that contains code (`getenv()`, `$_ENV`, `$_SERVER`, `define()`, functions, `require` or `include`) is never written back: the values saved in the admin still apply from the database. Comments in a plain file are lost when it is written back.
:::

`config/app.php` holds `app.secret_key`, which decrypts secrets stored in the database. Keep it readable only by the owner and PHP (`640`).

## Cron

Run the scheduler every minute, as the PHP user:

```bash
sudo crontab -u www-data -e
```

```text
* * * * * php /var/www/kestello/bin/cms schedule:run --quiet
```

`schedule:run` runs the tasks that are due and exits with `1` if any of them failed. Unless `queue.worker` is `daemon`, one of those tasks (`queue.work`) works the queue for up to 50 seconds each minute, so a cron job alone runs background jobs too.

Each task's time slot is claimed in the database, so a slot runs once even when cron fires on several servers or together with the web runner. Running the same cron line on every server is safe.

Without cron, the **web runner** runs due tasks after a page response has been sent, at most once a minute. `cron.web_runner` controls it: `auto` (the default) runs only while no real cron or pinger has run in the last 5 minutes, `true` always, `false` never. `cron.web_runner_seconds` (default `20`, between 5 and 55) limits each run. Once a real cron job runs, `auto` stops by itself.

Where you cannot run cron at all, `bin/cms cron:token` turns on `POST /system/cron` for an external cron service; it prints the token to send in `Authorization: Bearer <token>`. The endpoint runs the scheduler at most once every 50 seconds.

Which of these runs your background work depends on what the server lets you do:

<Decide :tree="background" caption="How background work runs on your server" />

See [Configuration](/developers/configuration) for where these keys live.

## Queue workers

A worker process picks up jobs within seconds instead of once a minute. Run it under a supervisor that restarts it, because it exits on purpose: when `--max-jobs` or `--max-time` is reached, when memory passes `--memory`, on `SIGTERM`, `SIGINT` or `SIGQUIT` (after the current job), and after `queue:restart`. It exits with `0` in each case.

When a worker runs, tell the scheduler to stop working the queue itself by setting `queue.worker` to `daemon` in `config/queue.php`:

```php
<?php

return [
    'worker' => 'daemon',
];
```

With the default `cron`, the scheduler's `queue.work` task keeps running each minute next to your worker. That is harmless but wasteful.

### systemd

```ini
# /etc/systemd/system/kestello-worker@.service
[Unit]
Description=Kestello queue worker %i
After=network.target mysql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/kestello
ExecStart=/usr/bin/php bin/cms queue:work --max-time=3600 --memory=192
Restart=always
RestartSec=3
KillSignal=SIGTERM
TimeoutStopSec=120

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now kestello-worker@1 kestello-worker@2
```

Signal handling needs the `pcntl` extension in the command line PHP. Without it, `SIGTERM` stops the worker immediately instead of after the current job; give `TimeoutStopSec` room either way.

### supervisor

```ini
; /etc/supervisor/conf.d/kestello-worker.conf
[program:kestello-worker]
command=/usr/bin/php /var/www/kestello/bin/cms queue:work --max-time=3600 --memory=192
directory=/var/www/kestello
user=www-data
numprocs=2
process_name=%(program_name)s_%(process_num)02d
autostart=true
autorestart=true
stopsignal=TERM
stopwaitsecs=120
stdout_logfile=/var/www/kestello/storage/logs/worker.log
redirect_stderr=true
```

### Options

| Option | Default | Meaning |
|---|---|---|
| `--queue=<list>` | `high,default,mail,media,low` | Queues to work, in priority order. Run a separate worker with `--queue=media` if image work should not delay mail. |
| `--max-time=<s>` | `0` (no limit) | Exit after this many seconds. |
| `--max-jobs=<n>` | `0` (no limit) | Exit after this many jobs. |
| `--memory=<mb>` | `128` | Exit when memory use passes this. |
| `--sleep=<s>` | `3` | Wait between polls of an empty queue. |
| `--stop-when-empty` | off | Exit when there is nothing left. |
| `--quiet` | off | No output. |

Workers pause on their own while a restore rebuilds the database. `bin/cms queue:monitor` shows queue sizes and the last worker heartbeat; **System → Background jobs** shows the same in the admin.

### After a deploy

Workers are long-running PHP processes and keep the code they started with. After you change code on the server:

```bash
sudo -u www-data php bin/cms migrate
sudo -u www-data php bin/cms cache:clear
sudo -u www-data php bin/cms queue:restart
```

`queue:restart` stores a restart mark in the cache; each worker sees it after its current job, exits, and its supervisor starts it again on the new code. Because the mark lives in the cache, workers on other servers only see it when the servers share a cache store (Redis or the database), not with the default file cache.

## Redis

Redis (or Valkey, KeyDB, Dragonfly, a managed service) can hold the cache, sessions and the queue. Switch from the admin under **System → Infrastructure**, which tests the connection before saving, or from the command line:

```bash
sudo -u www-data php bin/cms platform:set cache redis host=127.0.0.1 password=@env:REDIS_PASSWORD
sudo -u www-data php bin/cms platform:set session redis host=127.0.0.1 password=@env:REDIS_PASSWORD
sudo -u www-data php bin/cms platform:show
```

Or pin it in `config/platform.php`, which locks the setting in the admin:

```php
<?php

return [
    'cache' => ['driver' => 'redis', 'url' => getenv('REDIS_URL') ?: null],
    'session' => ['driver' => 'redis', 'url' => getenv('REDIS_URL') ?: null],
];
```

| Option | Default | Meaning |
|---|---|---|
| `url` | none | `redis://user:pass@host:6379/0` or `rediss://…`. Overrides the fields below. |
| `host` | `127.0.0.1` | |
| `port` | `6379` | |
| `username`, `password` | none | |
| `database` | `0` | `0` to `15`. |
| `tls` | `false` | |
| `timeout` | `2.0` | Seconds. |
| `prefix` | empty | Key prefix. Empty means `kst:<site id>:<c\|s\|q>:`, where the site id comes from the site's folder path. |

For the queue, use a Redis that persists to disk (`appendonly yes`), so queued jobs survive a Redis restart. If Redis goes away, new jobs go to the database queue instead of being lost.

The [configuration reference](/developers/configuration) lists the environment variables (`KESTELLO_<SUBSYSTEM>_<OPTION>`) and the precedence of the layers.

## HTTPS and proxies

Set `app.url` to the `https://` address. Site Health reports a live site without HTTPS as critical.

Behind a load balancer, CDN or reverse proxy that terminates TLS, two things need configuring:

1. **The client address.** List the proxies in `app.trusted_proxies` (IPs or CIDR ranges, IPv4 and IPv6). Kestello then reads `X-Forwarded-For` from the right and takes the first address that is not a trusted proxy. With the list empty (the default), the client address is always the connecting address, so a client cannot fake its address to dodge per-IP rate limits.

   ```php
   'trusted_proxies' => ['10.0.0.0/8', '192.168.1.10'],
   ```

2. **Secure cookies.** Kestello marks cookies `Secure` when PHP sees `HTTPS` set, port 443, or `X-Forwarded-Proto: https` from an address in `app.trusted_proxies`. If your proxy sends none of these, set `fastcgi_param HTTPS on;` in the nginx that talks to PHP-FPM, or set `app.secure_cookies` to `true` in `config/app.php`.

## Several servers, one database

Kestello can run on several web servers behind a load balancer, sharing one database. Some state must be shared, and some stays on each server by design:

<Compare :columns="sharing" caption="What several servers share, and what each keeps for itself" />

What has to be shared:

| What | How |
|---|---|
| Database | One MySQL, MariaDB or PostgreSQL server for all. |
| Sessions | The default `database` driver, or Redis. Not `file`. |
| Cache | Redis or `database`. The default `file` cache is per server, so pages purged on one server stay cached on the others, and `queue:restart` does not reach their workers. |
| Media and backups | An S3-compatible disk in `config/storage.php`, or a shared filesystem mounted at `storage/app`. Move existing media with `bin/cms media:move --to=<disk>`. |
| Code | The same `core/`, `content/plugins/` and `content/themes/` on every server, deployed by your own process. |

Three things are per server, by design:

- **Compiled infrastructure settings.** Each server keeps `storage/framework/platform.php`, built from the database. A change saved under **System → Infrastructure** rebuilds it only on the server that handled the request. Run `php bin/cms platform:compile` on the other servers after such a change and after each deploy.
- **Maintenance mode** is a file, `storage/framework/maintenance.json`. Restores and updates turn it on only on the server that runs them.
- **Updates from the admin** change files only on the server that handled the request. On several servers, install and update plugins, themes and Kestello through your deploy process, then run `migrate` once.

When several servers share one Redis, set the same `prefix` on all of them, or install the site at the same path everywhere. The default prefix is derived from the site's folder path, so servers with different paths would not share keys.

## Backups off the server

Kestello's scheduled backups (nightly by default, under **Site → Backups**) are written to the `backups` storage disk, which is `storage/app/backups` on the same server. Put that disk somewhere else so a lost server does not take its backups with it:

```php
<?php
// config/storage.php
return [
    'disks' => [
        'backups' => [
            'driver' => 's3',
            'bucket' => 'example-backups',
            'region' => 'eu-central-1',
            'key' => getenv('BACKUP_S3_KEY'),
            'secret' => getenv('BACKUP_S3_SECRET'),
        ],
    ],
];
```

```bash
sudo -u www-data php bin/cms storage:test backups
```

Or copy `storage/app/backups/` off the server with your own tool (rsync, restic, your host's snapshots).

A backup holds the database and, when **Include files (uploads, plugins, themes)** is on, `content/plugins`, `content/themes`, uploads, `storage/fonts`, `storage/forms` and `storage/plugins`. Scheduled backups leave the files out until you turn that switch on under **Site → Backups**. Files on S3 and other remote disks are not copied. A backup does not hold `config/`. Keep a copy of `config/app.php` and `config/database.php` somewhere safe as well: without the same `app.secret_key`, secrets stored in the database (mail passwords, API keys) cannot be decrypted after a restore on a new server.

See [Backups](/guide/backups) for restoring.

## Health monitoring

```bash
sudo -u www-data php bin/cms health
sudo -u www-data php bin/cms health --json
sudo -u www-data php bin/cms health --only=core.database,core.queue,core.scheduler
```

| Exit code | Meaning |
|---|---|
| `0` | Nothing critical. Recommendations may be listed. |
| `2` | At least one check is critical. |

Check ids include `core.database`, `core.drivers`, `core.queue`, `core.scheduler`, `core.storage`, `core.writable`, `core.disk-space`, `core.backups`, `core.https`, `core.debug`, `core.app-key`, `core.php-version`, `core.php-extensions`, `core.php-limits`, `core.private-files`, `core.mail`, `core.update-stopped`, `core.advisories`, `core.extensions`, `core.page-cache`, `media.images` and `search`; plugins add their own. `--json` prints the full report with each check's `id`, `status`, `message` and `details`.

A cron line for a monitor that only needs the exit code:

```text
*/5 * * * * php /var/www/kestello/bin/cms health > /dev/null 2>&1 || curl -fsS https://monitor.example.com/alert
```

For an HTTP uptime check, `GET /api/v1/status` answers `200` with `{"data":{"status":"ok","time":"…"}}` once PHP has booted the site. It does not run the Site Health checks. Kestello also runs Site Health hourly itself and notifies administrators about new critical problems.

## Core releases {#core-releases}

A production site runs Kestello from release folders:

```text
core/
├── current.php           return '0.2.0';
└── releases/
    ├── 0.1.0/
    └── 0.2.0/
```

`core/current.php` names the running release. `public/index.php` and `bin/cms` read it on every request. A core update unpacks the new release next to the others and renames a new `current.php` over the old one, so the switch is atomic and a failed update switches back the same way. While the new release is checked, `current.php` is a trial pointer: it names the new release only while the updater holds the update lock, so if PHP is stopped halfway, the next request loads the release that ran before. After a successful update, the running release, the previous one and one more are kept; older folders are deleted.

<Flow :steps="coreSwitch" caption="How a core update switches release folders" />

```bash
sudo -u www-data php bin/cms core:update --status
```

```text
  Kestello 0.2.0 (release folders)
    * 0.2.0
      0.1.0
```

A development checkout has no `current.php` and runs `core/` directly. Its first core update creates the pointer.

Updates come from release zips built with `core:release`. Apply them from **Site → Updates** or with `core:update`; [Packaging and signing](/developers/packaging#releases-of-kestello) describes the checks, the backup and the rollback.

::: tip
When you run PHP-FPM with `opcache.validate_timestamps=0`, reload PHP-FPM after `core:update` on the command line. Otherwise PHP-FPM keeps the old `current.php` in OPcache and serves the old release.
:::

## Server-side rendering

The optional SSR process (`node core/ssr/server.mjs`) is a long-running Node.js 22.15 or newer process. Run it under systemd like a worker, bound to localhost (`SSR_HOST`, default `127.0.0.1`; `SSR_PORT`, default `13714`), and point `app.ssr.url` (or `KESTELLO_SSR_URL`) at it:

```ini
# /etc/systemd/system/kestello-ssr.service
[Unit]
Description=Kestello SSR
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/kestello
Environment=SSR_HOST=127.0.0.1 SSR_PORT=13714 KESTELLO_ROOT=/var/www/kestello
ExecStart=/usr/bin/node core/ssr/server.mjs
Restart=always

[Install]
WantedBy=multi-user.target
```

It loads Vue's server renderer from `node_modules/` in the site root (`KESTELLO_ROOT`). In a checkout, run `npm install` there. A site installed from the install zip has no `package.json`: run `npm install vue@3.5.45` in its root, the version in `core/resources/assets/vendor/`. Kestello waits for a page at most `app.ssr.timeout` seconds (default `1.5`). If the process is down or slow, pages render in the browser; see [Frontend](/developers/frontend).

A plugin or theme rebuilt while the process runs is picked up on the next render. Kestello itself is not: restart the process after a core update. On a site that runs from release folders, the running release's renderer is `core/releases/<version>/ssr/server.mjs`, and `core/ssr/server.mjs` is the one the site was installed with, so point `ExecStart` at the release folder that `core/current.php` names.

## If something goes wrong

**Site Health: "Kestello cannot write to: storage/framework, … Check folder permissions."** PHP-FPM's user cannot write there. Fix ownership, and run `bin/cms` as the same user so it does not create files PHP-FPM cannot change.

**"The queue driver is "sync": jobs run when pushed, there is nothing to work on."** from `queue:work`. The queue subsystem uses the `sync` driver. Switch it to `database` or `redis`.

**Jobs pile up although a worker runs.** Check `bin/cms queue:monitor` for the last heartbeat. Workers pause during restores; one that never comes back usually crashed on start, so read the supervisor's log.

**Background jobs run once a minute although a worker runs.** `queue.worker` is still `cron`. Set it to `daemon`.

**"Could not read platform settings from the database."** from `platform:compile`. The database is not reachable from this server.

**Rate limits hit everyone at once, or every request comes from the proxy's address.** `app.trusted_proxies` is empty behind a proxy.

**Sign-in does not stick behind a proxy.** Cookies are not marked `Secure` correctly or are dropped. Set `fastcgi_param HTTPS on;` or `app.secure_cookies`.

**API tokens are ignored on Apache.** The `Authorization` header does not reach PHP. Check that `public/.htaccess` is used (`AllowOverride All`) or copy its `HTTP_AUTHORIZATION` rule into the virtual host.

**"Another update is running. Try again when it has finished."** An update or the rollback of one holds `storage/framework/update.lock`.

**"The core folder is not writable by PHP, so the release cannot be put in place."** Run `core:update` as the owner of `core/`, or give PHP write access to it.

**Visitors see the maintenance page long after an update.** A rollback that could not finish keeps visitors out for up to 7 days, so someone looks first. Signed-in administrators still get in. Fix the cause, then delete `storage/framework/maintenance.json`.

## Next

- [Configuration](/developers/configuration): every key mentioned here.
- [Packaging and signing](/developers/packaging): building and applying updates.
- [Command line](/developers/cli): all `bin/cms` commands.
- [Backups](/guide/backups) and [Updates](/guide/updates): the same tasks in the admin.
