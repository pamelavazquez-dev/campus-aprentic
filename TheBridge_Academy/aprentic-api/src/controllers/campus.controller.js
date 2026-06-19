const campusService = require('../services/campus.service');
const createCrudController = require('./crud.controller');

module.exports = createCrudController({
  list: campusService.obtenerCampus,
  getById: campusService.obtenerCampusPorId,
  create: campusService.crearCampus,
  update: campusService.actualizarCampus,
  remove: campusService.eliminarCampus,
});
