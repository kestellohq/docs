// Every screenshot the docs use, in one list. Each entry opens a screen in the sample bakery
// site and says what to capture. Names are the file names under public/screenshots/.
import { fileURLToPath } from 'node:url';
import { BASE, mark, settle } from './browser.mjs';

const go = (path) => async (page) => {
    await page.goto(`${BASE}${path}`);
    await settle(page);
};

/** Open the first row of a list (an entry, a person, a form) by its link. */
const openFirst = (path, linkSelector = 'table tbody tr a') => async (page) => {
    await go(path)(page);
    await page.locator(linkSelector).first().click();
    await settle(page);
};

const button = (page, title) => page.locator(`button[title^="${title}"]`).first();
const canvas = (page) => page.frameLocator('iframe');

/** The About page in the visual editor, with a panel or tool opened by `then`. */
const editor = (then = async () => {}) => async (page) => {
    // The editor remembers open panels in this browser; start every shot from the default layout.
    await page.addInitScript(() => localStorage.clear());
    await go('/admin/content/page/2')(page);
    await canvas(page).getByText('Who we are', { exact: true }).waitFor({ timeout: 30_000 });
    await then(page);
    await settle(page);
};
/** A tab of the editor's right panel, by the start of its label ("Checks 1" is "Checks"). */
const tab = (page, label) => page.getByRole('tab', { name: new RegExp(`^${label}`) }).last();
const selectHeading = async (page) => {
    await canvas(page).getByText('Who we are', { exact: true }).click();
};

export const SHOTS = [
    // The visual editor (guide/visual-editor.md)
    {
        name: 'editor-parts',
        open: editor(async (page) => {
            await mark(page, [
                button(page, 'Add a block'),
                page.locator('iframe'),
                tab(page, 'Block').locator('xpath=..'),
                button(page, 'Phone').locator('xpath=..'),
                page.getByRole('button', { name: 'Update', exact: true }),
            ]);
        }),
    },
    { name: 'editor-add-block', open: editor(async (page) => button(page, 'Add a block').click()) },
    { name: 'editor-layers', open: editor(async (page) => button(page, 'Layers').click()) },
    { name: 'editor-find-replace', open: editor(async (page) => button(page, 'Find and replace').click()) },
    { name: 'editor-block', open: editor(async (page) => { await selectHeading(page); await tab(page, 'Block').click(); }) },
    { name: 'editor-style', open: editor(async (page) => { await selectHeading(page); await tab(page, 'Style').click(); }) },
    { name: 'editor-checks', open: editor(async (page) => tab(page, 'Checks').click()) },
    { name: 'editor-details', open: editor(async (page) => button(page, 'Details and outline').click()) },
    { name: 'editor-phone', open: editor(async (page) => button(page, 'Phone').click()) },
    { name: 'editor-form', open: editor(async (page) => button(page, 'Edit as a form instead').click()) },

    // Reviews (guide/reviews.md): needs prepare.mjs, which adds Ines's post in review
    { name: 'reviews-waiting', open: go('/admin') },
    {
        name: 'reviews-entry',
        open: async (page) => {
            await page.addInitScript(() => localStorage.clear());
            await go('/admin/content/post/10')(page);
            await page.getByText('Could someone check the oven temperatures', { exact: false }).first().scrollIntoViewIfNeeded();
        },
    },

    // The plugin tutorial (developers/plugin-tutorial.md): needs the Notices plugin built there
    { name: 'tutorial-notices', open: go('/admin/p/notices'), target: () => 'content' },

    // Public site
    { name: 'site-home', open: go('/') },

    // Overview and content
    { name: 'admin-overview', open: go('/admin') },
    { name: 'content-posts', open: go('/admin/content/post'), target: () => 'content' },
    { name: 'content-categories', open: go('/admin/taxonomies/category'), target: () => 'content' },
    { name: 'content-types', open: go('/admin/content-types'), target: () => 'content' },
    { name: 'media-library', open: go('/admin/media'), target: () => 'content' },
    { name: 'forms-list', open: go('/admin/forms'), target: () => 'content' },
    { name: 'forms-editor', open: openFirst('/admin/forms'), target: () => 'content' },

    // People
    { name: 'people-list', open: go('/admin/users'), target: () => 'content' },
    { name: 'people-roles', open: go('/admin/roles'), target: () => 'content' },
    { name: 'profile', open: go('/admin/profile'), target: () => 'content' },

    // Appearance
    { name: 'appearance-themes', open: go('/admin/appearance/themes'), target: () => 'content' },
    { name: 'appearance-styles', open: go('/admin/appearance/styles'), target: () => 'content' },
    { name: 'appearance-templates', open: go('/admin/appearance/templates'), target: () => 'content' },
    { name: 'menus', open: go('/admin/menus'), target: () => 'content' },
    { name: 'redirects', open: go('/admin/redirects'), target: () => 'content' },

    // Site
    { name: 'settings', open: go('/admin/settings'), target: () => 'content' },
    { name: 'updates', open: go('/admin/system/updates'), target: () => 'content' },
    { name: 'backups', open: go('/admin/system/backups'), target: () => 'content' },
    {
        name: 'import',
        open: async (page) => {
            await go('/admin/system/import')(page);
            const leftOpen = page.getByRole('button', { name: 'Cancel', exact: true }); // a review left open shows instead of the upload
            if (await leftOpen.isVisible()) await leftOpen.click();
            await page.locator('.k-file').waitFor();
        },
        target: () => 'content',
    },
    {
        // A small WordPress export of the bakery's "old site", read but not imported
        name: 'import-review',
        open: async (page) => {
            await go('/admin/system/import')(page);
            const leftOpen = page.getByRole('button', { name: 'Cancel', exact: true }); // from a run that stopped halfway
            if (await leftOpen.isVisible()) await leftOpen.click();
            await page.locator('.k-file__input').setInputFiles(fileURLToPath(new URL('./fixtures/margit-bakery.WordPress.xml', import.meta.url)));
            await page.getByRole('button', { name: 'Read the file' }).click();
            await page.getByRole('button', { name: 'Import', exact: true }).waitFor();
            await page.setViewportSize({ width: 1280, height: 1500 }); // the whole review, down to the Import button
            await page.mouse.move(0, 0);
        },
        target: () => 'content',
        after: (page) => page.getByRole('button', { name: 'Cancel', exact: true }).click(),
    },
    { name: 'plugins', open: go('/admin/system/plugins'), target: () => 'content' },

    // System
    { name: 'health', open: go('/admin/system/health'), target: () => 'content' },
    { name: 'security', open: go('/admin/system/security'), target: () => 'content' },
    { name: 'audit-log', open: go('/admin/system/audit'), target: () => 'content' },
    { name: 'webhooks', open: go('/admin/system/webhooks'), target: () => 'content' },
    { name: 'api-explorer', open: go('/admin/system/api'), target: () => 'content' },
    { name: 'background-jobs', open: go('/admin/system/queue'), target: () => 'content' },
    { name: 'scheduled-tasks', open: go('/admin/system/schedule'), target: () => 'content' },
    { name: 'file-storage', open: go('/admin/system/storage'), target: () => 'content' },
];
