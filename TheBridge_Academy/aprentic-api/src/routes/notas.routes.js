const express = require('express');
const notasController = require('../controllers/notas.controller');

const router = express.Router();

router.get('/', notasController.getAll);
router.get('/proyecto/:proyectoId', notasController.getByProyecto);
router.get('/alumno/:alumnoId', notasController.getByAlumno);
router.get('/profesor/:profesorId', notasController.getByProfesor);
router.get('/:id', notasController.getById);
router.post('/', notasController.create);
router.put('/:id', notasController.update);
router.delete('/:id', notasController.delete);

module.exports = router;
