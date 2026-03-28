import React, { useState, useEffect, useRef } from 'react';
import { adminAPI, complaintsAPI } from '../../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(r => { setData(r.data.data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"/></div>;
  if (!data) return <div className="alert alert-error">Failed to load dashboard</div>;

  const statusLabels = { received:'Received', in_review:'In Review', in_progress:'In Progress', resolved:'Resolved', rejected:'Rejected' };
  const statusColors = ['#3B82F6','#F59E0B','#F97316','#22C55E','#EF4444'];

  const categoryData = {
    labels: (data.complaintsByCategory||[]).map(c => c._id),
    datasets: [{ data: (data.complaintsByCategory||[]).map(c => c.count), backgroundColor: ['#FF6B00','#138808','#000080','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#6B7280'], borderWidth: 2, borderColor: 'white' }]
  };

  const statusData = {
    labels: (data.complaintsByStatus||[]).map(s => statusLabels[s._id]||s._id),
    datasets: [{ label: 'Complaints', data: (data.complaintsByStatus||[]).map(s => s.count), backgroundColor: statusColors, borderRadius: 6 }]
  };

  const fundData = {
    labels: (data.funds||[]).map(f => f.projectName?.slice(0,20)),
    datasets: [
      { label:'Budget', data:(data.funds||[]).map(f=>f.budget), backgroundColor:'rgba(0,0,128,0.3)', borderColor:'var(--blue)', borderWidth:2, borderRadius:4 },
      { label:'Spent', data:(data.funds||[]).map(f=>f.spentAmount), backgroundColor:'rgba(255,107,0,0.6)', borderColor:'var(--saffron)', borderWidth:2, borderRadius:4 }
    ]
  };

  return (
    <div>
      <div style={{ background:'linear-gradient(135deg, var(--navy), #2d2d8e)', borderRadius:'var(--radius-lg)', padding:'32px', color:'white', marginBottom:'28px' }}>
        <h1 style={{ fontFamily:'DM Serif Display, serif', fontSize:'28px', marginBottom:'6px' }}>Admin Dashboard</h1>
        <p style={{ opacity:0.7, fontSize:'14px' }}>Complete overview of AIRGSS platform</p>
      </div>

      <div className="grid-4" style={{ marginBottom:'28px' }}>
        {[
          { label:'Total Citizens', value:data.totalCitizens||0, icon:'👥', bg:'#EFF0FF' },
          { label:'Total Complaints', value:data.totalComplaints||0, icon:'📋', bg:'#FFF0E6' },
          { label:'Resolved', value:data.resolvedComplaints||0, icon:'✅', bg:'#F0FDF4' },
          { label:'Revenue (₹)', value:`₹${((data.totalRevenue||0)/1000).toFixed(1)}K`, icon:'💰', bg:'#FFFBEB' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background:s.bg }}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {data.pendingDocs > 0 && (
        <div className="alert alert-warning" style={{ marginBottom:'24px' }}>
          🔔 <strong>{data.pendingDocs} document requests</strong> are pending review.
        </div>
      )}

      <div className="grid-2" style={{ marginBottom:'24px' }}>
        <div className="card">
          <h3 style={{ marginBottom:'20px', fontSize:'16px' }}>Complaints by Category</h3>
          {(data.complaintsByCategory||[]).length > 0 ? <Doughnut data={categoryData} options={{ plugins: { legend: { position:'right' } }, maintainAspectRatio: true }} /> : <div style={{ textAlign:'center', color:'var(--gray-400)', padding:'40px' }}>No data yet</div>}
        </div>
        <div className="card">
          <h3 style={{ marginBottom:'20px', fontSize:'16px' }}>Complaints by Status</h3>
          {(data.complaintsByStatus||[]).length > 0 ? <Bar data={statusData} options={{ plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, ticks:{ stepSize:1 } } }, maintainAspectRatio: true }} /> : <div style={{ textAlign:'center', color:'var(--gray-400)', padding:'40px' }}>No data yet</div>}
        </div>
      </div>

      
      {/* <div className="" style={{ marginBottom:'24px' }}>
        <h3 style={{ marginBottom:'20px', fontSize:'16px' }}>Fund Budget vs Spent</h3>
        {(data.funds||[]).length > 0 ? <Bar data={fundData} options={{ plugins:{ legend:{ position:'top' } }, scales:{ y:{ beginAtZero:true } }, maintainAspectRatio: false }} height={200} /> : <div style={{ textAlign:'center', color:'var(--gray-400)', padding:'40px' }}>No fund data</div>}
      </div> */}

      <div className="card">
        <h3 style={{ marginBottom:'20px', fontSize:'16px' }}>Recent Complaints</h3>
        <table className="table">
          <thead><tr><th>Ticket</th><th>Citizen</th><th>Category</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {(data.recentComplaints||[]).map(c=>(
              <tr key={c._id}>
                <td style={{ fontFamily:'monospace', fontWeight:'600', color:'var(--blue)', fontSize:'12px' }}>{c.ticketId}</td>
                <td>{c.citizenId?.name||'N/A'}</td>
                <td><span className="badge badge-blue" style={{ textTransform:'capitalize' }}>{c.category}</span></td>
                <td><span className={`badge badge-${c.status==='resolved'?'green':c.status==='in_progress'?'orange':'blue'}`}>{c.status?.replace(/_/g,' ')}</span></td>
                <td style={{ color:'var(--gray-500)', fontSize:'13px' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
