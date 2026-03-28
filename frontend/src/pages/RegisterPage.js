import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate('/citizen/dashboard');
    else setError(result.message);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌱</div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: 'white', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Join AIRGSS — Your Digital Panchayat</p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="Ram Prasad" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" placeholder="9876543210" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}>
              {loading ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--gray-500)' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--saffron)', fontWeight: '600' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
