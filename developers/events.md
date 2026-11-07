# Events and filters

Events and filters are how a plugin reacts to what happens in Kestello without changing core code. An **event** says that something happened: a person signed in, an entry was published, a form was sent. A **filter** passes a value through every plugin that wants to change it before Kestello uses it: the HTML in the page head, the Content Security Policy, the password rules. This page covers listening to events (in the request or in the background), model events, offering your own events and filters, and how long a hook keeps working once it is replaced. The [hook reference](/developers/hooks) lists every core event and filter with its properties and arguments. Read this page when your plugin needs to act on something core does.

Register listeners and filters in your provider's `boot()`. See [Providers](/developers/providers).

## Listen to an event

Events are plain PHP objects with public, read-only properties. Listen with `$cms->events->on()`:

```php
use Kestello\Cms\Events\UserRegistered;

public function boot(Cms $cms): void
{
    $cms->events->on(UserRegistered::class, function (UserRegistered $event): void {
        error_log("[notices] new user {$event->userId} via {$event->via}");
    });
}
```

```php
$cms->events->on(string $event, callable|string $listener, int $priority = 0): void
```

| Argument | Meaning |
|---|---|
| `$event` | The event class. A listener also receives events of subclasses and of classes that implement it, so listening to an interface catches every event that implements it. |
| `$listener` | A callable, or the name of a listener class (below). |
| `$priority` | Higher runs first. Listeners with the same priority run in the order they were added. Core listens at `0`. |

Each listener runs as the package that added it, so an exception in it names your plugin in the log. An exception in a listener stops the dispatch and reaches whatever dispatched the event, usually the request. Catch exceptions yourself when your work is optional.

### Listener classes

For more than a few lines, use a class. Kestello creates it through the container, so the constructor can ask for services, and calls `handle()` (or `__invoke()`) with the event:

```php
<?php

declare(strict_types=1);

namespace Plugins\Notices\Listeners;

use Kestello\Cms\Cms;
use Kestello\Cms\Events\EntryPublished;

final class AnnouncePublishedEntry
{
    public function __construct(private readonly Cms $cms) {}

    public function handle(EntryPublished $event): void
    {
        if ($event->type !== 'post' || $event->path === null) {
            return;
        }
        \Plugins\Notices\Models\Notice::create([
            'message' => "New on the site: {$event->title}",
            'tone' => 'info',
            'starts_at' => gmdate('Y-m-d H:i:s'),
            'ends_at' => gmdate('Y-m-d H:i:s', time() + 86400),
        ]);
    }
}
```

```php
$cms->events->on(EntryPublished::class, AnnouncePublishedEntry::class);
```

`handle()` receives only the event. Ask for services in the constructor.

### Run a listener in the background

Mark a listener class with `#[Queued]` and it is pushed to the job queue instead of running during the request:

```php
use Kestello\Framework\Events\Queued;

#[Queued(queue: 'low', delay: 0)]
final class AnnouncePublishedEntry
{
    // as above
}
```

| Argument | Default | Meaning |
|---|---|---|
| `queue` | `'default'` | The queue the job goes to: `high`, `default`, `mail`, `media`, `low` or your own. |
| `delay` | `0` | Seconds to wait before it may run. |

The event is stored as JSON: Kestello reads the value of each constructor parameter from the property with the same name, and rebuilds the event from them in the worker. So a queued event must hold only scalars, `null` and arrays. When it holds an object (`JobFailed` holds the exception, model events hold the model), the listener runs during the request instead, and the log says why:

```text
[queue] Plugins\Notices\Listeners\AnnouncePublishedEntry runs inline: Kestello\Cms\Events\JobFailed cannot be queued (...)
```

In the worker, the listener only runs if it is still registered for that event, so a queued listener of a plugin that was deactivated in the meantime does not run. The job is retried up to 3 times. See [Jobs and scheduling](/developers/jobs).

Use `#[Queued]` for anything slow or that calls another server: sending mail, calling a webhook, resizing. The person who caused the event does not wait for it.

### Stop later listeners

An event class that implements `Kestello\Framework\Events\StoppableEvent` can stop the listeners after the current one. `isPropagationStopped()` is checked after each listener. None of the core events in `Kestello\Cms\Events` are stoppable. The model events that run before a write are.

## Dispatch your own events

Any object is an event. Make it a `final` class with promoted read-only properties that hold plain data, so other plugins can queue their listeners:

```php
<?php

declare(strict_types=1);

namespace Plugins\Notices\Events;

final class NoticePosted
{
    public function __construct(
        public readonly int $noticeId,
        public readonly string $message,
        public readonly ?int $userId,
    ) {}
}
```

```php
$cms->events->dispatch(new NoticePosted((int) $notice->id, (string) $notice->message, $request->userId()));
```

`dispatch()` returns the event, so a listener can fill in values for the code that dispatched it. Store ids rather than objects in events. A listener that needs the row loads it.

Other plugins listen to it like a core event. A plugin that does must list yours in its `dependencies`, so the class exists when it boots.

Declare the event so `hooks:list` shows it to other developers (see [Declare your hooks](#declare-your-hooks)).

## Model events

Models fire events around every write. Listen for one model class with `$cms->models->on()`:

```php
use Kestello\Cms\Content\Entry;
use Kestello\Framework\Database\Orm\Events\Saving;

$cms->models->on(Entry::class, 'saving', function (Saving $event): void {
    if (str_contains((string) $event->model->title, 'lorem ipsum')) {
        $event->cancel('Placeholder text is not allowed.');
    }
});
```

| Event | When | Can cancel |
|---|---|---|
| `saving` | Before any insert or update | Yes |
| `creating` | Before an insert, after `saving` | Yes |
| `updating` | Before an update, after `saving` | Yes |
| `created` | After an insert | No |
| `updated` | After an update | No |
| `saved` | After `created` or `updated` | No |
| `deleting` | Before a delete (soft or hard) | Yes |
| `deleted` | After a delete | No |
| `restoring` | Before a soft-deleted row is restored | Yes |
| `restored` | After it was restored | No |

The event classes are in `Kestello\Framework\Database\Orm\Events` (`Saving`, `Created` and so on), and each has `$event->model`. In a cancellable event, `cancel(string $reason)` stops the write: `save()`, `delete()` or `restore()` returns `false` and later listeners are skipped. `cancelled()` and `reason()` tell the code that saved what happened.

Model events also go through `$cms->events`, so `$cms->events->on(Saved::class, ...)` receives every model's `saved`.

Model events fire for writes through a model (`$model->save()`, `Model::create()`, `$model->delete()`). Queries that update or delete many rows at once (`Notice::query()->where(...)->delete()`) do not load the models and fire no events.

### Extend a model of core or another plugin

`$cms->models->extend()` adds to a model class you do not own:

```php
use Kestello\Cms\Content\Entry;
use Kestello\Framework\Database\Orm\ModelQuery;

$cms->models->extend(Entry::class)
    ->relation('seo', fn(Entry $entry) => $entry->hasOne(SeoMeta::class, 'entry_id'))
    ->scope('titled', fn(ModelQuery $query, string $word) => $query->where('title', 'like', "%{$word}%"))
    ->attribute('title_length', fn(Entry $entry) => mb_strlen((string) $entry->title));

// $entry->seo; Entry::with('seo')->get(); Entry::query()->titled('summer')->get(); $entry->title_length
```

| Method | Adds |
|---|---|
| `relation(string $name, Closure $definition)` | A relation. |
| `scope(string $name, Closure $scope)` | A query scope. |
| `attribute(string $name, Closure $value)` | A computed attribute. |
| `cast(string $column, string $type)` | A cast for a column your migration added. |
| `fillable(string ...$columns)` | Columns that may be mass-assigned. |

Names cannot clash with what the model or another package already defines. The closure given to `relation()` runs in the model's own scope, so it can use the model's `hasOne()`, `hasMany()`, `belongsTo()` and `belongsToMany()` helpers, and it must return the relation they build. Inside the closure, `belongsTo()` takes the relation's name from `relation()`, so the default foreign key is that name plus `_id`; pass the key when your column is named differently (`$entry->belongsTo(Venue::class, 'venue_id')`). `SeoMeta` above stands for a model of your plugin.

## Filters

A filter takes a value, gives it to each callback in turn, and uses what comes back:

```php
$cms->filters->add('security.csp', function (array $directives): array {
    $directives['frame-src'] = "'self' https://www.youtube-nocookie.com";

    return $directives;
});
```

```php
$cms->filters->add(string $name, callable $callback, int $priority = 0): void
$cms->filters->apply(string $name, mixed $value, mixed ...$args): mixed
```

- The callback receives the value and any extra arguments, and must return the value.
- Higher priority runs first. Each callback runs as the package that added it.
- With `app.debug` on, a callback that returns a different type than it received throws `Filter "security.csp" from plugin:notices changed the value type from array to null.` In production the value is passed on as returned, and most core filters then fall back to the value before filtering.

Your plugin can offer filters too. Name them after your slug (`notices.message`) and apply them where the value is used:

```php
$message = (string) $cms->filters->apply('notices.message', $notice->message, $notice->toArray());
```

## Declare your hooks

Kestello keeps a list of every event and filter that code may rely on, with the version it appeared in. `php bin/cms hooks:list` prints it for core and the active plugins, and the [hook reference](/developers/hooks) is generated from core's part of it. Declare the hooks your plugin offers in `boot()`:

```php
use Plugins\Notices\Events\NoticePosted;

$cms->hooks->event(NoticePosted::class, since: '1.0.0', group: 'Notices');

$cms->hooks->filter('notices.message', since: '1.2.0', value: 'string',
    description: 'The text of a notice as shown on the site.',
    arguments: ['array $notice' => 'The notice row.'],
    group: 'Notices');
```

An event's description comes from its class: the first paragraph of the class docblock, and an `@param` line on the constructor for each property. Write them for a developer who has not seen your code:

```php
/**
 * Someone posted a notice. Plain data, so listeners may be #[Queued].
 */
final readonly class NoticePosted
{
    /**
     * @param int $noticeId The notice.
     * @param string $message Its text, before the notices.message filter.
     * @param ?int $userId Who posted it, or null for a scheduled notice.
     */
    public function __construct(public int $noticeId, public string $message, public ?int $userId) {}
}
```

Filter names start with your slug and a dot. A plugin cannot declare core's events or another plugin's filters, and `since` is a version such as `1.2.0`.

| Command | Shows |
|---|---|
| `php bin/cms hooks:list` | Every declared hook. With `--events` or `--filters`, one kind; with `--owner=core` or `--owner=notices`, one package. |
| `php bin/cms hooks:list --json` | The same, with descriptions, properties and arguments. |
| `php bin/cms hooks:list --deprecated` | Deprecated hooks, and which plugins still use them. |
| `php bin/cms hooks:list --markdown` | The reference page as Markdown. |

`hooks:list` also names filters that a plugin adds callbacks to but nothing declares. That is usually a typo (`page.haed`) or a filter of a plugin that is not active, and the callback never runs.

## Compatibility and deprecation

A hook is a promise to every plugin that uses it. Kestello keeps it as follows, and the same rules are the ones we ask of plugins that offer hooks.

- Adding a property to an event, or an argument at the end of a filter's arguments, is not a breaking change. Listeners must not depend on the exact list.
- Renaming, removing, or changing the meaning or type of a hook is breaking. It is done only after the hook was deprecated for at least one minor release before Kestello 1.0, and for one major release after it.
- A deprecated hook keeps working until its removal version. A renamed filter forwards: callbacks added under the old name run as part of the new one, in their usual priority order. A renamed event class stays available under its old name (as a class alias), and listeners on the old name receive the new event.
- Each deprecation states the version it started, the version it ends, and what to use instead. The hook reference shows it, `hooks:list --deprecated` lists the plugins still on the old hook, and **Site Health** warns site owners to update those plugins before they update Kestello.

To deprecate a hook of your own plugin, declare it with `deprecated`:

```php
$cms->hooks->filter('notices.text', since: '1.0.0', value: 'string',
    description: 'The old name of notices.message.',
    deprecated: ['since' => '1.2.0', 'use' => 'notices.message', 'removal' => '2.0.0']);
```

With `use`, callbacks on the old name run as part of the new filter, so keep applying only the new one. The value and arguments of the two must be the same; when they differ, leave out `use` and keep applying the old filter until the removal version.

## Core events and filters

The [hook reference](/developers/hooks) lists them all, generated from the code: every event with its properties, every filter with its value and arguments, and the version each appeared in.

To add tags to the head of every page, prefer `page.head` with the page's nonce for inline scripts, and `seo.head` for meta and link tags.

Kestello also lets you share data with every Vue page without a filter, with a closure that only runs when a page renders:

```php
$cms->pages->share('notices', fn() => Notice::query()->current()->limit(3)->get()->map(fn($n) => $n->toArray())->all());
```

## If something goes wrong

| Message | What it means |
|---|---|
| `Event listener class [Plugins\Notices\Listener] does not exist.` | The class name passed to `on()` is wrong, or the file is not at its PSR-4 path. The error appears when the event is first dispatched. |
| `Listener [Plugins\Notices\Listeners\AnnouncePublishedEntry] needs a handle() or __invoke() method.` | Add `handle()`. |
| `Unknown model event [saveing]; use one of: creating, created, updating, updated, saving, saved, deleting, deleted, restoring, restored.` | A typo in the event name given to `$cms->models->on()`. |
| `[Plugins\Notices\Notice] is not a model.` | `$cms->models->on()` and `extend()` take model classes. |
| `Filter "page.head" from plugin:notices changed the value type from string to null.` | Debug mode only. The callback forgot to `return`. |
| `[queue] ... runs inline: ... cannot be queued (...)` | A `#[Queued]` listener ran during the request because its event holds an object. |
| `[kestello] api.response.users filter removed fields; result ignored.` | Redact values (set them to `null`) instead of removing keys. |
| `Filters declared by plugin:notices start with "notices.", not "page.title".` | `$cms->hooks->filter()` only declares your own filters. To use a core filter, add a callback with `$cms->filters->add()`. |
| `The filter notices.message is already declared by plugin:notices.` | The same hook is declared twice, often in a provider that boots something twice. |
| **Site Health**: "Some plugins or themes use hooks that a later Kestello version removes." | Update the plugins it names, or ask their authors to, before updating Kestello. `hooks:list --deprecated` shows the same list. |
| `Event class [Plugins\Notices\Events\NoticePosted] no longer exists.` | A queued listener's event class was removed or renamed before the job ran. |
| `[Plugins\Notices\Listeners\AnnouncePublishedEntry] is not a queued listener of Kestello\Cms\Events\EntryPublished (is its plugin active?).` | The plugin was deactivated, or the listener lost `#[Queued]`, between queueing and running. |

## Related pages

- [Hook reference](/developers/hooks): every core event and filter.
- [Providers](/developers/providers): where listeners are registered, and how errors are blamed.
- [Jobs and scheduling](/developers/jobs): the queue that runs `#[Queued]` listeners.
- [REST API](/developers/rest-api): extending core resources.
- [Frontend](/developers/frontend): shared page data on the public site.
