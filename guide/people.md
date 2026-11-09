# People, roles and sign-in

Everyone who signs in to your site has an account, and a role that decides what they may do: an editor can publish, a contributor can only write drafts for someone to check. This page shows how to add someone in a minute, choose the right role, pause or remove access when a person leaves, and keep every account safe with a good password and two-step sign-in.

## Add a person

Give every person their own account. Kestello records who changed what, and you can remove one person's access without changing anyone else's password.

![The People screen listing each person with their role, status, last sign-in and when they joined.](/screenshots/people-list.png)

1. Open **People**.
2. Choose **Add a person**.
3. Fill in **Username**: 3 to 50 characters, letters, numbers, dashes and underscores. The person can sign in with it or with their email address.
4. Fill in **Email**. Password reset links and notifications go to this address, so it must be one they read.
5. Pick a **Role**. It starts as **User**, which cannot open the admin, so change it for anyone who will work on the site. [Which role to give](#which-role-to-give) helps you choose. The list only offers roles you are allowed to give out (see [Who can manage whom](#who-can-manage-whom)).
6. Enter a **Password**, or choose **Generate** to fill in a long random one. It must follow the [password rules](#password-rules).
7. Choose **Add person**. Kestello may ask you to enter your own password first; see [Confirming your password](#confirming-your-password).

You see "*name* can now sign in." and the new person's page opens.

Kestello does not email the new person. Send them the address of the sign-in page (`/login` on your site) and the password through a private channel, and ask them to change the password under **Your profile → Sign-in & security** after their first sign-in.

Who can do this: people whose role includes *Create, edit and delete users*. On a new site, that is administrators.

## Which role to give

Each account has exactly one role. Find the person below and give them the role next to them.

| The person is | Give them | What they can do |
|---|---|---|
| Someone at the counter who posts news, offers and events on the blog | **Author** | Write, publish and delete their own posts, and upload images. They cannot change pages, menus or other people's posts. |
| A student, intern or freelancer who writes, and you check their work before it goes out | **Contributor** | Write their own posts and choose **Submit for review**. An editor or administrator publishes them. See [Reviews and checklists](/guide/reviews). |
| The person who keeps all of the site's content up to date | **Editor** | Every page and post, including other people's; categories and tags; menus; forms and what people send; redirects; everyone's files. Not settings, themes, plugins or accounts. |
| Your web agency, your developer, or a co-owner | **Administrator** | Everything, including settings, themes, plugins, backups and other people's accounts. |
| A customer or club member who only signs in on the public site | **User** | Sign in and manage their own profile. They never see the admin. |

When you are unsure, give the smaller role. You can change it at any time, and the change applies on the person's next click.

::: info Pages and posts
Pages nest under each other and shape the whole site, so by default only editors and administrators work on them. Posts, and content types you add that do not nest, can also be written by authors and contributors. If the text someone needs to update is on a page, such as your opening hours, give them **Editor**.
:::

If none of the built-in roles fits, you can [change what a role may do](#change-what-a-role-may-do) or [create your own role](#create-your-own-role). The full list of what each role may do is in [The built-in roles](#the-built-in-roles).

## Change someone's role or details {#change-someone-s-account}

1. Open **People** and choose the person's name.
2. Under **Details**, change **Username**, **Email**, **Role** or **Note**. The note is only visible to people who manage accounts. Under the **Role** field you see a summary of what the chosen role may do.
3. Choose **Save changes**.

You see "Changes saved." A role change takes effect on the person's next click; they do not need to sign in again. An email change here takes effect at once, and any password reset link already sent to the old address stops working.

You cannot change your own role or status, or set your own password, on this screen. Your own account shows "This is your own account. Change your password, email and sign-in security from your profile."

Who can do this: people whose role includes *Create, edit and delete users*, for accounts within their reach (see [Who can manage whom](#who-can-manage-whom)).

### Set a new password for someone

Use this when a person cannot reset their own password, for example because they no longer have access to their email.

1. Open the person's page under **People**.
2. Under **Set a new password**, type the new password in **New password**.
3. Choose **Set password**.

You see "Password changed. *name* was signed out on every device." Their access tokens stop working too. Give them the new password privately.

Who can do this: the same people who can change the account.

## Pause or remove someone when they leave {#deactivate-or-delete-an-account}

**Deactivating** blocks sign-in and keeps the account, so you can turn it back on later. **Deleting** removes the account for good. Use deactivation when someone leaves, at least at first.

To deactivate:

1. Open the person's page under **People**.
2. Turn off **Can sign in**.
3. Choose **Save changes**.

You see "*name* was deactivated and signed out everywhere." Their sessions end at once, their access tokens are revoked, and password reset emails are no longer sent to them. On the sign-in page they get the same "Invalid email/username or password." message as a wrong password, so the page does not tell anyone the account exists.

To let them back in, turn **Can sign in** on again and choose **Save changes**.

To delete:

1. Open the person's page under **People**.
2. Under **Delete account**, choose **Delete** followed by their username.
3. Confirm with **Delete account**.

You see "*name* was deleted." Their account, sessions and access tokens are removed. Content they created stays on the site.

::: danger
Deleting an account cannot be undone. Deactivate instead if you might need it again.
:::

Kestello always keeps at least one active administrator. You cannot demote, deactivate or delete the last one.

Who can do this: people whose role includes *Create, edit and delete users*, for accounts within their reach (see [Who can manage whom](#who-can-manage-whom)).

## Password rules {#password-rules}

Every new password, whether set at installation, by an administrator, on **Your profile** or through a reset link, must:

- be at least 12 characters long,
- not be a very common password (such as `password123`, `qwertyuiop` or `letmein`) or one character repeated,
- not contain the username, or the part of the email address before the `@`, when that is 4 characters or longer.

There is no rule about symbols or capital letters. Long passwords are welcome; three or four unrelated words work well. A password manager can generate and remember them for you.

The minimum length comes from the config key `auth.password_min_length` (default `12`, lowest allowed value `8`). Most sites never change it.

## Change your own password

1. Open **Your profile** and choose **Sign-in & security**.
2. Under **Password**, enter your **Current password** and your **New password**.
3. Choose **Change password**.

Your other sessions are signed out and your access tokens are revoked. The browser you are using stays signed in. The message tells you how many sessions and tokens ended.

## Forgotten passwords

Anyone can reset their own password from the sign-in page:

1. On `/login`, choose **Forgot your password?**.
2. Enter the account's address in **Email address** and choose **Send reset link**.
3. Kestello shows "If an account uses that address, we sent it a link to reset the password." It says the same whether or not the address has an account.
4. Open the email (subject "Reset your *site name* password") and choose **Reset my password**.
5. Enter the new password in **New password** and **Repeat new password**, then choose **Change password**.
6. You return to the sign-in page with "Your password was changed. Sign in with the new one."

The link works once and expires after 60 minutes. Asking for a new link cancels the previous one. Deactivated accounts never receive a link.

A password reset does not turn off two-step sign-in. After the new password, Kestello still asks for the code.

Reset emails go through the mail settings under **Site → Settings → Email**. If they do not arrive, see [Troubleshooting](/guide/troubleshooting).

## Two-step sign-in

With two-step sign-in, signing in needs your password and a six-digit code from an authenticator app on your phone (for example 1Password, Google Authenticator or Authy). Someone who steals your password still cannot get in.

![The Security screen: who uses two-step sign-in, failed sign-ins today, signed-in sessions and access tokens.](/screenshots/security.png)

Everyone with an account can turn it on for themselves. Administrators are expected to use it: their **Sign-in & security** tab shows "Your role is expected to use two-step sign-in. Turn it on now." until they do. (The roles this applies to come from the config key `auth.two_factor_roles`, default `['admin']`.) Kestello does not yet force anyone to turn it on.

### Turn it on

1. Open **Your profile** and choose the **Sign-in & security** tab.
2. Under **Two-step sign-in**, choose **Set up two-step sign-in**.
3. In your authenticator app, add an account. Type the setup key shown on screen, or on a phone tap **Open in app**.
4. Type the six-digit code the app shows into **Code** and choose **Turn on**.
5. Kestello shows ten recovery codes under **Save your recovery codes**. Choose **Copy** and store them somewhere other than your phone, such as a password manager or a printed sheet in a drawer.
6. Choose **I have saved them**.

The codes are not shown again. Each one signs you in once if you lose your phone.

### Signing in with two-step sign-in

After your password, Kestello asks for the six-digit code from your app. Type it in **Code** and choose **Verify**. If you do not have your phone, choose **Use a recovery code** and type one of your recovery codes instead. When you sign in with a recovery code, you see how many you have left; make new ones soon.

An account takes at most 20 wrong codes an hour, from anywhere; after that, codes are refused until the hour is up. After 5 wrong codes, Kestello emails the account's owner: whoever typed them got past the password. If that email reaches you and it wasn't you, change your password straight away.

### New recovery codes, or turning it off

On **Your profile → Sign-in & security**, the **Two-step sign-in** card shows since when it is on and how many recovery codes are left.

- **New recovery codes** makes ten new codes. The old ones stop working.
- **Turn off** turns two-step sign-in off. Signing in then needs only your password, and your recovery codes stop working.

### Someone lost their phone and their recovery codes

Nobody can turn off another person's two-step sign-in from the admin. Someone with access to the server has to do it from the command line, in the site's root folder:

```bash
php bin/cms auth:reset-2fa ana@example.com
```

You can pass the username or the email address. On success you see:

```text
  Two-factor authentication disabled for ana. Ask them to set it up again.
```

The person can then sign in with their password alone. Ask them to set up two-step sign-in again straight away. The reset is recorded in the audit log. On shared hosting without a terminal, ask your host's support to run the command, or use the SSH access many control panels offer. See [the command line](/developers/cli) for how to run commands.

## Sign out everywhere

The **Where you are signed in** card on **Your profile → Sign-in & security** lists every browser and device signed in to your account, with its network address and when it was last active. The one you are using is marked **This device**.

- To sign out one device, choose **Sign out** on its row.
- To sign out everything except the browser you are using, choose **Sign out everywhere else** and confirm with **Sign out others**.

If you think someone else knows your password, change it instead: that signs out every other device and revokes your access tokens in one step.

::: info Sessions stored in files
On some servers the card shows "This server keeps sessions in files, which cannot be listed." Signing out other devices through a password change still works. To see the list, an administrator can switch sessions to the database or Redis under **System → Infrastructure**.
:::

To sign out of the browser you are using, choose the **Sign out** icon at the top of the admin.

## Change your own email address

1. Open **Your profile**.
2. Under **Account**, change **Email** and choose **Save profile**. You may be asked to [confirm your password](#confirming-your-password).
3. Open the link Kestello emails to the new address.

![Your profile on the Account tab: Username, Email and About you, with your role and last sign-in on the right.](/screenshots/profile.png)

Until you open the link, your account keeps the old address, and your profile says which address is waiting. The link works once, for 24 hours. Your old address gets an email saying a change was asked for, so you would notice if someone else did it. Once the new address is confirmed, password reset links sent to the old address stop working.

## Confirming your password {#confirming-your-password}

Some actions ask for your password again even though you are signed in, for example: adding, changing or deleting accounts, creating or editing roles, changing your email address, turning two-step sign-in on or off, making new recovery codes, creating access tokens, disconnecting a sign-in provider, and creating or activating a theme. A dialog titled **Confirm your password** appears. Enter your password and choose **Confirm**. For the next 10 minutes, these actions do not ask again.

This protects you if you leave a signed-in browser unattended.

## Security at a glance {#security}

**System → Security** shows, in one place, how well the site is protected and who can get in.

- **Two-step sign-in**: how many people in the roles expected to use it have turned it on, and who hasn't yet. Each name opens that person's page. Kestello does not force anyone to turn it on, so ask them to, under **Your profile**.
- **Failed sign-ins**: how many there were today and in the last 7 days, the network addresses with the most attempts, and the latest ones: when, which account, why (for example **Wrong password** or **No such account**) and from where. What was typed into the login field is never shown.
- **Signed-in sessions**: everyone who is signed in, on which browser and device, from which address, and when they were last active. **Sign out** ends one session; **Everywhere** signs that person out on every device. Your own session is marked **This session**.
- **Access tokens**: every token on the site, whose it is, what it **Can** do, when it was last used and when it expires. **Revoke** stops it working at once.
- **Plugins, themes and updates**: who the site trusts to give it code.
  - **Trusted publishers** are the publishers whose signed plugin and theme zips can be installed from the admin.
  - **Kestello updates signed by** names the key that updates of Kestello itself must carry; with **No release key**, those updates can't be applied from the admin.
  - The table lists every installed plugin and theme: who signed it, and where its new versions come from. **No signature on record** means it came as files, from the command line, or unsigned on a development site. **Key …, no longer trusted** means its publisher was removed from the trusted list; its next version can't be installed from the admin until they are trusted again.
  - A warning at the top says when the admin also installs unsigned zips, which suits a development site but not a live one.

  All of this comes from the server's config files (`app.packages.trusted_keys`, `app.packages.admin_unsigned` and `release.keys`), never from the admin, so someone with a stolen password can't add a publisher. See [Plugins](/guide/plugins).
- **Recent account events**: the latest sign-ins, password and two-step changes, tokens made or revoked, and people and roles changed. **Open the audit log** shows the full history of sign-ins and accounts.

If you think an account was taken over, sign that person out **Everywhere**, revoke their tokens, then set a new password for them (see [Set a new password for someone](#set-a-new-password-for-someone)).

::: info Sessions stored in files
When sessions are kept in files, the list of sessions can't be shown. Switch sessions to the database or Redis under **System → Infrastructure**.
:::

Who can see this: people whose role includes *See everyone's sign-ins, sessions and access tokens, and end them*. On a new site, that is administrators.

## The audit log {#audit-log}

**System → Audit log** lists who did what and when: sign-ins and failed sign-ins, password and two-step changes, people and roles added or changed, settings saved, plugins and themes switched, backups, updates and more.

![The Audit log: a Show filter, then each event with when it happened, who did it, what it was and where from.](/screenshots/audit-log.png)

Each row shows when it happened, who did it, what happened in plain words and the network address it came from. Use **Area** to show one part of the site, such as **Sign-in and accounts** or **Plugins**. Choose a person's name to show only what they did. **Details** opens everything recorded for that row. **Load more** goes further back.

Entries are kept for 365 days, then removed by the daily `audit.prune` task. Change that with `audit.retention_days` in `config/audit.php`, see [Configuration](/developers/configuration). Nobody can edit or delete entries from the admin.

Who can see this: people whose role includes *Read the audit log*. On a new site, that is administrators.

## How roles work {#accounts-and-roles}

The rest of this page is reference: what each role and capability allows in detail, and the less common tasks.

Every person who signs in has an **account**: a username, an email address and a password. Each account has exactly one **role**. A role is a named set of **capabilities**, and a capability is one thing a person may do, such as "Upload files" or "Change site settings".

You manage this under **People** in the admin menu:

| Screen | What you do there |
|---|---|
| **People** | See every account, add people, change their role, deactivate or delete them. |
| **Roles** | See what each role may do, change the built-in roles, create your own. |
| **Your profile** | Your own email, password, two-step sign-in, devices, access tokens and notifications. |

You only see **People** if your role includes *List and view users*, and **Roles** if it includes *Create and edit roles and what they may do*.

## The built-in roles

Kestello comes with five roles. Plugins can add more.

| Role | Who it is for | What it may do |
|---|---|---|
| **Administrator** | The site owner and whoever runs the site technically. | Everything, including capabilities that plugins add later. This role cannot be changed. |
| **Editor** | The person in charge of content. | Open the admin; create, edit, publish and delete all pages and posts, including other people's; manage categories and tags; upload files and edit or delete everyone's files; edit menus; build forms and read submissions; manage redirects. |
| **Author** | Someone who writes and publishes their own posts. | Open the admin; create, edit, publish and delete their own posts; assign categories and tags; upload files and edit or delete their own. Authors cannot edit pages. |
| **Contributor** | Someone whose posts are reviewed before they go out. | Open the admin; create and edit their own posts (but not publish them); assign categories and tags; upload files and edit or delete their own. Contributors cannot edit pages. |
| **User** | Visitors who have an account but do not work on the site. | Sign in and manage their own profile. They cannot open the admin: after signing in they land on the public site. |

None of the roles except **Administrator** can change themes, styles, settings, plugins, backups or other people's accounts out of the box. Give those capabilities to a role on the **Roles** screen if you need to.

## Capabilities

The **Roles** screen lists every capability as a checkbox, grouped into **Signing in**, **Content** (with forms and redirects), one group per content type and taxonomy, **People**, **Appearance** and **Site and system**. Capabilities that plugins add appear in a group named **From** followed by the plugin's slug (its short name, for example **From acme-seo**).

Some capabilities are marked **Same as administrator access**: whoever has one can make themselves an administrator, run code on the server or in every visitor's browser, or read every row of the database. They are managing people, roles, security, infrastructure, themes, plugins, updates, backups, site-wide code and importing from WordPress. When a change gives a role one of them, a warning names it above the list before you save. Grant them only to people you would make administrators.

The capabilities Kestello itself defines:

| Capability | What it allows |
|---|---|
| *Sign in and see own profile* | Signing in at all. |
| *Open the admin area* | Reaching anything under `/admin`. Without it, a person can only use the public site. |
| *Use the content editor (each content type grants its own actions)* | The content screens. What a person can do with each type is set by the capabilities below. |
| *Manage own profile, tokens and sessions* | **Your profile**: email, password, two-step sign-in, devices and access tokens. |
| *List and view users* | Seeing the **People** screen and each person's page. |
| *Create, edit and delete users* | Adding, changing, deactivating and deleting accounts (within the limits in [Who can manage whom](#who-can-manage-whom)). |
| *Create and edit roles and what they may do* | The **Roles** screen. |
| *See everyone's sign-ins, sessions and access tokens, and end them* | **System → Security**. |
| *Edit menus and assign them to theme locations* | **Appearance → Menus**. |
| *Upload files, and edit or delete their own* | Adding files to **Media**. |
| *Edit and delete everyone's files* | Changing or removing any file in **Media**. |
| *Change site settings* | **Site → Settings** (except the email and site address fields, which also need *Manage infrastructure...*), and clearing the page cache. |
| *Install, update, activate, deactivate and delete plugins* | **Plugins → Manage plugins**. |
| *Update Kestello, and plugins and themes from their publishers* | Kestello updates, license keys, and updates of plugins and themes that say where their updates come from, under **Site → Updates**. |
| *Make and download backups (restoring needs an administrator)* | **Site → Backups**, except restoring and uploading, which are for administrators only. |
| *Import a site from WordPress* | **Site → Import**. |
| *Read the audit log* | The record of who changed what. |
| *Manage infrastructure, background jobs, scheduled tasks and Site Health* | **System → Site Health**, **Infrastructure**, **File storage**, **Background jobs**, **Scheduled tasks**, and the email and site address settings. |
| *Set up webhooks that send site events to other services* | **System → Webhooks**. |
| *Watch other Kestello sites from Site → Fleet, with their fleet tokens* | **Site → Fleet**. |
| *Build content types, fields and taxonomies* | **System → Content types**. |
| *Change the site's styles, templates and patterns* | **Appearance → Styles** and **Appearance → Templates**. |
| *Write custom CSS* | Custom CSS under **Appearance → Styles**. |
| *Create, switch, export and import themes* | **Appearance → Themes**. |
| *Build forms and read what people send* | **Content → Forms** and their submissions. |
| *Manage redirects and see addresses that were not found* | **Site → Redirects**. |
| *Add code to every page of the site* | The settings that add code snippets to every page (for example an analytics tag). |

Each content type adds six capabilities of its own, named after the type: for posts these are *Create posts*, *Edit posts*, *Edit others posts*, *Publish posts*, *Delete posts* and *Delete others posts*. Each taxonomy adds two: for categories, *Manage categories* and *Assign categories to entries*.

::: warning Capabilities that reach beyond content
*Add code to every page of the site*, *Write custom CSS*, *Install, update, activate, deactivate and delete plugins* and *Update Kestello, and plugins and themes from their publishers* let a person run code or change what every visitor's browser loads. Give them only to people you would trust with the server.
:::

## Who can manage whom {#who-can-manage-whom}

Giving someone *Create, edit and delete users* does not let them hand out more power than they have. Kestello applies these rules:

- You can only create, change, deactivate or delete accounts whose role has **no capability you lack**. An editor who can manage users can manage authors and contributors, but not someone whose role includes, say, *Change site settings*.
- Only an administrator can manage administrator accounts.
- On the **Roles** screen you can only tick capabilities you hold yourself. The others show as disabled with the hint "You can only grant what you have yourself."
- You cannot change the role you hold yourself, unless you are an administrator. You see "This is your own role, so you cannot change it. Ask an administrator."
- You cannot change your own role, deactivate yourself or delete yourself.

When a person's page is out of your reach, its fields are shown but disabled.

## Change what a role may do

![The Roles screen: the roles on the left and, for the selected role, what it may do, grouped by area.](/screenshots/people-roles.png)

1. Open **Roles**.
2. Pick the role in the list on the left. Each entry shows how many people have it, and a badge: **Everything** for administrators, **Custom** for roles you created, **Changed** for built-in roles you have edited.
3. Tick or untick capabilities. A capability that differs from the role's defaults is marked **added** or **removed**.
4. Optionally change **Name** (what people see) and **Description** (a note for whoever assigns roles).
5. Choose **Save role**.

You see "*role* saved. People with this role get the change on their next click."

To undo your changes to a built-in role, open it and choose **Reset to defaults**. The role goes back to the capabilities Kestello and your plugins give it. Your changes are kept separately from those defaults, so when a plugin update adds a capability to a built-in role, a role you changed still receives it.

Who can do this: people whose role includes *Create and edit roles and what they may do*. On a new site, that is administrators.

## Create your own role

1. Open **Roles** and choose **New role**.
2. Enter **Name**, for example "Reviewer".
3. Check **Id**. It is filled in from the name: lowercase letters, digits and dashes, up to 20 characters. It cannot change later.
4. Under **Start with the capabilities of**, pick a role to copy from, or **Nothing (start empty)**.
5. Choose **Create role**, then tick what the role may do and choose **Save role**.

To delete a role you created, open it, pick the role its people should move to (if anyone has it), and choose **Delete role**. Built-in roles cannot be deleted, only reset.

Who can do this: people whose role includes *Create and edit roles and what they may do*.

## Access tokens

An access token lets a script or another app use Kestello's API as you, for example a deploy script that publishes content or a dashboard that reads it. You find them under **Your profile → Access tokens**.

1. Choose **Create token**.
2. Give it a **Name** that says what will use it.
3. Pick when it **Expires**: 7 days, 30 days, 90 days (the default), one year or never.
4. Tick the **Permissions** it needs, and no more. `admin` means everything your account can do.
5. Choose **Create token**, then **Copy** the token shown under **Copy your token now** and store it in a password manager. It is shown only once.
6. Choose **I have stored it**.

A token can never do more than your account can: it gets only the capabilities your role has *and* the permissions you ticked. Choose **Revoke** on a token's row to stop it working at once. Changing your password, being deactivated or being deleted revokes all your tokens. You can hold at most 50.

Someone with server access can also create a token from the command line:

```bash
php bin/cms token:create ana --name=deploy --scopes=content:read --days=90
```

## Let people create their own account {#sign-up}

By default only people who manage accounts can add new ones. To let visitors create an account themselves, such as the customers of a shop or the members of a club, open **Site → Settings** and choose **Accounts**.

| Setting | What it does |
|---|---|
| **Who can create an account** | **Nobody: you add people yourself** (the default), **Anyone**, or **Only people with an address at the domains below**. |
| **Allowed email domains** | For the last choice: the part after the @, separated by commas, such as `example.org, example.net`. |
| **Role for new accounts** | What new accounts may do. **User** can sign in and change their own profile. Administrator, and roles that may manage people, roles, security or the system, are never offered: a stranger with one could take over the site. |

Keep **Role for new accounts** on **User** unless you mean it: every person who signs up gets that role.

When sign-up is open, the sign-in page shows **Create an account**. It takes two steps:

1. The visitor enters their email address and chooses **Send link**. Kestello emails a link to that address.
2. The link opens **Choose your password**. When they choose **Create account**, the account is created and they are signed in.

The link works once and expires after 24 hours. Nothing is created before the link is opened, so a mistyped address never becomes an account. The password is chosen only after the link, so nobody can set up an account with someone else's address and a password of their own.

The page answers the same way whether or not an address already has an account, so the form can't be used to find out who has one. The owner of an existing account gets an email instead, with links to sign in and to reset the password.

Sign-up only works when the site's email reaches people. Before you open it, send a test email from **Site → Settings**, **Email**.

Who can do this: people whose role includes both *Change site settings* (to open **Site → Settings**) and *Create, edit and delete users* (for the **Accounts** settings). On a new site, that is administrators.

## Sign in with Google or other providers {#sign-in-with-google-or-other-providers}

Kestello can let people sign in with an account from another service, such as Google or GitHub, instead of a password. The providers come from plugins; Kestello has none switched on by itself. Once a provider plugin is set up, a **Continue with** button for it (for example **Continue with Google**) appears on the sign-in page under the usual form.

Each person connects a provider to their own account. **Connected sign-ins** appears on **Your profile** only while at least one provider is set up, or when the account still has a connection from an earlier one.

The steps:

1. Sign in with your password as usual.
2. Open **Your profile** and choose **Connected sign-ins**.
3. Choose the **Connect** button for the provider and approve the request on the provider's page.

Kestello emails you when a sign-in method is added to your account. If that was not you, change your password and disconnect it.

To remove one, choose **Disconnect** next to it. If it is your only way to sign in and you have never set a password, the button is disabled until you set one.

By default, signing in with a provider only works for people who already have an account and have connected that provider. People without an account see "There is no account for this sign-in, and registration is closed." When **Who can create an account** lets them [create their own account](#sign-up), signing in with a provider creates one instead. With the domains choice, only a provider that confirms the email address can create one. If two-step sign-in is on for an account, Kestello still asks for the code after the provider sign-in.

Two more settings under **Accounts** are about providers. **Connect provider sign-ins by email** connects a provider sign-in to the account with the same address, when the provider confirmed that address. Leave it off unless you trust every provider you use. **Trust the provider's two-step check** skips Kestello's code when the provider says it already asked for a second factor.

## If something goes wrong

**"Invalid email/username or password."** The username or email, or the password, is wrong, or the account is deactivated. Check with whoever manages accounts whether **Can sign in** is on, then use **Forgot your password?**.

**"Too many attempts. Try again in 1 minute."** (or a number of seconds or minutes). Kestello slows down guessing: after 5 failed sign-ins from one network address within a minute, 10 failed attempts on one account from one address within an hour, or 100 on one account from anywhere within an hour, it makes you wait. Wait for the time shown. Someone guessing your password from elsewhere does not lock you out at your own address. Signing in successfully resets the count for that account.

**"That code is not correct."** The six-digit code was wrong or expired. Check that your phone's clock is set automatically; authenticator codes depend on the time. Or choose **Use a recovery code**.

**"Your sign-in attempt expired. Enter your password again."** You waited too long between your password and the code. Start again from the sign-in page.

**"This reset link is invalid or has expired."** The link was already used, is older than 60 minutes, or a newer link replaced it. Use **Request a new link**.

**"The passwords don't match."** The two password fields on the reset page differ.

**"Use at least 12 characters."**, **"That password is too common."** or **"Don't use your username or email in your password."** The password breaks one of the [password rules](#password-rules).

**"Your current password is not correct."** On **Your profile**, the current password you typed is wrong.

**"That password is not correct."** In the **Confirm your password** dialog, the password you typed is wrong.

**"This username is already taken."** or **"This email is already in use."** Another account uses it. Each username and email address can belong to one account only.

**"Only an administrator can manage administrator accounts."** You tried to create, change or delete an administrator without being one.

**"You can't manage people with the role "editor": it has capabilities you don't (...)".** The role gives capabilities you do not have yourself, so you cannot hand it out or change accounts that have it. The message lists the missing ones. Ask an administrator.

**"You can't grant [settings.manage]: you don't have it yourself."** On **Roles**, you ticked a capability your own role does not include.

**"This is the last administrator."** or **"This is the last active administrator."** Make another account an administrator first, then try again.

**"You cannot change your own role."**, **"You cannot deactivate your own account."** or **"You cannot delete your own account."** Ask another administrator to do it.

**"That code is not correct (or enrollment expired; start again)."** While turning on two-step sign-in, the code did not match. Check the phone's clock, or choose **Cancel** and start the setup again.

**"You have too many tokens; revoke some first."** You have 50 access tokens. Revoke the ones you no longer use.

**"An account with this email already exists. Sign in with your password, then connect ... from your profile."** You tried a provider sign-in before connecting it. Sign in with your password and connect it under **Your profile → Connected sign-ins**.

**Someone is locked out completely.** See [Troubleshooting](/guide/troubleshooting) for the steps when nobody can sign in.

**No sign-up email arrives.** Check the spam folder first. Then send a test email from **Site → Settings**, **Email**: if that one doesn't arrive either, the site's email isn't set up. A visitor can ask for a new link up to 3 times an hour from one place.

**"Use an address at example.org."** Sign-up is limited to some email domains, and the address is at another one. The domains are listed under **Site → Settings**, **Accounts**.

**"This link is invalid or has expired."** The sign-up link was already used, is older than 24 hours, or was replaced by a newer one. Choose **Get a new link** and use the newest email.

## Next

- [Reviews and checklists](/guide/reviews): how contributors submit their work and editors publish it.
- [Backups](/guide/backups): restoring a backup also restores the list of accounts.
- [Troubleshooting](/guide/troubleshooting), when nobody can get into the admin.
- [The command line](/developers/cli), for `auth:reset-2fa` and `token:create`.
