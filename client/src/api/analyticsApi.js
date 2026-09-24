import api from './client';

export const analyticsApi = {
  getDashboard: (date) => api.get('/analytics/dashboard', { params: { date } }),
  getRange: (start, end) => api.get('/analytics/range', { params: { start, end } }),
  getHeatmap: (year) => api.get('/analytics/heatmap', { params: { year } }),
  getActivityAnalytics: (id, start, end) =>
    api.get(`/analytics/activity/${id}`, { params: { start, end } }),
};
