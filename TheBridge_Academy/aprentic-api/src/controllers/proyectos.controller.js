const proyectosService = require('../services/proyectos.service');
const createCrudController = require('./crud.controller');

module.exports = createCrudController({
  list: proyectosService.obtenerProyectos,
  getById: proyectosService.obtenerProyectoPorId,
  create: proyectosService.crearProyecto,
  update: proyectosService.actualizarProyecto,
  remove: proyectosService.eliminarProyecto,
});