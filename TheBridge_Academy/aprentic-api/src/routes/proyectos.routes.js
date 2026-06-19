const express = require('express');
const proyectosController = require('../controllers/proyectos.controller');

const router = express.Router();

router.get('/', proyectosController.getAll);
router.get('/:id', proyectosController.getById);
router.post('/', proyectosController.create);
router.put('/:id', proyectosController.update);
router.delete('/:id', proyectosController.delete);

module.exports = router;
