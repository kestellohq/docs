# Public demo

A public demo is a Kestello site anyone can sign in to and try. This page covers what visitors can and cannot do on one, how it resets, and how you look after it on the server. Read it before you put a demo online, for example to show Kestello to clients or in a post about it.

## Set one up

Install Kestello as usual (see [Installation](/guide/installation)). In step 3, under **What is this site for?**, choose **A public demo**. The installer then skips the administrator step and creates one account, `demo`, with the password `demo`.

The first time the site is opened after installing, Kestello fills it with a sample site, a small bakery with pages, posts, a contact form, menus and images, and takes a snapshot of it. That takes a few seconds.

The hourly reset is a [background task](/guide/installation#background-tasks). A cron job is best, but a demo also works without one.

### Without cron

Many shared hosts have no cron. Kestello then runs its tasks from the **web runner**: after a page has been sent to a visitor, it runs the tasks that are due, at most once a minute (see [Without a cron job](/guide/health#without-a-cron-job)). This suits a demo, because a demo only needs resetting when people use it:

- While people are on the demo, it resets every hour, a few seconds after the hour is up.
- When nobody has visited for a while, the reset is overdue but nothing is lost: the next visit starts it. That one visitor may still see the last changes; anyone after them sees the fresh site.

The web runner needs PHP-FPM or LiteSpeed, which most hosts use. If yours has neither, use an outside cron service that calls your site every minute, as described under [An outside cron service](/guide/health#an-outside-cron-service).

## What visitors see

- **The sign-in page** says this is a demo and fills in `demo` and `demo`. There is no **Forgot your password?** link, no sign-up and no signing in with another service.
- **The admin** shows a bar at the top of every screen: *This is a demo*, how many minutes until it resets, and what is locked. The sidebar says **Demo** under the site name.
- **The public site** shows a small *Demo site* badge in the bottom corner, which links to the sign-in page.
- **Forms** on the public site say that anyone who signs in can read what is sent, and suggest made-up details.

## What visitors can change

Everyone signs in to the same account, so a demo only lets them change things that are harmless to share and that the hourly reset puts back:

- pages, posts and other content, with their categories, tags, comments, previews and revisions;
- the design: **Appearance → Styles** and **Templates**;
- menus;
- forms and their submissions;
- images in the media library.

Everything else is locked. Visitors can open every screen, but saving shows **This is turned off in the demo.** Locked are:

- the account itself: its password, email address, two-factor sign-in, tokens and sessions;
- people and roles;
- plugins, themes, updates and backups;
- settings, webhooks, redirects, imports and fonts;
- anything else that asks for your password again, which is how Kestello marks sensitive actions.

Plugins add their own screens and actions. On a demo, a plugin's actions are locked unless they only change content.

Some screens are hidden on a demo even for reading, because they would show one visitor's traces to the next: the account's sign-in sessions, the **Audit log**, and files attached to form submissions. Backups cannot be downloaded, and the server's debug information under **Site Health** is not shown.

## Limits

- **Nothing is emailed.** Form notifications, invitations and any other email are dropped, so the demo cannot be used to send mail to anyone.
- **Images only.** Uploads are limited to images (no SVG), at most 5 MB each and 100 MB for the whole demo. Other file types are refused whatever **Settings** say.
- **Search engines stay out.** Every page is sent with `X-Robots-Tag: noindex, nofollow`, and `robots.txt` disallows everything.

## The hourly reset

Every hour the scheduled task `demo.reset` restores the snapshot: content, settings, uploads and accounts go back to how they were, and everyone is signed out. Visitors see the countdown in the admin bar.

The snapshot is a backup listed under **Site → Backups** with the note *Demo snapshot*. Do not delete it on the server: without it the demo cannot reset. **Site Health** lists a **Demo** check that turns critical when the snapshot is missing, or when scheduled tasks ran after a reset was due and the demo still did not go back (the reset is failing). A demo that is overdue only because nobody visited is fine.

## Look after the demo on the server

Nobody can manage a demo from its admin, including you. On the server:

| Command | What it does |
|---|---|
| `php bin/cms demo:reset` | Puts the demo back to its snapshot now. |
| `php bin/cms demo:snapshot` | Takes a new snapshot from the site as it is now. Every reset after that goes back to it. The old snapshot is removed, and the `demo` account goes into the snapshot with the password `demo` again. |

To change the demo's content or settings yourself:

1. Run `php bin/cms user:password demo --generate`. It prints a new password, so only you can sign in while you work.
2. In `config/app.php`, set `'demo' => false`. The `demo` account is now an ordinary administrator.
3. Sign in as `demo` with the new password and make your changes.
4. Set `'demo' => true` again.
5. Run `php bin/cms demo:snapshot`. It saves your changes as the new starting point and sets the password back to `demo`.

To stop being a demo for good, set `'demo' => false` in `config/app.php` and give the `demo` account a real password with `php bin/cms user:password demo`, or remove it. The snapshot backup stays under **Site → Backups** until you delete it.

## Next

- [Backups](/guide/backups): what a snapshot contains and how restoring works.
- [People and roles](/guide/people): accounts and what they may do.
