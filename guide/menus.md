<script setup>
const path = [
    { title: "Build a menu", text: "Appearance → Menus: the links, in order.", note: "On its own, it is shown nowhere." },
    { title: "Pick it for a theme location", text: "Under Theme locations, such as Main navigation.", tone: "brand", note: "No menu leaves the location empty." },
    { title: "Visitors see it there", text: "Where the theme puts that location, such as across the top of every page." },
];
</script>

# Menus

Menus are how visitors find their way around your site: the links across the top, and often a few more at the bottom. You build each menu from your pages, posts and categories, add your own links, nest items under each other, and put the menu where your theme offers a place for it. If a page you added doesn't show up, see [If something goes wrong](#if-something-goes-wrong).

## How menus work

A menu is a list of links you build in the admin. On its own, a menu is not shown anywhere. Your theme decides **where** menus can appear, for example across the top of every page or in the footer. Each of those places is a **theme location**, and you choose which menu goes in each one.

<Flow :steps="path" caption="From a menu you build to the place visitors see it" />

![The Menus screen: Theme locations at the top, Add items on the left and the footer menu's items on the right.](/screenshots/menus.png)

You can build as many menus as you like and switch them between locations at any time.

Menus are under **Appearance → Menus**. Editors and administrators can use this screen.

## Create a menu

1. Open **Appearance → Menus**.
2. Choose **New menu**.
3. Enter a **Name**, such as "Main" or "Footer links". Only editors see the name; visitors never do.
4. Choose **Create**. The empty menu opens, with **Add items** on the left and the menu itself on the right.

## Add items

The **Add items** card has a tab for each kind of link.

### Pages and posts

1. Open the **Content** tab.
2. In **Find a page or post**, type part of a title and pick the entry. You can pick several, one after another.
3. Each one is added at the end of the menu.

Items that point at an entry stay in sync with it. If you change the page's title or address, the menu follows by itself. Entries that are not published yet are marked **not published** in the search results; you can still add them (see [Hidden items](#hidden-items)).

### Categories and tags

1. Open the **Terms** tab. It only appears when your site has categories, tags or another taxonomy with public pages.
2. Choose the **Taxonomy**, such as **Categories**.
3. In **Find a term**, pick the ones you want.

### Archives

The **Archives** tab lists the content types that have a page listing all their entries, such as **Posts** at `/blog`. Choose **Add** next to the one you want.

### Your own links

1. Open the **Link** tab.
2. Fill in **Address**. It can be:
   - a full web address: `https://example.com/page`,
   - a path on your own site: `/contact`,
   - a section of the current page: `#opening-hours`,
   - an email link: `mailto:hello@example.com`,
   - a phone link: `tel:+15551234567`.
3. Fill in **Label**, the text visitors see. Your own links always need one.
4. Choose **Add link**.

::: tip
For a page on your own site, add it from the **Content** tab instead of typing its address. If the page moves later, the menu item follows it; a typed address does not.
:::

## Arrange items

Each item has buttons on the right:

- **Move up** and **Move down** move it among the items at the same level, taking its sub-items along.
- **Nest under the item above** turns it into a sub-item of the item above it. Themes usually show sub-items as a drop-down.
- **Move out a level** moves it back up one level.
- The cross removes it, along with its sub-items.

With the keyboard, select an item's title and hold Alt while pressing the arrow keys: up and down move it, right nests it, left moves it out.

Menus can nest four levels deep and hold up to 300 items.

### Change an item's label

Select an item's title to open its settings:

- **Label**: the text visitors see. For pages, posts and terms you can leave it empty to use the entry's own title. The help text shows which title that is.
- **Address**: only for your own links.
- **Open in a new tab**: opens the link in a new browser tab.

## Save the menu

Choose **Save menu** at the bottom (or press Ctrl+S, Cmd+S on a Mac). **Unsaved changes** shows next to the button until you do. If you try to leave the page or open another menu with unsaved changes, Kestello asks you first.

To rename the menu, click its name at the top of the card and type.

## Put a menu in a theme location

The **Theme locations** card at the top of the screen lists the places your theme offers, with a short description of each.

1. Find the location. The built-in theme offers **Main navigation** (across the top of every page) and **Footer links** (a row of links at the bottom).
2. Pick the menu from its list. **No menu** leaves the location empty.

The change applies straight away; there is nothing to save.

If the card is missing and you see **The active theme declares no menu locations, so menus built here are not shown yet.**, your theme has no places for menus, and no menu you build is shown on the site, not even through the **Menu** block (it shows the menu assigned to a theme location). Ask whoever made the theme, or choose a different theme under **Appearance → Themes** (see [Themes](/guide/themes)).

When you switch themes, the new theme may name its locations differently. Check **Theme locations** after switching and assign your menus again where needed.

## Hidden items

An item that points at a draft, scheduled or trashed entry is kept in the menu but not shown to visitors. In the admin it carries the badge **Hidden: not published**. Its sub-items are hidden with it. Once the entry is published, the item appears by itself, with no need to edit the menu.

This lets you prepare a menu entry for a page before it goes live.

## Edit another menu or delete one

When your site has more than one menu, the list at the top right of the menu card switches between them.

To delete the menu you are editing, choose **Delete menu** at the bottom. The message tells you if the menu is shown in any theme location; those locations become empty. This cannot be undone.

## If something goes wrong

**"Some items need attention."** One or more items could not be saved. The problem is shown under each item.

**"Use a web address (https://…), mailto:, tel:, a path starting with / or an #anchor."** The address of your own link is not one of the accepted forms. Check for spaces, and that a web address starts with `https://` or `http://`.

**"Custom links need a label."** Your own links have no entry to take a title from. Fill in **Label**.

**"It no longer exists."** The page, post or term the item pointed at was deleted for good. Remove the item.

**"Menus nest at most 4 levels."** Move some items out a level before nesting further.

**"A menu can have at most 300 items."** Split the menu into two, for example a main menu and a footer menu.

**"Give the menu a name."** The menu's name is empty.

**A page is in the menu but visitors do not see it.** Look for the **Hidden: not published** badge on the item, or on an item above it. Publish the page.

**A menu item does not show on the site.** Visitors only see items that lead somewhere public. An item is left out while its page is a draft, scheduled, private or in the trash, while a page above it is not published (see [Parent pages](/guide/content#parent-pages)), and, for a category or tag, while no published post uses it. In the menu editor such items carry the badge **Hidden: not published**. They appear by themselves once their target is public.

**The menu does not appear on the site at all.** Check that it is assigned under **Theme locations**, and that you saved it.

## Related pages

- [Pages, posts and other content](/guide/content): the pages and categories you link to.
- [Themes](/guide/themes): where menu locations come from.
- [Redirects](/guide/redirects): keep old links working when pages move.
