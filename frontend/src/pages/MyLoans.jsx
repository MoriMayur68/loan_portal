import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyLoans } from '../api';
import './Loans.css';

const statusBadge = (s) => `badge badge-${s}`;

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getMyLoans().then((r) => setLoans(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? loans : loans.filter((l) => l.status === filter);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="loans-page fade-in-up">
      <div className="loans-header">
        <div>
          <h1>My Loans</h1>
          <p className="page-subtitle">{loans.length} total applications</p>
        </div>
        <Link to="/apply" className="btn btn-primary">✨ Apply New</Link>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {['all', 'pending', 'approved', 'active', 'rejected', 'closed'].map((f) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card empty-page">
          <div style={{ fontSize: '3rem' }}>📋</div>
          <h3>No {filter !== 'all' ? filter : ''} loans found</h3>
          <p>Apply for a loan to get started</p>
          <Link to="/apply" className="btn btn-primary">Apply Now</Link>
        </div>
      ) : (
        <div className="loans-grid">
          {filtered.map((loan) => (
            <Link key={loan._id} to={`/loans/${loan._id}`} className="loan-list-card glass-card">
              <div className="loan-list-header">
                <div>
                  <div className="loan-list-number">{loan.loanNumber}</div>
                  <div className="loan-list-purpose">{loan.purpose} Loan</div>
                </div>
                <span className={statusBadge(loan.status)}>{loan.status}</span>
              </div>

              <div className="loan-list-amount">₹{loan.amount?.toLocaleString('en-IN')}</div>

              {loan.status === 'active' && (
                <div className="loan-list-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100,(loan.amountPaid/loan.totalRepayable)*100).toFixed(0)}%` }} />
                  </div>
                  <div className="loan-list-progress-row">
                    <span>Paid: ₹{loan.amountPaid?.toLocaleString('en-IN')}</span>
                    <span>Remaining: ₹{loan.outstandingBalance?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="loan-list-meta">
                <span>📅 {new Date(loan.createdAt).toLocaleDateString('en-IN')}</span>
                {loan.emiAmount && <span>EMI: ₹{loan.emiAmount?.toLocaleString('en-IN')}/mo</span>}
                <span>⏱ {loan.tenure} months</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoans;
