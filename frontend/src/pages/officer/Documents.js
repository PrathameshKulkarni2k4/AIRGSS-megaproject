import React, { useState, useEffect } from 'react';
import { documentsAPI } from '../../services/api';

const DOC_LABELS = { income_certificate:'Income Certificate', residence_certificate:'Residence Certificate', birth_certificate:'Birth Certificate', caste_certificate:'Caste Certificate', other:'Other' };

export default function OfficerDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [review, setReview] = useState({ status:'', rejectionReason:'' });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState('requested');

  const load = async () => {
    setLoading(true);
    try { const { data } = await documentsAPI.getAll({ status: statusFilter }); setDocuments(data.data); }
    catch(e) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [statusFilter]);

  const handleReview = async () => {
    if (!review.status) return;
    setSaving(true);
    try {
      await documentsAPI.review(selected._id, review);
      setAlert({ type:'success', msg:`Document ${review.status} successfully!` });
      setSelected(null);
      load();
    } catch(e) { setAlert({ type:'error', msg:'Review failed' }); }
    finally { setSaving(false); }
  };

  const statusColor = { requested:'blue', under_review:'yellow', approved:'green', rejected:'red', issued:'purple' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Document Requests</h1>
        <p className="page-subtitle">Review and approve citizen certificate requests</p>
      </div>

      {alert && <div className={`alert alert-${alert.type==='success'?'success':'error'}`} style={{ marginBottom:'16px' }}>{alert.msg}</div>}

      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {['requested','under_review','approved','rejected','issued',''].map(s => (
          <button key={s} onClick={()=>setStatusFilter(s)} className={`btn btn-sm ${statusFilter===s?'btn-primary':'btn-ghost'}`}>{s||'All'}</button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
          documents.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px', color:'var(--gray-400)' }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>📄</div>
              <p>No document requests</p>
            </div>
          ) : (
            <table className="table">
              <thead><tr><th>Doc ID</th><th>Citizen</th><th>Type</th><th>Status</th><th>Verification Code</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d._id}>
                    <td style={{ fontFamily:'monospace', fontSize:'12px' }}>{d.documentId}</td>
                    <td>
                      <div style={{ fontWeight:'500' }}>{d.citizenId?.name}</div>
                      <div style={{ fontSize:'12px', color:'var(--gray-400)' }}>{d.citizenId?.email}</div>
                    </td>
                    <td>{DOC_LABELS[d.documentType]||d.documentType}</td>
                    <td><span className={`badge badge-${statusColor[d.status]||'gray'}`}>{d.status?.replace(/_/g,' ')}</span></td>
                    <td style={{ fontFamily:'monospace', fontSize:'12px', color:'var(--green)' }}>{d.verificationCode}</td>
                    <td style={{ fontSize:'13px', color:'var(--gray-500)' }}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button onClick={()=>{ setSelected(d); setReview({ status:'approved', rejectionReason:'' }); }} className="btn btn-primary btn-sm">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Review Document Request</h3>
              <button onClick={()=>setSelected(null)} style={{ background:'none',border:'none',cursor:'pointer',fontSize:'20px' }}>✕</button>
            </div>
            <div style={{ background:'var(--gray-50)', borderRadius:'10px', padding:'14px', marginBottom:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'13px', color:'var(--gray-500)' }}>Citizen</span>
                <strong>{selected.citizenId?.name}</strong>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                <span style={{ fontSize:'13px', color:'var(--gray-500)' }}>Type</span>
                <span>{DOC_LABELS[selected.documentType]}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:'13px', color:'var(--gray-500)' }}>Verification Code</span>
                <span style={{ fontFamily:'monospace', color:'var(--green)', fontWeight:'600' }}>{selected.verificationCode}</span>
              </div>
              {selected.extractedText && <div style={{ marginTop:'10px', fontSize:'12px', color:'var(--gray-500)', borderTop:'1px solid var(--gray-200)', paddingTop:'10px' }}><strong>OCR Text:</strong> {selected.extractedText?.slice(0,200)}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Decision</label>
              <select className="form-select" value={review.status} onChange={e=>setReview(p=>({...p,status:e.target.value}))}>
                <option value="approved">✅ Approve</option>
                <option value="issued">📜 Issue Certificate</option>
                <option value="rejected">❌ Reject</option>
                <option value="under_review">🔍 Mark Under Review</option>
              </select>
            </div>
            {review.status === 'rejected' && (
              <div className="form-group">
                <label className="form-label">Rejection Reason *</label>
                <textarea className="form-textarea" style={{ minHeight:'80px' }} placeholder="Reason for rejection..." value={review.rejectionReason} onChange={e=>setReview(p=>({...p,rejectionReason:e.target.value}))} required />
              </div>
            )}
            <div style={{ display:'flex', gap:'12px' }}>
              <button onClick={handleReview} disabled={saving} className="btn btn-primary">{saving?'Saving...':'Submit Decision'}</button>
              <button onClick={()=>setSelected(null)} className="btn btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
