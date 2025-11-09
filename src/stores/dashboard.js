import { defineStore } from "pinia";
import dashboardService from "../services/dashboardService";

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({
    summary: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchSummary() {
      this.loading = true;
      this.error = null;

      try {
        const response = await dashboardService.getSummary();
        if (response.status === "success") {
          this.summary = response.data;
        } else {
          this.error = response.message || "Failed to load dashboard data";
        }
      } catch (err) {
        this.error = err.response?.data?.message || "Failed to connect to server";
      } finally {
        this.loading = false;
      }
    },
  },
});
