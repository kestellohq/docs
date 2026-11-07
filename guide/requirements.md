# Requirements

Kestello runs on ordinary web hosting: shared hosting, a virtual server (VPS) or Docker. It needs PHP, a database and a web server, and nothing else. There is no Node.js, Composer or other tool to install on the server.

Use this page to check a hosting plan before you buy it, or to check the server you already have. The installer checks the same things again on its first screen, so you will not get halfway through an installation and find out something is missing.

## In short

| | Minimum | Recommended |
|---|---|---|
| PHP | 8.4 | 8.5 |
| Database | MySQL 8, MariaDB 10.6, PostgreSQL 13 or SQLite 3.35 | MySQL 9.7 or PostgreSQL 18 |
| PHP memory limit | 128 MB | 256 MB |
| Disk space | 200 MB plus your uploads and backups | 1 GB free at all times |
| Web server | Apache with `.htaccess` support, or nginx | Either, with HTTPS |

Most hosting plans sold in the last few years meet this. If your host offers a choice of PHP versions in its control panel, pick the newest it offers, and at least 8.4.

## PHP

Kestello needs **PHP 8.4 or newer**. PHP 8.4 receives security fixes until the end of 2028, and PHP 8.5 until the end of 2029. On an older PHP, every page shows a short message saying which version is needed. Site Health (under **System → Site Health**) warns you when the PHP version your site runs on stops getting security fixes.

### Extensions

PHP comes in pieces called extensions. Hosts turn most of them on by default; some control panels have a page where you can switch them on yourself.

**Required.** Kestello will not install without these:

| Extension | Used for |
|---|---|
| `pdo` and one of `pdo_mysql`, `pdo_pgsql` or `pdo_sqlite` | Talking to the database. You only need the one for the database you use. |
| `mbstring` | Handling text in every language correctly |
| `sodium` | Encryption and checking the signatures of plugins and updates |
| `json` | The admin and the API |
| `zlib` | Backups, packages and compressing pages |
| `ctype` | Checking form input |

**Recommended.** Kestello works without these, with the limits described:

| Extension | Without it |
|---|---|
| `gd` or `imagick` | Images are stored as uploaded. No resized versions, no WebP or AVIF. With `imagick`, AVIF support depends on how the host built it. |
| `intl` | Dates, numbers and plural forms are not localised for your visitors' language. |
| `fileinfo` | Kestello cannot double-check the real type of uploaded files as reliably. |
| `curl` | Connections to other services (mail providers, search engines, update checks) are slower and less reliable. |
| `opcache` | Every page takes noticeably longer to build. |

After installing, **System → Site Health** lists any recommended extension that is missing.

### PHP settings

| Setting | What to use | Why |
|---|---|---|
| `memory_limit` | 128M or more | Resizing large photos needs memory. |
| `upload_max_filesize` | The largest file you will upload, for example 64M | Larger uploads are refused by PHP before Kestello sees them. |
| `post_max_size` | Equal to or larger than `upload_max_filesize` | If it is smaller, large uploads fail without a clear error. |
| `max_execution_time` | 60 or more | Backups and updates of large sites take a while. Kestello asks for more time when it can, but some hosts do not allow that. |

## Database

Kestello works with any of these, and you can move a site from one to another later with a backup:

- **MySQL 8.0 or newer**, or **MariaDB 10.6 or newer**. Offered by nearly every host. The usual choice.
- **PostgreSQL 13 or newer**. Common on managed cloud platforms.
- **SQLite 3.35 or newer**. The database is a single file inside the site's `storage` folder, so there is nothing to set up. Good for small sites and trying Kestello out. Not a good fit for sites with many editors saving at the same time.

For MySQL, MariaDB and PostgreSQL you need a database and a user that can create tables in it. Most control panels have a "MySQL databases" page that creates both and shows you the details. Write down the database name, the user name, the password and the host (often `localhost`). The installer asks for them.

## Web server

Kestello's front door is the file `public/index.php`. The web server has to send every request it cannot answer with a real file to that file.

- **Apache** (most shared hosting): Kestello ships `.htaccess` files that do this. Your host must allow `.htaccess` files and have `mod_rewrite` on. Almost all do.
- **nginx**: needs a short configuration block, shown in [Installing Kestello](/guide/installation#nginx).
- **Others** (Caddy, LiteSpeed, IIS): any server that can point the site at `public/` and route unknown paths to `public/index.php` works.

Ideally the site's **document root** (the folder the web server shows to visitors) is the `public` folder. If your host does not let you choose it, Kestello's top-level `.htaccess` file sends visitors to `public` for you and keeps the other folders out of reach.

## Folders PHP must be able to write to

Kestello writes to a few folders: the installer saves its settings, uploads are stored, backups and caches are written. The PHP process needs write access to:

| Folder | Why |
|---|---|
| `config/` | The installer writes the database details and site settings here. |
| `storage/` | Caches, logs, sessions, backups, and the SQLite database if you use one. |
| `content/` | Uploads, and plugins or themes you install from the admin. |
| `core/` | Only if you want to update Kestello itself from the admin. |

On shared hosting this is usually already the case. On a VPS, the folders must belong to the user the web server runs PHP as (often `www-data`).

## Background tasks

Some work happens in the background: sending email, making image sizes, nightly backups, publishing scheduled content. Kestello can do this in two ways:

- **With a cron job** (recommended). Most control panels have a "Cron jobs" page. Add one that runs every minute. The exact line is shown in [Installing Kestello](/guide/installation#background-tasks).
- **Without one.** If your host has no cron, Kestello runs due tasks at the end of ordinary page visits. This works, but tasks run late on a quiet site.

## HTTPS

Use HTTPS for any site that is on the internet. Without it, passwords travel unencrypted. Most hosts provide free certificates (often labelled "Let's Encrypt" or "SSL"). Site Health warns you when a live site runs without HTTPS.

## Next

[Install Kestello](/guide/installation).
