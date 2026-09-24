import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const adminLogin = (data) => API.post('/auth/login', data);

// Admin endpoints
export const getDashboardStats = () => API.get('/admin/dashboard');
export const getAllLoans = (params) => API.get('/admin/loans', { params });
export const getAdminLoanById = (id) => API.get(`/admin/loans/${id}`);
export const updateLoanStatus = (id, data) => API.put(`/admin/loans/${id}/status`, data);
export const getAllUsers = (params) => API.get('/admin/users', { params });
export const getAdminUserById = (id) => API.get(`/admin/users/${id}`);
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);
export const getAllPayments = (params) => API.get('/admin/payments', { params });

export default API;
