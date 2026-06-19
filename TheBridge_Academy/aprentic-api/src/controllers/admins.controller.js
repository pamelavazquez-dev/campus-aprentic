const adminsService = require('../services/admins.service');
const createCrudController = require('./crud.controller');

module.exports = createCrudController({
  list: adminsService.obtenerAdmins,
  getById: adminsService.obtenerAdminPorId,
  create: adminsService.crearAdmin,
  update: adminsService.actualizarAdmin,
  remove: adminsService.eliminarAdmin,
});
