# Updates

This page covers updating plugins, themes and Kestello itself. Every update with code follows the same safe path: a database backup first, a short maintenance page for visitors, a check of the site on the new version, and an automatic return to the old version if the check fails. Read it before your first update, and keep the last part in mind for the rare case where going back does not finish.

Kestello looks for new versions of itself and shows them on **System → Updates**, where you can review and apply one. For plugins and themes it does not look yet: you get the new zip from whoever publishes the plugin or theme, and upload it.

## Who can update

| What | Permission needed | Who has it out of the box |
|---|---|---|
| Plugins | *Install, update, activate, deactivate and delete plugins* | **Administrator** |
| Kestello itself | *Update Kestello itself* | **Administrator** |
| Themes with code | Someone who can run commands on the server | |

Uploading and applying an update also asks you to confirm your password if you have not done so in the last 10 minutes.

The same signature rules apply as for installing: from the admin, only zips signed by a publisher your site trusts are accepted, unless `app.packages.admin_unsigned` is on. The command line accepts unsigned zips. A zip whose seal is broken is always refused. See [Signed and unsigned plugins](/guide/plugins#signed-and-unsigned-plugins).

## What happens during an update {#what-happens}

When you start an update, Kestello works through these steps by itself:

1. **Checks the zip.** It reads the new version, checks its signature and its code, and checks that it fits your site: the PHP version, PHP extensions, and the versions other active plugins require. If something does not fit, it stops here and nothing changes.
2. **Backs up the database.** The backup appears under **System → Backups** with the type **Before an update** and a note such as *Before updating Acme Shop 1.2.0 to 1.3.0*. It holds the database only; the old files are kept separately (see below).
3. **Shows visitors a maintenance page.** Visitors get a page titled **Back in a moment** that says *The site is being updated. Please try again in a minute.* People who are signed in, the admin and the API keep working.
4. **Puts the new files in place.** The old plugin or theme folder is moved aside, not deleted.
5. **Checks the site on the new version.** Kestello starts the site fresh and checks that:
   - the new version's database changes ran and the site records the new version number,
   - the updated plugin or theme starts,
   - every plugin that was running before the update still runs,
   - the home page (`/`) and the status address (`/api/v1/status`) answer without a server error.
6. **Finishes, or goes back.** If every check passed, the maintenance page goes away and you see that the update worked. If any check failed, Kestello puts the old files back, restores the database from the backup made in step 2, checks the site once more on the old version, and only then removes the maintenance page.

The maintenance page from step 3 switches itself off after 30 minutes at most, even if the update process dies half way.

::: warning
If an update goes back, the database returns to how it was at step 2. Anything someone saved in the admin while the update ran is lost. Background jobs waiting to run (emails, image sizes) and sign-ins are kept, so nobody is signed out. Updates usually take seconds to a few minutes, but avoid updating while editors are busy.
:::

Only one update runs at a time, and no backup or restore can start while an update runs.

### Where the old version is kept

- **Plugins and themes:** the old folder goes to `storage/app/backups/packages/`, named after the plugin, its old version and the date, for example `acme-shop-1.2.0-20261105-143012-a1b2c3`. Kestello keeps the newest three per plugin or theme.
- **Kestello:** each release lives in its own folder under `core/releases/`, and the file `core/current.php` names the one that runs. Kestello keeps the running release, the one before it, and one more.
- **The database:** in the **Before an update** backup. These count as automatic backups, so after each scheduled backup the oldest are removed once there are more than the number under **Keep** in the **Schedule** box on **System → Backups**. See [Backups](/guide/backups).

### How the check reaches the site

Kestello checks the new version in a separate PHP process on the server when it can. On hosts that switch that off (the PHP function `proc_open` is disabled on some shared hosting), it requests the site over HTTP instead, at the site address from **System → Settings**. You normally do not need to change anything. If the HTTP check cannot reach the site (see [If something goes wrong](#if-something-goes-wrong)), these settings in `config/app.php` help:

| Setting | What it does |
|---|---|
| `app.updates.health` | `auto` (the default: a PHP process when possible, otherwise HTTP), `process` or `http`. |
| `app.updates.php` | The PHP command-line program to use for the process check, for example `/usr/local/bin/php`. Empty: found from the running PHP. |
| `app.updates.health_url` | The address the server uses to reach its own site for the HTTP check. Empty: the site address. |

## Before you update

1. Read the publisher's release notes for anything you must do first.
2. Check **System → Site Health**. Fix critical problems before updating: the check after the update also fails on problems that were already there, such as a home page that already shows a server error.
3. Pick a quiet moment (see the warning above).
4. If you want a copy that includes files or lives off the server, make one under **System → Backups** with **Back up now**. The automatic backup only covers the database.

## Update a plugin {#update-a-plugin}

1. Open **Plugins → Manage plugins** and choose **Upload a plugin**.
2. Under **Plugin zip**, choose the new version's zip and choose **Upload and review**.
3. The box is titled **Update Acme Shop?** and says *Updates version 1.2.0. The database is backed up and the site is checked after the new files are in place; if anything is wrong, version 1.2.0 and the database are put back.* Check the signature line, **What it may do** (a new version may ask for more) and any **Code check** lines.
4. If a box titled **This update cannot be applied** appears, read its lines. Nothing has changed; see [If something goes wrong](#if-something-goes-wrong).
5. Choose **Update to 1.3.0**. Wait; do not close the box while it works.

When it worked, you see **Acme Shop was updated to 1.3.0.** If the check failed, the box shows **The update was not applied**, the problems found, and **Version 1.2.0 and the database were put back. The site runs as before.**

This path applies when the installed copy is active. If it is inactive, the upload offers **Replace the installed version** instead: the files are swapped without a backup or check, and the plugin's upgrade steps run the next time you activate it. See [Plugins](/guide/plugins#replacing-an-inactive-plugin).

From the command line, the same update with the same backup and check is:

```bash
php bin/cms package:update acme-shop-1.3.0.zip
```

```text
  Backing up, updating and checking the site…
  Updated acme-shop 1.2.0 → 1.3.0. Backup: …
```

## Update a theme

How you update a theme depends on what kind it is:

- **Themes made in the admin, or imported as a zip from Appearance → Themes** (themes without code): import the new zip under **Appearance → Themes** with **Import** and turn on **Replace an installed theme with the same name**. You see **Mytheme was updated.** This replaces the theme's files directly, without the backup and check described above. See [Themes](/guide/themes).
- **Themes with code** (from a theme developer): the admin cannot update these. Someone with access to the server runs:

  ```bash
  php bin/cms package:update acme-theme-2.0.0.zip
  ```

  This uses the full update path with backup, check and automatic return.

## Update Kestello

A Kestello release is a zip named like `kestello-core-1.5.0.zip`, published on the [Kestello releases page](https://github.com/kestellohq/cms/releases). It replaces the `core` folder only; your `config`, `content` and `storage` folders are not touched.

### Check the Updates screen

Open **System → Updates**. The **Kestello** box shows:

| Line | What it means |
|---|---|
| **Version** | The release that runs now. |
| **PHP** | The server's PHP version. |
| **On disk** | The releases in `core/releases/`, with the one marked **(running)**. On a site that runs straight from its `core` folder, with no release folders yet, it says *A development checkout: core runs from its folder directly. The first update adds release folders next to it.* |

If you see **PHP cannot write to the core folder, so Kestello can only be updated by uploading files to the server.**, give PHP write access to `core` (on a VPS, make the web server's user its owner), or update by uploading the new `core` folder yourself.

Below, **Plugins and themes** lists what is installed, with versions and which are **Active**.

### How Kestello finds new versions {#new-versions}

Twice a day, Kestello asks GitHub whether a new release is out. It only tells you: nothing is downloaded or installed until you choose to. The check runs with the other background tasks, so it needs the scheduled task from [Set up background tasks](/guide/installation#background-tasks).

Under the facts in the **Kestello** box you see one of these:

- **Kestello 1.5.0 is available.**, with the date it was published, a **Release page on GitHub** link and the release notes. A release marked **Pre-release** is a test version; you only see those if your site is set to show them (see the table below).
- **Kestello is up to date. Last checked 2 hours ago.**
- **Kestello has not checked for new versions yet.** The first check runs within an hour of the scheduled task starting.

Choose **Check now** to ask GitHub straight away.

These settings go in `config/release.php` in your site's root folder (create the file if it is not there; it returns a PHP array like the other files in `config/`):

| Setting | What it does |
|---|---|
| `release.check_every` | Hours between checks. The default is `12`. `0` turns the scheduled check off; **Check now** still works. |
| `release.prereleases` | `true` also shows pre-releases, such as `1.6.0-beta.1`. Use it on a test site, not on a live one. The default is `false`. |

### Apply a release

From GitHub, when a new version is shown:

1. Choose **Review the update**. Kestello downloads the release, checks that it is exactly the file that was published, and checks its signature. Nothing changes yet.
2. The box is titled **Update to Kestello 1.5.0?**, shows the old and new version, and the signature line. It explains: *The database is backed up, visitors see a short maintenance page, and the site is checked on the new release: database changes, every active plugin, the home page.*
3. If a box titled **This release cannot be applied** appears, read its lines. The most common is an active plugin or theme that does not support the new release: update that plugin first, or deactivate it.
4. Choose **Update to 1.5.0** and wait.

Official releases are signed by **Kestello releases**, so the signature line reads *Signed by Kestello releases, a publisher this site trusts.* Kestello trusts that signature for its own updates only, never for plugins.

From a zip, for a site that cannot reach GitHub:

1. Download `kestello-core-1.5.0.zip` from the [releases page](https://github.com/kestellohq/cms/releases).
2. Open **System → Updates** and choose **Upload a Kestello release**.
3. Under **Release zip**, choose the release and choose **Upload and review**. Nothing changes yet. The box is the same as above, and so are the next steps.

When it worked you see **Kestello 1.5.0 is running.** If the check failed, the box shows **The update was not applied**, the problems, and **Kestello 1.4.0 and the database were put back. The site runs as before.**

From the command line, check for a new version, then apply a zip you downloaded:

```bash
php bin/cms core:check
php bin/cms core:update kestello-core-1.5.0.zip
```

```text
  Backing up, switching to 1.5.0 and checking the site…
  Kestello 1.4.0 → 1.5.0. Backup: …
```

`php bin/cms core:update --status` lists the release folders on disk and marks the running one with `*`.

## Go back to an older version

The admin only moves forward. Uploading an older version than the one installed stops with *This is Acme Shop 1.1.0, older than the installed 1.2.0.* (or, for Kestello, *… Going back is done by restoring a backup.*).

The safest way back is to restore the **Before an update** backup from **System → Backups** together with the old files. When an update fails its check, Kestello already does this for you.

If you need to go back later, after the new version has been running for a while, someone on the server can force it:

```bash
php bin/cms package:update acme-shop-1.2.0.zip --downgrade
php bin/cms core:update kestello-core-1.4.0.zip --downgrade
```

This goes through the same backup and check. It does not undo database changes the newer version made, and an older version may not understand them. Ask the publisher before downgrading, and prefer restoring a backup when one from before the update is recent enough.

## If going back did not finish {#incomplete-rollback}

Very rarely, the return to the old version fails too, for example because the disk is full or a file cannot be moved. Then the box shows the problems with the update, followed by lines that start with **After rolling back:** or **Rolling back failed:**. The second kind names the database backup and, for a plugin or theme, the folder in `storage/app/backups/packages/` that holds the old files.

Kestello then keeps the maintenance page on for visitors for up to seven days, with the reason *An update failed and could not be rolled back completely*. You and other signed-in people can still use the admin. Work through these steps:

1. Write down the full message, including the backup name and folder.
2. Open **System → Site Health** to see what is wrong now.
3. Fix the cause the message names, such as freeing disk space or correcting folder permissions.
4. For a plugin or theme: with your FTP program or on the server, replace the folder in `content/plugins/` (or `content/themes/`) with the old folder from `storage/app/backups/packages/`. Rename it to the plain slug, for example `acme-shop`.
5. For Kestello: check that `core/current.php` names the old version (`php bin/cms core:update --status` shows it), and that its folder exists in `core/releases/`.
6. Restore the database backup the message names under **System → Backups** (restoring needs an administrator), or on the server with `php bin/cms backup:restore <name>`. A finished restore also removes the maintenance page. See [Backups](/guide/backups).
7. If the site works and the maintenance page is still on, delete the file `storage/framework/maintenance.json`.

If a plugin was suspended along the way, see [When a plugin breaks the site](/guide/plugins#when-a-plugin-breaks-the-site).

## If something goes wrong

**"Another update is running. Try again when it has finished."** Only one update runs at a time. Wait for the other one. If you are sure none is running, the lock clears by itself when the process that held it ended.

**"A backup or restore is already running. Try again when it has finished."** An update needs to make a backup first. Wait for the backup or restore to finish, then try again.

**"Acme Shop 1.2.0 is already installed."** or **"Kestello 1.4.0 is already running."** The zip holds the version you already have.

**"Acme Shop is not installed: install it instead of updating."** Install it on **Plugins → Manage plugins** (or with `plugin:install`) instead.

**"The plugin Acme Shop 1.2.0 supports Kestello ^1.0, not 2.0.0."** An active plugin or theme does not support the new release. Update it first, or deactivate it for the update.

**"Acme Shop 1.3.0 requires Kestello ^1.5 (running 1.4.0)."** and similar lines, such as "Acme Shop 1.3.0 requires PHP >=8.5 (running 8.4.14)." or "Acme Shop 1.3.0 Acme Extras needs acme-shop ^1.2." (another active plugin only works with certain versions). The new version does not fit your site yet. Update what it names first.

**"Kestello 1.5.0 needs PHP >=8.5; this server runs 8.4.14."** Change the PHP version in your hosting control panel first. See [Requirements](/guide/requirements).

**"Kestello could not check for updates: GitHub is limiting requests from this server for now; the next check will try again."** GitHub allows each server a limited number of checks an hour, and servers on shared hosting share that allowance. Wait for the next scheduled check.

**"Kestello could not check for updates: …"** followed by another reason, such as a timeout. The server could not reach `api.github.com`. Some hosts block outgoing connections; ask your host to allow HTTPS to `api.github.com` and `github.com`, or update from a zip.

**"The download of Kestello 1.5.0 does not match its published checksum, so it was thrown away. Try again later."** The file that arrived is not the file that was published, often because the download was cut off. Nothing changed. Choose **Review the update** again later.

**"Kestello 1.5.0 is not among the releases of kestellohq/cms."** The release was withdrawn after your site last checked. Choose **Check now**.

**"The core folder is not writable by PHP, so the release cannot be put in place."** Give PHP write access to `core` and `core/releases`, or update from the server.

**"This is not a Kestello core release (everything in it must be in a core folder)."** The zip is not a release, or it was unpacked and zipped again. Use the zip as the publisher provides it.

**"Only releases signed by a publisher this site trusts are applied from here. A developer can apply this one on the server: `bin/cms core:update <zip>`."** The release is not signed by a trusted publisher. See [Trusting a publisher](/guide/plugins#trusting-a-publisher).

**"The site could not be reached at https://example.com to check the update (…). Set app.updates.health_url to an address the server can reach itself at."** The HTTP check could not reach your own site from the server. This happens when the site address points through a firewall or proxy the server cannot use, or DNS is not set up yet. Set `app.updates.health_url` to an address that works from the server, such as `http://127.0.0.1`.

**"The site address is not set (app.url), so the update could not be checked."** Enter the **Site address** under **System → Settings**.

**"The check did not finish within 120 seconds."** The site took too long to start on the new version, often because of a long database change on a large site. The update was rolled back. Try again at a quiet time, or ask the publisher.

**"The plugin acme-extras stopped running: …"** The update made another plugin stop working, so it was rolled back. That plugin probably needs an update for the new version too.

**"/ answered 500: …"** The home page showed a server error on the new version, so it was rolled back. Send the message to the publisher.

## Next

- [Backups](/guide/backups): restoring a **Before an update** backup by hand.
- [Plugins](/guide/plugins): suspension and recovery mode.
- [Site Health](/guide/health): what to check before and after an update.
- [Command reference](/developers/cli): `package:update`, `core:check`, `core:update` and the other commands.
