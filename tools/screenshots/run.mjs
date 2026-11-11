// Take the docs screenshots from a running Kestello with the sample studio site.
//   npm run screenshots                  every screenshot
//   npm run screenshots -- editor menus  only the ones whose name contains a word given
// See tools/screenshots/README.md for preparing the site.
import { open, shoot, signIn } from './browser.mjs';
import { SHOTS } from './shots.mjs';

const only = process.argv.slice(2);
const wanted = SHOTS.filter((s) => only.length === 0 || only.some((w) => s.name.includes(w)));
const { browser, context, page: first } = await open();
const failed = [];
try {
    await signIn(first);
    await first.close();
    // A new tab per shot (same sign-in), so nothing one screen leaves open or unsaved reaches the next.
    for (const shot of wanted) {
        // One retry: the PHP built-in server sometimes answers the editor's canvas slowly.
        let error = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
            const page = await context.newPage();
            page.setDefaultTimeout(15_000);
            try {
                await shot.open(page);
                await shoot(page, shot.name, shot.target ? shot.target(page) : null);
                if (shot.after) await shot.after(page); // put the site back for the next shots
                error = null;
            } catch (e) {
                error = e;
            } finally {
                await page.close({ runBeforeUnload: false });
            }
            if (error === null) {
                break;
            }
        }
        if (error !== null) {
            failed.push(shot.name);
            console.error(`  ${shot.name}: ${error.message.split('\n')[0]}`);
        }
    }
} finally {
    await browser.close();
}
console.log(`${wanted.length - failed.length} of ${wanted.length} saved.`);
process.exitCode = failed.length ? 1 : 0;
