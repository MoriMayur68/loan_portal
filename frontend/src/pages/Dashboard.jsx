import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyLoans, getMyPayments } from '../api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const Dashboard = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyLoans(), getMyPayments()])
      .then(([l, p]) => { setLoans(l.data); setPayments(p.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeLoans = loans.filter((l) => l.status === 'active');
  const pendingLoans = loans.filter((l) => l.status === 'pending');
  const totalPaid = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const outstandingBalance = activeLoans.reduce((s, l) => s + (l.outstandingBalance || 0), 0);

  const recentPayments = payments.slice(0, 5);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="dashboard fade-in-up">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            Good {getTimeGreeting()}, <span className="highlight">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="dashboard-subtitle">Here's your financial overview</p>
        </div>
        <Link to="/apply" className="btn btn-primary">
          + Apply for Loan
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>📊</div>
          <div className="stat-value">{loans.length}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#16a34a' }}>✅</div>
          <div className="stat-value">{activeLoans.length}</div>
          <div className="stat-label">Active Loans</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>⏳</div>
          <div className="stat-value">{pendingLoans.length}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>💰</div>
          <div className="stat-value">{formatCurrency(totalPaid)}</div>
          <div className="stat-label">Total Paid</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>📉</div>
          <div className="stat-value">{formatCurrency(outstandingBalance)}</div>
          <div className="stat-label">Outstanding Balance</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Active Loans */}
        <div className="glass-card dash-section">
          <div className="section-header">
            <h2 className="section-title">Active Loans</h2>
            <Link to="/loans" className="section-link">View All →</Link>
          </div>
          {activeLoans.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No active loans</p>
              <Link to="/apply" className="btn btn-outline btn-sm">Apply Now</Link>
            </div>
          ) : (
            activeLoans.map((loan) => (
              <LoanCard key={loan._id} loan={loan} />
            ))
          )}
        </div>

        {/* Recent Payments */}
        <div className="glass-card dash-section">
          <div className="section-header">
            <h2 className="section-title">Recent Payments</h2>
            <Link to="/payments" className="section-link">View All →</Link>
          </div>
          {recentPayments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <p>No payments yet</p>
            </div>
          ) : (
            recentPayments.map((p) => (
              <div key={p._id} className="payment-item">
                <div className="payment-icon">💳</div>
                <div className="payment-info">
                  <div className="payment-loan">{p.loanId?.loanNumber || 'Loan'}</div>
                  <div className="payment-date">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="payment-amount">+{formatCurrency(p.amount)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const LoanCard = ({ loan }) => {
  const progress = loan.totalRepayable > 0
    ? Math.min(100, (loan.amountPaid / loan.totalRepayable) * 100).toFixed(0)
    : 0;

  return (
    <Link to={`/loans/${loan._id}`} className="loan-card-item">
      <div className="loan-card-top">
        <div>
          <div className="loan-number">{loan.loanNumber}</div>
          <div className="loan-purpose">{loan.purpose}</div>
        </div>
        <div className="loan-amount">
          ₹{loan.amount?.toLocaleString('en-IN')}
        </div>
      </div>
      <div className="loan-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="loan-progress-text">
          <span>{progress}% repaid</span>
          <span>EMI: ₹{loan.emiAmount?.toLocaleString('en-IN')}/mo</span>
        </div>
      </div>
    </Link>
  );
};

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

export default Dashboard;
