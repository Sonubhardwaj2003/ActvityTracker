import api from './client';

export const activityApi = {
  getActivities: (params) => api.get('/activities', { params }),
  getActivityById: (id) => api.get(`/activities/${id}`),
  createActivity: (data) => api.post('/activities', data),
  updateActivity: (id, data) => api.put(`/activities/${id}`, data),
  archiveActivity: (id) => api.patch(`/activities/${id}/archive`),
  reorderActivities: (orderedIds) => api.post('/activities/reorder', { orderedIds }),
  duplicateActivity: (id) => api.post(`/activities/${id}/duplicate`),
  deleteActivity: (id, permanent = false) =>
    api.delete(`/activities/${id}${permanent ? '?permanent=true' : ''}`),
};
