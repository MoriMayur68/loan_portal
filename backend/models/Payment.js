const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be positive'],
    },
    paymentMethod: {
      type: String,
      enum: ['Online', 'Bank Transfer', 'Cash', 'Cheque', 'UPI'],
      default: 'Online',
    },
    transactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'success',
    },
    remarks: {
      type: String,
      trim: true,
    },
    installmentNumber: {
      type: Number,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
