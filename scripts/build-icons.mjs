import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const icon = Buffer.from(
  '<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#122441"/><rect x="108" y="108" width="296" height="296" rx="82" fill="#63e6bd"/><path d="m173 259 55 55 112-121" fill="none" stroke="#122441" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/></svg>',
);
await mkdir('public/icons', { recursive: true });
for (const [file, size] of [
  ['icon-192', 192],
  ['icon-512', 512],
  ['icon-maskable-512', 512],
  ['apple-touch-icon', 180],
])
  await sharp(icon)
    .resize(size, size)
    .png()
    .toFile('public/icons/' + file + '.png');
console.log('Four application icons generated.');
