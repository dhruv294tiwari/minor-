import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
if (rawBaseUrl && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
  rawBaseUrl = `https://${rawBaseUrl}`;
}
const cleanBaseUrl = rawBaseUrl ? `${rawBaseUrl.replace(/\/+$/, '')}/api` : '/api';

const api = axios.create({
  baseURL: cleanBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 35000,
});

// Request interceptor to attach JWT token for admin endpoints
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mait_admin_token');
    if (token && config.url?.includes('/admin')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config.url?.includes('/admin')) {
      localStorage.removeItem('mait_admin_token');
      localStorage.removeItem('mait_admin_profile');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service Modules
export const chatApi = {
  sendMessage: (payload) => api.post('/chat', payload),
  sendFeedback: (payload) => api.post('/feedback', payload),
};

export const authApi = {
  login: (credentials) => api.post('/admin/login', credentials),
  getMe: () => api.get('/admin/me'),
  changePassword: (data) => api.post('/admin/change-password', data),
  updateProfile: (data) => api.put('/admin/profile', data),
};

export const dashboardApi = {
  getStats: () => api.get('/admin/dashboard'),
};

export const categoryApi = {
  listPublic: () => api.get('/categories'),
  listAdmin: () => api.get('/admin/categories'),
  getById: (id) => api.get(`/admin/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

export const knowledgeApi = {
  list: (params) => api.get('/admin/knowledge', { params }),
  getById: (id) => api.get(`/admin/knowledge/${id}`),
  create: (data) => api.post('/admin/knowledge', data),
  update: (id, data) => api.put(`/admin/knowledge/${id}`, data),
  delete: (id) => api.delete(`/admin/knowledge/${id}`),
};

export const queriesApi = {
  list: (params) => api.get('/admin/queries', { params }),
};

export const feedbackApi = {
  list: (params) => api.get('/admin/feedback', { params }),
};

export default api;
