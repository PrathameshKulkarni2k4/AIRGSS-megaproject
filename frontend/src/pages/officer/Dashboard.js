import React, { useState, useEffect } from 'react';
import { complaintsAPI, documentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total:0, pending:0, inProgress:0, resolved:0, pendingDocs:0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, d] = await Promise.allSettled([complaintsAPI.getAll({ limit: 5 }), documentsAPI.getAll({ status: 'requested' })]);
        const complaints = c.value?.data?.data || [];
        const allC = c.value?.data?.total || 0;
        setRecent(complaints);
        setStats({
          total: allC,
          pending: complaints.filter(x => x.status === 'received').length,
          inProgress: complaints.filter(x => x.status === 'in_progress').length,
          resolved: complaints.filter(x => x.status === 'resolved').length,
          pendingDocs: d.value?.data?.data?.length || 0,
        });
      } catch(e) {} finally { setLoading(false); }
    };
    load();
  }, []);

  const statusColor = { received:'blue', in_review:'yellow', in_progress:'orange', resolved:'green', rejected:'red' };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1a1a5e, #2d2d8e)', borderRadius: 'var(--radius-lg)', padding: '32px', color: 'white', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', marginBottom: '6px' }}>Officer Portal</h1>
        <p style={{ opacity: 0.7, fontSize: '14px' }}>Welcome, {user?.name} | {user?.department || 'General Administration'}</p>
      </div>

      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {[
          { label: 'Total Assigned', value: stats.total, icon: '📋', bg: '#EFF0FF' },
          { label: 'Pending Review', value: stats.pending, icon: '🔴', bg: '#FFF0E6' },
          { label: 'In Progress', value: stats.inProgress, icon: '🟡', bg: '#FFFBEB' },
          { label: 'Resolved', value: stats.resolved, icon: '✅', bg: '#F0FDF4' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {stats.pendingDocs > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
          📄 <strong>{stats.pendingDocs} document requests</strong> are pending your review.
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Recent Complaints</h3>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
          <table className="table">
            <thead><tr><th>Ticket</th><th>Citizen</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recent.map(c => (
                <tr key={c._id}>
                  <td style={{ fontFamily:'monospace', fontWeight:'600', color:'var(--blue)', fontSize:'12px' }}>{c.ticketId}</td>
                  <td>{c.citizenId?.name || 'N/A'}</td>
                  <td><span className="badge badge-blue" style={{ textTransform:'capitalize' }}>{c.category}</span></td>
                  <td><span className={`badge badge-${c.priority==='critical'||c.priority==='high'?'red':c.priority==='medium'?'yellow':'gray'}`}>{c.priority}</span></td>
                  <td><span className={`badge badge-${statusColor[c.status]||'gray'}`}>{c.status?.replace(/_/g,' ')}</span></td>
                  <td style={{ color:'var(--gray-500)', fontSize:'13px' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
