const express = require('express');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

router.get('/aptos-por-campus', analyticsController.aptosPorCampus);
router.get('/alumnos-en-riesgo', analyticsController.alumnosEnRiesgo);
router.get('/ranking-no-aptos', analyticsController.rankingNoAptos);

module.exports = router;
