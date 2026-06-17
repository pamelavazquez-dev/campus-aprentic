const BaseService = require('./base.service');
const { db } = require('../config/db');

const COLLECTION = 'cursos';

class CursosService extends BaseService {
  constructor() {
    super(COLLECTION, db);
  }

  // TODO: getAll()
  // TODO: getById(id)
  // TODO: create(data)
  // TODO: update(id, data)
  // TODO: delete(id)
  // TODO: getByCampus(campusId)
  // TODO: getByInstructor(instructorId)
}

module.exports = new CursosService();
