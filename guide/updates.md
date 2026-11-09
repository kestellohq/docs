# Updates

This page covers updating plugins, themes and Kestello itself, and going back afterwards. Every update with code follows the same safe path: a database backup first, a short maintenance page for visitors, a check of the site on the new version, and an automatic return to the old version if the check fails. If the server stops the update halfway, the site puts itself back on the next visit. Read it before your first update, and keep the last part in mind for the rare case where going back does not finish.

Kestello looks for new versions of itself, and of plugins and themes that say where their updates are published, and shows them on **Site → Updates**, where you can review and apply one. For other plugins and themes, you get the new zip from whoever publishes it, and upload it.

## Who can update

| What | Permission needed | Who has it out of the box |
|---|---|---|
| Plugins | *Install, update, activate, deactivate and delete plugins* | **Administrator** |
| Kestello itself | *Update Kestello, and plugins and themes from their publishers* | **Administrator** |
| Plugins and themes from their publishers ([below](#from-the-publisher)), and their license keys | *Update Kestello, and plugins and themes from their publishers* | **Administrator** |
| Themes with code | Someone who can run commands on the server | |

Uploading and applying an update also asks you to confirm your password if you have not done so in the last 10 minutes.

The same signature rules apply as for installing: from the admin, only zips signed by a publisher your site trusts are accepted, unless `app.packages.admin_unsigned` is on. The command line accepts unsigned zips. A zip whose seal is broken is always refused. See [Signed and unsigned plugins](/guide/plugins#signed-and-unsigned-plugins).

## What happens during an update {#what-happens}

When you start an update, Kestello works through these steps by itself:

1. **Checks the zip.** It reads the new version, checks its signature and its code, and checks that it fits your site: the PHP version, PHP extensions, and the versions other active plugins require. If something does not fit, it stops here and nothing changes.
2. **Backs up the database.** The backup appears under **Site → Backups** with the type **Before an update** and a note such as *Before updating Acme Shop 1.2.0 to 1.3.0*. It holds the database only; the old files are kept separately (see below).
3. **Shows visitors a maintenance page.** Visitors get a page titled **Back in a moment** that says *The site is being updated. Please try again in a minute.* People who are signed in, the admin and the API keep working.
4. **Puts the new files in place.** The old plugin or theme folder is moved aside, not deleted.
5. **Checks the site on the new version.** Kestello starts the site fresh and checks that:
   - the new version's database changes ran and the site records the new version number,
   - the updated plugin or theme starts,
   - every plugin that was running before the update still runs,
   - the home page (`/`) and the status address (`/api/v1/status`) answer without a server error.
6. **Finishes, or goes back.** If every check passed, the maintenance page goes away and you see that the update worked. If any check failed, Kestello puts the old files back, restores the database from the backup made in step 2, checks the site once more on the old version, and only then removes the maintenance page.

The maintenance page from step 3 switches itself off after 30 minutes at most.

### If the server stops the update halfway {#stopped-halfway}

On shared hosting, the host may stop PHP in the middle of an update: a time limit, a memory limit, or a server restart. Kestello writes down each step before it takes it, so it knows where it was:

- **For Kestello itself**, the file `core/current.php` only names the new release while the update is still running. Once the update process is gone, the next request already runs the old release, so a half-checked release is never what visitors get.
- **On the next request** to the site (a visitor, you, or the scheduled task), Kestello finishes the job before anything else runs, and before any plugin loads:
  - if the check had already passed, it keeps the new version;
  - otherwise it puts the old files back and restores the database from the **Before an update** backup;
  - then it removes the maintenance page and shows the page that was asked for.

You do not need FTP or the command line for this. The audit log under **System → Audit log** records it as *Put back an update that stopped halfway*.

Visitors see the maintenance page for as long as an update has not finished, however long that takes. You and other signed-in people can still use the admin.

Often the host stops only the update itself, while the check it started on the new version keeps running for a while. Kestello waits for that check to end before it puts anything back, so the two never change the database at the same time. The check has a time limit of its own, and usually ends within a few minutes. If an update is still running after 15 minutes, **Site → Updates** shows a box titled **An update is taking unusually long**, and **System → Site Health** recommends a look. If the box is still there an hour later, ask your host to restart PHP for your site; the next request then puts the update back.

If putting it back fails three times in a row, Kestello stops trying by itself and keeps visitors on the maintenance page. See [If going back did not finish](#incomplete-rollback).

::: warning
If an update goes back, the database returns to how it was at step 2. Anything someone saved in the admin while the update ran is lost. Background jobs waiting to run (emails, image sizes) and sign-ins are kept, so nobody is signed out. Updates usually take seconds to a few minutes, but avoid updating while editors are busy.
:::

Only one update runs at a time, and no backup or restore can start while an update runs. A new update cannot start while an earlier one that stopped halfway has not been put back.

### Where the old version is kept

- **Plugins and themes:** the old folder goes to `storage/app/backups/packages/`, named after the plugin, its old version and the date, for example `acme-shop-1.2.0-20261105-143012-a1b2c3`. Kestello keeps the newest three per plugin or theme.
- **Kestello:** each release lives in its own folder under `core/releases/`, and the file `core/current.php` names the one that runs. Kestello keeps the running release, the one before it, and one more.
- **The database:** in the **Before an update** backup. These count as automatic backups, so after each scheduled backup the oldest are removed once there are more than the number under **Keep** in the **Schedule** box on **Site → Backups**. See [Backups](/guide/backups).

### How the check reaches the site

Kestello checks the new version in a separate PHP process on the server when it can. On hosts that switch that off (the PHP function `proc_open` is disabled on some shared hosting), it requests the site over HTTP instead, at the site address from **Site → Settings**. You normally do not need to change anything. If the HTTP check cannot reach the site (see [If something goes wrong](#if-something-goes-wrong)), these settings in `config/app.php` help:

| Setting | What it does |
|---|---|
| `app.updates.health` | `auto` (the default: a PHP process when possible, otherwise HTTP), `process` or `http`. |
| `app.updates.php` | The PHP command-line program to use for the process check, for example `/usr/local/bin/php`. Empty: found from the running PHP. |
| `app.updates.health_url` | The address the server uses to reach its own site for the HTTP check. Empty: the site address. |

## Before you update

1. Read the publisher's release notes for anything you must do first.
2. Check **System → Site Health**. Fix critical problems before updating: the check after the update also fails on problems that were already there, such as a home page that already shows a server error.
3. Pick a quiet moment (see the warning above).
4. If you want a copy that includes files or lives off the server, make one under **Site → Backups** with **Back up now**. The automatic backup only covers the database.

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

## Updates from the publisher {#from-the-publisher}

Some plugins and themes say where their new versions are published. For those, you don't need to download and upload a zip: Kestello looks for new versions every 12 hours and lists them under **Site → Updates**, in the **Plugins and themes** table. The **Updates** column says, for each one:

- **By upload**: the plugin or theme does not say where its updates come from. Update it by uploading the new version, as above.
- **1.3.0 available**: a new version is out. Choose **Review** in that row.
- **Up to date, checked 2 hours ago**: there is nothing new.
- **Needs a license key**: it is a paid plugin or theme, and Kestello needs your license key to look for updates. See [Add a license key](#license-key).
- A message such as "The license key for Acme Shop was refused: Your license expired on 1 March." with a **Renew** link: see [If something goes wrong](#if-something-goes-wrong).
- **2.0.0 needs Kestello ^0.2**: a newer version is out, but it needs a newer Kestello. Update Kestello first.

Choose **Check now** above the table to look again without waiting.

### Update from the Updates screen

1. Open **Site → Updates**.
2. In the row that says **1.3.0 available**, choose **Review**. Kestello downloads the new version and checks it. Nothing changes on the site yet.
3. The box is titled **Update Acme Shop to 1.3.0?**. Read the release notes and the signature line. The signature must be from the same publisher as the version you have now.
4. If a box titled **This update cannot be applied** appears, read its lines. Nothing has changed; see [If something goes wrong](#if-something-goes-wrong).
5. Choose **Update to 1.3.0**. Wait; do not close the box while it works.

The update runs exactly as described in [What happens during an update](#what-happens): a backup first, a check of the site, and the old version back by itself if anything is wrong.

### Add a license key {#license-key}

A paid plugin or theme needs the license key you got when you bought it.

1. Open **Site → Updates**.
2. In its row, choose **Add license key**.
3. Paste the key and choose **Save and check**.

Kestello saves the key and looks for updates with it at once. The key is stored encrypted, and from then on the row shows only its last four characters, as in **Key …4f2a**. It is sent only to that plugin's or theme's own update server, never anywhere else. To change or remove it, choose **Key …4f2a**, then paste a new key and choose **Save and check**, or choose **Remove key**.

From the command line, `package:license` reads the key from what you type, so it does not stay in the shell history:

```bash
php bin/cms package:license plugin:acme-shop
```

## Update a theme

How you update a theme depends on what kind it is:

- **Themes made in the admin, or imported as a zip from Appearance → Themes** (themes without code): import the new zip under **Appearance → Themes** with **Import** and turn on **Replace an installed theme with the same name**. You see **Mytheme was updated.** This replaces the theme's files directly, without the backup and check described above. See [Themes](/guide/themes).
- **Themes with code** (from a theme developer): if the theme says where its updates come from, update it on **Site → Updates** as described in [Updates from the publisher](#from-the-publisher). Otherwise the admin cannot update it, and someone with access to the server runs:

  ```bash
  php bin/cms package:update acme-theme-2.0.0.zip
  ```

  This uses the full update path with backup, check and automatic return.

## Update Kestello

A Kestello release is a zip named like `kestello-core-1.5.0.zip`, published on the [Kestello releases page](https://github.com/kestellohq/cms/releases). It replaces the `core` folder only; your `config`, `content` and `storage` folders are not touched.

### Check the Updates screen

Open **Site → Updates**. The **Kestello** box shows:

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

- **Kestello 1.5.0 is available.**, with the date it was published, a **Release page on GitHub** link and the release notes. A release marked **Pre-release** is a test version; you only see those if your site is set to show them (see the table below), or if it already runs a pre-release of that version. A site running `0.1.0-rc.1` is offered `0.1.0-rc.2`, then `0.1.0`, and only finished versions after that.
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
2. Open **Site → Updates** and choose **Upload a Kestello release**.
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

## Switch back after an update {#switch-back}

An update can pass its check and still turn out wrong a day later: a layout that broke, a feature that behaves differently. You can go back to the version before the last update from the admin:

- **Kestello:** on **Site → Updates**, the **Kestello** box says *Updated from 1.4.0 on …* and shows **Switch back to 1.4.0**.
- **A plugin:** on **Plugins → Manage plugins**, the plugin says *Updated from 1.2.0 on …* and shows **Switch back to 1.2.0**.
- **A theme with code:** on **Appearance → Themes**, the theme says *Updated from 2.0.0 on …* and shows **Switch back to 2.0.0**. Only people who may manage plugins see the button, since a theme with code runs on the server like a plugin.

Switching back puts back two things together: the old code, still on the server, and the **Before an update** backup of the database. Restoring the database is what makes it safe, since the newer version may have changed the database in ways the older one does not understand.

::: warning
Anything changed on the site since the update (posts, pages, settings, people) is lost from the site when you switch back. Kestello makes a backup of the site as it is now first, listed under **Site → Backups** as **Before a restore**, so you can still get those changes out of it.
:::

To switch back:

1. Choose **Switch back to 1.4.0**.
2. Read the box, which names the date of the backup that will be restored, and choose **Switch back to 1.4.0** again.
3. The page reloads. Visitors see the maintenance page for the few seconds it takes. When it is done you see **Kestello 1.4.0 is running again, with the database from before the update.** (or **Acme Shop 1.2.0 is back, …** for a plugin).

The button only appears when everything needed is still there: the backup (backups are removed after a while, see [Where the old version is kept](#where-the-old-version-is-kept)) and the old code. You can switch back once: after that, the next way forward is a new update.

## Go back further

Uploading an older version than the one installed stops with *This is Acme Shop 1.1.0, older than the installed 1.2.0.* (or, for Kestello, *… Going back is done by restoring a backup.*). To go back further than the last update, someone on the server can force it:

```bash
php bin/cms package:update acme-shop-1.2.0.zip --downgrade
php bin/cms core:update kestello-core-1.4.0.zip --downgrade
```

This goes through the same backup and check. It does not undo database changes the newer version made, and an older version may not understand them. Ask the publisher before downgrading, and prefer restoring a backup when one from before the update is recent enough.

## If going back did not finish {#incomplete-rollback}

Very rarely, the return to the old version fails too, for example because the disk is full or a file cannot be moved. Then the box shows the problems with the update, followed by lines that start with **After rolling back:** or **Rolling back failed:**. The second kind names the database backup and, for a plugin or theme, the folder in `storage/app/backups/packages/` that holds the old files.

The same happens when an update [stopped halfway](#stopped-halfway) and putting it back failed three times. Then **Site → Updates** (and **Plugins → Manage plugins**) show a box titled **An update stopped halfway and was not put back**, and **System → Site Health** lists it as critical.

Kestello then keeps the maintenance page on for visitors until the update is put back. You and other signed-in people can still use the admin. Work through these steps:

1. Fix the cause, if you know it: often the disk is full, or a folder cannot be written. **System → Audit log** has the reason each try failed.
2. Choose **Try again** in the box on **Site → Updates**. The page reloads and the site tries once more, before plugins load. On the server, `php bin/cms update:recover` does the same and prints what happened.

If that does not work either, put the site back by hand:

1. Write down the full message, including the backup name and folder.
2. Open **System → Site Health** to see what is wrong now.
3. Fix the cause the message names, such as freeing disk space or correcting folder permissions.
4. For a plugin or theme: with your FTP program or on the server, replace the folder in `content/plugins/` (or `content/themes/`) with the old folder from `storage/app/backups/packages/`. Rename it to the plain slug, for example `acme-shop`.
5. For Kestello: check that `core/current.php` names the old version (`php bin/cms core:update --status` shows it), and that its folder exists in `core/releases/`.
6. Restore the database backup the message names under **Site → Backups** (restoring needs an administrator), or on the server with `php bin/cms backup:restore <name>`. A finished restore also removes the maintenance page. See [Backups](/guide/backups).
7. When the site works again, delete the file `storage/framework/update.json`: while it is there, Kestello keeps the maintenance page on and starts no new update. Then delete `storage/framework/maintenance.json` if it is still there.

If a plugin was suspended along the way, see [When a plugin breaks the site](/guide/plugins#when-a-plugin-breaks-the-site).

## If something goes wrong

**"Another update is running. Try again when it has finished."** Only one update runs at a time. Wait for the other one. If you are sure none is running, the lock clears by itself when the process that held it ended.

**"Another update has not finished. Wait for it, or put it back under Site → Updates if it stopped."** An earlier update is still running, or it stopped halfway and was not put back yet. See [If going back did not finish](#incomplete-rollback).

**"There is no earlier version to switch back to."** The backup from before the update or the old code is no longer on the server, or you already switched back once. See [Go back further](#go-back-further).

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

**"The site address is not set (app.url), so the update could not be checked."** Enter the **Site address** under **Site → Settings**.

**"The check did not finish within 120 seconds."** The site took too long to start on the new version, often because of a long database change on a large site. The update was rolled back. Try again at a quiet time, or ask the publisher.

**"The plugin acme-extras stopped running: …"** The update made another plugin stop working, so it was rolled back. That plugin probably needs an update for the new version too.

**"/ answered 500: …"** The home page showed a server error on the new version, so it was rolled back. Send the message to the publisher.

**"Acme Shop needs a license key to look for updates."** Add it as described in [Add a license key](#license-key).

**"The license key for Acme Shop was refused: …"** The publisher's server did not accept the key, and its own reason follows. A **Renew** link appears when the publisher gave one on its own website. Check the key, or renew the license, then choose **Save and check** again.

**"The update feed of Acme Shop could not be reached: …"** Your server could not reach the publisher's update server. It may be down for a while; the next check tries again. Some hosts block outgoing connections; ask your host to allow HTTPS to the publisher's address.

**"The update feed is for another package, not the plugin "acme-shop"."** The publisher's server answered for another plugin. Tell the publisher.

**"Acme Shop 1.3.0 is not signed by the publisher of the installed version (key …). A developer can replace it from the command line."** The new version was signed by someone other than the publisher of the version you have. Kestello refuses it, even when that other publisher is one your site trusts, so nobody can replace a plugin they did not make. Ask the publisher. If they moved to a new signing key, a release signed with their old key has to announce the new one first.

**"The download of Acme Shop 1.3.0 does not match its published checksum, so it was thrown away. Try again later."** The file that arrived is not the one published. Nothing changed. Choose **Review** again later.

## Next

- [Backups](/guide/backups): restoring a **Before an update** backup by hand.
- [Plugins](/guide/plugins): suspension and recovery mode.
- [Site Health](/guide/health): what to check before and after an update.
- [Command reference](/developers/cli): `package:update`, `core:check`, `core:update` and the other commands.
