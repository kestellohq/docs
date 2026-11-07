# Installing Kestello

This page takes you from an empty hosting account to a working site with your own admin account. It takes about fifteen minutes. You will need:

- hosting that meets the [requirements](/guide/requirements),
- a way to upload files: your host's file manager, or an FTP/SFTP program such as FileZilla,
- for MySQL, MariaDB or PostgreSQL: an empty database and a user for it (SQLite needs neither).

The installer runs in your browser. You do not need a terminal.

## 1. Create a database

Skip this step if you will use SQLite.

In your hosting control panel, open the page for databases (often called **MySQL Databases** or **Databases**) and:

1. Create a database. Any name made of letters, numbers and underscores works, for example `kestello`.
2. Create a database user with a long, random password.
3. Give that user all privileges on the new database.

Write down four things: the database name, the user name, the password, and the database host. On most shared hosting the host is `localhost`. Managed databases show a host name such as `db-1234.example-cloud.com`.

::: tip
If the user you created is allowed to create databases, you can skip creating the database itself: the installer creates it when it does not exist yet.
:::

## 2. Upload the files

Upload the whole Kestello folder to your hosting account. The result should look like this, with `public` being the folder the web server shows to visitors:

```text
your-site/
├── bin/
├── config/
├── content/
├── core/
├── public/        ← visitors see this folder
├── storage/
└── .htaccess
```

How you get there depends on what your host allows:

**If you can choose the document root** (most control panels have a "Domains" page where you can set it): upload the folder anywhere in your account, for example to `kestello/`, and set the domain's document root to its `public` folder, `kestello/public`. This is the best setup, because nothing outside `public` can ever be reached from the web.

**If you cannot choose it** (the domain always shows a fixed folder such as `public_html`): upload the contents of the Kestello folder into that folder, so `public_html` contains `bin`, `config`, `core`, `public` and the others. The `.htaccess` file at the top sends visitors into `public` and refuses requests for every other folder.

::: warning
Upload the hidden `.htaccess` files too. Some FTP programs hide files that start with a dot. In FileZilla, turn on **Server → Force showing hidden files** before uploading.
:::

## 3. Check folder permissions

PHP must be able to write to `config`, `storage` and `content`. On most shared hosting this is already true and you can go to the next step. The installer's first screen tells you if it is not.

If it is not, use your file manager or FTP program to give those three folders permission `755` (or `775` if your host's help pages say so). Do not use `777`: it lets other accounts on a shared server change your files.

## 4. Run the installer

Open your site's address in a browser. Kestello sees that it is not installed yet and opens the installer at `/install`. It has five steps.

### Step 1: Server check

Kestello checks the PHP version, a database driver, the required PHP extensions, and the folders it writes to. Kestello creates any of those folders that are missing, because some file managers leave empty folders out when they unzip.

When everything passes, you see **Your server is ready** and can continue. Otherwise the problems are listed first, each with what to do about it, and the checks that passed are folded away under **checks passed**. PHP versions and extensions are usually changed in the control panel (look for **PHP Selector**, **PHP Version** or **PHP Extensions**); the table under [Requirements](/guide/requirements) explains each one. After fixing something, choose **Check again**.

### Step 2: Database

Choose the database type. Only types whose PHP extension is installed are offered.

- **MySQL / MariaDB** or **PostgreSQL**: enter the host, the port (leave it empty for the usual one), the database name, the user and the password from step 1.
- **SQLite**: enter only a name. The database is created as a file in `storage/database/`, outside the folder visitors can reach.

Choose **Connect and continue**. Kestello connects with these details before it lets you continue. If the connection fails you see the database's own error message; the most common ones are listed at the end of this page.

### Step 3: Your site

| Field | What to enter |
|---|---|
| Site name | Your site's name. It appears in the browser tab and in emails. You can change it later. |
| Tagline | A short line about the site. Optional. |
| Site address | The full address visitors will use, including `https://`, for example `https://example.com`. Links in emails are built from it. |
| Time zone | Where you are. Dates in the admin, scheduled publishing and nightly tasks follow this clock. |

### Step 4: Your admin account

This is the first account and it has full access. Choose:

- a **username** of 3 to 50 characters: letters, numbers, `_` and `-`,
- an **email address** you can receive mail at (it is used for password resets),
- a **password** of at least 12 characters that is not a common password. A password manager can make one for you.

If the password is refused, the username and email address stay filled in, so you only type the password again.

### Step 5: Install

A summary of your choices, with a **Change** link to the step each one came from. Check it, then choose **Install Kestello**. Kestello writes its configuration files to `config/` (the database details and secret key, plus commented files for scheduled tasks, background jobs, accounts and the audit log, each option at its default), creates the database tables and your account. If anything fails, it removes the configuration files again and shows the error, so you can correct the details and try again. Tables it already created are reused on the next attempt.

When it is done you see **Kestello is installed**, your site's address, and three things to do next: sign in, add the cron job for background tasks (the page shows the exact command for your server, with a **Copy** button), and the checks before you go live. Sign in with the username or email address and the password from step 4. The sign-in page is always at `/login`.

## 5. Set up background tasks {#background-tasks}

Kestello sends email, makes image sizes, publishes scheduled posts and makes backups in the background. Give it a cron job so this happens on time.

In your control panel, open **Cron Jobs** and add a job that runs **every minute** with this command, replacing the path with where you uploaded Kestello:

```bash
php /home/youraccount/kestello/bin/cms schedule:run
```

Some hosts need the full path to PHP, for example `/usr/local/bin/php`. Their help pages say which one.

After a few minutes, **System → Scheduled tasks** shows when each task last ran. If you cannot add a cron job, Kestello runs due tasks after ordinary page visits instead; see [Requirements](/guide/requirements#background-tasks).

## 6. Before you go live

- **HTTPS.** Turn on a certificate for your domain in the control panel, then make sure the site address under **Settings** starts with `https://`.
- **Site Health.** Open **System → Site Health**. Anything marked critical needs fixing before visitors arrive; recommendations can wait.
- **Backups.** Open **System → Backups** and make your first backup. The nightly schedule is on by default.

## Installing on a server with nginx {#nginx}

On a VPS with nginx, point the server block's `root` at the `public` folder and send unknown paths to `index.php`. A working configuration, assuming PHP-FPM listens on a Unix socket:

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/kestello/public;
    index index.php;
    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.5-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\. {
        deny all;
    }
}
```

`fastcgi_read_timeout 300` gives backups and updates of large sites time to finish. Add HTTPS with your usual tool (for example Certbot) once the site works over HTTP.

## If something goes wrong

**The browser shows a list of files, or "Index of /".** The web server is not sending requests to Kestello. Check that the document root is the `public` folder, or that the top-level `.htaccess` file was uploaded and that your host allows `.htaccess` files.

**"404 Not Found" on every page except the home page.** On Apache, `mod_rewrite` is off or `.htaccess` files are ignored. Ask your host to turn on `mod_rewrite` and `AllowOverride All` for your site. On nginx, the `try_files` line is missing.

**"500 Internal Server Error" straight away.** Usually the PHP version is older than 8.4, so Kestello cannot even start. Choose PHP 8.4 or newer in the control panel. Your host's error log has the exact message.

**Step 1 says a folder is not writable.** Give `config`, `storage` and `content` permission `755` as described in step 3. On a VPS, make the web server's user the owner of those folders.

**"Database connection failed: SQLSTATE[HY000] [1045] Access denied".** The user name or password is wrong, or the user has no rights on that database. Check both in the control panel. The password field may be left empty on a second attempt to keep what you entered before.

**"Database connection failed: SQLSTATE[HY000] [2002]".** Kestello cannot reach the database host. On shared hosting, try `localhost`. For a managed database, check the host name and that your hosting is allowed to connect to it.

**"Unknown database".** The database does not exist and the user is not allowed to create it. Create it in the control panel (step 1).

**You see the installer again after installing.** The file `config/installed.php` could not be written, or was deleted. Kestello treats a site without that file as not installed. Check that `config` is writable.

## Next

Spend [your first hour](/guide/first-steps) with the admin.
