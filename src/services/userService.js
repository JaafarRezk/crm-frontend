import api from './api';

export default {
  async getUsers(params = {}) {
    const { data } = await api.get('/users', { params });
    return data; // { status, message, data: [ ...users ] }
  },

  async getSalesReps() {
    const res = await this.getUsers();
    return {
      ...res,
      data: res.data.filter(user => user.user_type === 'sales_rep')
    };
  },

  async getUser(id) {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  async createUser(payload) {
    const { data } = await api.post('/users', payload);
    return data;
  },

  async updateUser(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
  },

  async deleteUser(id) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  async assignRole(id, role) {
    const { data } = await api.post(`/users/${id}/roles`, { role });
    return data;
  }
};
