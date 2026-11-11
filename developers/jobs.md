<script setup>
const jobStates = [
    { id: 'waiting', title: 'Waiting', text: 'In its queue, possibly with a delay.' },
    { id: 'running', title: 'Running', text: 'A worker reserved it and runs handle().' },
    { id: 'done', title: 'Done', text: 'Removed from the queue.', tone: 'brand' },
    { id: 'failed', title: 'Failed', text: 'In the failed_jobs table, with its exception.' },
    { id: 'gone', title: 'Deleted', tone: 'muted' },
];
const jobMoves = [
    { from: 'waiting', to: 'running', label: 'A worker takes it', note: 'queues in order: high, default, mail, media, low' },
    { from: 'running', to: 'done', label: 'handle() returns' },
    { from: 'running', to: 'waiting', label: 'handle() throws, attempts left', note: 'back after backoff()' },
    { from: 'running', to: 'waiting', label: 'ReleaseJob', note: 'no attempt used' },
    { from: 'running', to: 'failed', label: 'The last attempt throws', note: 'JobFailed is dispatched' },
    { from: 'failed', to: 'waiting', label: 'Retry', note: 'Background jobs screen, or queue:retry' },
    { from: 'failed', to: 'gone', label: 'Delete', note: 'or queue:forget, or after 30 days' },
];
const retries = [
    { at: 'At once', title: 'Attempt 1' },
    { at: '10 s later', title: 'Attempt 2' },
    { at: '20 s later', title: 'Attempt 3' },
    { at: '40 s later', title: 'Attempt 4', text: 'The last one with the default retries() of 3.' },
    { at: 'If it throws again', title: 'Failed', text: 'Moved to failed_jobs.', tone: 'danger' },
];
const chainOrBatch = [
    { title: 'Chain', items: ['One job after another', 'The next is queued when the one before succeeded', 'A failure drops the rest', '`$cms->queue->chain([...])`'] },
    { title: 'Batch', items: ['Every job at once, in parallel', 'then(), catch() and finally() jobs', 'A failure cancels the jobs not started, unless allowFailures()', '`$cms->queue->batch([...])->dispatch()`'] },
];
const running = [
    { title: 'A trigger', text: 'Every minute: a system cron line, an external service calling POST /system/cron, or the web runner after a page was sent.' },
    { title: 'schedule:run', text: 'Runs the due tasks one after another, each claimed in the database so it runs once.' },
    { title: 'queue.work', text: 'The core task works the queue for up to 50 seconds, reading high, default, mail, media and low in that order.', tone: 'brand', note: 'Not registered when queue.worker is daemon: a queue:work process does this instead.' },
];
</script>

# Jobs and scheduling

A job is work that runs in the background instead of while a visitor waits: sending mail, calling a slow API, resizing images, cleaning up old rows. Scheduled tasks are work that runs on a clock: every night at four, every fifteen minutes on weekdays. This page covers writing a job, pushing it, retries and timeouts, unique jobs, chains and batches, job middleware, the scheduler, and how workers, cron and the web runner execute everything. Read it when your plugin does anything that takes more than a moment, or anything that must happen regularly.

![The Background jobs screen: waiting and failed jobs, and whether a worker is active.](/screenshots/background-jobs.png)

## Write a job

A job is a class that implements `Kestello\Contracts\Queue\Job` and has a `handle()` method:

```php
<?php

declare(strict_types=1);

namespace Plugins\Notices\Jobs;

use Kestello\Contracts\Queue\Job;
use Plugins\Notices\Models\Notice;

final class PruneNotices implements Job
{
    public function __construct(public readonly int $days = 30) {}

    public function retries(): int { return 2; }

    public function backoff(int $attempt): int { return 300 * $attempt; }

    public function timeout(): int { return 120; }

    public function uniqueKey(): ?string { return "notices:prune:{$this->days}"; }

    public function handle(): void
    {
        $cutoff = gmdate('Y-m-d H:i:s', time() - $this->days * 86400);
        Notice::query()->where('ends_at', '<', $cutoff)->delete();
    }
}
```

Two rules come from how jobs are stored. A job waits in a queue as JSON: its class name and its constructor arguments.

1. **Constructor arguments must be plain data**: scalars, `null`, or arrays of those. Pass ids, not models: the row may change before the job runs, and the job should load the current one.
2. **Each constructor argument must be readable as a public property with the same name.** Promoted `public readonly` parameters, as above, do that.

`handle()` can ask for services by type, and Kestello passes them from the container:

```php
use Kestello\Cms\Cms;
use Kestello\Framework\Events\EventDispatcher;

public function handle(Cms $cms, EventDispatcher $events): void
{
    // ...
}
```

### Optional methods

| Method | Default | Meaning |
|---|---|---|
| `retries(): int` | `3` | How many more times to try after the first attempt fails. `0` means one attempt only. |
| `backoff(int $attempt): int` | `10 * 2^(attempt - 1)`, at most `3600` | Seconds to wait before retry number `$attempt` (10, 20, 40...). |
| `timeout(): int` | `60` | Seconds one attempt may take. |
| `uniqueKey(): ?string` | `null` | While a job with this key is waiting or running, pushing another one with the same key does nothing. |
| `middleware(): array` | `[]` | Job middleware that wraps `handle()` (see below). |

The timeout is enforced with `pcntl_alarm()` where the `pcntl` extension is loaded (it usually is on the command line). A job that runs over its timeout ends the worker process, and the attempt counts as failed. Without `pcntl`, the timeout is not enforced, but a job that stays reserved too long is given to another worker.

### Register the job class

Only registered job classes run. Register each class once, in `boot()`:

```php
$cms->queue->job(PruneNotices::class);
```

The job then runs as your plugin, whatever the queue row says. A queue row cannot make Kestello create any other class, and a deactivated plugin's jobs stop running: they fail with `Job class [...] is not registered (is its plugin active?).`

## Push a job

```php
$id = $cms->queue->push(new PruneNotices(30));
$cms->queue->push(new PruneNotices(7), delay: 600, queue: 'low');
```

```php
$cms->queue->push(Job $job, int $delay = 0, ?string $queue = null): ?string
```

It returns the job id. It returns `null` when an identical unique job is already pending, or when the queue driver is `sync` and the job already ran.

Outside the provider, get `$cms` with `Kestello\Cms\Cms::instance()`, or ask for `Kestello\Cms\Queue\JobQueue` in a constructor or `handle()` method.

### Queues

Every job goes to a named queue. Workers take jobs from the queues in this order:

| Queue | For |
|---|---|
| `high` | Work a person is waiting to see the result of. |
| `default` | Everything else. Used when you do not name a queue. |
| `mail` | Sending mail and notifications. |
| `media` | Image resizing and other file work. |
| `low` | Cleanup, reports, reindexing. |

A queue name of your own is allowed (`^[a-z0-9][a-z0-9_-]{0,49}$`), but the default worker only reads the five above. A worker started with `--queue=notices,default` reads yours.

### Unique jobs

With a `uniqueKey()`, a second push with the same key while the first job is waiting or running is skipped and returns `null`. When the job finishes (or fails for good), the key is free again. Include the arguments that matter in the key: `"notices:prune:{$this->days}"`, not `"prune"`. Unique keys are ignored for jobs inside a batch.

## Retries and failures

When `handle()` throws:

1. If attempts are left, the job goes back in its queue with the `backoff()` delay. The log says `[queue] Plugins\Notices\Jobs\PruneNotices attempt 1/3 failed, will retry: <message>`.
2. When the last attempt fails, the job is moved to the `failed_jobs` table with the exception, the `JobFailed` event is dispatched, and the log says `[queue] Plugins\Notices\Jobs\PruneNotices failed for good (owner plugin:notices): <message>`.

<States :states="jobStates" :moves="jobMoves" caption="The life of a job" />

With the defaults, a job that keeps throwing runs four times before it fails:

<Timeline :points="retries" caption="Attempts of a job with the default retries() and backoff()" />

A job whose worker crashed or was killed counts as an attempt too. After too many, it fails with `Exceeded N attempts (the worker may have crashed or timed out).`

Failed jobs show on the **Background jobs** screen, where they can be retried or deleted, and on the command line:

```bash
php bin/cms queue:failed
php bin/cms queue:failed 42
php bin/cms queue:retry 42
php bin/cms queue:retry all
php bin/cms queue:forget all
```

Failed jobs are deleted after 30 days, or the number of days in the config key `queue.failed_retention_days`, by the core task `queue.prune-failed` every night at 03:20.

Write `handle()` so that running it twice does no harm. A retry after a partial failure, or after a worker died, runs it again from the start.

## Chains and batches

A chain and a batch both group jobs. A chain is for steps that depend on each other; a batch is for many independent pieces of one task.

<Compare :columns="chainOrBatch" caption="A chain and a batch side by side" />

### Chains

A chain runs jobs one after another. Each one is queued when the one before succeeded:

```php
$cms->queue->chain([
    new ImportRows($fileId),
    new RebuildIndex(),
    new NotifyImportDone($userId),
], queue: 'low');
```

If a job in the chain fails for good, the jobs after it are dropped, and the log says `[queue] ... failed; dropped 2 chained job(s).`

### Batches

A batch runs many jobs in parallel and tracks them as one:

```php
$batchId = $cms->queue->batch([
    new ResizeImage(10),
    new ResizeImage(11),
    new ResizeImage(12),
])
    ->name('Resize gallery')
    ->then(new NotifyResizeDone($userId))
    ->catch(new NotifyResizeFailed($userId))
    ->finally(new UnlockGallery($galleryId))
    ->onQueue('media')
    ->dispatch();
```

| Method | Meaning |
|---|---|
| `name(string $name)` | Shown on the **Background jobs** screen. |
| `then(Job $job)` | Queued when every job succeeded. With `allowFailures()`, when every job finished. |
| `catch(Job $job)` | Queued once, at the first job that fails for good. |
| `finally(Job $job)` | Queued when the batch is over, in every case. |
| `allowFailures(bool $allow = true)` | Without it, the first failure cancels the jobs that have not started. With it, the others carry on. |
| `onQueue(string $queue)` | The queue for every job in the batch. |
| `dispatch(): string` | Queues the jobs and returns the batch id. |

The callback jobs are ordinary jobs and must be registered too. Each job in a batch is counted once, even when it is retried.

## Job middleware

Middleware wraps a job's `handle()`. List it in `middleware()`:

```php
use Kestello\Cms\Queue\Middleware\RateLimited;
use Kestello\Cms\Queue\Middleware\WithoutOverlapping;

public function middleware(): array
{
    return [
        new RateLimited('notices-feed', max: 10, perSeconds: 60),
        new WithoutOverlapping("notices:import:{$this->feedId}"),
    ];
}
```

| Middleware | Effect |
|---|---|
| `RateLimited(string $key, int $max, int $perSeconds = 60)` | At most `$max` jobs with this key start per `$perSeconds`, across all workers. Jobs over the limit wait for the next window. |
| `WithoutOverlapping(string $key, int $releaseAfter = 10, int $expiresAfter = 300)` | One job with this key runs at a time. The others wait `$releaseAfter` seconds and try again. The lock expires after `$expiresAfter` seconds in case a worker dies holding it. |

Both keep their counts and locks in the cache, so with several servers the cache driver must be shared (Redis, or the database). Neither uses up an attempt when it makes a job wait.

You can write your own middleware by implementing `Kestello\Contracts\Queue\JobMiddleware`: call `$next($job)` to continue, throw `Kestello\Cms\Queue\ReleaseJob` to put the job back for later without using an attempt, or throw anything else to fail the attempt:

```php
use Closure;
use Kestello\Cms\Queue\ReleaseJob;
use Kestello\Contracts\Queue\Job;
use Kestello\Contracts\Queue\JobMiddleware;

final class OnlyAtNight implements JobMiddleware
{
    public function handle(Job $job, Closure $next): void
    {
        $hour = (int) gmdate('G');
        if ($hour >= 6 && $hour < 22) {
            throw new ReleaseJob(delay: 3600, reason: 'Waiting for the night.');
        }
        $next($job);
    }
}
```

`handle()` of a job can throw `ReleaseJob` itself too. On the `sync` driver, a released job is skipped and logged.

## Schedule tasks

Register scheduled tasks in `boot()` with `$cms->schedule`:

```php
use Plugins\Notices\Jobs\PruneNotices;

$cms->schedule->job(new PruneNotices(30))->dailyAt('04:00');

$cms->schedule->call(function () use ($cms): void {
    // check the feed
}, 'notices.check-feed')->everyFifteenMinutes()->between('08:00', '18:00')->withoutOverlapping(10);

$cms->schedule->command('notices:report --short')->weekdays()->at('07:30');
```

| Method | Runs | Name |
|---|---|---|
| `job(Job $job, ?string $name = null)` | Pushes the job to the queue when due. The job class must be registered. | Defaults to the class name in kebab case, prefixed with your slug: `notices.prune-notices`. |
| `call(Closure $callback, string $name)` | Calls the closure in the scheduler process. | Required. |
| `command(string $commandLine, ?string $name = null)` | Runs a `bin/cms` command in the scheduler process. | Defaults to the command line. |

Task names of plugins must start with `<slug>.` or `<slug>:`. Prefer `job()` for anything that takes more than a few seconds: the scheduler runs tasks one after another, and a slow closure delays the rest.

### Frequency

| Method | Cron expression |
|---|---|
| `cron(string $expression)` | Any five-field cron expression. |
| `everyMinute()` | `* * * * *` |
| `everyTwoMinutes()`, `everyFiveMinutes()`, `everyTenMinutes()`, `everyFifteenMinutes()`, `everyThirtyMinutes()` | `*/2 * * * *` and so on |
| `hourly()` | `0 * * * *` |
| `hourlyAt(int $minute)` | `<minute> * * * *` |
| `daily()` | `0 0 * * *` |
| `dailyAt(string $time)`, `at(string $time)` | `<m> <h> * * *` from `'HH:MM'` |
| `weekly()` | `0 0 * * 0` |
| `weeklyOn(int $day, string $time = '00:00')` | On a weekday (0 is Sunday) |
| `monthly()` | `0 0 1 * *` |
| `monthlyOn(int $day, string $time = '00:00')` | On a day of the month |
| `yearly()` | `0 0 1 1 *` |
| `weekdays()`, `weekends()`, `days(string $days)` | Limits the day-of-week field: `1-5`, `0,6`, or your own |

Methods combine: `weekdays()->at('07:30')` is `30 7 * * 1-5`.

### Conditions and options

| Method | Effect |
|---|---|
| `timezone(string $tz)` | Read the times in this time zone. The default is the site's time zone. |
| `between(string $start, string $end)` | Only run between two times. `between('22:00', '06:00')` wraps past midnight. |
| `when(Closure $condition)` | Only run when the closure returns `true`. |
| `withoutOverlapping(int $minutes = 1440)` | Skip a run while the previous one is still going. The lock expires after `$minutes`. |
| `onOneServer()` | Accepted for familiarity; every task already runs on one server only, because each due time is claimed in the database. |
| `description(string $text)` | Shown on the **Scheduled tasks** screen. |

### Results and commands

Each run is recorded as `ok`, `failed` or `skipped`, with a reason such as `Conditions not met.`, `The previous run is still going.` or `Out of time in this run.` The **Scheduled tasks** screen shows the last runs and lets an administrator pause a task.

| Command | Does |
|---|---|
| `schedule:list` | Every task with its schedule, next run and last result. |
| `schedule:test <name>` | Runs one task now. |
| `schedule:run` | Runs the tasks that are due. This is what cron calls every minute. |
| `schedule:work` | Runs `schedule:run` every minute in the foreground, for development. |
| `schedule:enable <name>`, `schedule:disable <name>` | Resumes or pauses a task. |

## How jobs and tasks run

Kestello runs on any host, including shared hosting without shell access, so there are several ways for background work to happen. They all go through the same scheduler, which also runs the queue.

<Flow :steps="running" caption="How a minute of background work starts" />

| Setup | How it works |
|---|---|
| **Cron** (recommended) | A system cron line runs `* * * * * php /path/to/site/bin/cms schedule:run`. The core task `queue.work` then works the queue for up to 50 seconds in every run. |
| **A long-running worker** | `php bin/cms queue:work` under a process manager (systemd, Supervisor). Set the config key `queue.worker` to `daemon` so the scheduler stops starting its own worker. Cron still runs `schedule:run`. |
| **An external cron service** | `php bin/cms cron:token` prints a token. A service calls `POST /system/cron` with it every minute, as `Authorization: Bearer <token>` or `X-Cron-Token`. |
| **The web runner** | With no cron at all, Kestello runs due tasks after a page response has been sent to a visitor, at most once a minute. Needs PHP-FPM or LiteSpeed. |

The web runner is controlled by config keys in `config/cron.php`:

| Key | Default | Meaning |
|---|---|---|
| `cron.web_runner` | `'auto'` | `'auto'` runs only if no real cron ran in the last five minutes. `true` always runs, `false` never. |
| `cron.web_runner_seconds` | `20` | How long one web run may take, 5 to 55 seconds. |
| `cron.http_seconds` | `25` | How long one `POST /system/cron` run may take. |

`queue.worker` and `queue.failed_retention_days` live in `config/queue.php`. A config key `group.name` is read from `config/<group>.php`, which returns an array. See [Configuration](/developers/configuration).

### Queue drivers

The driver is chosen on the **Infrastructure** screen:

| Driver | Behaviour |
|---|---|
| `database` | The default. Jobs wait in the `jobs` table. Works everywhere, with any number of workers. |
| `redis` | Jobs wait in Redis. If Redis refuses a push, the job goes to the database instead and the failure is logged, so no job is lost. The Redis server must persist to disk (`appendonly yes`). |
| `sync` | Jobs run inside the request that pushes them, without delay. For development only: it slows pages down, and `queue:work` has nothing to do. |

### The worker

```bash
php bin/cms queue:work --queue=high,default --max-time=3600 --memory=256
```

| Option | Default | Meaning |
|---|---|---|
| `--queue=` | `high,default,mail,media,low` | Queues to read, in priority order. |
| `--stop-when-empty` | off | Exit when there is nothing to do. |
| `--max-jobs=N` | no limit | Exit after N jobs. |
| `--max-time=S` | no limit | Exit after S seconds. |
| `--memory=MB` | `128` | Exit when memory use passes this. |
| `--sleep=S` | `3` | Seconds to wait when the queues are empty. |

The worker exits cleanly on `SIGTERM` or `SIGINT` (after the current job), at a limit above, or when asked to by `queue:restart`. A process manager starts it again. Run `queue:restart` after every deploy, so workers load the new code.

```text
  Stopped (max time): 120 done, 2 to retry, 0 failed.
```

Before each job the worker reloads settings, so changes made in the admin apply to the next job. It writes a heartbeat that the **Background jobs** screen and `queue:monitor` show.

While a backup is being restored, workers and the scheduler pause and wait. They carry on when the restore is over.

## If something goes wrong

| Message | What it means |
|---|---|
| `Register [Plugins\Notices\Jobs\PruneNotices] with $cms->queue->job() before pushing it.` | Call `$cms->queue->job()` in `boot()`. |
| `Plugins\Notices\Jobs\PruneNotices: job arguments must be scalars, null or arrays (store ids, not objects).` | A constructor argument is an object. Pass its id. |
| `Plugins\Notices\Jobs\PruneNotices must expose constructor argument $days as a property.` | Make the parameter `public readonly`. |
| `Job [Plugins\Notices\Jobs\PruneNotices] has no handle() method.` | Add `handle()`. |
| `Job [Plugins\Notices\Jobs\PruneNotices] is already registered by plugin:other.` | Two packages register the same class. |
| `Invalid queue name [Notices].` | Queue names are lowercase letters, digits, `_` and `-`. |
| `Job class [Plugins\Notices\Jobs\PruneNotices] is not registered (is its plugin active?).` | The job was queued, then its plugin was deactivated or the registration removed. |
| `Cannot inject $client into Plugins\Notices\Jobs\PruneNotices::handle().` | A `handle()` parameter has no type the container can build. |
| `Exceeded 4 attempts (the worker may have crashed or timed out).` | The job kept ending its worker. Check its timeout and memory use. |
| `[queue] ... exceeded its 120s timeout; worker exiting.` | Raise `timeout()` or split the work. |
| `plugin:notices task names must start with "notices." or "notices:", got [report].` | Name your scheduled tasks after your slug. |
| `Task [notices.bad]: invalid cron expression "61 * * * *".` | Fix the expression. |
| `Task [notices.digest]: invalid time "25:00".` | Times are `HH:MM`, 24-hour. |
| `Task [notices.prune-notices] is already scheduled by plugin:notices.` | Two tasks have the same name. Pass a name as the second argument of `job()`. |
| `The queue driver is "sync": jobs run when pushed, there is nothing to work on.` | Shown by `queue:work` with the `sync` driver. |
| Jobs wait and never run | Nothing runs the scheduler or a worker. Check the **Background jobs** screen for the last heartbeat, and set up cron. |

## Related pages

- [Events and filters](/developers/events): `#[Queued]` listeners use the same queue.
- [Settings](/developers/settings): reading settings in long-running processes.
- [Deployment](/developers/deployment): cron, workers and process managers in production.
- [Configuration](/developers/configuration): `config/queue.php` and `config/cron.php`.
- [Command line](/developers/cli): every `queue:` and `schedule:` command.
