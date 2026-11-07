# Contributing to the Kestello docs

Thank you for helping. These docs serve two readers: the people who run a Kestello site, in `guide/`, and the developers who build on it, in `developers/`. Code changes to Kestello itself go to [kestellohq/cms](https://github.com/kestellohq/cms), which has its own [contributing guide](https://github.com/kestellohq/cms/blob/develop/CONTRIBUTING.md).

## Before you write

1. Read [STYLE.md](STYLE.md). It is short, and every page follows it.
2. Run the Kestello version you are documenting ([Local development](developers/local-development.md) sets one up). Every label, command, setting and message on a page must come from the running admin or the code, not from memory.

## Run the docs locally

You need Node.js 22.12 or newer.

```bash
npm ci
npm run dev        # http://localhost:5173, reloads as you edit
npm run check      # style, its tests and a full build, as CI runs them
```

`npm run style` checks the rules a machine can check: no en or em dashes, none of the banned words, and sentence-case headings without exclamation marks. A full build also fails on links to pages that don't exist.

## Pages

- A new page goes in `guide/` or `developers/` and gets a sidebar entry in `.vitepress/config.mts`.
- Link to other pages with absolute paths without `.md`: `[Backups](/guide/backups)`.
- Name images after what they show and put them in `public/`.

## Branches, commits and pull requests

- `main` is what the site publishes. Branch from it: `docs/<short-topic>`, such as `docs/translating-guide`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `docs(guide): restore a backup from the command line`. Other types: `fix` for a wrong fact, `chore`, `ci`.
- Open a pull request into `main` and fill in the template, including the Kestello version you checked the steps against.
- Pull requests are squashed when merged.

When a change in [kestellohq/cms](https://github.com/kestellohq/cms) needs a docs change, link the two pull requests to each other.

## License

By contributing, you agree that your contributions are licensed under the [GNU General Public License, version 2 or later](LICENSE), like Kestello.
