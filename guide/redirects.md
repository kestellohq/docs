# Redirects

This page covers sending visitors from addresses that no longer exist to the right place: the redirects Kestello adds by itself when a page moves, redirects you add by hand (for one address or a whole section), the list of addresses visitors asked for that found nothing, and how Kestello stops redirects from going in circles. Read it when you move or rename pages, when you move a site to Kestello from somewhere else, or when old links show "not found".

## What a redirect does

A redirect sends anyone who opens an old address, such as `/old-page`, on to another one, such as `/new-page`. Browsers follow it without the visitor noticing, and search engines move the old address's place in their results to the new one.

Redirects in Kestello only apply to addresses that would otherwise show "not found". A redirect can never hide a page that exists. If you add a rule for `/about` while an **About** page is published at that address, the page wins and the rule does nothing until the page is gone.

To move a page that exists, change its address in the editor instead. Kestello then adds the redirect for you.

Redirects are under **Appearance → Redirects**. Editors and administrators can use this screen.

## Automatic redirects {#automatic-redirects}

When you change the address of a **published** entry, Kestello adds a redirect from the old address to the new one. This happens when you:

- edit the address under the title,
- move a page under a different **Parent**.

For pages (and other types whose entries can have a parent), the redirect covers everything below the old address too. If `/services` becomes `/what-we-do`, then `/services/web-design` goes to `/what-we-do/web-design`.

These redirects are listed under **Appearance → Redirects** with the note **page moved**. To see only them, set **Added** to **When a page moved**.

A few things do not need redirects, and do not get one:

- **Changing the pattern of post addresses**, or a post's date. Old addresses keep working without any rules; see [Post addresses](/guide/content#post-addresses).
- **Drafts.** An entry that was never published has no address anyone could have saved.

And a few things do not get one, but may need one:

- **Unpublishing or trashing an entry.** Its address shows "not found" and appears in the [Not found](#the-not-found-list) list.
- **Changing the address of a category or tag.** Add a redirect yourself if the old one was shared.

## Add a redirect

1. Open **Appearance → Redirects**.
2. Choose **Add a redirect**.
3. Under **Which addresses**, choose what the rule covers (see the table below).
4. In **From**, enter the old address, starting with `/`, such as `/old-page`. Leave out your domain.
5. Under **Kind**, choose the type of redirect. **Moved for good (301)** is right in almost every case.
6. In **To**, enter where visitors should go: a path on your site such as `/new-page`, or a full address on another site, starting with `https://`.
7. Optionally add a **Note** for yourself and other editors, such as why the redirect exists.
8. Choose **Add the redirect**.

The new rule works straight away.

### Which addresses

| Choice | What it matches | Example |
|---|---|---|
| **This address** | Only the exact address. | `/old-page` → `/new-page` |
| **This address and everything below it** | The address and every address that starts with it, keeping the rest of the path. | `/old-blog` → `/blog` also sends `/old-blog/2019/my-post` to `/blog/2019/my-post` |
| **A pattern (regular expression)** | Addresses that match a pattern. For people who know regular expressions. | `^/news/(\d+)/(.+)$` → `/blog/$2` |

A slash at the end does not matter: `/old-page/` is treated as `/old-page`.

If the visitor's address had a query string (the part after `?`, such as `?ref=newsletter`), it is passed on to the target, unless the target has one of its own.

### Kinds of redirect

| Kind | When to use it |
|---|---|
| **Moved for good (301)** | The content has a new home and will stay there. Search engines move the old address's ranking to the new one. |
| **Moved for now (302)** | The old address will come back, for example during a short campaign. |
| **Moved for now, keep the method (307)** and **Moved for good, keep the method (308)** | The same as 302 and 301, for forms and tools that send data to the old address. You rarely need them. |
| **Gone (410)** | The content was removed on purpose and has no replacement. Visitors see the "not found" page, and search engines drop the address sooner. There is no **To** field. |

### Edit or remove a redirect

In the list, choose **Edit** to change a rule, or **Remove** to delete it. After removing, visitors to the old address see the "not found" page again.

The list shows how often each rule was used (**Used**) and when it was last used (**Last used**). A rule that has said **Never** for a long time can usually go.

## The Not found list {#the-not-found-list}

Kestello remembers every address visitors asked for that found nothing. Open the **Not found** tab on **Appearance → Redirects** to see them:

- **Address**: what was asked for.
- **Asked for**: how many times.
- **Last time**: when it was last asked for.
- **Linked from**: the page that linked to it, or **Typed or bookmarked** when there was none. A link from another site tells you where a broken link lives.

Use **Order** to sort by **Most asked for** or **Most recent**.

To fix one:

1. Choose **Redirect** next to the address. The **Add a redirect** window opens with **From** already filled in.
2. Fill in **To** and choose **Add the redirect**.

Use the cross next to an address to forget it, or **Clear the list** to start over.

The list keeps the 2,000 most recently seen addresses; older ones are removed each night. It stores only the address and the linking page, nothing about the visitor.

Some requests are left out so that the list stays useful: addresses under `/admin` and `/api`, files such as images, scripts and stylesheets, and the probes automated scanners send to every site, such as `/wp-login.php` or `/.env`.

## Loop protection

A redirect that leads back to where it started would send visitors around in a circle until the browser gives up. Kestello prevents this in several ways:

- **When you add a rule**, Kestello follows the existing rules from its target. If they lead back to the rule's own address, saving stops with an error. Chains longer than 10 steps are refused for the same reason.
- **A rule that points at itself** is refused. A pattern whose result is the address the visitor asked for is skipped for that visit.
- **When a page moves**, rules that pointed at its old address are changed to point at the new one, so visitors take one step instead of a chain.
- **When a page moves back** to an address it had before, the automatic redirect from that address is removed.
- **The home page** (`/`) cannot be redirected.

## Import and export

To move many redirects at once, for example from your previous site:

1. Prepare a CSV file with one redirect per line: `source,target,status,match,note`. Only the first two are needed. **status** defaults to `301` and **match** to `exact`; the other values for **match** are `prefix` and `regex`. A header line is optional.
2. Choose **Import** on **Appearance → Redirects**.
3. Pick the file under **File**, or paste the lines under **Or paste the lines**.
4. Choose **Import** in the window. Kestello reports how many were added and updated, for example "12 added, 3 updated." Rules for addresses that already have one are updated. Lines with problems are listed under **These lines were skipped:** with their line number and the reason; the other lines are imported.

An example file:

```text
source,target,status,match,note
/about-us,/about,301,exact,Old site
/old-blog,/blog,301,prefix,
/summer-sale,,410,exact,Campaign ended
```

Up to 5,000 lines are read per import. **Export** downloads all your redirects in the same format, which is also a quick way to keep a copy.

A site can have up to 10,000 redirects, of which up to 2,000 may cover whole sections or patterns.

## If something goes wrong

**"Start with / , for example /old-page."** The **From** address must be a path on your site, starting with one `/`. Leave out `https://` and your domain.

**"The home page can't be redirected."** `/` always shows your home page. To change what that is, see [The home page](/guide/content#the-home-page).

**"Enter where visitors should go."** **To** is empty. Fill it in, or choose **Gone (410)** if there is no replacement.

**"Use a path like /new-page or an https:// address."** The target is neither a path on your site nor an `http://` or `https://` address. Check for addresses starting with `//`. If the message ends with "without spaces", remove the spaces from the target.

**"The target is the same address."** **From** and **To** are the same.

**"There is already a redirect for this address."** Edit the existing rule instead. Use **Search** to find it.

**"This would send visitors in a circle: the target already redirects back to this address."** Following the existing rules from your target comes back to this address. Change the target, or fix the other rule first.

**"This is not a valid regular expression."** The pattern has a mistake, such as a bracket that is not closed. Test it in a regular expression tool, or use **This address and everything below it** instead.

**"The site has the maximum of 10000 redirects. Remove some first."** Remove rules that are no longer used. Rules whose **Last used** says **Never** are good candidates. One rule for a whole section can often replace many single ones.

**A redirect does nothing.** Something exists at the old address, so the redirect never applies. Open the address while signed out: if a page shows, unpublish or move that page, or change the rule.

**An old address still shows "not found" after a page moved.** The page was not published when its address changed, so no redirect was added. Add one by hand.

## Related pages

- [Pages, posts and other content](/guide/content#addresses): how addresses are made and changed.
- [Menus](/guide/menus): menu items follow pages when they move.
