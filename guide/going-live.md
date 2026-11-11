<script setup>
const launch = [
    { at: "A week before", title: "Check", text: "Site Health, background tasks, a test email, a form, every page on a phone." },
    { at: "On the day", title: "Launch", text: "A backup, the domain, HTTPS, the real address, search engines let in.", tone: "brand" },
    { at: "The week after", title: "Watch", text: "The Not found list, the nightly backup, a copy off the server, who has the keys." },
];
</script>

# Going live

The site is ready and you want the world to see it. Launch day is mostly ticking things off, and this page is the list. Work through it in order. Most of it takes a few minutes, and nothing here can break the site.

Moving from WordPress? Do the [check after the import](/guide/import-wordpress#check-the-imported-site) first; [switching over](/guide/import-wordpress#switch-over-to-kestello) is covered there too, and this list picks up the rest.

<Timeline :points="launch" caption="The launch checklist, from a week before to the week after" />

## A week before

1. **Open System → Site Health** and fix everything marked critical. It checks the server, the background tasks, the email settings and more, and says what to do about each problem. See [Site Health](/guide/health).
2. **Check that background tasks run.** **System → Scheduled tasks** shows when each task last ran. If nothing has run, set up the cron job from [Installing Kestello](/guide/installation#background-tasks). Without it, there are no nightly backups and scheduled posts don't go out.
3. **Send yourself a test email.** On the **Email** tab of **Site → Settings**, use **Send a test email**. Check that it arrives and is not in your spam folder. Password resets, form submissions and the site's other [emails](/guide/emails) travel the same way.
4. **Fill in a form yourself**, as a visitor would, and check that the submission reaches the right inbox. See [Forms](/guide/forms).
5. **Read every page once more on a phone.** Most visitors will see it there first.

## On the day

1. **Make a backup with a note**, such as "before launch", under **Site → Backups**, and download it. See [Make a backup now](/guide/backups#make-a-backup-now).
2. **Point the domain at the site** in your domain's DNS settings or your host's control panel. Your host can tell you the exact value. It can take from a few minutes to a day to reach everyone.
3. **Turn on HTTPS** for the domain in your host's control panel.
4. **Set the real address.** On the **General** tab of **Site → Settings**, make sure **Site address** is the real domain and starts with `https://`. Links in emails are built from it.
5. **Let search engines in.** On the **Reading** tab of **Site → Settings**, turn off **Hide the site from search engines** if you turned it on while building.
6. **Open the site on the real address**, on a computer and on a phone, and click through the menu.

## The week after

1. **Look at the Not found list** under **Site → Redirects**. It lists addresses people tried that found nothing, often old links from another site or a printed flyer. Give the common ones a redirect. See [Redirects](/guide/redirects#the-not-found-list).
2. **Check that the nightly backup ran.** **Site → Backups** should show a new **Scheduled** backup each morning.
3. **Keep a copy off the server.** A backup that only lives on the same server goes down with it. Download one now and then, or [store backups somewhere else](/guide/backups#store-backups-somewhere-else) automatically.
4. **Write down who has the keys**: who can sign in as administrator, where the hosting and domain accounts are, and where the backups go. If the person who built the site moves on, this list is what you'll need.

## Next up

[Your first hour](/guide/first-steps) covers the settings and accounts to set up on a new site, if you skipped any of them on the way here.
