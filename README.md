# Loan Shark – Full-Stack MERN Loan Management Portal

A full-stack Loan Management Portal built with MongoDB, Express.js, React.js (Vite), and Node.js with separate client and admin applications.

---

## 📁 Project Architecture

```
loan-management-portal/
├── backend/                  # Express REST API & MongoDB Data Layer (Port 5000)
│   ├── controllers/          # Business logic (Auth, Loans, Admin, Payments, Notifications)
│   ├── middleware/           # JWT Authentication & Admin RBAC
│   ├── models/               # Mongoose Schemas (User, Loan, Payment, Notification)
│   ├── routes/               # API endpoint routing
│   ├── seeder.js             # Initial database seeder script
│   └── server.js             # Express server entry point
│
├── frontend/                 # Customer Portal React App (Port 5173)
│   ├── src/
│   │   ├── api/              # Axios HTTP client with JWT interceptor
│   │   ├── components/       # Navbar, Status Badges, etc.
│   │   ├── context/          # AuthContext with token persistence
│   │   └── pages/            # Dashboard, ApplyLoan, MyLoans, LoanDetail, Payments, Profile, Login, Register
│
└── admin/                    # Risk & Admin Control React App (Port 5174)
    ├── src/
    │   ├── api/              # Admin Axios client
    │   ├── components/       # Sidebar, TopBar, StatCards, etc.
    │   ├── context/          # AdminAuthContext
    │   └── pages/            # Dashboard, Loans Review, LoanDetail, Users, Payments Ledger, Reports, Login
```

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install

# (Optional) Seed the database with sample admin, borrowers, and loans:
npm run seed

# Start API Server (Runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup (Customer Portal)
```bash
cd ../frontend
npm install
npm run dev
# Customer Portal runs at http://localhost:5173
```

### 3. Admin Dashboard Setup
```bash
cd ../admin
npm install
npm run dev
# Admin Portal runs at http://localhost:5174
```

---

## 🔑 Default Credentials (After Seeding)

### Administrator Portal (`http://localhost:5174`)
- **Username / Email:** `admin123` or `admin123@loanshark.com`
- **Password:** `admin@123`

### Customer Portal (`http://localhost:5173`)
- **Email:** `rahul@example.com` (or `priya@example.com`)
- **Password:** `password123`
*(Or register a new account on the customer portal)*

---

## ✨ Features & Functionality

### 👤 Customer Portal (`frontend`)
- **JWT Authentication:** Secure user registration, sign-in, and auto token-refresh.
- **Interactive Dashboard:** Financial overview, repayment progress tracker, quick action widgets.
- **Multi-Step Loan Application:** Dynamic monthly EMI calculator, amount presets, purpose selector, and review verification.
- **Loan Portfolio:** Filterable loan list by status with active progress bars.
- **Loan Details & Amortization Schedule:** Breakdown of Principal vs. Interest per EMI installment.
- **Online Payments:** Instant repayments against active loans, transaction ID tracking, and auto loan closure upon full settlement.
- **Notifications Center:** In-app alert system for loan approvals, rejections, and payment receipts.
- **User Profile:** Manage profile details, contact information, and password updates.

### 🛡️ Admin Dashboard (`admin`)
- **Executive Analytics:** Chart.js visualisations of loan distribution and category demand.
- **Application Review Workflow:** Approve with custom annual interest rate or reject with specific reason.
- **Amortization Engine:** Auto-computes diminishing-balance EMI schedules upon approval.
- **Borrower Management:** Overview of user profiles, income disclosures, and account activation/suspension toggles.
- **Payment Ledger:** Real-time stream of all repayments across the portfolio.
- **Performance Reports:** Capital disbursed vs. capital recovered ratios and monthly disbursement trends.
