import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyLoan } from '../api';
import toast from 'react-hot-toast';
import './ApplyLoan.css';

const STEPS = ['Loan Details', 'Employment Info', 'Review & Submit'];
const PURPOSES = ['Personal', 'Home', 'Education', 'Vehicle', 'Business', 'Medical', 'Other'];
const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Business', 'Student', 'Other'];

const ApplyLoan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    amount: '', tenure: '', purpose: '', employmentType: '', monthlyIncome: '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const emiPreview = () => {
    if (!form.amount || !form.tenure) return null;
    const P = Number(form.amount), r = 12 / 100 / 12, n = Number(form.tenure);
    if (n <= 0 || P <= 0) return null;
    return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  };

  const emi = emiPreview();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await applyLoan({
        amount: Number(form.amount),
        tenure: Number(form.tenure),
        purpose: form.purpose,
        employmentType: form.employmentType,
        monthlyIncome: Number(form.monthlyIncome),
      });
      toast.success('Loan application submitted successfully!');
      navigate('/loans');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apply-page fade-in-up">
      <div className="apply-header">
        <h1>Apply for a Loan</h1>
        <p className="apply-subtitle">Quick, simple, and transparent</p>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={s} className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
            <div className="step-circle">{i < step ? '✓' : i + 1}</div>
            <span className="step-label">{s}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <div className="apply-body">
        {/* Step 1 */}
        {step === 0 && (
          <div className="glass-card apply-card fade-in-up">
            <h2 className="step-title">Loan Details</h2>

            <div className="form-group">
              <label className="form-label">Loan Amount (₹)</label>
              <input id="loan-amount" type="number" className="form-input" placeholder="e.g. 500000"
                value={form.amount} onChange={(e) => set('amount', e.target.value)} min={1000} />
            </div>

            <div className="amount-presets">
              {[50000, 100000, 300000, 500000, 1000000].map((a) => (
                <button key={a} className={`preset-btn ${Number(form.amount) === a ? 'active' : ''}`}
                  onClick={() => set('amount', a)}>
                  ₹{(a / 1000).toFixed(0)}K
                </button>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Tenure (months) — {form.tenure} months</label>
              <input id="loan-tenure" type="range" className="form-range" min={6} max={360} step={6}
                value={form.tenure || 12} onChange={(e) => set('tenure', e.target.value)} />
              <div className="range-labels"><span>6mo</span><span>30 years</span></div>
            </div>

            <div className="form-group">
              <label className="form-label">Loan Purpose</label>
              <div className="purpose-grid">
                {PURPOSES.map((p) => (
                  <button key={p} id={`purpose-${p}`}
                    className={`purpose-btn ${form.purpose === p ? 'active' : ''}`}
                    onClick={() => set('purpose', p)}>
                    {getPurposeIcon(p)} {p}
                  </button>
                ))}
              </div>
            </div>

            {emi && (
              <div className="emi-preview">
                <div className="emi-label">Estimated Monthly EMI</div>
                <div className="emi-value">₹{emi.toLocaleString('en-IN')}</div>
                <div className="emi-note">At 12% p.a. interest rate</div>
              </div>
            )}

            <button id="step1-next" className="btn btn-primary btn-lg"
              disabled={!form.amount || !form.tenure || !form.purpose}
              onClick={() => setStep(1)}>
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="glass-card apply-card fade-in-up">
            <h2 className="step-title">Employment Information</h2>

            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <div className="purpose-grid">
                {EMPLOYMENT_TYPES.map((t) => (
                  <button key={t} className={`purpose-btn ${form.employmentType === t ? 'active' : ''}`}
                    onClick={() => set('employmentType', t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Income (₹)</label>
              <input id="monthly-income" type="number" className="form-input" placeholder="e.g. 75000"
                value={form.monthlyIncome} onChange={(e) => set('monthlyIncome', e.target.value)} />
            </div>

            <div className="step-buttons">
              <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button id="step2-next" className="btn btn-primary"
                disabled={!form.employmentType || !form.monthlyIncome}
                onClick={() => setStep(2)}>
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 – Review */}
        {step === 2 && (
          <div className="glass-card apply-card fade-in-up">
            <h2 className="step-title">Review Your Application</h2>
            <div className="review-grid">
              <ReviewItem label="Loan Amount" value={`₹${Number(form.amount).toLocaleString('en-IN')}`} />
              <ReviewItem label="Tenure" value={`${form.tenure} months`} />
              <ReviewItem label="Purpose" value={form.purpose} />
              <ReviewItem label="Employment" value={form.employmentType} />
              <ReviewItem label="Monthly Income" value={`₹${Number(form.monthlyIncome).toLocaleString('en-IN')}`} />
              <ReviewItem label="Est. EMI" value={emi ? `₹${emi.toLocaleString('en-IN')}/mo` : '—'} />
              <ReviewItem label="Interest Rate" value="12% p.a." />
              <ReviewItem label="Total Repayable" value={emi ? `₹${(emi * form.tenure).toLocaleString('en-IN')}` : '—'} />
            </div>
            <p className="review-disclaimer">
              By submitting, you agree to our terms and conditions. Your application will be reviewed within 2-3 business days.
            </p>
            <div className="step-buttons">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button id="apply-submit" className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="btn-spinner" /> Submitting...</> : '🚀 Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewItem = ({ label, value }) => (
  <div className="review-item">
    <div className="review-label">{label}</div>
    <div className="review-value">{value}</div>
  </div>
);

const getPurposeIcon = (p) => {
  const icons = { Personal: '👤', Home: '🏠', Education: '🎓', Vehicle: '🚗', Business: '💼', Medical: '🏥', Other: '📦' };
  return icons[p] || '📦';
};

export default ApplyLoan;
