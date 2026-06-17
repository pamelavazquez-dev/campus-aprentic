const BaseService = require('./base.service');
const { db } = require('../config/db');

const COLLECTION = 'campus';

class CampusService extends BaseService {
  constructor() {
    super(COLLECTION, db);
  }

  // TODO: getAll()
  // TODO: getById(id)
  // TODO: create(data)
  // TODO: update(id, data)
  // TODO: delete(id)
}

module.exports = new CampusService();
