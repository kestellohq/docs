<script setup>
const verify = [
    { title: 'Read the header', text: 'Take t and every v1 value from Kestello-Signature.' },
    { title: 'Check the time', text: 't within 5 minutes of your clock.', fail: 'Refuse it: it may be a replay.' },
    { title: 'Compute', text: 'HMAC-SHA256 of "<t>.<raw body>" with the webhook’s secret, as hex.', tone: 'brand' },
    { title: 'Compare', text: 'With each v1 value, in constant time. One match is enough: after a rotation there are two, for 24 hours.', fail: 'No match: refuse it.' },
];
const retries = [
    { at: 'At once', title: 'Attempt 1', text: 'A job on the queue, soon after the event.' },
    { at: '+1 min', title: 'Attempt 2' },
    { at: '+5 min', title: 'Attempt 3' },
    { at: '+30 min', title: 'Attempt 4' },
    { at: '+2 h', title: 'Attempt 5' },
    { at: '+6 h', title: 'Attempt 6' },
    { at: '+12 h', title: 'Attempt 7', text: 'About 21 hours after the first.' },
    { at: 'If it fails too', title: 'Given up', text: 'After 10 deliveries in a row give up, the webhook is turned off.', tone: 'danger' },
];
</script>

# Webhooks

Kestello sends a signed HTTP POST to other services when something happens on the site. This page is for two kinds of developers: those writing a service that receives Kestello webhooks, and plugin authors who want to offer their own events. Site owners set webhooks up in the admin; see [Webhooks](/guide/webhooks).

## The message

Each delivery is a `POST` with a JSON body:

```json
{
    "id": "evt_019a5e4c2b7a7c3e9f1d2a4b6c8e0f12",
    "type": "entry.published",
    "created_at": "2027-01-04T10:00:00Z",
    "data": {
        "id": 42,
        "type": "post",
        "title": "Hello",
        "slug": "hello",
        "status": "published",
        "path": "/blog/hello",
        "url": "https://example.com/blog/hello",
        "api": "/api/v1/content/post/entries/42",
        "author": { "id": 1, "username": "ana" },
        "published_at": "2027-01-04T10:00:00Z",
        "updated_at": "2027-01-04T10:00:00Z",
        "trashed_at": null
    }
}
```

And these headers:

| Header | Value |
|---|---|
| `Kestello-Signature` | `t=<unix seconds>,v1=<hex>`. See below. |
| `Kestello-Event` | The event name, such as `entry.published`. |
| `Kestello-Event-Id` | Same as `id` in the body. A redelivery keeps it, so use it to ignore duplicates. |
| `Kestello-Delivery` | This delivery's number. Retries of a delivery keep it; **Send again** makes a new one. |
| `User-Agent` | `Kestello-Webhooks/1` |

Bodies larger than 256 KB are sent without their `data` (it becomes `{"truncated": true, ...}`). Fetch the record through the [REST API](/developers/rest-api) instead.

## Core events

| Event | `data` |
|---|---|
| `entry.created` | The entry, as above. |
| `entry.updated` | The entry. Sent on every later save. |
| `entry.published` | The entry. Also sent when a scheduled entry reaches its time. |
| `entry.trashed` | The entry, with `trashed_at` set. |
| `entry.submitted` | The entry, with status `pending`. |
| `form.submitted` | `form` (`id`, `title`), `submission_id` (null if the form does not store answers) and `answers`. |
| `user.registered` | `id`, `username`, `email`, `role` and `via` (`admin`, or `external:<provider>`). |
| `user.deleted` | `id`, `username`, `email` and `via` (`self`, `admin` or `cli`): who deleted the account. |
| `webhook.ping` | Sent only by **Send a test**. |

## Check the signature

Always check the signature before trusting a message. Compute HMAC-SHA256 of `<t>.<raw body>` with the webhook's secret, and compare it with each `v1` value in the header. Right after a secret is rotated there are two `v1` values, one per secret; one match is enough. Refuse messages whose `t` is more than 5 minutes from your clock, so a captured message can't be replayed later.

<Flow :steps="verify" caption="How a receiver checks a Kestello signature" />

Use the raw body exactly as received. Parsing and re-encoding the JSON changes it and the signature no longer matches.

In plain PHP:

```php
<?php
$secret = getenv('KESTELLO_WEBHOOK_SECRET');
$body = file_get_contents('php://input');
$header = $_SERVER['HTTP_KESTELLO_SIGNATURE'] ?? '';

function kestello_verify(string $header, string $body, string $secret, int $tolerance = 300): bool
{
    $t = null;
    $signatures = [];
    foreach (explode(',', $header) as $part) {
        [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
        if ($key === 't' && ctype_digit($value)) {
            $t = (int) $value;
        } elseif ($key === 'v1') {
            $signatures[] = $value;
        }
    }
    if ($t === null || abs(time() - $t) > $tolerance) {
        return false;
    }
    $expected = hash_hmac('sha256', $t . '.' . $body, $secret);
    foreach ($signatures as $signature) {
        if (hash_equals($expected, $signature)) {
            return true;
        }
    }
    return false;
}

if (!kestello_verify($header, $body, $secret)) {
    http_response_code(400);
    exit;
}
$event = json_decode($body, true);
// … handle $event['type'] …
http_response_code(204);
```

In Node.js (with Express, reading the raw body):

```js
import crypto from 'node:crypto';
import express from 'express';

const secret = process.env.KESTELLO_WEBHOOK_SECRET;

export function kestelloVerify(header, rawBody, secret, tolerance = 300) {
    let t = null;
    const signatures = [];
    for (const part of String(header).split(',')) {
        const [key, value = ''] = part.trim().split('=', 2);
        if (key === 't' && /^\d+$/.test(value)) t = Number(value);
        else if (key === 'v1') signatures.push(value);
    }
    if (t === null || Math.abs(Date.now() / 1000 - t) > tolerance) return false;
    const expected = Buffer.from(crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex'));
    return signatures.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), expected));
}

const app = express();
app.post('/kestello', express.raw({ type: 'application/json' }), (req, res) => {
    if (!kestelloVerify(req.get('Kestello-Signature'), req.body.toString('utf8'), secret)) {
        return res.sendStatus(400);
    }
    const event = JSON.parse(req.body);
    // … handle event.type …
    res.sendStatus(204);
});
app.listen(3000);
```

A Kestello site or plugin receiving webhooks from another Kestello site can use `Kestello\Cms\Webhooks\Signature::verify($header, $body, $secret)`.

## Answer quickly

Answer with a 2xx status within 10 seconds (`webhooks.timeout`). Do slow work after answering, in your own queue. Anything else counts as a failure:

- Other statuses, timeouts and connection errors are retried after 1, 5 and 30 minutes, then 2, 6 and 12 hours: seven attempts in all. Each wait counts from the attempt before.
- Redirects are not followed and count as failures.
- An address that is not allowed (`http://` or a private network, without `webhooks.allow_private`) is not retried.
- After 10 deliveries in a row give up, the webhook is turned off and administrators are told.

<Timeline :points="retries" caption="One delivery that keeps failing, attempt by attempt" />

The same event can arrive more than once, for example when your answer was lost on the way. Use `Kestello-Event-Id` to skip messages you have already handled. Events can also arrive out of order; compare `created_at` or fetch the current record from the API when order matters.

## Offer events from a plugin

Name the event `<your-plugin-slug>.<event>` and offer it once in your provider's `boot()`. Then send it whenever it happens:

```php
public function boot(Cms $cms): void
{
    $cms->webhooks->event('acme-shop.order-paid', 'An order was paid', 'Shop', 'data: order id and total.');

    $cms->events->on(OrderPaid::class, static function (OrderPaid $e) use ($cms): void {
        $cms->webhooks->dispatch('acme-shop.order-paid', ['order' => $e->orderId, 'total' => $e->total]);
    });
}
```

- `event(name, label, group, description)` adds it to the list site owners pick from. A name that doesn't start with your slug throws a `LogicException`.
- `dispatch(name, data)` queues one delivery for each active webhook that subscribed, and returns the event id, or null when no webhook wants it. It does not wait for the network. Only the plugin that offered an event can send it.
- Keep `data` small and leave out secrets. Send ids and the few fields a receiver needs to decide what to do; it can fetch the rest through your API endpoints.

The example catalog plugin sends `catalog.stock-low` this way ([`CatalogProvider.php`](https://github.com/kestellohq/examples/tree/main/plugins/catalog/src/CatalogProvider.php)).

## The API

Webhooks can be managed through the REST API with the `webhooks:manage` scope and the `webhooks.manage` capability.

| Method and path | What it does |
|---|---|
| `GET /webhooks/events` | The events webhooks can subscribe to. |
| `GET /webhooks` | All webhooks. Secrets are never included. |
| `POST /webhooks` | Add one: `name`, `url`, `events` (names, or `["*"]`), `active`. The answer includes `secret`, once. |
| `GET /webhooks/{id}` | One webhook. |
| `PATCH /webhooks/{id}` | Change any of the fields above. |
| `DELETE /webhooks/{id}` | Delete it and its delivery log. |
| `POST /webhooks/{id}/secret` | A new secret, shown once. The old one keeps signing for 24 hours. |
| `POST /webhooks/{id}/ping` | Send `webhook.ping` now and answer with the delivery. |
| `GET /webhooks/{id}/deliveries` | The delivery log, newest first. Filter with `status`; page with `before_id`. |
| `POST /webhooks/{id}/deliveries/{delivery}/redeliver` | Send a delivery's message again now. |

Adding a webhook, changing one and rotating its secret need a recent password entry when you are signed in through the admin.

## Configuration

`config/webhooks.php`:

| Key | Default | Meaning |
|---|---|---|
| `webhooks.timeout` | `10` | Seconds to wait for the receiver to answer. |
| `webhooks.allow_private` | `false` | Allow `http://` and addresses on private networks. Turn it on only for local development, for example to send to a receiver on your own machine. |

Deliveries run on the `default` queue, one attempt per job. The `webhooks.retry` task (every minute) queues retries that are due, and `webhooks.prune` (daily at 03:40) deletes deliveries older than 30 days. Both need the [scheduler](/developers/jobs) running.
