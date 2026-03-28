import axios from 'axios';

// FIX: Use REACT_APP_API_URL from .env; fallback to localhost for development
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Attach JWT token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// FIX: Handle 401 responses — clear storage and redirect, but avoid redirect loop on /login
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login';
      const isAuthRoute = err.config?.url?.includes('/auth/');
      // Only redirect if not already on login page and not a login/register call
      if (!isLoginPage && !isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: d => API.post('/auth/register', d),
  login: d => API.post('/auth/login', d),
  getMe: () => API.get('/auth/me'),
  updateProfile: d => API.put('/auth/profile', d),
};

export const complaintsAPI = {
  create: d => API.post('/complaints', d),
  getMy: () => API.get('/complaints/my'),
  getAll: p => API.get('/complaints', { params: p }),
  getById: id => API.get(`/complaints/${id}`),
  updateStatus: (id, d) => API.put(`/complaints/${id}/status`, d),
  getStats: () => API.get('/complaints/stats'),
};

export const paymentsAPI = {
  create: d => API.post('/payments', d),
  process: id => API.post(`/payments/${id}/process`),
  getMy: () => API.get('/payments/my'),
  getAll: () => API.get('/payments'),
};

export const schemesAPI = {
  getAll: () => API.get('/schemes'),
  getRecommended: () => API.get('/schemes/recommended'),
  create: d => API.post('/schemes', d),
  update: (id, d) => API.put(`/schemes/${id}`, d),
  delete: id => API.delete(`/schemes/${id}`),
};

export const documentsAPI = {
  request: d => API.post('/documents/request', d),
  // FIX: multipart/form-data header is set correctly for file uploads
  upload: fd => API.post('/documents/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMy: () => API.get('/documents/my'),
  getAll: p => API.get('/documents', { params: p }),
  review: (id, d) => API.put(`/documents/${id}/review`, d),
  search: q => API.get('/documents/search', { params: { q } }),
};

export const chatbotAPI = {
  chat: d => API.post('/chatbot/chat', d),
};

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getCitizens: () => API.get('/admin/citizens'),
  updateCitizenRole: (id, d) => API.put(`/admin/citizens/${id}/role`, d),
  getFunds: () => API.get('/admin/funds'),
  createFund: d => API.post('/admin/funds', d),
  updateFund: (id, d) => API.put(`/admin/funds/${id}`, d),
  getLogs: () => API.get('/admin/logs'),
};

export default API;
