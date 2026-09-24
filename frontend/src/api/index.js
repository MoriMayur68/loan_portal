import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// Loans
export const applyLoan = (data) => API.post('/loans', data);
export const getMyLoans = () => API.get('/loans');
export const getLoanById = (id) => API.get(`/loans/${id}`);

// Payments
export const makePayment = (data) => API.post('/payments', data);
export const getMyPayments = () => API.get('/payments');
export const getLoanPayments = (loanId) => API.get(`/payments/loan/${loanId}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');

export default API;
