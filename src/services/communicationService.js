import api from './api';

export default {
  async getCommunications(clientId, params = {}) {
    const res = await api.get(`/clients/${clientId}/communications`, { params });
    return res.data ?? res;
  },

  async getCommunication(clientId, id) {
    const res = await api.get(`/clients/${clientId}/communications/${id}`);
    return res.data ?? res;
  },

  async createCommunication(clientId, payload) {
    const res = await api.post(`/clients/${clientId}/communications`, payload);
    return res.data?.data ?? res.data ?? res;
  },

  async updateCommunication(clientId, id, payload) {
    const res = await api.put(`/clients/${clientId}/communications/${id}`, payload);
    return res.data?.data ?? res.data ?? res;
  },

  async deleteCommunication(clientId, id) {
    const res = await api.delete(`/clients/${clientId}/communications/${id}`);
    return res.data ?? res;
  },

  async restoreCommunication(clientId, id) {
    const res = await api.post(`/clients/${clientId}/communications/${id}/restore`);
    return res.data?.data ?? res.data ?? res;
  },
};
