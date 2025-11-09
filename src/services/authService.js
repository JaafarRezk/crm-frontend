// src/services/authService.js
import api from './api';

export default {
  async login(credentials) {
    const { data } = await api.post('/login', credentials);
    return data;
  },
  async register(payload) {
    const { data } = await api.post('/register', payload);
    return data;
  },
  async logout() {
    const { data } = await api.post('/logout');
    return data;
  },
  async getUser() {
    const { data } = await api.get('/user');
    return data;
  },
  async refresh() {

    const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },
};
