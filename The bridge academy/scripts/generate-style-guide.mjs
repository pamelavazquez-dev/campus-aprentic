import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('docs/figma-style-guide');
const PAGE_W = 1440;
const PAGE_H = 3900;

const tokens = {
  meta: {
    product: 'The Bridge Academy',
    projectAlias: 'AprenTIC Academy / Academy Edition',
    version: '2.0.0',
    purpose: 'Visual foundations and base component specs for a Figma to React 1:1 handoff.',
    sourceFiles: [
      'docs/producto-diseno.md',
      'docs/wireframes/*.svg',
      'docs/wireframes/README.md',
      'docs/figma-demo/*.svg',
      'docs/figma-demo/README.md',
    ],
  },
  color: {
    primitive: {
      red500: '#FF3045',
      red650: '#E32337',
      red700: '#B01626',
      burgundy900: '#7B1D18',
      ink900: '#0D0D0D',
      ink800: '#1F232B',
      slate650: '#343943',
      gray600: '#4B5563',
      gray500: '#6B7280',
      gray300: '#D3D6DC',
      gray200: '#E5E7EB',
      gray150: '#ECEFF3',
      gray100: '#F5F6F8',
      white: '#FFFFFF',
      success600: '#167A4A',
      warning600: '#B76510',
      info600: '#2563EB',
      danger600: '#C81E35',
    },
    semantic: {
      brandPrimary: '{color.primitive.red500}',
      brandPrimaryHover: '{color.primitive.red700}',
      brandPrimaryPressed: '{color.primitive.burgundy900}',
      brandSoft: '#FFE5E8',
      bgCanvas: '{color.primitive.gray100}',
      bgSurface: '{color.primitive.white}',
      bgSurfaceMuted: '{color.primitive.gray150}',
      textPrimary: '{color.primitive.ink800}',
      textStrong: '{color.primitive.ink900}',
      textSecondary: '{color.primitive.gray500}',
      textOnBrand: '{color.primitive.white}',
      borderDefault: '{color.primitive.gray300}',
      borderStrong: '{color.primitive.slate650}',
      focusRing: '{color.primitive.red500}',
      stateSuccess: '{color.primitive.success600}',
      stateWarning: '{color.primitive.warning600}',
      stateInfo: '{color.primitive.info600}',
      stateDanger: '{color.primitive.danger600}',
    },
  },
  typography: {
    fontFamily: {
      display: 'Montserrat',
      body: 'Inter',
      fallback: 'Arial, sans-serif',
    },
    scale: {
      display: { size: 56, lineHeight: 64, weight: 900 },
      h1: { size: 40, lineHeight: 48, weight: 900 },
      h2: { size: 30, lineHeight: 38, weight: 800 },
      h3: { size: 22, lineHeight: 30, weight: 800 },
      bodyLg: { size: 18, lineHeight: 28, weight: 500 },
      body: { size: 16, lineHeight: 24, weight: 500 },
      small: { size: 14, lineHeight: 20, weight: 500 },
      caption: { size: 12, lineHeight: 16, weight: 700 },
    },
  },
  spacing: {
    '0': 0,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32,
    '10': 40,
    '12': 48,
    '16': 64,
    '20': 80,
    '24': 96,
  },
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    pill: 999,
  },
  shadow: {
    sm: '0 6 16 rgba(13, 13, 13, 0.08)',
    md: '0 14 30 rgba(13, 13, 13, 0.10)',
    lg: '0 22 45 rgba(13, 13, 13, 0.14)',
  },
  size: {
    controlSm: 36,
    controlMd: 44,
    controlLg: 52,
    minTouchTarget: 44,
  },
  components: {
    button: {
      figmaName: 'Button',
      reactName: 'Button',
      props: ['variant', 'size', 'state', 'leadingIcon', 'trailingIcon', 'fullWidth'],
      variants: {
        variant: ['primary', 'secondary', 'ghost'],
        size: ['sm', 'md', 'lg'],
        state: ['default', 'hover', 'disabled'],
      },
    },
    card: {
      figmaName: 'Card',
      reactName: 'Card',
      props: ['kind', 'elevation', 'interactive', 'media', 'progress'],
      variants: {
        kind: ['course', 'metric', 'lesson'],
        elevation: ['flat', 'raised'],
        interactive: [false, true],
      },
    },
    input: {
      figmaName: 'Input',
      reactName: 'Input',
      props: ['state', 'label', 'helperText', 'leadingIcon', 'trailingAction'],
      variants: {
        state: ['default', 'focus', 'error', 'disabled'],
      },
    },
    navbar: {
      figmaName: 'Navbar',
      reactName: 'Navbar',
      props: ['activeItem', 'authenticated', 'role'],
      variants: {
        role: ['public', 'student', 'instructor'],
      },
    },
  },
};

const c = {
  red: tokens.color.primitive.red500,
  redHot: tokens.color.primitive.red650,
  redDark: tokens.color.primitive.red700,
  burgundy: tokens.color.primitive.burgundy900,
  ink: tokens.color.primitive.ink800,
  black: tokens.color.primitive.ink900,
  slate: tokens.color.primitive.slate650,
  gray: tokens.color.primitive.gray600,
  muted: tokens.color.primitive.gray500,
  line: tokens.color.primitive.gray300,
  lineSoft: tokens.color.primitive.gray200,
  bg: tokens.color.primitive.gray100,
  soft: tokens.color.primitive.gray150,
  panel: tokens.color.primitive.white,
  success: tokens.color.primitive.success600,
  warning: tokens.color.primitive.warning600,
  info: tokens.color.primitive.info600,
  danger: tokens.color.primitive.danger600,
  brandSoft: '#FFE5E8',
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function rect(x, y, w, h, r, fill, stroke = 'none', sw = 1, extra = '') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function circle(cx, cy, r, fill, stroke = 'none', sw = 1, extra = '') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function line(x1, y1, x2, y2, stroke = c.line, sw = 1, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
}

function text(x, y, value, size = 16, fill = c.ink, weight = 500, anchor = 'start', family = 'Inter, Arial, sans-serif', extra = '') {
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${extra}>${esc(value)}</text>`;
}

function lines(x, y, values, size = 15, fill = c.muted, weight = 500, gap = 24) {
  return values.map((value, index) => text(x, y + index * gap, value, size, fill, weight)).join('\n');
}

function frame(x, y, w, h, title, eyebrow, extra = '') {
  return [
    rect(x, y, w, h, 12, c.panel, c.line, 1, 'filter="url(#softShadow)"'),
    text(x + 28, y + 38, eyebrow.toUpperCase(), 12, c.red, 900, 'start', 'Inter, Arial, sans-serif'),
    text(x + 28, y + 76, title, 28, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif'),
    extra,
  ].join('\n');
}

function logoMark(x, y, size = 64) {
  const s = size / 64;
  const px = (n) => Number((n * s).toFixed(2));
  return [
    rect(x, y, size, size, 14, 'url(#brandRed)'),
    rect(x + px(15), y + px(27), px(34), px(22), px(3), 'none', c.panel, px(3)),
    `<path d="M${x + px(15)} ${y + px(22)} L${x + px(48)} ${y + px(14)} L${x + px(49)} ${y + px(21)} L${x + px(17)} ${y + px(29)} Z" fill="${c.panel}"/>`,
    rect(x + px(24), y + px(39), px(5), px(8), 1, c.panel),
    rect(x + px(34), y + px(34), px(5), px(13), 1, c.panel),
    rect(x + px(44), y + px(29), px(5), px(18), 1, c.panel),
  ].join('\n');
}

function pill(x, y, label, fill = c.soft, color = c.ink, width = null) {
  const w = width ?? Math.max(96, label.length * 7.3 + 28);
  return [
    rect(x, y, w, 32, 16, fill, fill === c.panel ? c.line : 'none'),
    text(x + w / 2, y + 21, label, 12, color, 800, 'middle'),
  ].join('\n');
}

function sourceCard(x, y, label, desc) {
  return [
    rect(x, y, 276, 74, 8, '#161B24', '#2D3340'),
    text(x + 18, y + 28, label, 13, c.panel, 900),
    text(x + 18, y + 52, desc, 12, '#B9C0CA', 600),
  ].join('\n');
}

function colorSwatch(x, y, name, hex, role, textColor = c.ink) {
  return [
    `<g id="color-${name.toLowerCase().replaceAll(' ', '-')}">`,
    rect(x, y, 288, 132, 10, hex, c.line, 1),
    rect(x, y + 82, 288, 96, 10, c.panel, c.line),
    text(x + 18, y + 114, name, 16, c.ink, 900),
    text(x + 18, y + 140, hex, 13, c.muted, 800),
    text(x + 146, y + 140, role, 12, c.slate, 700),
    text(x + 18, y + 58, 'Aa', 36, textColor, 900, 'start', 'Montserrat, Inter, Arial, sans-serif'),
    '</g>',
  ].join('\n');
}

function typeSpec(x, y, label, sample, size, weight, family = 'Montserrat, Inter, Arial, sans-serif') {
  return [
    text(x, y, label, 12, c.red, 900),
    text(x, y + size + 18, sample, size, c.ink, weight, 'start', family),
    text(x, y + size + 46, `${family.includes('Montserrat') ? 'Montserrat' : 'Inter'} / ${size}px / ${weight}`, 12, c.muted, 700),
  ].join('\n');
}

function spacingToken(x, y, label, value) {
  return [
    text(x, y + 18, label, 13, c.ink, 800),
    rect(x + 74, y, value, 24, 4, c.red),
    text(x + 74 + value + 14, y + 18, `${value}px`, 12, c.muted, 800),
  ].join('\n');
}

function radiusToken(x, y, label, value) {
  return [
    rect(x, y, 76, 54, value, c.panel, c.line),
    text(x + 92, y + 24, label, 13, c.ink, 800),
    text(x + 92, y + 46, `${value}px`, 12, c.muted, 800),
  ].join('\n');
}

function iconPlus(x, y, color = c.panel) {
  return [
    line(x - 5, y, x + 5, y, color, 2),
    line(x, y - 5, x, y + 5, color, 2),
  ].join('\n');
}

function button(x, y, label, variant = 'primary', state = 'default', size = 'md', idPrefix = 'component-button') {
  const h = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;
  const w = Math.max(size === 'lg' ? 164 : 138, label.length * 8 + 64);
  const disabled = state === 'disabled';
  const fill =
    variant === 'primary'
      ? state === 'hover'
        ? c.redDark
        : 'url(#brandRed)'
      : variant === 'secondary'
        ? state === 'hover'
          ? c.soft
          : c.panel
        : 'transparent';
  const stroke = variant === 'primary' ? 'none' : variant === 'ghost' ? 'transparent' : c.line;
  const color = disabled ? c.muted : variant === 'primary' ? c.panel : c.ink;
  const opacity = disabled ? ' opacity="0.45"' : '';
  const id = `${idPrefix}-${variant}-${size}-${state}`;
  const iconColor = variant === 'primary' ? c.panel : c.red;
  return [
    `<g id="${id}"${opacity}>`,
    rect(x, y, w, h, 8, fill, stroke),
    iconPlus(x + 22, y + h / 2, disabled ? c.muted : iconColor),
    text(x + 46, y + h / 2 + 5, label, 14, color, 900),
    '</g>',
  ].join('\n');
}

function input(x, y, label, state = 'default', idPrefix = 'component-input', width = 408) {
  const stroke = state === 'focus' ? c.red : state === 'error' ? c.danger : c.line;
  const fill = state === 'disabled' ? c.soft : c.panel;
  const helper = state === 'error' ? 'Revisa este campo antes de continuar' : 'Texto de ayuda opcional';
  const muted = state === 'disabled' ? c.muted : c.slate;
  return [
    `<g id="${idPrefix}-${state}">`,
    text(x, y, label, 13, c.ink, 900),
    rect(x, y + 14, width, 50, 8, fill, stroke, state === 'focus' ? 2 : 1),
    circle(x + 24, y + 39, 7, 'none', muted, 2),
    text(x + 46, y + 45, state === 'disabled' ? 'No disponible' : 'Buscar curso o alumno', 14, muted, 600),
    text(x, y + 88, helper, 12, state === 'error' ? c.danger : c.muted, 700),
    '</g>',
  ].join('\n');
}

function progressBar(x, y, w, value, fill = c.red) {
  return [
    rect(x, y, w, 8, 4, c.lineSoft),
    rect(x, y, Math.round((w * value) / 100), 8, 4, fill),
  ].join('\n');
}

function courseCard(x, y, id = 'component-card-course', raised = true) {
  return [
    `<g id="${id}">`,
    rect(x, y, 360, 282, 8, c.panel, c.line, 1, raised ? 'filter="url(#softShadow)"' : ''),
    rect(x + 20, y + 20, 320, 112, 8, 'url(#brandRed)'),
    text(x + 38, y + 62, 'React', 28, c.panel, 900, 'start', 'Montserrat, Inter, Arial, sans-serif'),
    text(x + 38, y + 94, 'Proyecto frontend guiado', 14, '#FFE5E8', 800),
    pill(x + 222, y + 92, 'Must', c.panel, c.red, 88),
    text(x + 20, y + 166, 'Curso de React desde cero', 19, c.ink, 900),
    text(x + 20, y + 194, '12 lecciones - Nivel inicial', 13, c.muted, 700),
    progressBar(x + 20, y + 218, 250, 64),
    text(x + 286, y + 225, '64%', 12, c.ink, 900),
    rect(x + 20, y + 242, 128, 30, 7, c.soft),
    text(x + 42, y + 262, 'Ver detalle', 12, c.ink, 900),
    '</g>',
  ].join('\n');
}

function metricCard(x, y, id = 'component-card-metric') {
  return [
    `<g id="${id}">`,
    rect(x, y, 242, 132, 8, c.panel, c.line, 1),
    text(x + 18, y + 34, 'Alumnos inscritos', 13, c.muted, 800),
    text(x + 18, y + 82, '128', 40, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif'),
    pill(x + 146, y + 64, '+12%', c.brandSoft, c.red, 72),
    '</g>',
  ].join('\n');
}

function lessonCard(x, y, id = 'component-card-lesson') {
  return [
    `<g id="${id}">`,
    rect(x, y, 360, 86, 8, c.panel, c.line, 1),
    circle(x + 36, y + 43, 17, c.brandSoft, c.red, 2),
    text(x + 29, y + 48, '3', 13, c.red, 900),
    text(x + 70, y + 36, 'Subida de PDF y recursos', 15, c.ink, 900),
    text(x + 70, y + 60, 'Leccion - 18 min', 12, c.muted, 700),
    rect(x + 300, y + 27, 36, 32, 7, c.soft),
    text(x + 318, y + 49, '>', 16, c.ink, 900, 'middle'),
    '</g>',
  ].join('\n');
}

function navButton(x, y, label, variant = 'primary') {
  const fill = variant === 'primary' ? 'url(#brandRed)' : c.panel;
  const stroke = variant === 'primary' ? 'none' : c.line;
  const color = variant === 'primary' ? c.panel : c.ink;
  const w = label.length * 8 + 42;
  return [
    rect(x, y, w, 38, 8, fill, stroke),
    text(x + w / 2, y + 25, label, 13, color, 900, 'middle'),
  ].join('\n');
}

function navbar(x, y, role = 'public') {
  const roleLabel = role === 'student' ? 'Alumno' : role === 'instructor' ? 'Instructor' : 'Publico';
  const active = role === 'student' ? 'Mis cursos' : role === 'instructor' ? 'Panel' : 'Cursos';
  const id = `component-navbar-${role}`;
  const action = role === 'public' ? 'Login' : role === 'student' ? 'Perfil' : 'Salir';
  return [
    `<g id="${id}">`,
    rect(x, y, 556, 72, 8, c.panel, c.line, 1, 'filter="url(#softShadow)"'),
    logoMark(x + 18, y + 18, 36),
    text(x + 66, y + 35, 'The Bridge', 12, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif'),
    text(x + 66, y + 51, 'Academy', 12, c.red, 900, 'start', 'Montserrat, Inter, Arial, sans-serif'),
    text(x + 212, y + 44, active, 13, c.ink, 900),
    pill(x + 318, y + 20, roleLabel, c.soft, c.ink, 92),
    navButton(x + 430, y + 17, action, role === 'public' ? 'secondary' : 'primary'),
    '</g>',
  ].join('\n');
}

function miniScreen(x, y) {
  return [
    '<g id="usage-example-dashboard">',
    rect(x, y, 1296, 430, 14, c.panel, c.line, 1, 'filter="url(#shadow)"'),
    rect(x, y, 1296, 74, 14, c.black),
    logoMark(x + 28, y + 16, 42),
    text(x + 88, y + 45, 'Dashboard alumno', 18, c.panel, 900, 'start', 'Montserrat, Inter, Arial, sans-serif'),
    text(x + 1080, y + 45, 'Sistema aplicado', 13, '#B9C0CA', 800),
    text(x + 36, y + 126, 'Mis cursos asignados', 30, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif'),
    text(x + 36, y + 158, 'Componentes base combinados en una pantalla MVP real.', 14, c.muted, 700),
    courseCard(x + 36, y + 190, 'usage-course-card', false),
    metricCard(x + 440, y + 190, 'usage-card-metric-progress'),
    metricCard(x + 708, y + 190, 'usage-card-metric-students'),
    lessonCard(x + 440, y + 348, 'usage-card-lesson-next'),
    lessonCard(x + 820, y + 348, 'usage-card-lesson-review'),
    input(x + 820, y + 190, 'Buscar contenido', 'focus', 'usage-input'),
    '</g>',
  ].join('\n');
}

function checklistItem(x, y, label, desc, dark = false) {
  const titleColor = dark ? c.panel : c.ink;
  const descColor = dark ? '#B9C0CA' : c.muted;
  return [
    circle(x + 12, y + 12, 12, c.success),
    text(x + 12, y + 17, '✓', 14, c.panel, 900, 'middle'),
    text(x + 38, y + 10, label, 15, titleColor, 900),
    text(x + 38, y + 34, desc, 13, descColor, 700),
  ].join('\n');
}

function styleGuideSvg() {
  const colorRows = [
    ['Brand primary', c.red, 'CTA / foco', c.panel],
    ['Brand hover', c.redDark, 'Hover / pressed', c.panel],
    ['Ink', c.ink, 'Texto principal', c.panel],
    ['Canvas', c.bg, 'Fondo app', c.ink],
    ['Surface', c.panel, 'Cards / paneles', c.ink],
    ['Border', c.line, 'Bordes', c.ink],
    ['Success', c.success, 'Completado', c.panel],
    ['Info', c.info, 'Ayuda / estado', c.panel],
  ];

  const gridLines = Array.from({ length: 13 }, (_, index) => {
    const x = 72 + index * 108;
    return line(x, 0, x, PAGE_H, '#E8EBF0', 1, 'opacity="0.45"');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_W}" height="${PAGE_H}" viewBox="0 0 ${PAGE_W} ${PAGE_H}" role="img" aria-label="The Bridge Academy style guide v2">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#0D0D0D" flood-opacity="0.12"/>
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#0D0D0D" flood-opacity="0.08"/>
    </filter>
    <linearGradient id="brandRed" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.red}"/>
      <stop offset="100%" stop-color="${c.redDark}"/>
    </linearGradient>
    <linearGradient id="heroInk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0D0D0D"/>
      <stop offset="100%" stop-color="#1F232B"/>
    </linearGradient>
  </defs>

  ${rect(0, 0, PAGE_W, PAGE_H, 0, c.bg)}
  ${gridLines}

  <g id="style-guide-page-v2">
    <g id="hero">
      ${rect(52, 44, 1336, 344, 16, 'url(#heroInk)', 'none', 1, 'filter="url(#shadow)"')}
      ${logoMark(92, 90, 76)}
      ${text(192, 108, 'THE BRIDGE ACADEMY', 17, c.red, 900, 'start', 'Montserrat, Inter, Arial, sans-serif')}
      ${text(192, 164, 'Sistema visual base', 56, c.panel, 900, 'start', 'Montserrat, Inter, Arial, sans-serif')}
      ${text(192, 210, 'Paleta, tipografia, espaciado y componentes reutilizables para llevar Figma a React sin reinterpretar.', 17, '#D7DCE4', 600)}
      ${pill(192, 252, 'Figma page: Style guide', '#252B36', c.panel, 188)}
      ${pill(398, 252, 'React parity', '#252B36', c.panel, 132)}
      ${pill(548, 252, 'MVP + alta fidelidad', '#252B36', c.panel, 176)}
      ${text(934, 94, 'Archivos leidos', 13, c.red, 900)}
      ${sourceCard(934, 118, 'producto-diseno.md', 'Historias, roles y pantallas MVP')}
      ${sourceCard(934, 206, 'wireframes/*.svg', 'Estructura y jerarquia de layout')}
      ${sourceCard(934, 294, 'figma-demo/*.svg', 'Paleta y direccion visual avanzada')}
    </g>

    <g id="design-principles">
      ${frame(72, 442, 1296, 170, 'Criterios que gobiernan el sistema', 'Principios',
        `${lines(104, 548, [
          '1. La interfaz debe sentirse academica, clara y orientada a accion.',
          '2. Los wireframes grises son estructura; la demo avanzada define la capa visual final.',
          '3. Cada token y componente debe tener nombre equivalente para Figma y React.',
        ], 15, c.slate, 700, 24)}
        ${pill(1010, 512, 'MVP primero', c.brandSoft, c.red, 136)}
        ${pill(1010, 552, 'Estados visibles', c.soft, c.ink, 150)}
        ${pill(1010, 592, 'Componentes 1:1', c.soft, c.ink, 168)}`)}
    </g>

    <g id="foundations-color">
      ${frame(72, 680, 1296, 640, 'Color tokens', '01 Fundaciones',
        `${text(104, 786, 'La paleta conserva el rojo/ink de la demo visual y el gris estructural de los wireframes.', 15, c.muted, 700)}
        ${colorRows.map((item, index) => colorSwatch(104 + (index % 4) * 314, 840 + Math.floor(index / 4) * 220, item[0], item[1], item[2], item[3])).join('\n')}
        ${rect(104, 1232, 1264, 1, 0, c.line)}
        ${text(104, 1272, 'Regla: rojo solo para acciones principales, foco, progreso y estados criticos. Los estados informativos usan tokens propios.', 14, c.slate, 800)}`)}
    </g>

    <g id="foundations-type-spacing">
      ${frame(72, 1388, 620, 520, 'Tipografia', '02 Fundaciones',
        `${typeSpec(104, 1504, 'Display', 'Aprende creando', 52, 900)}
        ${typeSpec(104, 1608, 'H1', 'Cursos asignados', 38, 900)}
        ${typeSpec(104, 1702, 'H2', 'Gestion del instructor', 28, 800)}
        ${typeSpec(104, 1786, 'Body', 'Texto de interfaz para leer, filtrar y avanzar por lecciones.', 16, 500, 'Inter, Arial, sans-serif')}`)}

      ${frame(748, 1388, 620, 520, 'Espaciado, radios y elevacion', '03 Fundaciones',
        `${spacingToken(780, 1504, 'space-1', 4)}
        ${spacingToken(780, 1548, 'space-2', 8)}
        ${spacingToken(780, 1592, 'space-4', 16)}
        ${spacingToken(780, 1636, 'space-6', 24)}
        ${spacingToken(780, 1680, 'space-8', 32)}
        ${spacingToken(780, 1724, 'space-12', 48)}
        ${radiusToken(1062, 1504, 'radius-sm', 4)}
        ${radiusToken(1062, 1580, 'radius-md', 8)}
        ${radiusToken(1062, 1656, 'radius-lg', 12)}
        ${rect(1062, 1748, 214, 76, 8, c.panel, c.line, 1, 'filter="url(#softShadow)"')}
        ${text(1082, 1778, 'shadow-md', 13, c.ink, 900)}
        ${text(1082, 1804, 'Cards elevadas y menus', 12, c.muted, 700)}`)}
    </g>

    <g id="components">
      ${text(72, 2024, '04 Componentes base', 12, c.red, 900)}
      ${text(72, 2070, 'Biblioteca reutilizable', 40, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif')}
      ${text(72, 2102, 'Cada bloque esta nombrado para convertirse en componente o variante en Figma y mapearse a props de React.', 15, c.muted, 700)}

      ${rect(72, 2150, 620, 356, 12, c.panel, c.line, 1, 'filter="url(#softShadow)"')}
      ${text(104, 2194, 'Button', 24, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif')}
      ${text(104, 2222, 'variant x size x state', 13, c.muted, 800)}
      ${button(104, 2260, 'Crear curso', 'primary', 'default', 'md')}
      ${button(292, 2260, 'Crear curso', 'primary', 'hover', 'md')}
      ${button(480, 2260, 'Crear curso', 'primary', 'disabled', 'md')}
      ${button(104, 2326, 'Ver detalle', 'secondary', 'default', 'md')}
      ${button(292, 2326, 'Ver detalle', 'secondary', 'hover', 'md')}
      ${button(480, 2326, 'Ver detalle', 'secondary', 'disabled', 'md')}
      ${button(104, 2392, 'Cancelar', 'ghost', 'default', 'sm')}
      ${button(250, 2392, 'Guardar cambios', 'primary', 'default', 'lg')}
      ${text(104, 2472, 'React: <Button variant size state leadingIcon trailingIcon />', 13, c.slate, 800)}

      ${rect(748, 2150, 620, 356, 12, c.panel, c.line, 1, 'filter="url(#softShadow)"')}
      ${text(780, 2194, 'Input', 24, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif')}
      ${text(780, 2222, 'default, focus, error, disabled', 13, c.muted, 800)}
      ${input(780, 2258, 'Default', 'default', 'component-input', 260)}
      ${input(1080, 2258, 'Focus', 'focus', 'component-input', 260)}
      ${input(780, 2378, 'Error', 'error', 'component-input', 260)}
      ${input(1080, 2378, 'Disabled', 'disabled', 'component-input', 260)}

      ${rect(72, 2560, 620, 470, 12, c.panel, c.line, 1, 'filter="url(#softShadow)"')}
      ${text(104, 2604, 'Card', 24, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif')}
      ${text(104, 2632, 'course, metric, lesson', 13, c.muted, 800)}
      ${courseCard(104, 2670)}
      ${metricCard(492, 2670)}
      ${lessonCard(104, 2930)}

      ${rect(748, 2560, 620, 470, 12, c.panel, c.line, 1, 'filter="url(#softShadow)"')}
      ${text(780, 2604, 'Navbar', 24, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif')}
      ${text(780, 2632, 'public, student, instructor', 13, c.muted, 800)}
      ${navbar(780, 2670, 'public')}
      ${navbar(780, 2774, 'student')}
      ${navbar(780, 2878, 'instructor')}
    </g>

    <g id="applied-example">
      ${text(72, 3122, '05 Aplicacion', 12, c.red, 900)}
      ${text(72, 3168, 'Ejemplo compuesto', 40, c.ink, 900, 'start', 'Montserrat, Inter, Arial, sans-serif')}
      ${miniScreen(72, 3210)}
    </g>

    <g id="decision-log">
      ${rect(72, 3748, 1296, 82, 12, c.black)}
      ${checklistItem(104, 3772, 'Guia en una pagina', 'style-guide.svg contiene fundaciones, componentes y ejemplo', true)}
      ${checklistItem(502, 3772, 'Componentes reutilizables', 'Button, Card, Input y Navbar con variantes nombradas', true)}
      ${checklistItem(922, 3772, 'Decisiones documentadas', 'README + tokens + criterios visuales integrados', true)}
    </g>
  </g>
</svg>`;
}

function htmlIndex() {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>The Bridge Academy - Guia de estilo</title>
    <style>
      :root {
        color-scheme: light;
        --bg: ${c.bg};
        --ink: ${c.ink};
        --muted: ${c.muted};
        --line: ${c.line};
        --red: ${c.red};
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, Arial, sans-serif;
        background: var(--bg);
        color: var(--ink);
      }
      header {
        max-width: 1180px;
        margin: 0 auto;
        padding: 36px 24px 18px;
      }
      h1 {
        margin: 0 0 8px;
        font-family: Montserrat, Inter, Arial, sans-serif;
        font-size: 34px;
        line-height: 1.15;
      }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }
      main {
        max-width: 1180px;
        margin: 0 auto;
        padding: 24px 24px 56px;
      }
      figure {
        margin: 0;
        padding: 18px;
        background: #fff;
        border: 1px solid var(--line);
        border-radius: 8px;
        box-shadow: 0 14px 30px rgba(13, 13, 13, 0.10);
      }
      figcaption {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
        color: var(--muted);
        font-size: 14px;
        font-weight: 700;
      }
      a { color: var(--red); text-decoration: none; }
      img {
        display: block;
        width: 100%;
        height: auto;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--bg);
      }
    </style>
  </head>
  <body>
    <header>
      <h1>The Bridge Academy - Guia de estilo v2</h1>
      <p>Pagina unica lista para importar en Figma, con tokens, componentes, estados y ejemplo compuesto.</p>
    </header>
    <main>
      <figure>
        <figcaption>
          <span>Style guide v2</span>
          <a href="./style-guide.svg">Abrir SVG</a>
        </figcaption>
        <img src="./style-guide.svg" alt="Guia de estilo de The Bridge Academy" />
      </figure>
    </main>
  </body>
</html>`;
}

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, 'design-tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(outDir, 'style-guide.svg'), styleGuideSvg(), 'utf8');
await fs.writeFile(path.join(outDir, 'index.html'), htmlIndex(), 'utf8');

console.log(`Generated style guide assets in ${outDir}`);
