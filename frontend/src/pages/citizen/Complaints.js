import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../../services/api';

const CATEGORIES = ['roads', 'water', 'electricity', 'sanitation', 'health', 'education', 'corruption', 'other'];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try { const { data } = await complaintsAPI.getMy(); setComplaints(data.data); }
    catch(e) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) { setError('Complaint description is required'); return; }
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('description', form.description);
      fd.append('location', form.location);
      const { data } = await complaintsAPI.create(fd);
      setResult(data);
      setShowForm(false);
      setForm({ description: '', location: '' });
      load();
    } catch(e) { setError(e.response?.data?.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const statusColor = { received: 'blue', in_review: 'yellow', in_progress: 'orange', resolved: 'green', rejected: 'red' };
  const priorityColor = { low: 'gray', medium: 'yellow', high: 'orange', critical: 'red' };

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">Track and manage your grievances</p>
        </div>
        <button onClick={() => { setShowForm(true); setResult(null); }} className="btn btn-primary">+ File Complaint</button>
      </div>

      {result && (
        <div className="alert alert-success">
          ✅ Complaint filed! Ticket: <strong>{result.data?.ticketId}</strong> | Category: {result.classification?.category} | Priority: {result.classification?.priority}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>File New Complaint</h3>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Describe your complaint *</label>
              <textarea className="form-textarea" placeholder="Describe the issue in detail... Our AI will auto-classify it." value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} required style={{ minHeight: '120px' }} />
              <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>🤖 AI will automatically detect category and priority</div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input type="text" className="form-input" placeholder="Village, Ward, Area..." value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Submitting...' : 'Submit Complaint'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> :
         complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ marginBottom: '8px', color: 'var(--gray-600)' }}>No Complaints Yet</h3>
            <p style={{ marginBottom: '20px' }}>File your first complaint and track its resolution</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">File Complaint</button>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Ticket ID</th><th>Description</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--blue)', fontSize: '12px' }}>{c.ticketId}</td>
                  <td style={{ maxWidth: '200px' }} className="truncate">{c.description}</td>
                  <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{c.category}</span></td>
                  <td><span className={`badge badge-${priorityColor[c.priority]}`}>{c.priority}</span></td>
                  <td><span className={`badge badge-${statusColor[c.status] || 'gray'}`}>{c.status?.replace(/_/g, ' ')}</span></td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '13px' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><button onClick={() => setSelected(c)} className="btn btn-ghost btn-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Complaint Details</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--gray-400)' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="flex-between"><span className="text-gray text-sm">Ticket ID</span><span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--blue)' }}>{selected.ticketId}</span></div>
              <div className="flex-between"><span className="text-gray text-sm">Category</span><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{selected.category}</span></div>
              <div className="flex-between"><span className="text-gray text-sm">Priority</span><span className={`badge badge-${priorityColor[selected.priority]}`}>{selected.priority}</span></div>
              <div className="flex-between"><span className="text-gray text-sm">Status</span><span className={`badge badge-${statusColor[selected.status]}`}>{selected.status?.replace(/_/g,' ')}</span></div>
              <div className="flex-between"><span className="text-gray text-sm">Department</span><span style={{ fontSize: '13px' }}>{selected.assignedDepartment || 'Pending'}</span></div>
              <div><span className="text-gray text-sm">Description</span><p style={{ marginTop: '6px', fontSize: '14px', lineHeight: '1.7', color: 'var(--gray-700)', background: 'var(--gray-50)', padding: '12px', borderRadius: '8px' }}>{selected.description}</p></div>
              {selected.comments?.length > 0 && (
                <div>
                  <span className="text-gray text-sm">Officer Comments</span>
                  {selected.comments.map((cm, i) => <div key={i} style={{ background: '#EFF9EF', borderRadius: '8px', padding: '10px', marginTop: '8px', fontSize: '13px' }}>{cm.text}</div>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
