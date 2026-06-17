const BaseService = require('./base.service');
const { db } = require('../config/db');

const COLLECTION = 'modulos';

class ModulosService extends BaseService {
  constructor() {
    super(COLLECTION, db);
  }

  // TODO: getAll()
  // TODO: getById(id)
  // TODO: create(data)
  // TODO: update(id, data)
  // TODO: delete(id)
  // TODO: getByCurso(cursoId)
}

module.exports = new ModulosService();
