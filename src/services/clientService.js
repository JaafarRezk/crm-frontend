// src/services/clientService.js
import api from './api';

export default {
  async getClients(params = {}) {
    // params: { page, per_page, status, assigned_to, search }
    const res = await api.get('/clients', { params });
    // return full axios response data so caller يقرر شكل الاستجابة
    return res.data ?? res;
  },

  async getClient(id) {
    const res = await api.get(`/clients/${id}`);
    return res.data ?? res;
  },

  async createClient(payload) {
    const res = await api.post('/clients', payload);
    // normalize: backend often returns { status, message, data: { ... } }
    return res.data?.data ?? res.data ?? res;
  },

  async updateClient(id, payload) {
    const res = await api.put(`/clients/${id}`, payload);
    return res.data?.data ?? res.data ?? res;
  },

  async deleteClient(id) {
    const res = await api.delete(`/clients/${id}`);
    return res.data ?? res;
  },

  async restoreClient(id) {
    const res = await api.post(`/clients/${id}/restore`);
    return res.data?.data ?? res.data ?? res;
  },

  async assignBulk(payload) {
    const res = await api.post('/clients/assign-bulk', payload);
    return res.data ?? res;
  },

  async restoreBulk(payload) {
    const res = await api.post('/clients/restore-bulk', payload);
    return res.data ?? res;
  },
};

