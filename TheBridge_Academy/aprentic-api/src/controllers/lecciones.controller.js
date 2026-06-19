const leccionesService = require('../services/lecciones.service');
const createCrudController = require('./crud.controller');

module.exports = {
  ...createCrudController({
    list: leccionesService.obtenerLecciones,
    getById: leccionesService.obtenerLeccionPorId,
    create: leccionesService.crearLeccion,
    update: leccionesService.actualizarLeccion,
    remove: leccionesService.eliminarLeccion,
  }),

  async getByModulo(req, res, next) {
    try {
      res.json(await leccionesService.obtenerLeccionesPorModulo(req.params.moduloId));
    } catch (error) {
      next(error);
    }
  },
};
