import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check, checkScreenshots } from '../tools/check-style.mjs';

const messages = (md) => check(md).map((p) => `${p.line}: ${p.message}`);

test('dashes and banned words in prose are reported with their line', () => {
    assert.deepEqual(messages('# Page\n\nIt is fast — really.\nJust click **Save**.'), [
        '3: en or em dash: use a comma, colon, parentheses or a new sentence',
        '4: "just" is on the banned list in STYLE.md',
    ]);
});

test('code, link targets and comments are not prose', () => {
    const md = ['Run `npm run just-build`.', '```bash', 'echo "simply – easy"', '```', 'See [the guide](/guide/easy-setup).', '<!-- robust -->'].join('\n');
    assert.deepEqual(messages(md), []);
});

test('headings are sentence case and calm', () => {
    assert.deepEqual(messages('## Restore A Backup Now\n\n## Restore a backup {#restore}\n\n## Done!'), [
        '1: headings are sentence case',
        '5: no exclamation marks in headings',
    ]);
});

test('product and label names in a heading are fine', () => {
    assert.deepEqual(messages('## Update Kestello\n\n## Check the Updates screen'), []);
});

test('screenshots need alt text and a file', () => {
    const md = ['![The Menus screen with two menus.](/screenshots/menus.png)', '', '![](/screenshots/menus.png)', '![The Backups screen with one backup.](/screenshots/gone.png)'].join('\n');
    const found = checkScreenshots(md, (file) => file === 'screenshots/menus.png').map((p) => `${p.line}: ${p.message}`);
    assert.deepEqual(found, [
        '3: screenshots/menus.png: describe what the screenshot shows in its alt text',
        '4: screenshots/gone.png does not exist: run npm run screenshots, or fix the name',
    ]);
});
