import { defineConfig } from 'vitepress';

// One site, two audiences: /guide/ for the people who run a Kestello site,
// /developers/ for the people who build on it. The sidebars are separate so
// each audience only sees its own table of contents.

const guide = [
    {
        text: 'Start here',
        items: [
            { text: 'What Kestello is', link: '/guide/' },
            { text: 'Requirements', link: '/guide/requirements' },
            { text: 'Installing Kestello', link: '/guide/installation' },
            { text: 'Your first hour', link: '/guide/first-steps' },
            { text: 'Moving from WordPress', link: '/guide/import-wordpress' },
        ],
    },
    {
        text: 'Your content',
        items: [
            { text: 'Pages, posts and other content', link: '/guide/content' },
            { text: 'The visual editor', link: '/guide/visual-editor' },
            { text: 'Reviews and checklists', link: '/guide/reviews' },
            { text: 'Categories and tags', link: '/guide/categories-and-tags' },
            { text: 'Search and sharing', link: '/guide/search-and-sharing' },
            { text: 'Media library', link: '/guide/media' },
            { text: 'Menus', link: '/guide/menus' },
            { text: 'Redirects', link: '/guide/redirects' },
            { text: 'Forms', link: '/guide/forms' },
            { text: 'Search', link: '/guide/search' },
        ],
    },
    {
        text: 'Running the site',
        items: [
            { text: 'Themes and design', link: '/guide/themes' },
            { text: 'People and roles', link: '/guide/people' },
            { text: 'Plugins', link: '/guide/plugins' },
            { text: 'Webhooks', link: '/guide/webhooks' },
            { text: 'Backups', link: '/guide/backups' },
            { text: 'Updates', link: '/guide/updates' },
            { text: 'Fleet', link: '/guide/fleet' },
            { text: 'Site Health', link: '/guide/health' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
            { text: 'Translating Kestello', link: '/guide/translating' },
            { text: 'Public demo', link: '/guide/demo' },
        ],
    },
];

const developers = [
    {
        text: 'Foundations',
        items: [
            { text: 'Overview', link: '/developers/' },
            { text: 'Architecture', link: '/developers/architecture' },
            { text: 'Folders and files', link: '/developers/layout' },
            { text: 'Local development', link: '/developers/local-development' },
            { text: 'Command line', link: '/developers/cli' },
            { text: 'Editor setup', link: '/developers/editor-setup' },
        ],
    },
    {
        text: 'Plugins',
        items: [
            { text: 'Build your first plugin', link: '/developers/plugin-tutorial' },
            { text: 'The manifest', link: '/developers/manifest' },
            { text: 'Providers and lifecycle', link: '/developers/providers' },
            { text: 'Permissions', link: '/developers/permissions' },
            { text: 'Migrations', link: '/developers/migrations' },
            { text: 'Admin pages', link: '/developers/admin-pages' },
            { text: 'Events and filters', link: '/developers/events' },
            { text: 'Hook reference', link: '/developers/hooks' },
            { text: 'Settings', link: '/developers/settings' },
            { text: 'Background jobs', link: '/developers/jobs' },
            { text: 'Translations', link: '/developers/translations' },
        ],
    },
    {
        text: 'Themes and pages',
        items: [
            { text: 'Themes', link: '/developers/themes' },
            { text: 'Rendering and caching', link: '/developers/frontend' },
            { text: 'Search engines', link: '/developers/seo' },
        ],
    },
    {
        text: 'Integrate and ship',
        items: [
            { text: 'REST API', link: '/developers/rest-api' },
            { text: 'TypeScript client', link: '/developers/typescript-client' },
            { text: 'Webhooks', link: '/developers/webhooks' },
            { text: 'Packaging and signing', link: '/developers/packaging' },
            { text: 'Configuration reference', link: '/developers/configuration' },
            { text: 'Deployment', link: '/developers/deployment' },
        ],
    },
];

export default defineConfig({
    lang: 'en',
    title: 'Kestello',
    titleTemplate: ':title · Kestello docs',
    description: 'How to install, run and build on Kestello, the self-hosted CMS.',
    // served at docs.kestello.com by Cloudflare Workers (wrangler.jsonc), which serves /guide/forms from guide/forms.html
    cleanUrls: true,
    sitemap: { hostname: 'https://docs.kestello.com' },
    // files about the repository, not pages of the docs (README.md, STYLE.md and the other upper-case files at the root)
    srcExclude: ['[A-Z]*.md', '.agents/**', '.github/**', 'tests/**', 'tools/**'],
    // local development addresses are examples, not links to check
    ignoreDeadLinks: [/^https?:\/\/localhost/],
    lastUpdated: true,
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
        ['meta', { name: 'theme-color', content: '#111827' }],
        ['meta', { property: 'og:site_name', content: 'Kestello docs' }],
    ],
    themeConfig: {
        logo: { light: '/kestello-symbol.svg', dark: '/kestello-symbol-white.svg', alt: '' },
        siteTitle: 'Kestello',
        nav: [
            { text: 'Guide', link: '/guide/', activeMatch: '^/guide/' },
            { text: 'Developers', link: '/developers/', activeMatch: '^/developers/' },
            { text: 'Live demo', link: 'https://demo.kestello.com/' },
            { text: 'kestello.com', link: 'https://kestello.com' },
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/kestellohq/cms' }],
        sidebar: {
            '/guide/': guide,
            '/developers/': developers,
        },
        outline: { level: [2, 3], label: 'On this page' },
        search: { provider: 'local' },
        docFooter: { prev: 'Previous', next: 'Next' },
        footer: { message: 'Kestello documentation.' },
    },
    markdown: {
        theme: { light: 'github-light', dark: 'github-dark' },
    },
});
