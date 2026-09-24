import api from './client';

export const dataApi = {
  exportBackup: () => api.get('/data/export/backup'),
  importBackup: (backup) => api.post('/data/import/backup', { backup }),
  exportCSV: (start, end) =>
    api.get('/data/export/csv', {
      params: { start, end },
      responseType: 'blob',
    }),
};
