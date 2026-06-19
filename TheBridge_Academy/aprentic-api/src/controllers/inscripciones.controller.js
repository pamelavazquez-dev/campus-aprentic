const inscripcionesService = require('../services/inscripciones.service');
const createCrudController = require('./crud.controller');

module.exports = {
  ...createCrudController({
    list: inscripcionesService.obtenerInscripciones,
    getById: inscripcionesService.obtenerInscripcionPorId,
    create: inscripcionesService.crearInscripcion,
    update: inscripcionesService.actualizarInscripcion,
    remove: inscripcionesService.eliminarInscripcion,
  }),

  async getByPromocion(req, res, next) {
    try {
      res.json(await inscripcionesService.obtenerInscripcionesPorPromocion(req.params.promocionId));
    } catch (error) {
      next(error);
    }
  },

  async getByCampus(req, res, next) {
    try {
      res.json(await inscripcionesService.obtenerInscripcionesPorCampus(req.params.campusId));
    } catch (error) {
      next(error);
    }
  },
};
