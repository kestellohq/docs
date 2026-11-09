// Shared browser setup for the screenshot scripts: one viewport, light colours, English,
// and a helper that saves an image under public/screenshots/.
import { chromium } from 'playwright';
import { hostname } from 'node:os';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../public/screenshots');
export const BASE = (process.env.KESTELLO_DOCS_URL ?? 'http://127.0.0.1:8090').replace(/\/$/, '');

/**
 * The screenshot site's folder on this machine (KESTELLO_DOCS_ROOT). Screens that show it,
 * such as the cron command, show EXAMPLE_ROOT instead, so no one's own paths end up in the docs.
 */
const ROOT = (process.env.KESTELLO_DOCS_ROOT ?? '').replace(/\/$/, '');
const EXAMPLE_ROOT = '/home/example/kestello';

export async function open() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 2,
        colorScheme: 'light',
        locale: 'en-GB',
        timezoneId: 'Europe/London',
        reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);

    return { browser, context, page };
}

/** Wait until the page has settled: network quiet, fonts loaded, no spinners. */
export async function settle(page) {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.k-spinner, [aria-busy="true"]').first().waitFor({ state: 'detached', timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(250);
}

/**
 * Save a screenshot as public/screenshots/<name>.png. Pass a locator to capture one part of
 * the page, 'content' for an admin screen's own area (no menu, cut off below what it shows),
 * or nothing for the whole viewport.
 */
/** keepFocus: leave the focused field focused, for a list that shows only while typing. */
export async function shoot(page, name, target = null, { keepFocus = false } = {}) {
    if (target === 'content') {
        await settle(page);
        target = null;
        const clip = await page.evaluate(() => {
            const main = document.querySelector('#k-main');
            if (!main) {
                return null;
            }
            const box = main.getBoundingClientRect();
            let bottom = box.top;
            for (const el of main.querySelectorAll('*')) {
                const r = el.getBoundingClientRect();
                // Only elements with nothing inside them: wrappers that fill the screen don't count.
                if (el.childElementCount === 0 && r.height > 0 && r.width > 0 && getComputedStyle(el).visibility !== 'hidden') {
                    bottom = Math.max(bottom, r.bottom);
                }
            }
            const height = Math.min(window.innerHeight - box.top, bottom - box.top + 32);
            return { x: box.left, y: box.top, width: Math.min(box.width, window.innerWidth - box.left), height };
        });
        if (clip) {
            const path = join(OUT, `${name}.png`);
            await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
            await hidePaths(page);
            await page.screenshot({ path, clip, animations: 'disabled' });
            console.log(`  ${name}.png`);
            return;
        }
    }
    const path = join(OUT, `${name}.png`);
    mkdirSync(dirname(path), { recursive: true });
    await settle(page);
    if (!keepFocus) await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await hidePaths(page);
    if (target) {
        await target.screenshot({ path, animations: 'disabled' });
    } else {
        await page.screenshot({ path, animations: 'disabled' });
    }
    console.log(`  ${name}.png`);
}

/** Sign in with the screenshot site's account (the sample site's "demo" administrator by default). */
export async function signIn(page) {
    await page.goto(`${BASE}/login`);
    await page.getByLabel('Email or username').fill(process.env.KESTELLO_DOCS_USER ?? 'demo');
    await page.getByLabel('Password', { exact: true }).fill(process.env.KESTELLO_DOCS_PASSWORD ?? 'demo');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/admin/);
    await settle(page);
}

/**
 * Draw numbered markers on the page before a screenshot, so the text can say "1 is the top
 * bar". Each marker sits on the top left corner of its element. Removed by clearMarks().
 *
 * @param {Array<import('playwright').Locator>} targets in number order
 */
export async function mark(page, targets) {
    const boxes = [];
    for (const target of targets) {
        const box = await target.boundingBox();
        if (!box) {
            throw new Error(`Nothing to mark: ${target}`);
        }
        boxes.push(box);
    }
    await page.evaluate((boxes) => {
        boxes.forEach((b, i) => {
            const ring = document.createElement('div');
            ring.dataset.docsMark = '';
            Object.assign(ring.style, {
                position: 'fixed', left: `${b.x - 3}px`, top: `${b.y - 3}px`, width: `${b.width + 6}px`, height: `${b.height + 6}px`,
                border: '2px solid #e5484d', borderRadius: '6px', zIndex: 2147483646, pointerEvents: 'none',
            });
            const dot = document.createElement('div');
            dot.dataset.docsMark = '';
            dot.textContent = String(i + 1);
            Object.assign(dot.style, {
                position: 'fixed', left: `${Math.max(2, b.x - 12)}px`, top: `${Math.max(2, b.y - 12)}px`, width: '24px', height: '24px',
                borderRadius: '12px', background: '#e5484d', color: '#fff', font: '600 13px/24px system-ui, sans-serif',
                textAlign: 'center', zIndex: 2147483647, pointerEvents: 'none', boxShadow: '0 0 0 2px #fff',
            });
            document.body.append(ring, dot);
        });
    }, boxes);
}

export async function clearMarks(page) {
    await page.evaluate(() => document.querySelectorAll('[data-docs-mark]').forEach((e) => e.remove()));
}

/**
 * Replace this machine's own details in the page's text and fields: the site's real folder
 * becomes EXAMPLE_ROOT and the computer's name becomes "web-1".
 */
async function hidePaths(page) {
    // macOS reports /tmp paths as /private/tmp; replace both spellings.
    const pairs = [];
    if (ROOT !== '') {
        pairs.push([ROOT, EXAMPLE_ROOT], [ROOT.replace(/^\/private\//, '/'), EXAMPLE_ROOT]);
    }
    pairs.push([hostname(), 'web-1']);
    const roots = pairs.map(([from]) => from);
    await page.evaluate(({ pairs, roots }) => {
        const swap = (s) => pairs.reduce((out, [from, to]) => out.split(from).join(to), s);
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (roots.some((r) => node.nodeValue.includes(r))) {
                node.nodeValue = swap(node.nodeValue);
            }
        }
        for (const field of document.querySelectorAll('input, textarea')) {
            if (roots.some((r) => field.value.includes(r))) {
                field.value = swap(field.value);
            }
        }
    }, { pairs, roots });
}
