const alumnosService = require('../services/alumnos.service');
const createCrudController = require('./crud.controller');

module.exports = createCrudController({
  list: alumnosService.obtenerAlumnos,
  getById: alumnosService.obtenerAlumnoPorId,
  create: alumnosService.crearAlumno,
  update: alumnosService.actualizarAlumno,
  remove: alumnosService.eliminarAlumno,
});
