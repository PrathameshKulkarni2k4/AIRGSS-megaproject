import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/citizen/Dashboard';
import ComplaintsPage from './pages/citizen/Complaints';
import PaymentsPage from './pages/citizen/Payments';
import SchemesPage from './pages/citizen/Schemes';
import DocumentsPage from './pages/citizen/Documents';
import ProfilePage from './pages/citizen/Profile';
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerComplaints from './pages/officer/Complaints';
import OfficerDocuments from './pages/officer/Documents';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCitizens from './pages/admin/Citizens';
import AdminFunds from './pages/admin/Funds';
import AdminSchemes from './pages/admin/Schemes';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'officer') return <Navigate to="/officer/dashboard" />;
  return <Navigate to="/citizen/dashboard" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<RoleRedirect />} />
          <Route element={<Layout />}>
            <Route path="/citizen/dashboard" element={<ProtectedRoute roles={["citizen"]}><CitizenDashboard /></ProtectedRoute>} />
            <Route path="/citizen/complaints" element={<ProtectedRoute roles={["citizen"]}><ComplaintsPage /></ProtectedRoute>} />
            <Route path="/citizen/payments" element={<ProtectedRoute roles={["citizen"]}><PaymentsPage /></ProtectedRoute>} />
            <Route path="/citizen/schemes" element={<ProtectedRoute roles={["citizen"]}><SchemesPage /></ProtectedRoute>} />
            <Route path="/citizen/documents" element={<ProtectedRoute roles={["citizen"]}><DocumentsPage /></ProtectedRoute>} />
            <Route path="/citizen/profile" element={<ProtectedRoute roles={["citizen"]}><ProfilePage /></ProtectedRoute>} />
            <Route path="/officer/dashboard" element={<ProtectedRoute roles={["officer"]}><OfficerDashboard /></ProtectedRoute>} />
            <Route path="/officer/complaints" element={<ProtectedRoute roles={["officer"]}><OfficerComplaints /></ProtectedRoute>} />
            <Route path="/officer/documents" element={<ProtectedRoute roles={["officer"]}><OfficerDocuments /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/citizens" element={<ProtectedRoute roles={["admin"]}><AdminCitizens /></ProtectedRoute>} />
            <Route path="/admin/funds" element={<ProtectedRoute roles={["admin"]}><AdminFunds /></ProtectedRoute>} />
            <Route path="/admin/schemes" element={<ProtectedRoute roles={["admin"]}><AdminSchemes /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
