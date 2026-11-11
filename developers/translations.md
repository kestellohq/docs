<script setup>
const journey = [
    { title: 'Write', text: '__() in PHP and Vue, in English, with your slug as the domain.' },
    { title: 'i18n:extract', text: 'Collects every sentence into resources/lang/<slug>.pot.' },
    { title: 'Translate', text: 'A translator turns the template into sr.po, sr.json or sr.php in resources/lang/.', tone: 'brand' },
    { title: 'Loaded', text: 'Kestello reads the pack for the site’s language, for PHP and for the browser.' },
];
const lookup = [
    { title: 'The site’s language and region', text: 'sr_Latn_RS', tone: 'brand' },
    { title: 'The language', text: 'sr' },
    { title: 'The fallback language', text: 'app.fallback_locale, en by default' },
    { title: 'The English text', text: 'The sentence as written in __().', tone: 'muted' },
];
</script>

# Translations

This page shows how to make the text of a plugin or theme translatable, and how its translations are found. Read it before you write text people will see: labels, messages, emails and admin pages.

Kestello's own text works the same way. Its template is `core/resources/lang/kestello.pot`; translators use [Translating Kestello](/guide/translating).

From the sentence you write to the text a visitor reads:

<Flow :steps="journey" caption="How a sentence gets translated" />

## Write translatable text

Wrap every sentence people see in `__()`, written in English, with your plugin's slug as the domain.

In PHP:

```php
use function Kestello\__;
use function Kestello\trans_choice;

__('Your order was placed.', domain: 'acme-shop');
__('Hello, {name}.', ['name' => $user->username], 'acme-shop');
trans_choice('{count, plural, one {# item} other {# items}} in your cart.', $count, domain: 'acme-shop');
```

In a Vue page or component:

```vue
<script setup>
import { useI18n } from '@kestello/sdk';

const { __ } = useI18n('acme-shop');
</script>

<template>
    <KCard :title="__('Orders')" :description="__('{n, plural, one {# order} other {# orders}} today.', { n: count })" />
</template>
```

Rules that keep text translatable:

- **Whole sentences.** Never build a sentence from pieces: word order differs between languages.
- **Named placeholders.** `{name}`, not `%s`. Translators move them where their language needs them.
- **ICU plurals** for anything counted: `{n, plural, one {# order} other {# orders}}`. Languages have up to six plural forms, and the translation adds the ones it needs.
- **No HTML in the text** when you can avoid it. Put the markup around the sentence.

::: warning
Vue ends a text interpolation at the first pair of closing braces, so an ICU plural written inside one breaks the template. Use the message in a bound attribute, as above, or in a `computed`.
:::

### Text Kestello translates for you

Labels you give to Kestello are looked up in your domain first, then in core's, so you don't wrap them:

- field and block labels, help text and descriptions (`->label()`, `->help()`, `->description()`),
- admin menu items, pages, widgets and columns you register,
- the `title`, `description` and enum labels in your settings schema.

## The translation template

The template lists every translatable sentence, with the file it comes from. Write it into your plugin's `resources/lang/` folder:

```bash
php bin/cms i18n:extract acme-shop
```

```text
  /var/www/site/content/plugins/acme-shop/resources/lang/acme-shop.pot (42 messages)
```

The slug form needs an installed site. In a plugin's own repository, name the folder and domain instead:

```bash
php bin/cms i18n:extract --path=. --domain=acme-shop
```

`--check` writes nothing and fails when the template is out of date, which is useful in CI. Commit the template, and send it to your translators.

## Language packs

Translations live in the plugin's or theme's `resources/lang/` folder, one file per language, named with the locale. Any of these formats works:

| File | Format |
|---|---|
| `sr.po` | A gettext catalogue, as translation programs save it. |
| `sr.json` | `{"Your order was placed.": "Vaša porudžbina je primljena."}` |
| `sr.php` | A PHP file that returns the same pairs as an array: `return ['Your order was placed.' => 'Vaša porudžbina je primljena.'];` |

When a folder holds more than one format for a language, `.po` wins over `.json`, and `.json` over `.php`.

A sentence is looked up for the site's language and region (`sr_Latn_RS`), then the language (`sr`), then the fallback language (`app.fallback_locale`, `en` by default), then the English text.

<Layers :layers="lookup" caption="Where a translation is looked up: the first layer that has the sentence wins" />

The browser gets the same translations, so one pack covers PHP and Vue: admin pages load every domain's, and site pages load the active plugins' and theme's before they are drawn (and before server-side rendering, so both show the same text). Core's own site blocks, such as the form, bring their text already translated.

## If something goes wrong

**The text stays in English.** Check the domain: `__('Orders')` without a domain looks in core's translations, not yours. Then check the file name is a locale (`sr.json`, not `serbian.json`) and that the key matches the English text exactly, including punctuation.

**"Finding "acme-shop" needs an installed site. Use --path=&lt;its folder&gt; --domain=acme-shop instead."** You ran `i18n:extract acme-shop` in a checkout that was never installed. Use the `--path` form.

**A sentence is missing from the template.** The extractor finds `__()`, `trans_choice()` and the label methods above, written with a plain string. A sentence built at runtime (`__($text)`) can't be found; write the string where it is used.

## Next

- [Editor setup](/developers/editor-setup): completion for Kestello's classes in your editor.
- [Admin pages](/developers/admin-pages).
