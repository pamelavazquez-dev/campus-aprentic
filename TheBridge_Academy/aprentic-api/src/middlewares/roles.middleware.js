const { getDoc } = require('../services/base.service');

// Asignar el rol al usuario realizando una consulta a las colecciones
async function checkUserRole(req) {
  if (req.user.role) return req.user.role; // Caché en caso de múltiples middlewares

  // Validamos a qué colección pertenece el UID
  const admin = await getDoc('admin', req.user.uid);
  if (admin) return 'admin';

  const profesor = await getDoc('profesor', req.user.uid);
  if (profesor) return 'profesor';

  const alumno = await getDoc('alumnos', req.user.uid);
  if (alumno) return 'alumno';

  return 'guest';
}

function hasRole(allowedRoles) {
  return async (req, res, next) => {
    try {
      const role = await checkUserRole(req);
      req.user.role = role;
      
      if (allowedRoles.includes(role)) {
        return next();
      } else {
        return res.status(403).json({ error: 'Forbidden: No tienes permisos suficientes para realizar esta acción' });
      }
    } catch (error) {
      console.error('Error verificando el rol:', error.message);
      return res.status(500).json({ error: 'Error interno verificando permisos' });
    }
  };
}

module.exports = {
  hasRole
};
