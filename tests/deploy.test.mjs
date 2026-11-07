// The docs deploy to Cloudflare Workers as static assets at docs.kestello.com (wrangler.jsonc).
// These checks keep the Worker configuration, the VitePress output and the address in step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (path) => readFileSync(fileURLToPath(new URL(`../${path}`, import.meta.url)), 'utf8');
const jsonc = (text) => JSON.parse(text.replace(/^\s*\/\/.*$/gm, ''));

test('the Worker serves the VitePress build at docs.kestello.com', () => {
    const worker = jsonc(read('wrangler.jsonc'));
    assert.equal(worker.assets.directory, './.vitepress/dist');
    assert.equal(worker.assets.not_found_handling, '404-page', 'VitePress writes 404.html; unknown addresses get it');
    assert.equal(worker.assets.html_handling, 'auto-trailing-slash', '/guide/forms is served from guide/forms.html');
    assert.deepEqual(worker.routes, [{ pattern: 'docs.kestello.com', custom_domain: true }]);
    assert.equal(worker.build.command, 'npm run build');
});

test('VitePress writes clean addresses and a sitemap for docs.kestello.com', () => {
    const config = read('.vitepress/config.mts');
    assert.match(config, /cleanUrls: true/, 'links must match how the Worker serves pages');
    assert.match(config, /hostname: 'https:\/\/docs\.kestello\.com'/);
});

test('headers and robots.txt ship with the build', () => {
    const headers = read('public/_headers');
    assert.match(headers, /^\/\*\n(\s+[A-Za-z-]+: .+\n)+/m);
    assert.match(headers, /X-Content-Type-Options: nosniff/);
    assert.match(headers, /^\/assets\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/m, 'VitePress fingerprints /assets/ files');
    assert.match(read('public/robots.txt'), /Sitemap: https:\/\/docs\.kestello\.com\/sitemap\.xml/);
});

test('files about the repository are not published as pages', () => {
    assert.match(read('.vitepress/config.mts'), /srcExclude: \['\[A-Z\]\*\.md'/, 'README.md, STYLE.md, AGENTS.md and the like stay out of the site');
});
