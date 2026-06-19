const express = require('express');
const adminsController = require('../controllers/admins.controller');

const router = express.Router();

router.get('/', adminsController.getAll);
router.get('/:id', adminsController.getById);
router.post('/', adminsController.create);
router.put('/:id', adminsController.update);
router.delete('/:id', adminsController.delete);

module.exports = router;
