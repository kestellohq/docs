# The visual editor

Pages and posts are written in the visual editor. The page in the middle looks the way visitors will see it, with your theme around it, and you change it in place: click a heading and type, put in a photo, move a section up. This page starts with a short tour and a worked example, then shows how to do the everyday jobs: add and arrange blocks, put things side by side, adjust the page for phones, show something only for a while, and publish. For statuses, reviews, revisions and addresses, see [Pages, posts and other content](/guide/content).

## The parts of the editor

When you open a page or post, the editor fills the screen. The numbers in the picture match the list below it.

![The visual editor with the About page of a bakery site open. Numbered marks show the Add a block button, the page, the tabs of the right panel, the preview widths and the Update button.](/screenshots/editor-parts.png)

1. **Add a block** and the buttons next to it open the left panel: **Add a block**, **Layers** or **Find and replace**, one at a time. **Undo**, **Redo** and **Details and outline** sit beside them.
2. **The page**: the real page, with your theme around it. Click any text to type in it.
3. **The right panel**, with four tabs:
   - **Block**: the settings of the selected block.
   - **Style**: its colours, spacing, text size and border.
   - A tab named after the content type, such as **Page** or **Post**: when it goes live, its address, template, parent page, author, the **Search and sharing** fields and its revisions.
   - **Checks**: problems that make the page harder to use, such as an image without alt text.
4. **Preview widths**: see the page as on a phone, a tablet or a full screen.
5. **The save button**: **Save draft** and **Publish** for a draft, **Update** for a published page. Next to it are the status with **Unsaved** or **Saved**, **Form** and **Preview**.

Under the page, a thin line shows where the selected block sits (for example **Page › Cover › Heading**; click a name to select that block) and the number of words.

A content type with fields of its own, such as a post's **Excerpt**, has a drawer under the page named after those fields. Open it to fill them in.

The buttons in the bar show their name and shortcut when you point at them. Press ? at any time to see every shortcut.

### Prefer a form

Choose **Form** in the bar to edit the same page as a list of fields and blocks instead. Choose **Visual editor** to come back. Kestello remembers your choice in this browser.

![The About page in the form view: the blocks as a list of fields.](/screenshots/editor-form.png)

## Start a new page

::: tip The quickest start
Open **Pages**, choose **New page**, type a title and start writing. Everything else on this page is for when you want more than text.
:::

1. Open **Content → Pages** and choose **New page** (or **Content → Posts** and **New post**).
2. Type the title in the bar at the top, where it says **Add a title**. The page shows it as you type.
3. On the empty page, choose one of:
   - **Start writing**: a block of text, ready for typing.
   - **Add a block**: pick the first block yourself.
   - **Start from a layout**: a whole page of sections from your theme, such as a home page or a contact page, that you then change. It appears when your theme has layouts.
4. Write. Press Enter on an empty line to start a new block, and Shift+Enter for a line break inside one.
5. Choose **Save draft** to keep it private, or **Publish** to put it on the site.

A new page opens on the **Block** tab, so you can write straight away. Its address is made from the title until the page is published; see [Save and publish](#publishing).

## Example: build an About page

The quickest way to learn the editor is to build one page with it. This example uses Larkspur Bakery, the sample site, and makes an About page with a photo across the top, two columns of text and a button that leads to the Contact page. You can follow it on your own site with your own words and photo.

1. Open **Content → Pages** and choose **New page**. Where it says **Add a title**, type "About us".
2. On the empty page, choose **Add a block**, then **Cover** (under **Layout**). A cover is a wide banner that holds other blocks over a photo or a colour. It arrives with an empty heading inside it.
3. Click the heading (it says **Heading** in grey) and type "Baking on Fennel Quay since 2019".
4. Select the cover itself, not its heading: choose **Select Cover**, the first button on the block toolbar, or click **Cover** in the line under the page. The **Block** tab now shows the cover's settings.
5. Under **Background image**, choose **Choose an image**, click the photo of the shop on the quay and choose **Use this file**. The photo fills the banner. **Shade** starts on **Dark**, which darkens the photo a little so the heading stays readable.
6. With the cover still selected, choose **Add a block after** (the plus on the block toolbar). A small list opens. Type "Columns" and choose **Columns**. Two empty columns appear below the banner, side by side.
7. Click the first column. While it is empty, it says "Empty. Click to select it, then add a block."
8. Choose **Add a block** in the bar, then **Text**. Because a column is selected, the text goes inside it. Type "Margit bakes the bread. Tom does the pastry and most of the talking."
9. Click the second column and add a **Text** block the same way: "We use flour from a mill two valleys over, water from the tap and salt from the coast."
10. Open **Layers** (the button with lines in the bar) and click the **Columns** row: the columns cover it on the page, so the layers are the easy way to reach it. Choose **Add a block after** on the block toolbar, type "Button" and choose **Button**. Type the button's words on the page: "Get in touch".
11. In the **Block** tab, under **Link**, type "contact" and choose the Contact page from the list. Kestello fills in its address, `/contact`. You can also type an address yourself, such as `/contact` or `https://example.com`.
12. Choose the phone in the preview widths. The two columns now sit one above the other, as they will on a visitor's phone.
13. Choose **Publish**.

You have now used the four things most pages are made of: blocks that hold others (the cover and the columns), text you type on the page, settings in the **Block** tab, and the layers to reach a block that is hard to click. The rest of this page goes into each of them.

## Add a block

Pages are made of **blocks**: a heading, a paragraph of text, an image, a row of buttons. There are three ways to add one:

- **Add a block** in the bar (the button with a plus) opens the library on the left. Click a block to add it. When the selected block can hold others, such as a column or a cover, the new block goes inside it, at the end. Otherwise it goes after the selected block, or at the end of the page when nothing is selected. You can also drag a block from the library onto the page or into the layers. Type under **Find a block or pattern** to narrow the list.
- On an empty line of text, type `/`. A small list opens at the cursor; type to search, then press Enter.
- **Add a block after**, the plus on the block toolbar, opens the same small list and puts the new block straight after the selected one, never inside it.

![The Add a block panel open on the left, with the blocks grouped under Text, Media and Layout.](/screenshots/editor-add-block.png)

The library groups the blocks into **Text**, **Media**, **Layout**, **Entries and data** and **Widgets**. Plugins can add more.

| Block | What it shows |
|---|---|
| **Heading** | A heading. Pick the level on the block toolbar. Heading 1 is usually the page title, so use the levels from 2 down. |
| **Text** | Paragraphs with bold, italic and links. |
| **Button** and **Buttons** | A link styled as a button; several side by side. |
| **List** and **Icon list** | A bulleted or numbered list; short points, each with an icon. |
| **Quote** | A quotation and who said it. |
| **Code** | Text shown exactly as typed, in a fixed-width font. |
| **Details** | A summary visitors open to read more. Good for questions and answers. |
| **Table** | Rows and columns. Paste from a spreadsheet to fill it. |
| **Image** and **Gallery** | One image from the media library; several in a grid that visitors can open larger. |
| **Video** | A video from the media library, YouTube or Vimeo. YouTube and Vimeo load only when someone presses play. |
| **Cover** | Blocks over an image or a colour, such as a heading and a button at the top of a page. |
| **Media and text** | An image beside text. They stack on phones. |
| **Group**, **Columns** and **Tabs** | Blocks that hold other blocks: together, side by side, or in panels shown one at a time. |
| **Space** and **Separator** | Empty space; a line between two parts of the page. |
| **Entry list** and **Entry field** | A list of entries, such as the six newest posts or the entries that link to this one (see [Links between entries](/guide/content#links-between-entries)); one field of the entry, such as its date. |
| **Menu**, **Search box**, **Social links**, **Form** | A menu of your theme, a search field, links to your profiles, one of your [forms](/guide/forms). |

### Use a pattern or a layout

**Patterns** are ready-made groups of blocks from your theme, such as a pricing table or a row of testimonials. Choose **Browse** in the library (it shows how many there are, such as **Browse 24 patterns**) to see them by category, with a preview of each. A pattern marked **synced** stays linked to the original: when someone changes the pattern under **Appearance → Templates**, every page that uses it changes too. Any other pattern is copied in and you can change it freely.

A layout is a whole page. Choosing one for a page that already has blocks asks first: **Replace them** swaps the page for the layout, **Add after them** puts it at the end.

## Select and change a block

Click a block on the page to select it. A blue outline shows it, the **Block** tab shows its settings and a toolbar appears next to it. Text is changed on the page itself; the rest, such as an image, a link or a layout, is in the **Block** tab.

![The heading "Who we are" selected: a blue outline around it, the block toolbar above it, and its settings in the Block tab on the right.](/screenshots/editor-block.png)

Some everyday changes:

- **Turn text into a heading or a list.** Click the block's name on the toolbar and choose from **Turn into**. The words come along.
- **Change a heading's level.** Use **Heading level** on the toolbar.
- **Make words bold, italic or a link.** Select the words, then choose **Bold**, **Italic** or **Link** on the toolbar.
- **Point a button at a page.** Select the button, and under **Link** in the **Block** tab type part of the page's title. Choose the page from the list, and its address is filled in.
- **Move a block.** Choose **Move up** or **Move down** on the toolbar, or hold **Drag to move** and drop the block where you want it.
- **Copy or remove a block.** Open **More** (the three dots at the end of the toolbar) and choose **Duplicate** or **Remove**.

Press Esc to clear the selection; the right panel then shows the page's own settings. With several blocks selected, Esc goes back to one.

The toolbar moves out of the way of the text you are reading. To keep it in one place instead, open **Options** (the three dots at the right of the bar) and turn on **Block toolbar at the top**. Every button on the toolbar is listed in [The block toolbar, button by button](#the-block-toolbar-button-by-button).

## Put two blocks side by side

There are three ways, depending on what you start with:

- **Two blocks already on the page.** Hold **Drag to move** on one and drop it at the left or right side of the other. Kestello puts the two in columns. Drop more blocks at the side to make up to four columns.
- **An empty row of columns.** Add a **Columns** block. It starts with two empty columns. **Layout** in the **Block** tab offers **Two equal**, **Wide, narrow**, **Narrow, wide**, **Three equal** and **Four equal**. Then click each column (an empty one says "Empty. Click to select it, then add a block.") and add blocks to it, as in the [example](#example-build-an-about-page).
- **A photo next to some words.** Add a **Media and text** block. **Image on the** chooses **Left** or **Right**.

For buttons, use **Buttons**: it holds several **Button** blocks in a row.

Columns and **Media and text** stack one above the other on phones, so the page stays readable on a small screen.

## Find a block in the layers

**Layers** (the button with lines in the bar, or Alt+Shift+O) lists every block in order, with the blocks inside others indented below them. Each row shows the block's kind and its first words, so you can tell the blocks apart. Use it to select a block that is hard to click on the page, such as an empty one or one inside a column.

![The Layers panel on the left, listing every block of the page in order.](/screenshots/editor-layers.png)

In the layers:

- The arrow keys move between blocks, and the left arrow selects the block that holds the current one.
- Alt with the up or down arrow moves the block.
- Delete or Backspace removes it.
- Drag a row to move the block.
- Hold Shift and press an arrow, or hold Shift or Ctrl (Cmd on a Mac) and click, to select several blocks. You can then **Put in a group**, **Duplicate** or **Remove** them together.

A row with an eye icon is hidden on some screens or for some visitors; see [Choose who sees a block](#choose-who-sees-a-block).

## Undo a change

**Undo** and **Redo** in the bar (Ctrl+Z and Ctrl+Shift+Z, or Cmd on a Mac) step back and forward through every change. After a step you may regret, such as removing a block, adding a layout or **Replace all**, a message at the bottom right offers **Undo** for a few seconds.

## Change how a block looks {#style-a-block}

The **Style** tab changes how the selected block looks, without touching the theme. Select the block first, then open the tab.

![The Style tab for a selected heading, with Phone, Tablet and Desktop at the top and the Colour and Spacing settings below.](/screenshots/editor-style.png)

- **Colour**: **Text** and **Background**, from your theme's colours or any colour you pick.
- **Spacing**: **Padding** (on every side, or **Different padding per side**), **Space above** and **Space below**.
- **Type**: **Text size**.
- **Border**: **Line**, **Line width**, **Line colour** and **Corners**.

Each block offers only the styles that suit it. A block with **This block has no style settings** takes its look from the theme.

To give several blocks the same look, style one, choose **Copy styles** in its **More** menu, select the others and choose **Paste styles**.

With **Desktop** chosen at the top of the tab, **Clear every style of this block** puts the block back to the theme's look.

## Make a page look different on phones {#styles-per-screen-size}

A page that looks right on a wide screen can feel cramped on a phone: too much padding, a heading that is too big. You can change the look for phones and tablets without changing it for larger screens.

1. Select the block and open the **Style** tab.
2. At the top of the tab, choose **Phone**. The page in the middle switches to phone width, so you see what you change.
3. Change the style, for example less padding or a smaller **Text size**.
4. Choose **Desktop** to go back to the full width.

Styles set on **Desktop** apply on every screen size. Styles set on **Tablet** apply on tablets and phones, and styles set on **Phone** apply on phones only. A screen size you have not changed follows the larger one. **Clear the phone styles** (or **Clear the tablet styles**) removes the styles of that size only.

To leave a block out on some screens altogether, use **Screens** under [Choose who sees a block](#choose-who-sees-a-block).

### Preview widths

The three buttons in the middle of the bar show the page as on a phone (390 pixels wide), a tablet (820 pixels) or a full screen. Above the page, a line such as "Phone, 390 px wide" says which width you are looking at. The width also chooses which screen size the **Style** tab changes.

![The same About page shown at phone width in the middle of the editor.](/screenshots/editor-phone.png)

## Choose who sees a block

Open **Who sees this block** at the end of the **Block** tab:

- **Visitors**: **Everyone**, **Only visitors who are not signed in** or **Only signed-in members**.
- **Screens**: turn the block off for **Phones**, **Tablets** or **Larger screens**. A block cannot be hidden on all three; remove it instead.
- **Show from** and **Hide after**: a date and time window, described below.

Blocks shown only to signed-in members, or only within a date window, are left out of [site search](/guide/search#what-search-finds).

### Show something only for a while

A notice about a sale, a holiday closure or a seasonal bake can appear and disappear on its own, so you do not have to remember to remove it.

1. Select the block, or the **Group** that holds the notice.
2. In the **Block** tab, open **Who sees this block**.
3. Under **Show from**, pick the date and time it should appear. Leave it empty to show it straight away.
4. Under **Hide after**, pick the date and time it should go away.
5. Save the page.

The block stays in the page after its time is over, so you can give it new dates next time.

## Find and replace words

**Find and replace** (the magnifying glass, or Ctrl+Shift+F) searches the words on the page: headings, text, lists, tables and buttons. Use it, for example, when your opening hours change and the old ones appear in several places.

![The Find and replace panel on the left, with the Find and Replace with fields.](/screenshots/editor-find-replace.png)

1. Type under **Find**. The panel lists each block with a match, the words found marked. Click one to go to that block.
2. Type the new words under **Replace with**.
3. Choose the replace button next to one block (**Replace in this block**), or **Replace all**.

Turn on **Match upper and lower case** to find "Spring" but not "spring".

## Details, outline and checks

The **i** button in the bar opens **Details and outline**: the number of words, characters, paragraphs and blocks, the reading time, and the page's headings in order. Click a heading in the outline to go to it.

![Details and outline open over the page: counts of words, characters, headings, paragraphs and blocks, the reading time, and the outline of headings.](/screenshots/editor-details.png)

Before you publish, look at the **Checks** tab. It looks at the page as visitors get it, theme included, for problems such as an image without alt text, a link with no text, an empty heading or heading levels that skip one (from Heading 2 to Heading 4). The number on the tab says how many it found.

![The Checks tab listing one problem on the page.](/screenshots/editor-checks.png)

Choose **Show** next to a problem to select the block. **Check again** runs the checks after you change something.

## Save and publish {#publishing}

The buttons at the right of the bar save the page. What they say depends on its status: **Save draft** and **Publish** for a draft, **Update** for a published page, **Schedule** when a time is set. Ctrl+S (Cmd+S on a Mac) saves too. Next to them, the bar says **Unsaved** while you have changes and **Saved** after.

The tab named after the content type (**Page** for a page) starts with a short timetable:

- **Goes live**: **When you publish**, or the time it is set to go live. A time still to come is marked in yellow, and **Publish** becomes **Schedule**. Choose **Set a time** (or **Change**) to pick one. **Publish when I choose Publish** removes it again.
- **Address**: the page's address on the site. It follows the title until the page is published. Choose **Change** to type the last part yourself.
- **Created** and **Version**, once the page has been saved.

Below it are the page's **Template**, parent page, **Page order** and author, the **Search and sharing** fields and **Revisions**. Actions the bar does not have, such as **Unpublish (back to draft)**, are here too.

### Templates

**Template** decides how the page is laid out around your blocks: a header, a footer, a sidebar. The page in the editor changes as soon as you choose another template, before you save. Templates are made under **Appearance → Templates**; see [Themes and design](/guide/themes#change-page-layouts-templates-parts-and-patterns).

## Laptops and small screens

On a screen narrower than about 1,180 pixels, only one side panel is open at a time, so the page keeps its room: opening **Settings** closes **Layers**, and the other way round. **Hide both panels** in **Options** (or Ctrl+Shift+\\) gives the page the whole width.

## The block toolbar, button by button

From left to right, the toolbar of a selected block offers:

- **Select** the block that holds this one, such as **Select Cover** (shown when there is one).
- **Drag to move**: hold and drag the block somewhere else. Drop it at the side of another block to put the two side by side in columns.
- The block's name. Click it to **Turn into** another kind of block, for example text into a heading or a list. The words come along.
- **Move up** and **Move down**.
- Settings of the block itself, such as **Heading level** and **Alignment**.
- **Bold**, **Italic**, **Link** and **More formatting** (strikethrough, inline code, highlight, subscript, superscript, **Clear formatting**). They work while you type in the text.
- **Add a block after**.
- **More**: **Add before**, **Add after**, **Duplicate**, **Copy**, **Paste after**, **Copy styles**, **Paste styles**, **Put in a group**, **Ungroup**, **Block settings** and **Remove**.

## If something goes wrong

**"Not available: its plugin may be off."** The page uses a block from a plugin that is turned off. The block is kept, but not shown on the site. Turn the plugin back on under **Plugins** and it returns.

**"This page's template has no Entry content block, so these blocks go after everything in the template, for visitors too."** The chosen template has no place for the page's own blocks, so they appear after it. Choose **Choose another template**, or ask whoever designs the site to add the **Entry content** block to that template.

**A new block went inside another block instead of after it.** **Add a block** in the bar puts the new block inside the selected block when that block can hold others. Choose **Undo**, select the block you want it to follow, and use **Add a block after** on the block toolbar instead.

**A block cannot be changed or moved.** The block came from a layout whose designer locked it (**Locked for editors** in the layers). People who may design can still change it; see [Themes and design](/guide/themes).

**"The block list could not be loaded."** The editor could not reach the site. Check your connection and choose **Try again**.

**"Someone else saved this while you were editing."** See [When two people edit at once](/guide/content#when-two-people-edit-at-once).

## Related pages

- [Pages, posts and other content](/guide/content): statuses, reviews, scheduling, revisions and addresses.
- [Media library](/guide/media): the images and files your blocks use.
- [Themes and design](/guide/themes): templates, parts and patterns.
- [Forms](/guide/forms): build a form and put it on a page with the **Form** block.
