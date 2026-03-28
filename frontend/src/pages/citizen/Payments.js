import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../../services/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'property_tax', description: '' });
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState(null);

  const load = async () => {
    try { const { data } = await paymentsAPI.getMy(); setPayments(data.data); }
    catch(e) {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const createAndPay = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setAlert({ type: 'error', msg: 'Enter valid amount' }); return; }
    setProcessing(true); setAlert(null);
    try {
      const { data: created } = await paymentsAPI.create(form);
      const { data: result } = await paymentsAPI.process(created.data._id);
      setAlert({ type: result.success ? 'success' : 'error', msg: result.success ? `✅ Payment successful! Receipt: ${result.data.receiptNumber}` : '❌ Payment failed. Please retry.' });
      setShowForm(false);
      setForm({ amount: '', type: 'property_tax', description: '' });
      load();
    } catch(e) { setAlert({ type: 'error', msg: e.response?.data?.message || 'Payment failed' }); }
    finally { setProcessing(false); }
  };

  const typeLabels = { property_tax: 'Property Tax', water_bill: 'Water Bill', local_fee: 'Local Fee', other: 'Other' };
  const statusColor = { pending: 'yellow', success: 'green', failed: 'red', refunded: 'blue' };

  const totalPaid = payments.filter(p => p.status === 'success').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">Payments & Taxes</h1>
          <p className="page-subtitle">Pay your dues and view history</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">+ New Payment</button>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#EFF9EF' }}>💰</div><div><div className="stat-value">₹{totalPaid.toLocaleString('en-IN')}</div><div className="stat-label">Total Paid</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#DBEAFE' }}>📋</div><div><div className="stat-value">{payments.filter(p=>p.status==='success').length}</div><div className="stat-label">Successful</div></div></div>
        <div className="stat-card"><div className="stat-icon" style={{ background: '#FEE2E2' }}>❌</div><div><div className="stat-value">{payments.filter(p=>p.status==='failed').length}</div><div className="stat-label">Failed</div></div></div>
      </div>

      {alert && <div className={`alert alert-${alert.type === 'success' ? 'success' : 'error'}`}>{alert.msg}<button onClick={()=>setAlert(null)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>✕</button></div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>New Payment</h3>
          <form onSubmit={createAndPay}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Payment Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm(p=>({...p,type:e.target.value}))}>
                  {Object.entries(typeLabels).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" className="form-input" placeholder="Enter amount" value={form.amount} onChange={e => setForm(p=>({...p,amount:e.target.value}))} required min="1" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <input type="text" className="form-input" placeholder="Financial year, property ID..." value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={processing} className="btn btn-secondary">{processing ? '💳 Processing...' : '💳 Pay Now'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Payment History</h3>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> :
         payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
            <p>No payment records yet</p>
          </div>
        ) : (
          <table className="table">
            <thead><tr><th>Transaction ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Receipt</th><th>Date</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--gray-600)' }}>{p.transactionId}</td>
                  <td>{typeLabels[p.type] || p.type}</td>
                  <td style={{ fontWeight: '600', color: 'var(--green)' }}>₹{p.amount?.toLocaleString('en-IN')}</td>
                  <td><span className={`badge badge-${statusColor[p.status]}`}>{p.status}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{p.receiptNumber || '—'}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '13px' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
