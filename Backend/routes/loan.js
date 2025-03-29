// loanRoutes.js
const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

router.get('/loans', loanController.getLoans);
router.post('/loans/dti', loanController.calculateDTI);
router.post('/loans/optimize', loanController.optimizeLoans);

module.exports = router;
