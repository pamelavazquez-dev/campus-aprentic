const notasService = require('../services/notas.service');
const createCrudController = require('./crud.controller');

module.exports = {
  ...createCrudController({
    list: notasService.obtenerNotas,
    getById: notasService.obtenerNotaPorId,
    create: notasService.crearNota,
    update: notasService.actualizarNota,
    remove: notasService.eliminarNota,
  }),

  async getByProyecto(req, res, next) {
    try {
      res.json(await notasService.obtenerNotasPorProyecto(req.params.proyectoId));
    } catch (error) {
      next(error);
    }
  },

  async getByAlumno(req, res, next) {
    try {
      res.json(await notasService.obtenerNotasPorAlumno(req.params.alumnoId));
    } catch (error) {
      next(error);
    }
  },

  async getByProfesor(req, res, next) {
    try {
      res.json(await notasService.obtenerNotasPorProfesor(req.params.profesorId));
    } catch (error) {
      next(error);
    }
  },
};
