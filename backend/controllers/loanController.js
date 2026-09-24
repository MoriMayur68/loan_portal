const Loan = require('../models/Loan');
const Notification = require('../models/Notification');

// @desc  Apply for a loan
// @route POST /api/loans
const applyLoan = async (req, res) => {
  try {
    const { amount, tenure, purpose, employmentType, monthlyIncome } = req.body;

    const loan = await Loan.create({
      userId: req.user._id,
      amount,
      tenure,
      purpose,
      employmentType,
      monthlyIncome,
    });

    // Notify user
    await Notification.create({
      userId: req.user._id,
      title: 'Loan Application Submitted',
      message: `Your loan application for ₹${amount.toLocaleString()} has been submitted and is under review.`,
      type: 'general',
    });

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all loans of logged-in user
// @route GET /api/loans
const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single loan by id
// @route GET /api/loans/:id
const getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id }).populate('userId', 'name email phone');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyLoan, getMyLoans, getLoanById };
