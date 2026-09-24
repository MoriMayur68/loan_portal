const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');

// @desc  Make a payment
// @route POST /api/payments
const makePayment = async (req, res) => {
  try {
    const { loanId, amount, paymentMethod, transactionId, remarks, installmentNumber } = req.body;

    const loan = await Loan.findOne({ _id: loanId, userId: req.user._id });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    if (loan.status !== 'active') {
      return res.status(400).json({ message: 'Payments can only be made on active loans' });
    }

    const payment = await Payment.create({
      loanId,
      userId: req.user._id,
      amount,
      paymentMethod,
      transactionId,
      remarks,
      installmentNumber,
    });

    // Update loan balance
    loan.amountPaid += amount;
    loan.outstandingBalance = Math.max(0, loan.totalRepayable - loan.amountPaid);

    // Update EMI schedule
    if (installmentNumber) {
      const emiEntry = loan.emiSchedule.find((e) => e.installmentNumber === installmentNumber);
      if (emiEntry) {
        emiEntry.status = 'paid';
        emiEntry.paidDate = new Date();
      }
    }

    // Close loan if fully paid
    if (loan.outstandingBalance <= 0) {
      loan.status = 'closed';
      loan.closedAt = new Date();
      await Notification.create({
        userId: req.user._id,
        title: 'Loan Closed',
        message: `Congratulations! Your loan ${loan.loanNumber} has been fully repaid and closed.`,
        type: 'loan_closed',
      });
    } else {
      await Notification.create({
        userId: req.user._id,
        title: 'Payment Received',
        message: `Payment of ₹${amount.toLocaleString()} received for loan ${loan.loanNumber}.`,
        type: 'payment_received',
      });
    }

    await loan.save();

    res.status(201).json({ payment, loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get payment history for a loan
// @route GET /api/payments/loan/:loanId
const getLoanPayments = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.loanId, userId: req.user._id });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const payments = await Payment.find({ loanId: req.params.loanId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all payments of logged-in user
// @route GET /api/payments
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('loanId', 'loanNumber amount purpose')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { makePayment, getLoanPayments, getMyPayments };
