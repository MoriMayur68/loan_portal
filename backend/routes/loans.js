const express = require('express');
const router = express.Router();
const { applyLoan, getMyLoans, getLoanById } = require('../controllers/loanController');
const { protect } = require('../middleware/auth');

router.post('/', protect, applyLoan);
router.get('/', protect, getMyLoans);
router.get('/:id', protect, getLoanById);

module.exports = router;
