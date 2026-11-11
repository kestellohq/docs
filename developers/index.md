<script setup>
const layers = [
    { title: 'Your code', text: 'Never touched by Kestello updates.', items: ['theme', 'plugins'], tone: 'brand' },
    { title: 'Core modules', text: 'Kestello’s own features, built like plugins.', items: ['content', 'media', 'forms', 'backups'] },
    { title: 'Contracts', text: 'Stable interfaces your code depends on.' },
    { title: 'Framework and support', text: 'The kernel, database, cache, queue and plain helpers.', tone: 'muted' },
];
</script>

# Building on Kestello

Kestello is made for developers and agencies who build and look after sites for clients. These pages are for you: extending Kestello with plugins and themes, connecting other systems to it through the API, moving client sites over, or working on Kestello itself. They assume you write PHP 8.4 or newer and know the basics of Vue 3.

Your clients and their editors have the [guide](/guide/), written for people who do not write code. You can send them there.

## What makes Kestello different to build on

**Zero PHP dependencies.** Kestello runs on PHP and its standard extensions only. It brings its own small libraries for what a CMS needs: a database layer with MySQL, PostgreSQL and SQLite grammars, an HTTP client, a mail client, Redis and S3 clients, a zip reader and writer, schema validation (`Kestello\Cms\Api\Schema`), and a support library (`Kestello\Support`) with string, array, date and HTML helpers. Plugins use these, so most plugins need no libraries of their own.

Why: plugins run in the same PHP process as Kestello, so any library Kestello shipped would fix its version for every plugin. With none, a plugin never has to match Kestello's versions. A plugin may only declare classes in its own namespace (the [code check](/developers/packaging#what-the-code-check-refuses) refuses anything else), so a plugin that needs a library prefixes it into that namespace first, with a tool such as PHP-Scoper or Strauss. Two plugins cannot clash over a library either. The sensitive parts use what PHP provides: `password_hash` for passwords, libsodium for signatures and encryption, PDO for databases and curl for HTTP. Composer still works for your tools: the repository's `composer.json` has no requirements and maps the `Kestello\` namespace, so PHPStan, your editor and Composer's own autoloader find the classes. A site never uses it: Kestello loads its classes with its own autoloader (`core/bootstrap.php`), so a site has no `vendor/` folder to install or update.

**Vue is the one exception, on purpose.** The rule is about PHP, where everything shares one process. Vue 3 runs in the browser, and Kestello ships it as one pinned, prebuilt file inside each release, so installing a site still needs nothing but PHP: no Node.js, no `npm install` on the server. Plugins and themes do not bundle their own copy. Their built files use the one copy the site serves, so they never disagree about the version either.

**Everything is a plugin or a theme.** There is no folder in a site where you edit Kestello's own code. Site-specific code goes in a plugin made for that site. Updates replace Kestello's code and never touch yours.

**Core is built the way plugins are built.** Kestello's own features (content, media, forms, backups) are modules that use the same service providers, events, filters, admin pages and API endpoints that plugins use. If core can do it, a plugin can.

<Layers :layers="layers" caption="Where your code sits: each layer uses only those below it. See Architecture." />

**The admin uses only the public API.** Every screen in the admin talks to `/api/v1`. An integration with an API token can do what the admin does, within the token's scopes. The exceptions are a few sensitive actions, such as installing plugins, restoring backups and applying updates, which need a person who signed in recently.

**Vue is the only templating layer.** Pages, the admin, the installer and themes are Vue single-file components, compiled ahead of time. PHP controllers return `Page::render('component', $props)`. There is no PHP template language.

**Plugins declare what they do.** A plugin's manifest lists the hosts it connects to, the core services it replaces and the other permissions it needs. Site owners see that list before installing. Where Kestello can check a permission at runtime, it does: a plugin's HTTP requests can only reach the hosts it declared, and only a plugin that declared it may add a sign-in method.

## Where to start

| You want to | Read |
|---|---|
| Understand how the pieces fit | [Architecture](/developers/architecture) |
| Find your way around the repository and a site | [Folders and files](/developers/layout) |
| Run Kestello on your machine | [Local development](/developers/local-development) |
| Look up a command | [Command line](/developers/cli) |
| Write your first plugin | [Build your first plugin](/developers/plugin-tutorial) |
| Look up a plugin.json key | [The manifest](/developers/manifest) |
| Add tables | [Migrations](/developers/migrations) |
| Add screens and settings to the admin | [Admin pages](/developers/admin-pages) and [Settings](/developers/settings) |
| React to what happens on the site | [Events and filters](/developers/events) |
| Run work in the background or on a schedule | [Background jobs](/developers/jobs) |
| Build a theme | [Themes](/developers/themes) and [Rendering and caching](/developers/frontend) |
| Connect another system | [REST API](/developers/rest-api) |
| Ship a plugin or theme to other sites | [Packaging and signing](/developers/packaging) |
| Run Kestello in production | [Configuration reference](/developers/configuration) and [Deployment](/developers/deployment) |
| Move a client's site from WordPress | [Moving from WordPress](/guide/import-wordpress) and [`import:wordpress`](/developers/cli#import) |
