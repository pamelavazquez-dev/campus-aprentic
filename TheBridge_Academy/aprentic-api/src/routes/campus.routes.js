const express = require('express');
const campusController = require('../controllers/campus.controller');

const router = express.Router();

router.get('/', campusController.getAll);
router.get('/:id', campusController.getById);
router.post('/', campusController.create);
router.put('/:id', campusController.update);
router.delete('/:id', campusController.delete);

module.exports = router;
