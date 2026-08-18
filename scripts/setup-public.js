/**
 * Copies static media into /public so Next.js can serve them at stable URLs
 * (/assets/..., /yorda.mp4, /ftagritech1.jpg, /GridArt_*.png).
 *
 * Run after clone or before build:
 *   npm run setup:public
 * Safe to re-run (overwrites).
 *
 * Vercel Build Command should be:
 *   npm run setup:public && next build
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

// Brand + hero media at site root
['ftagritech1.jpg', 'yorda.mp4'].forEach((f) =>
  copyIfExists(path.join(root, f), path.join(pub, f))
);

// Partner logos
fs.readdirSync(root)
  .filter((f) => f.startsWith('GridArt_') && f.endsWith('.png'))
  .forEach((f) => copyIfExists(path.join(root, f), path.join(pub, f)));

// Product / category images
copyIfExists(path.join(root, 'assets'), path.join(pub, 'assets'));

console.log('Done. Next.js can serve /assets/*, logos, and video from public/.');
