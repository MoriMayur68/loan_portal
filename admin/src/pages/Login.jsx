import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api';
import { useAdminAuth } from '../context/AdminAuthContext';
import toast from 'react-hot-toast';
import './AdminAuth.css';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(form);
      if (res.data.role !== 'admin') {
        toast.error('Access denied. Administrator privileges required.');
        return;
      }
      login(res.data, res.data.token);
      toast.success(`Welcome Admin, ${res.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card glass-card fade-in-up">
        <div className="admin-auth-header">
          <div className="admin-badge-icon">🛡️</div>
          <h2>Loan Shark Admin</h2>
          <p>Sign in to administrative control portal</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="form-group">
            <label className="form-label">Admin Username / Email</label>
            <input
              id="admin-login-email"
              type="text"
              className="form-input"
              placeholder=""
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="admin-login-password"
              type="password"
              className="form-input"
              placeholder=""
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            id="admin-login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? <><span className="btn-spinner" /> Verifying...</> : '🔐 Access Portal'}
          </button>
        </form>

        <div className="admin-auth-hint">
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
