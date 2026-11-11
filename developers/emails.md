---
title: Emails
description: Register a named email that site owners can preview and reword, send it in the reader's language, change any email with filters and events, and lay out emails in a theme.
---

<script setup>
const pipeline = [
    { title: 'build', text: 'Your closure makes a MailMessage from the values you pass.' },
    { title: 'The owner’s edit', text: 'Site → Emails, in the reader’s language.', tone: 'brand' },
    { title: 'mail.message', text: 'Filter: change the blocks.' },
    { title: 'MailSending', text: 'Event: change it, or stop it.', note: 'cancel() stops the email here.' },
    { title: 'mail.branding', text: 'Filter: logo, colours, footer.' },
    { title: 'Layout', text: 'HTML and plain text, light and dark.' },
    { title: 'Transport', text: 'Your closure hands it to the mail server.' },
    { title: 'MailSent', text: 'Event: the server accepted it.', tone: 'muted' },
];
const look = [
    { title: 'mail.branding', text: 'A filter, per email or per address.', tone: 'brand' },
    { title: 'Site → Settings → Emails', text: 'The logo and the footer line.' },
    { title: 'The theme’s styles.json', text: 'The email roles map tokens to colours and the font.', items: ['page', 'card', 'ink', 'muted', 'line', 'accent', 'accent-ink', 'font'] },
    { title: 'MailBrand defaults', text: 'Readable colours when nothing else is set.', tone: 'muted' },
];
</script>

# Emails

Every email Kestello sends has a name, such as `auth.password_reset`. A named email is listed under **Site → Emails**, where the site owner previews it with sample values and changes its words, per language. This page shows how to register your plugin's emails so they get the same treatment, how to send them, and how to change any email, yours or core's, with filters and events, and how a theme lays emails out. For what the site owner sees, see the [Emails guide](/guide/emails).

## How an email is sent

Sending a named email runs the same steps every time, in this order:

<Flow :steps="pipeline" caption="From your values to the mail server" />

A preview in the admin runs the first three steps with the email's sample values and stops before the event. The owner's edit is applied only if it still fits the email: a saved edit that no longer does (because your email lost a block it relied on) is logged and left out, so the email still goes.

## Build a message

`MailMessage` builds an email from blocks, in the order you add them. One layout turns them into the HTML part and the plain-text part. Every block's text is escaped, so you never write HTML.

```php
use Kestello\Cms\Notifications\MailMessage;

$message = MailMessage::make('Your order is on its way')
    ->heading('Your order is on its way')
    ->paragraph('It left our workshop today.')
    ->rows(['Order' => '1042', 'Carrier' => 'Post'])
    ->button('Track it', 'https://example.com/track/1042')->name('link')
    ->note('Questions? Reply to this email.');
```

| Method | Draws |
| --- | --- |
| `heading(string $text)` | A heading. |
| `paragraph(string $text)` | A paragraph. |
| `button(string $label, string $url)` | A button. The address must be a whole `http` or `https` address. |
| `rows(array $rows)` | Labels and values in a table, such as a form's answers. |
| `code(string $text)` | A code to type, such as a sign-in code. |
| `note(string $text)` | Small print. |
| `image(string $url, string $alt, int $width, int $height)` | An image at a whole address. Wide images are drawn at the card's width, in proportion. |
| `divider()` | A line between sections. |
| `name(string $key)` | Names the block added last, so an edit can keep it and you can lock it. |

`greeting()`, `line()` and `action()` are the older names for `heading()`, `paragraph()` and `button()`, and keep working.

## Register a named email

Register your emails in your provider's `boot()`. The id starts with your plugin's slug and a dot:

```php
use Kestello\Cms\Cms;
use Kestello\Cms\Notifications\MailMessage;

public function boot(Cms $cms): void
{
    $cms->emails->register(
        'acme-shop.order_shipped',
        label: 'Order shipped',
        description: 'Sent to the customer when their order leaves the workshop.',
        group: 'Shop',
        build: fn (array $d): MailMessage => MailMessage::make("Order {$d['order']} is on its way")
            ->heading("Hello {$d['name']},")
            ->paragraph('Your order left our workshop today.')
            ->button('Track it', $d['url'])->name('link'),
        sample: ['name' => 'Ana', 'order' => '1042', 'url' => 'https://example.com/track/1042'],
        locked: ['link'],
    );
}
```

| Argument | Meaning |
| --- | --- |
| `$id` | A lowercase group, a dot and a name. A plugin's ids start with its slug: `acme-shop.order_shipped`. Another package can't register the same id. |
| `label`, `description` | What **Site → Emails** shows. Pass them by name, so `bin/cms i18n:extract` finds them for translators. |
| `group` | The card it is listed under, such as `Shop`. Default `Other`. |
| `build` | Gets the values you send with and returns the `MailMessage`. It runs in the reader's language, so `__()` inside it translates. |
| `sample` | Values for the preview, with the same keys you send with. Text and numbers become the values an owner can write as `{name}`. |
| `locked` | Names of blocks the email doesn't work without, such as its link. Every message `build` makes must contain them. Owners can reword and move them, never remove them. |

The owner's edit works with your email's blocks:

- A **named block** is kept as your code builds it each time, so the link in a locked button is always the one you made for that reader. The owner can change its words.
- **Unnamed text, headings, buttons and dividers** become blocks the owner can reword, move or remove.
- **Unnamed rows, codes and images** can't be written as an edit. Name them to keep them in an edited email.
- An email built with `html()` writes its own HTML, so it can't be edited block by block. It is listed, and can be previewed.

## Send it

`send()` builds the email in the reader's language, runs every step above and hands the result to a transport: a closure that delivers one message and says whether the server accepted it.

```php
use Kestello\Framework\Mail\Mailer;

$transport = static fn (string $to, string $subject, string $html, string $text): bool =>
    (new Mailer())->send($to, $subject, $html, [], $text);

$sent = $cms->emails->send('acme-shop.order_shipped', 'ana@example.com', [
    'name' => 'Ana',
    'order' => '1042',
    'url' => 'https://example.com/track/1042',
], $transport);
```

`Mailer` sends through the server the owner set under **Site → Settings → Email**. `send()` returns `true` when the server took the email or a listener stopped it on purpose, and `false` only when sending failed. Send from a [background job](/developers/jobs) on the `mail` queue, so a slow mail server doesn't slow the page.

The reader's language is, in order: the `$locale` argument when you pass one, the language of the account with that address, or the current language (the page's, else the site's). Pass `$locale` when you know it better, for example from an order placed on a page in that language.

## Change any email

### Add or change blocks

The filter `mail.message` gets each named email after the owner's edit, for sending and for previews. Its locked blocks must stay.

```php
use Kestello\Cms\Notifications\MailMessage;

$cms->filters->add('mail.message', function (MailMessage $message, string $id, string $to, array $data): MailMessage {
    return $id === 'forms.submission'
        ? $message->note('Answer within one working day.')
        : $message;
});
```

`$to` is empty for a preview.

### Stop an email

The event `MailSending` comes before each email goes, named emails and notifications alike. A listener can change `$event->message` or stop it. The sender is told it was stopped, not that it failed.

```php
use Kestello\Cms\Events\MailSending;

$cms->events->on(MailSending::class, function (MailSending $event): void {
    $test = str_ends_with($event->to, '@example.test');
    if ($event->id === 'forms.submission' && $test) {
        $event->cancel('Test addresses get no form emails.');
    }
});
```

`MailSent` follows once the server accepted an email, with `id`, `to` and `subject`. Use it to keep your own record.

### Change the look

The look of an email comes in layers. The top one wins:

<Layers :layers="look" caption="Where an email’s logo, colours and font come from" />

A theme maps its tokens to the email's colour roles in `styles.json`. Each role names a token, or a colour such as `#111827`. `dark` maps the same roles for mail apps in dark mode:

```json
{
    "email": {
        "page": "wall",
        "card": "enamel-white",
        "ink": "wall-ink",
        "muted": "wall-ink-2",
        "line": "wall-rule",
        "accent": "plate",
        "accent-ink": "enamel-white",
        "font": "font",
        "dark": { "page": "#0f1115", "card": "#1a1d23", "ink": "#f3f4f6" }
    }
}
```

A role your theme leaves out keeps the default. A pair that would be hard to read, such as light text on a light card, falls back to readable defaults. An unknown role is skipped and logged:

```text
[kestello] acme/styles.json: email.headline is ignored (roles: page, card, ink, muted, line, accent, accent-ink, font; a token name or a #colour).
```

For one email or one address, the filter `mail.branding` gets the `MailBrand` with the email's id (or `notification.<type>`) and the address:

```php
use Kestello\Cms\Mail\MailBrand;

$cms->filters->add('mail.branding', function (MailBrand $brand, string $id, string $to): MailBrand {
    // the site's own logo, colours and footer, with the shop's name
    return str_starts_with($id, 'acme-shop.') ? MailBrand::site('Acme Shop') : $brand;
});
```

`MailBrand::site()` is the site's look as it is now, with the name you give. `new MailBrand(...)` starts from the default colours instead, for an email that should look like nothing else on the site.

## Lay out emails in a theme

The colour roles above change Kestello's layout. To change the layout itself, a theme brings its own markup in an `emails/` folder:

| File | Lays out |
| --- | --- |
| `emails/layout.html` | Every email the site sends. |
| `emails/<email id>.html`, such as `emails/auth.password_reset.html` | One email, in place of the layout. |

For each email, Kestello takes the email's own file, else the layout, looking in the active theme first and then in its parents. With neither, the email uses Kestello's layout. The files wrap the same rendered blocks, so an owner's edit under **Site → Emails**, the filters and the events all still apply. The theme's markup is used for named emails and notifications, in the preview and in **Send me a test** as well.

The Base theme ships `content/themes/base/emails/layout.html`. Copy it into your theme as the place to start.

::: v-pre

### Placeholders

A file is HTML with placeholders. `{{ … }}` is escaped; `{!! … !!}` is written as it is, and only for what Kestello builds itself:

| Placeholder | What it holds |
| --- | --- |
| `{{ subject }}` | The subject, for the `<title>`. |
| `{{ lang }}`, `{{ dir }}` | The reader's language (`es`) and direction (`ltr` or `rtl`), for `<html>`. |
| `{{ site.name }}` | The site's name, or the name `mail.branding` gave. |
| `{{ brand.page }}`, `{{ brand.card }}`, `{{ brand.ink }}`, `{{ brand.muted }}`, `{{ brand.line }}`, `{{ brand.accent }}`, `{{ brand.accentInk }}` | The colours, after `styles.json` and `mail.branding`, already checked for contrast. |
| `{{ brand.font }}` | The font stack. |
| `{!! blocks !!}` | Every block of the email, rendered, with the written-out link after the first button. A layout must have it. |
| `{!! block.<name> !!}` | One named block, such as `{!! block.link !!}`. Only in an email's own file. |
| `{!! logo !!}` | The logo's `<img>`, or nothing when the email has no logo. |
| `{!! footer !!}` | The footer line from **Site → Settings → Emails**, its lines joined with `<br>`. |
| `{!! dark_css !!}` | The CSS that repaints the email for dark mode. Put it in a `<style>` in the `<head>`. |

A small layout:

```html
<!doctype html>
<html lang="{{ lang }}" dir="{{ dir }}">
    <head>
        <meta charset="utf-8" />
        <meta name="color-scheme" content="light dark" />
        <title>{{ subject }}</title>
        <style>{!! dark_css !!}</style>
    </head>
    <body class="k-page" style="margin: 0; background: {{ brand.page }}">
        <table class="k-page" role="presentation" width="100%" style="background: {{ brand.page }}">
            <tr>
                <td align="center" style="padding: 24px 12px">
                    <table role="presentation" width="100%" style="max-width: 560px">
                        <tr>
                            <td class="k-card" style="padding: 32px; background: {{ brand.card }}; color: {{ brand.ink }}; font-family: {{ brand.font }}">
                                {!! logo !!} {!! blocks !!}
                            </td>
                        </tr>
                        <tr>
                            <td class="k-muted" style="padding-top: 16px; color: {{ brand.muted }}; font-size: 12px; text-align: center">
                                {{ site.name }}<br />{!! footer !!}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
</html>
```

Mail apps ignore most CSS, so lay out with tables and inline styles, as above. For dark mode, give elements the classes the dark CSS repaints: `k-page` (the background), `k-card`, `k-ink`, `k-muted`, `k-btn` (accent colour on accent ink), `k-row` and `k-code`.

An email's own file can place its blocks one by one, with your markup between them. It must still show the blocks the email is locked to, one by one or all together with `{!! blocks !!}`:

```html
<!-- emails/auth.password_reset.html, inside the same page markup as the layout -->
<h1 style="color: {{ brand.ink }}">{{ site.name }}</h1>
{!! block.link !!}
```

The names an email has are the ones its code gives with `name()`. **Site → Emails** shows which blocks are locked.

### What is checked

Kestello checks the files when the theme is activated, when `php bin/cms plugin:check <slug> --theme` checks it, and again before each email. A file is refused when it has:

- scripts, forms, frames or objects (`<iframe>`, `<object>`, `<embed>`), a `<base>` tag or `<meta http-equiv>`, event handlers such as `onclick=`, or `javascript:` links;
- a placeholder that doesn't exist, or a `{{ }}` and `{!! !!}` the wrong way round;
- no `{!! blocks !!}`, in a layout;
- not every locked block, in an email's own file;
- more than 200 KB.

A theme with a file that fails can't be activated. The error names each file and problem:

```text
Cannot activate theme "acme":
  - emails/layout.html: it has scripts (<script>), which emails cannot carry
  - emails/layout.html: a layout must place the email with {!! blocks !!}
```

A file that changes after activation and then fails is not used. The email still goes, in Kestello's layout, and the reason is logged:

```text
[kestello] /var/www/site/content/themes/acme/emails/layout.html is not used for this email (it has forms (<form>), which emails cannot carry); Kestello's own layout is.
```

A file for an email no installed package registers is checked as far as it can be and kept: it is used once the plugin that sends that email is installed.

:::

## Notifications by email

A notification with the `mail` channel builds its own message in `toMail()`, so it has no sample values and isn't listed under **Site → Emails**, and `mail.message` doesn't see it. It joins the steps above at `MailSending`, with the id `notification.<type>`: listeners can change or stop it, `mail.branding` applies, and it gets the same layout. Name who may receive a notification type with `capability:`, so people who can't act on it don't see it in their settings:

```php
$cms->notifications->type(StockLow::class, 'Stock running low', capability: 'acme-shop.manage');
```

## The REST API

The admin's screens use these endpoints. Each needs the `emails.manage` capability and, with an API token, the `settings:write` scope.

| Method and path | What it does |
| --- | --- |
| `GET /api/v1/emails` | Every email, by group, with the languages each is edited in, and the site's languages. |
| `GET /api/v1/emails/{id}?locale=sr` | One email: its sample built as the code writes it, the edit to start from, the saved edit, its values and locked blocks. |
| `PUT /api/v1/emails/{id}` | Save an edit (`subject`, `blocks`, `locale`). It is checked against the email first. |
| `DELETE /api/v1/emails/{id}?locale=sr` | Remove the edit in one language. |
| `POST /api/v1/emails/{id}/preview` | Build a draft or the saved edit with sample values: `subject`, `html` and `text`. |
| `POST /api/v1/emails/{id}/test` | Send a draft to your own address, with "[Test]" before the subject. |

The full schemas are in the API explorer under **System → API**, and in the [REST API](/developers/rest-api) page.

## If something goes wrong

- **`An email id is a lowercase group and name, such as "shop.order_shipped", got "Shop.Shipped".`** Use lowercase letters, digits, `_` and `-`, with a dot between the group and the name.
- **`The email "acme-shop.order_shipped" is already registered by …`** Another package registered that id. Start your ids with your own slug.
- **`The email "acme-shop.order_shipped" must have a block named "link" (it is locked), and this one has none.`** Every message your `build` returns, and every `mail.message` filter, must keep the blocks in `locked`. If one is only there sometimes, don't lock it.
- **An email came out in Kestello's layout although your theme has one.** The theme's file failed its check; the log names the file and the problem. Run `php bin/cms plugin:check <slug> --theme` to see every problem at once.
- **An owner's edit stopped applying.** Your email changed so that the saved edit no longer fits, for example a block it kept lost its name. The email goes out as your code writes it, and the reason is logged. Keep block names stable between versions.

## Next

- [Events and filters](/developers/events): listening and filtering in general.
- [Background jobs](/developers/jobs): sending from the queue.
- [Themes](/developers/themes): the tokens your email roles point to, and the theme's folders.
