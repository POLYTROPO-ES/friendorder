// Generates PNG favicon / apple-touch-icon / PWA icons from public/favicon.svg.
// Run: npm run icons
import { resolve } from 'node:path';
import sharp from 'sharp';

const source = resolve('public/favicon.svg');
const outDir = resolve('public');

const ICONS = [
  ['favicon-16.png', 16],
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
  ['favicon-192.png', 192],
  ['favicon-512.png', 512],
  ['favicon-512-maskable.png', 512],
];

for (const [name, size] of ICONS) {
  await sharp(source).resize(size, size).png().toFile(resolve(outDir, name));
  console.log(`Generated ${name} (${size}x${size})`);
}
