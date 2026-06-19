const express = require('express');
const promocionesController = require('../controllers/promociones.controller');

const router = express.Router();

router.get('/', promocionesController.getAll);
router.get('/:id', promocionesController.getById);
router.post('/', promocionesController.create);
router.put('/:id', promocionesController.update);
router.delete('/:id', promocionesController.delete);

module.exports = router;
