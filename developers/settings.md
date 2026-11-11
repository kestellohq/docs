<script setup>
const tabFlow = [
    { title: 'Schema', text: '$cms->admin->settings() in boot(): fields, labels, secrets.' },
    { title: 'Settings tab', text: 'The admin draws the form under Settings and checks the values against the schema.', tone: 'brand' },
    { title: 'Stored keys', text: 'plugin.<slug>.<tab>.<field>, as strings. Secrets are sealed with the app key.' },
    { title: 'Your code reads them', text: '$this->setting() and $this->secret() add the plugin.<slug>. prefix.' },
];
</script>

# Settings

Settings are the values a site owner changes without touching code: how many notices to show, an API key for a payment provider, whether a feature is on. Kestello stores them in the database, in the `settings` table, as strings. This page covers how a plugin names, reads and writes its settings, how secrets are sealed, the settings tab in the admin, and `plugin:config` on the command line. Read it when your plugin needs a value that differs between sites.

Settings are not configuration. Values that belong to the server (database host, cache driver, debug mode) live in `config/*.php` and the environment, and are covered in [Configuration](/developers/configuration). A rule of thumb: if the site owner should change it in the admin, it is a setting.

## Names

A plugin's settings are named `plugin.<slug>.<key>`. The plugin `notices` uses `plugin.notices.display.limit`, `plugin.notices.feed.token` and so on. Themes use `theme.<slug>.<key>`.

| Part | Rule |
|---|---|
| Prefix | `plugin.<slug>.`, from the manifest. Every helper adds it for you. |
| Key | `^[a-z0-9_][a-z0-9_.-]{0,100}$` for `plugin:config`. Settings tabs use `<tab>.<field>`, with field names of lowercase letters, digits and underscores. |
| Group | Plugin settings are stored in the group `plugin.<slug>`. `plugin:config` lists that group. |

Uninstalling a plugin deletes every setting whose name starts with its prefix. Deactivating keeps them.

## Read a setting

In the provider, use the helpers. They add the prefix:

```php
public function boot(Cms $cms): void
{
    $limit = (int) $this->setting('display.limit', 1);
    $enabled = (bool) $this->setting('display.enabled', '1');
    $token = $this->secret('feed.token');
}
```

| Method | Returns |
|---|---|
| `$this->setting(string $key, mixed $default = null)` | The stored string, or `$default` when the setting does not exist or is `null`. |
| `$this->secret(string $key, string $default = '')` | The opened secret, or `$default` when it is not set or cannot be opened. |

Outside the provider (in an endpoint, a listener, a job), read through `Kestello\Framework\Settings\Settings` with the full name:

```php
use Kestello\Framework\Settings\Settings;

$limit = (int) Settings::getInstance()->get('plugin.notices.display.limit', 1);
```

Values are always strings in the database. Cast them where you read them. Settings saved from a settings tab store booleans as `'1'` and `'0'`, so `(bool)` works on them.

A good pattern is to read settings once, in a small class of your own bound in the container, so the names live in one place:

```php
// register()
$container->singleton(NoticeOptions::class, fn() => new NoticeOptions(
    limit: max(1, (int) $this->setting('display.limit', 1)),
    token: $this->secret('feed.token'),
));
```

Bindings like this are made per request. In a queue worker, which runs for many minutes, read the setting in the job instead (see "Long-running processes" below).

### All `Settings` methods

| Method | Does |
|---|---|
| `Settings::getInstance()` | The shared instance. |
| `get(string $key, mixed $default = null)` | The value, or `$default`. |
| `has(string $key): bool` | True when the setting exists and is not empty. |
| `set(string $key, ?string $value, string $group = 'general')` | Stores a value now. Pass the group `plugin.<slug>` for plugin settings. |
| `setMany(array $values, string $group = 'general')` | `set()` for each `key => value`. |
| `group(string $group): array` | Every setting of a group, read from the database. |
| `delete(string $key)` | Removes a setting. |
| `reload()` | Forgets the cached values and loads them again. |

All settings are loaded on the first `get()` in a request and cached for the rest of it. A `set()` updates the cache too.

```php
$settings = Settings::getInstance();
$settings->set('plugin.notices.display.limit', '3', 'plugin.notices');
$settings->delete('plugin.notices.display.style');
```

## Secrets

API keys, passwords and client secrets must not sit in the database in plain text, where a backup or a database dump would show them. Kestello seals them with the site's app key (`app.secret_key`, see [Configuration](/developers/configuration)) before storing them.

- A sealed value is bound to its setting name. Copying it to another key, or to another plugin's settings, does not open it.
- `$this->secret()` opens it. If the app key changed or the value was tampered with, it returns the default.
- Sealed values are never sent to the browser. The settings API sends `<field>_set: true` instead.
- They are included in backups in their sealed form. A backup restored on a site with another app key can only open them if the old key is listed under `app.previous_keys` in `config/app.php`; otherwise enter them again. The restore warns about this.

You set secrets in one of two ways: a settings tab with the field in `secrets` (below), or `plugin:config --secret`. Both store the same format, so the provider reads both with `$this->secret()`.

::: warning
Do not store secrets with `Settings::set()` yourself. The value would be stored in plain text, and `secret()` would not open it.
:::

## A settings tab in the admin

`$cms->admin->settings()` in `boot()` adds a tab under **Settings**, rendered from a schema:

```php
use Kestello\Cms\Api\Schema;

$cms->admin->settings('display', 'Notices', Schema::object([
    'enabled' => Schema::bool()->default(true),
    'limit' => Schema::int()->min(1)->max(5)->default(1),
    'token' => Schema::string()->max(200),
]), labels: ['enabled' => 'Show notices', 'limit' => 'Notices at once', 'token' => 'Feed token'],
    secrets: ['token'], description: 'How notices appear on the site.', capability: 'notices.manage');
```

Fields are stored as `plugin.<slug>.<tab>.<field>`: here `plugin.notices.display.enabled`, `plugin.notices.display.limit` and `plugin.notices.display.token`. The provider reads them as `$this->setting('display.limit', 1)` and `$this->secret('display.token')`.

<Flow :steps="tabFlow" caption="From the schema you register to the value your code reads" />

How the tab behaves:

| Topic | Behaviour |
|---|---|
| Who sees and saves it | People with `settings.manage` and the tab's `capability`. Saving also needs a recent password confirmation. |
| Validation | Values are checked against the schema. Errors show next to the fields (`422`). |
| Defaults | Shown from the schema's `default()` (or `$defaults`) until a value is saved. Kestello does not store the default; your code must use the same default when it reads. |
| Partial saves | Every field is optional when saving: only the fields sent are stored. |
| Secrets | Shown as password fields. Leaving one blank keeps the stored value. Through the API, sending `null` for it clears it. |
| Types | Booleans are stored as `'1'` and `'0'`, numbers as their decimal string. |
| After saving | Settings are reloaded, so the rest of the request sees the new values. |

The full argument list is in [Admin pages](/developers/admin-pages#settings-tabs). The tab's URL is `/admin/settings?tab=<slug>.<tab>`, which is useful for a "Configure" link on your own admin page.

## plugin:config

`plugin:config` reads and changes a plugin's settings from the command line. Use it for deploy scripts, for secrets you do not want to type into a browser, and for plugins without a settings tab.

```bash
php bin/cms plugin:config notices
```

```text
  display.enabled = 1
  display.limit = 3
  display.token = (secret, set)
```

Set one or more values, without the prefix:

```bash
php bin/cms plugin:config notices display.limit=2 display.enabled=0
```

```text
  Saved settings for notices.
  display.enabled = 0
  display.limit = 2
  display.token = (secret, set)
```

Store a secret. The value is read from standard input, so it stays out of your shell history:

```bash
printf '%s' "$NOTICES_FEED_TOKEN" | php bin/cms plugin:config notices --secret=display.token
```

Remove a setting:

```bash
php bin/cms plugin:config notices --unset=display.limit
```

| Form | Does |
|---|---|
| `plugin:config <slug>` | Lists the plugin's settings. Secrets show as `(secret, set)`. |
| `plugin:config <slug> key=value ...` | Stores each value. `key=` stores an empty string. |
| `plugin:config <slug> --secret=<key>` | Reads one line from standard input, seals it and stores it. |
| `plugin:config <slug> --unset=<key>` | Deletes the setting. |

The plugin must be installed. It does not need to be active, so you can configure a plugin before activating it.

## Long-running processes

A web request loads settings once and sees one consistent set for its whole run. Queue workers and the scheduler run longer, so Kestello reloads settings before each job and on each scheduler run. A setting changed in the admin is therefore seen by the next job, without restarting the worker.

Values you copied into an object in `register()` or `boot()` are not refreshed this way: the worker booted once. In jobs, read settings in `handle()`:

```php
public function handle(): void
{
    $days = (int) Settings::getInstance()->get('plugin.notices.cleanup.days', 30);
    // ...
}
```

## If something goes wrong

| Message | What it means |
|---|---|
| `Usage: plugin:config <installed-plugin-slug> [key=value ...] [--secret=key] [--unset=key]` | No slug, or no installed plugin with that slug. |
| `Expected key=value, got "display.limit"` | A pair without `=`, or a key with characters other than lowercase letters, digits, `_`, `.` and `-`. |
| `Invalid key.` | The key given to `--secret` has other characters. |
| `Empty value: nothing stored.` | `--secret` read an empty line. Pipe the value in. |
| `(no settings)` | The plugin has nothing stored yet. Defaults are not stored. |
| `secret()` returns the default although the setting is set | The value was sealed under another name or with another app key, or it was stored in plain text with `Settings::set()`. Store it again with `--secret` or the settings tab. |
| `The secret "token" is not a field of the schema.` | A name in `secrets` is missing from the schema of `$cms->admin->settings()`. |
| `Invalid settings field "displayLimit" (lowercase letters, digits and underscores).` | Rename the schema field. |
| `Settings tabs are for plugins; core groups live in SiteSettings.` | `$cms->admin->settings()` was called from a theme. |
| `Plugins\Notices\NoticesProvider is not attached to a package.` | `setting()` or `secret()` was called on a provider Kestello did not create. |

## Related pages

- [Admin pages](/developers/admin-pages): the settings tab and its arguments.
- [Providers](/developers/providers): the `setting()` and `secret()` helpers.
- [Configuration](/developers/configuration): server configuration and `app.secret_key`.
- [Command line](/developers/cli): every `bin/cms` command.
