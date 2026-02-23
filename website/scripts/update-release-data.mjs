#!/usr/bin/env node
/**
 * Updates website static data (downloads version + changelog entry)
 * for a new release. Called by the deploy-website workflow.
 *
 * Usage: node update-release-data.mjs <version> [highlights...]
 *   version    — semver without leading "v" (e.g. "0.3.0")
 *   highlights — one per arg; if none supplied, a generic line is used
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'lib', 'data');

const version = process.argv[2];
if (!version) {
  console.error('Usage: node update-release-data.mjs <version> [highlights...]');
  process.exit(1);
}

const highlights = process.argv.slice(3);
if (highlights.length === 0) {
  highlights.push(`Release v${version}`);
}

// --- Update downloads.ts VERSION ---
const downloadsPath = path.join(dataDir, 'downloads.ts');
let downloads = fs.readFileSync(downloadsPath, 'utf8');
downloads = downloads.replace(
  /export const VERSION = '.*'/,
  `export const VERSION = '${version}'`,
);
fs.writeFileSync(downloadsPath, downloads);
console.log(`downloads.ts: VERSION → ${version}`);

// --- Update changelog.ts ---
const changelogPath = path.join(dataDir, 'changelog.ts');
let changelog = fs.readFileSync(changelogPath, 'utf8');

// Skip if version already present
if (changelog.includes(`version: '${version}'`)) {
  console.log(`changelog.ts: v${version} already exists, skipping`);
  process.exit(0);
}

const date = new Date().toISOString().split('T')[0];
const hlLines = highlights.map((h) => `      '${h.replace(/'/g, "\\'")}',`).join('\n');

const entry = [
  `  {`,
  `    version: '${version}',`,
  `    date: '${date}',`,
  `    highlights: [`,
  hlLines,
  `    ],`,
  `    category: 'feature',`,
  `  },`,
].join('\n');

const marker = 'export const CHANGELOG: ChangelogEntry[] = [';
const idx = changelog.indexOf(marker);
if (idx === -1) {
  console.error('Could not find CHANGELOG array in changelog.ts');
  process.exit(1);
}

const insertPos = idx + marker.length;
changelog = changelog.slice(0, insertPos) + '\n' + entry + changelog.slice(insertPos);
fs.writeFileSync(changelogPath, changelog);
console.log(`changelog.ts: added v${version} (${highlights.length} highlights)`);
