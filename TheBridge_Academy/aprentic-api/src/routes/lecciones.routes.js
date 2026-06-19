const express = require('express');
const leccionesController = require('../controllers/lecciones.controller');

const router = express.Router();

router.get('/', leccionesController.getAll);
router.get('/modulo/:moduloId', leccionesController.getByModulo);
router.get('/:id', leccionesController.getById);
router.post('/', leccionesController.create);
router.put('/:id', leccionesController.update);
router.delete('/:id', leccionesController.delete);

module.exports = router;
