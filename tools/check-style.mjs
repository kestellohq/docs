// The rules from STYLE.md a machine can check, outside code: no en or em dashes, none of the
// banned words, no exclamation marks in headings, sentence-case headings, and screenshots that
// have alt text and exist under public/screenshots/.
// Usage: node tools/check-style.mjs [files...]   (default: every page)
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const BANNED = ['seamless', 'robust', 'leverage', 'powerful', 'effortless', 'cutting-edge', 'delve', 'unlock', 'elevate', 'streamline', 'game-changer', 'simply', 'just', 'easy', 'obviously'];

/** Prose only: fenced blocks, inline code, link targets and HTML comments removed. */
export function prose(markdown) {
    return markdown
        .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '))
        .replace(/^(```|~~~)[\s\S]*?^\1/gm, (m) => m.replace(/[^\n]/g, ' '))
        .replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length))
        .replace(/\]\([^)\n]*\)/g, (m) => ' '.repeat(m.length));
}

/** @returns {{line: number, message: string}[]} */
export function check(markdown) {
    const problems = [];
    prose(markdown)
        .split('\n')
        .forEach((text, i) => {
            const line = i + 1;
            if (/[–—]/.test(text)) problems.push({ line, message: 'en or em dash: use a comma, colon, parentheses or a new sentence' });
            for (const word of BANNED) {
                if (new RegExp(`\\b${word}\\b`, 'i').test(text)) problems.push({ line, message: `"${word}" is on the banned list in STYLE.md` });
            }
            const heading = /^#{2,6}\s+(.*?)\s*(\{#[^}]*\})?$/.exec(text);
            if (heading) {
                if (heading[1].includes('!')) problems.push({ line, message: 'no exclamation marks in headings' });
                const words = heading[1].split(/\s+/).slice(1);
                const capitalised = words.filter((w) => /^[A-Z][a-z]*$/.test(w));
                if (words.length >= 3 && capitalised.length >= Math.ceil(words.length * 0.75)) problems.push({ line, message: 'headings are sentence case' });
            }
        });
    return problems;
}

/**
 * Every screenshot needs alt text (what the picture shows, for people who can't see it) and
 * a file. `exists` is given the path under public/, such as "screenshots/menus.png".
 *
 * @param {(file: string) => boolean} exists
 * @returns {{line: number, message: string}[]}
 */
export function checkScreenshots(markdown, exists) {
    const problems = [];
    markdown.split('\n').forEach((text, i) => {
        for (const m of text.matchAll(/!\[([^\]]*)\]\(\/(screenshots\/[^)\s]+)\)/g)) {
            if (m[1].trim().length < 10) problems.push({ line: i + 1, message: `${m[2]}: describe what the screenshot shows in its alt text` });
            if (!exists(m[2])) problems.push({ line: i + 1, message: `${m[2]} does not exist: run npm run screenshots, or fix the name` });
        }
    });
    return problems;
}

function pages(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? pages(path.join(dir, e.name)) : e.name.endsWith('.md') ? [path.join(dir, e.name)] : []));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    const files = process.argv.length > 2 ? process.argv.slice(2) : [...pages('guide'), ...pages('developers'), 'index.md'];
    let count = 0;
    for (const file of files) {
        const markdown = readFileSync(file, 'utf8');
        for (const p of [...check(markdown), ...checkScreenshots(markdown, (f) => existsSync(path.join('public', f)))]) {
            count++;
            console.log(`${file}:${p.line}: ${p.message}`);
        }
    }
    if (count > 0) {
        console.error(`\n${count} style problem(s). See STYLE.md.`);
        process.exit(1);
    }
    console.log(`Style: ${files.length} pages checked.`);
}
