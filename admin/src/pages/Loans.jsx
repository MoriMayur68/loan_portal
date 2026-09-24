import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllLoans, updateLoanStatus } from '../api';
import toast from 'react-hot-toast';
import './Loans.css';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Quick Action Modal State
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approved' | 'rejected'
  const [interestRate, setInterestRate] = useState(12);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLoans = () => {
    setLoading(true);
    getAllLoans({ status: statusFilter || undefined, page, limit: 10 })
      .then((res) => {
        setLoans(res.data.loans || []);
        setTotalPages(res.data.pages || 1);
      })
      .catch((err) => toast.error('Failed to load loans'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter, page]);

  const handleOpenAction = (loan, type) => {
    setSelectedLoan(loan);
    setActionType(type);
    setInterestRate(loan.interestRate || 12);
    setRejectionReason('');
    setAdminNotes('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    setActionLoading(true);
    try {
      await updateLoanStatus(selectedLoan._id, {
        status: actionType,
        interestRate: actionType === 'approved' ? Number(interestRate) : undefined,
        rejectionReason: actionType === 'rejected' ? rejectionReason : undefined,
        adminNotes,
      });

      toast.success(`Loan #${selectedLoan.loanNumber} marked as ${actionType}!`);
      setSelectedLoan(null);
      fetchLoans();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-loans-page fade-in-up">
      <div className="page-header">
        <div>
          <h1>Loan Applications</h1>
          <p className="page-subtitle">Review, approve, or reject loan applications</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-bar">
        {['', 'pending', 'approved', 'active', 'rejected', 'closed'].map((status) => (
          <button
            key={status}
            className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter(status);
              setPage(1);
            }}
          >
            {status === '' ? 'All Statuses' : status.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card table-section">
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : loans.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📋</div>
            <p>No loan applications found for the selected filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loan No</th>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Tenure</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id}>
                    <td><strong>{loan.loanNumber}</strong></td>
                    <td>
                      <div>{loan.userId?.name || 'N/A'}</div>
                      <small style={{ color: '#64748b' }}>{loan.employmentType || 'Unspecified'}</small>
                    </td>
                    <td>
                      <div>{loan.userId?.email}</div>
                      <small style={{ color: '#64748b' }}>{loan.userId?.phone || 'No phone'}</small>
                    </td>
                    <td style={{ color: '#f1f5f9', fontWeight: 700 }}>
                      ₹{loan.amount?.toLocaleString('en-IN')}
                    </td>
                    <td>{loan.purpose}</td>
                    <td>{loan.tenure} mo</td>
                    <td><span className={`badge badge-${loan.status}`}>{loan.status}</span></td>
                    <td>{new Date(loan.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/loans/${loan._id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                        {loan.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleOpenAction(loan, 'approved')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleOpenAction(loan, 'rejected')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {selectedLoan && (
        <div className="modal-backdrop">
          <div className="modal-content glass-card fade-in-up">
            <div className="modal-header">
              <h3>
                {actionType === 'approved' ? '✅ Approve Loan' : '❌ Reject Loan'} – {selectedLoan.loanNumber}
              </h3>
              <button className="modal-close" onClick={() => setSelectedLoan(null)}>✕</button>
            </div>

            <form onSubmit={handleStatusSubmit} className="modal-form">
              <div className="modal-info">
                <div><strong>Borrower:</strong> {selectedLoan.userId?.name}</div>
                <div><strong>Requested Amount:</strong> ₹{selectedLoan.amount?.toLocaleString('en-IN')}</div>
                <div><strong>Tenure:</strong> {selectedLoan.tenure} months</div>
              </div>

              {actionType === 'approved' ? (
                <div className="form-group">
                  <label className="form-label">Approved Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Rejection Reason</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="e.g. Insufficient credit history or income eligibility"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Internal Admin Notes (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Verification checked by underwriter"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setSelectedLoan(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${actionType === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : `Confirm ${actionType === 'approved' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
