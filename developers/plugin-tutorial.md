# Build your first plugin

This page walks through a small plugin from an empty folder to an active, checked package: a **Notices** plugin that keeps short messages in its own table, lets editors manage them on an admin screen, exposes them through the REST API, has a settings tab, and hands the current notices to every page so the theme can show them. Follow it when you write your first plugin, or come back to it when you need a working example of one of the pieces. It assumes you have read [Architecture](/developers/architecture) and have a site running as described in [Local development](/developers/local-development).

Every file on this page was copied out of it and run against Kestello 0.1.0-rc.2 on SQLite: the migration, the model, the endpoints, the settings tab and the shared page data work as shown, and the outputs are the real ones.

## What you will build

| Piece | Where | Reference |
|---|---|---|
| Manifest | `plugin.json` | [Manifest](/developers/manifest) |
| Provider | `src/NoticesProvider.php` | [Providers](/developers/providers) |
| Table `p_notices_notices` | `database/migrations/` | [Migrations](/developers/migrations) |
| Model | `src/Models/Notice.php` | [Migrations](/developers/migrations) |
| Capability and token scopes | the provider | [Permissions](/developers/permissions) |
| Three API endpoints | `src/Api/` | [REST API](/developers/rest-api) |
| Admin page | `resources/js/pages/admin/Notices.vue` | [Admin pages](/developers/admin-pages) |
| Settings tab | the provider | [Settings](/developers/settings) |

The commands on this page are written as `php bin/cms ...`. In the Docker development setup, put `docker exec cms_app` in front of each one (see [Local development](/developers/local-development#running-commands)).

## Create the plugin

1. Scaffold the folder:

   ```bash
   php bin/cms make:plugin notices --name="Notices"
   ```

   ```text
     Created content/plugins/notices
     Activate it: php bin/cms plugin:activate notices
   ```

   The slug (`notices`) must be lowercase letters, digits and single dashes. It becomes the folder name, the PHP namespace (`Plugins\Notices\`), the table prefix (`p_notices_`), the settings prefix (`plugin.notices.`) and the prefix of every capability, scope, API path and admin URL the plugin owns.

2. Look at what was created:

   ```text
   content/plugins/notices/
   ├── plugin.json
   ├── src/NoticesProvider.php
   ├── database/migrations/.gitkeep
   ├── resources/views/.gitkeep
   └── assets/.gitkeep
   ```

   `resources/views/` is not used by anything in Kestello 0.1 (Vue is the only templating layer). You can delete it.

::: tip
`make:plugin notices --admin` scaffolds a working admin side instead of the empty provider: a capability, a token scope, a `GET /api/v1/notices/summary` endpoint, an admin page, a dashboard widget, a settings tab and a `vite.config.js`. This tutorial builds the same pieces by hand so you see each one. `--namespace=Acme\\Notices` picks a namespace other than `Plugins\Notices`.
:::

## The manifest

`make:plugin` wrote this `plugin.json`. Fill in the description, which the **Plugins** screen shows:

```json
{
    "slug": "notices",
    "name": "Notices",
    "version": "0.1.0",
    "description": "Short messages shown at the top of every page, managed under Plugins → Notices.",
    "requires": {
        "core": "^0.1",
        "php": ">=8.4"
    },
    "namespace": "Plugins\\Notices\\",
    "provider": "Plugins\\Notices\\NoticesProvider",
    "permissions": {}
}
```

`requires.core` is generated from the running version. Before 1.0, minors may break, so the scaffold pins the minor (`^0.1` accepts 0.1.x and refuses 0.2.0). The plugin makes no outgoing HTTP requests and adds no sign-in method, so `permissions` stays empty. Every key is described in [Manifest](/developers/manifest).

## The table

1. Generate a migration:

   ```bash
   php bin/cms make:migration create_notices_table --plugin=notices
   ```

   ```text
     Created: content/plugins/notices/database/migrations/2026_11_05_120000_create_notices_table.php
   ```

   The timestamp in the file name is the current time. Files run in name order. Because the name matches `create_<name>_table`, the generator already put in a `create('p_notices_notices', ...)` with the required prefix.

2. Replace the file's contents:

   ```php
   <?php

   declare(strict_types=1);

   use Kestello\Framework\Database\Blueprint;
   use Kestello\Framework\Database\Migration;

   return new class extends Migration
   {
       public function up(): void
       {
           $this->schema()->create('p_notices_notices', function (Blueprint $table): void {
               $table->id();
               $table->string('message', 500);
               $table->enum('tone', ['info', 'warning'])->default('info');
               $table->datetime('starts_at')->nullable();
               $table->datetime('ends_at')->nullable();
               $table->timestamps();
               $table->index('starts_at', 'ends_at');
           });
       }

       public function down(): void
       {
           $this->schema()->dropIfExists('p_notices_notices');
       }
   };
   ```

The migration runs when the plugin is activated. `down()` runs when the plugin is uninstalled. Inside a plugin migration, `Schema` refuses any table that does not start with `p_notices_`, so a typo cannot touch core tables. See [Migrations](/developers/migrations) for column types and the rules.

## The model

1. Generate it:

   ```bash
   php bin/cms make:model Notice --plugin=notices
   ```

   ```text
     Created: content/plugins/notices/src/Models/Notice.php
   ```

2. Replace the file's contents:

   ```php
   <?php

   declare(strict_types=1);

   namespace Plugins\Notices\Models;

   use Kestello\Framework\Database\Model;
   use Kestello\Framework\Database\Orm\ModelQuery;

   final class Notice extends Model
   {
       protected string $table = 'p_notices_notices';

       /** Columns create()/fill() may set; anything else throws. */
       protected array $fillable = ['message', 'tone', 'starts_at', 'ends_at'];

       protected array $casts = ['starts_at' => 'datetime', 'ends_at' => 'datetime'];

       /** Notices that are showing now: Notice::query()->current()->get(). */
       protected function scopeCurrent(ModelQuery $query): void
       {
           $now = gmdate('Y-m-d H:i:s');
           $query->where(fn($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
               ->where(fn($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', $now));
       }
   }
   ```

`created_at` and `updated_at` are filled in by the model (in UTC). The `datetime` cast turns the stored text into a `DateTimeImmutable` in UTC and accepts ISO 8601 strings on the way in. Mass assignment only sets the columns in `$fillable`: `Notice::create(['id' => 5])` throws `[id] is not fillable on Plugins\Notices\Models\Notice. Add it to $fillable, or set it explicitly.`

## The API

The admin screen will only talk to these endpoints, so anything it does a script with a token can do as well. Each endpoint is one class that declares its route, who may call it and the shape of its input. Kestello does the routing, validation, authorisation, rate limiting and error format.

### Who may call an endpoint: capabilities and scopes

Every endpoint names two things, and they answer different questions:

| | A **capability** | A **scope** |
|---|---|---|
| Answers | What may this *person* do? | What may this *token* be used for? |
| Example | `notices.manage`: manage site notices | `notices:read`: read them, `notices:write`: add and delete them |
| Given by | Their role. Site owners change it on **People → Roles**. | Whoever creates the token, when they create it. |
| Checked for | Everyone: the browser session and tokens. | Tokens only. A signed-in person in the admin passes every scope. |

A token never has more power than the person it belongs to. It acts as its owner, so a request with a token passes only when the owner has the capability **and** the token has every scope the endpoint lists. That way a token you hand to a script that only reads notices (`notices:read`) cannot delete them, even though you could.

Here is what happens to a request, in order:

1. No session and no token: `401` with the problem type `unauthenticated`.
2. The person (or the token's owner) lacks the capability: `403`, `forbidden`.
3. A token without one of the scopes: `403`, `insufficient_scope`, with the missing ones under `required_scopes`.
4. Too many requests from this person in the time window: `429`.
5. The query and body are checked against the schemas: `422`, `validation`, with each problem, when they do not match.
6. `handle()` runs.

Two rules keep plugins safe by default. An endpoint must name a capability and at least one scope, or say `isPublic()`: Kestello refuses to register one that does neither ("declares neither a capability nor isPublic(): refused (deny by default)"). And a plugin's names start with its slug: capabilities with `notices.`, scopes with `notices:`.

You declare both names in the provider, further down this page:

```php
$cms->auth->roles->capability('notices.manage', 'Manage site notices', grantTo: ['editor']);
$cms->api->scope('notices:read', 'Read site notices');
$cms->api->scope('notices:write', 'Add and delete site notices');
```

The endpoints below only refer to them. The [Permissions](/developers/permissions) page covers roles and capabilities in depth.

### The parts of an endpoint

Each endpoint is a class with short methods. Most are one line:

| Method | What it says | In this tutorial |
|---|---|---|
| `route()` | The method and path, under `/api/v1`. A plugin's paths start with its slug. | `ApiRoute::get('/notices/notices')` |
| `capability()` | The capability a person needs. | `'notices.manage'` |
| `scopes()` | The scopes a token needs, all of them. | `['notices:read']` to list, `['notices:write']` to change |
| `body()` | The shape of the JSON body, as a `Schema`. Unknown keys are refused. | the new notice's fields |
| `resource()` | The class that decides which fields of a row are sent back. | `NoticeResource` |
| `rateLimit()` | At most this many requests in this many seconds, per person (their tokens share the count). Without it, Kestello's default limits for reading and writing apply. | `[30, 60]` on create |
| `summary()`, `tags()` | The name and group in the API explorer under **System → API**, and in the OpenAPI document. | `'List notices'`, `['notices']` |
| `handle()` | The work. It runs only after every check above passed. | the query |

### Write the endpoints

1. Create `src/Api/NoticeResource.php`. A resource decides which fields leave the server, so a column you add later stays private until you list it here:

   ```php
   <?php

   declare(strict_types=1);

   namespace Plugins\Notices\Api;

   use Kestello\Cms\Api\Resource;
   use Kestello\Contracts\Auth\Principal;

   /** What the API shows of a notice. A new column stays private until it is added here. */
   final class NoticeResource extends Resource
   {
       public const string NAME = 'notices';

       protected function fields(Principal $principal): array
       {
           return [
               'id' => (int) $this->row['id'],
               'message' => (string) $this->row['message'],
               'tone' => (string) $this->row['tone'],
               'starts_at' => self::date($this->row['starts_at'] ?? null),
               'ends_at' => self::date($this->row['ends_at'] ?? null),
               'created_at' => self::date($this->row['created_at'] ?? null),
           ];
       }
   }
   ```

   `NAME` lets other plugins add fields to it with `$cms->api->extend('notices')`. `self::date()` writes ISO 8601 in UTC (`2026-11-05T09:00:00Z`).

2. Create `src/Api/ListNotices.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace Plugins\Notices\Api;

   use Kestello\Cms\Api\ApiRequest;
   use Kestello\Cms\Api\ApiRoute;
   use Kestello\Cms\Api\Endpoint;
   use Plugins\Notices\Models\Notice;

   /** GET /api/v1/notices/notices: the newest 100 notices. */
   final class ListNotices extends Endpoint
   {
       public function route(): ApiRoute { return ApiRoute::get('/notices/notices'); }
       public function capability(): ?string { return 'notices.manage'; }
       public function scopes(): array { return ['notices:read']; }
       public function resource(): ?string { return NoticeResource::class; }
       public function summary(): string { return 'List notices'; }
       public function tags(): array { return ['notices']; }

       public function handle(ApiRequest $request): mixed
       {
           $notices = Notice::query()->latest('id')->limit(100)->get();

           return NoticeResource::collection(array_map(static fn(Notice $n): array => $n->toArray(), $notices->all()));
       }
   }
   ```

3. Create `src/Api/CreateNotice.php`. The body schema rejects unknown keys, so a client cannot set columns you did not list:

   ```php
   <?php

   declare(strict_types=1);

   namespace Plugins\Notices\Api;

   use Kestello\Cms\Api\ApiRequest;
   use Kestello\Cms\Api\ApiRoute;
   use Kestello\Cms\Api\Endpoint;
   use Kestello\Cms\Api\Schema;
   use Kestello\Framework\Core\Response;
   use Plugins\Notices\Models\Notice;

   /** POST /api/v1/notices/notices {message, tone, starts_at, ends_at}. */
   final class CreateNotice extends Endpoint
   {
       public function route(): ApiRoute { return ApiRoute::post('/notices/notices'); }
       public function capability(): ?string { return 'notices.manage'; }
       public function scopes(): array { return ['notices:write']; }
       public function rateLimit(): ?array { return [30, 60]; }
       public function resource(): ?string { return NoticeResource::class; }
       public function summary(): string { return 'Add a notice'; }
       public function tags(): array { return ['notices']; }

       public function body(): ?Schema
       {
           return Schema::object([
               'message' => Schema::string()->min(1)->max(500),
               'tone' => Schema::enum(['info', 'warning'])->default('info'),
               'starts_at' => Schema::string()->format('date-time')->nullable()->optional(),
               'ends_at' => Schema::string()->format('date-time')->nullable()->optional(),
           ]);
       }

       public function handle(ApiRequest $request): mixed
       {
           $notice = Notice::create([
               'message' => (string) $request->input('message'),
               'tone' => (string) $request->input('tone', 'info'),
               'starts_at' => $request->input('starts_at'),
               'ends_at' => $request->input('ends_at'),
           ]);

           return Response::json(['data' => (new NoticeResource($notice->toArray()))->resolve($request->principal)], 201);
       }
   }
   ```

4. Create `src/Api/DeleteNotice.php`:

   ```php
   <?php

   declare(strict_types=1);

   namespace Plugins\Notices\Api;

   use Kestello\Cms\Api\ApiProblem;
   use Kestello\Cms\Api\ApiRequest;
   use Kestello\Cms\Api\ApiRoute;
   use Kestello\Cms\Api\Endpoint;
   use Plugins\Notices\Models\Notice;

   /** DELETE /api/v1/notices/notices/{id}. */
   final class DeleteNotice extends Endpoint
   {
       public function route(): ApiRoute { return ApiRoute::delete('/notices/notices/{id}')->where('id', '\d+'); }
       public function capability(): ?string { return 'notices.manage'; }
       public function scopes(): array { return ['notices:write']; }
       public function summary(): string { return 'Delete a notice'; }
       public function tags(): array { return ['notices']; }

       public function handle(ApiRequest $request): mixed
       {
           $notice = Notice::find($request->intParam('id')) ?? throw ApiProblem::notFound('No such notice.');
           $notice->delete();

           return null;
       }
   }
   ```

   Returning `null` sends `204 No Content`. Returning a resource sends `{"data": {...}}`, a collection sends `{"data": [...], "meta": {}}`.

Plugin endpoints must live under `/<slug>/`, so these paths start with `/notices/`. The full addresses are `/api/v1/notices/notices` and `/api/v1/notices/notices/{id}`. The [REST API](/developers/rest-api) page covers endpoints in depth.

## The provider

The provider is where the plugin tells Kestello what it adds. Replace `src/NoticesProvider.php`:

```php
<?php

declare(strict_types=1);

namespace Plugins\Notices;

use Kestello\Cms\Api\Schema;
use Kestello\Cms\Cms;
use Kestello\Cms\Extension\PluginProvider;
use Plugins\Notices\Models\Notice;

final class NoticesProvider extends PluginProvider
{
    public function boot(Cms $cms): void
    {
        // Who may manage notices. Administrators hold every capability already.
        $cms->auth->roles->capability('notices.manage', 'Manage site notices', grantTo: ['editor']);

        // Token scopes, then the endpoints that use them.
        $cms->api->scope('notices:read', 'Read site notices');
        $cms->api->scope('notices:write', 'Add and delete site notices');
        $cms->api->endpoint(Api\ListNotices::class);
        $cms->api->endpoint(Api\CreateNotice::class);
        $cms->api->endpoint(Api\DeleteNotice::class);

        // The admin screen, at /admin/p/notices, with an entry in the Plugins menu group.
        $cms->admin->page('', '@notices/admin/Notices', 'Notices', 'notices.manage', ['label' => 'Notices', 'icon' => 'megaphone', 'group' => 'plugins']);

        // Settings → Notices, stored as plugin.notices.display.enabled and plugin.notices.display.limit.
        $cms->admin->settings('display', 'Notices', Schema::object([
            'enabled' => Schema::bool()->default(true)->description('Show notices at the top of every page.'),
            'limit' => Schema::int()->min(1)->max(5)->default(1)->description('How many notices to show at once.'),
        ]), labels: ['enabled' => 'Show notices', 'limit' => 'Notices at once'], capability: 'notices.manage');

        // Every page gets usePage().props.notices.
        $cms->pages->share('notices', function (): array {
            if (!filter_var($this->setting('display.enabled', true), FILTER_VALIDATE_BOOLEAN)) {
                return [];
            }
            $notices = Notice::query()->current()->latest('id')->limit((int) $this->setting('display.limit', 1))->get();

            return array_map(static fn(Notice $n): array => ['id' => (int) $n->id, 'message' => (string) $n->message, 'tone' => (string) $n->tone], $notices->all());
        });
    }
}
```

What each part does:

- **Capability.** `notices.manage` is declared and granted to the core `editor` role. Administrators hold `*`, which covers it. Site owners can grant or revoke it on the **Roles** screen. See [Who may call an endpoint](#who-may-call-an-endpoint-capabilities-and-scopes).
- **Scopes.** The names tokens can be given, with the description shown when someone creates a token. A token with the `admin` scope passes every scope check.
- **Admin page.** An empty path gives `/admin/p/notices`. The component name must start with `@notices/`, and resolves to `resources/js/pages/admin/Notices.vue`. A person needs `admin.access` and `notices.manage` to open it.
- **Settings tab.** The admin renders the form from the schema. Values are stored as `plugin.notices.display.<field>`, and the provider reads them back with `$this->setting('display.<field>')`. Saving the tab needs `settings.manage` as well as `notices.manage`, so by default administrators change it and editors do not.
- **Shared page data.** The closure runs once per page render, as the plugin, and its result reaches the browser as `usePage().props.notices`. Never share secrets this way.

Nothing in `boot()` reads the session or the current user. Providers boot before the session starts; see [Providers](/developers/providers#what-not-to-do-in-boot).

## The admin page

Create `resources/js/pages/admin/Notices.vue`:

```vue
<script setup>
import { reactive, ref } from 'vue';
import { ApiError, confirm, notify, useApi, useResource, __ } from '@kestello/sdk';
import { KButton, KCard, KField, KInput, KPageHeader, KSelect, KTable, KTime } from '@kestello/ui';

defineOptions({ layout: 'Admin' });

/** /admin/p/notices. Every read and write goes through /api/v1/notices/notices. */
const api = useApi();
const notices = useResource('/notices/notices');
const form = reactive({ message: '', tone: 'info', starts: '', ends: '' });
const errors = ref({});
const saving = ref(false);

const tones = [{ value: 'info', label: __('Information') }, { value: 'warning', label: __('Warning') }];
const toIso = (local) => (local ? new Date(local).toISOString() : null);

async function add() {
    saving.value = true;
    errors.value = {};
    try {
        await api.post('/notices/notices', {
            message: form.message.trim(),
            tone: form.tone,
            starts_at: toIso(form.starts),
            ends_at: toIso(form.ends),
        });
        notify.success(__('Notice added.'));
        Object.assign(form, { message: '', tone: 'info', starts: '', ends: '' });
        await notices.reload({ silent: true });
    } catch (e) {
        if (e instanceof ApiError && e.status === 422) errors.value = e.fieldErrors();
        else notify.error(e);
    } finally {
        saving.value = false;
    }
}

async function remove(row) {
    if (!(await confirm({ title: __('Delete this notice?'), message: row.message, confirmLabel: __('Delete'), danger: true }))) return;
    try {
        await api.delete(`/notices/notices/${row.id}`);
        await notices.reload({ silent: true });
    } catch (e) {
        notify.error(e);
    }
}
</script>

<template>
    <KPageHeader :title="__('Notices')" :description="__('Short messages shown at the top of every page.')" />

    <div class="k-cells" style="--k-cols: 3">
        <KCard coord="A1" class="k-span-2" :title="__('All notices')" flush>
            <KTable :columns="[{ key: 'message', label: __('Message') }, { key: 'ends_at', label: __('Ends'), align: 'end' }, { key: 'actions', label: '', align: 'end' }]"
                :rows="notices.data.value ?? []" :loading="notices.loading.value" :empty="__('No notices yet.')">
                <template #cell-ends_at="{ row }"><KTime v-if="row.ends_at" :value="row.ends_at" /><span v-else class="k-muted">{{ __('Never') }}</span></template>
                <template #cell-actions="{ row }"><KButton size="sm" variant="ghost" icon="trash" @click="remove(row)">{{ __('Delete') }}</KButton></template>
            </KTable>
        </KCard>

        <KCard coord="C1" :title="__('New notice')">
            <form class="k-form" @submit.prevent="add">
                <KField v-slot="{ id, describedBy, invalid }" :label="__('Message')" :error="errors.message" required>
                    <KInput :id="id" v-model="form.message" maxlength="500" :invalid="invalid" :aria-describedby="describedBy" />
                </KField>
                <KField v-slot="{ id }" :label="__('Tone')">
                    <KSelect :id="id" v-model="form.tone" :options="tones" />
                </KField>
                <KField v-slot="{ id, invalid }" :label="__('Starts')" :help="__('Leave empty to start now.')" :error="errors.starts_at">
                    <KInput :id="id" v-model="form.starts" type="datetime-local" :invalid="invalid" />
                </KField>
                <KField v-slot="{ id, invalid }" :label="__('Ends')" :help="__('Leave empty to keep it up.')" :error="errors.ends_at">
                    <KInput :id="id" v-model="form.ends" type="datetime-local" :invalid="invalid" />
                </KField>
                <div><KButton type="submit" variant="primary" icon="megaphone" :disabled="!form.message.trim()" :loading="saving">{{ __('Add notice') }}</KButton></div>
            </form>
        </KCard>
    </div>
</template>
```

`useResource()` unwraps `{"data": ...}` into `notices.data`. `ApiError.fieldErrors()` maps a 422 response to `{ field: 'first message' }`. If the API asks for recent authentication, the admin layout prompts for the password and retries the request. The components are described in [Admin pages](/developers/admin-pages#the-ui-kit).

## Build the Vue files

Servers never run Node.js, so you build the components on your machine and ship the output.

1. From the root of the Kestello repository you set up in [Local development](/developers/local-development) (the folder with `package.json`), build the plugin:

   ```bash
   npm run build content/plugins/notices
   ```

   This is the same as `node core/build/build.mjs content/plugins/notices`. You should see:

   ```text
   ✓ content/plugins/notices: 1 entries → content/plugins/notices/assets/build
   ```

2. Rebuild after every change to a `.vue` file, then reload the page.

::: tip Building for a site installed from a zip
A site installed from a release zip has no build tools: it has no `package.json`, so `npm run build` there answers `Could not read package.json`. Build in the Kestello repository (it needs Node 22.12 or newer and `npm install` once), giving the plugin folder's full path, then copy the plugin, `assets/build/` included, to the site.
:::

The plugin has no `vite.config.js`, so the build uses Kestello's preset. Add one (start from the one in the [`hello` example](https://github.com/kestellohq/examples/tree/main/plugins/hello)) only if you need to change the Vite settings. `vue` and `@kestello/app`, `@kestello/sdk`, `@kestello/ui` are not bundled into your output: every package shares the one copy the site serves.

## Check the code

Run the static checker before you activate the plugin, and again before you package it:

```bash
php bin/cms plugin:check notices
```

```text
  No issues found.
```

It refuses `eval()`, shell functions, backticks, a namespace outside the one in the manifest, PHP files in `assets/` and Vue sources that were not built. It warns about `unserialize()`, `curl_init()` and `curl_exec()`, direct `$_GET` and `$_POST` and dynamic `include`. `package:build` runs the same check and refuses to build a package with errors.

## Activate it

1. Activate the plugin:

   ```bash
   php bin/cms plugin:activate notices
   ```

   ```text
     Activated Notices 0.1.0
   ```

   Activation runs the plugin's migrations, then `register()` and `boot()` once as a test, then the `activate()` hook. A plugin that fails to boot is refused here instead of breaking the next request. You can also activate it in the admin under **Plugins → Manage plugins**.

2. Open `/admin/p/notices`. The **Notices** entry is in the **Plugins** group of the menu. Add a notice.

   ![The Notices admin page from this tutorial, with the form to add a notice and the list of notices.](/screenshots/tutorial-notices.png)

3. Open **Settings** and the **Notices** tab (`/admin/settings?tab=notices.display`) to change how many notices show.

4. Try the API with a token. Create one for your user that may read and write notices. It is shown once:

   ```bash
   php bin/cms token:create admin --name="notices test" --scopes=notices:read,notices:write --days=1
   ```

   ```text
     Token "notices test" created for admin (expires 2026-11-10)

     <token>

     Shown once. Use: Authorization: Bearer <token>
   ```

5. Add a notice. A body sent as JSON needs the `Content-Type` header:

   ```bash
   curl -X POST https://your-site.test/api/v1/notices/notices \
     -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
     -d '{"message": "Closed on 24 December. Fresh bread again from the 27th.", "tone": "warning"}'
   ```

   The answer is `201 Created` with the notice as `NoticeResource` shows it:

   ```json
   {
       "data": {
           "id": 1,
           "message": "Closed on 24 December. Fresh bread again from the 27th.",
           "tone": "warning",
           "starts_at": null,
           "ends_at": null,
           "created_at": "2026-11-09T12:38:51Z"
       }
   }
   ```

6. List them:

   ```bash
   curl -H "Authorization: Bearer <token>" https://your-site.test/api/v1/notices/notices
   ```

   ```json
   {
       "data": [
           {
               "id": 1,
               "message": "Closed on 24 December. Fresh bread again from the 27th.",
               "tone": "warning",
               "starts_at": null,
               "ends_at": null,
               "created_at": "2026-11-09T12:38:51Z"
           }
       ],
       "meta": {}
   }
   ```

7. See the checks from [Who may call an endpoint](#who-may-call-an-endpoint-capabilities-and-scopes) refuse a request. Without a token, the answer is `401`:

   ```json
   {
       "type": "urn:kestello:problem:unauthenticated",
       "title": "Unauthenticated",
       "status": 401,
       "detail": "Authentication is required."
   }
   ```

   With a token that lacks `notices:read`, for example one made with `--scopes=content:read`, the answer is `403` and names the scope it needs:

   ```json
   {
       "type": "urn:kestello:problem:insufficient_scope",
       "title": "Insufficient scope",
       "status": 403,
       "detail": "The token lacks a required scope.",
       "required_scopes": [
           "notices:read"
       ]
   }
   ```

   Kestello 0.1.0-rc.2 and earlier send this answer with the status line `401` (the body says `403`). Check `status` in the body, which is right in every version.

   A body with a key the schema does not list, such as `{"id": 5, "message": "Hi"}`, is refused with `422` and `{"id": ["Unknown field."]}` under `errors`.

## Show the notices on the site

Every page now has `props.notices`. A theme decides where they go. In a theme layout or page component:

```vue
<script setup>
import { usePage } from '@kestello/app';

const page = usePage();
</script>

<template>
    <div v-for="notice in page.props.notices ?? []" :key="notice.id" class="site-notice" :class="`site-notice--${notice.tone}`" role="status">
        {{ notice.message }}
    </div>
</template>
```

`?? []` keeps the theme working when the plugin is off. See [Themes](/developers/themes) and [Frontend](/developers/frontend).

## Ship a new version

1. Change the code. If the schema changes, add a new migration file. Never edit a migration that has already run on a site.
2. Raise `version` in `plugin.json` (for example to `0.2.0`).
3. Rebuild the Vue files and run `plugin:check`.

When a site gets the new files, the next request notices that the version in the files differs from the version recorded in the database, runs the new migrations and calls the provider's `upgrade()` hook once. See [Packaging](/developers/packaging) to build a signed zip.

## If something goes wrong

| Message | What it means |
|---|---|
| `Usage: make:plugin <slug>   (lowercase letters, digits and dashes)` | The slug has capitals, underscores or other characters. |
| `content/plugins/notices already exists.` | Pick another slug or delete the folder. |
| `Plugin "notices" not found or invalid.` | A `make:*` command was given `--plugin=notices` before the plugin existed, or its `plugin.json` is invalid. |
| `Cannot activate "notices": it failed to boot: ...` | `register()` or `boot()` threw during the activation test. The rest of the line is the exception and its file and line. |
| `Table "notices" is outside this migration's namespace; table names must start with "p_notices_".` | A migration used a table name without the prefix. |
| `[notices-admin] must start with "notices." (declared by plugin:notices).` | A capability, or with `:` a scope, is outside the plugin's namespace. |
| `Admin pages of plugin:notices must use components named "@notices/…".` | The component name in `$cms->admin->page()` has another prefix. |
| `Plugins\Notices\Api\ListNotices: plugin endpoints must live under /notices/ (got /notice/list).` | The endpoint path does not start with the slug. In debug mode this throws during boot; otherwise the endpoint is left out and the log says `API endpoint refused (plugin:notices)`. |
| `Plugins\Notices\Api\ListNotices declares no scopes: refused (tokens need an explicit scope).` | Every endpoint that is not public needs a capability and at least one scope. |
| `Vue sources are not built: run "npm run build" (built output in assets/build/ ships with the package)` | `plugin:check` found `.vue` files without `assets/build/.vite/manifest.json`. |
| The admin page stays blank or shows an old version | The build is missing or stale. Run `npm run build content/plugins/notices` and reload. |
| The plugin shows as **suspended** on the Plugins screen | Its code threw during `register()`, `boot()` or an upgrade on a normal request. The reason is shown there. Fix the code, then activate it again to clear the suspension. |

## Next steps

- [Manifest](/developers/manifest): every key of `plugin.json`.
- [Providers](/developers/providers): the lifecycle hooks and safe mode.
- [Background jobs](/developers/jobs): add a scheduled job that deletes old notices.
- [Events and filters](/developers/events): react when someone publishes content.
- [Packaging](/developers/packaging): build and sign a zip for other sites.

Two complete plugins are in [kestellohq/examples](https://github.com/kestellohq/examples). `hello` is small and shows one of each thing. `catalog` is a product catalog built only on public extension points: two content types and a taxonomy, its own stock tables, permissions, API endpoints for the admin and a public one for headless shops, a stock screen, a dashboard widget, a column on the products list, a settings tab, a block, a binding source, a template, a pattern, a scheduled job with a notification, and events other plugins can listen to. Its test in [`catalog/tests`](https://github.com/kestellohq/examples/tree/main/plugins/catalog/tests) installs it from a zip, uses it, and uninstalls it on SQLite, MySQL and PostgreSQL.
