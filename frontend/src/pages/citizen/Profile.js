import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name:'', phone:'', address:'', village:'', district:'', state:'', age:'', gender:'', income:'', occupation:'', familySize:'' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const load = async () => {
      try { const { data } = await authAPI.getMe(); const u = data.data; setForm({ name:u.name||'', phone:u.phone||'', address:u.address||'', village:u.village||'', district:u.district||'', state:u.state||'', age:u.age||'', gender:u.gender||'', income:u.income||'', occupation:u.occupation||'', familySize:u.familySize||'' }); }
      catch(e) {}
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.data);
      setAlert({ type: 'success', msg: '✅ Profile updated! Scheme recommendations will now be personalized.' });
    } catch(e) { setAlert({ type: 'error', msg: 'Failed to save' }); }
    finally { setSaving(false); }
  };

  const complete = ['age', 'gender', 'income', 'occupation', 'address'].filter(f => !!form[f]).length;
  const pct = Math.round((complete / 5) * 100);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your details updated for accurate scheme recommendations</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--saffron), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: 'white', fontWeight: '700', margin: '0 auto 16px' }}>{form.name?.charAt(0)}</div>
          <h3 style={{ marginBottom: '4px' }}>{form.name}</h3>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>{user?.email}</p>
          <div style={{ background: 'var(--gray-100)', borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '8px' }}>Profile Completeness</div>
            <div style={{ background: 'var(--gray-200)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, background: pct === 100 ? 'var(--green)' : 'var(--saffron)', height: '100%', borderRadius: '999px', transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: pct===100?'var(--green)':'var(--saffron)', marginTop: '6px' }}>{pct}%</div>
          </div>
          {pct < 100 && <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '12px', lineHeight: '1.5' }}>Complete your profile to get personalized government scheme recommendations</div>}
        </div>

        <div className="card">
          {alert && <div className={`alert alert-${alert.type==='success'?'success':'error'}`} style={{ marginBottom: '20px' }}>{alert.msg}</div>}
          <form onSubmit={handleSave}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--gray-700)' }}>Personal Information</h3>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input type="tel" className="form-input" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Age *</label><input type="number" className="form-input" value={form.age} onChange={e=>setForm(p=>({...p,age:e.target.value}))} min="1" max="120" /></div>
              <div className="form-group"><label className="form-label">Gender *</label><select className="form-select" value={form.gender} onChange={e=>setForm(p=>({...p,gender:e.target.value}))}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
            </div>
            <h3 style={{ margin: '20px 0 16px', fontSize: '16px', color: 'var(--gray-700)' }}>Address Details</h3>
            <div className="form-group"><label className="form-label">Full Address *</label><input type="text" className="form-input" placeholder="House No, Street, Ward..." value={form.address} onChange={e=>setForm(p=>({...p,address:e.target.value}))} /></div>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Village</label><input type="text" className="form-input" value={form.village} onChange={e=>setForm(p=>({...p,village:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">District</label><input type="text" className="form-input" value={form.district} onChange={e=>setForm(p=>({...p,district:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">State</label><input type="text" className="form-input" value={form.state} onChange={e=>setForm(p=>({...p,state:e.target.value}))} /></div>
            </div>
            <h3 style={{ margin: '20px 0 16px', fontSize: '16px', color: 'var(--gray-700)' }}>Economic Profile</h3>
            <div className="grid-3">
              <div className="form-group"><label className="form-label">Annual Income (₹) *</label><input type="number" className="form-input" placeholder="180000" value={form.income} onChange={e=>setForm(p=>({...p,income:e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Occupation *</label><select className="form-select" value={form.occupation} onChange={e=>setForm(p=>({...p,occupation:e.target.value}))}><option value="">Select</option><option value="farmer">Farmer</option><option value="laborer">Laborer</option><option value="business">Business</option><option value="government">Government Employee</option><option value="teacher">Teacher</option><option value="other">Other</option></select></div>
              <div className="form-group"><label className="form-label">Family Size</label><input type="number" className="form-input" value={form.familySize} onChange={e=>setForm(p=>({...p,familySize:e.target.value}))} min="1" /></div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary btn-lg">{saving ? 'Saving...' : 'Save Profile'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
