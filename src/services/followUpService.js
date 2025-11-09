import api from './api';

export default {
  async getFollowUps(params = {}) {
    const res = await api.get('/follow-ups', { params });
    return {
      data: res.data?.data ?? [],
      meta: res.data?.meta ?? null,
      links: res.data?.links ?? null,
    };
  },

  async getFollowUp(id) {
    const res = await api.get(`/follow-ups/${id}`);
    return res.data?.data ?? res.data ?? res;
  },

  async createFollowUp(payload) {
    const res = await api.post('/follow-ups', payload);
    return res.data?.data ?? res.data ?? res;
  },

  async updateFollowUp(id, payload) {
    const res = await api.put(`/follow-ups/${id}`, payload);
    return res.data?.data ?? res.data ?? res;
  },

  async deleteFollowUp(id) {
    const res = await api.delete(`/follow-ups/${id}`);
    return res.data ?? res;
  },

  async restoreFollowUp(id) {
    const res = await api.post(`/follow-ups/${id}/restore`);
    return res.data?.data ?? res.data ?? res;
  },

  async markComplete(id) {
    const res = await api.post(`/follow-ups/${id}/complete`);
    return res.data?.data ?? res.data ?? res;
  },

  async markCancelled(id) {
    const res = await api.post(`/follow-ups/${id}/cancel`);
    return res.data?.data ?? res.data ?? res;
  },

  async myTasks(params = {}) {
    const res = await api.get('/follow-ups/my-tasks', { params });
    return {
      data: res.data?.data ?? [],
      meta: res.data?.meta ?? null,
      links: res.data?.links ?? null,
    };
  },
};
