import React, { useState, useRef, useEffect } from 'react';
import { chatbotAPI } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';

const QUICK_PROMPTS = ['How to file a complaint?','What schemes am I eligible for?','How to pay property tax?','How to get income certificate?','मुझे शिकायत दर्ज करनी है'];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role:'assistant', content:'Namaste! 🙏 I am GAIA, your Governance AI Assistant. I can help you with complaints, government schemes, payments, certificates and more. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(uuidv4());
  const [lang, setLang] = useState('en');
  const endRef = useRef();

  useEffect(() => { if(open) endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, open]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(p => [...p, { role:'user', content:msg }]);
    setLoading(true);
    try {
      const { data } = await chatbotAPI.chat({ message: msg, sessionId, language: lang });
      setMessages(p => [...p, { role:'assistant', content:data.data.response }]);
    } catch(e) {
      setMessages(p => [...p, { role:'assistant', content:'Sorry, I am having trouble connecting. Please try again shortly.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* Floating Button */}
      <button onClick={() => setOpen(o=>!o)} style={{
        position:'fixed', bottom:'28px', right:'28px', width:'58px', height:'58px',
        borderRadius:'50%', background:'linear-gradient(135deg, var(--saffron), var(--gold))',
        border:'none', cursor:'pointer', fontSize:'26px', boxShadow:'0 4px 20px rgba(255,107,0,0.5)',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:999,
        transition:'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseOver={e=>{e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(255,107,0,0.6)';}}
      onMouseOut={e=>{e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(255,107,0,0.5)';}}>
        {open ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position:'fixed', bottom:'100px', right:'28px', width:'360px', height:'520px',
          background:'white', borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)',
          display:'flex', flexDirection:'column', zIndex:998, overflow:'hidden',
          border:'1px solid var(--gray-100)'
        }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg, var(--navy), var(--blue-light))', padding:'16px 20px', color:'white' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg, var(--saffron), var(--gold))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>🤖</div>
              <div>
                <div style={{ fontWeight:'700', fontSize:'15px' }}>GAIA</div>
                <div style={{ fontSize:'11px', opacity:0.7 }}>Governance AI Assistant • Online</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'6px' }}>
              {['en','hi','mr'].map(l => (
                <button key={l} onClick={()=>setLang(l)} style={{ padding:'3px 10px', borderRadius:'999px', border:'1px solid rgba(255,255,255,0.3)', background: lang===l ? 'rgba(255,255,255,0.25)' : 'transparent', color:'white', fontSize:'11px', cursor:'pointer', fontFamily:'Space Grotesk' }}>
                  {l==='en'?'EN':l==='hi'?'हि':'मर'}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:'80%', padding:'10px 14px', borderRadius: m.role==='user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role==='user' ? 'linear-gradient(135deg, var(--saffron), var(--gold))' : 'var(--gray-100)',
                  color: m.role==='user' ? 'white' : 'var(--gray-800)',
                  fontSize:'13px', lineHeight:'1.6'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', justifyContent:'flex-start' }}>
                <div style={{ background:'var(--gray-100)', borderRadius:'16px 16px 16px 4px', padding:'12px 16px' }}>
                  <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
                    {[0,1,2].map(i=><div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--gray-400)', animation:`bounce 1s infinite ${i*0.2}s` }}/>)}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length < 3 && (
            <div style={{ padding:'0 12px 8px', display:'flex', gap:'6px', overflowX:'auto', flexWrap:'nowrap' }}>
              {QUICK_PROMPTS.slice(0,3).map((p,i)=>(
                <button key={i} onClick={()=>send(p)} style={{ whiteSpace:'nowrap', background:'#FFF0E6', border:'1px solid rgba(255,107,0,0.2)', borderRadius:'999px', padding:'5px 12px', fontSize:'11px', cursor:'pointer', color:'var(--saffron)', fontWeight:'500', fontFamily:'Space Grotesk' }}>{p}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'12px', borderTop:'1px solid var(--gray-100)', display:'flex', gap:'8px' }}>
            <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&send()} placeholder="Ask me anything..." style={{ flex:1, padding:'9px 14px', borderRadius:'999px', border:'1.5px solid var(--gray-200)', fontSize:'13px', fontFamily:'Space Grotesk', outline:'none' }} onFocus={e=>e.target.style.borderColor='var(--saffron)'} onBlur={e=>e.target.style.borderColor='var(--gray-200)'} />
            <button onClick={()=>send()} disabled={loading||!input.trim()} style={{ width:'36px', height:'36px', borderRadius:'50%', background:'var(--saffron)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0, opacity:loading||!input.trim()?0.5:1 }}>➤</button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)} }`}</style>
    </>
  );
}
