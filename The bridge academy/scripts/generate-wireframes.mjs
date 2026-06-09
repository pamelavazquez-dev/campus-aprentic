import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('docs/wireframes');
const W = 1440;
const H = 1024;

const c = {
  bg: '#F5F5F5',
  panel: '#FFFFFF',
  light: '#D9D9D9',
  mid: '#BFBFBF',
  dark: '#999999',
  text: '#000000',
};

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function rect(x, y, w, h, fill = c.light, stroke = c.mid, sw = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function text(x, y, value, size = 18, weight = 500, anchor = 'start', fill = c.text) {
  return `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}">${esc(value)}</text>`;
}

function labelBox(x, y, w, h, label, fill = c.light) {
  return [rect(x, y, w, h, fill), text(x + w / 2, y + h / 2 + 6, label, 16, 700, 'middle')].join('\n');
}

function imgBox(x, y, w, h, label = 'IMG') {
  return [rect(x, y, w, h, c.mid), text(x + w / 2, y + h / 2 + 7, label, 22, 700, 'middle')].join('\n');
}

function button(x, y, w, label) {
  return labelBox(x, y, w, 48, label, c.mid);
}

function navbar(active = '') {
  const items = ['Home', 'Cursos', 'Instructor', 'Alumno'];
  return [
    rect(0, 0, W, 88, c.panel),
    labelBox(48, 24, 150, 40, 'LOGO', c.light),
    ...items.map((item, index) => text(260 + index * 120, 54, item, 16, item === active ? 700 : 500)),
    button(1138, 20, 108, 'Login'),
    button(1264, 20, 128, 'Registro'),
  ].join('\n');
}

function footer() {
  return [
    rect(0, 934, W, 90, c.light),
    text(48, 986, 'Footer: enlaces legales | contacto | redes', 16, 500),
  ].join('\n');
}

function frame(title, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  ${text(48, 128, title, 34, 700)}
  ${body}
</svg>`;
}

function home() {
  const body = [
    navbar('Home'),
    rect(48, 160, 1344, 300, c.panel),
    text(88, 220, 'Hero: propuesta de valor de la plataforma', 30, 700),
    text(88, 266, 'Texto descriptivo breve', 18, 500),
    button(88, 326, 180, 'Ver Cursos'),
    button(288, 326, 180, 'Registrarse'),
    imgBox(850, 190, 460, 230, 'IMG portada'),
    text(48, 530, 'Cursos destacados', 26, 700),
    ...[0, 1, 2].map((i) => [
      rect(48 + i * 464, 560, 416, 250, c.panel),
      imgBox(72 + i * 464, 584, 368, 112, 'IMG curso'),
      text(72 + i * 464, 732, 'Titulo del curso', 20, 700),
      text(72 + i * 464, 766, 'Descripcion corta', 16, 500),
      button(72 + i * 464, 802, 150, 'Ver detalle'),
    ].join('\n')),
    footer(),
  ].join('\n');
  return frame('Home', body);
}

function listadoCursos() {
  const body = [
    navbar('Cursos'),
    rect(48, 160, 300, 700, c.panel),
    text(72, 210, 'Filtros', 24, 700),
    labelBox(72, 246, 240, 46, 'Buscar curso', c.bg),
    labelBox(72, 320, 240, 46, 'Categoria', c.bg),
    labelBox(72, 394, 240, 46, 'Nivel', c.bg),
    labelBox(72, 468, 240, 46, 'Valoracion', c.bg),
    button(72, 560, 160, 'Aplicar'),
    text(392, 190, 'Listado de cursos', 26, 700),
    ...[0, 1, 2].map((i) => [
      rect(392, 224 + i * 210, 1000, 170, c.panel),
      imgBox(424, 252 + i * 210, 220, 112, 'IMG curso'),
      text(680, 270 + i * 210, 'Titulo del curso', 22, 700),
      text(680, 308 + i * 210, 'Instructor | duracion | nivel', 16, 500),
      text(680, 344 + i * 210, 'Descripcion corta del curso', 16, 500),
      button(1210, 286 + i * 210, 140, 'Detalle'),
    ].join('\n')),
    footer(),
  ].join('\n');
  return frame('Listado Cursos', body);
}

function detalleCurso() {
  const body = [
    navbar('Cursos'),
    rect(48, 160, 1344, 360, c.panel),
    imgBox(88, 200, 460, 260, 'IMG portada curso'),
    text(600, 220, 'Titulo del curso', 32, 700),
    text(600, 268, 'Instructor | categoria | nivel', 18, 500),
    text(600, 314, 'Descripcion larga del curso y objetivos principales', 18, 500),
    button(600, 390, 190, 'Inscribirse'),
    button(810, 390, 160, 'Login'),
    rect(48, 560, 820, 300, c.panel),
    text(88, 612, 'Temario', 26, 700),
    ...['Modulo 1 - Introduccion', 'Modulo 2 - Practica', 'Modulo 3 - Proyecto'].map((item, i) => labelBox(88, 648 + i * 62, 720, 42, item, c.bg)),
    rect(910, 560, 482, 300, c.panel),
    text(950, 612, 'Reviews', 26, 700),
    labelBox(950, 648, 380, 56, 'Valoracion media', c.bg),
    labelBox(950, 730, 380, 56, 'Comentario alumno', c.bg),
    footer(),
  ].join('\n');
  return frame('Detalle Curso', body);
}

function loginRegister() {
  const body = [
    navbar(),
    rect(180, 190, 500, 620, c.panel),
    text(220, 250, 'Login', 30, 700),
    labelBox(220, 300, 380, 54, 'Email', c.bg),
    labelBox(220, 380, 380, 54, 'Password', c.bg),
    button(220, 470, 180, 'Entrar'),
    text(220, 560, 'Link a registro', 16, 500),
    rect(760, 190, 500, 620, c.panel),
    text(800, 250, 'Registro', 30, 700),
    labelBox(800, 300, 380, 54, 'Nombre', c.bg),
    labelBox(800, 374, 380, 54, 'Email', c.bg),
    labelBox(800, 448, 380, 54, 'Password', c.bg),
    labelBox(800, 522, 380, 54, 'Rol alumno/instructor', c.bg),
    button(800, 620, 190, 'Crear cuenta'),
    footer(),
  ].join('\n');
  return frame('Login Register', body);
}

function dashboardInstructor() {
  const body = [
    navbar('Instructor'),
    text(48, 180, 'Resumen instructor', 26, 700),
    ...['Cursos creados', 'Alumnos', 'Valoracion'].map((item, i) => [
      rect(48 + i * 336, 210, 300, 130, c.panel),
      text(80 + i * 336, 260, item, 18, 700),
      text(80 + i * 336, 302, 'Dato numerico', 22, 700),
    ].join('\n')),
    button(1080, 238, 210, 'Crear curso'),
    text(48, 410, 'Mis cursos publicados', 26, 700),
    ...[0, 1, 2].map((i) => [
      rect(48, 448 + i * 132, 1344, 104, c.panel),
      imgBox(72, 466 + i * 132, 120, 68, 'IMG'),
      text(220, 492 + i * 132, 'Titulo del curso', 20, 700),
      text(220, 526 + i * 132, 'Estado | alumnos inscritos | progreso medio', 16, 500),
      button(1180, 476 + i * 132, 150, 'Gestionar'),
    ].join('\n')),
    footer(),
  ].join('\n');
  return frame('Dashboard Instructor', body);
}

function wizardCrearCurso() {
  const body = [
    navbar('Instructor'),
    rect(48, 170, 1344, 80, c.panel),
    text(88, 220, 'Wizard crear curso - Paso 1: Datos basicos', 26, 700),
    labelBox(960, 188, 110, 44, 'Paso 1', c.mid),
    labelBox(1088, 188, 110, 44, 'Paso 2', c.bg),
    labelBox(1216, 188, 110, 44, 'Paso 3', c.bg),
    rect(240, 300, 960, 520, c.panel),
    labelBox(300, 360, 840, 56, 'Titulo del curso', c.bg),
    labelBox(300, 444, 840, 56, 'Descripcion corta', c.bg),
    labelBox(300, 528, 400, 56, 'Categoria', c.bg),
    labelBox(740, 528, 400, 56, 'Nivel', c.bg),
    imgBox(300, 620, 260, 140, 'IMG portada'),
    button(940, 720, 150, 'Siguiente'),
    footer(),
  ].join('\n');
  return frame('Wizard Crear Curso Paso 1', body);
}

function dashboardAlumno() {
  const body = [
    navbar('Alumno'),
    text(48, 180, 'Mis cursos', 28, 700),
    ...[0, 1, 2].map((i) => [
      rect(48 + i * 464, 230, 416, 300, c.panel),
      imgBox(72 + i * 464, 254, 368, 126, 'IMG curso'),
      text(72 + i * 464, 420, 'Titulo del curso', 22, 700),
      labelBox(72 + i * 464, 454, 300, 24, 'Barra progreso', c.bg),
      text(72 + i * 464, 506, 'Ultima leccion vista', 16, 500),
      button(72 + i * 464, 552, 150, 'Continuar'),
    ].join('\n')),
    rect(48, 620, 1344, 220, c.panel),
    text(88, 674, 'Actividad reciente', 24, 700),
    labelBox(88, 710, 1180, 42, 'Leccion completada', c.bg),
    labelBox(88, 770, 1180, 42, 'Nuevo curso asignado', c.bg),
    footer(),
  ].join('\n');
  return frame('Dashboard Alumno Mis Cursos', body);
}

function visorLeccion() {
  const body = [
    navbar('Alumno'),
    rect(48, 160, 300, 700, c.panel),
    text(80, 212, 'Temario', 24, 700),
    ...['Leccion 1', 'Leccion 2', 'Leccion actual', 'Leccion 4'].map((item, i) => labelBox(80, 250 + i * 64, 220, 42, item, i === 2 ? c.mid : c.bg)),
    rect(392, 160, 1000, 560, c.panel),
    text(432, 212, 'Titulo de la leccion', 28, 700),
    imgBox(432, 250, 900, 380, 'VIDEO / PDF'),
    labelBox(432, 650, 760, 28, 'Barra progreso video', c.bg),
    rect(392, 760, 1000, 120, c.panel),
    button(432, 798, 210, 'Marcar completada'),
    button(664, 798, 150, 'Siguiente'),
    footer(),
  ].join('\n');
  return frame('Visor Leccion', body);
}

async function writeAssets() {
  await fs.mkdir(outDir, { recursive: true });
  const assets = [
    ['01-home.svg', home()],
    ['02-listado-cursos.svg', listadoCursos()],
    ['03-detalle-curso.svg', detalleCurso()],
    ['04-login-register.svg', loginRegister()],
    ['05-dashboard-instructor.svg', dashboardInstructor()],
    ['06-wizard-crear-curso-paso-1.svg', wizardCrearCurso()],
    ['07-dashboard-alumno-mis-cursos.svg', dashboardAlumno()],
    ['08-visor-leccion.svg', visorLeccion()],
  ];

  for (const [file, svg] of assets) {
    await fs.writeFile(path.join(outDir, file), svg, 'utf8');
  }

  const readme = `# Wireframes Figma - Academy Edition

Estos wireframes son una entrega separada de la demo visual existente.

## Frames

Todos los SVG tienen tamano Desktop de Figma: 1440 x 1024.

- 01-home.svg -> Home
- 02-listado-cursos.svg -> Listado Cursos
- 03-detalle-curso.svg -> Detalle Curso
- 04-login-register.svg -> Login Register
- 05-dashboard-instructor.svg -> Dashboard Instructor
- 06-wizard-crear-curso-paso-1.svg -> Wizard Crear Curso Paso 1
- 07-dashboard-alumno-mis-cursos.svg -> Dashboard Alumno Mis Cursos
- 08-visor-leccion.svg -> Visor Leccion

## Estilo

Solo se usan rectangulos y texto. La paleta queda limitada a grises (#F5F5F5, #D9D9D9, #BFBFBF, #999999), blanco para superficies y negro para texto.

## Conexiones Prototype sugeridas

- Home: boton Ver Cursos -> Listado Cursos.
- Listado Cursos: boton Detalle -> Detalle Curso.
- Detalle Curso: boton Login -> Login Register.
- Detalle Curso: boton Inscribirse -> Login Register o Dashboard Alumno Mis Cursos.
- Login Register: Entrar -> Dashboard Alumno Mis Cursos o Dashboard Instructor segun rol.
- Dashboard Instructor: Crear curso -> Wizard Crear Curso Paso 1.
- Dashboard Instructor: Gestionar -> Detalle Curso.
- Wizard Crear Curso Paso 1: Siguiente -> Dashboard Instructor.
- Dashboard Alumno Mis Cursos: Continuar -> Visor Leccion.
- Visor Leccion: Siguiente -> Visor Leccion.
`;
  await fs.writeFile(path.join(outDir, 'README.md'), readme, 'utf8');
}

writeAssets().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
