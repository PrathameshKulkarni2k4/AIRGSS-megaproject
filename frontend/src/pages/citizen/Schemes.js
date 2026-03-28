import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SchemesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allSchemes, setAllSchemes] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [tab, setTab] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [recError, setRecError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [all, rec] = await Promise.allSettled([schemesAPI.getAll(), schemesAPI.getRecommended()]);
        setAllSchemes(all.value?.data?.data || []);
        if (rec.status === 'fulfilled') setRecommended(rec.value?.data?.data || []);
        else setRecError(rec.reason?.response?.data?.message || 'Complete profile for recommendations');
      } catch(e) {} finally { setLoading(false); }
    };
    load();
  }, []);

  const SchemeCard = ({ scheme }) => (
    <div className="card card-hover" style={{ borderLeft: '4px solid var(--saffron)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--gray-900)', flex: 1 }}>{scheme.name}</h3>
        {scheme.deadline && <span className="badge badge-yellow" style={{ whiteSpace: 'nowrap', marginLeft: '8px', fontSize: '11px' }}>Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN')}</span>}
      </div>
      <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '14px', lineHeight: '1.6' }}>{scheme.description}</p>
      {scheme.ministry && <div style={{ fontSize: '12px', color: 'var(--blue)', marginBottom: '12px' }}>🏛️ {scheme.ministry}</div>}
      <div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gray-600)', marginBottom: '6px' }}>Benefits:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {scheme.benefits?.map((b, i) => (
            <span key={i} style={{ background: '#F0FDF4', color: 'var(--green)', borderRadius: '999px', padding: '3px 10px', fontSize: '12px', border: '1px solid #BBF7D0' }}>{b}</span>
          ))}
        </div>
      </div>
      {scheme.eligibilityRules?.maxIncome && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--gray-500)', background: 'var(--gray-50)', padding: '8px 12px', borderRadius: '8px' }}>
          📊 Income limit: ₹{scheme.eligibilityRules.maxIncome.toLocaleString('en-IN')}/year
          {scheme.eligibilityRules.gender && scheme.eligibilityRules.gender !== 'all' && ` | For: ${scheme.eligibilityRules.gender}`}
        </div>
      )}
    </div>
  );

  const display = tab === 'recommended' ? recommended : allSchemes;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Government Schemes</h1>
        <p className="page-subtitle">Welfare schemes you may be eligible for</p>
      </div>

      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', background: 'var(--gray-100)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
        {[['recommended', '⭐ Recommended For You'], ['all', '📋 All Schemes']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Space Grotesk, sans-serif', background: tab === v ? 'white' : 'transparent', color: tab === v ? 'var(--saffron)' : 'var(--gray-500)', boxShadow: tab === v ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}>{l}</button>
        ))}
      </div>

      {tab === 'recommended' && recError && (
        <div className="alert alert-warning">
          ⚠️ {recError} <button onClick={() => navigate('/citizen/profile')} className="btn btn-sm btn-primary" style={{ marginLeft: '12px' }}>Complete Profile</button>
        </div>
      )}

      {loading ? <div className="loading-spinner"><div className="spinner"/></div> :
       display.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-100)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No schemes found</h3>
          {tab === 'recommended' && <p style={{ color: 'var(--gray-400)' }}>Complete your profile to see personalized recommendations</p>}
        </div>
       ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {display.map(s => <SchemeCard key={s._id} scheme={s} />)}
        </div>
       )}
    </div>
  );
}
