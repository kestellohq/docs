# Fleet

If you look after several Kestello sites, **Site → Fleet** shows them all in one list: which version of Kestello each runs and whether a newer one is out, plugins and themes with updates or license problems, Site Health, and when each was last backed up. You can open any site from there to act on it.

Every Kestello site can be watched. Only the site you watch from needs the fleet console turned on, and on it you need the permission **Watch other Kestello sites from Site → Fleet, with their fleet tokens**. Administrators have it.

## Turn on the fleet console

On the site you will watch from, a developer sets this in `config/app.php`:

```php
'fleet' => [
    'enabled' => true,
],
```

**Site → Fleet** then appears in the menu. Use a site of its own for this, such as your agency's site, rather than one of the sites you look after.

## Add a site

Each site gives the fleet a token that can read its report and nothing else.

1. On the site you want to add, sign in as an administrator and go to **Your profile → Access tokens**.
2. Choose **Create token**. Name it after the fleet, such as "Agency fleet", and pick **one year** or **never** under **Expires**.
3. Under **Permissions**, tick `fleet` only. Then choose **Create token** and **Copy** the token.
4. On the fleet site, go to **Site → Fleet** and choose **Add site**.
5. Enter a **Name**, the site's **Address** (its home page, starting with `https://`) and paste the **Fleet token**. Choose **Add site**.

Kestello asks the site for its report straight away. The token is stored encrypted and never shown again. A site that can't be reached is still added, with the reason in red under its name.

## What the list shows

| Column | What it means |
|---|---|
| **Site** | Its name and address. A line in red says why the last check failed; the rest of the row is from the last check that worked. |
| **Kestello** | The version it runs, and a badge when a newer one is out. |
| **Plugins and themes** | How many have an update waiting, and how many have a **license problem**: a paid plugin with no license key entered, or one its publisher refused. Point at a badge to see which ones. |
| **Site Health** | **Good**, **Could be better** or **Needs attention**, with the first problem found. |
| **Last backup** | When the newest backup was made. **Over a week old** and **Never** stand out. |
| **Checked** | When the site was last asked. **Check now** asks again. |

Every site is asked once an hour. Updates themselves are applied on each site, under **Site → Updates**.

## Remove a site

Choose the bin icon on its row. The token keeps working on that site until you revoke it there, under **Your profile → Access tokens** or **System → Security**.

## What a site shares

A fleet token reads `GET /api/v1/fleet/report` and nothing else: no content, people or settings. The report holds the site's name and address, its Kestello and PHP versions, update and license status of its plugins and themes, its Site Health summary, and the number and date of its backups. A token only works while the administrator who made it can manage the site.

## If something goes wrong

**"The site refused the token."** It was revoked, it expired, or the person who made it is no longer an administrator. Make a new one on that site and add the site again, or replace the token.

**"No fleet report at this address."** The address is not the home page of a Kestello site, or that site runs a version from before the fleet. Check the address, or update the site.

**"The site answered HTTP 503."** The site is down or in maintenance. It is asked again within the hour.

## Next

- [Updates](/guide/updates): applying what the fleet shows is waiting.
- [Backups](/guide/backups): scheduling backups on each site.
- [Site Health](/guide/health): what each check means.
