const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllLoans,
  getAdminLoanById,
  updateLoanStatus,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  getAllPayments,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + adminOnly
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/loans', getAllLoans);
router.get('/loans/:id', getAdminLoanById);
router.put('/loans/:id/status', updateLoanStatus);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/payments', getAllPayments);

module.exports = router;
