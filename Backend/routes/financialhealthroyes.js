// financialHealthRoutes.js
const express = require('express');
const router = express.Router();
const financialHealthController = require('../controllers/financialHealthController');

router.post('/financial-health', financialHealthController.getFinancialHealthScore);

module.exports = router;
