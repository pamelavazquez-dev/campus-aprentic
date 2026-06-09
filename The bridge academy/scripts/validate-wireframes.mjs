import fs from 'node:fs/promises';
import path from 'node:path';

const dir = 'docs/wireframes';
const allowed = new Set(['#F5F5F5', '#D9D9D9', '#BFBFBF', '#999999', '#000000', '#FFFFFF']);
const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.svg'));
const issues = [];

for (const file of files) {
  const fullPath = path.join(dir, file);
  const svg = await fs.readFile(fullPath, 'utf8');
  if (!svg.includes('width="1440"') || !svg.includes('height="1024"')) {
    issues.push(`${file}: frame is not 1440 x 1024`);
  }

  const colors = [...svg.matchAll(/(?:fill|stroke)="(#[A-Fa-f0-9]{6})"/g)].map((match) => match[1].toUpperCase());
  for (const color of colors) {
    if (!allowed.has(color)) {
      issues.push(`${file}: disallowed color ${color}`);
    }
  }
}

if (issues.length > 0) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Wireframe check passed: ${files.length} SVG frames are 1440 x 1024 and use only the allowed grayscale palette.`);
}
