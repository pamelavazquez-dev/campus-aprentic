import fs from 'node:fs/promises';

const files = [
  {
    path: 'docs/figma-demo/01-flujo-avanzado-overview.svg',
    frames: [[70, 190, 1660, 900]],
  },
  {
    path: 'docs/figma-demo/02-publico-descubrimiento.svg',
    frames: [
      [70, 205, 500, 670],
      [650, 205, 500, 670],
      [1230, 205, 500, 670],
    ],
  },
  {
    path: 'docs/figma-demo/03-instructor-avanzado.svg',
    frames: [
      [70, 205, 500, 650],
      [650, 205, 500, 650],
      [1230, 205, 500, 650],
    ],
  },
  {
    path: 'docs/figma-demo/04-alumno-avanzado.svg',
    frames: [
      [70, 205, 385, 665],
      [505, 205, 385, 665],
      [940, 205, 385, 665],
      [1375, 205, 385, 665],
    ],
  },
];

function textWidth(value, size) {
  return value.replaceAll(/&[^;]+;/g, 'x').length * size * 0.54;
}

function collectElements(svg) {
  const elements = [];

  for (const match of svg.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*fill="([^"]+)"/g)) {
    elements.push({
      kind: 'rect',
      x: Number(match[1]),
      y: Number(match[2]),
      w: Number(match[3]),
      h: Number(match[4]),
      fill: match[5],
    });
  }

  for (const match of svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"[^>]*font-size="([\d.]+)"[^>]*>([^<]*)<\/text>/g)) {
    const size = Number(match[3]);
    elements.push({
      kind: 'text',
      value: match[4],
      x: Number(match[1]),
      y: Number(match[2]) - size,
      w: textWidth(match[4], size),
      h: size * 1.25,
    });
  }

  for (const match of svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)) {
    const cx = Number(match[1]);
    const cy = Number(match[2]);
    const r = Number(match[3]);
    elements.push({
      kind: 'circle',
      x: cx - r,
      y: cy - r,
      w: r * 2,
      h: r * 2,
    });
  }

  return elements;
}

function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const overflows = [];
const overlaps = [];
const tightNavGaps = [];

for (const file of files) {
  const svg = await fs.readFile(file.path, 'utf8');
  const elements = collectElements(svg);

  for (const frame of file.frames) {
    const [fx, fy, fw, fh] = frame;
    for (const element of elements) {
      const startsInFrame =
        element.x >= fx &&
        element.x <= fx + fw &&
        element.y >= fy &&
        element.y <= fy + fh;

      if (!startsInFrame) continue;

      const maxX = element.x + element.w;
      const maxY = element.y + element.h;
      const isOverflowing = maxX > fx + fw + 6 || maxY > fy + fh + 6;

      if (isOverflowing) {
        overflows.push({
          file: file.path,
          frame,
          kind: element.kind,
          value: element.value ?? '',
          x: Math.round(element.x),
          y: Math.round(element.y),
          maxX: Math.round(maxX),
          maxY: Math.round(maxY),
          limitX: fx + fw,
          limitY: fy + fh,
        });
      }
    }
  }

  const navLabels = new Set(['Cursos', 'Dashboard', 'Panel', 'Perfil']);
  const loginButtons = elements.filter((element) => {
    return (
      element.kind === 'rect' &&
      element.w >= 26 &&
      element.w <= 96 &&
      element.h >= 24 &&
      element.h <= 32 &&
      element.fill === 'url(#brandRed)'
    );
  });

  for (const label of elements.filter((element) => element.kind === 'text' && navLabels.has(element.value))) {
    const collidingButton = loginButtons.find((button) => intersects(label, button));
    if (collidingButton) {
      overlaps.push({
        file: file.path,
        value: label.value,
        label: {
          x: Math.round(label.x),
          y: Math.round(label.y),
          maxX: Math.round(label.x + label.w),
          maxY: Math.round(label.y + label.h),
        },
        button: {
          x: Math.round(collidingButton.x),
          y: Math.round(collidingButton.y),
          maxX: Math.round(collidingButton.x + collidingButton.w),
          maxY: Math.round(collidingButton.y + collidingButton.h),
        },
      });
    }
  }

  const navRows = new Map();
  for (const element of elements.filter((item) => item.kind === 'text')) {
    if (!['ACADEMY', 'EDITION', 'Cursos', 'Panel', 'Perfil'].includes(element.value)) continue;
    const rowKey = Math.round(element.y / 20) * 20;
    if (!navRows.has(rowKey)) navRows.set(rowKey, []);
    navRows.get(rowKey).push(element);
  }

  for (const [rowKey, row] of navRows) {
    const sorted = row.sort((a, b) => a.x - b.x);
    for (let index = 0; index < sorted.length - 1; index += 1) {
      const current = sorted[index];
      const next = sorted[index + 1];
      const gap = next.x - (current.x + current.w);
      if (gap < 10 && current.value !== 'ACADEMY' && next.value !== 'EDITION') {
        tightNavGaps.push({
          file: file.path,
          row: rowKey,
          current: current.value,
          next: next.value,
          gap: Math.round(gap),
        });
      }
    }
  }
}

if (overflows.length > 0 || overlaps.length > 0 || tightNavGaps.length > 0) {
  console.error(
    JSON.stringify(
      {
        overflowCount: overflows.length,
        overlapCount: overlaps.length,
        tightNavGapCount: tightNavGaps.length,
        overflows,
        overlaps,
        tightNavGaps,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} else {
  console.log('Layout check passed: no frame overflows, nav/login overlaps, or tight nav gaps detected in SVG 01, 02, 03, or 04.');
}
