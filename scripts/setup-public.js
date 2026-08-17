/**
 * Copies static assets from the GitHub Pages root layout into /public
 * so Next.js can serve them at the same URLs (/assets/..., /yorda.mp4, etc.).
 *
 * Run once after clone:  npm run setup:public
 * Safe to re-run (overwrites).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pub = path.join(root, 'public');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn('  skip (missing):', path.relative(root, src));
    return;
  }
  ensureDir(path.dirname(dest));
  fs.cpSync(src, dest, { recursive: true });
  console.log('  ok:', path.relative(root, dest));
}

console.log('Setting up public/ for Next.js...');
ensureDir(pub);

// Core brand + media at site root
[
  'ftagritech1.jpg',
  'yorda.mp4',
  'CNAME',
].forEach((f) => copyIfExists(path.join(root, f), path.join(pub, f)));

// Partner logos (GridArt_*.png)
fs.readdirSync(root)
  .filter((f) => f.startsWith('GridArt_') && f.endsWith('.png'))
  .forEach((f) => copyIfExists(path.join(root, f), path.join(pub, f)));

// assets/ tree (images + videos)
copyIfExists(path.join(root, 'assets'), path.join(pub, 'assets'));

console.log('Done. Next.js can now serve /assets/*, logos, and video from public/.');
