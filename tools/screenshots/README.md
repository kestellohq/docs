# Screenshots

The pictures in the docs (`public/screenshots/`) are taken by these scripts from a real
Kestello, so they show the admin as it is. Take them again after a release changes a screen.

They need Node 20.6 or newer, PHP 8.4 with `pdo_sqlite` and `gd`, and Playwright's Chromium
(`npx playwright install chromium` once).

## 1. The installer pictures

Unzip a release (`kestello-<version>.zip` from GitHub) into an empty folder, start it and run
the installer through as a website:

```bash
cd /path/to/empty/kestello && php bin/cms serve --port=8091
KESTELLO_DOCS_URL=http://127.0.0.1:8091 KESTELLO_DOCS_ROOT=/path/to/empty/kestello npm run screenshots:install
```

That saves the five installer pictures (`install-1` to `install-4`, and `install-6`). The site's administrator gets a random password nobody
needs again: delete the folder when you are done.

## 2. The sample site

Unzip the release again into another folder. This one becomes the sample bakery site that
every other picture shows:

```bash
cd /path/to/sample/kestello
PHP_CLI_SERVER_WORKERS=4 php bin/cms serve --port=8090    # leave it running
php bin/cms schedule:work                                   # in a second terminal, also running

# in the docs folder
npm run screenshots:install -- --demo
curl -s -o /dev/null http://127.0.0.1:8090/                 # the first visit adds the sample content
node tools/screenshots/prepare.mjs /path/to/sample/kestello # a contributor and a post in review
```

Then set `'demo' => false` in the site's `config/app.php`, so the pictures have no demo bar,
and follow [Build your first plugin](../../developers/plugin-tutorial.md) on this site to add the
Notices plugin (its admin page and the Plugins screen show it), with one notice.
The sample site's administrator is `demo` with the password `demo`.

## 3. Take the pictures

```bash
KESTELLO_DOCS_ROOT=/path/to/sample/kestello npm run screenshots              # all of them
KESTELLO_DOCS_ROOT=/path/to/sample/kestello npm run screenshots -- editor    # names containing "editor"
```

`KESTELLO_DOCS_ROOT` is the site's folder: wherever a screen shows it (the cron command, for
example) the picture shows `/home/example/kestello` instead, and the computer's name shows as
`web-1`. Then look at the pictures you changed before committing them.

Empty date fields show the date format of your computer's region (on macOS, Chromium takes
it from the system settings, not from the page's language). Readers see their own format in
the admin anyway, so this is left as it is.

## Adding a picture

1. Add an entry to `SHOTS` in `shots.mjs`: a name and how to open the screen. Admin screens
   take `target: () => 'content'`, which leaves out the menu and the empty space below.
   `mark()` draws numbered markers, for pictures the text explains part by part.
2. Run `npm run screenshots -- <name>` and look at the result.
3. Use it in a page with alt text that says what it shows (`npm run style` checks both):
   `![The Menus screen: theme locations at the top, the menu's items below.](/screenshots/menus.png)`
