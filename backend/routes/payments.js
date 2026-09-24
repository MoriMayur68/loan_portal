const express = require('express');
const router = express.Router();
const { makePayment, getLoanPayments, getMyPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, makePayment);
router.get('/', protect, getMyPayments);
router.get('/loan/:loanId', protect, getLoanPayments);

module.exports = router;
