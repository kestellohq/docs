---
title: Emails
description: The emails your site sends, how they look, and how to change their words, add images and buttons, and check them before anyone gets one.
---

<script setup>
const where = [
    { title: 'Your words', text: 'Site → Emails: what each email says, per language.', tone: 'brand' },
    { title: 'Your logo and footer', text: 'Site → Settings → Emails.' },
    { title: 'Your theme', text: 'Colours and the font, from Appearance → Styles, and the layout, if the theme brings one.', items: ['light', 'dark'] },
    { title: 'Kestello', text: 'The layout every email shares unless the theme has its own, and the words each one starts with.', tone: 'muted' },
];
const change = [
    { title: 'Open the email', text: 'Site → Emails, then the email.' },
    { title: 'Change it', text: 'Reword, add, move or remove blocks.', tone: 'brand' },
    { title: 'Check it', text: 'The preview, then Send me a test.' },
    { title: 'Save', text: 'From the next email on.' },
];
const language = [
    { title: 'Someone with an account', text: 'Their own language, set on their profile. Empty means the site’s.' },
    { title: 'An address without an account', text: 'The language of the page they used, such as the sign-up page.' },
    { title: 'Your edit in that language', text: 'If there is one; otherwise the email as Kestello writes it, translated.', tone: 'brand' },
];
</script>

# Emails

Your site sends email when someone signs up, resets a password, changes their address or sends a form. This page lists those emails, explains where their look comes from, and shows how to change what they say before anyone receives one.

To send email at all, the site needs a mail server. If test emails don't arrive, set one up first: [Your first hour](/guide/first-steps#email).

## The emails your site sends

| Email | When it is sent |
| --- | --- |
| **Sign-up link** | Someone signs up with an address that has no account yet. The link lets them choose a password. |
| **Sign-up for an existing account** | Someone signs up with an address that already has an account. It is sent instead of the sign-up link, so nobody learns which addresses have one. |
| **Password reset** | Someone asks to reset their password. |
| **New email address** | Someone changes their email. It goes to the new address, and the account keeps the old one until this is confirmed. |
| **Email address changing** | The same change, told to the old address. |
| **Sign-in method added** | A provider such as GitHub or Google is connected to an existing account. |
| **Password known to someone else** | Someone enters the right password but keeps failing the two-step code. |
| **Account deleted** | Someone deletes their own account. |
| **Form submission** | Someone sends a form that notifies people by email. Each form sets its own subject. |
| **Test email** | You send one from **Site → Settings → Email** to check that the site can send email. |

Plugins can add their own; they appear in the same list.

## Where an email's look comes from

Every email is built from the same layout, then made yours in layers. The top layer wins:

<Layers :layers="where" caption="An email’s words, logo and colours, from the top layer down" />

- **Colours and the font** follow your theme. Change them under **Appearance → Styles**, and the emails change with the site. Mail apps in dark mode get the theme's dark colours. If a colour would make text hard to read, Kestello uses a readable one instead.
- **The logo** is your site's logo, shown 40 pixels tall. Change it, or turn it off, under **Site → Settings → Emails** (see [Settings](/guide/settings#emails)). If your logo is dark, add a light version there as the **Logo in dark mode**: mail apps in dark mode, such as Apple Mail and Outlook, show it instead.
- **The footer** shows the site name and, if you write one, a line such as a postal address.
- **The layout**, where the logo, the card and the footer sit, is Kestello's unless your theme brings its own. The Base theme does: it shows your site's name on a band in the theme's accent colour above the email. Changing themes under **Appearance → Themes** can change it. Your words, logo and footer stay the same whichever layout is used.

## Change what an email says

<Flow :steps="change" caption="Changing an email, from opening it to the next one sent" />

1. Open **Site → Emails** and choose the email, such as **Password reset**.
2. Change the **Subject** if you like. Left empty, the original subject is used.
3. Change the blocks: the text in each one, their order with the arrows, or remove one with the bin. **Add** puts a new block at the end: **Heading**, **Text**, **Button**, **Image**, **Divider** or **Small print**.
4. Watch the preview on the right. It shows the email with sample values, as **Light** or **Dark**, **Wide** or **Phone**, and as **Plain text** (the version mail apps show when they don't show pictures).
5. Choose **Send me a test**. The draft goes to your own address with sample values, and nothing is saved.
6. Choose **Save**. The next email of this kind uses your words.

### Values: the name, the site, the link

Text such as `{site}` or `{name}` is replaced with the real value in each email: the site's name, the person's username, and so on. Under the subject, **Values you can use** lists the ones this email has. Click in a field, then click a value to put it where the cursor is.

### Blocks the email needs

Some blocks are marked **Needed**: the button with the link in a password reset, for example, and the sentence that tells people what to do if they didn't ask for the email. You can change their words and move them, but not remove them, because the email doesn't work without them. The link itself is always the one the site makes for that person.

### Images and buttons

- **Image**: choose a picture from the media library, then describe it under **Describe it**. The description is read aloud to people who can't see the picture, and shown when a mail app hides pictures. Leave it empty only for a picture that is decoration.
- **Button**: write its text and where it goes, as a whole address starting with `https://`, or one of the email's links such as `{link}`.

### Go back to the original

**Use the original** removes your edit, and the email goes out as Kestello writes it again. With more than one language, it removes the edit in the language you are looking at only.

## Emails in more than one language

If your site has more than one language, each email is sent in its reader's language:

<Flow :steps="language" vertical caption="How the language of an email is chosen" />

- People choose their language under **Your profile → Account → Language**. The field is there only when the site has more than one language.
- Edits are kept per language. Choose the language at the top of the editor, then edit and save. Your edit in one language leaves the others as they are.
- An email in a language you haven't edited goes out as Kestello writes it, translated.

## Who can change emails

The permission **Change how the site's emails look and what they say** allows **Site → Emails** and **Site → Settings → Emails**. Administrators have it. Give it to another role under [People](/guide/people) if someone else looks after your emails.

## If something goes wrong

- **"Keep the block “link”: the email doesn’t work without it."** A needed block was removed. Choose it under **Put back**.
- **"This email has no value called {nam}. It has: …"** A value is misspelt. Use one from the list, or click a value under the subject.
- **"A button needs a whole address starting with https://, or one of the email’s links such as {link}."** A button's **Goes to** is empty or a short address such as `/contact`. Mail apps need the whole address: `https://example.com/contact`.
- **"Choose an image from the media library. It must still be there, and the site needs its address (Settings → General)."** The image was deleted, or **Site address** under **Site → Settings → General** is empty, so mail apps couldn't load it.
- **"The email could not be sent. Check Settings → Email and the server log."** The test email didn't leave the site. Check the mail server under [Settings](/guide/settings#email).
- **The preview says "Not updated:" and a reason**, and keeps the last version that worked: the draft has one of the problems above. Fix it, and the preview catches up.

## Next

- [Settings](/guide/settings#emails): the logo and footer of every email.
- [People](/guide/people): roles and the permission to change emails.
- [Translating](/guide/translating): adding languages to the site.
