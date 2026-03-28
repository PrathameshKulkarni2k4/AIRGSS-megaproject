import React, { useState, useEffect } from 'react';
import { schemesAPI } from '../../services/api';

export default function AdminSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', ministry:'', benefits:'', eligibilityRules:{ maxIncome:'', minAge:'', maxAge:'', gender:'all', occupation:'' }, deadline:'' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const load = () => schemesAPI.getAll().then(r=>{setSchemes(r.data.data);setLoading(false);}).catch(()=>setLoading(false));
  useEffect(()=>{load();},[]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, benefits: form.benefits.split('\n').filter(Boolean), eligibilityRules: { ...form.eligibilityRules, maxIncome: form.eligibilityRules.maxIncome ? Number(form.eligibilityRules.maxIncome) : undefined, minAge: form.eligibilityRules.minAge ? Number(form.eligibilityRules.minAge) : undefined, maxAge: form.eligibilityRules.maxAge ? Number(form.eligibilityRules.maxAge) : undefined, occupation: form.eligibilityRules.occupation ? [form.eligibilityRules.occupation] : [] } };
      await schemesAPI.create(payload);
      setAlert({ type:'success', msg:'Scheme created!' });
      setShowForm(false);
      load();
    } catch(e) { setAlert({ type:'error', msg:'Failed to create' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheme?')) return;
    try { await schemesAPI.delete(id); load(); } catch(e) {}
  };

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Manage Schemes</h1>
          <p className="page-subtitle">{schemes.length} government schemes</p>
        </div>
        <button onClick={()=>setShowForm(true)} className="btn btn-primary">+ Add Scheme</button>
      </div>

      {alert && <div className={`alert alert-${alert.type==='success'?'success':'error'}`} style={{ marginBottom:'16px' }}>{alert.msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom:'24px' }}>
          <h3 style={{ marginBottom:'20px' }}>Add New Scheme</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Scheme Name *</label><input type="text" className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required /></div>
              <div className="form-group"><label className="form-label">Ministry</label><input type="text" className="form-input" value={form.ministry} onChange={e=>setForm(p=>({...p,ministry:e.target.value}))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" style={{ minHeight:'80px' }} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} /></div>
            <div className="form-group"><label className="form-label">Benefits (one per line)</label><textarea className="form-textarea" style={{ minHeight:'80px' }} placeholder="Rs 6000 per year&#10;Direct bank transfer" value={form.benefits} onChange={e=>setForm(p=>({...p,benefits:e.target.value}))} /></div>
            <h4 style={{ margin:'16px 0 12px', fontSize:'14px', color:'var(--gray-600)' }}>Eligibility Rules</h4>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Max Income (₹)</label><input type="number" className="form-input" value={form.eligibilityRules.maxIncome} onChange={e=>setForm(p=>({...p,eligibilityRules:{...p.eligibilityRules,maxIncome:e.target.value}}))} /></div>
              <div className="form-group"><label className="form-label">Min Age</label><input type="number" className="form-input" value={form.eligibilityRules.minAge} onChange={e=>setForm(p=>({...p,eligibilityRules:{...p.eligibilityRules,minAge:e.target.value}}))} /></div>
              <div className="form-group"><label className="form-label">Max Age</label><input type="number" className="form-input" value={form.eligibilityRules.maxAge} onChange={e=>setForm(p=>({...p,eligibilityRules:{...p.eligibilityRules,maxAge:e.target.value}}))} /></div>
              <div className="form-group"><label className="form-label">Gender</label><select className="form-select" value={form.eligibilityRules.gender} onChange={e=>setForm(p=>({...p,eligibilityRules:{...p.eligibilityRules,gender:e.target.value}}))}><option value="all">All</option><option value="male">Male</option><option value="female">Female</option></select></div>
              <div className="form-group"><label className="form-label">Occupation</label><select className="form-select" value={form.eligibilityRules.occupation} onChange={e=>setForm(p=>({...p,eligibilityRules:{...p.eligibilityRules,occupation:e.target.value}}))}><option value="">Any</option><option value="farmer">Farmer</option><option value="laborer">Laborer</option></select></div>
              <div className="form-group"><label className="form-label">Deadline</label><input type="date" className="form-input" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} /></div>
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              <button type="submit" disabled={saving} className="btn btn-primary">{saving?'Saving...':'Create Scheme'}</button>
              <button type="button" onClick={()=>setShowForm(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'20px' }}>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : schemes.map(s => (
          <div key={s._id} className="card">
            <div className="flex-between" style={{ marginBottom:'10px' }}>
              <h3 style={{ fontSize:'15px', flex:1 }}>{s.name}</h3>
              <button onClick={()=>handleDelete(s._id)} className="btn btn-danger btn-sm">Delete</button>
            </div>
            {s.ministry && <div style={{ fontSize:'12px', color:'var(--blue)', marginBottom:'8px' }}>🏛️ {s.ministry}</div>}
            <p style={{ fontSize:'13px', color:'var(--gray-500)', marginBottom:'10px' }}>{s.description}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
              {s.benefits?.slice(0,3).map((b,i)=><span key={i} style={{ background:'#F0FDF4', color:'var(--green)', borderRadius:'999px', padding:'2px 8px', fontSize:'11px' }}>{b}</span>)}
            </div>
            {s.eligibilityRules?.maxIncome && <div style={{ fontSize:'12px', color:'var(--gray-400)', marginTop:'8px' }}>Income limit: ₹{s.eligibilityRules.maxIncome.toLocaleString()}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
