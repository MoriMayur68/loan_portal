import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import './Auth.css';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data, res.data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-in-up" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <Logo size={48} radius={12} />
          <h1 className="auth-brand">Loan Shark</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join thousands of users managing their loans smarter</p>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input id="reg-name" type="text" className="form-input" placeholder="John Doe"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input id="reg-phone" type="tel" className="form-input" placeholder="+91 9876543210"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Address (optional)</label>
            <input id="reg-address" type="text" className="form-input" placeholder="Your address"
              value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? <><span className="btn-spinner" /> Creating...</> : 'Create Account'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
