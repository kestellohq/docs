# Permissions

Kestello decides what someone may do from two things: the **capabilities** their role grants, and, when they call the API with a personal access token, the **scopes** of that token. This page explains how to declare capabilities and scopes in a plugin, how to check them, how roles work, and which actions also need a recent password confirmation. Read it when your plugin adds a screen, an endpoint or an action that not everyone should reach.

## The model

- A **capability** is a named permission such as `notices.manage`. Plugins declare their own.
- A **role** is a named set of capabilities. Every user has exactly one role.
- A **scope** is a named permission for a token, such as `notices:read`. A token can only narrow what its user may do, never widen it.
- A **principal** (`Kestello\Contracts\Auth\Principal`) is who is making the request: the user, how they signed in, their capabilities and, for a token, its scopes.

The effective permission for an API call is "the role has the capability, and the token (if any) has the scopes". A session in the browser has no scope limit.

## Core capabilities

| Capability | Lets someone |
|---|---|
| `read` | Sign in and see their own profile. |
| `admin.access` | Open the admin area. Every admin page also needs this. |
| `content.access` | Use the content editor (each content type grants its own actions). |
| `profile.manage` | Manage their own profile, tokens and sessions. |
| `users.read` | List and view users. |
| `users.manage` | Create, edit and delete users. |
| `roles.manage` | Create and edit roles and what they may do. |
| `menus.manage` | Edit menus and assign them to theme locations. |
| `media.upload` | Upload files, and edit or delete their own. |
| `media.manage` | Edit and delete everyone's files. |
| `settings.manage` | Change site settings. |
| `audit.read` | Read the audit log. |
| `security.manage` | See everyone's sign-ins, sessions and access tokens, and end them (**System → Security**). |
| `system.manage` | Manage infrastructure, background jobs, scheduled tasks and Site Health. |

Core modules declare more: `backups.manage`, `plugins.manage`, `core.update`, `forms.manage`, `redirects.manage`, `snippets.manage`, `content_models.manage`, `theme.design`, `theme.custom_css` and `theme.manage`. Each content type adds `content.<type>.<action>` for the actions `create`, `edit`, `edit_others`, `publish`, `delete` and `delete_others`; each taxonomy adds `manage` and `assign`. The **Roles** screen lists every capability with its label.

## Core roles

| Role | Label | Capabilities from code |
|---|---|---|
| `admin` | Administrator | `*` (every capability, including ones added later). Cannot be changed. |
| `user` | User | `read`, `profile.manage` |
| `editor` | Editor | `read`, `profile.manage`, `admin.access`, `content.access`, `menus.manage`, `media.upload`, `media.manage`, `forms.manage`, `redirects.manage`, every action on every content type and taxonomy |
| `author` | Author | `read`, `profile.manage`, `admin.access`, `content.access`, `media.upload`, `create`, `edit`, `publish` and `delete` on non-hierarchical content types, `assign` on taxonomies |
| `contributor` | Contributor | `read`, `profile.manage`, `admin.access`, `content.access`, `media.upload`, `create` and `edit` on non-hierarchical content types, `assign` on taxonomies |

What code declares is the default. When a site owner changes a role on the **Roles** screen, Kestello stores the capabilities granted and revoked on top of the defaults. A plugin update that grants a new capability to `editor` therefore still reaches an `editor` role the owner has customised, unless the owner revoked that capability. Roles created in the admin start empty.

## Declare a capability

In `boot()`:

```php
$cms->auth->roles->capability('notices.manage', 'Manage site notices', grantTo: ['editor']);
```

- The name must start with your slug and a dot (`notices.`), and match `^[a-z0-9][a-z0-9_.:-]*$`.
- The label is what the **Roles** screen shows. Write it as an action: "Manage site notices".
- `grantTo` grants it to roles by default. Administrators hold `*`, so you do not need to list `admin`.
- Pass `sensitive: true` when the capability is as good as administrator access, for example when it runs code or reads every row. The **Roles** screen then marks it and warns before a role gets it.
- Declaring a name another package already declared throws `Capability [notices.manage] is already declared by plugin:other.`

You can also grant later, or add a role:

```php
$cms->auth->roles->grant('author', 'notices.manage');
$cms->auth->roles->role('moderator', 'Moderator', ['read', 'profile.manage', 'admin.access', 'notices.manage']);
```

Role names are 1 to 20 characters: `^[a-z][a-z0-9_-]{0,19}$`. Nobody can grant `*`: `The "*" capability is reserved for administrators.`

## Declare a token scope

```php
$cms->api->scope('notices:read', 'Read site notices');
$cms->api->scope('notices:write', 'Add and delete site notices');
```

Plugin scopes start with your slug and a colon (`notices:`). The description is what a person sees when they create a token. The core scopes are:

| Scope | Allows |
|---|---|
| `profile` | Read your profile and manage your tokens |
| `content:read` | Read content, including drafts |
| `content:write` | Create, edit and delete content |
| `media:write` | Upload and edit media |
| `users:read` | List and view users |
| `users:write` | Create, edit and delete users |
| `settings:write` | Change site settings |
| `audit:read` | Read the audit log |
| `security` | See everyone's sign-in security, and end their sessions and tokens |
| `system` | Manage infrastructure, jobs and Site Health |
| `admin` | Everything your account can do |

A token with `admin` passes every scope check. Tokens are created on **Your profile** or with `php bin/cms token:create <user> --scopes=notices:read,notices:write`.

## Protect an API endpoint

An endpoint declares its capability and scopes, and Kestello checks them before `handle()` runs:

```php
final class CreateNotice extends Endpoint
{
    public function route(): ApiRoute { return ApiRoute::post('/notices/notices'); }
    public function capability(): ?string { return 'notices.manage'; }
    public function scopes(): array { return ['notices:write']; }
    // ...
}
```

Endpoints are denied by default. An endpoint that is not `isPublic()` must declare a capability and at least one declared scope, or it is not registered. The checks run in this order:

| Check | Response when it fails |
|---|---|
| A bearer token was sent and is not valid | `401` `invalid_token` |
| Rate limit | `429` `rate_limited` |
| A cookie request that changes data has no valid `X-CSRF-TOKEN` header | `403` `csrf_mismatch` |
| Nobody is signed in | `401` `unauthenticated` |
| The role lacks the capability | `403` `forbidden` |
| The token lacks a scope | `403` `insufficient_scope` (the response lists `required_scopes`) |
| The endpoint needs recent authentication (below) | `403` for tokens, `401` `reauth_required` for sessions |
| The query string or body does not match the schema | `422` `validation` |
| `authorize()` returns `false` | `403` `forbidden` |

Use `authorize()` for checks on a specific object, such as "only the author may delete this", after the capability check:

```php
// Assumes the table has a created_by column holding the author's user id.
public function authorize(ApiRequest $request): bool
{
    $notice = Notice::find($request->intParam('id'));

    return $notice === null || $request->principal->can('notices.manage_others') || (int) $notice->created_by === $request->userId();
}
```

## Check a capability in your own code

`Principal::can()` is true when the principal is signed in and holds the capability or `*`:

```php
// In an endpoint
if (!$request->principal->can('notices.publish')) {
    throw ApiProblem::forbidden('You cannot publish notices.');
}

// In a web route handler
$principal = $cms->auth->authenticate($request);
if (!$principal->can('notices.manage')) {
    return Response::redirect('/login');
}
```

`$principal->hasScope('notices:write')` and `$principal->hasScopes([...])` check scopes; both are true for a browser session. `$principal->isGuest()` is true for visitors.

In the admin's Vue code, `useCan()` from `@kestello/sdk` hides buttons a person cannot use:

```js
import { useCan } from '@kestello/sdk';

const can = useCan();
// v-if="can('notices.manage')"
```

This is only cosmetic. The API enforces every check.

## Admin pages and extensions

Every admin page is its own server route, and the capability is checked on the server before the page and its JavaScript are sent:

```php
$cms->admin->page('', '@notices/admin/Notices', 'Notices', 'notices.manage', ['label' => 'Notices', 'icon' => 'megaphone']);
```

A person needs `admin.access` and the page's capability. Without them they get the 403 page, and the menu does not list the entry. Widgets, slots, columns and settings tabs take a `capability` too and are left out of what the browser receives for people without it. A settings tab is saved through the settings API, which needs `settings.manage` in addition to the tab's own capability.

## Rules for managing people and roles

These rules stop someone with `users.manage` or `roles.manage` from giving themselves more rights:

- **Roles that hold `*` can only be managed by someone who holds `*`.** Only an administrator can create, change, deactivate or delete an administrator account, or give someone an administrator role: `Only an administrator can manage administrator accounts.`
- More generally, you can only give out or act on a role whose capabilities you all hold yourself: `You can't manage people with the role "editor": it has capabilities you don't (forms.manage).`
- The administrator role always has every capability and cannot be edited or deleted: `The administrator role always has every capability.`
- You can only grant capabilities you hold: `You can't grant [system.manage]: you don't have it yourself.`
- You cannot change the role you hold, unless you hold `*`: `You can't change your own role. Ask an administrator.`
- Only declared capabilities can be granted: `Unknown capability [notices.publish].`
- The last active administrator cannot be removed.
- Restoring or uploading a backup needs `*`, because a backup decides who the administrators are: `Only administrators can restore or upload backups.` Making and downloading backups needs `backups.manage`.

## Recent authentication

Some actions change who can do what, or touch the whole site. Their endpoints declare `requiresRecentAuth()`:

```php
public function requiresRecentAuth(): bool { return true; }
```

For those endpoints:

- A personal access token is refused: `403` with `This action requires an interactive session.`
- A browser session must have confirmed the password (or signed in) in the last 10 minutes. Otherwise the API answers `401` `reauth_required`. The admin then asks for the password, calls `POST /api/v1/auth/confirm`, and retries the request.

Core endpoints that require it:

| Area | Endpoints |
|---|---|
| Your account | `POST /me/tokens`, `POST /me/2fa/totp`, `POST /me/2fa/totp/confirm`, `DELETE /me/2fa`, `POST /me/2fa/recovery-codes`, `DELETE /me/identities/{id}` |
| People and roles | `POST /users`, `PATCH /users/{id}`, `DELETE /users/{id}`, `POST /roles`, `PATCH /roles/{name}`, `DELETE /roles/{name}` |
| Settings | `PATCH /settings` |
| Plugins and themes | `POST /plugins/install`, `POST /plugins/upload`, `POST /plugins/update`, `POST /plugins/{slug}/activate`, `POST /plugins/{slug}/deactivate`, `DELETE /plugins/{slug}`, `POST /themes/{slug}/activate`, `DELETE /themes/{slug}`, `POST /themes/import` |
| Content types | `POST /content-models`, `PATCH /content-models/{id}`, `DELETE /content-models/{id}` |
| Backups | `POST /backups/upload`, `GET /backups/{name}/download`, `POST /backups/{name}/restore`, `DELETE /backups/{name}` |
| Updates | `POST /updates/core`, `POST /updates/core/upload` |
| Infrastructure | `PUT /system/platform/{subsystem}`, `DELETE /system/platform/{subsystem}`, `POST /system/storage/move`, `PATCH /system/storage/quotas` |

All paths are under `/api/v1`. Use `requiresRecentAuth()` in your own endpoints for actions with the same weight: deleting everything a plugin stores, changing who can reach something, sending data to another server. A public endpoint cannot require it.

## If something goes wrong

| Message | What it means |
|---|---|
| `[events.manage] must start with "notices." (declared by plugin:notices).` | A capability outside your namespace. With `:` instead of `.`, the same for a scope. |
| `Invalid name [Notices.Manage].` | Names are lowercase letters, digits and `_ . : -`. |
| `Capability [notices.manage] is already declared by plugin:other.` | Two packages declare the same name. |
| `Scope [notices:read] is already declared by plugin:other.` | The same for a scope. |
| `Unknown role [editors].` | `grantTo` or `grant()` named a role that does not exist. |
| `Invalid role name [Moderators].` | Use 1 to 20 lowercase letters, digits, `_` and `-`, starting with a letter. |
| `The "*" capability is reserved for administrators.` | `*` cannot be granted. |
| `<Endpoint> declares neither a capability nor isPublic(): refused (deny by default).` | Add `capability()`, or make it public on purpose. |
| `<Endpoint> uses unknown scope [notices:read]. Declare it with $cms->api->scope().` | Declare the scope before registering the endpoint. |
| `<Endpoint> is public but also declares a capability or scopes; pick one.` | Public endpoints take neither. |
| `The token lacks a required scope.` | The `403` detail for `insufficient_scope`. |
| `Confirm your password to continue.` | The `401` detail for `reauth_required`. |

## Related pages

- [REST API](/developers/rest-api): endpoints, schemas and responses.
- [Admin pages](/developers/admin-pages): capabilities on pages, widgets and settings tabs.
- [Settings](/developers/settings): who may save a settings tab.
- [Plugin tutorial](/developers/plugin-tutorial): a plugin that declares and uses a capability and two scopes.
