import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header style={{ background: 'white', borderBottom: '1px solid var(--gray-200)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onToggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--gray-600)', padding: '4px' }}>☰</button>
        <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
          🌿 AI Powered Rural Governance Support System
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-800)' }}>{user?.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-500)', textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--saffron), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px' }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
      </div>
    </header>
  );
}
