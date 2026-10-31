#!/usr/bin/env node
/**
 * Content checklist — run with:  npm run check
 *
 * Lists everything still unfinished before you publish:
 *   1. every [TO FILL ...] marker in your content
 *   2. empty links (GitHub, YouTube, demos)
 *   3. images / documents the site expects but can't find
 *
 * Add --strict to exit with an error code when anything is outstanding (handy before deploying).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const rel = (p) => path.relative(root, p);
const exists = (p) => fs.existsSync(path.join(root, 'public', p.replace(/^\//, '')));

let outstanding = 0;
const section = (title) => console.log(`\n\x1b[1m${title}\x1b[0m`);
const item = (text) => {
  outstanding += 1;
  console.log(`  • ${text}`);
};

/* ---------- 1. [TO FILL] markers ---------- */
section('1. Text still to fill in  ([TO FILL: ...])');
const contentFiles = [
  ...fs
    .readdirSync(path.join(root, 'src/content/projects'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => path.join(root, 'src/content/projects', f)),
  ...fs
    .readdirSync(path.join(root, 'src/data'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(root, 'src/data', f)),
];

let markers = 0;
for (const file of contentFiles) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const matches = line.match(/\[TO FILL[^\]]*\]/g);
    if (!matches) return;
    matches.forEach((m) => {
      markers += 1;
      item(`${rel(file)}:${i + 1}  ${m}`);
    });
  });
}
if (markers === 0) console.log('  ✓ none');

/* ---------- 2. Empty links ---------- */
section('2. Links still empty');
const profile = JSON.parse(fs.readFileSync(path.join(root, 'src/data/profile.json'), 'utf8'));
let emptyLinks = 0;
for (const key of ['github', 'youtube']) {
  if (!profile.contact[key]) {
    emptyLinks += 1;
    item(`src/data/profile.json  contact.${key} is empty (that button is hidden until you add it)`);
  }
}
for (const f of fs.readdirSync(path.join(root, 'src/content/projects')).filter((f) => f.endsWith('.md'))) {
  const text = fs.readFileSync(path.join(root, 'src/content/projects', f), 'utf8');
  const featured = /^featured:\s*true/m.test(text);
  for (const key of featured ? ['github', 'demo'] : ['github']) {
    if (new RegExp(`^\\s+${key}:\\s*""`, 'm').test(text)) {
      emptyLinks += 1;
      item(`src/content/projects/${f}  links.${key} is empty`);
    }
  }
}
if (emptyLinks === 0) console.log('  ✓ none');

/* ---------- 3. Missing images & documents ---------- */
section('3. Images and documents the site looks for');
let missing = 0;
const need = (p, why) => {
  if (!exists(p)) {
    missing += 1;
    item(`public${p}  (${why})`);
  }
};

if (!profile.photoCandidates.some(exists)) {
  missing += 1;
  item('public/images/profile/rindi.webp  (your photo; .jpg/.png also work)');
}
need('/og.png', 'share-preview image for LinkedIn/WhatsApp');

const certs = JSON.parse(fs.readFileSync(path.join(root, 'src/data/certificates.json'), 'utf8'));
for (const c of certs.items) need(c.file, `scan for "${c.title}"`);

for (const f of fs.readdirSync(path.join(root, 'src/content/projects')).filter((f) => f.endsWith('.md'))) {
  const id = f.replace(/\.md$/, '');
  const text = fs.readFileSync(path.join(root, 'src/content/projects', f), 'utf8');
  const found = [1, 2, 3].filter((n) =>
    ['webp', 'png', 'jpg', 'jpeg', 'avif', 'svg'].some((ext) => exists(`/images/projects/${id}/${n}.${ext}`))
  );
  if (found.length < 3 && !/^slides:\s*\n\s+- /m.test(text)) {
    missing += 1;
    item(`public/images/projects/${id}/1.webp, 2.webp, 3.webp  (documentation slides; optional, text slides are shown until you add them)`);
  }
}
if (missing === 0) console.log('  ✓ none');

/* ---------- Summary ---------- */
section('Summary');
console.log(
  `  ${markers} text gap(s) · ${emptyLinks} empty link(s) · ${missing} missing file(s)\n` +
    '  None of these stop the site from building; they are what is left to personalize.\n'
);
if (strict && outstanding > 0) process.exit(1);
