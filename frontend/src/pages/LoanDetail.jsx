import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLoanById, getLoanPayments } from '../api';
import './LoanDetail.css';

const LoanDetail = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLoanById(id), getLoanPayments(id)])
      .then(([l, p]) => { setLoan(l.data); setPayments(p.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!loan) return <div className="loading-center">Loan not found.</div>;

  const progress = loan.totalRepayable > 0
    ? Math.min(100, (loan.amountPaid / loan.totalRepayable) * 100).toFixed(1)
    : 0;

  return (
    <div className="loan-detail fade-in-up">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/loans">My Loans</Link> <span>/</span> {loan.loanNumber}
      </div>

      {/* Hero */}
      <div className="detail-hero glass-card">
        <div className="hero-left">
          <div className="hero-badge">{loan.purpose} Loan</div>
          <div className="hero-amount">₹{loan.amount?.toLocaleString('en-IN')}</div>
          <div className="hero-number">{loan.loanNumber}</div>
          <span className={`badge badge-${loan.status}`}>{loan.status}</span>
        </div>
        <div className="hero-right">
          {loan.status === 'active' && (
            <>
              <div className="progress-section">
                <div className="prog-header">
                  <span>Repayment Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                <div className="prog-amounts">
                  <span>Paid: ₹{loan.amountPaid?.toLocaleString('en-IN')}</span>
                  <span>Remaining: ₹{loan.outstandingBalance?.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Link to={`/payments?loanId=${loan._id}`} className="btn btn-primary">💳 Make Payment</Link>
            </>
          )}
          {loan.status === 'rejected' && (
            <div className="rejection-box">
              <div className="rejection-label">Rejection Reason</div>
              <div className="rejection-reason">{loan.rejectionReason || 'No reason provided'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Key Stats */}
      <div className="detail-stats">
        {[
          { label: 'Loan Amount', value: `₹${loan.amount?.toLocaleString('en-IN')}` },
          { label: 'EMI Amount', value: loan.emiAmount ? `₹${loan.emiAmount.toLocaleString('en-IN')}/mo` : '—' },
          { label: 'Tenure', value: `${loan.tenure} months` },
          { label: 'Interest Rate', value: `${loan.interestRate}% p.a.` },
          { label: 'Total Repayable', value: loan.totalRepayable ? `₹${loan.totalRepayable.toLocaleString('en-IN')}` : '—' },
          { label: 'Total Interest', value: loan.totalInterest ? `₹${loan.totalInterest.toLocaleString('en-IN')}` : '—' },
          { label: 'Applied On', value: new Date(loan.createdAt).toLocaleDateString('en-IN') },
          { label: 'Approved On', value: loan.approvedAt ? new Date(loan.approvedAt).toLocaleDateString('en-IN') : '—' },
        ].map((s) => (
          <div key={s.label} className="detail-stat glass-card">
            <div className="detail-stat-label">{s.label}</div>
            <div className="detail-stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>📊 Overview</button>
        <button className={`tab-btn ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>📅 EMI Schedule</button>
        <button className={`tab-btn ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>💳 Payment History</button>
      </div>

      {/* Tab: EMI Schedule */}
      {tab === 'schedule' && (
        <div className="glass-card table-card fade-in-up">
          <h3 className="table-title">EMI Schedule</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Due Date</th><th>EMI Amount</th><th>Principal</th><th>Interest</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.emiSchedule?.map((e) => (
                  <tr key={e.installmentNumber}>
                    <td>{e.installmentNumber}</td>
                    <td>{new Date(e.dueDate).toLocaleDateString('en-IN')}</td>
                    <td>₹{e.amount?.toLocaleString('en-IN')}</td>
                    <td>₹{e.principal?.toLocaleString('en-IN')}</td>
                    <td>₹{e.interest?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payments */}
      {tab === 'payments' && (
        <div className="glass-card table-card fade-in-up">
          <h3 className="table-title">Payment History</h3>
          {payments.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💳</div><p>No payments yet</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td>{p.paymentMethod}</td>
                    <td><span className={`badge badge-${p.status === 'success' ? 'active' : 'rejected'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="glass-card table-card fade-in-up" style={{ padding: '24px' }}>
          <h3 className="table-title" style={{ marginBottom: '16px' }}>Loan Information</h3>
          <div className="overview-grid">
            <OverviewRow label="Loan Number" value={loan.loanNumber} />
            <OverviewRow label="Purpose" value={loan.purpose} />
            <OverviewRow label="Employment Type" value={loan.employmentType || '—'} />
            <OverviewRow label="Monthly Income" value={loan.monthlyIncome ? `₹${loan.monthlyIncome.toLocaleString('en-IN')}` : '—'} />
            <OverviewRow label="Status" value={<span className={`badge badge-${loan.status}`}>{loan.status}</span>} />
            {loan.adminNotes && <OverviewRow label="Admin Notes" value={loan.adminNotes} />}
          </div>
        </div>
      )}
    </div>
  );
};

const OverviewRow = ({ label, value }) => (
  <div className="overview-row">
    <span className="overview-label">{label}</span>
    <span className="overview-value">{value}</span>
  </div>
);

export default LoanDetail;
