import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminLoanById, updateLoanStatus } from '../api';
import toast from 'react-hot-toast';
import './LoanDetail.css';

const LoanDetail = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interestRate, setInterestRate] = useState(12);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchLoan = () => {
    setLoading(true);
    getAdminLoanById(id)
      .then((res) => {
        setLoan(res.data);
        setInterestRate(res.data.interestRate || 12);
      })
      .catch(() => toast.error('Failed to load loan details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoan();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await updateLoanStatus(id, {
        status: newStatus,
        interestRate: newStatus === 'approved' ? Number(interestRate) : undefined,
      });
      toast.success(`Loan status updated to ${newStatus}`);
      fetchLoan();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!loan) {
    return <div className="loading-center">Loan application not found.</div>;
  }

  return (
    <div className="admin-loan-detail fade-in-up">
      <div className="breadcrumb">
        <Link to="/loans">← Back to Applications</Link>
        <span>/</span>
        <span>{loan.loanNumber}</span>
      </div>

      {/* Header Banner */}
      <div className="glass-card detail-header">
        <div className="detail-header-left">
          <span className={`badge badge-${loan.status}`}>{loan.status}</span>
          <h2>{loan.purpose} Loan – {loan.loanNumber}</h2>
          <p>Applied on {new Date(loan.createdAt).toLocaleDateString('en-IN')}</p>
        </div>

        <div className="detail-header-actions">
          {loan.status === 'pending' && (
            <>
              <div className="rate-input-wrap">
                <label>Interest Rate (%):</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  style={{ width: '80px', display: 'inline-block' }}
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                />
              </div>
              <button
                className="btn btn-success"
                disabled={statusLoading}
                onClick={() => handleStatusChange('approved')}
              >
                Approve Application
              </button>
              <button
                className="btn btn-danger"
                disabled={statusLoading}
                onClick={() => handleStatusChange('rejected')}
              >
                Reject Application
              </button>
            </>
          )}

          {loan.status === 'approved' && (
            <button
              className="btn btn-primary"
              disabled={statusLoading}
              onClick={() => handleStatusChange('active')}
            >
              Disburse / Activate Loan
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout: Borrower & Financial Details */}
      <div className="detail-layout">
        {/* Borrower Information */}
        <div className="glass-card detail-card">
          <h3>Borrower Profile</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-val">{loan.userId?.name || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-val">{loan.userId?.email || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-val">{loan.userId?.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Address</span>
              <span className="info-val">{loan.userId?.address || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Employment Type</span>
              <span className="info-val">{loan.employmentType || loan.userId?.occupation || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Monthly / Annual Income</span>
              <span className="info-val">
                {loan.monthlyIncome
                  ? `₹${loan.monthlyIncome.toLocaleString('en-IN')}/mo`
                  : loan.userId?.annualIncome
                  ? `₹${loan.userId.annualIncome.toLocaleString('en-IN')}/yr`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Loan Financial Specs */}
        <div className="glass-card detail-card">
          <h3>Financial Terms</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Principal Amount</span>
              <span className="info-val" style={{ color: '#3b82f6', fontWeight: 700 }}>
                ₹{loan.amount?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Tenure</span>
              <span className="info-val">{loan.tenure} Months</span>
            </div>
            <div className="info-item">
              <span className="info-label">Interest Rate</span>
              <span className="info-val">{loan.interestRate}% p.a.</span>
            </div>
            <div className="info-item">
              <span className="info-label">Calculated EMI</span>
              <span className="info-val">
                {loan.emiAmount ? `₹${loan.emiAmount.toLocaleString('en-IN')}/mo` : 'Pending Approval'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Repayable</span>
              <span className="info-val">
                {loan.totalRepayable ? `₹${loan.totalRepayable.toLocaleString('en-IN')}` : '—'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Interest</span>
              <span className="info-val">
                {loan.totalInterest ? `₹${loan.totalInterest.toLocaleString('en-IN')}` : '—'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Amount Collected</span>
              <span className="info-val" style={{ color: '#10b981' }}>
                ₹{loan.amountPaid?.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Outstanding Balance</span>
              <span className="info-val" style={{ color: '#ef4444' }}>
                ₹{loan.outstandingBalance?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EMI Schedule Table */}
      {loan.emiSchedule && loan.emiSchedule.length > 0 && (
        <div className="glass-card table-section">
          <div className="table-header">
            <h3>Generated Amortization Schedule</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Installment #</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Status</th>
                  <th>Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {loan.emiSchedule.map((emi) => (
                  <tr key={emi.installmentNumber}>
                    <td><strong>#{emi.installmentNumber}</strong></td>
                    <td>{new Date(emi.dueDate).toLocaleDateString('en-IN')}</td>
                    <td>₹{emi.amount?.toLocaleString('en-IN')}</td>
                    <td>₹{emi.principal?.toLocaleString('en-IN')}</td>
                    <td>₹{emi.interest?.toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${emi.status}`}>{emi.status}</span></td>
                    <td>{emi.paidDate ? new Date(emi.paidDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDetail;
