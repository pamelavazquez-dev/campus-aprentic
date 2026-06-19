module.exports = {
  async aptosPorCampus(req, res, next) {
    try {
      res.status(501).json({ error: 'Analytics endpoint no implementado aún' });
    } catch (error) {
      next(error);
    }
  },

  async alumnosEnRiesgo(req, res, next) {
    try {
      res.status(501).json({ error: 'Analytics endpoint no implementado aún' });
    } catch (error) {
      next(error);
    }
  },

  async rankingNoAptos(req, res, next) {
    try {
      res.status(501).json({ error: 'Analytics endpoint no implementado aún' });
    } catch (error) {
      next(error);
    }
  },
};