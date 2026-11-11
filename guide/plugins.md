<script setup>
const statuses = [
    { id: 'inactive', title: 'Inactive', text: 'Installed but switched off. Its data is kept.', tone: 'muted' },
    { id: 'active', title: 'Active', text: 'Switched on and running.', tone: 'brand' },
    { id: 'suspended', title: 'Suspended', text: 'Kestello stopped it after it crashed the site.' },
    { id: 'failed', title: 'Failed to start', text: 'Something it needs is missing.' },
];
const moves = [
    { from: 'inactive', to: 'active', label: 'Activate', note: 'after a trial start' },
    { from: 'active', to: 'inactive', label: 'Deactivate' },
    { from: 'active', to: 'suspended', label: 'An error while it starts or runs', note: 'Kestello' },
    { from: 'active', to: 'failed', label: 'Something it needs goes missing', note: 'another plugin, Kestello version, PHP extension' },
    { from: 'suspended', to: 'inactive', label: 'Deactivate', note: 'clears the suspension' },
    { from: 'failed', to: 'inactive', label: 'Deactivate' },
];
const seal = {
    question: 'What does the review say about who vouches for the zip?',
    answers: [
        { label: 'Published by … in the Kestello registry', result: 'Installs from the admin.', tone: 'brand', link: '#add-a-plugin-from-the-registry' },
        { label: 'Signed by …, a publisher this site trusts', result: 'Installs from the admin.', tone: 'brand', link: '#trusting-a-publisher' },
        {
            label: 'Signed with a key this site does not trust, or Not signed',
            next: {
                question: 'Is app.packages.admin_unsigned on?',
                answers: [
                    { label: 'Yes', result: 'Installs from the admin. Meant for development sites.', link: '#allowing-unsigned-plugins-in-the-admin' },
                    { label: 'No', result: 'Installs from the command line, or as a folder uploaded by FTP.', tone: 'muted', link: '#installing-an-unsigned-plugin-on-the-server' },
                ],
            },
        },
        { label: 'Changed after it was signed, or refused by the registry', result: 'Never installs, from anywhere.', tone: 'danger' },
    ],
};
const install = [
    { title: 'Upload a plugin', text: 'Choose the zip, then Upload and review. Nothing is installed yet.' },
    { title: 'Review', text: 'Who vouches for it, What it may do, and the Code check.', note: 'Valid for an hour.' },
    { title: 'Install', text: 'The files are put in place.', tone: 'brand' },
    {
        title: 'Trial start',
        text: 'With Activate it after installing on: its tables are made and it starts once. Then it is Active.',
        fail: 'It stays installed and Inactive, and you see why it could not be activated.',
    },
];
const broken = {
    question: 'Does Plugins → Manage plugins show the plugin as Suspended?',
    answers: [
        { label: 'Yes', result: 'Fix the cause, then Deactivate and Activate it.', tone: 'brand', link: '#automatic-suspension' },
        {
            label: 'No, or the admin does not open',
            next: {
                question: 'Can someone run commands on the server?',
                answers: [
                    { label: 'Yes', result: 'Open the site in recovery mode and deactivate the plugin.', link: '#recovery-mode' },
                    { label: 'No', result: 'Rename the plugin’s folder over FTP.', link: '#without-a-terminal' },
                ],
            },
        },
    ],
};
</script>

# Plugins

Plugins add features to your site: a shop, a search engine, a sign-in button for another service. This page covers adding a plugin, switching it on and off, its settings, removing it, and what Kestello does when a plugin breaks. Read it before you install your first plugin, and come back to the last part if a plugin ever takes your site down.

To update a plugin that is already running, see [Updates](/guide/updates).

## Who can manage plugins

Everything on this page needs the permission *Install, update, activate, deactivate and delete plugins*. Out of the box only the **Administrator** role has it. You can give it to another role under **People → Roles**, but think twice: a plugin runs its own code on your server, so whoever installs plugins can do anything the site can do. See [People and roles](/guide/people).

Installing, activating, deactivating and deleting also ask you to confirm your password if you have not done so in the last 10 minutes. A box titled **Confirm your password** appears; enter your password and choose **Confirm**.

## The plugins screen

![The Plugins screen: Upload a plugin, and the installed Notices plugin with its version, Active and Deactivate.](/screenshots/plugins.png)

Open **Plugins → Manage plugins**. Each installed plugin has a row with its name, version and a status:

| Status | What it means |
|---|---|
| **Active** | Switched on and running. |
| **Inactive** | Installed but switched off. Its data (tables and settings) is kept. |
| **Suspended** | Switched on, but Kestello stopped it after it crashed the site. The reason is shown under the plugin. See [When a plugin breaks the site](#when-a-plugin-breaks-the-site). |
| **Failed to start** | Switched on, but it cannot run, usually because something it needs is missing (another plugin, a newer Kestello, a PHP extension). The reason is shown under the plugin. |

<States :states="statuses" :moves="moves" caption="A plugin's statuses and what moves it between them" />

Under the name you may also see:

- **Needs** followed by other plugins: this plugin only runs when those are active.
- **Needed by** followed by other plugins: those plugins depend on this one, so you cannot deactivate it until you deactivate them.
- **What it may do**: opens the list of things the plugin declares it will do. The table below explains each line.

| Line | Meaning |
|---|---|
| **Connects to** | Web addresses the plugin may contact. |
| **Database** | Database access beyond its own tables. |
| **Files** | File access beyond its own folders. |
| **Sends email** | The plugin sends email. |
| **Listens to** | Things happening on the site that the plugin reacts to, such as content being saved. |
| **Adds permissions** | New permissions that appear under **People → Roles**, so you can decide which roles may use the plugin's screens. |
| **Replaces core services** | Parts of Kestello the plugin swaps for its own, such as how search or caching works. |

A plugin that declares nothing beyond its own pages, tables and settings shows no list.

Plugins that add screens of their own show them in the menu under **Plugins**, below **Manage plugins**.

## Signed and unsigned plugins

A plugin zip can carry a signature: a seal from the publisher that proves who made it and that nobody changed it afterwards. When you upload a plugin, Kestello checks the seal and tells you which case you have:

| What you see | What it means | Can you install it from the admin? |
|---|---|---|
| **Published by Acme in the Kestello registry, which checked this exact zip and its signature.** | The registry lists this exact zip, and it is sealed with the key the registry names for Acme. Your own list of trusted publishers doesn't matter for it. | Yes. |
| **Signed by Acme, a publisher this site trusts.** | The zip is sealed by a publisher listed in your site's configuration. | Yes. |
| **Signed with a key this site does not trust (…)** | Sealed, but by a publisher your site does not know. | No, unless unsigned installs are allowed (see below). |
| **Not signed: nobody vouches for where it came from.** | No seal at all. | No, unless unsigned installs are allowed. |
| **Changed after it was signed. Do not install it.** | The seal is broken: files were changed after signing. | Never. Not from the admin and not from the command line. |

A version the registry refuses, such as one it withdrew, is never installed either, from anywhere, and the review says why.

<Decide :tree="seal" caption="Whether a plugin zip installs, and from where" />

### Trusting a publisher

The publishers your site trusts are listed in `config/app.php` under `app.packages.trusted_keys`. A new site trusts no publisher of its own, so out of the box the admin installs only plugins from the [registry](#add-a-plugin-from-the-registry). A publisher who signs plugins gives you a name and a public key. Ask whoever looks after your server to add them to `config/app.php`:

```php
'packages' => [
    'trusted_keys' => [
        ['name' => 'Acme Plugins', 'public_key' => 'the key the publisher gave you'],
    ],
],
```

After that, plugins signed by Acme Plugins install from the admin.

### Allowing unsigned plugins in the admin

Setting `app.packages.admin_unsigned` to `true` in `config/app.php` lets the admin install unsigned plugins, and plugins signed by publishers you do not trust. This is meant for development sites. On a live site, leave it off: anyone who can sign in with the plugin permission could then put any code on your server.

### Installing an unsigned plugin on the server

Whoever can run commands on the server can already change the site's code, so the command line installs unsigned plugins too:

```bash
php bin/cms plugin:install acme-shop-1.0.0.zip
```

Add `--activate` to switch it on straight away. A plugin with a broken seal is refused here too. See the [command reference](/developers/cli) for the other plugin commands.

On shared hosting without a terminal, you can also unzip the plugin and upload its folder to `content/plugins/` with your FTP program. The folder must be named after the plugin (the `slug` in its `plugin.json`). It then appears on the plugins screen as **Inactive**. Kestello checks neither the seal nor the code in this case, so only do it with plugins from a source you trust.

## Install a plugin

<Flow :steps="install" caption="Installing a plugin from a zip" />

1. Open **Plugins → Manage plugins** and choose **Upload a plugin**.
2. Under **Plugin zip**, choose the plugin's zip file.
3. Choose **Upload and review**. Nothing is installed yet. You now see the plugin's name, version and author, the signature line, and **What it may do**.
4. Read the review:
   - If there is a **Code check** section, Kestello found things in the plugin's code worth knowing. Lines marked as errors (such as code that runs shell commands) block the install. Warnings are for you to judge.
   - If a warning box explains that the plugin cannot be installed from here, follow the signed and unsigned rules above.
5. Leave **Activate it after installing** on if you want the plugin running straight away, or turn it off to install it switched off.
6. Choose **Install**.

You see **Acme Shop was installed and is active.** (or **…was installed.** if you did not activate it). The review stays valid for an hour; after that, upload the zip again.

If the plugin installed but could not be switched on, you see **Acme Shop was installed but could not be activated:** followed by the reason. The plugin stays installed and inactive. Fix the reason (often a plugin it needs) and activate it later.

### Add a plugin from the registry

The Kestello registry lists plugins that publishers have signed and the registry has checked. **Plugins → Add new** shows them.

1. Open **Plugins → Add new**.
2. Find the plugin with **Search plugins** or a **Category**. **Details** shows its description, its versions and what the newest version this site can run may do.
3. Choose **Install** on its row, or **Install** followed by the version in **Details**. Kestello downloads that version and checks it against the registry.
4. The same review as for an uploaded zip opens. Continue from step 4 above.

If the screen says **The registry is turned off on this site**, a developer has turned it off in `config/registry.php` (`enabled`). Plugins are then installed from a zip under **Manage plugins**.

### Replacing an inactive plugin

If you upload a plugin that is already installed but inactive, the review says **Version 1.0.0 is installed (inactive).** and offers **Replace the installed version**. With it on, **Install** swaps the files. The plugin's data is kept, and its upgrade steps run the next time you activate it.

If the installed copy is active, the upload becomes an update instead, with a backup and an automatic way back. See [Updates](/guide/updates#update-a-plugin).

## Activate a plugin

1. Open **Plugins → Manage plugins**.
2. Choose **Activate** next to the plugin.

Before switching the plugin on, Kestello creates its database tables and starts it once as a trial. If the trial fails, the plugin stays off and you see why. You do not get a broken site. When it works you see **Acme Shop is active.**

## Deactivate a plugin

1. Open **Plugins → Manage plugins**.
2. Choose **Deactivate** next to the plugin.

You see **Acme Shop was deactivated. Its data is kept.** Its tables, settings and files stay, so activating it again brings it back as it was. **Deactivate** is greyed out while another active plugin needs this one; deactivate that one first.

Deactivating always works, even for a plugin that crashes: Kestello switches it off without waiting for it to cooperate.

## Change a plugin's settings

Plugins with settings add a tab to **Site → Settings**, next to the built-in groups. Each such tab has a box titled **From a plugin** that names the plugin it belongs to.

1. Open **Site → Settings**.
2. Choose the plugin's tab.
3. Change the fields and save.

Some fields are secrets, such as an API key for an outside service. They are stored encrypted and never shown again. To keep a saved secret while you change other fields, leave its field empty.

Plugin settings are saved with the rest of the site settings, so they are in every backup.

## Delete a plugin

Deleting removes the plugin's files, its database tables and its settings. Make a backup first if you may want it back (see [Backups](/guide/backups)).

1. Open **Plugins → Manage plugins**.
2. If the plugin is active, choose **Deactivate**. The delete button only appears on inactive plugins.
3. Choose the bin icon next to the plugin.
4. Read the box **Delete Acme Shop?** and choose **Delete plugin and data**.

You see **Acme Shop was deleted.**

::: danger
Deleting a plugin deletes its data. There is no undo except restoring a backup made before.
:::

## When a plugin breaks the site {#when-a-plugin-breaks-the-site}

Kestello usually catches a broken plugin by itself. When it can't, or the admin itself is down, there are two ways to switch the plugin off by hand:

<Decide :tree="broken" caption="Switching off a plugin that broke the site" />

### Automatic suspension

Kestello watches every plugin while it starts and while it runs. If a plugin throws an error while starting, or causes a fatal PHP error in its own files, Kestello suspends it: it writes the plugin into `storage/framework/suspended.json` and the next page load runs without it. Visitors see the site without that plugin's features, not an error page.

When this happens:

- the plugin shows **Suspended** on **Plugins → Manage plugins**, with the error under it,
- **System → Site Health** reports a critical problem under **Plugins and themes** that names the plugin,
- the error is written to the PHP error log with the words `safe mode suspended`.

To bring the plugin back:

1. Find out why it failed. The error under the plugin usually names the file and line. Send it to the plugin's publisher.
2. Install a fixed version, or fix what it needs (for example a missing PHP extension).
3. Choose **Deactivate** on the plugin. This clears the suspension.
4. Choose **Activate**. Kestello runs the trial start again; if it fails, the plugin stays off and you see why.

Themes are watched the same way. Kestello's own code is never suspended: an error there is a real error and shows as one.

### Recovery mode

Sometimes a plugin breaks the site in a way Kestello cannot pin on it, or breaks the admin itself so you cannot reach the plugins screen. Recovery mode opens the site with every plugin switched off and the built-in theme in use, only for you, so you can deactivate or delete the plugin causing trouble.

You need someone who can run commands on the server.

1. On the server, in the site's folder, run:

   ```bash
   php bin/cms recovery:link
   ```

   ```text
     Recovery link (valid 60 minutes):
     https://example.com/admin?kestello-recovery=…
     Plugins stay disabled and the base theme is used while the recovery cookie is set.
   ```

   Add `--minutes=` to change how long the link works, from 5 to 1440 minutes.
2. Open the link in your browser. Kestello sets a cookie called `kestello_recovery` and sends you to the admin. Sign in if asked.
3. Every admin screen shows **Recovery mode**. Open **Plugins → Manage plugins**. It says **No plugins are running in this session, so you can deactivate or delete the one causing trouble.**
4. Choose **Deactivate** on the plugin that broke the site.
5. Leave recovery mode by deleting the `kestello_recovery` cookie in your browser, or wait for the link's time to run out. Then check the site.

Recovery mode only applies to the browser that opened the link. Visitors keep getting the normal site. While it is on, **Site Health** reports **The site is in recovery mode: plugins are not loaded.**

The link is built from the site address in **Site → Settings**. If that address is wrong, the link is too; fix the address part by hand.

### Without a terminal

If you cannot run commands on the server, use your FTP program or the host's file manager:

1. Open `content/plugins/`.
2. Rename the folder of the plugin that broke the site by putting a dot in front of its name, for example `acme-shop` to `.acme-shop`. Kestello ignores folders that start with a dot, so the plugin no longer loads.
3. Check that the site works again.

The plugin is still recorded as switched on. When you have a fixed version, remove the dot (or upload the fixed folder under the plain name). Do not leave the folder renamed for good: delete the plugin properly from the admin once it can load, so its data is removed too.

## If something goes wrong

**"No publisher is trusted on this site yet, so plugins install on the server: `bin/cms plugin:install <zip>`. Trusted publishers are set in config/app.php (packages.trusted_keys)."** Your site trusts no publisher, so the admin installs nothing. Add the publisher's key as described in [Trusting a publisher](#trusting-a-publisher), or install the plugin from the command line.

**"Only packages signed by Acme Plugins install from here. A developer can install this one on the server: `bin/cms plugin:install <zip>`."** The plugin is unsigned or signed by someone else. The same choices apply.

**"This package was changed after it was signed, so it is refused."** Someone changed the files after the publisher sealed them. Do not use this zip. Download it again from the publisher.

**"There is no plugin.json or theme.json in the zip (at its root or in one folder)."** The file is not a Kestello plugin, or it is a zip of a zip. Some download sites wrap the real package; unpack the outer zip and upload what is inside.

**"That zip holds a theme. Themes are added under Appearance → Themes."** You uploaded a theme on the plugins screen. See [Themes](/guide/themes).

**"The upload has expired. Upload the package again."** More than an hour passed between the review and **Install**.

**"Cannot activate "acme-shop": …"** followed by a list. The plugin cannot run here. Typical lines are `requires Kestello ^2.0 (running 1.4.0)`, `requires PHP >=8.5 (running 8.4.12)`, `requires the PHP extension "intl"` and `requires plugin "acme-core" ^1.0 (not active)`. Install or activate what is missing first.

**"Cannot activate "acme-shop": it failed to boot: …"** The trial start failed, so the plugin was left off. The rest of the message is the plugin's own error; send it to its publisher.

**"Cannot deactivate "acme-core": required by acme-shop."** Another active plugin needs this one. Deactivate that plugin first.

**A yellow box on the plugins screen such as "Missing plugin.json in …", "… is not valid JSON" or "directory name "acme" must match slug "acme-shop"".** A folder in `content/plugins/` holds something Kestello cannot read as a plugin. Rename the folder to the plugin's slug, replace the broken files, or remove the folder.

**"Recovery mode needs app.secret_key (at least 32 characters). Run php bin/cms key:generate."** The site has no secret key, which recovery links are signed with. Run the command it names, then create the link again.

## Next

- [Updates](/guide/updates): update a running plugin with an automatic way back.
- [Site Health](/guide/health): see whether every plugin loaded.
- [Troubleshooting](/guide/troubleshooting): when the whole site is down.
