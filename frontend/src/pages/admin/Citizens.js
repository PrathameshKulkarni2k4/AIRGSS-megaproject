import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminCitizens() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [roleUpdate, setRoleUpdate] = useState({ role:'', department:'' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.getCitizens().then(r=>{ setCitizens(r.data.data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const handleRoleUpdate = async () => {
    setSaving(true);
    try {
      await adminAPI.updateCitizenRole(selected._id, roleUpdate);
      setAlert({ type:'success', msg:'Role updated successfully' });
      setSelected(null);
      adminAPI.getCitizens().then(r=>setCitizens(r.data.data));
    } catch(e) { setAlert({ type:'error', msg:'Update failed' }); }
    finally { setSaving(false); }
  };

  const filtered = citizens.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const roleColor = { citizen:'blue', officer:'orange', admin:'red' };

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Manage Citizens</h1>
          <p className="page-subtitle">{citizens.length} total registered users</p>
        </div>
      </div>

      {alert && <div className={`alert alert-${alert.type==='success'?'success':'error'}`} style={{ marginBottom:'16px' }}>{alert.msg}</div>}

      <div className="card" style={{ marginBottom:'20px' }}>
        <input type="text" className="form-input" placeholder="🔍  Search by name, email, or phone..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:'400px' }} />
      </div>

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Profile</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(c=>(
                <tr key={c._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg, var(--saffron), var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'700', fontSize:'13px' }}>{c.name?.charAt(0)}</div>
                      <span style={{ fontWeight:'500' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize:'13px' }}>{c.email}</td>
                  <td style={{ fontSize:'13px' }}>{c.phone}</td>
                  <td><span className={`badge badge-${roleColor[c.role]||'gray'}`}>{c.role}</span></td>
                  <td><span className={`badge badge-${c.profileComplete?'green':'yellow'}`}>{c.profileComplete?'Complete':'Incomplete'}</span></td>
                  <td style={{ color:'var(--gray-500)', fontSize:'13px' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <button onClick={()=>{ setSelected(c); setRoleUpdate({ role:c.role, department:c.department||'' }); }} className="btn btn-ghost btn-sm">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Manage User: {selected.name}</h3>
              <button onClick={()=>setSelected(null)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'20px' }}>✕</button>
            </div>
            <div style={{ background:'var(--gray-50)', borderRadius:'10px', padding:'14px', marginBottom:'20px', fontSize:'13px' }}>
              <div>Email: {selected.email}</div>
              <div>Phone: {selected.phone}</div>
              <div>Current Role: <strong style={{ textTransform:'capitalize' }}>{selected.role}</strong></div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign Role</label>
              <select className="form-select" value={roleUpdate.role} onChange={e=>setRoleUpdate(p=>({...p,role:e.target.value}))}>
                <option value="citizen">Citizen</option>
                <option value="officer">Panchayat Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {roleUpdate.role === 'officer' && (
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={roleUpdate.department} onChange={e=>setRoleUpdate(p=>({...p,department:e.target.value}))}>
                  <option value="">Select Department</option>
                  {['Public Works Department','Water Supply Department','Electricity Department','Sanitation Department','Health Department','Education Department','Vigilance Department','General Administration'].map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={handleRoleUpdate} disabled={saving} className="btn btn-primary">{saving?'Saving...':'Update Role'}</button>
              <button onClick={()=>setSelected(null)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
