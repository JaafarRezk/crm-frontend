import { defineStore } from 'pinia';
import exportService from '../services/exportService';

export const useExportStore = defineStore('export', {
  state: () => ({
    jobs: {},
  }),

  actions: {
    async startExport(payload) {
      const res = await exportService.exportClients(payload);
      const job = res?.data ?? res;
      if (job?.id) {
        this.jobs[job.id] = { status: job.status ?? 'pending', meta: job };
      }
      return job;
    },

    async pollStatus(jobId) {
      const res = await exportService.getStatus(jobId);
      const data = res?.data ?? res;
      this.jobs[jobId] = { ...this.jobs[jobId], ...data };
      return data;
    },

    async download(jobId, filename) {
      await exportService.downloadAndSave(jobId, filename);
    },

    removeJob(jobId) {
      delete this.jobs[jobId];
    },
  },
});
