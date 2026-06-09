import fs from 'node:fs/promises';

const tokensPath = 'docs/figma-style-guide/design-tokens.json';
const svgPath = 'docs/figma-style-guide/style-guide.svg';
const readmePath = 'docs/figma-style-guide/README.md';

const tokens = JSON.parse(await fs.readFile(tokensPath, 'utf8'));
const svg = await fs.readFile(svgPath, 'utf8');
const readme = await fs.readFile(readmePath, 'utf8');

const errors = [];

function requireValue(condition, message) {
  if (!condition) errors.push(message);
}

for (const [name, hex] of Object.entries({
  red500: '#FF3045',
  red700: '#B01626',
  ink800: '#1F232B',
  gray100: '#F5F6F8',
  gray300: '#D3D6DC',
})) {
  requireValue(tokens.color?.primitive?.[name] === hex, `Missing or changed primitive color ${name}`);
}

for (const component of ['button', 'card', 'input', 'navbar']) {
  requireValue(Boolean(tokens.components?.[component]), `Missing component token spec: ${component}`);
}

for (const section of ['Color tokens', 'Tipografia', 'Espaciado, radios y elevacion', 'Biblioteca reutilizable', 'Ejemplo compuesto']) {
  requireValue(svg.includes(section), `Missing SVG section: ${section}`);
}

for (const id of [
  'component-button-primary-md-default',
  'component-button-secondary-md-default',
  'component-button-ghost-sm-default',
  'component-card-course',
  'component-card-metric',
  'component-card-lesson',
  'component-input-default',
  'component-input-focus',
  'component-input-error',
  'component-input-disabled',
  'component-navbar-public',
  'component-navbar-student',
  'component-navbar-instructor',
]) {
  requireValue(svg.includes(`id="${id}"`), `Missing SVG component group: ${id}`);
}

const ids = Array.from(svg.matchAll(/id="([^"]+)"/g), (match) => match[1]);
const seenIds = new Set();
const duplicateIds = new Set();
for (const id of ids) {
  if (seenIds.has(id)) duplicateIds.add(id);
  seenIds.add(id);
}
requireValue(duplicateIds.size === 0, `Duplicate SVG ids: ${Array.from(duplicateIds).join(', ')}`);

requireValue(svg.includes('width="1440"'), 'SVG width should remain 1440 for Figma desktop import');
requireValue(svg.includes('height="3900"'), 'SVG height should remain 3900 for the one-page style guide v2');

for (const criterion of [
  'Guia de estilo en una pagina',
  'Componentes base definidos',
  'Decisiones documentadas',
]) {
  requireValue(readme.includes(criterion), `README does not document acceptance criterion: ${criterion}`);
}

if (errors.length > 0) {
  console.error(JSON.stringify({ errorCount: errors.length, errors }, null, 2));
  process.exitCode = 1;
} else {
  console.log('Style guide validation passed: tokens, SVG sections, unique ids, components, and README criteria are present.');
}
