<template>
  <div>
    <button @click="start" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded">
      Export clients
    </button>

    <div v-if="loading" class="mt-2 text-sm">Exporting... status: {{ status }}</div>
    <div v-if="error" class="text-red-600 mt-2">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import exportService from '../services/exportService';

const loading = ref(false);
const status = ref(null);
const error = ref(null);
let pollHandle = null;

const start = async () => {
  loading.value = true;
  error.value = null;
  try {
    const job = await exportService.exportClients({ /* your filters */ });
    const jobId = job?.id ?? job?.data?.id;
    if (!jobId) throw new Error('No export job id returned');
    status.value = 'pending';

    pollHandle = setInterval(async () => {
      try {
        const st = await exportService.getStatus(jobId);
        const data = st?.data ?? st;
        status.value = data.status ?? data;
        if (data.status === 'completed') {
          clearInterval(pollHandle);
          // try to download
          await exportService.downloadAndSave(jobId, `clients-export-${Date.now()}.xlsx`);
          loading.value = false;
        } else if (data.status === 'failed') {
          clearInterval(pollHandle);
          error.value = 'Export failed on server';
          loading.value = false;
        }
      } catch (e) {
        clearInterval(pollHandle);
        error.value = e.response?.data?.message || e.message || 'Polling failed';
        loading.value = false;
      }
    }, 2000);
  } catch (e) {
    loading.value = false;
    error.value = e.response?.data?.message || e.message || 'Failed to start export';
  }
};
</script>
