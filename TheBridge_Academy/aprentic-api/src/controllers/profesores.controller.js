const profesoresService = require('../services/profesores.service');
const createCrudController = require('./crud.controller');

module.exports = createCrudController({
  list: profesoresService.obtenerProfesores,
  getById: profesoresService.obtenerProfesorPorId,
  create: profesoresService.crearProfesor,
  update: profesoresService.actualizarProfesor,
  remove: profesoresService.eliminarProfesor,
});
