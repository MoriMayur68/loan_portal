const User = require('../models/User');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// @desc  Admin dashboard stats
// @route GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalLoans = await Loan.countDocuments();
    const pendingLoans = await Loan.countDocuments({ status: 'pending' });
    const activeLoans = await Loan.countDocuments({ status: 'active' });
    const approvedLoans = await Loan.countDocuments({ status: 'approved' });
    const rejectedLoans = await Loan.countDocuments({ status: 'rejected' });
    const closedLoans = await Loan.countDocuments({ status: 'closed' });

    const totalDisbursed = await Loan.aggregate([
      { $match: { status: { $in: ['active', 'closed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalCollected = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const monthlyLoans = await Loan.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const loansByPurpose = await Loan.aggregate([
      { $group: { _id: '$purpose', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalUsers,
      totalLoans,
      pendingLoans,
      activeLoans,
      approvedLoans,
      rejectedLoans,
      closedLoans,
      totalDisbursed: totalDisbursed[0]?.total || 0,
      totalCollected: totalCollected[0]?.total || 0,
      monthlyLoans,
      loansByPurpose,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all loans (admin)
// @route GET /api/admin/loans
const getAllLoans = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (status) query.status = status;

    let loans = Loan.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const [results, total] = await Promise.all([loans, Loan.countDocuments(query)]);

    res.json({ loans: results, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single loan (admin)
// @route GET /api/admin/loans/:id
const getAdminLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id).populate('userId', 'name email phone address occupation annualIncome');
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update loan status (approve/reject)
// @route PUT /api/admin/loans/:id/status
const updateLoanStatus = async (req, res) => {
  try {
    const { status, rejectionReason, adminNotes, interestRate } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (!['approved', 'rejected', 'active'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (interestRate) loan.interestRate = interestRate;
    if (rejectionReason) loan.rejectionReason = rejectionReason;
    if (adminNotes) loan.adminNotes = adminNotes;
    loan.status = status;

    await loan.save();

    // Notify user
    const notifType = status === 'approved' ? 'loan_approved' : status === 'rejected' ? 'loan_rejected' : 'general';
    const notifMsg =
      status === 'approved'
        ? `Your loan application ${loan.loanNumber} for ₹${loan.amount.toLocaleString()} has been approved! EMI: ₹${loan.emiAmount?.toLocaleString()}/month`
        : status === 'rejected'
        ? `Your loan application ${loan.loanNumber} was rejected. Reason: ${rejectionReason || 'N/A'}`
        : `Your loan ${loan.loanNumber} is now active.`;

    await Notification.create({
      userId: loan.userId,
      title: status === 'approved' ? 'Loan Approved!' : status === 'rejected' ? 'Loan Rejected' : 'Loan Active',
      message: notifMsg,
      type: notifType,
    });

    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all users (admin)
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments({ role: 'user' });
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get single user with loans (admin)
// @route GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const loans = await Loan.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json({ user, loans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Toggle user active status (admin)
// @route PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get all payments (admin)
// @route GET /api/admin/payments
const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('loanId', 'loanNumber amount')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Payment.countDocuments();
    res.json({ payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllLoans,
  getAdminLoanById,
  updateLoanStatus,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getAllPayments,
};
