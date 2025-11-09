import { defineStore } from 'pinia';
import communicationService from '../services/communicationService';

export const useCommunicationStore = defineStore('communication', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchForClient(clientId, params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await communicationService.getCommunications(clientId, params);
        const payload = res?.data ?? res;
        this.items = payload?.data ?? payload ?? [];
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to load communications';
      } finally {
        this.loading = false;
      }
    },

    async create(clientId, payload) {
      const res = await communicationService.createCommunication(clientId, payload);
      const c = res?.data ?? res;
      // push locally if present
      if (c) this.items.unshift(c);
      return res;
    },

    async update(clientId, id, payload) {
      const res = await communicationService.updateCommunication(clientId, id, payload);
      const comm = res?.data ?? res;
      if (comm) {
        const idx = this.items.findIndex(i => String(i.id) === String(comm.id));
        if (idx !== -1) this.items.splice(idx, 1, comm);
      }
      return res;
    },

    async remove(clientId, id) {
      await communicationService.deleteCommunication(clientId, id);
      this.items = this.items.filter(i => String(i.id) !== String(id));
    },

    async restore(clientId, id) {
      const res = await communicationService.restoreCommunication(clientId, id);
      const comm = res?.data ?? res;
      if (comm) this.items.unshift(comm);
      return res;
    },
  },
});
