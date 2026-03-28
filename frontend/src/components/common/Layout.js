import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatbotWidget from '../chatbot/ChatbotWidget';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Sidebar open={sidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: sidebarOpen ? '260px' : '0', transition: 'margin 0.3s', minWidth: 0 }}>
        <Header onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <Outlet />
        </main>
      </div>
      <ChatbotWidget />
    </div>
  );
}
