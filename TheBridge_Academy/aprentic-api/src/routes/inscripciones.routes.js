const express = require('express');
const inscripcionesController = require('../controllers/inscripciones.controller');

const router = express.Router();

router.get('/', inscripcionesController.getAll);
router.get('/promocion/:promocionId', inscripcionesController.getByPromocion);
router.get('/campus/:campusId', inscripcionesController.getByCampus);
router.get('/:id', inscripcionesController.getById);
router.post('/', inscripcionesController.create);
router.put('/:id', inscripcionesController.update);
router.delete('/:id', inscripcionesController.delete);

module.exports = router;
