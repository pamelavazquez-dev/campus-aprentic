function createCrudController({ list, getById, create, update, remove }) {
  return {
    async getAll(req, res, next) {
      try {
        res.json(await list(req));
      } catch (error) {
        next(error);
      }
    },

    async getById(req, res, next) {
      try {
        const item = await getById(req.params.id, req);
        if (!item) return res.status(404).json({ error: 'Recurso no encontrado' });
        return res.json(item);
      } catch (error) {
        return next(error);
      }
    },

    async create(req, res, next) {
      try {
        const item = await create(req.body, req);
        res.status(201).json(item);
      } catch (error) {
        next(error);
      }
    },

    async update(req, res, next) {
      try {
        res.json(await update(req.params.id, req.body, req));
      } catch (error) {
        next(error);
      }
    },

    async delete(req, res, next) {
      try {
        await remove(req.params.id, req);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = createCrudController;
