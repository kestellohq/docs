# Admin pages

The admin is a Vue app that only talks to the REST API. A plugin adds to it from PHP, in its provider: whole pages with menu entries, dashboard widgets, panels on core screens, columns in the People table, settings tabs, and replacements for a few core components. The screens themselves are Vue single-file components built with the admin UI kit. This page covers every registration method of `$cms->admin`, how a page component receives its data, the components in `@kestello/ui`, and building. Read it when your plugin needs a screen.

The [`hello` example plugin](https://github.com/kestellohq/examples/tree/main/plugins/hello) uses a page, a dashboard widget, a People column, a Person panel and a settings tab. The [Plugin tutorial](/developers/plugin-tutorial) builds a complete page step by step.

## How an admin page works

1. In `boot()`, you register a page: a path, a Vue component, a title and a capability.
2. Kestello adds a server route for it. Plugin pages live at `/admin/p/<slug>/<path>`.
3. When someone opens the page, the server checks that they are signed in, hold `admin.access` and hold the page's capability. If not, they are sent to `/login` or get the 403 page. The page's JavaScript is never sent to someone who cannot open it.
4. The server renders the component with three props: `title`, `params` (the values of `{placeholders}` in the path) and `admin` (the menu, extensions and capabilities of the current person).
5. The component loads its data from `/api/v1`, with the person's session.

So the page's data is protected by the API endpoint's own capability and scopes, not by the page. See [Permissions](/developers/permissions).

## Register a page

```php
$cms->admin->page(string $path, string $component, string $title, string $capability = 'admin.access', ?array $menu = null): string
```

| Argument | Meaning |
|---|---|
| `$path` | Relative to `/admin/p/<slug>/`. `''` is the plugin's home page. Segments are lowercase letters, digits, `_` and `-`, and later segments may be placeholders such as `{id}`. |
| `$component` | The Vue component. Must start with `@<slug>/`. `@notices/admin/Notices` is `resources/js/pages/admin/Notices.vue`. |
| `$title` | The browser title and the default menu label. |
| `$capability` | What a person needs on top of `admin.access`. |
| `$menu` | `null` for no menu entry, or `['label' => ..., 'icon' => ..., 'group' => ..., 'order' => ...]`. |

It returns the page URL.

```php
// /admin/p/acme-events, in the Plugins group
$cms->admin->page('', '@acme-events/admin/Events', 'Events', 'acme-events.manage',
    ['label' => 'Events', 'icon' => 'calendar-event', 'group' => 'plugins', 'order' => 10]);

// /admin/p/acme-events/edit/123, no menu entry
$cms->admin->page('edit/{id}', '@acme-events/admin/EventEdit', 'Edit event', 'acme-events.manage');

// /admin/p/acme-events/reports/sales
$cms->admin->page('reports/sales', '@acme-events/admin/SalesReport', 'Sales', 'acme-events.reports',
    ['label' => 'Sales', 'icon' => 'graph-up', 'group' => 'plugins']);
```

The menu entry's id is `<slug>.<path with dots>`, or `<slug>.home` for `''`. A page with a placeholder cannot have a menu entry. Put the component of every admin page under `resources/js/pages/admin/`, so it wears the admin styles.

## Menu groups and links

The menu is a list of groups. Core defines:

| Group id | Label | Order |
|---|---|---|
| `main` | (none: the top of the menu) | 0 |
| `content` | Content | 10 |
| `people` | People | 20 |
| `appearance` | Appearance | 30 |
| `plugins` | Plugins | 80 |
| `system` | System | 90 |

A plugin's entries go to `plugins` unless you name another group. A plugin with several screens can add its own group:

```php
$cms->admin->group('events', 'Events', order: 40);
$cms->admin->page('', '@acme-events/admin/Events', 'Events', 'acme-events.manage', ['label' => 'All events', 'icon' => 'calendar-event', 'group' => 'events']);
$cms->admin->link('acme-events.help', 'Help', 'https://docs.acme.test/events', icon: 'question-circle', group: 'events', order: 90);
```

```php
$cms->admin->group(string $id, string $label, int $order = 50): void
$cms->admin->link(string $id, string $label, string $href, string $icon = 'circle', string $group = 'plugins', int $order = 50, string $capability = 'admin.access', ?string $match = null): void
```

- Group ids are 1 to 50 lowercase letters, digits, `_` and `-`.
- Link ids must start with `<slug>.`. The `href` must be a site path (`/...`) or an `https://` URL. `$match` is the path prefix that marks the entry as current (default: the `href`).
- Within a group, entries sort by `order`, then label. Groups with nothing the person may open are hidden.

### Icons

Icons are [Phosphor](https://phosphoricons.com/) names in the regular weight, without the `ph-` prefix: `megaphone`, `calendar-blank`, `chart-line-up`, `puzzle-piece`. Names are 1 to 40 lowercase letters, digits and dashes. Core uses, for example, `squares-four`, `users`, `shield-check`, `images`, `gear`, `heartbeat`, `archive` and `plug`. Kestello ships the whole set, so any name on phosphoricons.com works. The same names work in `<KIcon name="...">` and the `icon` prop of `KButton`.

## Dashboard widgets

```php
$cms->admin->widget(string $area, string $component, string $title, string $size = 'half', string $capability = 'admin.access', int $order = 50): void
```

```php
$cms->admin->widget('dashboard', '@acme-events/admin/UpcomingWidget', title: 'Upcoming events', size: 'quarter', capability: 'acme-events.manage');
```

The only area is `dashboard`. Sizes are `quarter`, `half` and `full`. The admin draws the titled card; your component is the body and receives a `context` prop.

## Panels on core screens (slots)

```php
$cms->admin->slot(string $point, string $component, string $capability = 'admin.access', array $when = [], int $order = 50, ?string $label = null): void
```

| Point | Where | `context` |
|---|---|---|
| `users.edit.panels` | The Person screen, below the details | `{ user }` |
| `profile.tabs` | **Your profile**, as extra tabs. `$label` is required. | `{ user }` |

```php
$cms->admin->slot('users.edit.panels', '@acme-events/admin/PersonTickets', capability: 'acme-events.manage');
$cms->admin->slot('profile.tabs', '@acme-events/admin/MyTickets', label: 'My tickets');
```

`$when` shows the component only when a field of `context` has one of the given values: `['role' => ['editor', 'author']]` checks `context.role`.

## Columns in core lists

```php
$cms->admin->column(string $list, string $key, string $label, ?string $component = null, string $capability = 'admin.access', int $order = 50, string $align = 'start', array $when = []): void
```

There are two lists: `users.list` (the People table) and `entries.list` (the list of entries on every content type's screen). Without a component, the cell shows `row[$key]` as text, so add the field to the users resource first:

```php
$cms->api->extend('users')->field('acme_tickets', fn(array $row) => Tickets::countFor((int) $row['id']), read: 'acme-events.manage');
$cms->admin->column('users.list', 'acme_tickets', label: 'Tickets', capability: 'acme-events.manage', align: 'end');
```

A cell component receives `row` and `value`. Column keys are lowercase letters, digits and underscores, and two plugins cannot add the same key.

On `entries.list`, name the content types the column belongs to with `when`; without it, the column shows on every content type. The field goes on the `entries` resource, and the resolver receives the entry as `$row['model']`:

```php
$cms->api->extend('entries')->field('acme_seats', function (array $row): ?int {
    $entry = $row['model'];
    return $entry->type === 'acme-event' ? Seats::left((int) $entry->getKey()) : null;
}, read: 'acme-events.manage');

$cms->admin->column('entries.list', 'acme_seats', label: 'Seats left', capability: 'acme-events.manage', align: 'end', when: ['type' => 'acme-event']);
```

## Replace a core component

```php
$cms->admin->replace('editor.richtext', '@acme-editor/admin/RichText');
```

Replaceable components: `users.avatar`, `media.picker`, `editor.richtext`, `editor.code`, `auth.login-form`. The replacement receives the same props and must emit the same events. The original is passed as the `core` prop, so the replacement can wrap it. Two plugins cannot replace the same component.

## Settings tabs

A plugin's settings get a tab under **Settings**. Give a schema and the admin renders the form:

```php
use Kestello\Cms\Api\Schema;

$cms->admin->settings('display', 'Notices', Schema::object([
    'enabled' => Schema::bool()->default(true)->description('Show notices at the top of every page.'),
    'limit' => Schema::int()->min(1)->max(5)->default(1),
    'style' => Schema::enum(['bar' => 'A bar across the top', 'card' => 'A card under the header'])->default('bar'),
    'feed_token' => Schema::string()->max(200)->description('Stored encrypted; never shown again.'),
]), labels: ['enabled' => 'Show notices', 'limit' => 'Notices at once', 'style' => 'Style', 'feed_token' => 'Feed token'],
    secrets: ['feed_token'], description: 'How notices appear on the site.', capability: 'notices.manage');
```

```php
$cms->admin->settings(
    string $id,
    string $label,
    ?Schema $schema = null,
    array $labels = [],
    array $secrets = [],
    array $defaults = [],
    string $description = '',
    string $capability = 'settings.manage',
    ?string $component = null,
    int $order = 50,
): void
```

| Argument | Meaning |
|---|---|
| `$id` | The tab id within your plugin. The tab is `<slug>.<id>`, opened at `/admin/settings?tab=<slug>.<id>`. |
| `$schema` | An object schema. Supported field types: strings, integers, numbers, booleans and enums. Field names are lowercase letters, digits and underscores. |
| `$labels` | Field labels. Without one, the field name is shown. |
| `$secrets` | Fields that are sealed with the app key when saved and never sent back to the browser. |
| `$defaults` | Values shown until the field is saved. They take precedence over the schema's `default()`. |
| `$capability` | Needed to see and save the tab, on top of `settings.manage`. |
| `$component` | A component (`@<slug>/admin/...`) that renders the tab instead of the generated form. |

Values are stored as `plugin.<slug>.<id>.<field>`. Read them in the provider with `$this->setting('<id>.<field>')` and secrets with `$this->secret('<id>.<field>')`. See [Settings](/developers/settings). Only plugins can add settings tabs; a theme cannot.

## Write the page component

A page component is an ordinary Vue SFC with `layout: 'Admin'`:

```vue
<script setup>
import { computed } from 'vue';
import { useResource, __ } from '@kestello/sdk';
import { KAlert, KButton, KCard, KKeyValue, KPageHeader, KSpinner } from '@kestello/ui';

defineOptions({ layout: 'Admin' });

const props = defineProps({ title: String, params: { type: Object, default: () => ({}) } });
const event = useResource(() => `/acme-events/events/${props.params.id}`);
const facts = computed(() => (event.data.value ? { [__('Starts')]: event.data.value.starts_at, [__('Venue')]: event.data.value.venue ?? '' } : {}));
</script>

<template>
    <KPageHeader :title="event.data.value?.title ?? title" />
    <KAlert v-if="event.error.value" tone="danger">{{ event.error.value.message }}</KAlert>
    <KSpinner v-else-if="event.loading.value" />
    <KCard v-else-if="event.data.value" :title="__('Details')">
        <KKeyValue :items="facts" />
        <KButton href="/admin/p/acme-events" icon="arrow-left">{{ __('All events') }}</KButton>
    </KCard>
</template>
```

What the page can import:

| From | What |
|---|---|
| `vue` | Vue 3 itself. |
| `@kestello/app` | `Head` (set the title), `Link` (navigation without a reload), `usePage()` (props of the current page, including `csrfToken`), `useRouter()`, `useForm()`. |
| `@kestello/sdk` | `useApi()`, `useResource()`, `ApiError`, `notify`, `confirm()`, `useLeaveGuard()`, `useCan()`, `useAdmin()`, `useUser()`, `__()`, `formatDateTime()`, `formatRelative()`, `formatBytes()`, `formatNumber()`, `uploadMedia()`. |
| `@kestello/ui` | The UI kit, below. |

The main SDK functions:

| Function | Use |
|---|---|
| `useApi()` | An API client bound to the page's CSRF token: `api.get(path, query)`, `api.post(path, body)`, `api.put`, `api.patch`, `api.delete(path)`, `api.upload(path, formData)`, `api.download(path, filename)`. Paths are relative to `/api/v1`. Returns the parsed JSON, or `null` for `204`. |
| `useResource(path, { query, poll })` | Loads a path and keeps `data`, `meta`, `error` and `loading` refs. `{"data": ...}` is unwrapped into `data`. `reload({ silent: true })` reloads without the spinner. `path` and `query` may be functions or refs, and then reload when they change. |
| `ApiError` | Thrown for every failed call: `status`, `code` (`validation`, `forbidden`...), `detail`, `errors`, and `fieldErrors()` for `{ field: 'first message' }`. |
| `notify.success(msg)`, `.info`, `.warning`, `.error` | A toast. `notify.error(e)` takes an `Error` and shows its message. |
| `confirm({ title, message, confirmLabel, danger })` | A dialog. Resolves to `true` or `false`. |
| `useLeaveGuard(dirty)` | While `dirty` (a ref, computed or function) is true, leaving the page asks first: a link, the menu or Back shows a dialog, and a reload or a closed tab gets the browser's own question. Call it once in `setup`; it is removed when the page unmounts. To go on after the work is gone (it was deleted), visit with `router.visit(url, { discardUnsaved: true })`. |
| `useCan()` | `can('acme-events.manage')`, from the capabilities sent with the page. Cosmetic only. |
| `__('Hello {name}', { name })` | A translatable string with placeholders. |

When an endpoint answers `reauth_required`, the client asks for the password and retries. When it answers `unauthenticated`, it goes to `/login`.

Write every user-facing string through `__()`.

## The UI kit

`@kestello/ui` exports accessible components themed for the admin, in light and dark. The ones you will use on most pages:

| Component | Props and use |
|---|---|
| `KPageHeader` | `title`, `description`. The page heading; also sets the browser title. Slot for actions. |
| `KCard` | `title`, `description`, `flush` (no padding, for tables), `coord`. Slots: default, `title`, `actions`. |
| `KTable` | `columns` (`[{ key, label, align, width }]`), `rows`, `rowKey` (`id`), `loading`, `empty` (a short title, such as "No events yet"), `emptyText` (what to do next, under it), `caption`. Customise a cell with `<template #cell-<key>="{ row, value }">`. |
| `KField` | `label`, `help`, `error`, `required`, `id`. Wraps one input; its slot gives `id`, `describedBy` and `invalid` to pass to the input. |
| `KInput` | `v-model`, `type`, `invalid`. Other attributes go to the `<input>`. |
| `KSelect` | `v-model`, `options` (`[{ value, label, disabled }]`), `invalid`. |
| `KSwitch` | `v-model` (boolean), `label`, `disabled`, `hideLabel`. |
| `KButton` | `variant` (`primary`, `secondary`, `danger`, `ghost`), `size` (`sm`, `md`), `type`, `href` (renders a link), `icon`, `loading`, `disabled`, `block`. |
| `KAlert` | `tone` (`info`, `success`, `warning`, `danger`), `title`, `dismissible`. |
| `KBadge` | `tone` (`neutral`, `success`, `warning`, `danger`, `info`, `accent`), `dot`. |
| `KStatusBadge` | `status`: `good`, `ok`, `done`, `sent`, `running`, `skipped`, `disabled`, `recommended`, `failed`, `critical`. |
| `KStat` | `label`, `value`, `hint`, `icon`, `tone`. A number with a label. |
| `KKeyValue` | `items`: `{ label: value }` as a definition list. |
| `KTime` | `value`: unix seconds or an ISO 8601 string. Shows a relative time with the full date on hover. |
| `KEmpty` | `title`, `icon`. An empty state. |
| `KSpinner` | `label`, `size`. |
| `KIcon` | `name` (a Phosphor icon name), `label` (for icons that carry meaning). |
| `KModal` | `v-model:open`, `title`, `size`, `dismissible`. Traps focus while open. |
| `KTabs` | `v-model` (the active id), `tabs` (`[{ id, label, count }]`), `label`. Arrow keys move between tabs. |
| `KSchemaForm` | `v-model`, `schema` (an OpenAPI object schema, as endpoints describe them), `errors`, `secrets`, `secretsSet`, `locked`, `labels`. Renders a form for strings, numbers, booleans and enums. |

Components for content and media, used by core screens and available to plugins: `KPicker` (pick records from a search), `KMediaPicker` and `KMediaGrid` (the media library), `KUploadZone` (drop files to upload), `KRichText` (the rich-text editor), `KContentField` (one content field of any type), `KTermSelect` (taxonomy terms), `KAvatar`. `KSlot` and `KExtension` render other plugins' extensions, and `KDialogs` and `KToasts` are mounted by the admin layout.

The examples use a few layout classes from the admin stylesheet: `k-cells` with `--k-cols: 3` for a grid of cards, `k-span-2` for a card two columns wide, `k-form` for a stacked form, `k-muted`, `k-small` and `k-link`.

## Build

Admin components are compiled with Vite on your machine. The output in `assets/build/` ships with the plugin, so servers never need Node.js.

```bash
npm run build content/plugins/acme-events
```

Run it from the repository root after every change to a `.vue` file. Without a `vite.config.js` in the plugin, Kestello's preset is used. With one, build it on the preset:

```js
import { defineConfig } from 'vite';
import { kestello } from '../../../core/build/preset.mjs';

export default defineConfig(kestello({ root: import.meta.dirname }));
```

The relative path to `core/build/preset.mjs` depends on where the plugin folder is. `make:plugin --admin` writes the right one. `vue` and the `@kestello/*` modules are never bundled: every package uses the one copy the site serves, through an import map. `plugin:check` reports Vue sources that were not built.

## If something goes wrong

| Message | What it means |
|---|---|
| `Admin pages of plugin:acme-events must use components named "@acme-events/…".` | The component name does not start with your slug. |
| `Components of plugin:acme-events are named "@acme-events/admin/…" (got "@acme-events/Widget").` | Widgets, slots, cells, settings components and replacements must live under `pages/admin/`. |
| `Invalid admin page path "Events".` | Paths are lowercase. Placeholders cannot be the first segment. |
| `The admin page /admin/p/acme-events is already registered.` | Two `page()` calls with the same path. |
| `Pages with parameters cannot be menu entries.` | Drop `$menu` from a page whose path has `{...}`. |
| `Unknown admin menu group "events".` | Call `$cms->admin->group('events', ...)` first. |
| `Invalid icon name "Calendar".` | Icon names are lowercase letters, digits and dashes, up to 40 characters. |
| The menu entry shows an empty space instead of an icon. | The name is not a Phosphor icon, or it starts with `ph-`. Look the name up on phosphoricons.com and leave out the prefix. |
| `Admin menu ids of plugin:acme-events must start with "acme-events.".` | A `link()` id outside your namespace. |
| `Admin menu links must be site paths or https URLs.` | Use `/...` or `https://...`. |
| `Widget size must be one of: quarter, half, full.` | Another size was given. |
| `Unknown slots point "users.list.panels". Known: users.edit.panels, profile.tabs.` | Use one of the listed points. |
| `Profile tabs need a label.` | Pass `label:` for `profile.tabs`. |
| `The column "acme_tickets" of users.list is already added by plugin:other.` | Pick another key. |
| `"users.list" is not replaceable. Replaceable: users.avatar, media.picker, editor.richtext, editor.code, auth.login-form.` | Only the listed components can be replaced. |
| `Settings tabs are for plugins; core groups live in SiteSettings.` | `settings()` was called from a theme or core. |
| `The secret "api_key" is not a field of the schema.` | Every name in `$secrets` must be a schema field. |
| `A settings tab needs a schema or a component.` | Pass one of them. |
| The page opens with the 403 page | The person lacks `admin.access` or the page's capability. |
| A widget shows a failure message instead of its content | The component failed to load or threw while rendering. The admin contains it and names the plugin. Check that the build is current. |

## Related pages

- [Plugin tutorial](/developers/plugin-tutorial): an admin page built step by step.
- [Permissions](/developers/permissions): capabilities for pages and extensions.
- [Settings](/developers/settings): reading what a settings tab stores.
- [REST API](/developers/rest-api): the endpoints your pages call.
- [Frontend](/developers/frontend): Vue on the public site.
