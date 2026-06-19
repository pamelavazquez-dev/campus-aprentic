const express = require('express');
const alumnosController = require('../controllers/alumnos.controller');

const router = express.Router();

router.get('/', alumnosController.getAll);
router.get('/:id', alumnosController.getById);
router.post('/', alumnosController.create);
router.put('/:id', alumnosController.update);
router.delete('/:id', alumnosController.delete);

module.exports = router;
