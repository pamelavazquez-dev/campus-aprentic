const express = require('express');
const modulosController = require('../controllers/modulos.controller');

const router = express.Router();

router.get('/', modulosController.getAll);
router.get('/leccion/:leccionId', modulosController.getByLeccion);
router.get('/:id', modulosController.getById);
router.post('/', modulosController.create);
router.put('/:id', modulosController.update);
router.delete('/:id', modulosController.delete);

module.exports = router;
