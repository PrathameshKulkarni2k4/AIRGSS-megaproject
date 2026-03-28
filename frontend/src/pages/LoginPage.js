import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const demoLogin = async (email) => {
    setForm({ email, password: 'password123' });
    setLoading(true);
    const result = await login(email, 'password123');
    setLoading(false);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏛️</div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: 'white', marginBottom: '8px' }}>Welcome Back</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Sign in to your AIRGSS account</p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ margin: '20px 0', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px', position: 'relative' }}>
            <span style={{ background: 'white', padding: '0 12px', position: 'relative', zIndex: 1 }}>Demo Accounts</span>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--gray-200)' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            {[
              { label: '🏠 Citizen Login', email: 'citizen@test.com', color: 'var(--green)' },
              { label: '👮 Officer Login', email: 'officer@airgss.gov', color: 'var(--blue)' },
              { label: '⚙️ Admin Login', email: 'admin@airgss.gov', color: 'var(--saffron)' },
            ].map(d => (
              <button key={d.email} onClick={() => demoLogin(d.email)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'center', borderColor: d.color, color: d.color }}>
                {d.label}
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--gray-500)' }}>
            New citizen? <Link to="/register" style={{ color: 'var(--saffron)', fontWeight: '600' }}>Register here</Link>
          </p>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
