<script setup>
const submission = [
    { title: "Sent from your site", text: "Forms only take submissions sent from your own site.", fail: "Refused." },
    { title: "Within the visitor's limit", text: "Per visitor and hour, 10 by default.", fail: "Too many tries from here." },
    { title: "Trap field empty", text: "The hidden field only programs fill in.", fail: "Thrown away, while the program is told it succeeded." },
    { title: "Not too fast, not too old", text: "At least two seconds after filling in started, at most two days.", fail: "That was quick, or The form has expired." },
    { title: "Captcha solved", text: "Only when Ask for a captcha is on.", tone: "muted", fail: "Please confirm you are not a robot." },
    { title: "Answers checked", text: "Required fields, and the limits of each field.", fail: "The problem is shown under the field." },
    { title: "Kept and emailed", text: "On Submissions, if Keep submissions here is on. Emails go out in the background, retried up to three times.", tone: "brand" },
    { title: "Thank-you message", text: "Or the page set under Or go to a page." },
];
</script>

# Forms

A contact form, a cake order, a job application: whenever you want visitors to send you something, you build a form. You choose the fields, put the form on a page, and each submission arrives by email and waits in the admin, where you can read it or export it. Spam is caught quietly in the background, and you can add a "not a robot" check for the forms that need it. If submissions or their emails don't arrive, [If something goes wrong](#if-something-goes-wrong) is at the bottom.

## How forms work

You build a form under **Content → Forms**, then place it on a page with the **Form** block. When a visitor sends it, Kestello checks the answers, keeps them on the **Submissions** screen and, if you like, emails them to you.

Editors and administrators can build forms and read submissions. The permission is called *Build forms and read what people send*.

## Create a form

1. Open **Content → Forms** and choose **New form**.
2. Enter a **Name**, such as "Contact" or "Volunteer sign-up". Visitors do not see it; it is for you, and appears in notification emails.
3. Under **Start with**, choose **A contact form** (name, email and message fields, ready to use) or **Almost nothing** (one field to build on).
4. Choose **Create**. The form opens in the form builder.

![The Forms screen listing the Contact form, whether it is open and how many submissions it received.](/screenshots/forms-list.png)

## Add and change fields

![The form editor: Add a field on the left, the form in the middle and the selected field's settings on the right.](/screenshots/forms-editor.png)

The form builder has three parts:

- **Add a field** on the left: **Ready-made** fields (**Name**, **Email**, **Phone**, **Message** and **Consent**, already labelled and set up) and every **Field types** entry.
- The form in the middle, drawn the way visitors see it, with half-width fields side by side.
- The settings on the right, with two tabs: **Field** for the selected field, and **Form** for what happens after sending, emails, keeping and spam.

To add and set up a field:

1. Click a field on the left to add it after the selected field (or at the end), or drag it to the place you want in the form.
2. On the **Field** tab, fill in **Label**, the question visitors see, such as "Your phone number".
3. **Name** is filled in from the label. It is the key each answer is stored under, so keep it short: lowercase letters, digits and underscores, starting with a letter.
4. Set the rest as needed:
   - **Required**: the form cannot be sent without it.
   - **Width**: **Full width**, or **Half width** to put two fields side by side.
   - **Help text**: a hint shown under the field.
   - **Default value**, **Example shown inside the empty field**, and limits such as **Fewest characters** and **Most characters**, depending on the type.
5. Choose **Save** at the top.

Click a field in the form to select it. Its small toolbar offers **Move up**, **Move down**, **Full width** or **Half width**, **Duplicate** and **Remove**. You can also drag a field to move it, press Alt with the up or down arrow, or press Delete to remove it. **Undo**, at the top of **Add a field**, takes back each step.

On an empty form, **Start with name, email and message** adds those three fields at once.

Removing a field also removes the conditions of other fields that used it; **Undo** brings it all back. A field marked **Its condition reads a field below it; move it lower** depends on a field that comes after it, so move it below that field.

### Field types

| Type | What visitors get |
|---|---|
| **Text** | A one-line text box. |
| **Long text** | A larger box for messages. **Rows** sets its height. |
| **Email address** | A text box that only takes an email address. |
| **Web address** | A text box that only takes a web address. |
| **Number** | A number box. You can set **Smallest**, **Largest**, **Step** and **Whole numbers only**. |
| **Choice** | One answer from a list, **Shown as** **A dropdown** or **Radio buttons**. |
| **Several choices** | Any number of answers from a list. |
| **Yes or no** | A checkbox, such as "I agree to the terms". Marked **Required**, it must be ticked. |
| **Date** | A date picker. |
| **File upload** | Lets visitors attach files. See [File uploads](#file-uploads). |

For **Choice** and **Several choices**, add the options under **Choices** with **Add a choice**. Each has a value (stored and exported) and a label (what visitors see).

A form can have up to 60 fields.

### Show a field only when it applies

Any field after the first can depend on an earlier one. Open the field and use **Show only when…**:

1. Turn on **Show only when…**. One rule appears.
2. Pick the earlier **Field**, a **Comparison** (such as **is**, **is not**, **contains**, **is ticked** or **has a value**) and, where needed, a **Value**.
3. To add another rule, choose **Add a rule**. With more than one rule, choose whether **all of these hold** or **any of these holds**.

For example, show "Company name" only when "I am writing as" **is** "A business". A hidden field is never required, and anything a visitor typed into it before it was hidden is not kept.

### File uploads

A **File upload** field lets visitors attach files:

- **Accepts**: tick the kinds of file allowed (**Images**, **Documents**, and so on). Nothing ticked accepts any kind the media settings allow.
- **Largest file (MB)**: up to 20 MB per file. The default is 5 MB.
- **Allow several files**, with **Most files** up to 10. The default is 5.

Visitors see the limits under the field, in the site's language, for example "Up to 3 files, 12 MB each.".

The same rules as the media library apply: only the file types allowed under **Site → Settings → Media**, and never files a server could run. Uploaded files are stored privately, outside the part of the site visitors can reach, and can only be downloaded from the **Submissions** screen by people who may read submissions.

Your hosting's own upload limit also applies to form uploads. If it is lower than **Largest file (MB)**, visitors see "is too large" for files below your limit.

File uploads need **Keep submissions here** to be on (see [Keeping and spam](#keeping-and-spam)), because files are not attached to emails.

## Put the form on a page

1. Open the page under **Content → Pages**. It opens in the [visual editor](/guide/visual-editor).
2. Choose **Add a block** in the bar and pick **Form** (in the **Widgets** group).
3. On the **Block** tab, under **Form**, pick your form. The page shows it as visitors will see it.
4. Save or publish the page.

The **Form** block works wherever blocks are used: on pages and posts, and in the layouts under **Appearance → Templates**.

Changes you make to the form later show on every page that uses it as soon as you save the form.

## What visitors see after sending

The **After sending** section, on the **Form** tab, controls the end of the form:

- **Button text**: the label of the send button. The default is "Send".
- **Thank-you message**: shown in place of the form after it was sent. The default is "Thank you. We received your message."
- **Or go to a page**: a path on your site such as `/thanks`, or a full `https://` address. Visitors are taken there instead of seeing the message. A path must stay on your site: one starting with `//` or `/\` is refused.
- **When the form is closed**: the text shown in place of a closed form.

The defaults are in the site's language ([**Site → Settings**, **Language**](/guide/translating)). If you leave them as they are and later change the site's language, visitors see them in the new language. Text you wrote yourself stays as you wrote it.

### Close a form

The switch at the top of the form editor reads **Open: taking submissions**. Turn it off (**Closed**) and save to stop taking submissions, for example when a registration period ends. Visitors see the closed message instead of the form. Turn it back on to reopen it.

## Get submissions by email

1. On the **Form** tab, in the **Email** section, choose **Email each submission**.
2. In **Send to**, enter one or more addresses, separated by commas (up to 10).
3. Optionally enter a **Subject**. Left empty, it is "New submission:" followed by the form's name.
4. Under **Replies go to**, choose an email field of the form, such as **The address in Email**. Then pressing Reply in your mail program answers the visitor directly. **The site's address** sends replies to the site's own mailbox instead.
5. Save the form.

You can add up to five emails per form, for example one to the office and one, with a different subject, to a manager. **Stop this email** removes one.

Each email lists the answers in the form's order and, when submissions are kept, includes **Open it in the admin**. Attached files are not sent with the email; their names are listed with "(download them in the admin)". The email's own wording, and the subject when you leave **Subject** empty, are in the site's language.

Emails go through the mail settings under **Site → Settings → Email** and are sent in the background, a moment after the visitor sends the form. If the mail server refuses a message, Kestello tries again, up to three times. Use **Send a test email** on the **Email** tab to check your mail settings first; see [Your first hour](/guide/first-steps#email).

## Read submissions

Open **Content → Forms**. The **Received** column shows how many submissions each form has, and a badge such as "2 new". Choose the number, or **Submissions**, to open them.

The **Submissions** screen works like an inbox:

- The tabs are **Inbox** (everything except spam), **New** (not opened yet) and **Spam**.
- **Search the answers** finds submissions by what people wrote.
- Select a submission to read it on the right. Opening it marks it as read.
- **Mark as new** puts it back among the unread ones.
- **Spam** moves it to the **Spam** tab; **Not spam** moves it back.
- **Delete** removes it and its files for good.

Each submission also shows when it was sent, from which page of your site, and, under **Sent from**, the visitor's network address and browser.

### Export to a spreadsheet

**Export CSV** downloads every submission of the form as a CSV file, newest first, with one column per field. The **Sent (UTC)** column gives the time in UTC. Spam is left out. The file opens in Excel, Numbers, LibreOffice and Google Sheets with accented letters intact.

## Keeping and spam {#keeping-and-spam}

The **Keeping and spam** card controls what is stored and how much each visitor may send.

| Setting | What it does | Default |
|---|---|---|
| **Keep submissions here** | Stores each submission on the **Submissions** screen. Turn it off to only email them; then nothing is stored on the site. | On |
| **Delete after (days)** | Removes submissions, and their files, once they are older than this. 0 keeps them until you delete them. Old submissions are removed once a day. | 0 |
| **Per visitor and hour** | How many times one visitor (one network address) may send this form in an hour. More are refused. | 10 |
| **Ask for a captcha** | Shows a captcha, a small test that people pass and programs do not. It needs a captcha plugin; without one the switch is off. | Off |

A form must keep its submissions, email them, or both. Otherwise they would go nowhere, and saving stops with an error.

::: tip Personal data
Submissions often contain names, email addresses and phone numbers. If you only need them for a while, set **Delete after (days)** so they do not pile up. Deleting a form deletes all its submissions and files with it.
:::

### How spam is kept out

Even without a captcha, every form has three checks that stop most automated spam:

- **A hidden trap field.** Visitors never see it; programs that fill in every field do. A submission with it filled in is thrown away, while the program is told it succeeded.
- **A minimum fill time.** A form sent less than two seconds after the visitor started filling it in is refused. People are never that fast.
- **The per-visitor limit** above.

On top of that, forms only accept submissions sent from your own site. These checks work even when the page is served from Kestello's page cache.

<Flow :steps="submission" caption="The checks a submission passes, in order, and what happens when one fails" />

## Delete a form

At the bottom of the **Form** tab, choose **Delete this form**, then **Delete the form**. Every submission and uploaded file goes with it, and pages that showed the form show nothing in its place. This cannot be undone. To stop a form without losing its submissions, close it instead.

## If something goes wrong

These are the messages visitors may see on the form:

**"Please fill this in.", "Please tick this box.", "Please choose one." or "Please add a file."** A required field is empty.

**"That was quick. Please check the form and send it again."** The form was sent less than two seconds after the visitor started filling it in, which usually means a browser extension filled it automatically. Sending it again works.

**"The form has expired. Reload the page and send it again."** The visitor started filling in the form more than two days before sending it. It also appears when the browser could not fetch the form's security check, for example because the connection dropped. Reloading the page fixes it.

**"Too many tries from here. Please wait a while and send it again."** The visitor reached **Per visitor and hour**. Raise the limit if many people share one network, for example in an office or a school.

**"Please confirm you are not a robot."** The captcha was not solved.

**"report.pdf is larger than 5 MB."** The file is over the field's **Largest file (MB)**.

**"report.pdf doesn't look like a .pdf file."** The file's content does not match its name.

**"This form is closed."** (or your own closed message). The form is switched to **Closed**.

These are the messages you may see when saving the form:

**"Keep submissions or send them by email, or they go nowhere."** Turn on **Keep submissions here**, or add an email.

**"File uploads need submissions to be kept (Settings: keep submissions)."** The form has a **File upload** field but does not keep submissions. Turn on **Keep submissions here**.

**"No captcha service is installed. Install a plugin that provides one first."** **Ask for a captcha** is on, but no captcha plugin is active. See [Plugins](/guide/plugins).

**"jane@example is not an email address."** One of the **Send to** addresses has a typo.

**"Choose an email field of this form."** **Replies go to** points at a field that is no longer an email field. Pick another.

**"Add at least one field."** A form needs at least one field.

**"Another field is already called email."** Two fields have the same **Name**. Rename one.

**Submissions arrive, but the emails do not.** Send a test email from **Site → Settings → Email** first. If that works, open **System → Background jobs** and look for failed jobs: the error there says what the mail server answered. Also check the spam folder of the receiving mailbox.

## Related pages

- [The visual editor](/guide/visual-editor): adding blocks to a page.
- [Media](/guide/media#allowed-files-and-size-limits): which file types are allowed.
- [Plugins](/guide/plugins): adding a captcha service.
