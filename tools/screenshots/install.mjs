// Run the installer of a fresh, empty Kestello with SQLite. See tools/screenshots/README.md.
//
//   node tools/screenshots/install.mjs          a website: saves the five installer screenshots
//   node tools/screenshots/install.mjs --demo   the sample studio site the other screenshots use
//                                               (no screenshots; a demo skips the account step)
//
// The website's administrator gets a random password that is never shown or stored: that
// site exists only for these pictures.
import { randomBytes } from 'node:crypto';
import { BASE, open, settle, shoot } from './browser.mjs';

const demo = process.argv.includes('--demo');
const save = demo ? async () => {} : shoot;
const { browser, page } = await open();
try {
    await page.goto(`${BASE}/install`);
    await save(page, 'install-1-server-check');
    await page.getByRole('link', { name: 'Continue' }).click();

    await settle(page);
    await page.getByText('SQLite', { exact: true }).click();
    await page.getByLabel('File name').fill('kestello');
    await save(page, 'install-2-database');
    await page.getByRole('button', { name: 'Connect and continue' }).click();

    await settle(page);
    await page.getByLabel('Site name').fill('Taller Arroyo & Lind');
    await page.getByLabel('Tagline (optional)').fill('Houses, schools and rooms, drawn and built from Valencia');
    await save(page, 'install-3-your-site');
    if (demo) {
        await page.getByText('A public demo', { exact: true }).click();
    }
    await page.getByRole('button', { name: 'Continue' }).click();

    if (!demo) {
        await settle(page);
        await page.getByLabel(/^Username/).fill('lucia');
        await page.getByLabel(/^Email/).fill('lucia@example.com');
        const password = randomBytes(18).toString('base64url');
        for (const field of await page.locator('input[type=password]').all()) {
            await field.fill(password);
        }
        await save(page, 'install-4-administrator');
        await page.getByRole('button', { name: /continue/i }).click();
    }

    await settle(page);
    await page.getByRole('button', { name: 'Install Kestello' }).click();

    await page.waitForURL(/\/install\/complete/, { timeout: 120_000 });
    await save(page, 'install-6-complete');
    console.log(demo ? 'Installed the sample site. Next: see tools/screenshots/README.md.' : 'Installed; the five installer screenshots are saved.');
} finally {
    await browser.close();
}
