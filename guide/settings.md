# Settings

**Site → Settings** is where the site-wide choices live: its name and address, how it sends email, what search engines see, who may sign up, how pictures are prepared. You set most of them once, in [your first hour](/guide/first-steps), and come back here when something needs to change.

Each tab has its own save button at the bottom, such as **Save general** or **Save reading**. Changes apply straight away, and nothing you change here touches your pages or posts.

**Who can do this:** people with the permission *Change site settings*, which administrators have. A few tabs need more, as noted below. Someone without that extra permission doesn't see those tabs at all.

## General

The name, address and clock of your site.

| Setting | What it is for | Default |
|---|---|---|
| **Site name** | Shown in the browser tab, in emails and in the admin. | The name given at installation |
| **Tagline** | One sentence about the site, used by search engines and themes. | Empty |
| **Site address** | The public address, starting with `https://`. Links in emails, such as password resets, are built from it. | The address given at installation |
| **Timezone** | The clock for dates on the site and for scheduled posts and tasks. Choose the city you work in. | UTC |
| **Language** | The language of the admin, of emails, and of the words your theme shows by itself, such as "Read more". Language packs add more languages. It is also the main language of your content. | English |
| **Other languages** | Languages your content is also written in. Each lives under its code, such as `/es` for Spanish. See [A site in several languages](/guide/languages). | None |
| **Name and tagline in other languages** | The **Site name** and **Tagline** in each other language. Empty fields use the main ones. | Empty |
| **Addresses in other languages** | A word of each language for each content type's and category's address, such as `proyectos` for `/projects`. | Empty |

When the site has more than one language, each person can also choose the language of the emails they get: **Language** on **Your profile**. Left at **The site's language**, they get the one set here. See [Emails](/guide/emails).

Changing **Site address** needs the permission *Manage infrastructure, background jobs, scheduled tasks and Site Health* as well, because password reset links are built on it.

## Reading

What visitors and search engines see.

| Setting | What it is for | Default |
|---|---|---|
| **Post addresses** | The pattern of each post's address: its name alone (`/blog/sample-post`), or with the year, month or day in front (`/blog/2026/11/sample-post`). Old addresses keep working: they redirect to the new pattern. See [Post addresses](/guide/content#post-addresses). | `/blog/sample-post` |
| **Home page** | The page shown at your site's address. **The theme's home page** uses whatever your theme puts there; choose one of your pages to show that instead. Its own address then redirects to the home page. See [The home page](/guide/content#the-home-page). | The theme's home page |
| **Entries in feeds** | How many of the newest entries feed readers get. | 10 |
| **Hide the site from search engines** | For a site that isn't ready: every page asks search engines not to list it. Visitors can still open it. Turn it off at launch (see [Going live](/guide/going-live)). | Off |
| **robots.txt additions** | Extra lines for `robots.txt`, the file that tells search engines where they may look. Kestello's own lines come first: the admin and the API are always excluded, and the sitemap is listed. Most sites leave this empty. | Empty |

Sites with other dated content types, such as events, get an **addresses** setting for each of them too.

## Search and sharing

How your pages appear in search results, browser tabs and link previews: the title pattern, the separator, the default sharing image, and who runs the site. Each is explained, with examples, in [Search and sharing](/guide/search-and-sharing#titles-and-the-default-image-for-the-whole-site).

## Email

How the site sends password resets, notifications and form submissions. Without an SMTP server, the site uses the server's own mail, and messages often land in spam. Setting it up, step by step, is in [Your first hour](/guide/first-steps#email).

| Setting | What it is for | Default |
|---|---|---|
| **From address** | The sender of every email. Replies go here, so use a mailbox someone reads. | Empty |
| **From name** | The name people see as the sender, such as your business name. | Empty |
| **SMTP server**, **Port**, **Encryption**, **Username**, **Password** | Your email provider's sending details. Leave **SMTP server** empty to use the server's own mail. Use `tls` for port 587 and `ssl` for port 465. | Empty, 587, tls |

After saving, use **Send a test email** to check that a message reaches you.

This tab needs the permission *Manage infrastructure, background jobs, scheduled tasks and Site Health* as well. Password reset links travel through the mail server, so whoever sets it could read them.

## Emails

How every email the site sends looks: the logo at the top and a line at the foot. Colours and the font come from your theme. What each email says is changed under **Site → Emails**, explained in [Emails](/guide/emails).

| Setting | What it is for | Default |
|---|---|---|
| **Show a logo** | Show a logo at the top of every email. Without one, the site name is shown at the foot only. | On |
| **Email logo** | The picture to use. Left empty, the **Logo or photo** from **Search and sharing** is used. It is shown 40 pixels tall. | Empty |
| **Logo in dark mode** | Shown instead of the logo when a mail app is in dark mode, such as a light version of a dark logo. Mail apps that do not tell an email they are dark, such as Gmail, show the logo. | Empty |
| **Footer text** | A line under the site name in every email, such as a postal address. | Empty |

This tab needs the permission *Change how the site's emails look and what they say*.

## Accounts

Whether people can create an account on the site themselves. You can always add people yourself under **People**. Details are in [Let people create their own account](/guide/people#sign-up).

| Setting | What it is for | Default |
|---|---|---|
| **Who can create an account** | **Nobody: you add people yourself**, **Anyone**, or **Only people with an address at the domains below**. Signing up by email proves the address with a link before the account exists. | Nobody |
| **Allowed email domains** | For the last choice above: the domains, separated by commas, such as `example.com, example.org`. | Empty |
| **Role for new accounts** | What new accounts may do. Administrator is never given this way. **User** may only sign in and look after their own profile. | **User** |
| **Connect provider sign-ins by email** | When someone signs in with a provider such as Google that confirmed their email, connect it to the account with that address. Leave it off unless you trust every provider you use. | Off |
| **Trust the provider's two-step check** | Skip Kestello's two-step code when the provider says it already asked for a second factor. | Off |

This tab needs the permission *Create, edit and delete users* as well, because opening sign-up hands out accounts.

## Media

What people may upload to the media library, and how pictures are prepared for pages. Images are always allowed; scripts and web pages never are. What each setting does to your pictures is explained in [Media library](/guide/media).

| Setting | What it is for | Default |
|---|---|---|
| **Largest upload (MB)** | The largest file anyone can upload. Your server may set a lower limit. | 64 |
| **Largest image (megapixels)** | Larger images are refused, because opening them could use up the server's memory. A 6000 × 4000 photo is 24 megapixels. | 50 |
| **Documents**, **Audio**, **Video** | Allow PDF and office files; MP3 and other sound files; MP4 and other videos. | On |
| **Archives** | Allow ZIP files. Off, because an archive can hide anything. | Off |
| **SVG images** | Allow drawn (vector) images. Scripts, links and anything that isn't drawing are removed before they are stored. | Off |
| **Largest photo edge (px)** | Larger photos are scaled down on upload. 0 keeps every original at full size. | 2560 |
| **Make AVIF** | Makes the smallest picture files, for modern browsers. Takes more server time. | On |
| **AVIF quality**, **WebP quality**, **JPEG quality** | From 1 to 100. Higher looks better and weighs more. | 50, 75, 80 |
| **Optimize images losslessly** | Makes JPEG and PNG files smaller without changing a pixel, when the server has the tools for it. | On |
| **PDF thumbnails** | Shows the first page of each PDF as its picture, when the server has Ghostscript. | On |

## Performance

Pages for visitors who aren't signed in are kept ready, so they open fast, and refreshed whenever the content on them changes. You rarely need to change this. If a page shows old content, see [Pages show old content](/guide/troubleshooting#old-content).

| Setting | What it is for | Default |
|---|---|---|
| **Cache pages** | Keep pages ready for visitors. | On |
| **Keep pages for** | Seconds a page is kept when nothing changes. Edits refresh pages right away anyway. | 86400 (a day) |
| **CDN cache time** | Seconds a CDN or proxy in front of the site may keep pages. It can't be told when pages change, so keep this short. 0 means it asks every time. | 0 |

## Code

HTML added to every public page, such as an analytics script or a tag that proves to Google or another service that the site is yours. It is never added to the admin or the sign-in pages.

| Setting | Where the code goes |
|---|---|
| **In the head** | Inside `<head>`, after Kestello's own tags. Most analytics and verification tags go here. |
| **At the start of the body** | Right after `<body>` opens, for example a tag manager's `<noscript>` part. |
| **At the end of the body** | At the end of `<body>`. |

Paste the code exactly as the service gives it to you. Scripts get the site's security stamp (a nonce) by themselves; attributes such as `onclick` don't run.

This tab needs the permission *Add code to every page of the site* as well. Code here runs for every visitor, so give it only to people you trust with the whole site.

## Settings from plugins

Plugins can add tabs of their own here. Their settings are explained in each plugin's own documentation.
