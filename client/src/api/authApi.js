import api from './client';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (data) => api.put('/auth/preferences', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  seedDemo: () => api.post('/auth/seed-demo'),
};
