import api from './client';

export const reflectionApi = {
  getByDate: (date) => api.get(`/reflections/${date}`),
  upsert: (data) => api.post('/reflections', data),
  getHistory: (limit = 30) => api.get('/reflections/history', { params: { limit } }),
};
