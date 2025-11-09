import api from './api';

export default {
  // start export job (returns job id)
  async exportClients(payload) {
    const res = await api.post('/export/clients', payload);
    return res.data?.data ?? res.data ?? res;
  },

  // check job status
  async getStatus(id) {
    const res = await api.get(`/export/${id}/status`);
    return res.data ?? res;
  },

  // download file (returns blob)
  async download(id) {
    const res = await api.get(`/export/${id}/download`, { responseType: 'blob' });
    return res;
  },

  // helper to trigger browser download
  async downloadAndSave(id, filename = 'export.xlsx') {
    const res = await this.download(id);
    const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
