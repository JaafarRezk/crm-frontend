import { defineStore } from 'pinia';
import userService from '../services/userService';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await userService.getUsers(params);
        if (res.status === 'success') this.users = res.data;
      } catch (err) {
        this.error = err.message || 'Failed to load users';
      } finally {
        this.loading = false;
      }
    },

    async fetchUser(id) {
      this.loading = true;
      this.error = null;
      try {
        const res = await userService.getUser(id);
        return res.data;
      } catch (err) {
        this.error = err.message || 'Failed to load user';
      } finally {
        this.loading = false;
      }
    },

    async createUser(payload) {
      return await userService.createUser(payload);
    },

    async updateUser(id, payload) {
      return await userService.updateUser(id, payload);
    },

    async deleteUser(id) {
      return await userService.deleteUser(id);
    },

    async assignRole(id, role) {
      return await userService.assignRole(id, role);
    },
  },
});
