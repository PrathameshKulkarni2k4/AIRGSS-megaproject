import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', color: 'white', fontFamily: "Space Grotesk, sans-serif" }}>
      {/* Tricolor Header Strip */}
      <div style={{ height: '5px', background: 'linear-gradient(to right, var(--saffron) 33%, white 33%, white 66%, var(--green) 66%)' }} />
      
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '46px', height: '46px', background: 'linear-gradient(135deg, var(--saffron), var(--gold))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏛️</div>
          <div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', color: 'white' }}>AIRGSS</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>AI Powered Rural Governance</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/login')} className="btn btn-outline">Login</button>
          <button onClick={() => navigate('/register')} className="btn btn-primary">Register</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '80px 40px 60px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '999px', padding: '6px 18px', fontSize: '13px', color: 'var(--saffron)', marginBottom: '28px' }}>
          🇮🇳 Transforming Rural Governance with AI
        </div>
        <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '56px', lineHeight: '1.15', marginBottom: '24px', background: 'linear-gradient(135deg, white, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Digital Panchayat for Every Citizen
        </h1>
        <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8', marginBottom: '40px', maxWidth: '650px', margin: '0 auto 40px' }}>
          Access government services, file complaints, discover welfare schemes, and pay taxes — all from your smartphone. Empowering 600,000+ villages across India.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg">Get Started Free</button>
          <button onClick={() => navigate('/login')} className="btn btn-ghost btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Sign In</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', padding: '40px 60px', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
        {[['6L+', 'Villages Covered'], ['50M+', 'Citizens Served'], ['95%', 'Complaint Resolution'], ['200+', 'Gov Schemes']].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', color: 'var(--saffron)' }}>{v}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '80px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '38px', textAlign: 'center', marginBottom: '12px' }}>Everything you need, in one place</h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: '52px' }}>AI-powered tools to bridge the digital gap in rural India</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { icon: '🤖', title: 'AI Complaint Filing', desc: 'Describe your issue in any language. Our AI auto-classifies and routes complaints to the right department.' },
            { icon: '📋', title: 'Scheme Recommendations', desc: 'Get personalized government welfare scheme suggestions based on your profile and eligibility.' },
            { icon: '💳', title: 'Digital Payments', desc: 'Pay property tax, water bills, and local fees online. Get instant receipts and payment history.' },
            { icon: '📜', title: 'Digital Certificates', desc: 'Apply for income, residence, and birth certificates online. Track status in real time.' },
            { icon: '🔍', title: 'OCR Document Upload', desc: 'Upload scanned documents. AI extracts and digitizes text for quick verification.' },
            { icon: '💬', title: 'GAIA Chatbot', desc: 'Chat with our AI assistant in English, Hindi, or Marathi for 24/7 governance support.' },
          ].map(f => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'white' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'linear-gradient(135deg, var(--saffron-dark), var(--saffron))', padding: '60px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', marginBottom: '16px' }}>Ready to experience digital governance?</h2>
        <p style={{ fontSize: '16px', opacity: 0.85, marginBottom: '32px' }}>Join millions of citizens already using AIRGSS for better governance</p>
        <button onClick={() => navigate('/register')} className="btn btn-lg" style={{ background: 'white', color: 'var(--saffron)', fontWeight: '700' }}>Register Now — It's Free</button>
      </div>

      <footer style={{ padding: '24px 60px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
        © 2025 AIRGSS — Government of India Initiative | Ministry of Panchayati Raj
      </footer>
    </div>
  );
}
