const BaseService = require('./base.service');
const { db } = require('../config/db');

const COLLECTION = 'notas';

class NotasService extends BaseService {
  constructor() {
    super(COLLECTION, db);
  }

  // TODO: getAll()
  // TODO: getById(id)
  // TODO: create(data)
  // TODO: update(id, data)
  // TODO: delete(id)
  // TODO: getByProyecto(proyectoId)
  // TODO: getByAlumno(alumnoId)
  // TODO: getByProfesor(profesorId)
}

module.exports = new NotasService();
