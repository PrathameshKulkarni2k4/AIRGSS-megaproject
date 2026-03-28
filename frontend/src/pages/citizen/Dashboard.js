import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintsAPI, paymentsAPI, documentsAPI, schemesAPI } from '../../services/api';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ complaints: 0, payments: 0, documents: 0, schemes: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, p, d, s] = await Promise.allSettled([
          complaintsAPI.getMy(), paymentsAPI.getMy(), documentsAPI.getMy(), schemesAPI.getAll()
        ]);
        const complaints = c.value?.data?.data || [];
        setRecentComplaints(complaints.slice(0, 4));
        setStats({
          complaints: complaints.length,
          payments: p.value?.data?.data?.length || 0,
          documents: d.value?.data?.data?.length || 0,
          schemes: s.value?.data?.data?.length || 0,
        });
      } catch(e) {} finally { setLoading(false); }
    };
    load();
  }, []);

  const statusColor = { received: 'blue', in_review: 'yellow', in_progress: 'orange', resolved: 'green', rejected: 'red' };
  const quickLinks = [
    { icon: '📋', label: 'File Complaint', path: '/citizen/complaints', color: '#FFF0E6', border: 'var(--saffron)' },
    { icon: '💳', label: 'Pay Bills', path: '/citizen/payments', color: '#EFF9EF', border: 'var(--green)' },
    { icon: '📜', label: 'View Schemes', path: '/citizen/schemes', color: '#EFF0FF', border: 'var(--blue)' },
    { icon: '📄', label: 'Get Certificate', path: '/citizen/documents', color: '#FFFBEB', border: '#D97706' },
  ];

  return (
    <div>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, var(--navy), var(--blue-light))', borderRadius: 'var(--radius-lg)', padding: '32px', color: 'white', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', marginBottom: '8px' }}>
          Namaste, {user?.name} 🙏
        </h1>
        <p style={{ opacity: 0.75, fontSize: '14px' }}>Welcome to your digital Panchayat portal</p>
        {!user?.profileComplete && (
          <div style={{ background: 'rgba(255,107,0,0.2)', border: '1px solid rgba(255,107,0,0.4)', borderRadius: '10px', padding: '12px 16px', marginTop: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚠️ Complete your profile to unlock scheme recommendations.
            <button onClick={() => navigate('/citizen/profile')} style={{ background: 'var(--saffron)', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Complete Now</button>
          </div>
        )}
      </div>

      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Complaints Filed', value: stats.complaints, icon: '📋', color: '#FFF0E6' },
          { label: 'Payments Made', value: stats.payments, icon: '💳', color: '#EFF9EF' },
          { label: 'Documents', value: stats.documents, icon: '📄', color: '#EFF0FF' },
          { label: 'Available Schemes', value: stats.schemes, icon: '📜', color: '#FFFBEB' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--gray-800)' }}>Quick Actions</h2>
        <div className="grid-4">
          {quickLinks.map(q => (
            <button key={q.label} onClick={() => navigate(q.path)} style={{ background: q.color, border: `2px solid ${q.border}22`, borderRadius: 'var(--radius)', padding: '24px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'Space Grotesk, sans-serif' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>{q.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-700)' }}>{q.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '18px' }}>Recent Complaints</h2>
          <button onClick={() => navigate('/citizen/complaints')} className="btn btn-ghost btn-sm">View All</button>
        </div>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> :
         recentComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p>No complaints filed yet</p>
            <button onClick={() => navigate('/citizen/complaints')} className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>File First Complaint</button>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Ticket ID</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recentComplaints.map(c => (
                <tr key={c._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--blue)' }}>{c.ticketId}</td>
                  <td style={{ textTransform: 'capitalize' }}>{c.category}</td>
                  <td><span className={`badge badge-${c.priority === 'high' || c.priority === 'critical' ? 'red' : c.priority === 'medium' ? 'yellow' : 'gray'}`}>{c.priority}</span></td>
                  <td><span className={`badge badge-${statusColor[c.status] || 'gray'}`}>{c.status?.replace('_', ' ')}</span></td>
                  <td style={{ color: 'var(--gray-500)' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
