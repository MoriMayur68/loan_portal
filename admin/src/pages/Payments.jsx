import { useEffect, useState } from 'react';
import { getAllPayments } from '../api';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    getAllPayments({ page, limit: 10 })
      .then((res) => {
        setPayments(res.data.payments || []);
        setTotalPages(res.data.pages || 1);
      })
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="admin-loans-page fade-in-up">
      <div className="page-header">
        <div>
          <h1>Transaction Ledger</h1>
          <p className="page-subtitle">Real-time record of all loan repayments and collections</p>
        </div>
      </div>

      <div className="glass-card table-section">
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💳</div>
            <p>No payment transactions recorded yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Borrower</th>
                  <th>Loan ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.paymentDate || p.createdAt).toLocaleString('en-IN')}</td>
                    <td>
                      <div><strong>{p.userId?.name || 'N/A'}</strong></div>
                      <small style={{ color: '#64748b' }}>{p.userId?.email}</small>
                    </td>
                    <td>
                      <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                        {p.loanId?.loanNumber || 'N/A'}
                      </span>
                    </td>
                    <td style={{ color: '#10b981', fontWeight: 700 }}>
                      +₹{p.amount?.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="badge badge-active">{p.paymentMethod}</span>
                    </td>
                    <td>
                      <code>{p.transactionId || 'AUTO_GEN'}</code>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'success' ? 'badge-approved' : 'badge-rejected'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Payments;
