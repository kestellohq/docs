# Translating Kestello

This page is for people who want to translate the Kestello admin, emails and messages into their language, and for site owners who want to try a translation. You need a free program for translation files, such as [Poedit](https://poedit.net/), and a GitHub account to send the translation in. You do not need to read code.

## Choose the language of your site

Open **Site → Settings**, and under **General** choose a **Language**, then save. The list shows English and every language that comes with your version of Kestello. The admin, the emails Kestello sends and the text of your theme switch to it. Numbers, dates and plurals follow the language too.

Languages written right to left, such as Arabic or Hebrew, turn the admin around as well.

## How translations work

Every sentence Kestello shows is written in English in its code. A translation pairs each English sentence with yours. Kestello looks up a sentence in this order, and uses the first one it finds:

1. the language and region, such as Serbian in Latin script for Serbia (`sr_Latn_RS`),
2. the language, such as Serbian (`sr`),
3. the English sentence.

So a translation for a region only needs the sentences that differ from the main language.

The list of every sentence lives in a template file, `core/resources/lang/kestello.pot` in the [Kestello repository](https://github.com/kestellohq/cms). Translation programs read it and save your work as a `.po` file named after the language, such as `sr.po` or `pt_BR.po`.

## Translate

1. Download `kestello.pot` from [core/resources/lang](https://github.com/kestellohq/cms/tree/develop/core/resources/lang). If a `.po` file for your language is already there, download that instead and continue it.
2. In Poedit, choose **Create new translation** and open `kestello.pot` (or open the existing `.po` file). Choose your language when asked.
3. Translate each sentence. The notes next to a sentence say where it appears.
4. Save the file as `<language>.po`, for example `sr.po`.

Some sentences have parts in curly brackets. Keep them exactly as they are, and move them where your language needs them:

- `{name}` and other single words in brackets are replaced by a value. *Hello, {name}* can become *Zdravo, {name}*.
- `{count, plural, one {# entry} other {# entries}}` changes with a number. Translate only the words inside the inner brackets, and add the forms your language has, such as `one`, `few`, `many` and `other`. The `#` is replaced by the number.

The template has a note at the top that says the same.

## Try it on a site

On a test site, copy your `.po` file into `core/resources/lang/`, then choose the language under **Site → Settings**. Each page of the admin loads the new sentences.

::: warning
Files you add to `core/` are replaced by the next Kestello update. Send the translation in (below) so it ships with Kestello.
:::

## Send it in

1. On the [Kestello repository](https://github.com/kestellohq/cms), add your file to `core/resources/lang/` with **Add file → Upload files**. GitHub makes a copy of the repository for you when you do.
2. Describe the change as `feat(i18n): Serbian translation`, and choose **Propose changes**, then **Create pull request**.
3. A maintainer checks the file and merges it into the next release.

New Kestello versions add sentences. After a release, open your `.po` file in Poedit, choose **Translation → Update from POT file**, translate what is new, and send the file in again.

## Translating a plugin or theme

Plugins and themes have their own templates, named after them, such as `resources/lang/acme-shop.pot` in the plugin's folder. Translate them the same way and send the file to whoever publishes the plugin.

## If something goes wrong

**My language is not in the list.** The list only shows languages with a file in `core/resources/lang/`. Check the file name: it must be a language code, such as `sr.po`, not `serbian.po`.

**Some sentences stay in English.** They have no translation yet, or the English sentence changed in a newer version. Update the file from the template as described above.

**A sentence shows curly brackets on the page.** A bracket part was changed or removed. Compare it with the English sentence and keep the parts in brackets exactly as they are.

## Next

- [Translations for developers](/developers/translations): making text translatable in plugins and themes.
- [Contributing to Kestello](https://github.com/kestellohq/cms/blob/develop/CONTRIBUTING.md).
