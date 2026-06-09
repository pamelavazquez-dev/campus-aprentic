import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let sharp = null;
try {
  sharp = require('sharp');
} catch {
  sharp = null;
}

let playwright = null;
try {
  playwright = require('playwright');
} catch {
  playwright = null;
}

const outDir = path.resolve('docs/figma-demo');

const colors = {
  ink: '#1F232B',
  black: '#0D0D0D',
  slate: '#343943',
  muted: '#6B7280',
  line: '#D3D6DC',
  panel: '#ffffff',
  app: '#F5F6F8',
  teal: '#FF3045',
  tealSoft: '#FFE5E8',
  blue: '#1F232B',
  blueSoft: '#ECEFF3',
  amber: '#B01626',
  amberSoft: '#FFE9EC',
  coral: '#FF3045',
  coralSoft: '#FFE5E8',
  green: '#FF3045',
  greenSoft: '#FFE5E8',
  violet: '#7B1D18',
  violetSoft: '#F4E4E2',
  red: '#FF3045',
  darkRed: '#B01626',
  burgundy: '#7B1D18',
  cloud: '#F5F6F8',
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svgRoot(width, height, body, title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0D0D0D" flood-opacity="0.14"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#0D0D0D" flood-opacity="0.10"/>
    </filter>
    <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
      <path d="M2,2 L10,6 L2,10 Z" fill="${colors.slate}"/>
    </marker>
    <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF3045"/>
      <stop offset="58%" stop-color="#B01626"/>
      <stop offset="100%" stop-color="#7B1D18"/>
    </linearGradient>
    <linearGradient id="brandRed" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF3045"/>
      <stop offset="100%" stop-color="#B01626"/>
    </linearGradient>
    <linearGradient id="inkGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D0D0D"/>
      <stop offset="100%" stop-color="#1F232B"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${colors.app}"/>
  ${body}
</svg>`;
}

function rect(x, y, w, h, r, fill, stroke = 'none', sw = 1, extra = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function circle(cx, cy, r, fill, stroke = 'none', sw = 1, extra = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function line(x1, y1, x2, y2, stroke = colors.slate, sw = 2, dashed = false) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" ${dashed ? 'stroke-dasharray="8 8"' : ''} marker-end="url(#arrow)"/>`;
}

function pathArrow(d, stroke = colors.slate, sw = 2, dashed = false) {
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" ${dashed ? 'stroke-dasharray="8 8"' : ''} marker-end="url(#arrow)"/>`;
}

function connector(points, stroke = colors.slate, sw = 2, dashed = false) {
  const d = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ');
  return pathArrow(d, stroke, sw, dashed);
}

function text(x, y, value, size = 20, fill = colors.ink, weight = 500, anchor = 'start', extra = '') {
  return `<text x="${x}" y="${y}" font-family="Montserrat, Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${extra}>${esc(value)}</text>`;
}

function tspanLines(x, y, lines, size = 18, fill = colors.slate, weight = 400, gap = 24) {
  return lines
    .map((lineValue, index) => text(x, y + index * gap, lineValue, size, fill, weight))
    .join('\n');
}

function badge(x, y, label, fill, textColor = colors.ink, width = null) {
  const w = width ?? Math.max(76, label.length * 9 + 24);
  return [
    rect(x, y, w, 30, 7, fill),
    text(x + w / 2, y + 20, label, 13, textColor, 800, 'middle'),
  ].join('\n');
}

function button(x, y, w, label, fill = 'url(#brandRed)', textColor = '#ffffff') {
  return [
    rect(x, y, w, 36, 8, fill, fill === '#ffffff' ? colors.line : 'none'),
    text(x + w / 2, y + 23, label, 13, textColor, 900, 'middle'),
  ].join('\n');
}

function brandIcon(x, y, size = 58) {
  const scale = size / 58;
  const s = (n) => Number((n * scale).toFixed(2));
  return [
    rect(x, y, size, size, 14, 'url(#brandRed)'),
    rect(x + s(13), y + s(23), s(32), s(22), s(3), 'none', '#ffffff', s(3)),
    `<path d="M${x + s(13)} ${y + s(18)} L${x + s(43)} ${y + s(11)} L${x + s(44)} ${y + s(17)} L${x + s(15)} ${y + s(24)} Z" fill="#ffffff"/>`,
    `<path d="M${x + s(20)} ${y + s(18)} L${x + s(25)} ${y + s(22)} M${x + s(31)} ${y + s(15)} L${x + s(36)} ${y + s(19)}" stroke="#FF3045" stroke-width="${s(3)}"/>`,
    rect(x + s(22), y + s(35), s(5), s(8), 1, '#ffffff'),
    rect(x + s(31), y + s(30), s(5), s(13), 1, '#ffffff'),
    rect(x + s(40), y + s(25), s(5), s(18), 1, '#ffffff'),
  ].join('\n');
}

function courseVisual(x, y, w, h, type = 'react') {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const unit = Math.min(w, h);
  if (type === 'node') {
    return [
      rect(x, y, w, h, 8, '#ffffff'),
      circle(cx - unit * 0.18, cy, unit * 0.28, colors.red),
      rect(cx - unit * 0.46, cy - unit * 0.24, unit * 0.48, unit * 0.36, 6, '#ffffff'),
      rect(cx - unit * 0.06, cy - unit * 0.32, unit * 0.32, unit * 0.52, 6, colors.ink),
      text(cx + unit * 0.1, cy + unit * 0.07, 'py', unit * 0.18, '#ffffff', 900, 'middle'),
      rect(cx + unit * 0.24, cy - unit * 0.12, unit * 0.28, unit * 0.4, 6, '#FFC43D'),
    ].join('\n');
  }

  if (type === 'data') {
    return [
      rect(x, y, w, h, 8, '#ffffff'),
      circle(cx - unit * 0.16, cy - unit * 0.12, unit * 0.28, colors.red),
      rect(cx - unit * 0.48, cy - unit * 0.28, unit * 0.58, unit * 0.32, 8, '#ffffff'),
      rect(cx - unit * 0.48, cy - unit * 0.08, unit * 0.58, unit * 0.32, 8, colors.cloud),
      rect(cx + unit * 0.04, cy - unit * 0.02, unit * 0.32, unit * 0.24, 6, '#ffffff'),
      circle(cx + unit * 0.28, cy + unit * 0.26, unit * 0.16, 'url(#brandRed)'),
      text(cx + unit * 0.28, cy + unit * 0.32, '↓', unit * 0.24, '#ffffff', 900, 'middle'),
    ].join('\n');
  }

  const rx = unit * 0.34;
  const ry = unit * 0.38;
  const stroke = Math.max(3, unit * 0.07);
  return [
    rect(x, y, w, h, 8, '#ffffff'),
    `<path d="M${cx - rx} ${cy} C${cx - rx * 0.5} ${cy - ry}, ${cx + rx * 0.52} ${cy - ry}, ${cx + rx} ${cy} C${cx + rx * 0.5} ${cy + ry}, ${cx - rx * 0.52} ${cy + ry}, ${cx - rx} ${cy} Z" fill="none" stroke="#FF3045" stroke-width="${stroke}"/>`,
    `<path d="M${cx - rx} ${cy} C${cx - rx * 0.5} ${cy + ry}, ${cx + rx * 0.52} ${cy + ry}, ${cx + rx} ${cy} C${cx + rx * 0.5} ${cy - ry}, ${cx - rx * 0.52} ${cy - ry}, ${cx - rx} ${cy} Z" fill="none" stroke="#FF3045" stroke-width="${stroke}"/>`,
    circle(cx, cy, unit * 0.09, colors.red),
  ].join('\n');
}

function titleBlock(title, subtitle, eyebrow = 'GUIA DE BRANDING') {
  return [
    brandIcon(70, 50, 76),
    text(170, 76, eyebrow, 18, colors.red, 900),
    text(170, 112, 'ACADEMY', 42, colors.ink, 900),
    text(170, 156, 'EDITION', 42, colors.red, 900),
    text(560, 94, title, 38, colors.ink, 900),
    text(560, 132, subtitle, 18, colors.black, 500),
  ].join('\n');
}

function flowNode(x, y, w, h, label, desc, priority, fill, stroke) {
  const lines = Array.isArray(desc) ? desc : [desc];
  return [
    rect(x, y, w, h, 8, '#ffffff', stroke, 2, 'filter="url(#softShadow)"'),
    badge(x + 18, y + 14, priority, fill, colors.ink),
    text(x + 18, y + 64, label, 20, colors.ink, 900),
    tspanLines(x + 18, y + 94, lines, 14, colors.slate, 600, 20),
  ].join('\n');
}

function screenFrame(x, y, w, h, title, body, accent = colors.teal) {
  const compact = w < 430;
  const titleSize = compact ? 14 : 17;
  const badgeW = compact ? 70 : 112;
  const badgeX = x + w - badgeW - 20;
  return [
    rect(x, y, w, h, 8, colors.panel, colors.line, 1, 'filter="url(#shadow)"'),
    rect(x, y, w, 58, 8, 'url(#inkGrad)', colors.black, 1),
    circle(x + 26, y + 29, 6, colors.red),
    circle(x + 46, y + 29, 6, '#ffffff'),
    circle(x + 66, y + 29, 6, colors.ink),
    text(x + 92, y + 36, title, titleSize, '#ffffff', 800),
    rect(badgeX, y + 18, badgeW, 24, 6, '#ffffff'),
    text(badgeX + badgeW / 2, y + 35, 'ACADEMY', compact ? 10 : 12, accent, 900, 'middle'),
    body(x, y + 58, w, h - 58, accent),
  ].join('\n');
}

function navBar(x, y, w, active = 'Cursos') {
  if (w < 430) {
    const activeLabel = active === 'Dashboard' ? 'Panel' : active;
    return [
      rect(x, y, w, 56, 0, '#ffffff'),
      brandIcon(x + 20, y + 12, 32),
      text(x + 62, y + 29, 'ACADEMY', 14, colors.ink, 900),
      text(x + 62, y + 45, 'EDITION', 14, colors.red, 900),
      rect(x + w - 132, y + 15, 76, 28, 6, colors.tealSoft),
      text(x + w - 94, y + 35, activeLabel, 11, colors.red, 900, 'middle'),
      rect(x + w - 46, y + 15, 26, 28, 6, 'url(#brandRed)'),
      text(x + w - 33, y + 35, 'L', 12, '#ffffff', 900, 'middle'),
    ].join('\n');
  }

  if (w < 560) {
    const items = [
      ['Cursos', 'Cursos'],
      ['Dashboard', 'Panel'],
      ['Perfil', 'Perfil'],
    ];
    return [
      rect(x, y, w, 56, 0, '#ffffff'),
      brandIcon(x + 20, y + 12, 32),
      text(x + 62, y + 29, 'ACADEMY', 14, colors.ink, 900),
      text(x + 62, y + 45, 'EDITION', 14, colors.red, 900),
      ...items.map(([key, label], index) => {
        const ix = x + 168 + index * 78;
        return [
          text(ix, y + 35, label, 12, key === active ? colors.red : colors.muted, 800),
          key === active ? rect(ix, y + 47, 44, 3, 2, colors.red) : '',
        ].join('\n');
      }),
      rect(x + w - 54, y + 15, 30, 28, 6, 'url(#brandRed)'),
      text(x + w - 39, y + 35, 'L', 12, '#ffffff', 900, 'middle'),
    ].join('\n');
  }

  const items = ['Cursos', 'Dashboard', 'Perfil'];
  return [
    rect(x, y, w, 56, 0, '#ffffff'),
    brandIcon(x + 24, y + 12, 32),
    text(x + 66, y + 28, 'ACADEMY', 16, colors.ink, 900),
    text(x + 66, y + 45, 'EDITION', 16, colors.red, 900),
    ...items.map((item, index) => {
      const ix = x + 220 + index * 110;
      return [
        text(ix, y + 35, item, 14, item === active ? colors.red : colors.muted, 800),
        item === active ? rect(ix, y + 47, 60, 3, 2, colors.red) : '',
      ].join('\n');
    }),
    rect(x + w - 126, y + 15, 92, 28, 6, 'url(#brandRed)'),
    text(x + w - 80, y + 35, 'Login', 13, '#ffffff', 900, 'middle'),
  ].join('\n');
}

function courseCard(x, y, w, title, tag, progress = null, fill = colors.blueSoft) {
  const visualType = tag.includes('NODE') || title.includes('API') ? 'node' : tag.includes('%') || tag.includes('ACTIVO') ? 'data' : 'react';
  if (w < 360) {
    const barW = Math.min(150, w - 126);
    return [
      rect(x, y, w, 150, 8, '#ffffff', colors.line, 1),
      rect(x, y, w, 50, 8, 'url(#brandRed)'),
      text(x + 16, y + 32, title, 15, '#ffffff', 900),
      rect(x + 16, y + 68, 64, 54, 8, fill),
      courseVisual(x + 21, y + 74, 54, 42, visualType),
      text(x + 96, y + 82, 'Laura Ruiz', 12, colors.muted, 700),
      text(x + 96, y + 104, '4.7 estrellas', 12, colors.slate, 700),
      progress === null
        ? [rect(x + 96, y + 120, 88, 22, 6, colors.greenSoft), text(x + 140, y + 135, 'Publicado', 11, colors.green, 900, 'middle')].join('\n')
        : [rect(x + 96, y + 122, barW, 9, 5, '#E5E7EB'), rect(x + 96, y + 122, (barW * progress) / 100, 9, 5, colors.red), text(x + 96 + barW + 10, y + 131, `${progress}%`, 12, colors.ink, 900)].join('\n'),
    ].join('\n');
  }

  return [
    rect(x, y, w, 150, 8, '#ffffff', colors.line, 1),
    rect(x, y, w, 62, 8, 'url(#brandRed)'),
    rect(x + 16, y + 16, 112, 84, 8, fill),
    courseVisual(x + 24, y + 24, 96, 68, visualType),
    text(x + 146, y + 42, title, 18, '#ffffff', 800),
    text(x + 146, y + 70, 'Instructor: Laura Ruiz', 13, colors.muted, 600),
    text(x + 146, y + 98, '4.7 estrellas  |  12 lecciones', 13, colors.slate, 600),
    progress === null
      ? [rect(x + 146, y + 116, 96, 24, 6, colors.greenSoft), text(x + 194, y + 133, 'Publicado', 12, colors.green, 900, 'middle')].join('\n')
      : [rect(x + 146, y + 116, 210, 10, 5, '#E5E7EB'), rect(x + 146, y + 116, progress * 2.1, 10, 5, colors.red), text(x + 368, y + 125, `${progress}%`, 13, colors.ink, 900)].join('\n'),
  ].join('\n');
}

function overviewSvg() {
  const body = [
    titleBlock('Aprende. Explora. Analiza. Inspira.', 'Demo Figma completa con la identidad Academy Edition'),
    rect(70, 190, 1660, 900, 8, '#ffffff', colors.line, 1, 'filter="url(#shadow)"'),
    rect(110, 228, 1530, 82, 8, colors.cloud, colors.line, 1),
    text(135, 258, 'Lectura del flujo', 18, colors.ink, 900),
    badge(135, 272, 'Must', colors.greenSoft, colors.green),
    badge(230, 272, 'Should', colors.amberSoft, '#a66b00'),
    badge(345, 272, 'Could', colors.violetSoft, colors.violet),
    badge(445, 272, "Won't", colors.coralSoft, colors.coral),
    text(575, 274, 'Flujo principal', 14, colors.slate, 800),
    rect(575, 286, 96, 4, 2, colors.red),
    text(720, 274, 'Extras opcionales', 14, colors.slate, 800),
    rect(720, 286, 96, 4, 2, colors.violet, 'none', 1, 'stroke-dasharray="8 8"'),
    text(870, 292, 'Los conectores entran y salen por el centro de cada tarjeta.', 14, colors.slate, 600),

    text(110, 352, 'Publico', 21, colors.ink, 900),
    text(445, 352, 'Autenticacion', 21, colors.ink, 900),
    text(780, 352, 'Instructor', 21, colors.ink, 900),
    text(1115, 352, 'Alumno', 21, colors.ink, 900),
    text(1450, 352, 'Extras', 21, colors.ink, 900),

    rect(92, 365, 292, 630, 8, colors.cloud, colors.line, 1),
    rect(427, 365, 292, 630, 8, colors.cloud, colors.line, 1),
    rect(762, 365, 292, 630, 8, colors.cloud, colors.line, 1),
    rect(1097, 365, 292, 630, 8, colors.cloud, colors.line, 1),
    rect(1432, 365, 262, 630, 8, colors.cloud, colors.line, 1),

    flowNode(110, 398, 250, 132, 'Home', ['Cursos destacados', 'Categorias y CTA'], 'Must', colors.greenSoft, colors.green),
    flowNode(110, 582, 250, 132, 'Listado', ['Busqueda, filtros', 'paginacion'], 'Must', colors.greenSoft, colors.green),
    flowNode(110, 766, 250, 132, 'Detalle curso', ['Temario, reviews', 'sin alta directa'], 'Must', colors.greenSoft, colors.green),
    flowNode(445, 492, 250, 132, 'Login', ['JWT y sesion', 'redirige por rol'], 'Must', colors.greenSoft, colors.green),
    flowNode(445, 736, 250, 132, 'Registro', ['Alumno o instructor', 'validacion Zod'], 'Must', colors.greenSoft, colors.green),
    flowNode(780, 398, 250, 132, 'Dashboard', ['Cursos creados', 'metricas base'], 'Should', colors.amberSoft, '#d89116'),
    flowNode(780, 582, 250, 132, 'Wizard curso', ['Datos basicos', 'modulos, lecciones'], 'Must', colors.greenSoft, colors.green),
    flowNode(780, 766, 250, 132, 'Gestion curso', ['Editar, publicar', 'inscribir alumnos'], 'Must', colors.greenSoft, colors.green),
    flowNode(1115, 398, 250, 132, 'Mis cursos', ['Progreso por curso', 'continuar leccion'], 'Must', colors.greenSoft, colors.green),
    flowNode(1115, 582, 250, 132, 'Visor leccion', ['PDF/video', 'completar leccion'], 'Must', colors.greenSoft, colors.green),
    flowNode(1115, 766, 250, 132, 'Reviews', ['Puntuacion y comentario', 'solo inscritos'], 'Should', colors.amberSoft, '#d89116'),
    flowNode(1450, 406, 220, 124, 'Certificado', ['PDF al 100%', 'descarga'], 'Could', colors.violetSoft, colors.violet),
    flowNode(1450, 596, 220, 124, 'Tema e i18n', ['Claro/oscuro', 'ES/EN'], 'Could', colors.violetSoft, colors.violet),
    flowNode(1450, 786, 220, 124, 'Pagos reales', ['Fuera de alcance', 'informativo'], "Won't", colors.coralSoft, colors.coral),

    connector([[235, 530], [235, 582]], colors.red, 3),
    connector([[235, 714], [235, 766]], colors.red, 3),
    connector([[360, 832], [402, 832], [402, 558], [445, 558]], colors.red, 3),
    connector([[360, 858], [410, 858], [410, 802], [445, 802]], colors.red, 3),

    connector([[695, 558], [740, 558], [740, 464], [780, 464]], colors.red, 3),
    connector([[695, 802], [740, 802], [740, 648], [780, 648]], colors.red, 3),
    connector([[905, 530], [905, 582]], colors.red, 3),
    connector([[905, 714], [905, 766]], colors.red, 3),

    connector([[695, 558], [735, 558], [735, 942], [1075, 942], [1075, 464], [1115, 464]], colors.red, 3),
    connector([[1240, 530], [1240, 582]], colors.red, 3),
    connector([[1240, 714], [1240, 766]], colors.red, 3),

    connector([[1365, 648], [1408, 648], [1408, 468], [1450, 468]], colors.violet, 2, true),
    connector([[1365, 832], [1416, 832], [1416, 658], [1450, 658]], colors.violet, 2, true),
    connector([[1670, 848], [1708, 848], [1708, 944], [1430, 944], [1430, 848], [1450, 848]], colors.coral, 2, true),
  ].join('\n');

  return svgRoot(1800, 1160, body, 'Demo Figma Academy Edition');
}

function publicDiscoverySvg() {
  const publicCourseCard = (x, y, w, title, type) => [
    rect(x, y, w, 145, 8, '#ffffff', colors.line, 1),
    rect(x, y, w, 60, 8, 'url(#brandRed)'),
    rect(x + 16, y + 18, 108, 76, 8, colors.tealSoft),
    courseVisual(x + 28, y + 28, 84, 56, type),
    text(x + 146, y + 45, title, 17, '#ffffff', 900),
    text(x + 146, y + 75, 'Instructor: Laura Ruiz', 12, colors.muted, 600),
    text(x + 146, y + 103, '4.7 estrellas | 12 lecciones', 12, colors.black, 600),
    rect(x + 146, y + 119, 92, 24, 6, colors.greenSoft),
    text(x + 192, y + 136, 'Publicado', 11, colors.green, 900, 'middle'),
  ].join('\n');

  const homeBody = (x, y, w, h) => [
    navBar(x, y, w, 'Cursos'),
    rect(x + 34, y + 90, w - 68, 190, 8, 'url(#hero)'),
    text(x + 70, y + 142, 'Domina la', 28, '#ffffff', 900),
    text(x + 70, y + 176, 'programacion hoy', 28, '#ffffff', 900),
    text(x + 70, y + 212, 'Aprende, explora y analiza', 15, '#ffffff', 600),
    text(x + 70, y + 234, 'cursos profesionales paso a paso.', 15, '#ffffff', 600),
    button(x + 70, y + 248, 136, 'Explorar', '#ffffff', colors.ink),
    rect(x + 330, y + 118, 104, 104, 8, '#ffffff30'),
    courseVisual(x + 346, y + 136, 72, 68, 'react'),
    rect(x + 432, y + 100, 18, 130, 8, '#ffffff20'),
    text(x + 34, y + 330, 'Categorias', 19, colors.ink, 900),
    ...['Full Stack', 'UX/UI', 'Datos'].map((item, index) => [
      rect(x + 34 + index * 154, y + 355, 128, 74, 8, [colors.tealSoft, colors.amberSoft, colors.blueSoft][index]),
      text(x + 98 + index * 154, y + 400, item, 15, colors.ink, 800, 'middle'),
    ].join('\n')),
  ].join('\n');

  const listingBody = (x, y, w, h) => [
    navBar(x, y, w, 'Cursos'),
    rect(x + 34, y + 86, w - 68, 54, 8, '#ffffff', colors.line),
    text(x + 58, y + 120, 'Buscar: React', 15, colors.slate, 700),
    rect(x + 300, y + 100, 90, 26, 7, colors.tealSoft),
    text(x + 345, y + 118, 'Gratis', 12, colors.teal, 800, 'middle'),
    rect(x + 400, y + 100, 92, 26, 7, colors.blueSoft),
    text(x + 446, y + 118, '4+ stars', 12, colors.blue, 800, 'middle'),
    publicCourseCard(x + 34, y + 170, w - 68, 'Desarrollo Web con React', 'react'),
    publicCourseCard(x + 34, y + 340, w - 68, 'Diseno de APIs con Node.js', 'node'),
    text(x + 34, y + 540, 'Pagina 1 de 4', 13, colors.muted, 700),
  ].join('\n');

  const detailBody = (x, y, w, h) => [
    navBar(x, y, w, 'Cursos'),
    rect(x + 34, y + 88, 190, 154, 8, colors.tealSoft),
    rect(x + 54, y + 112, 150, 88, 8, 'url(#brandRed)'),
    courseVisual(x + 77, y + 122, 104, 68, 'react'),
    text(x + 252, y + 112, 'Desarrollo Web', 23, colors.ink, 900),
    text(x + 252, y + 140, 'con React', 23, colors.red, 900),
    text(x + 252, y + 172, '12 lecciones - 4.8 estrellas', 13, colors.slate, 700),
    tspanLines(x + 252, y + 205, ['Componentes, estado, rutas', 'y consumo de API.'], 13, colors.slate, 500, 19),
    button(x + 252, y + 236, 126, 'Ver temario'),
    text(x + 34, y + 308, 'Plan de estudios', 18, colors.ink, 900),
    ...['Modulo 1 - Fundamentos', 'Modulo 2 - Router y estado', 'Modulo 3 - Proyecto final'].map((item, index) => [
      rect(x + 34, y + 334 + index * 58, w - 68, 44, 12, '#ffffff', colors.line),
      text(x + 58, y + 362 + index * 58, item, 14, colors.ink, 700),
      text(x + w - 92, y + 362 + index * 58, `${index + 3} clases`, 12, colors.muted, 700),
    ].join('\n')),
  ].join('\n');

  const body = [
    titleBlock('Aprende. Explora. Analiza. Inspira.', 'Flujo publico: descubrir cursos con una experiencia clara y profesional'),
    screenFrame(70, 205, 500, 670, '01 Home publica', homeBody, colors.teal),
    screenFrame(650, 205, 500, 670, '02 Listado con filtros', listingBody, colors.blue),
    screenFrame(1230, 205, 500, 670, '03 Detalle de curso', detailBody, colors.green),
    line(570, 540, 650, 540),
    line(1150, 540, 1230, 540),
    rect(70, 930, 1660, 120, 24, '#ffffff', colors.line, 1),
    text(110, 975, 'Interacciones clave', 20, colors.ink, 900),
    tspanLines(110, 1010, ['Explorar cursos -> aplica filtros sin login -> entra al detalle informativo del curso.', 'El alumno no se inscribe desde aqui: el instructor crea el Enrollment desde su panel de alumnos.'], 16, colors.slate, 500, 24),
  ].join('\n');

  return svgRoot(1800, 1120, body, 'Flujo publico Academy Edition');
}

function instructorSvg() {
  const dashboardBody = (x, y, w, h) => [
    navBar(x, y, w, 'Dashboard'),
    text(x + 34, y + 105, 'Hola, Ana', 28, colors.ink, 900),
    rect(x + 34, y + 132, 140, 78, 8, colors.tealSoft),
    text(x + 58, y + 166, '6', 26, colors.teal, 900),
    text(x + 58, y + 192, 'Cursos', 13, colors.slate, 700),
    rect(x + 194, y + 132, 160, 78, 8, colors.amberSoft),
    text(x + 218, y + 166, '124', 26, colors.darkRed, 900),
    text(x + 218, y + 192, 'Alumnos', 13, colors.slate, 700),
    rect(x + 374, y + 132, 126, 78, 8, colors.blueSoft),
    text(x + 398, y + 166, '4.7', 26, colors.blue, 900),
    text(x + 398, y + 192, 'Rating', 13, colors.slate, 700),
    button(x + 34, y + 245, 142, 'Crear curso'),
    courseCard(x + 34, y + 320, w - 68, 'Desarrollo Web con React', 'ACTIVO', 72, colors.tealSoft),
  ].join('\n');

  const wizardBody = (x, y, w, h) => [
    navBar(x, y, w, 'Dashboard'),
    text(x + 34, y + 104, 'Wizard crear curso', 25, colors.ink, 900),
    ...['Datos', 'Modulos', 'Lecciones'].map((item, index) => [
      circle(x + 74 + index * 150, y + 150, 18, index === 1 ? colors.teal : '#ffffff', index === 1 ? colors.teal : colors.line, 2),
      text(x + 74 + index * 150, y + 156, String(index + 1), 13, index === 1 ? '#ffffff' : colors.slate, 900, 'middle'),
      text(x + 102 + index * 150, y + 156, item, 13, colors.slate, 800),
    ].join('\n')),
    rect(x + 34, y + 205, w - 68, 52, 8, '#ffffff', colors.line),
    text(x + 58, y + 238, 'Modulo: Fundamentos de React', 15, colors.ink, 700),
    rect(x + 34, y + 277, w - 68, 52, 8, '#ffffff', colors.line),
    text(x + 58, y + 310, 'Modulo: Componentes y estado', 15, colors.ink, 700),
    rect(x + 34, y + 355, 152, 36, 8, colors.blueSoft),
    text(x + 110, y + 379, 'Anadir modulo', 13, colors.blue, 800, 'middle'),
    button(x + w - 180, y + 515, 138, 'Siguiente'),
  ].join('\n');

  const manageBody = (x, y, w, h) => [
    navBar(x, y, w, 'Dashboard'),
    text(x + 34, y + 103, 'Gestionar curso', 25, colors.ink, 900),
    rect(x + 34, y + 132, 170, 120, 8, colors.tealSoft),
    rect(x + 52, y + 154, 134, 72, 8, 'url(#brandRed)'),
    courseVisual(x + 67, y + 162, 104, 56, 'react'),
    text(x + 228, y + 154, 'Desarrollo Web', 20, colors.ink, 900),
    text(x + 228, y + 181, 'con React', 20, colors.red, 900),
    text(x + 228, y + 208, 'Publicado - 52 alumnos', 12, colors.slate, 700),
    rect(x + 228, y + 226, 88, 26, 7, colors.greenSoft),
    text(x + 272, y + 244, 'Editar', 11, colors.green, 800, 'middle'),
    rect(x + 326, y + 226, 136, 26, 7, colors.tealSoft),
    text(x + 394, y + 244, 'Inscribir alumno', 11, colors.teal, 800, 'middle'),
    text(x + 34, y + 300, 'Lecciones', 18, colors.ink, 900),
    ...['Intro + PDF', 'Componentes', 'Proyecto final'].map((item, index) => [
      rect(x + 34, y + 326 + index * 56, w - 68, 42, 12, '#ffffff', colors.line),
      text(x + 58, y + 353 + index * 56, item, 14, colors.ink, 700),
      rect(x + w - 132, y + 335 + index * 56, 76, 24, 12, colors.amberSoft),
      text(x + w - 94, y + 352 + index * 56, 'Editar', 11, '#a66b00', 800, 'middle'),
    ].join('\n')),
  ].join('\n');

  const body = [
    titleBlock('Aprende. Explora. Analiza. Inspira.', 'Flujo instructor: crear cursos, analizar progreso e inspirar alumnos'),
    screenFrame(70, 205, 500, 650, '01 Dashboard instructor', dashboardBody, colors.teal),
    screenFrame(650, 205, 500, 650, '02 Wizard de curso', wizardBody, colors.blue),
    screenFrame(1230, 205, 500, 650, '03 Gestion de curso', manageBody, colors.amber),
    line(570, 530, 650, 530),
    line(1150, 530, 1230, 530),
    rect(70, 910, 1660, 130, 24, '#ffffff', colors.line, 1),
    text(110, 956, 'Prototipo sugerido', 20, colors.ink, 900),
    tspanLines(110, 992, ['Click Crear curso -> Paso 1 datos -> Paso 2 modulos -> Paso 3 lecciones y archivos -> Dashboard instructor.', 'Desde Gestionar curso se editan contenidos y se inscriben alumnos; el alumno no tiene ese boton.'], 16, colors.slate, 500, 24),
  ].join('\n');

  return svgRoot(1800, 1100, body, 'Flujo instructor Academy Edition');
}

function studentSvg() {
  const dashboardBody = (x, y, w, h) => [
    navBar(x, y, w, 'Dashboard'),
    text(x + 34, y + 105, 'Cursos asignados', 28, colors.ink, 900),
    courseCard(x + 34, y + 138, w - 68, 'Desarrollo Web con React', '72%', 72, colors.tealSoft),
    courseCard(x + 34, y + 316, w - 68, 'Diseno de APIs con Node.js', '35%', 35, colors.amberSoft),
    button(x + 34, y + 514, 128, 'Continuar'),
  ].join('\n');

  const playerBody = (x, y, w, h) => [
    navBar(x, y, w, 'Dashboard'),
    text(x + 34, y + 102, 'Leccion 08 - Router', 24, colors.ink, 900),
    rect(x + 34, y + 128, w - 68, 230, 8, 'url(#inkGrad)'),
    rect(x + 54, y + 150, w - 108, 34, 8, '#ffffff14'),
    circle(x + w / 2, y + 243, 34, '#ffffff22', '#ffffff55'),
    text(x + w / 2, y + 253, 'PLAY', 14, '#ffffff', 900, 'middle'),
    rect(x + 58, y + 328, w - 116, 6, 3, '#ffffff22'),
    rect(x + 58, y + 328, (w - 116) * 0.64, 6, 3, colors.red),
    rect(x + 34, y + 386, w - 68, 48, 8, colors.blueSoft),
    text(x + 58, y + 416, 'PDF adjunto: guia-router.pdf', 14, colors.blue, 800),
    button(x + 34, y + 470, 194, 'Marcar completada'),
    rect(x + 250, y + 470, 104, 42, 8, '#ffffff', colors.line),
    text(x + 302, y + 497, 'Siguiente', 13, colors.ink, 800, 'middle'),
  ].join('\n');

  const reviewBody = (x, y, w, h) => [
    navBar(x, y, w, 'Dashboard'),
    text(x + 34, y + 102, 'Curso completado', 25, colors.ink, 900),
    rect(x + 34, y + 128, w - 68, 90, 8, colors.greenSoft),
    text(x + 58, y + 166, '100% de progreso', 25, colors.green, 900),
    text(x + 58, y + 194, 'Ya puedes valorar el curso.', 14, colors.slate, 700),
    text(x + 34, y + 270, 'Tu review', 19, colors.ink, 900),
    text(x + 34, y + 312, '5 estrellas', 18, colors.amber, 900),
    rect(x + 34, y + 340, w - 68, 120, 8, '#ffffff', colors.line),
    tspanLines(x + 58, y + 378, ['Contenido claro, practico y muy bien', 'organizado para aprender paso a paso.'], 15, colors.slate, 500, 22),
    button(x + 34, y + 502, 126, 'Publicar'),
  ].join('\n');

  const certBody = (x, y, w, h) => [
    navBar(x, y, w, 'Dashboard'),
    rect(x + 72, y + 112, w - 144, 360, 8, '#ffffff', colors.line, 2),
    brandIcon(x + w / 2 - 18, y + 130, 36),
    text(x + w / 2, y + 198, 'CERTIFICADO', 24, colors.ink, 900, 'middle'),
    text(x + w / 2, y + 236, 'Desarrollo Web', 19, colors.teal, 900, 'middle'),
    text(x + w / 2, y + 260, 'con React', 19, colors.teal, 900, 'middle'),
    text(x + w / 2, y + 300, 'Maria Lopez', 17, colors.slate, 700, 'middle'),
    rect(x + 150, y + 338, w - 300, 2, 1, colors.line),
    text(x + w / 2, y + 382, 'Academy Edition', 15, colors.ink, 800, 'middle'),
    button(x + w / 2 - 86, y + 520, 172, 'Descargar PDF', colors.violet),
  ].join('\n');

  const body = [
    titleBlock('Aprende. Explora. Analiza. Inspira.', 'Flujo alumno: progreso, lecciones, valoraciones y certificado'),
    screenFrame(70, 205, 385, 665, '01 Dashboard alumno', dashboardBody, colors.teal),
    screenFrame(505, 205, 385, 665, '02 Visor leccion', playerBody, colors.blue),
    screenFrame(940, 205, 385, 665, '03 Review', reviewBody, colors.amber),
    screenFrame(1375, 205, 385, 665, '04 Certificado extra', certBody, colors.violet),
    line(455, 535, 505, 535),
    line(890, 535, 940, 535),
    pathArrow('M1325 535 C1350 535 1350 535 1375 535', colors.violet, 2, true),
    rect(70, 925, 1690, 118, 24, '#ffffff', colors.line, 1),
    text(110, 970, 'Estados avanzados', 20, colors.ink, 900),
    tspanLines(110, 1006, ['La barra de progreso cambia tras cada leccion completada. Al llegar al 100%, se desbloquea review y certificado PDF.', 'La review solo aparece para alumnos inscritos y debe bloquear duplicados por alumno + curso.'], 16, colors.slate, 500, 24),
  ].join('\n');

  return svgRoot(1830, 1100, body, 'Flujo alumno Academy Edition');
}

function prototypeMapSvg() {
  const lanes = [
    ['Publico', colors.blueSoft, colors.blue, ['Home', 'Listado cursos', 'Detalle curso']],
    ['Auth', colors.greenSoft, colors.green, ['Registro', 'Login', 'Redireccion por rol']],
    ['Instructor', colors.amberSoft, '#b97806', ['Dashboard', 'Wizard curso', 'Gestion curso', 'Alumnos inscritos']],
    ['Alumno', colors.tealSoft, colors.teal, ['Dashboard', 'Visor leccion', 'Review', 'Certificado']],
  ];

  const body = [
    titleBlock('Aprende. Explora. Analiza. Inspira.', 'Mapa de clicks para una demo navegable de 8 a 10 minutos'),
    rect(70, 195, 1660, 790, 30, '#ffffff', colors.line, 1, 'filter="url(#shadow)"'),
    ...lanes.map((lane, laneIndex) => {
      const [name, fill, stroke, steps] = lane;
      const y = 245 + laneIndex * 175;
      return [
        rect(120, y, 220, 118, 22, fill, stroke, 2),
        text(230, y + 52, name, 24, stroke, 900, 'middle'),
        text(230, y + 82, `Ruta ${laneIndex + 1}`, 14, colors.slate, 700, 'middle'),
        ...steps.map((step, index) => {
          const x = 430 + index * 285;
          return [
            rect(x, y + 9, 210, 100, 18, '#ffffff', colors.line, 1, 'filter="url(#softShadow)"'),
            text(x + 105, y + 50, step, 17, colors.ink, 800, 'middle'),
            text(x + 105, y + 78, index === 0 ? 'Frame' : 'Click destino', 12, colors.muted, 700, 'middle'),
            index > 0 ? line(x - 75, y + 60, x, y + 60, stroke, 2) : '',
          ].join('\n');
        }),
      ].join('\n');
    }),
    pathArrow('M1010 305 C1190 170 1350 170 1450 305', colors.green, 2),
    text(1235, 178, 'Si no hay sesion', 14, colors.green, 800, 'middle'),
    pathArrow('M930 655 C980 700 980 780 930 830', colors.teal, 2),
    text(1010, 748, 'Al completar', 14, colors.teal, 800),
    rect(70, 1030, 1660, 112, 24, '#ffffff', colors.line, 1),
    text(110, 1075, 'Notas para Figma', 20, colors.ink, 900),
    tspanLines(110, 1110, ['Importa los SVG como frames. Usa Prototype: On click -> Navigate to. Transicion recomendada: Smart Animate, 300 ms.', 'Marca con overlays los modales de review, subida de archivos y confirmacion de inscripcion por profesor.'], 16, colors.slate, 500, 24),
  ].join('\n');

  return svgRoot(1800, 1200, body, 'Mapa de clicks para prototipo Figma');
}

async function writeAssets() {
  await fs.mkdir(outDir, { recursive: true });
  const assets = [
    ['01-flujo-avanzado-overview.svg', overviewSvg()],
    ['02-publico-descubrimiento.svg', publicDiscoverySvg()],
    ['03-instructor-avanzado.svg', instructorSvg()],
    ['04-alumno-avanzado.svg', studentSvg()],
    ['05-prototipo-clicks.svg', prototypeMapSvg()],
  ];

  const pendingPngs = [];
  for (const [fileName, svg] of assets) {
    const svgPath = path.join(outDir, fileName);
    await fs.writeFile(svgPath, svg, 'utf8');
    const pngPath = svgPath.replace(/\.svg$/i, '.png');
    if (sharp) {
      await sharp(Buffer.from(svg)).png().toFile(pngPath);
    } else {
      pendingPngs.push([svgPath, pngPath, svg]);
    }
  }

  if (!sharp && playwright && pendingPngs.length > 0) {
    const browser = await playwright.chromium.launch({ headless: true });
    try {
      for (const [svgPath, pngPath, svg] of pendingPngs) {
        const width = Number(svg.match(/width="(\d+)"/)?.[1] ?? 1800);
        const height = Number(svg.match(/height="(\d+)"/)?.[1] ?? 1100);
        const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
        const fileUrl = `file:///${svgPath.replaceAll('\\', '/')}`;
        await page.goto(fileUrl);
        await page.screenshot({ path: pngPath, fullPage: true });
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }

  const readme = `# Demo visual avanzada - Academy Edition

Estos assets estan preparados para importarse en Figma como base de prototipo.

## Imagenes

- \`01-flujo-avanzado-overview.svg\`: mapa general del flujo avanzado.
- \`02-publico-descubrimiento.svg\`: Home, listado con filtros y detalle de curso.
- \`03-instructor-avanzado.svg\`: dashboard de instructor, wizard y gestion de curso.
- \`04-alumno-avanzado.svg\`: dashboard de alumno, visor, review y certificado.
- \`05-prototipo-clicks.svg\`: mapa de conexiones para montar el prototipo en Figma.

Los SVG son la entrega principal: Figma los importa como graficos editables. Si el entorno local tiene conversor disponible, el script tambien puede generar PNGs de apoyo.

## Como usarlo en Figma

1. Crea un archivo nuevo en Figma llamado \`Academy Edition - Flujo avanzado\`.
2. Arrastra los SVG al canvas.
3. Convierte cada bloque principal en frame si Figma no lo hace automaticamente.
4. En Prototype, conecta:
   - Home -> Listado -> Detalle -> Login/Registro.
   - Login/Registro -> Dashboard instructor o Dashboard alumno.
   - Dashboard instructor -> Wizard -> Gestion de curso.
   - Dashboard alumno -> Visor de leccion -> Review -> Certificado.
5. Usa transicion \`Smart Animate\` o \`Dissolve\` a 300 ms.

## Alcance representado

La demo cubre MVP y flujo avanzado: busqueda/filtros, consulta publica de cursos, inscripcion gestionada por el instructor, dashboards por rol, creacion guiada de cursos, lecciones con archivos, progreso, review y certificado como extra.
`;
  await fs.writeFile(path.join(outDir, 'README.md'), readme, 'utf8');
}

writeAssets().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
