import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminFunds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ projectName:'', description:'', budget:'', category:'', location:'', status:'planned', startDate:'', endDate:'' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = () => adminAPI.getFunds().then(r=>{setFunds(r.data.data);setLoading(false);}).catch(()=>setLoading(false));
  useEffect(()=>{ load(); },[]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await adminAPI.createFund(form);
      setAlert({ type:'success', msg:'Fund project created!' });
      setShowForm(false);
      setForm({ projectName:'', description:'', budget:'', category:'', location:'', status:'planned', startDate:'', endDate:'' });
      load();
    } catch(e) { setAlert({ type:'error', msg:'Failed to create' }); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (id, updates) => {
    try { await adminAPI.updateFund(id, updates); load(); }
    catch(e) {}
  };

  const statusColor = { planned:'blue', ongoing:'orange', completed:'green', suspended:'red' };
  const totalBudget = funds.reduce((s,f)=>s+f.budget,0);
  const totalSpent = funds.reduce((s,f)=>s+f.spentAmount,0);
  const utilization = totalBudget > 0 ? Math.round((totalSpent/totalBudget)*100) : 0;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Fund Tracker</h1>
          <p className="page-subtitle">Monitor Panchayat project budgets</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="btn btn-primary">+ New Project</button>
      </div>

      {alert && <div className={`alert alert-${alert.type==='success'?'success':'error'}`} style={{ marginBottom:'16px' }}>{alert.msg}</div>}

      <div className="grid-3" style={{ marginBottom:'28px' }}>
        <div className="stat-card"><div className="stat-icon" style={{ background:'#EFF0FF' }}>💼</div><div><div className="stat-value">₹{(totalBudget/100000).toFixed(1)}L</div><div className="stat-label">Total Budget</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background:'#FFF0E6' }}>💸</div><div><div className="stat-value">₹{(totalSpent/100000).toFixed(1)}L</div><div className="stat-label">Total Spent</div></div></div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#F0FDF4' }}>📊</div>
          <div>
            <div className="stat-value">{utilization}%</div>
            <div className="stat-label">Fund Utilization</div>
            <div style={{ background:'var(--gray-200)', borderRadius:'999px', height:'4px', marginTop:'6px', width:'100px' }}>
              <div style={{ width:`${utilization}%`, background:utilization>90?'var(--saffron)':'var(--green)', height:'100%', borderRadius:'999px' }} />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:'24px' }}>
          <h3 style={{ marginBottom:'20px' }}>Create Fund Project</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Project Name *</label><input type="text" className="form-input" value={form.projectName} onChange={e=>setForm(p=>({...p,projectName:e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Budget (₹) *</label><input type="number" className="form-input" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))} required min="1" /></div>
              <div className="form-group"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}><option value="">Select</option>{['Infrastructure','Water Supply','Electricity','Health','Education','Sanitation','Other'].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Location</label><input type="text" className="form-input" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}><option value="planned">Planned</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option></select></div>
            </div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" style={{ minHeight:'80px' }} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button type="submit" disabled={saving} className="btn btn-primary">{saving?'Saving...':'Create Project'}</button>
              <button type="button" onClick={()=>setShowForm(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px, 1fr))', gap:'20px' }}>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : funds.map(f => {
          const pct = f.budget > 0 ? Math.round((f.spentAmount/f.budget)*100) : 0;
          return (
            <div key={f._id} className="card card-hover">
              <div className="flex-between" style={{ marginBottom:'12px' }}>
                <h3 style={{ fontSize:'15px', flex:1 }}>{f.projectName}</h3>
                <span className={`badge badge-${statusColor[f.status]||'gray'}`}>{f.status}</span>
              </div>
              {f.description && <p style={{ fontSize:'13px', color:'var(--gray-500)', marginBottom:'14px', lineHeight:'1.6' }}>{f.description}</p>}
              {f.category && <div style={{ fontSize:'12px', color:'var(--blue)', marginBottom:'12px' }}>🏷️ {f.category} {f.location && `| 📍 ${f.location}`}</div>}
              <div style={{ marginBottom:'14px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'6px' }}>
                  <span style={{ color:'var(--gray-500)' }}>Utilization ({pct}%)</span>
                  <span style={{ fontWeight:'600' }}>₹{f.spentAmount?.toLocaleString('en-IN')} / ₹{f.budget?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ background:'var(--gray-200)', borderRadius:'999px', height:'8px' }}>
                  <div style={{ width:`${Math.min(pct,100)}%`, background:pct>90?'#EF4444':pct>70?'var(--saffron)':'var(--green)', height:'100%', borderRadius:'999px', transition:'width 0.5s' }} />
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {f.status !== 'completed' && (
                  <>
                    <button onClick={()=>handleUpdate(f._id, { status:'completed' })} className="btn btn-ghost btn-sm">Mark Complete</button>
                    <button onClick={()=>{ const s = prompt('Add spent amount (₹):'); if(s) handleUpdate(f._id,{spentAmount: f.spentAmount+(parseInt(s)||0)}); }} className="btn btn-ghost btn-sm">Update Spent</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
