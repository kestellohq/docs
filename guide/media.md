# Media

This page covers the media library: uploading images and files, which kinds of files are allowed and how large they may be, what Kestello does to your images, cropping and turning them, the focal point and alt text, and deleting files. Read it before you upload the first photos for a new site, or when an upload is refused.

## The media library

Open **Content → Media**. Everything uploaded to the site is here, newest first. Anyone who can use the admin can open this screen.

- The tabs filter by kind: **All**, **Images**, **Documents**, **Audio**, **Video** and **Archives**. Only the kinds your site allows are shown.
- **Search** finds files by title, file name or alt text.
- **Only mine** shows the files you uploaded yourself.
- **Show more** at the bottom loads the next files.

Select a file to open its details on the right: a preview, the file name, size and dimensions, who uploaded it and when, its address with a button to copy it, and **Used in**, the list of entries that use it.

## Upload files

1. Open **Content → Media**.
2. Choose **Upload** and pick one or more files. You can also drag files from your computer and drop them anywhere on the page.
3. Each file shows a progress bar, then **Added**. The new files appear at the top of the library.

Large files are sent in pieces of 4 MB, so an upload that is interrupted does not have to start from the beginning. An upload nobody finishes is removed after a day.

You can also upload while editing an entry: an image field such as **Featured image**, or the **Image** block, opens the media library with its own upload area. Pick an existing file with **Use this file**, or upload a new one there.

Editors, authors and contributors can upload. Editors can change and delete anyone's files; everyone else can change and delete only the files they uploaded themselves.

## Allowed files and size limits

Open **System → Settings**, then the **Media** tab. Images (JPEG, PNG, GIF, WebP and AVIF) are always allowed. The rest can be switched on and off:

| Setting | What it allows | Default |
|---|---|---|
| **Documents** | PDF, Word, Excel, PowerPoint, OpenDocument, RTF, text and CSV. | On |
| **Audio** | MP3, M4A, Ogg, WAV and FLAC. | On |
| **Video** | MP4, M4V, MOV and WebM. | On |
| **Archives** | ZIP files. | Off, because archives can hide anything. |
| **SVG images** | Vector images. Scripts, links and anything that is not drawing are removed before they are stored. | Off |

Two settings limit size:

| Setting | What it does | Default |
|---|---|---|
| **Largest upload (MB)** | The biggest file anyone can upload. | 64 |
| **Largest image (megapixels)** | Larger images are refused, because decoding them could use up the server's memory. A 6000 × 4000 photo is 24 megapixels. | 50 |

Some files are never accepted, whatever the settings say, because a web server could run them: web pages (`.html`), scripts (`.php`, `.js` and similar) and programs (`.exe` and similar). Kestello also checks what is inside each file. A file whose content does not match its name, such as a PDF renamed to `.jpg`, is refused.

SVG images can be at most 5 MB, and Kestello does not make smaller sizes of them.

## What happens to images

When you upload a photo, Kestello prepares it before storing it:

- **It is turned the right way up**, if the camera saved it sideways.
- **Hidden information is removed**, such as the camera model and the place where the photo was taken.
- **Very large photos are scaled down.** **Largest photo edge (px)** (default 2560) sets the longest side a stored photo may have. Set it to 0 to keep every original at full size.

Animated GIFs and WebPs are not resized or turned.

### Sizes and formats

Pages rarely need the full image. Kestello makes smaller copies and lets each visitor's browser pick the one that fits the screen. The built-in sizes are:

| Size | What it is |
|---|---|
| **thumb** | 320 × 320 pixels, cropped to a square around the focal point. |
| **medium** | Up to 960 pixels wide. |
| **large** | Up to 1920 pixels wide. |

Themes and plugins can add sizes of their own. Each size comes in several widths, and images are never made larger than the original.

Each copy is made in up to three formats: **AVIF** (the smallest, for modern browsers), **WebP**, and JPEG or PNG for older browsers. The **Media** settings control them:

| Setting | What it does | Default |
|---|---|---|
| **Make AVIF** | Makes AVIF copies. They are the smallest files, but take more server time to make. | On |
| **AVIF quality**, **WebP quality**, **JPEG quality** | Higher looks better and weighs more. 50 for AVIF looks like JPEG at 80 in about half the bytes. | 50, 75, 80 |
| **Optimize images losslessly** | Squeezes JPEG and PNG files further without changing a pixel, when the server has the tools jpegoptim or oxipng. | On |
| **PDF thumbnails** | Shows the first page of each PDF as its picture, when the server has Ghostscript. | On |

Copies are made in the background, or the first time a page asks for one, so a new image can take a moment to appear in all sizes. Changing a quality setting makes new copies as pages ask for them.

All of this needs an image library on the server (Imagick or GD). **System → Site Health** has an **Image processing** check that says which one Kestello uses and which formats it can write. Without one, images are served as uploaded: no smaller sizes, no WebP or AVIF, and large photos are not scaled down. Hidden information is still removed from JPEG, PNG and WebP files, except from photos the camera saved sideways, which stay as they are.

## Alt text, title and caption

Open an image in the library to edit its details:

- **Alt text**: describes the image for people who cannot see it, such as visitors using a screen reader. Search engines read it too. Leave it empty only if the image is purely decorative.
- **Title**: for you and other editors. Kestello makes it from the file name when you upload.
- **Caption**: some themes show it under the image.

Choose **Save** when you are done.

Alt text set here is used wherever the image appears. The **Image** block has its own **Alt text** field for when one page needs a different description; leave that empty to use the one from the library.

## Set the focal point

When a theme crops an image (the square **thumb**, or a wide banner size), Kestello keeps the most important part in view. By default that is the middle of the image. To change it:

1. Open the image in **Content → Media**.
2. Click on the preview where the important part is, such as a person's face. A dot moves there. You can also select the dot and move it with the arrow keys (hold Shift for bigger steps).
3. Choose **Save**.

Cropped sizes are made again around the new point. Sizes that are not cropped are not affected.

## Crop, turn and flip an image

You can fix a photo without leaving the admin: cut away the edges, turn a sideways picture upright, or mirror it.

1. Open the image in **Content → Media**.
2. Choose **Edit image**.
3. Use **Turn left**, **Turn right**, **Flip horizontally** and **Flip vertically**. To crop, drag the frame or its corners and edges. Selecting the frame or a handle and pressing the arrow keys moves it too (hold Shift for bigger steps).
4. To crop to a fixed shape, such as a square for a profile picture, pick it under **Shape**. **Original** keeps the shape of the uploaded image.
5. Check the size under the picture, then choose **Save image**.

Every page and post that uses the image shows the new version straight away, in every size. The focal point moves with the picture. When it falls outside the crop, it moves to the nearest edge; set it again if needed.

Your original is kept. Each time you edit, Kestello starts again from it, so cropping a second time never makes the photo blurrier. The edited image gets a new address, so visitors never see an old copy from their browser's cache.

To undo every change, choose **Edit image**, then **Restore original**.

::: tip Cropping something out
While an image is edited, its original is private: the old address stops working, so a part you cropped away is no longer on the site. A copy that a CDN or a visitor's browser saved before can linger until it expires, and some cloud storage makes a whole bucket public, so the original stays reachable at its old address. If you need something gone for good, edit the photo on your computer, upload it as a new file and delete the old one.
:::

Only still pictures in JPEG, PNG, WebP, AVIF and GIF can be edited, and only when the server's image library can write the format. **Edit image** is missing for SVG drawings, animated images, and other files.

## Replace a file

Kestello has no way to swap the file behind an existing library item. To use a new version:

1. Upload the new file.
2. Open the old file in the library and look at **Used in**.
3. Open each entry listed there, pick the new file in its field (the **Replace** button on the field), and save.
4. Delete the old file once nothing uses it.

## Delete a file

1. Open the file in **Content → Media**.
2. Choose **Delete**.
3. If no entry uses it, confirm with **Delete file**. If entries use it, the message says how many, and the button reads **Delete anyway**.

::: danger
Deleting removes the file and all its sizes from storage. This cannot be undone. Entries that used it show a missing file until you pick another one; in the editor, the field shows **Removed from the library**.
:::

**Used in** lists entries whose fields point at the file. Files that only appear through a link typed into text, such as a PDF linked from a paragraph, are not counted. Check those before deleting.

## Storage on other disks

Out of the box, uploads are stored on the server in the folder `storage/app/media`, and visitors see them at addresses starting with `/uploads`. An administrator can move the library to an outside storage service such as an S3-compatible bucket under **System → File storage**. The disk has to be added in `config/storage.php` first. New uploads go to the new disk straight away and existing files follow one by one; pages keep working while they move. The same screen sets **Upload quotas**: how much each role may keep in the library.

## If something goes wrong

**"This type of file is not allowed here."** The file's type is not on the allowed list, or not allowed in this field. Check the **Media** settings, or pick a file of the kind the field asks for.

**"Files of type .php can't be uploaded."** The file name contains an extension that is never accepted, even hidden in the middle, as in `photo.php.jpg`.

**"Uploading video files is switched off in the media settings."** (or audio, document, archive). Turn on that kind under **System → Settings → Media**.

**"This type of file is not supported. (.psd)"** Kestello does not know this kind of file at all, for example a `.psd` or `.heic`. Convert it to a supported format first. Most phones can save photos as JPEG instead of HEIC.

**"The file is larger than 64 MB, the most this site takes."** Raise **Largest upload (MB)**, or make the file smaller. In the browser this shows before uploading as "Larger than 64.0 MB."

**"The image is 12000 × 9000 pixels; the limit is 50 megapixels."** Scale the image down before uploading, or raise **Largest image (megapixels)** if your server has the memory for it.

**"The file's content (application/pdf) doesn't match its .jpg name."** The file was renamed. Upload it with its real extension.

**"This image could not be read." or "This image could not be decoded."** The file is damaged, or saved in a variant the server's image library cannot open. Open it in an image editor and save it again as JPEG or PNG.

**"This SVG could not be read safely. Files with a DOCTYPE or entities are refused."** The SVG contains parts that could be misused. Export it again from your drawing program as a plain SVG.

**"This would go over your 500 MB of storage (480 MB used)."** Your role has an upload quota and you have reached it. Delete files you no longer need, or ask an administrator for more room.

**"Too many unfinished uploads. Finish or cancel some first."** You have 20 uploads in progress. Wait for them, or cancel some.

**"You can't upload files."** Your role does not include uploading. Ask an administrator.

**"Only the uploader or an editor can change this file."** (or delete). You can only change files you uploaded yourself.

**"Drawings (SVG) are edited in a drawing program, then uploaded again."** SVG files are drawings, not photos. Change them in the program that made them.

**"Animated images can't be edited here: their frames would be lost."** Edit the animation on your computer and upload it again.

**"The image engine on this server can't edit WEBP files."** (or another format). The server's image library can read the image but not save it in that format. Open **System → Site Health** and look at **Image processing**.

**"The original can't be shown from this storage, so the image can't be edited here."** The storage the library uses can't make the short-lived link the editor needs to show the private original. **Restore original** still works. Then you can edit again.

**Images appear only in their original size, or not as WebP.** Open **System → Site Health** and look at **Image processing**. Your host may need to install Imagick or GD with WebP support.

## Related pages

- [Pages, posts and other content](/guide/content): using images in entries.
- [Site Health](/guide/health#media-images): the **Image processing** check.
- [Backups](/guide/backups): uploads are included in backups made with files.
