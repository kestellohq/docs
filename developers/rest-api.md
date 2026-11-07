# REST API

This page covers Kestello's REST API: where it lives, how to authenticate, the scopes a token can carry, the error format, rate limits, pagination and the OpenAPI document. The second half shows how a plugin adds its own endpoints. Read it when you connect another system to a site, or when your plugin needs an API for its admin screens or for integrations.

The admin itself is a client of this API. Every admin screen calls the same endpoints described here, so anything the admin does, an integration can do within its token's scopes (with the exceptions listed under [Recent authentication](#recent-authentication)).

## Base address

Every endpoint lives under one prefix, `Kestello\Cms\Api\ApiRegistry::PREFIX`:

```php
public const string PREFIX = '/api/v1';
```

An endpoint declared as `/hello/greetings` is reached at `/api/v1/hello/greetings`. Requests and responses are JSON. Successful responses wrap their payload in `data`, and lists add a `meta` object:

```bash
curl -s http://localhost:8080/api/v1/status
```

```text
{"data":{"status":"ok","time":"2026-11-05T17:52:37Z"}}
```

`GET /api/v1/status` is public and suitable for uptime checks. The `version` field is added only when the caller holds the `core.update` or `plugins.manage` capability.

Every response from an endpoint carries these headers:

| Header | Meaning |
|---|---|
| `X-Request-Id` | A random id for this request. It is also written to the PHP error log when the endpoint throws, so quote it in bug reports. |
| `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` | The rate limit bucket this request counted against (see [Rate limits](#rate-limits)). |
| `Cache-Control` | `no-cache` for guest reads, `private, no-store` for everything else, unless the endpoint set its own. |
| `Vary` | `Authorization, Cookie`. |

A path that no endpoint matches answers with a `404` problem, not an HTML page, as long as it starts with `/api/`.

## Authentication

There are two ways to authenticate. Kestello picks the method from the request: when an `Authorization: Bearer` header is present, only token guards are tried; otherwise only the session is.

| Method | Use it for | CSRF header | Scopes apply |
|---|---|---|---|
| Session cookie (`kestello_session`) | The admin, Vue pages and plugin screens running on the same site | Required on `POST`, `PUT`, `PATCH`, `DELETE` | No |
| Personal access token (`Authorization: Bearer kst_pat_...`) | Scripts, servers, other applications | Never | Yes |

What a caller may do is always the intersection of two things: the **capabilities** of the user's role, and, for tokens, the token's **scopes**. A token narrows what its user may do and never widens it. If the user's role loses a capability, every token of that user loses it too.

### Session cookie

Code running in a page of the site uses the visitor's session. Unsafe methods (anything but `GET`) must send the session's CSRF token in the `X-CSRF-TOKEN` header. Vue pages find the token in `usePage().props.csrfToken` (see [Frontend](/developers/frontend)). The `useApi()` client from `@kestello/sdk` sends it for you:

```vue
<script setup>
import { ApiError, useApi } from '@kestello/sdk';

const api = useApi();

async function greet(name) {
    try {
        const { data } = await api.post('/hello/greetings', { name });
        return data;
    } catch (error) {
        if (error instanceof ApiError && error.status === 422) {
            console.log(error.fieldErrors()); // { name: 'Must be at most 40 characters.' }
        }
        throw error;
    }
}
</script>
```

`ApiError` exposes the problem's `status`, `code` (the last part of the problem type, such as `validation`), `title`, `detail` and `errors`. When an endpoint answers `reauth_required` inside the admin, the client shows the password prompt and repeats the request once.

A cookie request to an unsafe method without a valid header is refused with `403 csrf_mismatch`, before any capability check.

### Personal access tokens

A token looks like `kst_pat_` followed by 48 hexadecimal characters. Only its SHA-256 hash is stored; the plain token is shown once, when it is created. The fixed prefix lets secret scanners recognise a leaked token.

Create a token in one of two ways:

- In the admin, under **Your profile → Access tokens → Create token**. Creating a token needs a recent sign-in, because tokens cannot create tokens.
- On the command line, which needs no sign-in:

```bash
php bin/cms token:create admin --name=deploy --scopes=content:read,users:read --days=90
```

`--scopes` is required. `--days` defaults to `90`; `--days=0` makes a token that never expires. `--name` defaults to `cli`. Through the API, expiry is 1 to 365 days or never; the admin offers 7, 30, 90 or 365 days, or **Never**. One user may hold at most 50 tokens.

Send the token in the `Authorization` header:

```bash
TOKEN=kst_pat_0123456789abcdef0123456789abcdef0123456789abcdef

curl -s http://localhost:8080/api/v1/me \
  -H "Authorization: Bearer $TOKEN"

curl -s "http://localhost:8080/api/v1/content/post/entries?status=published&per_page=10" \
  -H "Authorization: Bearer $TOKEN"
```

A token that is unknown, malformed or expired, or whose user is deactivated, gets `401 invalid_token`. Kestello never falls back to treating the request as a guest when a bearer header is present.

Tokens are listed and revoked under **Your profile → Access tokens**, or through `GET /api/v1/me/tokens` and `DELETE /api/v1/me/tokens/{id}`. `GET /api/v1/me` returns the current user with an `auth` object holding `method` (`session` or `token`), `scopes` (`null` for sessions) and `capabilities`.

### Scopes

A token must hold **every** scope an endpoint lists. Core declares these, in `ApiRegistry::CORE_SCOPES`:

| Scope | Lets a token |
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

`admin` passes every scope check, including scopes that plugins declare. Plugins add their own scopes, named `<plugin-slug>:<name>`, such as `hello:read`. The full list on a site, plugin scopes included, is in the OpenAPI document under `components.x-scopes`, and `token:create` prints the known scopes when you leave out `--scopes`.

### CORS

Cross-origin requests from browsers are off until you list origins. Put them in the site's `config/api.php`:

```php
<?php

return [
    'cors' => [
        'origins' => ['https://app.example.com'],
        'credentials' => false,
    ],
];
```

| Key | Type | Default | Meaning |
|---|---|---|---|
| `api.cors.origins` | list of strings | `[]` | Exact origins allowed to call the API, or `'*'` for any. Empty turns CORS off. |
| `api.cors.credentials` | bool | `false` | Sends `Access-Control-Allow-Credentials: true`, so the browser includes cookies. Never sent together with `'*'`. |

Preflight requests allow the methods `GET, POST, PUT, PATCH, DELETE` and the headers `Authorization, Content-Type, If-Match, Idempotency-Key, X-CSRF-TOKEN`, cached for 600 seconds. A browser application on another origin should use a token, not cookies.

## Errors

Every error is an RFC 9457 problem, sent as `application/problem+json`, built by `Kestello\Cms\Api\ApiProblem`:

```bash
curl -s "http://localhost:8080/api/v1/search?q=a&bogus=1"
```

```text
{"type":"urn:kestello:problem:validation","title":"Validation failed","status":422,"detail":"The request has invalid fields.","errors":{"query.bogus":["Unknown field."]}}
```

| Member | Always present | Meaning |
|---|---|---|
| `type` | Yes | `urn:kestello:problem:<code>`. Branch on this, not on `title` or `detail`. |
| `title` | Yes | A short, fixed summary of the problem type. |
| `status` | Yes | The HTTP status code, repeated. |
| `detail` | Usually | A sentence for people, specific to this occurrence. |
| `errors` | Validation only | Field path to a list of messages. Body fields use their dot path (`options.host`, `items.0.title`); query fields are prefixed with `query.`. Messages are in the site's language, so show them, but don't compare them. |

Some problems add members: `insufficient_scope` adds `required_scopes`, and `reauth_required` adds `"reauth_required": true`.

| Status | Code | When |
|---|---|---|
| 400 | `malformed_body` | The body is not valid JSON, or is JSON but not an object. |
| 401 | `unauthenticated` | No session and no token, on an endpoint that is not public. Sent with `WWW-Authenticate: Bearer`. |
| 401 | `invalid_token` | The bearer token is unknown, malformed, expired, or its user is inactive. |
| 401 | `invalid_credentials` | Wrong login, password or code on the sign-in endpoints. The same answer for unknown accounts. |
| 401 | `reauth_required` | The endpoint needs a recent sign-in. See [Recent authentication](#recent-authentication). |
| 401 | `two_factor_expired` | A two-step sign-in took too long. Sign in again. |
| 403 | `forbidden` | The user's role lacks the capability, the endpoint's own policy refused, or a token called a session-only action. |
| 403 | `insufficient_scope` | The token lacks one of the endpoint's scopes. |
| 403 | `csrf_mismatch` | A cookie request to an unsafe method without a valid `X-CSRF-TOKEN` header. |
| 404 | `not_found` | No endpoint matches the path, or the resource does not exist. |
| 405 | `method_not_allowed` | Raised by endpoints that refuse a method explicitly. |
| 409 | `conflict` | The change clashes with the current state. |
| 413 | `malformed_body` | The JSON body is larger than 1 MB. |
| 422 | `validation` | The query string or body did not match the endpoint's schema. |
| 429 | `rate_limited` | Too many requests. Sent with `Retry-After`. |
| 500 | `server_error` | The endpoint threw. `detail` is `Something went wrong.` unless `app.debug` is on, in which case it is the exception message. Stack traces never leave the server. |

The request pipeline runs in this order, so the first failing step decides the error: authenticate, rate limit, CSRF (cookie requests to unsafe methods), capability and scopes, recent authentication, query and body validation, the endpoint's `authorize()`, then `handle()`.

## Rate limits

Limits are counted per user, or per IP address for guests. Endpoints without their own limit share two buckets:

| Bucket | Applies to | Limit |
|---|---|---|
| `read` | `GET` endpoints | 300 requests per 60 seconds |
| `write` | `POST`, `PUT`, `PATCH`, `DELETE` endpoints | 60 requests per 60 seconds |

An endpoint that declares `rateLimit()` gets a bucket of its own, keyed by its method and path. Some core examples: creating a token allows 10 per hour, confirming a password 20 per minute, signing in 30 per minute.

Every response shows the bucket it counted against:

```text
RateLimit-Limit: 300
RateLimit-Remaining: 298
RateLimit-Reset: 23
```

`RateLimit-Reset` is the number of seconds until the window resets. A refused request gets `429 rate_limited` with `Retry-After` in seconds; wait at least that long. A request with an invalid token is refused before it is counted, so it carries no rate limit headers.

## Recent authentication

Destructive and security-sensitive endpoints declare `requiresRecentAuth()`. For these:

- **Tokens are refused**, whatever their scopes, with `403 forbidden` and the detail `This action requires an interactive session.`
- **Sessions** must have signed in or confirmed their password in the last 10 minutes. Otherwise the answer is `401 reauth_required`. Send the password to `POST /api/v1/auth/confirm` (body `{"password": "..."}`), which answers with `confirmed_until`, a Unix time 600 seconds ahead, and repeat the request.

Core endpoints that need recent authentication include: creating tokens; installing, uploading, updating, activating, deactivating and deleting plugins; activating, importing and deleting themes; uploading and applying core updates; restoring, uploading, downloading and deleting backups; creating, changing and deleting users and roles; changing, creating and deleting content models; changing site settings; changing infrastructure drivers and storage quotas; and the two-step sign-in settings. The OpenAPI document marks each of them with `x-kestello-recent-auth: true`.

The account endpoints for signing in and out (`/api/v1/auth/session`, `/api/v1/auth/2fa/verify`, `/api/v1/auth/confirm`), changing the password (`PUT /api/v1/me/password`), two-step sign-in settings (`/api/v1/me/2fa`) and disconnecting a linked sign-in account (`DELETE /api/v1/me/identities/{id}`) refuse tokens in the same way.

## Pagination

List endpoints use one of two styles. The OpenAPI document shows which query parameters each endpoint accepts.

**Cursor pagination** (for example `GET /api/v1/users`). Pass `limit` (1 to 100, default 25). The response's `meta.next_cursor` is an opaque string, or `null` on the last page. Pass it back as `cursor` to get the next page:

```bash
curl -s "http://localhost:8080/api/v1/users?limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

```text
{"data":[{"id":12,...},...],"meta":{"limit":50,"next_cursor":"aWQ6MTM"}}
```

```bash
curl -s "http://localhost:8080/api/v1/users?limit=50&cursor=aWQ6MTM" \
  -H "Authorization: Bearer $TOKEN"
```

Cursors are keyset positions ("after id N"), so pages stay correct while rows are added. A cursor that does not decode gives a `422` with `query.cursor: ["Invalid cursor."]`.

**Page pagination** (for example `GET /api/v1/content/{type}/entries`). Pass `page` (default 1) and `per_page` (1 to 100, default 20). `meta` holds `total`, `page`, `per_page` and `last_page`.

Object-shaped query parameters use brackets: `filter[role]=editor&filter[active]=1`. Query values arrive as strings and are converted to the declared type, so `1`, `true`, `0` and `false` work for booleans. Unknown query parameters are rejected with `422`.

## Query content entries

`GET /api/v1/content/{type}/entries` lists the entries of one content type. Besides `page` and `per_page`:

| Parameter | Meaning |
|---|---|
| `status` | `any` (default), `draft`, `pending`, `scheduled`, `published`, `private` or `trash`. |
| `search` | Text anywhere in the title. |
| `author`, `parent`, `term` | A user id; a parent entry id (`0` for top level); a term id. |
| `links_to` | An entry id: only entries that link to it through a relationship field, at any depth (inside groups, repeaters and blocks too). Add `links_to_field=<name>` to count only one top-level field. |
| `assignee` | `me`, or a user id: entries assigned for review. |
| `sort` | `title`, `id`, `created_at`, `updated_at`, `published_at`, `menu_order`, or `field:<name>` for an indexed field. Prefix `-` for descending. Default `-updated_at`. |
| `filter[<field>]` | Conditions on indexed fields, below. |

### Filter by field values

Filters and `field:` sorting work on fields declared with `->indexed()`. Kestello copies their values into an index table when an entry is saved, so a filter never scans the entries' JSON:

```php
Field::number('price')->min(0)->indexed(),
Field::datetime('starts_at')->indexed(),
Field::select('level', ['intro' => 'Intro', 'pro' => 'Pro'])->indexed(),
```

| Filter | Matches |
|---|---|
| `filter[level]=pro` | Equal. |
| `filter[level][]=intro&filter[level][]=pro` | One of these. `filter[level][in]=intro,pro` is the same. |
| `filter[price][gte]=10&filter[price][lt]=50` | A range: `gt`, `gte`, `lt` and `lte`, in any combination. |
| `filter[starts_at][gte]=2027-03-01` | Dates: a bare date means the whole day. `gte` starts at its first second, `lte` ends at its last, and `filter[starts_at]=2027-03-01` matches any time that day. |
| `filter[starts_at][lt]=2027-03-01T18:00:00Z` | A date and time in ISO 8601, with `Z` or an offset such as `+02:00` (write `+` as `%2B` in a URL). |
| `filter[venue][exists]=false` | Has no value. `true` for has a value. |

```bash
curl -s "http://localhost:8080/api/v1/content/event/entries?status=published&filter[starts_at][gte]=2027-03-01&filter[seats][gt]=0&sort=field:starts_at" \
  -H "Authorization: Bearer $TOKEN"
```

Conditions on different fields all apply. Ranges work on number and date fields; select, text and other string fields take equality and lists. Yes/no fields are numbers here: filter them with `true` or `false`. For a field that holds several values, such as a list of related entries, a condition matches when one of the values does.

Up to 10 fields per request, and up to 50 values in a list. A field that is not indexed, an unknown operator or a value of the wrong kind answers `422` with the reason under `query.filter.<field>`:

```json
{ "errors": { "query.filter.level": ["Ranges work on number and date fields."] } }
```

In PHP, `Kestello\Cms\Content\FieldFilters::parse()` and `apply()` add the same conditions to your own entry queries.

### Entries that link to an entry

Relationship fields (`Field::entry()`) store the ids an entry links to. Kestello also records the other direction on every save, so you can ask which entries point at one:

```bash
curl -s http://localhost:8080/api/v1/content/person/entries/12/linked-from -H "Authorization: Bearer $TOKEN"
```

```json
{ "data": [
    { "id": 31, "type": "talk", "type_label": "Talk", "title": "Notes on the engine", "status": "published",
      "fields": [{ "name": "speakers", "label": "Speakers" }] }
] }
```

Each entry appears once, with the top-level fields that hold the link; a link inside a group, repeater or block counts under the field that holds it. Trashed entries are left out, and so are entries the caller could not open. To list one type's entries that link to an entry, with paging and sorting, use `links_to` on the list above.

A field type of your own takes part by overriding `FieldType::relations()` and returning the entry ids its value holds. After an upgrade, an import or a restore from an older backup, `bin/cms content:relations` records every entry's links again.

## The OpenAPI document

```bash
curl -s http://localhost:8080/api/v1/openapi.json
```

`GET /api/v1/openapi.json` is an OpenAPI 3.0.3 document built at request time from the endpoint declarations, plugin endpoints included. It lists **only the endpoints the caller could use**: public endpoints, plus those whose capability the caller holds. A guest sees the sign-in, search, form and status endpoints; send a token or a session to see more:

```bash
curl -s http://localhost:8080/api/v1/openapi.json \
  -H "Authorization: Bearer $TOKEN" -o openapi.json
```

What the document contains:

| Part | Content |
|---|---|
| `servers` | `app.url` followed by `/api/v1`. |
| `paths` | One operation per endpoint. `operationId` is the endpoint class name with a lowercase first letter (`listGreetings`). Path parameters constrained to digits (`\d+`, `\d{1,18}`, `[0-9]+`) are typed `integer`. |
| `responses` | The shape of `data`, from the endpoint's `response()` schema or its resource's `properties()`, as a list when `collection()` is true. Endpoints that declare neither are described as a plain object. |
| `security` | `session` or `bearer` with the endpoint's scopes; empty for public endpoints. |
| `requestBody` | The endpoint's body schema. Objects have `additionalProperties: false`. |
| `x-kestello-capability` | The capability the endpoint needs. |
| `x-kestello-owner` | `plugin:<slug>` or `theme:<slug>` for endpoints that core does not own. |
| `x-kestello-recent-auth` | `true` when the endpoint needs a recent sign-in. |
| `components.x-scopes` | Every scope on the site with its description. |
| `info.x-kestello-version` | The running Kestello version, only for callers with `core.update` or `plugins.manage`. |

## Write an endpoint in a plugin

An endpoint is one class extending `Kestello\Cms\Api\Endpoint`. From that one declaration Kestello builds the route, the authentication and authorisation checks, input validation, the rate limit, the error format and the OpenAPI entry. The example below adds a list and a create endpoint to a plugin with the slug `acme-books`. It assumes a table `acme_books_books` with `id`, `title`, `author` and `created_at` columns, created by a [migration](/developers/migrations).

### Declare the capability, scopes and endpoints

In the provider's `boot()`:

```php
<?php

declare(strict_types=1);

namespace Plugins\AcmeBooks;

use Kestello\Cms\Cms;
use Kestello\Cms\Extension\PluginProvider;

final class BooksProvider extends PluginProvider
{
    public function boot(Cms $cms): void
    {
        // Who may manage books (administrators hold every capability).
        $cms->auth->roles->capability('acme-books.manage', 'Manage books', grantTo: ['admin', 'editor']);

        // Token scopes. Names must start with "acme-books:".
        $cms->api->scope('acme-books:read', 'Read books');
        $cms->api->scope('acme-books:write', 'Add books');

        // Paths must start with /acme-books/.
        $cms->api->endpoint(Api\ListBooks::class);
        $cms->api->endpoint(Api\CreateBook::class);
    }
}
```

Capabilities are explained in [Permissions](/developers/permissions).

### A resource

A resource turns a row into output with declared fields only, so a new column never leaks by accident:

```php
<?php

declare(strict_types=1);

namespace Plugins\AcmeBooks\Api;

use Kestello\Cms\Api\Resource;
use Kestello\Cms\Api\Schema;
use Kestello\Contracts\Auth\Principal;

final class BookResource extends Resource
{
    // Other plugins can add fields with $cms->api->extend('acme-books').
    public const string NAME = 'acme-books';

    protected function fields(Principal $principal): array
    {
        return [
            'id' => (int) $this->row['id'],
            'title' => (string) $this->row['title'],
            'author' => (string) $this->row['author'],
            'created_at' => self::date($this->row['created_at']),
        ];
    }

    public static function properties(): array
    {
        return [
            'id' => Schema::int(),
            'title' => Schema::string(),
            'author' => Schema::string(),
            'created_at' => Schema::string()->format('date-time')->nullable(),
        ];
    }
}
```

`self::date()` formats a value as ISO 8601 in UTC, or `null`. `properties()` describes the fields for the OpenAPI document and the [TypeScript client](/developers/typescript-client): mark a field `->optional()` when only some answers carry it, and `->nullable()` when it can be `null`. (Plain OpenAPI arrays such as `['type' => 'integer']` are still accepted.)

### A list endpoint with cursor pagination

```php
<?php

declare(strict_types=1);

namespace Plugins\AcmeBooks\Api;

use Kestello\Cms\Api\ApiProblem;
use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Cursor;
use Kestello\Cms\Api\Endpoint;
use Kestello\Cms\Api\Schema;
use Kestello\Framework\Database\QueryBuilder;

/** GET /api/v1/acme-books/books */
final class ListBooks extends Endpoint
{
    public function route(): ApiRoute { return ApiRoute::get('/acme-books/books'); }
    public function capability(): ?string { return 'acme-books.manage'; }
    public function scopes(): array { return ['acme-books:read']; }
    public function resource(): ?string { return BookResource::class; }
    public function summary(): string { return 'List books (newest first)'; }
    public function tags(): array { return ['acme-books']; }

    public function query(): ?Schema
    {
        return Schema::object([
            'limit' => Schema::int()->min(1)->max(100)->default(25),
            'cursor' => Schema::string()->max(200)->optional(),
        ]);
    }

    public function handle(ApiRequest $request): mixed
    {
        $limit = (int) $request->query('limit');
        $query = QueryBuilder::table('acme_books_books')->orderBy('id', 'DESC')->limit($limit + 1);

        if (($cursor = $request->query('cursor')) !== null) {
            $after = Cursor::decode($cursor) ?? throw ApiProblem::validation(['query.cursor' => ['Invalid cursor.']]);
            $query->where('id', '<', $after);
        }

        $rows = $query->get();
        $more = count($rows) > $limit;
        $rows = array_slice($rows, 0, $limit);

        return BookResource::collection($rows, [
            'limit' => $limit,
            'next_cursor' => $more && $rows !== [] ? Cursor::encode((int) end($rows)['id']) : null,
        ]);
    }
}
```

### A create endpoint with a body schema

```php
<?php

declare(strict_types=1);

namespace Plugins\AcmeBooks\Api;

use Kestello\Cms\Api\ApiProblem;
use Kestello\Cms\Api\ApiRequest;
use Kestello\Cms\Api\ApiRoute;
use Kestello\Cms\Api\Endpoint;
use Kestello\Cms\Api\Schema;
use Kestello\Framework\Core\Response;
use Kestello\Framework\Database\QueryBuilder;

/** POST /api/v1/acme-books/books {title, author} */
final class CreateBook extends Endpoint
{
    public function route(): ApiRoute { return ApiRoute::post('/acme-books/books'); }
    public function capability(): ?string { return 'acme-books.manage'; }
    public function scopes(): array { return ['acme-books:write']; }
    public function rateLimit(): ?array { return [30, 60]; }
    public function resource(): ?string { return BookResource::class; }
    public function summary(): string { return 'Add a book'; }
    public function tags(): array { return ['acme-books']; }

    public function body(): ?Schema
    {
        return Schema::object([
            'title' => Schema::string()->min(1)->max(200),
            'author' => Schema::string()->min(1)->max(120),
        ]);
    }

    public function handle(ApiRequest $request): mixed
    {
        $title = (string) $request->input('title');

        if (QueryBuilder::table('acme_books_books')->where('title', $title)->first() !== null) {
            throw ApiProblem::conflict('A book with that title already exists.');
        }

        $id = (int) QueryBuilder::table('acme_books_books')->insert([
            'title' => $title,
            'author' => (string) $request->input('author'),
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        $row = QueryBuilder::table('acme_books_books')->where('id', $id)->first();

        return Response::json(['data' => (new BookResource($row))->resolve($request->principal)], 201);
    }
}
```

Call both with a token that holds the plugin's scopes:

```bash
curl -s http://localhost:8080/api/v1/acme-books/books?limit=10 \
  -H "Authorization: Bearer $TOKEN"

curl -s -X POST http://localhost:8080/api/v1/acme-books/books \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Dispossessed","author":"Ursula K. Le Guin"}'
```

The [`hello` example plugin](https://github.com/kestellohq/examples/tree/main/plugins/hello/src/Api) has a working pair of endpoints of the same shape.

### Endpoint methods

| Method | Default | Purpose |
|---|---|---|
| `route(): ApiRoute` | required | Method and path relative to `/api/v1`: `ApiRoute::get()`, `post()`, `put()`, `patch()`, `delete()`. Paths use lowercase segments and `{params}`; constrain a parameter with `->where('id', '\d+')`. |
| `handle(ApiRequest $request): mixed` | required | The work. See the return values below. |
| `capability(): ?string` | `null` | The capability the user's role must grant. |
| `scopes(): array` | `[]` | Scopes a token must hold, all of them. Sessions are not limited by scopes. |
| `isPublic(): bool` | `false` | Reachable without authentication. A public endpoint must not declare a capability, scopes or recent authentication. |
| `query(): ?Schema` | `null` | The query string schema. Values are converted from strings. With no schema, any query parameter is rejected. |
| `body(): ?Schema` | `null` | The JSON body schema. Unknown keys are rejected. |
| `authorize(ApiRequest $request): bool` | `true` | Object-level checks after the capability check, such as "may this user edit this record". Return `false` for `403 forbidden`, or throw an `ApiProblem`. |
| `requiresRecentAuth(): bool` | `false` | Refuse tokens and require a sign-in in the last 10 minutes. |
| `rateLimit(): ?array` | `null` | `[max, seconds]` in a bucket of its own. `null` uses the shared read or write bucket. |
| `sameOriginOnly(): bool` | `false` | For public writes from cached pages that cannot carry a CSRF token: the `Origin` (or `Referer`) must name this site instead. Add your own abuse checks. Core's form submission endpoint uses it. |
| `resource(): ?string` | `null` | The `Resource` class returned, for the OpenAPI document. |
| `response(): ?Schema` | `null` | The shape of one item of `data`, when the endpoint does not return a resource. Takes precedence over `resource()`. |
| `collection(): bool` | `true` for classes named `List…` | Whether `data` is a list. Override it when a `List…` endpoint answers with an object. |
| `summary(): string`, `tags(): array` | `''`, `[]` | Shown in the OpenAPI document. Without tags, the first path segment is used. |

Kestello refuses to register an endpoint that is not public and lacks a capability or scopes (deny by default), uses a scope nobody declared, lives outside `/<plugin-slug>/`, or repeats a method and path that is already registered. With `app.debug` on, the refusal throws so you see it at once. With it off, it is written to the PHP error log as `[kestello] API endpoint refused (plugin:acme-books): ...` and the site keeps running without that endpoint.

Constructor dependencies are injected from the container, as `Greetings` is in the hello plugin's endpoints. `handle()` runs inside the plugin's execution context, so an exception thrown there is blamed on the plugin in the log.

### What `handle()` returns

| Return | Response |
|---|---|
| A `Resource` | `200` with `{"data": {...}}` |
| A `ResourceCollection` (from `Resource::collection($rows, $meta)`) | `200` with `{"data": [...], "meta": {...}}` |
| An array | `200` with `{"data": <array>}` |
| A `Kestello\Framework\Core\Response` | Sent as is. Use it for `201`, files or custom headers. |
| `null` | `204 No Content` |

### The request object

`ApiRequest` holds the validated input and who is calling:

| Member | Content |
|---|---|
| `$request->principal` | The `Kestello\Contracts\Auth\Principal`: `userId`, `method`, `can($capability)`, `hasScope($scope)`. |
| `$request->param('slug')`, `$request->intParam('id')` | Route parameters. `intParam()` throws `404` when the value is not a whole number. |
| `$request->query('limit')` | A validated query value, with schema defaults applied. |
| `$request->input('title')` | A validated body value. Only declared keys are present. |
| `$request->has('title')` | Whether the client sent the key, for `PATCH` endpoints. |
| `$request->userId()` | The user's id, `null` for guests. |
| `$request->http` | The underlying `Kestello\Framework\Core\Request`. |
| `$request->requestId` | The same value as the `X-Request-Id` header. |

### Schemas

`Kestello\Cms\Api\Schema` validates input and describes it in the OpenAPI document. Every modifier returns a copy.

| Constructor | Accepts |
|---|---|
| `Schema::object([...])` | An object with exactly these keys. Unknown keys fail with `Unknown field.` |
| `Schema::string()`, `int()`, `number()`, `bool()` | Scalars. Strings are trimmed unless you add `->raw()`. |
| `Schema::enum(['a', 'b'])` | One of the listed strings. |
| `Schema::list($items)` | A list whose items match `$items`. |
| `Schema::dictionary($maxKeys = 50)` | An object with free keys and scalar values. |
| `Schema::any($maxBytes, $maxDepth)` | Any JSON value within the size and depth limits; validate it yourself. |

| Modifier | Effect |
|---|---|
| `->optional()` | The key may be missing. |
| `->nullable()` | `null` is allowed. |
| `->default($value)` | Optional, and filled with `$value` when missing. |
| `->min($n)`, `->max($n)` | Length for strings, value for numbers, item count for lists. |
| `->format('email')` | One of `email`, `uri`, `date-time`, `date`, `uuid`, `slug`, `multiline`, `media`. On a settings tab, `multiline` shows a text area and `media` on an integer shows an image picker that stores the file's id (0 for none). |
| `->pattern('[a-z]+')` | A regular expression without delimiters, matched against the whole value. |
| `->description('...')` | Shown in the OpenAPI document and in admin forms. |
| `->partial()` | On an object: every property optional with no defaults, for `PATCH`. |

### Errors from your endpoint

Throw an `ApiProblem` for any error the client should see:

```php
throw ApiProblem::notFound('No book with that id.');
throw ApiProblem::validation(['title' => ['Already taken.']]);
throw ApiProblem::conflict('The book was changed by someone else.');
throw ApiProblem::forbidden('Only the author may delete a book.');
throw new ApiProblem(402, 'acme_books_quota', 'Quota reached', 'Your plan allows 100 books.');
```

The last form gives the type `urn:kestello:problem:acme_books_quota`. Any other exception becomes a `500 server_error` and is logged with the request id and the plugin that threw.

### Add fields to an existing resource

A plugin can add fields to a core resource, or to another plugin's resource with a `NAME`, without replacing its endpoints:

```php
$cms->api->extend('users')->field(
    'acme_books_count',
    fn(array $row) => QueryBuilder::table('acme_books_books')->where('author', (string) $row['username'])->count(),
    read: 'acme-books.manage',
);
```

Field names are lowercase with underscores, an added field never replaces an existing one, and a field whose resolver throws is left out and logged. The core resources you can extend are `users`, `entries` and `media`. The filter `api.response.<name>` can add or redact values in a resource's output; a filter result that removes keys is ignored.

## If something goes wrong

| Message | What it means |
|---|---|
| `Authentication is required.` (`401 unauthenticated`) | No session cookie and no `Authorization` header reached the endpoint. Check that a proxy is not stripping the `Authorization` header. |
| `The access token is invalid or expired.` (`401 invalid_token`) | The token was mistyped, revoked, has expired, or its user was deactivated. Create a new one. |
| `The token lacks a required scope.` (`403 insufficient_scope`) | `required_scopes` in the body lists what the token is missing. Create a token with those scopes. |
| `You are not allowed to do this.` (`403 forbidden`) | The user's role lacks the endpoint's capability, or `authorize()` returned `false`. A token cannot do more than its user. |
| `This action requires an interactive session.` (`403 forbidden`) | The endpoint needs a recent sign-in, which a token can never have. Do it in the admin, or with the command line. |
| `Confirm your password to continue.` (`401 reauth_required`) | The session signed in more than 10 minutes ago. `POST /api/v1/auth/confirm` with the password, then repeat. |
| `Send the X-CSRF-TOKEN header with cookie-authenticated requests.` (`403 csrf_mismatch`) | A cookie request to `POST`, `PUT`, `PATCH` or `DELETE` had no valid CSRF header. Use `useApi()`, or send a token instead of a cookie. |
| `The request body is not valid JSON: Syntax error.` (`400 malformed_body`) | The body did not parse. Check quoting in your `curl -d` argument and send `Content-Type: application/json`. |
| `The request body must be a JSON object.` (`400 malformed_body`) | The body was a JSON array or a scalar. Wrap it in an object. |
| `The request body is larger than 1 MB.` (`413 malformed_body`) | Upload files through the media endpoints, not inside JSON. |
| `Unknown field.` (`422 validation`) | The body or query string has a key the schema does not declare. Query keys appear as `query.<name>`. |
| `Try again in 23 seconds.` (`429 rate_limited`) | Wait for `Retry-After` seconds. Read `RateLimit-Remaining` to slow down before this happens. |
| `No endpoint matches GET /api/v1/... .` (`404 not_found`) | Wrong path or method, or the plugin that provides it is not active or its endpoint was refused. Run `php bin/cms routes` to see what is registered. |
| `[kestello] API endpoint refused (plugin:acme-books): Plugins\AcmeBooks\Api\ListBooks declares no scopes: refused (tokens need an explicit scope).` (error log) | Add `scopes()`. The other refusal reasons are `declares neither a capability nor isPublic(): refused (deny by default).`, `uses unknown scope [...]. Declare it with $cms->api->scope().`, `plugin endpoints must live under /acme-books/ (got ...)` and `... is already registered by ...`. |
| `[acme-books.read] must start with "acme-books:" (declared by plugin:acme-books).` | A scope name used the wrong separator. Scopes use a colon, capabilities a dot. |
| `Invalid API path [/Books]: use lowercase segments and {params}.` | Paths are lowercase letters, digits, `.`, `_` and `-`, with `{params}`. |

## Next

- [Permissions](/developers/permissions) for capabilities and roles.
- [Admin pages](/developers/admin-pages) for screens that call your endpoints with `useApi()`.
- [Frontend](/developers/frontend) for `usePage()` and the CSRF token in pages.
- [Configuration](/developers/configuration) for `app.debug`, `app.url` and the other settings mentioned here.
