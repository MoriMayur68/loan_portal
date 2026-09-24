const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Loan = require('./models/Loan');
const Payment = require('./models/Payment');
const Notification = require('./models/Notification');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Loan.deleteMany();
    await Payment.deleteMany();
    await Notification.deleteMany();
    console.log('Cleared existing data.');

    // 1. Create Admin
    const admin = await User.create({
      name: 'admin123',
      email: 'admin123@loanshark.com',
      password: 'admin@123',
      role: 'admin',
      phone: '+91 9876500001',
      address: 'FinTech Tower, Financial District, Mumbai',
      occupation: 'Loan Portfolio Director',
      annualIncome: 3500000,
    });
    console.log('✅ Admin user created: admin123 (email: admin123@loanshark.com) / admin@123');

    // 2. Create Sample Borrowers
    const borrower1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 9876543210',
      address: '42, Sunshine Enclave, Bengaluru',
      occupation: 'Senior Software Engineer',
      annualIncome: 1800000,
    });

    const borrower2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'password123',
      role: 'user',
      phone: '+91 9876543211',
      address: '15, Green Park, Ahmedabad',
      occupation: 'Architect',
      annualIncome: 1400000,
    });
    console.log('✅ Sample borrowers created: rahul@example.com, priya@example.com');

    // 3. Create Loans for Rahul
    // Loan 1: Active Home Loan
    const loan1 = new Loan({
      userId: borrower1._id,
      loanNumber: 'LN000001',
      amount: 1500000,
      tenure: 60,
      interestRate: 9.5,
      purpose: 'Home',
      status: 'active',
      employmentType: 'Salaried',
      monthlyIncome: 150000,
      approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    });
    // Calculate EMI manually for seeded data
    const r1 = loan1.interestRate / 100 / 12;
    const n1 = loan1.tenure;
    const emi1 = (loan1.amount * r1 * Math.pow(1 + r1, n1)) / (Math.pow(1 + r1, n1) - 1);
    loan1.emiAmount = Math.round(emi1);
    loan1.totalRepayable = Math.round(emi1 * n1);
    loan1.totalInterest = Math.round(loan1.totalRepayable - loan1.amount);
    
    // Seed payments (2 EMIs paid)
    loan1.amountPaid = Math.round(emi1 * 2);
    loan1.outstandingBalance = loan1.totalRepayable - loan1.amountPaid;

    // Seed EMI schedule
    let bal1 = loan1.amount;
    const schedule1 = [];
    const startDate1 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    for (let i = 1; i <= n1; i++) {
      const interestComp = Math.round(bal1 * r1);
      const principalComp = Math.round(emi1) - interestComp;
      bal1 -= principalComp;
      const dueDate = new Date(startDate1);
      dueDate.setMonth(dueDate.getMonth() + i);
      schedule1.push({
        installmentNumber: i,
        dueDate,
        amount: Math.round(emi1),
        principal: principalComp,
        interest: interestComp,
        status: i <= 2 ? 'paid' : 'pending',
        paidDate: i <= 2 ? dueDate : undefined,
      });
    }
    loan1.emiSchedule = schedule1;
    await loan1.save();

    // Record Payments for Loan 1
    await Payment.create({
      loanId: loan1._id,
      userId: borrower1._id,
      amount: Math.round(emi1),
      paymentMethod: 'Online',
      transactionId: 'TXN_SEED_01',
      installmentNumber: 1,
      paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'success',
    });
    await Payment.create({
      loanId: loan1._id,
      userId: borrower1._id,
      amount: Math.round(emi1),
      paymentMethod: 'Online',
      transactionId: 'TXN_SEED_02',
      installmentNumber: 2,
      paymentDate: new Date(),
      status: 'success',
    });

    // Loan 2: Pending Personal Loan for Rahul
    await Loan.create({
      userId: borrower1._id,
      loanNumber: 'LN000002',
      amount: 300000,
      tenure: 24,
      interestRate: 12,
      purpose: 'Personal',
      status: 'pending',
      employmentType: 'Salaried',
      monthlyIncome: 150000,
    });

    // Loan 3: Pending Business Loan for Priya
    await Loan.create({
      userId: borrower2._id,
      loanNumber: 'LN000003',
      amount: 800000,
      tenure: 36,
      interestRate: 11.5,
      purpose: 'Business',
      status: 'pending',
      employmentType: 'Self-Employed',
      monthlyIncome: 116000,
    });

    // Notifications
    await Notification.create({
      userId: borrower1._id,
      title: 'Home Loan Approved!',
      message: 'Your Home Loan LN000001 for ₹15,00,000 was approved and activated.',
      type: 'loan_approved',
      isRead: false,
    });

    console.log('✅ Sample loans, payments, and notifications seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

seedData();
