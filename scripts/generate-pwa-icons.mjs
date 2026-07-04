/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const iconsDir = path.join(root, 'public', 'icons');
const sourceSvg = path.join(iconsDir, 'icon.svg');

async function ensureDir() {
  await fs.mkdir(iconsDir, { recursive: true });
}

async function generateIcon(size, outputName) {
  await sharp(sourceSvg)
    .resize(size, size, {
      fit: 'contain',
      background: '#0f172a'
    })
    .png()
    .toFile(path.join(iconsDir, outputName));
}

await ensureDir();

await generateIcon(192, 'icon-192.png');
await generateIcon(512, 'icon-512.png');
await generateIcon(512, 'icon-maskable-512.png');

console.log('PWA icons generated successfully.');