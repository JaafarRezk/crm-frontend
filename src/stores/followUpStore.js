import { defineStore } from 'pinia';
import followUpService from '../services/followUpService';

export const useFollowUpStore = defineStore('followup', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    pagination: null,
    filters: {
      search: '',
      status: '',
      per_page: 10,
      page: 1,
    },
  }),

  actions: {
    async fetch() {
      this.loading = true;
      this.error = null;
      try {
        const res = await followUpService.getFollowUps(this.filters);
        this.items = res.data || [];
        this.pagination = res.meta || null;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load follow-ups';
      } finally {
        this.loading = false;
      }
    },

    updateFilter(key, value) {
      this.filters[key] = value;
      if (key !== 'page') {
        this.filters.page = 1;
      }
      this.fetch();
    },

    async create(payload) {
      await followUpService.createFollowUp(payload);
      this.filters.page = 1;
      await this.fetch();
    },

    async update(id, payload) {
      await followUpService.updateFollowUp(id, payload);
      const idx = this.items.findIndex(i => String(i.id) === String(id));
      if (idx !== -1) {
        this.items[idx] = { ...this.items[idx], ...payload };
      }
      await this.fetch();
    },

    async delete(id) {
      await followUpService.deleteFollowUp(id);
      await this.fetch();
    },

    async restore(id) {
      await followUpService.restoreFollowUp(id);
      await this.fetch();
    },

    async markComplete(id) {
      await followUpService.markComplete(id);
      await this.fetch();
    },

    async markCancelled(id) {
      await followUpService.markCancelled(id);
      await this.fetch();
    },

    goToPage(page) {
      this.updateFilter('page', page);
    },
  },

  getters: {
    pages: (state) => {
      if (!state.pagination) return [];
      const { current_page, last_page } = state.pagination;
      const arr = [];
      for (let p = current_page - 2; p <= current_page + 2; p++) {
        if (p >= 1 && p <= last_page) arr.push(p);
      }
      return arr;
    },
  },
});
