// Add what the sample bakery site lacks for a few screenshots: a second person (a
// contributor, Ines) and a post of hers waiting for review with a comment on it. Writes the
// screenshot site's SQLite database directly; run it once after install.mjs.
//   node tools/screenshots/prepare.mjs <path to the site's folder>
// Ines has no usable password: nobody signs in as her.
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';

const root = process.argv[2];
if (!root) {
    console.error('Usage: node tools/screenshots/prepare.mjs <path to the site\'s folder>');
    process.exit(1);
}
const db = new DatabaseSync(join(root, 'storage/database/kestello.sqlite'));
const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

if (db.prepare("SELECT id FROM users WHERE username = 'ines'").get()) {
    console.log('Already prepared.');
    process.exit(0);
}

db.exec('BEGIN');
const ines = db.prepare(
    "INSERT INTO users (username, email, password, role, is_active, created_at, updated_at) VALUES ('ines', 'ines@example.com', '!', 'contributor', 1, ?, ?)",
).run(now, now).lastInsertRowid;

// A copy of a sample post, as a new draft by Ines that she has submitted for review.
const source = db.prepare("SELECT * FROM entries WHERE type = 'post' AND slug = 'soda-bread-for-a-quiet-sunday'").get();
const post = db.prepare(
    `INSERT INTO entries (type, status, title, slug, author_id, locale, template, excerpt, data, menu_order, version, published_at, created_at, updated_at)
     VALUES ('post', 'pending', ?, ?, ?, ?, ?, ?, ?, 0, 1, NULL, ?, ?)`,
).run('Our Christmas stollen, start to finish', 'our-christmas-stollen-start-to-finish', ines, source.locale, source.template, 'Four days, one loaf, and why we let it rest.', source.data, now, now).lastInsertRowid;

const comment = db.prepare('INSERT INTO entry_comments (entry_id, user_id, kind, body, created_at) VALUES (?, ?, ?, ?, ?)');
comment.run(post, ines, 'submitted', null, now);
comment.run(post, ines, 'comment', 'Could someone check the oven temperatures in step 3? I wrote them from memory.', now);
db.exec('COMMIT');

console.log(`Added the contributor "ines" and her post #${post} in review.`);
