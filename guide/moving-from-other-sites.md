# Moving from Squarespace, Wix or another site

Not every site builder lets you take your site with you in one file. This page shows how to move one anyway, without losing your place in search results: what you can bring over in one go, what you copy by hand, and how to make sure old links still work.

Coming from WordPress? [Moving from WordPress](/guide/import-wordpress) is quicker: it brings everything over in one go.

::: tip How long it takes
A small business site with ten to twenty pages usually takes an afternoon or two, most of it copying text and pictures and checking how pages look. A blog with hundreds of posts is worth bringing over with an export file if your builder can make one (see below).
:::

As with any move, your old site stays exactly as it is until you switch the domain over, so there is no rush.

## Before you start

1. **Make a list of your old addresses.** Most site builders, Squarespace and Wix included, publish a list of every page at `/sitemap.xml`. Open your old site's address followed by `/sitemap.xml`, for example `https://www.example.com/sitemap.xml`, and save the page. These are the addresses Google knows, and each one should still lead somewhere after the move.
2. **Note what is more than text and pictures**: a shop, bookings, a members area, forms. Those need a plan of their own; see [What doesn't move](#what-doesnt-move).
3. **Make a backup of this site** under **Site → Backups**, so you can go back to how it was.

## Bring over what you can in one go

**Squarespace** can export part of a site, mostly basic pages and one blog, as a file in WordPress's format. Squarespace's help page on exporting your site shows where to find it. Try importing that file here exactly as described in [Moving from WordPress](/guide/import-wordpress#run-the-import). Nothing is imported until you have seen the review, so you lose nothing by trying. Pictures may keep pointing at Squarespace: check them in the media library, and copy them over by hand before you cancel Squarespace.

**Other builders**, such as Wix, have no export of pages that another system can read. Copy the content by hand, as below. For a blog with many posts, ask your builder's support whether they can export the posts; any file in WordPress's format can be tried with the import.

## Copy pages by hand

For each page on your list:

1. **Create the page** under **Content → Pages** with **New page**, and give it the same title. If it sat under another page, choose that page as its parent.
2. **Copy the text** from the old page and paste it into the page. Check the result, and use **Heading** blocks for the headings so the page has a clear outline, and links so visitors can move around.
3. **Save the pictures** from the old page (right-click a picture and save it, or use your builder's own download), then upload them to the [media library](/guide/media) and add them with an **Image** block. Write alt text as you go.
4. **Rebuild the layout** with the [visual editor](/guide/visual-editor): columns, a cover picture, buttons. It doesn't need to match the old site exactly; your theme sets the look.
5. **Publish** the page.

Then build the [menus](/guide/menus) so the site's navigation matches what visitors are used to.

## Keep old links working

Old addresses from a site builder rarely match Kestello's. A Squarespace blog post might live at `/blog/fresh-bread`, a Wix page at `/about-us`, and your new page at `/about`. A redirect sends anyone who opens the old address to the new one, so search engines and old links keep working.

1. Go through your list of old addresses, and next to each, write the new address it should lead to.
2. Add them as redirects under **Site → Redirects**. For more than a handful, put them in a CSV file, one per line as `old,new`, for example `/about-us,/about`, and use **Import**. See [Import and export](/guide/redirects#import-and-export).
3. Addresses that are the same on both sites need nothing.

After you switch over, check the [Not found list](/guide/redirects#the-not-found-list) for a week or two. It shows the old addresses people still try that lead nowhere, so you can add the ones you missed.

## What doesn't move {#what-doesnt-move}

Some features are part of the site builder itself, and need a replacement here:

- **Forms**: build them again with [Forms](/guide/forms). Old submissions stay in your old builder; export them there if you need them.
- **Shops, bookings, members areas**: these need a plugin, or a separate service linked from your site. Check what's available under [Plugins](/guide/plugins) before you switch.
- **Blog comments**: Kestello has no visitor comments.
- **Your email**: if your email addresses came with the site builder, they may stop working when you cancel it. Check with your builder before you move the domain.

## Switch over

When the new site is ready, follow the [Going live](/guide/going-live) checklist: point the domain at this site, turn on HTTPS, set the site address, and let search engines in. Keep the old site running until the domain change has reached everyone, then cancel it.

Next up: [Going live](/guide/going-live).
