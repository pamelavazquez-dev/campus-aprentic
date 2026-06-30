export const getPromotionTrack = (promocion) => {
  const nombre = `${promocion?.id || ''} ${promocion?.nombre || ''}`.toLowerCase();

  if (nombre.includes('ciber')) return 'ciber';
  if (nombre.includes('fullstack') || nombre.includes('fs')) return 'fs';

  return '';
};

export const moduleBelongsToTrack = (modulo, track) => {
  if (!track) return true;

  if (modulo.tipo) return modulo.tipo === track;
  if (track === 'ciber') return modulo.id?.startsWith('mod-ciber');
  if (track === 'fs') return modulo.id?.startsWith('mod-fs');

  return true;
};

export const inferModuleTrack = (modulo) => {
  const value = `${modulo?.tipo || ''} ${modulo?.id || ''} ${modulo?.nombre || ''}`.toLowerCase();

  if (value.includes('ciber')) return 'ciber';
  if (value.includes('fullstack') || value.includes('mod-fs') || value.includes(' fs ') || value.startsWith('fs ')) return 'fs';

  return 'fs';
};

const normalizeModuleName = (nombre) => (
  nombre
    ?.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim() || ''
);

export const getUniqueModulesByName = (modulos) => {
  const seen = new Set();

  return modulos.filter((modulo) => {
    const moduleName = normalizeModuleName(modulo.nombre);

    if (!moduleName || seen.has(moduleName)) return false;

    seen.add(moduleName);
    return true;
  });
};

export const getProfesorTracks = (profesor, promociones) => {
  const profesorPromociones = Array.isArray(profesor?.promocion_id)
    ? profesor.promocion_id
    : [profesor?.promocion_id].filter(Boolean);

  const tracks = profesorPromociones
    .map((promocionId) => {
      const idStr = typeof promocionId === 'object' && promocionId.id ? String(promocionId.id) : String(promocionId);
      return promociones.find((promocion) => promocion.id === idStr);
    })
    .map(getPromotionTrack)
    .filter(Boolean);

  return [...new Set(tracks)];
};

export const filterModulesByTracks = (modulos, tracks) => {
  if (!tracks?.length) return [];

  return modulos.filter((modulo) => (
    tracks.some((track) => moduleBelongsToTrack(modulo, track))
  ));
};
