# TypeScript client

Kestello generates a typed client for its REST API: one TypeScript file with no dependencies, a method for every endpoint, and the types of what each one takes and answers. Use it in a headless front end, a build script or an integration, so your editor checks your calls and a renamed field shows up as a type error instead of a bug.

It runs anywhere `fetch` does: browsers, Node.js 18 or newer, Deno, Bun and edge runtimes.

## Generate it

On the server, from the site's root folder:

```bash
php bin/cms api:client --out=../my-frontend/src/kestello.ts
```

```text
  Wrote ../my-frontend/src/kestello.ts (189 operations).
```

The file covers every endpoint of core and the active plugins. Generate it again after you update Kestello or add a plugin, and commit it with your front end.

| Option | What it does |
|---|---|
| `--out=<file>` | Write to this file. Without it, the code is printed. |
| `--owner=<slug>` | Only one plugin's endpoints (`--owner=catalog`), or `--owner=core`. |
| `--openapi` | Write the full OpenAPI document instead, for other code generators. |

Without a terminal, sign in to the admin and open **System → API**, then click **Download TypeScript client**. That file covers the endpoints your own role may use. `GET /api/v1/openapi.ts` serves the same file to any caller.

## Use it

Create an [access token](/developers/rest-api#personal-access-tokens) under **Your profile** with the scopes you need, and keep it out of code you ship to browsers.

```ts
import { createClient, KestelloApiError } from './kestello';

const kestello = createClient({
    baseUrl: 'https://example.com/api/v1',
    token: process.env.KESTELLO_TOKEN,
});

const { data: posts, meta } = await kestello.listEntries({
    type: 'post',
    query: { status: 'published', limit: 10 },
});
for (const post of posts) {
    console.log(post.title, post.path);    // typed: string, string | null
}
```

Every method takes one object: path parameters by name (`id`, `type`), then `query` and `body`. It answers with `{ data, meta }`, where `meta` holds paging details for lists. A `DELETE` that has nothing to return answers `undefined`.

```ts
const { data: hook } = await kestello.createWebhook({
    body: { name: 'Rebuild', url: 'https://api.netlify.com/build_hooks/abc', events: ['entry.published'] },
});
console.log(hook.secret);

await kestello.deleteWebhook({ id: hook.id });
```

### Options

| Option | Meaning |
|---|---|
| `baseUrl` | The API's address, ending in `/api/v1`. |
| `token` | An access token, or a function returning one (it may be async, for tokens you refresh). |
| `csrfToken` | For code running inside the admin with the session cookie: the CSRF token, or a function returning it. |
| `headers` | Extra headers for every request. |
| `fetch` | Your own `fetch`, for example one that adds caching or logging. |
| `credentials` | Passed to `fetch`. Defaults to `same-origin`. |

### Errors

Every answer that is not a success throws `KestelloApiError`, with the [problem details](/developers/rest-api#errors) the API sent:

```ts
try {
    await kestello.createWebhook({ body: { name: '', url: 'https://example.org/hook', events: ['entry.created'] } });
} catch (e) {
    if (e instanceof KestelloApiError && e.status === 422) {
        console.log(e.fieldErrors());    // { name: 'Give it a name.' }
    } else if (e instanceof KestelloApiError && e.status === 429) {
        console.log(`Try again in ${e.retryAfter} seconds`);
    } else {
        throw e;
    }
}
```

### Endpoints added later

`kestello.request(method, path, query?, body?)` calls any endpoint, including one added after you generated the file:

```ts
const answer = await kestello.request<{ data: unknown }>('GET', '/acme-books/books', { limit: 5 });
```

## The API explorer

**System → API** in the admin lists every endpoint your role may call, grouped by area. Pick one to see what it needs (the permission, the token scopes, whether it asks for your password again), fill in its parameters and click **Send**: it runs with your own session, and changes really happen, so Kestello asks before anything other than a `GET`. Below the form are the matching TypeScript client call and a `curl` command to copy.

## How the types are made

The types come from the [OpenAPI document](/developers/rest-api#the-openapi-document):

- Query parameters and bodies come from the endpoints' schemas, so they are always exact.
- Answers come from what each endpoint declares with `response()` or the `properties()` of its resource. Content entries, media, users, tokens and webhooks are declared. An endpoint that declares nothing is typed `Record<string, unknown>`.
- The test suite checks real answers against these declarations, so they stay true.

To type a plugin's answers, give its resource `properties()`, or return a schema from the endpoint's `response()`:

```php
public function response(): ?Schema
{
    return Schema::object([
        'id' => Schema::int(),
        'title' => Schema::string(),
        'stock' => Schema::int()->nullable()->description('null when not tracked'),
    ]);
}
```

Describe one item; for a `List…` endpoint the client types `data` as an array of it. Descriptions appear in the client as comments, so they show up in your editor.

## If something goes wrong

- **"No endpoints belong to plugin:…"**: the plugin is not active, or the slug is misspelled. **Manage plugins** in the admin shows each plugin's slug.
- **A method is missing from the downloaded file**: the download only covers endpoints your role may use. Use `php bin/cms api:client` for the complete file.
- **401 with a token that worked before**: the token expired or was revoked. Create a new one under **Your profile**.
- **403 "insufficient_scope"**: the token lacks a scope the endpoint needs. Each method's comment names the scopes.

Next: [REST API](/developers/rest-api) for authentication, errors and paging, or [Webhooks](/developers/webhooks) to hear about changes instead of asking for them.
