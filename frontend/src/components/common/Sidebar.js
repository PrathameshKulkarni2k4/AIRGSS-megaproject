import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const citizenNav = [
  { to: '/citizen/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/citizen/complaints', icon: '📋', label: 'My Complaints' },
  { to: '/citizen/payments', icon: '💳', label: 'Payments' },
  { to: '/citizen/schemes', icon: '📜', label: 'Gov Schemes' },
  { to: '/citizen/documents', icon: '📄', label: 'Documents' },
  { to: '/citizen/profile', icon: '👤', label: 'My Profile' },
];

const officerNav = [
  { to: '/officer/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/officer/complaints', icon: '📋', label: 'Complaints' },
  { to: '/officer/documents', icon: '📄', label: 'Documents' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/admin/citizens', icon: '👥', label: 'Citizens' },
  { to: '/admin/funds', icon: '💰', label: 'Fund Tracker' },
  { to: '/admin/schemes', icon: '📜', label: 'Schemes' },
];

export default function Sidebar({ open }) {
  const { user } = useAuth();
  const nav = user?.role === 'admin' ? adminNav : user?.role === 'officer' ? officerNav : citizenNav;

  return (
    <aside style={{ width: '260px', background: 'var(--navy)', minHeight: '100vh', position: 'fixed', left: 0, top: 0, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, var(--saffron), var(--gold))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🏛️</div>
          <div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '16px', fontFamily: 'DM Serif Display, serif' }}>AIRGSS</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Rural Governance AI</div>
          </div>
        </div>
      </div>

      {/* Tricolor accent */}
      <div style={{ height: '4px', background: 'linear-gradient(to right, var(--saffron) 33%, white 33%, white 66%, var(--green) 66%)' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: '0.1em', padding: '8px 8px 8px', textTransform: 'uppercase', marginBottom: '4px' }}>
          {user?.role === 'admin' ? 'Administration' : user?.role === 'officer' ? 'Officer Portal' : 'Citizen Services'}
        </div>
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 12px', borderRadius: '10px',
            marginBottom: '2px', textDecoration: 'none', fontSize: '14px', fontWeight: '500',
            color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
            background: isActive ? 'rgba(255,107,0,0.3)' : 'transparent',
            borderLeft: isActive ? '3px solid var(--saffron)' : '3px solid transparent',
            transition: 'all 0.15s',
          })}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom user card */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>
            {user?.name?.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
