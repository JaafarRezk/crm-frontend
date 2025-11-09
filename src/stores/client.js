import { defineStore } from "pinia";
import clientService from "../services/clientService";

export const useClientStore = defineStore("client", {
  state: () => ({
    clients: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchClients() {
      this.loading = true;
      try {
        const res = await clientService.getClients();
        this.clients = res.data || [];
        this.error = null;
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to load clients";
      } finally {
        this.loading = false;
      }
    },

    async addClient(payload) {
      const res = await clientService.createClient(payload);
      this.clients.push(res.data);
      return res;
    },

    async updateClient(id, payload) {
      const res = await clientService.updateClient(id, payload);
      const index = this.clients.findIndex(c => c.id === id);
      if (index !== -1) this.clients[index] = res.data;
      return res;
    },

    async deleteClient(id) {
      await clientService.deleteClient(id);
      this.clients = this.clients.filter(c => c.id !== id);
    },

    async restoreClient(id) {
      const res = await clientService.restoreClient(id);
      this.clients.push(res.data);
      return res;
    },

    async assignBulk(payload) {
      return await clientService.assignBulk(payload);
    },

    async restoreBulk(payload) {
      return await clientService.restoreBulk(payload);
    },
  },
});


