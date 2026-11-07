# Kestello documentation

The documentation for [Kestello](https://github.com/kestellohq/cms), the self-hosted CMS: guides for the people who run a site (`guide/`), and pages for the developers who build on it (`developers/`). Built with [VitePress](https://vitepress.dev/).

```bash
npm ci
npm run dev       # preview at http://localhost:5173
npm run check     # style, tests and the full build, as CI runs them
```

It is published at [docs.kestello.com](https://docs.kestello.com).

## Deploy to Cloudflare Workers

The docs are static assets on Cloudflare Workers, with no Worker code. `wrangler.jsonc` serves the VitePress build (`.vitepress/dist`) at docs.kestello.com, with clean addresses (`/guide/forms`), the `404.html` VitePress writes for unknown addresses, and the headers in `public/_headers`.

- **From your machine:** `npx wrangler login` once, then `npx wrangler deploy`. Wrangler runs `npm run build` first.
- **From the repository:** in the Cloudflare dashboard, create a Worker from this repository (Workers Builds), with `npm run build` as the build command and `npx wrangler deploy` as the deploy command.

The custom domain needs the kestello.com zone in the same Cloudflare account.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) and [STYLE.md](STYLE.md) before writing. AI coding assistants follow [AGENTS.md](AGENTS.md).

Licensed under the [GNU General Public License, version 2 or later](LICENSE).
