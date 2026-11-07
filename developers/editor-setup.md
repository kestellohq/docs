# Editor setup

This page sets up your editor so it knows Kestello's classes, functions and names: completion, go to definition, and warnings for mistakes before you run the code. It covers working in the Kestello repository and working on a plugin or theme in its own repository.

## In the Kestello repository

Everything is in the repository already:

| File | What it gives your editor |
|---|---|
| `.phpstorm.meta.php` | The container returns the class you ask for (`$container->make(Mailer::class)` is a `Mailer`), and string arguments complete from the real lists: capability names, admin widget areas, slots, columns and replaceable components. PhpStorm reads it, and so does Intelephense in VS Code. |
| `jsconfig.json` | `@kestello/app`, `@kestello/sdk` and `@kestello/ui` resolve to their source, so imports complete and jump to the code. VS Code and PhpStorm read it. |
| `.editorconfig` | Indentation and line endings for every file type. |

`.phpstorm.meta.php` is generated from the code. After you add a capability or an extension point, run:

```bash
npm run ide
```

CI fails when the file is out of date.

For formatting and checks, see [Local development](/developers/local-development).

## For a plugin or theme in its own repository

Your repository doesn't contain Kestello, so your editor can't see its classes. Give it the API stubs: one PHP file that declares every public class, interface and function of a Kestello version, with signatures and doc comments but no code.

1. Download `kestello.stub.php` from the [Kestello release](https://github.com/kestellohq/cms/releases) you build against. Every release has one.
2. Put it in your repository, for example in `.ide/kestello.stub.php`, and add that folder to `.gitignore` if you prefer to download it per machine.
3. Reload your editor. PhpStorm and Intelephense read every PHP file in the project, so `Kestello\…` classes now complete.

You can also make the stubs from a Kestello checkout:

```bash
php bin/cms ide:helpers --stubs --out=../acme-shop/.ide
```

```text
  ../acme-shop/.ide/.phpstorm.meta.php
  ../acme-shop/.ide/kestello.stub.php (745 classes, 12 functions)
```

That also writes `.phpstorm.meta.php`, with the same completions as in the Kestello repository.

Classes marked `@internal` are left out of the stubs on purpose: they can change in any release, so a plugin should not use them. If your editor can't find a class, check whether it is internal.

### PHPStan in a plugin repository

Point PHPStan at the stubs so it knows Kestello's types:

```yaml
# phpstan.neon
parameters:
    level: 6
    paths: [src]
    scanFiles: [.ide/kestello.stub.php]
```

### Vue files in a plugin repository

`@kestello/sdk`, `@kestello/ui` and `@kestello/app` are provided by the admin when your page runs. To get completion, clone the Kestello repository next to yours and point a `jsconfig.json` at it:

```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@kestello/sdk": ["../kestello/core/resources/js/sdk/index.js"],
            "@kestello/ui": ["../kestello/core/resources/js/ui/index.js"],
            "@kestello/app": ["../kestello/core/resources/js/app/index.js"]
        }
    },
    "include": ["resources/js/**/*"]
}
```

## Next

- [Translations](/developers/translations).
- [Packaging and signing](/developers/packaging).
