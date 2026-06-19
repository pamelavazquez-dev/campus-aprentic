const modulosService = require('../services/modulos.service');
const createCrudController = require('./crud.controller');

module.exports = {
  ...createCrudController({
    list: modulosService.obtenerModulos,
    getById: modulosService.obtenerModuloPorId,
    create: modulosService.crearModulo,
    update: modulosService.actualizarModulo,
    remove: modulosService.eliminarModulo,
  }),

  async getByLeccion(req, res, next) {
    try {
      res.json(await modulosService.obtenerModulosPorLeccion(req.params.leccionId));
    } catch (error) {
      next(error);
    }
  },
};
