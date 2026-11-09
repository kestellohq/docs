# Your first hour

You have installed Kestello and signed in. This page walks you through the admin and the handful of settings worth getting right on day one. Work through it in order; each part takes a few minutes.

## Finding your way around

The admin lives at `/admin` on your site. The menu on the left is grouped by what you are doing, with the screens you use most at the top:

| Group | What is in it |
|---|---|
| **Overview** | The home screen: whether the site is healthy, what changed recently, and anything that needs you. |
| **Content** | Your pages and posts (and any content types you add), **Media** and **Forms**. |
| **People** | **People** (accounts) and **Roles** (what each kind of account may do). |
| **Appearance** | **Themes**, **Styles**, **Templates** and **Menus**. |
| **Site** | **Settings**, **Updates**, **Backups**, **Import** and **Redirects**. |
| **Plugins** | **Manage plugins**, followed by any screens your plugins add. |
| **System** | The tools for whoever looks after the site: **Site Health**, **Security**, **Audit log**, **Content types**, **Webhooks**, **API**, **Background jobs**, **Scheduled tasks**, **File storage** and **Infrastructure**. |

Choose a group's name to fold it away or open it again; your browser remembers which are folded. **System** starts folded, and the group of the screen you are on always opens. Your name at the bottom of the menu opens **Your profile**. To jump straight to any screen, press **Ctrl K** (**⌘K** on a Mac) and type part of its name.

You only see the screens your account is allowed to use. As the first administrator you see all of them; an editor sees far fewer.

**View site** on the **Overview** screen opens your public site.

## 1. Check the overview

![The Overview: a greeting with what needs you, cards for Site health, Background jobs, Scheduler and the Kestello version, and Waiting on you below them.](/screenshots/admin-overview.png)

Open **Overview**. The line at the top sums up the site's state:

- **Your site is running well. Nothing needs you.** Carry on.
- **One improvement is recommended** (or several). Worth a look this week. Open **Review** to see what.
- **Your site has a problem.** Something critical, such as a missing PHP extension or a folder Kestello cannot write to. Fix it before anything else; the message says what to do.

The same checks, with details, are under **System → Site Health**.

## 2. Settings

Open **Site → Settings**. The settings are split into groups.

![Site → Settings on the General tab: Site name, Tagline, Site address, Timezone and Language.](/screenshots/settings.png)

### General

| Setting | What it does |
|---|---|
| **Site name** | Shown in the browser tab, in emails and in the admin. |
| **Tagline** | One sentence about the site. Search engines and many themes show it. |
| **Site address** | The public address. Make sure it starts with `https://` once your certificate works. Links in emails use it. |
| **Timezone** | The clock for dates in the admin, scheduled publishing and nightly tasks. |

### Email

Kestello sends email for password resets, invitations and notifications. Out of the box it hands messages to PHP's built-in mail function. That works on many hosts, but those messages often land in spam.

For mail people actually receive, enter your mail provider's SMTP details:

1. **From address**: a mailbox someone reads, because replies go there. Use an address on your own domain, such as `hello@example.com`.
2. **From name**: usually the site or business name.
3. **SMTP server**, **Port**, **Encryption**, **Username** and **Password**: from your mail provider. The usual combination is port `587` with encryption `tls`, or port `465` with `ssl`.
4. Save, then use **Send a test email** to send a message to yourself. Check that it arrives, and that it is not in your spam folder.

The SMTP password is stored encrypted and never shown again. To keep it when you change other fields, leave the password field empty.

::: info Who can change this
Password reset links travel through the mail server and are built on the site address. Whoever controls either could collect those links, so the **Email** tab and the **Site address** field need the permission *Manage infrastructure, background jobs, scheduled tasks and Site Health*, which administrators have. People who may otherwise change settings see the rest of the settings but not these.
:::

### Reading

| Setting | What it does |
|---|---|
| **Home page** | Which page visitors see at your site's address. Leave it empty to let the theme decide (often a list of the newest posts). |
| **Hide the site from search engines** | Turn this on while the site is not ready. Every page then asks search engines not to list it. Visitors can still open it. Remember to turn it off at launch. |
| **Entries in feeds** | How many recent posts feed readers get. |

### Media

The defaults suit most sites. Two settings are worth knowing about now:

- **Largest upload (MB)**: the biggest file anyone can upload. Your hosting's own upload limit also applies, and whichever is smaller wins.
- **Documents**, **Audio**, **Video**, **Archives**, **SVG images**: what besides images may be uploaded. Images are always allowed. Turn on only what your site needs.

## 3. Secure your own account

Open **Your profile** (under **People**).

1. Under **Account**, check your name and email address.
2. Under **Sign-in & security**, turn on **two-step sign-in**. After your password, Kestello will ask for a code from an authenticator app on your phone. Save the recovery codes it shows you somewhere safe, such as a password manager. They are the only way back in if you lose your phone.

::: warning
If you lose both your phone and your recovery codes, someone with access to the server has to turn two-step sign-in off for you from the command line. Keep the codes.
:::

## 4. Invite the people who will work with you

Open **People** and add an account for each person. Give everyone their own account rather than sharing one: Kestello records who changed what, and you can remove one person's access without changing everyone's password.

Pick the smallest role that lets each person do their job. **Roles** shows what each role may do, and you can create roles of your own. As a rule of thumb: people who write and publish content do not need to manage plugins, themes or settings.

## 5. Make your first backup

Open **Site → Backups** and choose **Back up now**. Files (uploads, themes and plugins) are included unless you untick that option; without them the backup holds only the database. The backup appears in the list when it is done.

Nightly backups are on by default. Under **Schedule** you can change how often they run and how many are kept. Backups made by hand are kept until you delete them.

Anyone with the permission *Make and download backups (restoring needs an administrator)* can make and download them. Restoring one, or uploading one from another site, is for administrators only: a backup contains the list of accounts, so restoring it decides who can sign in.

::: tip
A backup that lives on the same server as the site does not help if the server is lost. Your developer or host can point the backups disk at an outside storage service in `config/storage.php`; see [Backups](/guide/backups).
:::

## 6. Pick a look

Open **Appearance → Themes**. The built-in theme is active. You can:

- adjust colours, fonts and spacing under **Appearance → Styles**, with a live preview,
- change what page layouts contain under **Appearance → Templates**,
- build your menus under **Appearance → Menus** and assign them to the places your theme offers.

## 7. Write something

Open **Content → Pages** and create a page. Give it a title, write in the editor, and either publish it straight away or set a date and time for it to publish by itself. Every save keeps a revision, so nothing you change is lost.

## What to read next

- [Pages, posts and other content](/guide/content), to write and publish your first pages.
- [The visual editor](/guide/visual-editor), to lay them out.
- [Moving from WordPress](/guide/import-wordpress), if you have an old site to bring over.
- [Going live](/guide/going-live), the checklist for launch day.
- [Requirements](/guide/requirements) and [the cron job](/guide/installation#background-tasks), if Site Health pointed at something about the server.
