import React, { useState, useEffect } from 'react';
import { complaintsAPI } from '../../services/api';

export default function OfficerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', comment: '' });
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await complaintsAPI.getAll(filters);
      setComplaints(data.data);
    } catch(e) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [filters]);

  const handleUpdate = async () => {
    if (!statusUpdate.status) return;
    setUpdating(true);
    try {
      await complaintsAPI.updateStatus(selected._id, statusUpdate);
      setAlert({ type: 'success', msg: 'Status updated successfully!' });
      setSelected(null);
      load();
    } catch(e) { setAlert({ type: 'error', msg: 'Update failed' }); }
    finally { setUpdating(false); }
  };

  const statusColor = { received:'blue', in_review:'yellow', in_progress:'orange', resolved:'green', rejected:'red' };
  const priorityColor = { low:'gray', medium:'yellow', high:'orange', critical:'red' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Complaints</h1>
        <p className="page-subtitle">Review and update complaint status</p>
      </div>

      {alert && <div className={`alert alert-${alert.type==='success'?'success':'error'}`} style={{ marginBottom:'16px' }}>{alert.msg}<button onClick={()=>setAlert(null)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}}>✕</button></div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom:'20px' }}>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'flex-end' }}>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" style={{ minWidth:'140px' }} value={filters.status} onChange={e=>setFilters(p=>({...p,status:e.target.value}))}>
              <option value="">All Status</option>
              {['received','in_review','in_progress','resolved','rejected'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-select" style={{ minWidth:'140px' }} value={filters.category} onChange={e=>setFilters(p=>({...p,category:e.target.value}))}>
              <option value="">All Categories</option>
              {['roads','water','electricity','sanitation','health','education','corruption','other'].map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Priority</label>
            <select className="form-select" style={{ minWidth:'130px' }} value={filters.priority} onChange={e=>setFilters(p=>({...p,priority:e.target.value}))}>
              <option value="">All Priority</option>
              {['low','medium','high','critical'].map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={()=>setFilters({status:'',category:'',priority:''})} className="btn btn-ghost">Clear</button>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
          complaints.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px', color:'var(--gray-400)' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>✅</div>
              <p>No complaints matching filters</p>
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Ticket</th><th>Citizen</th><th>Category</th><th>Priority</th><th>Description</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontFamily:'monospace', fontWeight:'600', color:'var(--blue)', fontSize:'12px' }}>{c.ticketId}</td>
                    <td>
                      <div style={{ fontSize:'14px', fontWeight:'500' }}>{c.citizenId?.name}</div>
                      <div style={{ fontSize:'12px', color:'var(--gray-400)' }}>{c.citizenId?.phone}</div>
                    </td>
                    <td><span className="badge badge-blue" style={{ textTransform:'capitalize' }}>{c.category}</span></td>
                    <td><span className={`badge badge-${priorityColor[c.priority]}`}>{c.priority}</span></td>
                    <td style={{ maxWidth:'200px' }} className="truncate text-sm">{c.description}</td>
                    <td><span className={`badge badge-${statusColor[c.status]||'gray'}`}>{c.status?.replace(/_/g,' ')}</span></td>
                    <td style={{ color:'var(--gray-500)', fontSize:'13px' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button onClick={() => { setSelected(c); setStatusUpdate({ status: c.status, comment: '' }); }} className="btn btn-primary btn-sm">Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth:'500px' }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update Complaint</h3>
              <button onClick={()=>setSelected(null)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'20px',color:'var(--gray-400)' }}>✕</button>
            </div>
            <div style={{ marginBottom:'16px', background:'var(--gray-50)', borderRadius:'10px', padding:'14px' }}>
              <div style={{ fontFamily:'monospace', fontWeight:'700', color:'var(--blue)', marginBottom:'6px' }}>{selected.ticketId}</div>
              <p style={{ fontSize:'14px', color:'var(--gray-600)', lineHeight:'1.6' }}>{selected.description}</p>
              <div style={{ marginTop:'8px', display:'flex', gap:'8px' }}>
                <span className={`badge badge-${statusColor[selected.status]||'gray'}`}>{selected.status?.replace(/_/g,' ')}</span>
                <span className={`badge badge-${priorityColor[selected.priority]}`}>{selected.priority}</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-select" value={statusUpdate.status} onChange={e=>setStatusUpdate(p=>({...p,status:e.target.value}))}>
                {['received','in_review','in_progress','resolved','rejected'].map(s=><option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea className="form-textarea" style={{ minHeight:'80px' }} placeholder="Add update note for citizen..." value={statusUpdate.comment} onChange={e=>setStatusUpdate(p=>({...p,comment:e.target.value}))} />
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={handleUpdate} disabled={updating} className="btn btn-primary">{updating?'Updating...':'Update Status'}</button>
              <button onClick={()=>setSelected(null)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
