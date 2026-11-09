# Backups

This page covers making backups of your site, what they contain, how long they are kept, and how to restore one, either on the same site or on a new server. Read it before you change anything big (a redesign, a new plugin, an update), and before you move the site to another host.

Everything here happens under **Site → Backups**. People with the permission *Make and download backups (restoring needs an administrator)* can make, download and delete backups. Restoring a backup, or uploading one from another site, is for administrators only, because a backup holds the list of accounts: restoring it decides who can sign in.

## What a backup contains

A backup is one zip file. Its name starts with `kestello-backup-`, followed by your site's domain and the date and time, for example `kestello-backup-example-com-20261105-143012-a1b2c3.zip`. There is no limit on its size or on how many files it holds: a backup over 4 GB, or with more than 65,535 files, uses the ZIP64 format, which the zip tools built into Windows, macOS and Linux open.

Inside it are up to three kinds of things:

| Part | What it holds | Always included |
|---|---|---|
| **Database** | Every page, post, setting, menu, form submission, account and role, plus the tables of your plugins. | Yes |
| **Files** | Uploads (`content/uploads` and the media library in `storage/app/media`), other files Kestello keeps under `storage/app`, theme fonts (`storage/fonts`), files visitors attached to forms (`storage/forms`) and plugin data (`storage/plugins`). | Only when you include files |
| **Code** | The plugin and theme folders, `content/plugins` and `content/themes`. | Only when you include files |

Some things are never in a backup, because they are short-lived or can be rebuilt: sign-in sessions, the cache, waiting and failed background jobs, password reset links and the search index (it is rebuilt after a restore). Older backups are never put inside new ones.

Two more points worth knowing:

- **Files on outside storage are not copied.** If you moved the media library to an S3-compatible bucket under **System → File storage**, the backup holds the database rows that point at those files, but not the files themselves. Use your storage provider's own versioning or copies for them.
- **The database part works on any database type.** Rows are stored in a neutral format, not as MySQL or PostgreSQL commands, so a backup made on MySQL restores on PostgreSQL or SQLite, and the other way round. This is what makes moving a site between database types possible (see [Move a site to another server or database](#move-a-site)).

A database-only backup is smaller and quicker. When you restore it, your files stay as they are.

## Make a backup now

1. Open **Site → Backups**.
2. Choose **Back up now**.
3. Leave **Include files (uploads, plugins, themes)** on if you want everything needed to move the site. Turn it off for a database-only backup: content, settings and people.
4. Optionally write a **Note**, such as "before the redesign". It is shown next to the backup in the list, and makes it easier to find the right one later.
5. Choose **Back up**.

![The Backups screen: the automatic backup schedule and the list of backups with Restore, download and delete.](/screenshots/backups.png)

When it is done you see **The backup is ready.** and the backup appears at the top of the list. Large sites with many uploads can take several minutes; keep the page open until it finishes.

The list shows, for each backup:

- **Made**: when, and what kind of backup it is: **Made by hand**, **Scheduled**, **Before a restore**, **Before an update** or **From another site**.
- **Contents**: **Database and files** or **Database only**, the number of database rows, the database type it came from and the Kestello version that made it.
- **Size**.

::: tip
Make a backup by hand before any change you might want to undo. Kestello also makes one by itself before every update and before every restore, but a backup with your own note is easier to recognise.
:::

## Automatic backups and how long they are kept

Automatic backups are on by default: every day, database only, and the newest 7 are kept. To change that:

1. Open **Site → Backups**.
2. In the **Schedule** box, choose how often under **Back up automatically**:
   - **Every day**: each night at 02:30, on the clock of the timezone set under **Settings → General**,
   - **Every week (Sundays)**: on Sundays at 02:30,
   - **Off**: no automatic backups.
3. Under **Keep**, enter how many automatic backups to keep, from 1 to 100.
4. Turn on **Include files (uploads, plugins, themes)** if the automatic backups should hold files as well. This makes each one as large as your uploads, so check that the server has room for that many copies.
5. Choose **Save**. You see **Backup schedule saved.**

How keeping works:

- **Backups made by hand are never deleted automatically.** They stay until you delete them. The same is true for backups uploaded from another site.
- **Automatic backups** are kept per kind: up to the **Keep** number of scheduled ones, and the same number of each kind of safety copy (**Before a restore** and **Before an update**). After each scheduled backup, the oldest of each kind beyond that number are deleted, so a run of updates never pushes out your scheduled backups.
- The clearing-out happens as part of the scheduled backup. If you set **Back up automatically** to **Off**, the safety copies from updates and restores are no longer cleared out, and you need to delete old ones yourself.

Automatic backups run as a scheduled task, so they need the cron job described in [Installing Kestello](/guide/installation#background-tasks). **System → Scheduled tasks** lists the task as `backups.run` and shows when it last ran. If the newest backup is older than it should be, **System → Site Health** tells you (see [If something goes wrong](#if-something-goes-wrong)).

## Download a backup

A backup that lives only on the same server as the site does not help if that server is lost. Download important backups and keep them somewhere else.

1. Open **Site → Backups**.
2. In the row of the backup, choose the download button (the arrow pointing down).
3. If you signed in more than 10 minutes ago, Kestello asks you to **Confirm your password** first. A backup contains every account's password hash, so it asks again before letting the file leave the server.

The file downloads under its own name. Keep it private: anyone who has it can read all of your site's content and settings.

## Delete a backup

1. In the row of the backup, choose the delete button (the bin).
2. Confirm with **Delete backup**. You may be asked to confirm your password.

::: danger
A deleted backup is gone for good. There is no bin to restore it from.
:::

## Restore a backup {#restore}

Restoring replaces the whole site with the backup: content, settings, people and roles, and, when the backup has them, the files. Changes made since the backup was taken are lost. Only administrators can restore.

Before you start, know what Kestello does for you:

- **It backs up the site as it is now first.** This safety copy appears in the list as **Before a restore**. It holds the database only.
- **It closes the whole site while it works.** Visitors, editors and you all see a short "Back in a moment" page. Background jobs and scheduled tasks wait until the restore is finished.
- **It puts the site back by itself if the restore fails**, from the safety copy, and tells you so.
- **It signs everyone out**, you too. Afterwards you sign in with an account from the backup, with the password that account had then.

To restore:

1. Open **Site → Backups**.
2. In the row of the backup, choose **Restore**.
3. Read the warning in the **Restore this backup?** window. It says the date of the backup and whether its files will be restored too.
4. In the field **Type the site name, …, to confirm**, type your site's name exactly as it is set under **Site → Settings** (the **Site name** field). The **Restore** button stays greyed out until the name matches.
5. Choose **Restore**. If you signed in more than 10 minutes ago, confirm your password.
6. Wait. Do not close the page. A database-only restore of a small site takes seconds; a large site with files takes longer.

When it is done you see **The site was restored**, with the number of rows and tables that came back. There may be warnings underneath:

- **Plugin and theme folders were not restored**: the backup came from another site. See [Restoring code from another site](#code-from-another-site).
- **Some rows were left out because their plugin is not installed here**: the backup has data for plugins this site does not have. Install those plugins and restore again if you need that data.
- **This backup comes from a site with a different app key**: see [Passwords and secrets after a move](#app-key).

7. Choose **Sign in again** and sign in with an account from the backup.

After a restore, Kestello also empties its caches and the page cache, and rebuilds the search index in the background. Search results may be incomplete for a few minutes.

::: warning
If the backup you restore is a database-only backup, your files stay as they are now. Uploads made after the backup was taken stay on disk, but the media library no longer lists them.
:::

### Restore from the command line

If you have SSH access to the server (common on a VPS, rare on shared hosting), you can restore from the command line. This is also the way in when you cannot reach the admin at all.

List the backups to get the exact name:

```bash
php bin/cms backup:list
```

Then restore one by name, or a zip file anywhere on the server by its path:

```bash
php bin/cms backup:restore kestello-backup-example-com-20261105-143012-a1b2c3.zip
```

Kestello first shows when and where the backup was made, how many rows and which file sections it holds, and whether it was made on this site. It then asks you to confirm. Options:

| Option | What it does |
|---|---|
| `--yes` | Does not ask for confirmation. |
| `--with-code` | Also restores plugin and theme folders from a backup made on another site. |
| `--no-safety` | Skips the safety backup taken before the restore. Use it only when the database is already broken and a safety copy of it would be worthless. |

Run the command from the site's root folder, as the same user the web server runs PHP as, so the restored files belong to the right user. The [command-line reference](/developers/cli) lists the other `backup:` commands.

## Restoring code from another site {#code-from-another-site}

Plugin and theme folders are code that runs on your server. Kestello signs every backup it makes with the site's own key, and restores code from the admin only when the backup carries that signature. A backup from another site (an upload, or a zip made elsewhere) restores its database and its uploads from the admin, but not its plugin and theme folders.

To get the plugins and themes of the other site, choose one:

- **Install them first.** Install the same plugins and themes through **Plugins → Manage plugins** and **Appearance → Themes** (see [Plugins](/guide/plugins) and [Themes](/guide/themes)), then restore. Their data comes back with the database.
- **Restore the code from the command line**, if you trust the site the backup came from:

  ```bash
  php bin/cms backup:restore /path/to/kestello-backup-old-site.zip --with-code
  ```

Plugins are installed before the database is rebuilt, so their tables are created and filled in the same restore.

## Upload a backup from another site

Use this to bring a site to a new Kestello installation. Only administrators can upload backups.

1. Open **Site → Backups** on the site you are moving to.
2. Choose **Upload a backup**.
3. Under **Backup zip**, choose the zip file you downloaded from the other site.
4. Choose **Upload**. You may be asked to confirm your password.

Kestello checks the file: that it is a Kestello backup, that it can be read, that it contains nothing but what it lists, and that it was not made by a newer version of Kestello. You then see **The backup was added. Restore it when you are ready.** It is listed as **From another site**, with a note naming the site it came from.

Nothing has changed yet. Restore it as described in [Restore a backup](#restore) when you are ready.

The upload is limited by your hosting's upload size limit. For a large backup with files, upload the zip to the server with FTP or SFTP instead, then restore it from the command line with its path (see [Restore from the command line](#restore-from-the-command-line)).

## Move a site to another server or database {#move-a-site}

A backup with files carries everything a site needs. Moving works the same way whether you change hosting, change domain, or change database type (for example from SQLite to MySQL, or from MySQL to PostgreSQL).

1. **On the old site**, open **Site → Backups**, choose **Back up now** with **Include files (uploads, plugins, themes)** on, and wait for it to finish.
2. Download the backup.
3. **On the new server**, install Kestello as described in [Installing Kestello](/guide/installation), with the database type you want. Use the same Kestello version as the old site, or a newer one. A backup from a newer Kestello is refused.
4. Optionally, carry over the old site's app key so stored passwords keep working (see [Passwords and secrets after a move](#app-key)).
5. Install the same plugins and themes the old site used, or plan to restore with `--with-code` from the command line (see [Restoring code from another site](#code-from-another-site)).
6. Upload the backup under **Site → Backups → Upload a backup**, or copy it to the server with FTP or SFTP if it is too large.
7. Restore it. In the confirmation field, type the **new** site's name, the one you entered in the installer, because that is the site being replaced.
8. Sign in with your account from the old site.
9. Open **Site → Settings** and check the **Site address** under **General**. It came back from the old site. Correct it if the domain changed, then save.
10. Open **System → Site Health** and fix anything it reports. Set up the cron job on the new server if you have not yet.

If the old site was older than the new installation, the restore brings the database up to date by itself.

### Passwords and secrets after a move {#app-key}

Kestello encrypts a few stored values with a secret key that each installation makes for itself: the SMTP password, storage passwords, plugin secrets and the codes behind two-step sign-in. A new installation has a different key, so after a restore it cannot read those values. Kestello warns you about this when you restore.

You have two options:

- **Enter them again.** Re-enter the SMTP password under **Site → Settings → Email**, and the secrets in each plugin's settings. People who use two-step sign-in need it turned off and set up again; an administrator with server access does that with `php bin/cms auth:reset-2fa <username>` (see [People](/guide/people)).
- **Bring the old key along.** Open `config/app.php` on the old site and copy the value of `secret_key`. On the new site, add it to `config/app.php` as a list under `previous_keys`, leaving the new `secret_key` as it is:

  ```php
  'secret_key' => 'NEW-SITE-KEY-LEAVE-AS-IT-IS',
  'previous_keys' => ['OLD-SITE-SECRET-KEY'],
  ```

  Do this before you restore. Kestello then reads the old values with the old key.

::: warning
`config/app.php` holds the keys that protect your site. Never share it, and never put it anywhere the web can reach.
:::

## Store backups somewhere else

By default backups are kept in `storage/app/backups` on the same server as the site. The bottom of the **Schedule** box says where they are. To have Kestello write every backup to an outside storage service instead (Amazon S3, Cloudflare R2, Backblaze B2, MinIO or any other S3-compatible service), point the backups disk at a bucket.

This is done in a configuration file, not in the admin:

1. At your storage provider, create a private bucket for backups, and an access key that may read and write it.
2. Open `config/storage.php` in your site's root folder. Create the file if it does not exist.
3. Add a `backups` disk with your bucket's details:

   ```php
   <?php

   declare(strict_types=1);

   return [
       'disks' => [
           'backups' => [
               'driver' => 's3',
               'bucket' => 'my-site-backups',
               'region' => 'auto',
               'endpoint' => 'https://<account>.r2.cloudflarestorage.com',
               'key' => 'your-access-key',
               'secret' => 'your-secret-key',
           ],
       ],
   ];
   ```

   For Amazon S3, leave out `endpoint` and set `region` to your bucket's region, such as `eu-central-1`. Some self-hosted services (MinIO, for example) also need `'path_style' => true`.

4. If you have SSH access, check the connection:

   ```bash
   php bin/cms storage:test backups
   ```

5. Open **Site → Backups**. The bottom of the **Schedule** box now says **Backups are kept on the backups disk (s3).** Make a backup to check that it works.

Backups already in `storage/app/backups` are not moved. Download the ones you want to keep before you switch.

Restoring from an outside disk works the same as from the server: Kestello downloads the zip to `storage/tmp` first, then restores it.

## If something goes wrong

**Site Health says "There is no backup of this site yet."** Make one with **Back up now**.

**Site Health says "Scheduled backups are on, but the newest is … days old. Check that the scheduler runs."** The cron job is missing or failing. Check **System → Scheduled tasks** for the `backups.run` task, and see [Installing Kestello](/guide/installation#background-tasks) for the cron job.

**Site Health says "Scheduled backups are off and the newest backup is … days old."** Turn automatic backups on, or make one by hand.

**"A backup or restore is already running. Try again when it has finished."** Only one backup or restore runs at a time, including the safety backup of an update. Wait a few minutes and try again.

**"Only administrators can restore or upload backups."** Your role may make and download backups, but not restore or upload them. Ask an administrator.

**"Type the site's name, …, to confirm."** The name you typed does not match the **Site name** under **Site → Settings**. Capital letters count, and so do spaces inside the name.

**"The file is larger than this server accepts (…). Copy it to the server and use: bin/cms backup:restore <file.zip>"** The zip is bigger than your hosting's upload limit. Upload it with FTP or SFTP and restore it from the command line, or ask your host to raise the PHP upload limit.

**"This is not a Kestello backup: …"** The file is not a backup zip, or it is damaged. Download it again from the old site; some browsers and email programs damage or rename large files.

**"This backup comes from Kestello …, newer than this site (…). Update this site first."** Update this site to at least that version (see [Updates](/guide/updates)), then restore.

**"The backup holds files it does not list"** or **"The backup lists a file it may not contain"**. Someone changed the zip after Kestello made it, for example by opening and saving it with an archive program. Kestello refuses it. Use an unchanged copy.

**"… does not match its checksum: the archive is damaged."** Part of the zip is corrupt. The restore stops before changing anything that cannot be put back. Use another copy of the backup.

**"The restore failed: … The site was put back as it was."** Something went wrong during the restore, and Kestello put the database and files back. Your site is as it was before you started. The message says what failed.

**"The restore failed: … Putting the site back also failed (…): restore … from the command line. The site stays in maintenance mode until a backup is restored."** The rarest and most serious case. The site shows the "Back in a moment" page to everyone and stays closed so nobody sees a half-restored database. Restore the safety backup named in the message from the command line:

```bash
php bin/cms backup:restore <name of the safety backup> --no-safety
```

If you have no SSH access, ask your host to run it. The site stays closed for up to seven days and then opens again by itself, but it will not work properly until a backup is restored. [Troubleshooting](/guide/troubleshooting) has more on a site stuck in maintenance.

**After a restore, emails stop sending or a plugin says a secret cannot be opened.** The backup came from a site with a different app key. See [Passwords and secrets after a move](#app-key).

**A large download does not finish.** Download the file with FTP or SFTP from `storage/app/backups` instead (when backups are kept on this server).

## Next

- [Updates](/guide/updates): every update makes a backup first and uses it to roll back.
- [Site Health](/guide/health): the **Backups** check and the others.
- [Troubleshooting](/guide/troubleshooting): when the site will not open at all.
