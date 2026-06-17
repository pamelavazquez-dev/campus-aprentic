const BaseService = require('./base.service');
const { db } = require('../config/db');

const COLLECTION = 'usuarios';

class UsuariosService extends BaseService {
  constructor() {
    super(COLLECTION, db);
  }

  // TODO: getAll()
  // TODO: getById(id)
  // TODO: create(data)
  // TODO: update(id, data)
  // TODO: delete(id)
  // TODO: getByEmail(email)
  // TODO: getByRol(rol)
}

module.exports = new UsuariosService();
