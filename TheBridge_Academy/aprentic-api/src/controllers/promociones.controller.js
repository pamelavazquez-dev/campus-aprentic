const promocionesService = require('../services/promociones.service');
const createCrudController = require('./crud.controller');

module.exports = createCrudController({
  list: promocionesService.obtenerPromociones,
  getById: promocionesService.obtenerPromocionPorId,
  create: promocionesService.crearPromocion,
  update: promocionesService.actualizarPromocion,
  remove: promocionesService.eliminarPromocion,
});