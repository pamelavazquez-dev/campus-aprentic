const express = require('express');
const profesoresController = require('../controllers/profesores.controller');

const router = express.Router();

router.get('/', profesoresController.getAll);
router.get('/:id', profesoresController.getById);
router.post('/', profesoresController.create);
router.put('/:id', profesoresController.update);
router.delete('/:id', profesoresController.delete);

module.exports = router;
