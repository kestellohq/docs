<script setup>
const background = [
    { title: 'Something starts the scheduler', text: 'Every minute: a cron job running schedule:run, the web runner after a page is sent, or an outside service calling /system/cron.' },
    { title: 'The scheduler', text: 'Runs the tasks that are due, listed under System → Scheduled tasks.' },
    { title: 'queue.work', text: 'One of those tasks: it runs the waiting background jobs.', tone: 'brand' },
    { title: 'Failed jobs', text: 'Jobs that used up their retries, under System → Background jobs.', tone: 'muted' },
];
const nightly = [
    { at: '00:00', title: 'Logs and submissions', text: 'redirects.prune-log, forms.prune-submissions' },
    { at: '02:30', title: 'Backup', text: 'backups.run', tone: 'brand' },
    { at: '03:10', title: 'Audit log and old links', text: 'audit.prune' },
    { at: '03:20', title: 'Failed jobs', text: 'queue.prune-failed' },
    { at: '03:30', title: 'Expired tokens', text: 'auth.prune-tokens' },
    { at: '03:35', title: 'Preview links', text: 'content.prune-previews' },
    { at: '03:40', title: 'Notifications and deliveries', text: 'notifications.prune, webhooks.prune' },
];
</script>

# Site Health

Site Health is a set of checks Kestello runs on itself: the PHP version, folders it must write to, the database, email, backups, background tasks and more. This page explains each check, what its result means and how to fix it. Read it when the **Overview** screen says something needs you, when you get a "Your site needs attention" email, or before a site goes live.

## Open Site Health

1. In the admin, open **System → Site Health**.
2. Read the line at the top. It sums up every check:
   - **Your site is healthy**: every check passed.
   - **Your site works, with a few recommendations**: nothing is broken, but some things could be better.
   - **Your site has critical problems**: something is broken or unsafe. Fix it first.
3. Under the summary you see **Checked** with the time of the report and a count such as "14 passed, 5 recommended, 0 critical".
4. The tabs filter the list: **Needs attention** (the default, critical and recommended together), **Critical**, **Recommended**, **Passed** and **All**.
5. Select a check to open it. You see the full message, details such as version numbers or sizes, the check's id (for example `core.scheduler`), and sometimes a button that takes you to the screen where you fix it.

![Site Health: a summary of the checks, then the checks that need attention.](/screenshots/health.png)

You only see **Site Health** if your role has the permission *Manage infrastructure, background jobs, scheduled tasks and Site Health*. Administrators have it.

### The buttons at the top

| Button | What it does |
|---|---|
| **Run checks again** | Runs every check now. The report is otherwise kept for five minutes, because some checks contact other servers. Use this after you fix something. |
| **Copy debug info** | Copies a summary of the system and of every check result to your clipboard, to paste into a message to your developer or host. It contains no passwords or keys. |
| **Clear page cache** | Empties the cache of finished pages. Only shown if you may change settings. See [Troubleshooting](/guide/troubleshooting#old-content). |

## What the results mean

Every check ends in one of three results:

| Result | Meaning | What to do |
|---|---|---|
| **Passed** (good) | Nothing to do. | Nothing. |
| **Recommended** | The site works, but something is slower, less reliable or less safe than it should be. | Plan to fix it, for example this week. |
| **Critical** | Something is broken, unsafe, or will break soon. | Fix it now. |

Each check also has a category shown next to it: **security**, **performance**, **reliability** or **configuration**. Critical checks are listed first.

A check that fails to run at all is shown as critical with the message "The check itself failed:" followed by the error. That usually means a plugin's check has a bug, or a service it contacts is down.

## Email alerts

Once an hour (at 23 minutes past), Kestello runs every check in the background. When a check becomes critical that was not critical the last time, every active account with the Site Health permission gets a notification in the admin and an email titled **Your site needs attention**, with an **Open Site Health** button. You are told once per new problem, not every hour.

For these emails to arrive, background tasks must run (see [Scheduled tasks](#core-scheduler) below) and email must work (see [Email delivery](#core-mail)).

## The checks

The checks below come with Kestello. Plugins can add their own; those show the plugin's name as their owner when you open them.

### PHP version {#core-php-version}

Which PHP version the server runs.

- **Passed**: "PHP 8.5.12 is supported." (with your version number).
- **Critical**: "no longer gets security fixes. Ask your host for PHP 8.5 or newer." PHP 8.4 is treated as supported until the end of 2028; after that this check turns critical on PHP 8.4.

**Fix**: choose a newer PHP version in your hosting control panel (often under **PHP Selector** or **PHP Version**). See [Requirements](/guide/requirements).

### PHP extensions {#core-php-extensions}

Extensions are optional parts of PHP that hosts turn on or off.

- **Critical**: "Missing required extensions:" followed by the list. Kestello needs `pdo` (database access), `mbstring` (text handling), `sodium` (encryption), `json`, `zlib` (zip and compression) and `ctype` (validation).
- **Recommended**: "Install for the best experience:" followed by the list. These make Kestello better but are not required: `intl` (translations, plurals and number formatting), `fileinfo` (reliable upload type detection), `curl` (faster, more reliable HTTP requests), `opcache` (much faster page loads) and `gd` or `imagick` (image resizing).

**Fix**: turn the extensions on in your control panel (often **PHP Extensions**). On a VPS, install the matching package, for example `php8.5-intl`, and restart PHP.

### Deprecated hooks {#core-deprecated-hooks}

Plugins and themes work by listening to events and filters, called hooks, that Kestello offers. When a hook is replaced, the old one keeps working for at least one more release so plugin authors have time to update.

- **Passed**: "No plugin or theme uses a deprecated hook."
- **Recommended**: "Some plugins or themes use hooks that a later Kestello version removes." followed by each plugin, the hooks it uses and the version that removes them.

**Fix**: update the plugins it names before you update Kestello past that version. If no update exists, tell the plugin's author; the message names everything they need to change.

### Encryption key {#core-app-key}

Kestello uses a secret key to encrypt stored secrets (such as the SMTP password) and to sign links such as the recovery link.

- **Critical**: "No application key is set, so secrets and signed links are not protected."

**Fix**: the installer sets the key, so this usually means `config/app.php` was replaced or edited. If you have the old `config/app.php` in a backup or on your computer, put it back: secrets stored with the old key can only be read with that key. Only if there is no old key, run this from the site's root folder:

```bash
php bin/cms key:generate
```

### Debug mode {#core-debug}

Debug mode shows detailed error pages with code and file paths. It helps developers and must be off on a live site.

- **Passed**: "Debug mode is off."
- **Recommended**: "Debug mode is on. That is fine for local development; turn it off before going live." Shown when the site address is a development address such as `localhost` or one ending in `.test`.
- **Critical**: "Debug mode is on. Error pages can reveal code, paths and settings to visitors. Turn it off on live sites."

**Fix**: open `config/app.php` and set `'debug' => false`. The installer writes `false`, so someone turned it on.

### HTTPS {#core-https}

Whether the site address starts with `https://`.

- **Passed**: "The site uses HTTPS."
- **Recommended**: "The site address (app.url) is not set, so links in emails and from the scheduler may be wrong." Or, on a development address: "The site runs on a local development address without HTTPS."
- **Critical**: "The site address does not use HTTPS. Passwords and sessions can be intercepted."

**Fix**: turn on a certificate in your control panel (often labelled "SSL" or "Let's Encrypt"). Check that `https://` works in the browser, then change **Site address** under **Site → Settings** to start with `https://`.

### Writable folders {#core-writable}

Kestello checks that it can write to `storage`, `storage/framework`, `storage/logs` and `storage/app` (uploads).

- **Critical**: "Kestello cannot write to:" followed by the folders, then "Check folder permissions."

**Fix**: give those folders permission `755` (or `775` if your host says so) in your file manager or FTP program. On a VPS, make the web server's user (often `www-data`) the owner. See [Troubleshooting](/guide/troubleshooting#permission-errors).

### Private folders {#core-private-files}

Whether browsers can read files that must stay on the server. Kestello writes a one-time secret into `storage/`, asks your site for it over the web, and deletes it again.

- **Passed**: "Browsers cannot read config/, storage/, core/ or content/." When the site address isn't set or the server cannot reach itself, the check passes with a note that it could not check.
- **Critical**: "Files in storage/ can be downloaded from the web", followed by what to do. Settings, sessions, logs and backups are probably readable by anyone.

**Fix**: set the domain's document root to the `public` folder (see [Installation](/guide/installation)). On nginx, if you cannot, deny `/config`, `/storage`, `/core` and `/content` in the server block. On Apache, make sure `.htaccess` files are allowed (`AllowOverride All`).

### Free disk space {#core-disk-space}

How much space is left on the disk that holds `storage`.

- **Recommended**: "Less than 1 GB of disk space is left".
- **Critical**: below 200 MB: "Uploads, caches and backups will start failing."
- On some hosts the space cannot be measured; the check then passes with "Free disk space could not be measured on this host."

**Fix**: delete old backups under **Site → Backups**, or keep backups on outside storage (see [Backups](/guide/backups)). Delete media you no longer use. Ask your host for more space if needed.

### PHP limits {#core-php-limits}

PHP's memory and upload limits.

- **Recommended**: "PHP memory_limit is … ; at least 128M is recommended."
- **Recommended**: "post_max_size is smaller than upload_max_filesize, so large uploads fail without a clear error."

**Fix**: in your control panel's PHP settings (often **PHP Options** or **php.ini editor**), set `memory_limit` to at least `128M`, and make `post_max_size` at least as large as `upload_max_filesize`.

### Database {#core-database}

Kestello runs a tiny query and measures how long the database takes to answer.

- **Passed**: "The database is reachable." The details show the database type and version.
- **Recommended**: "The database answered slowly" when it takes more than 250 milliseconds.

If the database cannot be reached at all, the admin does not open, so you will not see this check fail; see [Troubleshooting](/guide/troubleshooting#white-page).

**Fix for slow answers**: usually the database server is busy or far away. Ask your host. With a managed database, check that it is in the same region as your site.

### Infrastructure drivers {#core-drivers}

Kestello can keep its cache, sessions, background jobs and search in different services (for example Redis). These choices are made under **System → Infrastructure**. When a chosen service stops answering, Kestello switches to a built-in fallback so the site keeps working.

- **Critical**: "Running on a fallback because a driver failed." followed by which service failed and why. A **Review drivers** button opens **System → Infrastructure**.

**Fix**: open **System → Infrastructure**, find the service marked **Fallback active**, and use **Test connection** to see the error. Usually the outside service (such as Redis) is down, or its address or password changed. Fix the service, or change the driver back.

### Updates {#core-update-stopped}

Checks that no update of Kestello, a plugin or a theme stopped halfway without being put back. Normally the site puts such an update back by itself on the next request; this check fails when that did not work three times. It also notices an update that has been running for more than 15 minutes.

- **Passed**: "No update stopped halfway."
- **Recommended**: "The update of … is still running." Most likely the host stopped the update while its check kept running. The site puts the update back once that check ends. If this stays for an hour, ask your host to restart PHP for your site.
- **Critical**: "The update of … stopped halfway and was not put back." An **Open Updates** button opens **Site → Updates**.

**Fix**: see [If going back did not finish](/guide/updates#incomplete-rollback).

### Scheduled tasks {#core-scheduler}

Kestello does recurring work on a schedule: publishing posts set for later, nightly backups, cleanup, and running background jobs. Something has to start the scheduler every minute. This check looks at when it last ran.

- **Passed**: "Scheduled tasks are running."
- **Recommended**: last run more than 10 minutes ago: "they should run every minute."
- **Critical**: "Scheduled tasks have never run." or last run more than an hour ago: "Cleanup, emails and plugin tasks are not running."

**Fix**: add a cron job that runs every minute, as described in [Installing Kestello](/guide/installation#background-tasks):

```bash
php /home/youraccount/kestello/bin/cms schedule:run
```

If your host has no cron, see [Without a cron job](#without-a-cron-job) below.

### Background jobs {#core-queue}

Some work is put in a queue and done shortly after, outside the page request: sending email, making image sizes, imports, plugin jobs. This check looks at the queue.

- **Passed**: "Background jobs are being processed." Or, when the queue is set to run jobs straight away: "Jobs run immediately during requests (sync driver)."
- **Recommended**: "job(s) failed. Retry or remove them." A **Failed jobs** button opens **System → Background jobs**.
- **Critical**: jobs have waited more than 10 minutes and "no worker has been seen for 10 minutes."

**Fix**: by default the scheduler works through the queue every minute, so this is nearly always the same problem as [Scheduled tasks](#core-scheduler): fix the cron job. For failed jobs, open **System → Background jobs** (see [below](#background-jobs)).

### Storage disks {#core-storage}

Kestello writes a small test file to every storage disk (where uploads and backups are kept), reads it back and deletes it.

- **Passed**: "Every storage disk can be written and read back."
- **Critical**: "Storage problems:" followed by the disk and the error.

**Fix**: for the local disks, check folder permissions as for [Writable folders](#core-writable). For an outside service such as S3, check that its keys and bucket are still valid. Disks are set up in `config/storage.php`; **System → File storage** shows the disks the media library can use. From the server, `php bin/cms storage:test` checks every disk end to end.

### Email delivery {#core-mail}

- **Passed**: "Email is sent through SMTP."
- **Recommended**: "Email uses PHP mail(), which often lands in spam or is disabled by hosts. Configure SMTP in settings." A **Mail settings** button opens **Site → Settings**.

**Fix**: enter your mail provider's SMTP details under **Site → Settings → Email** and use **Send a test email**. See [Your first hour](/guide/first-steps#email).

### Plugins and themes {#core-extensions}

- **Passed**: "1 active plugin(s) loaded without problems." (with your number).
- **Critical**: "The site is in recovery mode: plugins are not loaded." You opened the site with a recovery link; see [Plugins](/guide/plugins).
- **Critical**: a plugin or theme "was suspended after an error", followed by the error. Kestello switched it off on its own because it crashed the site.
- **Critical**: a plugin "was not loaded", followed by the reason (for example a plugin it needs is missing).
- **Critical**: "no theme could be loaded".

**Fix**: open **Plugins → Manage plugins** to see which plugin is affected. See [Plugins](/guide/plugins) for how suspension works and how to bring a plugin back once it is fixed.

### Security advisories {#core-advisories}

Compares the security advisories in the [plugin and theme registry](/guide/plugins) with the Kestello version you run and the plugins and themes you installed from the registry. A plugin or theme you uploaded as a zip is not checked, because it can share a name with an unrelated package in the registry.

- **Passed**: "No security advisory applies to this Kestello version or to the plugins and themes installed from the registry."
- **Passed**: "The plugin and theme registry is turned off", or "Security advisories are checked once the site has read the plugin and theme registry." Nothing is checked yet.
- **Recommended**: "A security advisory applies to this site." followed by each package, its version, the advisory and its severity. Shown when every advisory that applies is low or medium.
- **Critical**: the same, when any advisory that applies is high or critical. Administrators get an [email alert](#email-alerts).
- **Recommended**: "Security advisories could not be checked:" followed by the reason.

Each line ends with "Update to … or later.", or "No fixed version yet: consider deactivating it." An **Open Updates** button opens **Site → Updates**. **Fix**: install the update. Without a fixed version, deactivate the plugin or theme until there is one.

### Page cache {#core-page-cache}

Kestello can keep finished pages ready for visitors who are not signed in, which makes the site much faster.

- **Passed**: "Pages are cached for visitors who aren't signed in, and refreshed when content changes."
- **Recommended**: "Pages are rendered for every visitor. Turn the page cache on under Settings → Performance."

**Fix**: open **Site → Settings**, choose **Performance** and turn on **Cache pages**. The page cache is off by default while debug mode is on.

### Backups {#core-backups}

- **Passed**: "The newest backup is from" followed by the date.
- **Recommended**: "There is no backup of this site yet."
- **Recommended**: "Scheduled backups are on, but the newest is … days old. Check that the scheduler runs." Shown when the newest backup is older than 2 days with daily backups, or 8 days with weekly backups.
- **Recommended**: "Scheduled backups are off and the newest backup is … days old." Shown after 7 days.

An **Open backups** button opens **Site → Backups**. **Fix**: make a backup, and check [Scheduled tasks](#core-scheduler). See [Backups](/guide/backups).

### Image processing {#media-images}

Whether the server can resize images and make modern image formats.

- **Passed**: the message names the engine (`imagick` or `gd`) and the modern formats it serves, WebP and AVIF, depending on what the server supports.
- **Recommended**: "No image engine is installed, so images are served as uploaded: no smaller sizes, no WebP or AVIF, and photos keep their location data."
- **Recommended**: images are resized, "but it can't write WebP, so pages are heavier than they need to be."

The details also show whether lossless optimizers and PDF thumbnails (Ghostscript) are available.

**Fix**: ask your host to turn on the `imagick` or `gd` PHP extension, built with WebP support. See [Media](/guide/media).

### Site search {#search}

- **Passed**: "Search is working."
- **Recommended**: "Search uses simple text matching because the database has no full-text index. Results are less relevant and slower on large sites."
- **Critical**: "The search engine can't be reached, so search answers from the database:" followed by the error. Shown when search is set to an outside engine under **System → Infrastructure** and it does not answer.
- **Critical**: "Search is not working:" followed by the error.

**Fix**: see [Search](/guide/search).

### Demo {#core-demo}

Only on a [public demo](/guide/demo).

- **Passed**: "The demo resets every hour." Or, when the hour is up but scheduled tasks have not run since (a quiet demo without cron): "The demo resets the next time scheduled tasks run."
- **Critical**: "The demo has no snapshot, so it cannot reset." Run `php bin/cms demo:snapshot` on the server.
- **Critical**: "The demo should have reset N minutes ago, but did not." Scheduled tasks ran, but the reset failed. Open **System → Scheduled tasks** and look at `demo.reset` for the error.

## Check from the command line {#command-line}

The same checks run from a terminal, which is useful on a VPS and for monitoring tools. From the site's root folder:

```bash
php bin/cms health
```

```text
  RECOMMENDED  Backups                    There is no backup of this site yet.
  RECOMMENDED  Email delivery             Email uses PHP mail(), which often lands in spam or is disabled by hosts. Configure SMTP in settings.
  GOOD         Site search                Search is working.
  GOOD         Database                   The database is reachable.
  GOOD         Scheduled tasks            Scheduled tasks are running.
  ...
  14 good, 5 recommended, 0 critical.
```

The command always runs fresh checks, never the five-minute report.

| Option | What it does |
|---|---|
| `--json` | Prints the full report as JSON, with each check's id, status, message and details. |
| `--only=core.scheduler,core.queue` | Runs only the checks with these ids. The ids are listed above and shown when you open a check in the admin. |

The command ends with exit code `2` when any check is critical, and `0` otherwise. A monitoring tool or a cron job can use this to alert you. For example, this cron line emails the cron job's owner only when something is critical (most hosts mail cron output to the account's address):

```bash
php /home/youraccount/kestello/bin/cms health > /dev/null || echo "Kestello Site Health has critical problems"
```

## Scheduled tasks and background jobs

Two screens under **System** show the background machinery in detail. Both depend on one thing: something has to start the scheduler every minute. The scheduler runs the tasks that are due, and one of them, `queue.work`, runs the background jobs.

<Flow :steps="background" caption="How background work gets done" />

![Scheduled tasks: each task with its schedule, next run, last run and a Run now button.](/screenshots/scheduled-tasks.png)

### Scheduled tasks {#scheduled-tasks}

**System → Scheduled tasks** lists every recurring task with its **Schedule** (in cron notation), **Next run**, **Last run** (with its result and how long it took) and an **Enabled** switch. Tasks added by plugins show the plugin's name.

- **Run now** runs one task straight away. Use it to test, for example, the backup task.
- **Output** (next to the last run) shows what the task reported.
- Turning **Enabled** off pauses a task until you turn it on again.

If the scheduler is late, a warning at the top says **The scheduler is behind** (with the time and the way it last ran: `cron`, `cli`, `web` or `http`) or **The scheduler has never run**.

The tasks Kestello ships with. Times are on the clock of the timezone set under **Settings → General**:

| Task | When | What it does |
|---|---|---|
| `queue.work` | every minute | Runs waiting background jobs. |
| `content.publish-scheduled` | every minute | Publishes content whose publish time has come. |
| `webhooks.retry` | every minute | Sends again the [webhook](/guide/webhooks) deliveries whose next try is due. |
| `media.purge-uploads` | hourly, on the hour | Removes uploads nobody finished within a day. |
| `sessions.gc` | hourly, at 17 past | Removes expired sessions. |
| `updates.check` | hourly, at 17 past | Asks GitHub whether a new Kestello version is out, when the hours set in `release.check_every` have passed. It installs nothing. |
| `cache.prune` | hourly, at 23 past | Removes expired cache entries and rate-limit counters, which otherwise pile up in `storage/` or the cache table. |
| `health.check` | hourly, at 23 past | Runs Site Health and tells administrators about new critical problems. |
| `updates.packages` | hourly, at 27 past | Asks where plugins and themes publish their updates for new versions. It installs nothing. |
| `updates.registry` | hourly, at 37 past | Fetches and checks the plugin and theme registry's list, every 12 hours by default. It installs nothing. |
| `redirects.prune-log`, `forms.prune-submissions` | midnight | Clean up the redirect log and old form submissions. |
| `backups.run` | 02:30 | Makes the scheduled backup (daily or weekly, as set under **Site → Backups**). |
| `audit.prune` | 03:10 | Deletes old audit entries, and expired password-reset, sign-up and email-change links. |
| `queue.prune-failed` | 03:20 | Deletes failed jobs older than 30 days. |
| `auth.prune-tokens` | 03:30 | Deletes access tokens that expired over 30 days ago. |
| `content.prune-previews` | 03:35 | Deletes preview links that expired. |
| `notifications.prune` | 03:40 | Removes read notifications after 90 days and all after a year. |
| `webhooks.prune` | 03:40 | Deletes webhook deliveries older than 30 days. |

A site with the [fleet](/guide/fleet) console turned on also has `fleet.check` (hourly), and a [public demo](/guide/demo) has `demo.reset`.

<Timeline :points="nightly" caption="The nightly tasks, on the site's clock" />

The same list is available from the command line:

```bash
php bin/cms schedule:list
```

### Background jobs {#background-jobs}

**System → Background jobs** shows the queue:

- **Queues**: how many jobs are **Waiting** and **Delayed** in each queue, and the **Oldest waiting**.
- **Worker**: whether something is processing jobs. **No worker is running** with **Never seen** means jobs pile up. By default the scheduler is the worker, so a working cron job fixes this.
- **Failed jobs**: jobs that used up their retries. Fix the cause (the **Error** column says what went wrong, often a mail server refusing a message), then use **Retry** or **Retry all**. **Delete** and **Delete all** remove them for good.
- **Batches**: groups of jobs started together, such as an import or regenerating images. **Stop batch** skips the jobs that have not started yet.

If the page says **Jobs run immediately**, the queue driver is "sync": jobs run during the page request that creates them, without retries. You can switch to the database or Redis driver under **System → Infrastructure**.

From the command line, `php bin/cms queue:monitor` shows queue sizes, the last worker heartbeat and the number of failed jobs.

## Without a cron job {#without-a-cron-job}

If your host has no cron, Kestello has two other ways to start the scheduler.

### The web runner

After a page has been sent to a visitor, Kestello runs due tasks for up to 20 seconds, at most once a minute. The visitor does not wait for it. This is on by default and only acts while no real cron job has run in the last 5 minutes, so it steps aside once you add one.

It needs PHP running as PHP-FPM or LiteSpeed, which most hosts use. On a quiet site, tasks run late because nobody visits. The scheduler's last run then shows as `web`.

To change it, create the file `config/cron.php`:

```php
<?php

return [
    'web_runner' => 'auto',        // 'auto' (default), true (always) or false (never)
    'web_runner_seconds' => 20,    // 5 to 55
];
```

### An outside cron service

Services on the internet can call an address on your site every minute. Kestello accepts these calls at `/system/cron` once you create a secret token for them. Someone with access to the server runs:

```bash
php bin/cms cron:token
```

It prints a new token (only its fingerprint is stored, so write it down). Set up the service to send a `POST` request to `https://example.com/system/cron` every minute with the header `Authorization: Bearer <token>`. If the service cannot set headers, add `?token=<token>` to the address instead, but then the token appears in the server's access logs.

Running `cron:token` again makes a new token and the old one stops working. `php bin/cms cron:token --revoke` turns the address off.

## If something goes wrong

**The Site Health screen shows an error instead of the list.** The report could not be built, often because the database or the cache service is down. Run `php bin/cms health` on the server to see the checks and the error.

**A check stays critical after you fixed the problem.** The report is kept for five minutes. Use **Run checks again**.

**"The cron endpoint is off. Run "bin/cms cron:token" to enable it."** An outside cron service called `/system/cron` but no token was created. Run `php bin/cms cron:token`.

**"Invalid token."** The outside cron service sends an old or mistyped token. Copy the newest token into the service again.

**"Ran less than 50 seconds ago."** Not an error: the outside service called twice within a minute and the second call was skipped.

**"The check itself failed:"** A check could not run. If the check belongs to a plugin, tell the plugin's author. If it is one of Kestello's own, the message after the colon says what broke.

## Next

- [Troubleshooting](/guide/troubleshooting) for problems that stop the site or the admin from working.
- [Backups](/guide/backups) to set up the schedule that the Backups check watches.
- [Command line](/developers/cli) for all `bin/cms` commands.
