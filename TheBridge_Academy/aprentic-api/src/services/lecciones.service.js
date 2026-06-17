const BaseService = require('./base.service');
const { db } = require('../config/db');

const COLLECTION = 'lecciones';

class LeccionesService extends BaseService {
  constructor() {
    super(COLLECTION, db);
  }

  // TODO: getAll()
  // TODO: getById(id)
  // TODO: create(data)
  // TODO: update(id, data)
  // TODO: delete(id)
  // TODO: getByModulo(moduloId)
}

module.exports = new LeccionesService();
