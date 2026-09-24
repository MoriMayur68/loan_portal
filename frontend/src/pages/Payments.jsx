import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMyLoans, getMyPayments, makePayment } from '../api';
import toast from 'react-hot-toast';
import './Payments.css';

const Payments = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const preselectedLoanId = params.get('loanId');

  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    loanId: preselectedLoanId || '',
    amount: '',
    paymentMethod: 'Online',
    transactionId: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyLoans(), getMyPayments()])
      .then(([l, p]) => {
        setLoans(l.data.filter((ln) => ln.status === 'active'));
        setPayments(p.data);
        if (preselectedLoanId) {
          const loan = l.data.find((ln) => ln._id === preselectedLoanId);
          if (loan) setForm((f) => ({ ...f, amount: loan.emiAmount || '' }));
        }
      })
      .finally(() => setDataLoading(false));
  }, [preselectedLoanId]);

  const selectedLoan = loans.find((l) => l._id === form.loanId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loanId) return toast.error('Please select a loan');
    setLoading(true);
    try {
      await makePayment({ ...form, amount: Number(form.amount) });
      toast.success('Payment recorded successfully!');
      const [l, p] = await Promise.all([getMyLoans(), getMyPayments()]);
      setLoans(l.data.filter((ln) => ln.status === 'active'));
      setPayments(p.data);
      setForm({ loanId: '', amount: '', paymentMethod: 'Online', transactionId: '', remarks: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="payments-page fade-in-up">
      <h1 className="payments-title">Payments</h1>

      <div className="payments-grid">
        {/* Payment Form */}
        <div className="glass-card payment-form-card">
          <h2 className="form-section-title">Make a Payment</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Select Loan</label>
              <select id="pay-loan" className="form-input" value={form.loanId}
                onChange={(e) => {
                  const loan = loans.find((l) => l._id === e.target.value);
                  setForm({ ...form, loanId: e.target.value, amount: loan?.emiAmount || '' });
                }}>
                <option value="">-- Choose Active Loan --</option>
                {loans.map((l) => (
                  <option key={l._id} value={l._id}>{l.loanNumber} – ₹{l.amount?.toLocaleString('en-IN')}</option>
                ))}
              </select>
            </div>

            {selectedLoan && (
              <div className="selected-loan-info">
                <div className="info-row"><span>Outstanding Balance</span><strong>₹{selectedLoan.outstandingBalance?.toLocaleString('en-IN')}</strong></div>
                <div className="info-row"><span>Monthly EMI</span><strong>₹{selectedLoan.emiAmount?.toLocaleString('en-IN')}</strong></div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input id="pay-amount" type="number" className="form-input" placeholder="Enter amount"
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select id="pay-method" className="form-input" value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                {['Online', 'UPI', 'Bank Transfer', 'Cash', 'Cheque'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Transaction ID (optional)</label>
              <input id="pay-txn" type="text" className="form-input" placeholder="TXN123456"
                value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Remarks (optional)</label>
              <input id="pay-remarks" type="text" className="form-input" placeholder="e.g. November EMI"
                value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
            </div>

            <button id="pay-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading || !form.loanId || !form.amount}>
              {loading ? <><span className="btn-spinner" /> Processing...</> : '💳 Pay Now'}
            </button>
          </form>
        </div>

        {/* Payment History */}
        <div className="glass-card payment-history-card">
          <h2 className="form-section-title">Payment History</h2>
          {payments.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">💳</div><p>No payments yet</p></div>
          ) : (
            <div className="history-list">
              {payments.map((p) => (
                <div key={p._id} className="history-item">
                  <div className="history-icon">✅</div>
                  <div className="history-info">
                    <div className="history-loan">{p.loanId?.loanNumber || 'Loan'}</div>
                    <div className="history-meta">{p.paymentMethod} · {new Date(p.paymentDate).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="history-amount">₹{p.amount?.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
