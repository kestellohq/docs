# Troubleshooting

This page covers the problems site owners most often run into: an error page instead of the site, being locked out of the admin, emails that do not arrive, a site stuck on "Back in a moment", a plugin that broke the site, folder permission errors and pages that show old content. Each section says how to recognise the problem, where to look and what to do. Start with [Site Health](/guide/health) if you can still open the admin: it finds many of these problems for you.

Several fixes need a command run on the server. On a VPS you run them over SSH from the site's root folder (the folder that holds `bin`, `config` and `core`). On shared hosting, look for **Terminal** or **SSH Access** in your control panel; if there is none, ask your host to run the command for you. All commands are listed in [Command line](/developers/cli).

::: tip
Run commands as the same user the web server runs PHP as. On a VPS that is often `www-data`, for example `sudo -u www-data php bin/cms cache:pages`. Files a command creates as `root` cannot be changed by the site afterwards, which causes the permission errors described [below](#permission-errors).
:::

## Find the error log {#logs}

Most problems leave a message in a log file. There are two places to look.

**Kestello's log**: `storage/logs/`, one file per day named by date, for example `storage/logs/2026-11-05.log`. Every error that reaches Kestello is written here with the full details. When an error came from a plugin or theme, its name is in square brackets after the time, for example `[plugin:acme-shop]`, so you can see straight away which one to blame.

**PHP's own error log**: where PHP writes errors that happen before Kestello starts, and short notes from Kestello such as a plugin being switched off or a password reset email that could not be sent. Its location depends on the host:

- On shared hosting it is often a file called `error_log` in the site's folder or in `public/`, or a page called **Errors** or **Error Log** in the control panel.
- On a VPS it is set by `error_log` in PHP's settings (`php.ini`), often next to the web server's logs in `/var/log/`.
- In Kestello's Docker setup it is `storage/logs/php_errors.log`.

Open the newest file and read from the bottom up: the last entries are the most recent.

## The site shows an error page or a white page {#white-page}

**What you see**: a page saying **Something went wrong** and "The site couldn’t show this page. Try again in a little while.", or an empty white page, or your browser's own "500" page.

The **Something went wrong** page means Kestello caught an error and wrote it to the log. On a live site the details are hidden from visitors on purpose, because they can contain file paths and settings.

1. Open the newest file in `storage/logs/` and find the last entry. It names the error, the file and the line.
2. If the entry names a plugin or theme in square brackets, go to [A plugin broke the site](#plugin-broke-the-site).
3. If the entry mentions the database (`SQLSTATE`, "Connection refused", "Access denied"), check that the database server is running and that the details in `config/database.php` are still right. Your host may have changed the database password or server.
4. If the entry says a folder or file is not writable, go to [Permission errors](#permission-errors).

A white page, or the host's own error page, usually means PHP failed before Kestello could start, so there is nothing in `storage/logs/`. Look in PHP's own error log instead. The usual causes:

- The PHP version is older than 8.4, often after the host changed the default. The page then says "Kestello needs PHP 8.4 or newer". Choose PHP 8.4 or newer in the control panel.
- A required PHP extension was turned off. See [Requirements](/guide/requirements).
- PHP ran out of memory. Raise `memory_limit` to at least `128M`.

### Seeing the details yourself

If the log does not help, you can turn on debug mode for a few minutes. Error pages then show the full error, the code around it and the request.

1. Open `config/app.php` in your file manager or FTP program.
2. Change `'debug' => false` to `'debug' => true` and save.
3. Reload the page that fails and note the error.
4. Change it back to `'debug' => false` straight away.

::: warning
While debug mode is on, every visitor who hits an error sees your file paths and parts of your code. Turn it off as soon as you have the message. Site Health marks debug mode on a live site as critical.
:::

### Other error pages

| Page | What it means | What to do |
|---|---|---|
| **This page expired** ("Reload the page and try again.") | A form was open so long that its security token ran out, often after leaving the admin open overnight. | Reload the page and submit again. Copy any long text you typed before reloading. |
| **Too many requests** | You, or someone on the same network, sent many requests in a short time. | Wait a minute and try again. |
| **Back soon** or **Back in a moment** | The site is in maintenance. | See [The site is stuck on "Back in a moment"](#maintenance). |

## You are locked out of the admin {#locked-out}

First work out which kind of lockout it is.

### You forgot your password

1. Open `/login` on your site and choose **Forgot password?**.
2. Enter the email address of your account and send the form. You always see "If an account uses that address, we sent it a link to reset the password.", whether or not an account uses it. That way nobody can find out which addresses have accounts.
3. Open the email and follow the link. It works once and expires after 60 minutes.
4. Choose a new password of at least 12 characters that is not a common password. You see "Your password was changed. Sign in with the new one."

No email arrived? Look in your spam folder. A reset can be asked for at most three times an hour for the same email address from one network address, and ten times an hour in all. If email does not work on the site at all, see [Emails do not arrive](#email), or ask another administrator to set a new password for you: on your account under **People** they can use **Set a new password**.

If you are the only administrator and email does not work, someone with access to the server can set a new password:

```bash
php bin/cms user:password ana@example.com
```

The command asks for the new password twice and does not show what you type. You can give the username instead of the email address. With `--generate`, Kestello makes a strong password and prints it once. The same password rules apply as in the admin, the person's other sessions end and their API tokens are revoked, and the change is recorded in the audit log. Keeping two administrator accounts on every site is still the easiest way out.

### "Invalid email/username or password."

The username or email address, or the password, is wrong. The same message appears when the account has been deactivated (its **Can sign in** switch is off), so that nobody can test which accounts exist. Ask another administrator to check your account under **People**.

### "Too many attempts. Try again in …"

Kestello slows down guessing: after 5 failed attempts in a minute from one address, 10 failed attempts in an hour on one account from one address, or 100 on one account from anywhere, sign-in is refused for a while. Wait for the time shown. A successful sign-in clears the account's counter.

### You lost the phone with your authenticator app

1. On the page that asks for the code, choose **Use a recovery code**.
2. Enter one of the recovery codes you saved when you turned on two-step sign-in. Each code works once.
3. Once you are in, open **Your profile** and set up two-step sign-in again with your new phone. Save the new recovery codes.

If you have no recovery codes either, someone with access to the server turns two-step sign-in off for your account:

```bash
php bin/cms auth:reset-2fa ana@example.com
```

```text
  Two-factor authentication disabled for ana. Ask them to set it up again.
```

You can give the username instead of the email address. Then sign in with your password alone and set up two-step sign-in again. See [People](/guide/people) for more about two-step sign-in.

### The admin itself crashes after you sign in

If the sign-in page works but the admin shows an error, a plugin is the usual cause. Go to [A plugin broke the site](#plugin-broke-the-site) and use a recovery link.

## Emails do not arrive {#email}

Kestello sends email for password resets, Site Health alerts, form notifications and anything plugins send.

1. Open **System → Settings** and choose **Email**. If no **SMTP server** is filled in, Kestello hands mail to PHP's built-in mail function, which many hosts block or which lands in spam. Enter your mail provider's SMTP details. See [Your first hour](/guide/first-steps#email).
2. Use **Send a test email** with your own address. It uses the saved settings, so save first.
3. If you see "The email could not be sent. Check the mail settings and the server log.", the mail server refused the message or could not be reached. Find the reason in the logs (see [Find the error log](#logs)). The common messages:
   - "SMTP connection failed": the server name or port is wrong, or the host blocks outgoing mail on that port. Try port `587` with `tls`, or `465` with `ssl`. Some hosts only allow their own mail server.
   - "The mail server did not complete STARTTLS.": the encryption does not match the port. Use `tls` with `587` and `ssl` with `465`.
   - "SMTP error: expected 235" (or another number): usually the username or password was refused.
4. If the test arrives but other emails do not, open **System → Background jobs**. Some emails are sent by background jobs. Under **Failed jobs**, the **Error** column says why a message failed. Fix the cause, then use **Retry**. If **No worker is running** is shown, the cron job is missing; see [Site Health](/guide/health#core-scheduler).
5. If the test arrives in spam, use a **From address** on your own domain and ask your mail provider how to set up SPF and DKIM for it.

A password reset email that cannot be sent is noted in PHP's error log as "password reset email to user #… could not be sent". The person asking still sees the usual message, so check the log when someone says the reset email never came.

## The site is stuck on "Back in a moment" {#maintenance}

**What you see**: a plain page with **Back in a moment** and "The site is being updated. Please try again in a minute."

Kestello shows this page while it updates a plugin, a theme or itself, and while it restores a backup. It is controlled by one file: `storage/framework/maintenance.json`. The file holds an end time, so maintenance always switches itself off:

| Situation | Who gets the page | How long |
|---|---|---|
| An update is running | Visitors. Anyone signed in, the admin and `/login` keep working. | Until the update ends, at most 30 minutes. |
| A restore is running | Everyone, including administrators, because the database is being replaced. | Until the restore ends. A long restore keeps extending the time by 30 minutes as it goes. |
| An update failed and could not be rolled back completely | Visitors. Administrators can still sign in and look. | 7 days, or until someone fixes it. |
| A restore failed and the database could not be put back | Everyone. | 7 days, or until a backup is restored. |

What to do:

1. **Wait a few minutes** if someone has started an update or a restore. Large restores take a while.
2. **Sign in at `/login`.** If you can reach the admin, maintenance is in "visitors" mode. Open **System → Updates** or **Plugins → Manage plugins** and read what went wrong. See [Updates](/guide/updates#incomplete-rollback) for what to do after an incomplete rollback.
3. **If even the admin shows the page**, a restore is running or failed. The person who started the restore saw an error that says what went wrong. After a failed restore, restore a backup from the server. When putting the site back also failed, the error names the safety backup to use:

   ```bash
   php bin/cms backup:list
   php bin/cms backup:restore <name>
   ```

   See [Backups](/guide/backups).
4. **Only when you are sure nothing is running anymore** and the site is in a working state, delete `storage/framework/maintenance.json` with your file manager or FTP program. The site opens again with the next request.

::: warning
Do not delete `maintenance.json` while a restore is running, or after a restore failed. Visitors would see a half-imported database, and changes they make could be lost when you restore.
:::

The files `backup.lock` and `update.lock` in `storage/framework/` are normal and can stay. They only block a second backup or update while one is running; they are released when it ends, even if it crashed.

## A plugin broke the site {#plugin-broke-the-site}

Kestello protects itself from plugins in two ways.

**Automatic suspension.** When a plugin or theme throws an error while it starts, or causes a fatal PHP error, Kestello switches it off by itself. The next request runs without it. The list of switched-off packages is kept in `storage/framework/suspended.json`, and the reason is written to PHP's error log as "safe mode suspended plugin:… ". In the admin, the plugin shows as **Suspended** under **Plugins → Manage plugins**, and Site Health shows it as critical with the error.

**Recovery mode.** If the site still does not work, or the admin cannot open, use a recovery link. It opens the site with every plugin switched off and the default theme in use.

1. On the server, run:

   ```bash
   php bin/cms recovery:link
   ```

   ```text
     Recovery link (valid 60 minutes):
     https://example.com/admin?kestello-recovery=1793904980.Xb3…
     Plugins stay disabled and the base theme is used while the recovery cookie is set.
   ```

   Add `--minutes=15` for a shorter or longer time (5 to 1440 minutes).
2. Open the link in your browser and sign in. A **Recovery mode** notice shows at the top of the admin.
3. Open **Plugins → Manage plugins**. Deactivate the plugin you suspect, or delete it.
4. Leave recovery mode by deleting the cookie `kestello_recovery` for your site in the browser's settings. Otherwise it ends when the link's time runs out. Recovery mode applies only to your browser; visitors keep seeing the site normally.
5. Check the site. If it works, the plugin you switched off was the cause.

The link only works on the site that made it and stops working when its time runs out. It does not sign you in, so you still need your password.

If the admin works but you do not know which plugin is the cause, look in `storage/logs/` for the name in square brackets, then deactivate that one. To bring a suspended plugin back after its author fixed it, deactivate it, update it, then activate it again. See [Plugins](/guide/plugins).

If a theme broke the site, recovery mode uses the default theme so you can get in. Activate another theme under **Appearance → Themes**. See [Themes](/guide/themes).

## Permission errors on folders {#permission-errors}

**What you see**: Site Health says "Kestello cannot write to:" followed by folder names, or the log shows messages such as "Cannot write …", "Cache directory is not writable:", "Could not write to storage/tmp." or "The core folder is not writable by PHP, so the release cannot be put in place."

PHP must be able to write to these folders:

| Folder | Needed for |
|---|---|
| `storage/` and everything inside it | Logs, caches, sessions, uploads, backups, maintenance and lock files. |
| `config/` | Saving the site name, address and time zone to `config/app.php`, and the installer. |
| `content/` | Installing plugins and themes from the admin. |
| `core/` | Only for updating Kestello itself from the admin. |

To fix it:

- **Shared hosting**: in your file manager or FTP program, give the folders permission `755` (or `775` if your host's help pages say so). Apply it to the folder and everything inside. Do not use `777`: on a shared server it lets other accounts change your files.
- **VPS**: make the web server's user the owner, for example `sudo chown -R www-data:www-data storage config content`. Then check that later commands do not run as `root` (see the tip at the top of this page).
- **Docker**: the folders are usually mounted from the host. Make the user inside the container that runs PHP the owner of the mounted folders.

Then open **System → Site Health** and use **Run checks again**. **Writable folders** and **Storage disks** should pass.

## Pages show old content {#old-content}

Kestello keeps finished pages ready for visitors who are not signed in (the page cache). When you save content, the pages that show it are refreshed by themselves, so you rarely notice the cache. Old content still shows in a few cases:

- Someone changed a theme's or plugin's files by hand, over FTP or SSH. Kestello cannot know.
- A CDN or proxy in front of the site keeps pages too. How long it may keep them is set by **CDN cache time** under **System → Settings → Performance**.
- Your own browser kept the old page.

Signed-in people always get fresh pages. To see what visitors see, open the page in a private browser window.

To clear the page cache:

1. Open **System → Site Health**.
2. Choose **Clear page cache**. You see "Page cache cleared. Pages are rebuilt as visitors open them."

Or, on the server:

```bash
php bin/cms cache:pages
```

If pages stay old after that, clear the cache files in `storage/cache` and the compiled templates:

```bash
php bin/cms cache:clear
```

If your site sits behind a CDN, clear that cache in the CDN's control panel too, and consider a short **CDN cache time**. To turn the page cache off while you investigate, turn off **Cache pages** under **System → Settings → Performance**.

::: tip
Your browser's developer tools show a response header `X-Kestello-Cache` on pages from the cache. `HIT` means the page came from the cache.
:::

## Background tasks do not run

Scheduled posts stay unpublished, nightly backups are missing, or emails sent by background jobs never go out. All of these mean the scheduler is not running. Site Health shows **Scheduled tasks** as critical. See [Site Health](/guide/health#core-scheduler) for the fix and for hosts without cron.

## When you ask for help

When you write to your developer, your host or a plugin's author, include:

- what you did and what you saw, with the exact message,
- the last entries from the newest file in `storage/logs/`,
- the output of **Copy debug info** on **System → Site Health**, if the admin opens. It contains no passwords or keys.

## Next

- [Site Health](/guide/health) for every check and how to fix it.
- [Backups](/guide/backups), so a bad day costs minutes instead of your content.
- [Plugins](/guide/plugins) and [Updates](/guide/updates) for how updates protect the site.
