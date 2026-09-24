import api from './client';

export const logApi = {
  getLogsByDate: (dateKey) => api.get('/logs', { params: { date: dateKey } }),
  getLogsRange: (start, end) => api.get('/logs', { params: { start, end } }),
  upsertLog: (data) => api.post('/logs', data),
  batchUpsertLogs: (logs) => api.post('/logs/batch', { logs }),
  deleteLog: (id) => api.delete(`/logs/${id}`),
};
