import React, { useState, useEffect } from 'react';
import { documentsAPI } from '../../services/api';

const DOC_TYPES = [
  { value: 'income_certificate', label: 'Income Certificate' },
  { value: 'residence_certificate', label: 'Residence Certificate' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'caste_certificate', label: 'Caste Certificate' },
  { value: 'other', label: 'Other' },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('request');
  const [reqForm, setReqForm] = useState({ documentType: 'income_certificate', additionalInfo: {} });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('other');
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const load = async () => {
    try { const { data } = await documentsAPI.getMy(); setDocuments(data.data); }
    catch(e) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const requestCert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await documentsAPI.request(reqForm);
      setAlert({ type: 'success', msg: 'Certificate request submitted! Admin will review shortly.' });
      load();
    } catch(e) { setAlert({ type: 'error', msg: e.response?.data?.message || 'Request failed' }); }
    finally { setSubmitting(false); }
  };

  const uploadDoc = async (e) => {
    e.preventDefault();
    if (!uploadFile) { setAlert({ type: 'error', msg: 'Please select a file' }); return; }
    setSubmitting(true);
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('documentType', uploadType);
    try {
      const { data } = await documentsAPI.upload(fd);
      setAlert({ type: 'success', msg: `File uploaded! OCR Extracted: ${data.extractedText?.slice(0, 100)}...` });
      setUploadFile(null);
      load();
    } catch(e) { setAlert({ type: 'error', msg: e.response?.data?.message || 'Upload failed' }); }
    finally { setSubmitting(false); }
  };

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    try {
      const { data } = await documentsAPI.search(searchQ);
      setSearchResults(data.data);
    } catch(e) {}
  };

  const statusColor = { requested: 'blue', under_review: 'yellow', approved: 'green', rejected: 'red', issued: 'purple' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Documents & Certificates</h1>
        <p className="page-subtitle">Request certificates and upload documents</p>
      </div>

      {alert && <div className={`alert alert-${alert.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>{alert.msg}<button onClick={()=>setAlert(null)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}}>✕</button></div>}

      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: 'var(--gray-100)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {[['request', '📜 Request Certificate'], ['upload', '📤 Upload Document'], ['history', '📂 My Documents']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Space Grotesk', background: tab === v ? 'white' : 'transparent', color: tab === v ? 'var(--saffron)' : 'var(--gray-500)', boxShadow: tab === v ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}>{l}</button>
        ))}
      </div>

      {tab === 'request' && (
        <div className="card" style={{ maxWidth: '560px' }}>
          <h3 style={{ marginBottom: '20px' }}>Request Certificate</h3>
          <form onSubmit={requestCert}>
            <div className="form-group">
              <label className="form-label">Certificate Type</label>
              <select className="form-select" value={reqForm.documentType} onChange={e => setReqForm(p=>({...p,documentType:e.target.value}))}>
                {DOC_TYPES.filter(t=>t.value!=='other').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="alert alert-info">ℹ️ Admin will review and digitally issue your certificate with QR verification.</div>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Requesting...' : 'Submit Request'}</button>
          </form>
        </div>
      )}

      {tab === 'upload' && (
        <div className="card" style={{ maxWidth: '560px' }}>
          <h3 style={{ marginBottom: '20px' }}>Upload & Digitize Document</h3>
          <form onSubmit={uploadDoc}>
            <div className="form-group">
              <label className="form-label">Document Type</label>
              <select className="form-select" value={uploadType} onChange={e => setUploadType(e.target.value)}>
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Upload File (JPG, PNG, PDF)</label>
              <input type="file" className="form-input" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setUploadFile(e.target.files[0])} style={{ padding: '8px' }} />
              <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>🔍 OCR will extract and digitize text automatically</div>
            </div>
            {uploadFile && (
              <div style={{ background: 'var(--gray-50)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📎 {uploadFile.name} ({(uploadFile.size/1024).toFixed(0)} KB)
              </div>
            )}
            <button type="submit" disabled={submitting || !uploadFile} className="btn btn-primary">{submitting ? 'Uploading & Processing...' : 'Upload & Extract Text'}</button>
          </form>
        </div>
      )}

      {tab === 'history' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input type="text" className="form-input" placeholder="Search documents..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} style={{ maxWidth: '300px' }} onKeyPress={e=>e.key==='Enter'&&handleSearch()} />
            <button onClick={handleSearch} className="btn btn-secondary">Search</button>
            {searchResults && <button onClick={()=>setSearchResults(null)} className="btn btn-ghost">Clear</button>}
          </div>
          <div className="card">
            {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
              (searchResults || documents).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--gray-400)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
                  <p>{searchResults ? 'No matching documents found' : 'No documents yet'}</p>
                </div>
              ) : (
                <table className="table">
                  <thead><tr><th>Doc ID</th><th>Type</th><th>Status</th><th>Verification Code</th><th>Requested</th><th>Issued</th></tr></thead>
                  <tbody>
                    {(searchResults || documents).map(d => (
                      <tr key={d._id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{d.documentId}</td>
                        <td>{DOC_TYPES.find(t=>t.value===d.documentType)?.label || d.documentType}</td>
                        <td><span className={`badge badge-${statusColor[d.status]||'gray'}`}>{d.status?.replace(/_/g,' ')}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--green)' }}>{d.verificationCode}</td>
                        <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{d.issuedAt ? new Date(d.issuedAt).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
