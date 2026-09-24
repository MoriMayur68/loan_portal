const mongoose = require('mongoose');

const emiScheduleSchema = new mongoose.Schema({
  installmentNumber: Number,
  dueDate: Date,
  amount: Number,
  principal: Number,
  interest: Number,
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  paidDate: Date,
});

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    loanNumber: {
      type: String,
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [1000, 'Minimum loan amount is ₹1,000'],
    },
    tenure: {
      type: Number,
      required: [true, 'Tenure is required'],
      min: 1,
      max: 360,
    },
    interestRate: {
      type: Number,
      default: 12,
    },
    purpose: {
      type: String,
      required: [true, 'Loan purpose is required'],
      enum: ['Personal', 'Home', 'Education', 'Vehicle', 'Business', 'Medical', 'Other'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'closed'],
      default: 'pending',
    },
    emiAmount: {
      type: Number,
    },
    totalRepayable: {
      type: Number,
    },
    totalInterest: {
      type: Number,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    outstandingBalance: {
      type: Number,
    },
    emiSchedule: [emiScheduleSchema],
    approvedAt: Date,
    closedAt: Date,
    rejectionReason: String,
    adminNotes: String,
    documents: [String],
    employmentType: {
      type: String,
      enum: ['Salaried', 'Self-Employed', 'Business', 'Student', 'Other'],
    },
    monthlyIncome: Number,
    creditScore: Number,
  },
  { timestamps: true }
);

// Generate loan number before saving
loanSchema.pre('save', async function (next) {
  if (!this.loanNumber) {
    const count = await mongoose.model('Loan').countDocuments();
    this.loanNumber = `LN${String(count + 1).padStart(6, '0')}`;
  }

  // Calculate EMI when approved
  if (this.isModified('status') && this.status === 'approved') {
    const P = this.amount;
    const r = this.interestRate / 100 / 12;
    const n = this.tenure;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    this.emiAmount = Math.round(emi);
    this.totalRepayable = Math.round(emi * n);
    this.totalInterest = Math.round(emi * n - P);
    this.outstandingBalance = P;
    this.approvedAt = new Date();

    // Generate EMI schedule
    let balance = P;
    const schedule = [];
    const startDate = new Date();
    for (let i = 1; i <= n; i++) {
      const interestComponent = Math.round(balance * r);
      const principalComponent = Math.round(emi) - interestComponent;
      balance -= principalComponent;
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule.push({
        installmentNumber: i,
        dueDate,
        amount: Math.round(emi),
        principal: principalComponent,
        interest: interestComponent,
        status: 'pending',
      });
    }
    this.emiSchedule = schedule;
  }

  next();
});

module.exports = mongoose.model('Loan', loanSchema);
