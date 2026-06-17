const BaseService = require('./base.service');
const { db } = require('../config/db');

const COLLECTION = 'reviews';

class ReviewsService extends BaseService {
  constructor() {
    super(COLLECTION, db);
  }

  // TODO: getAll()
  // TODO: getById(id)
  // TODO: create(data)
  // TODO: update(id, data)
  // TODO: delete(id)
  // TODO: getByCurso(cursoId)
  // TODO: getByAlumno(alumnoId)
}

module.exports = new ReviewsService();
