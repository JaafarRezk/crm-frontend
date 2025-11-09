<template>
  <DashboardLayout>
    <div class="space-y-4">
      <h1 class="text-2xl font-semibold text-gray-700">Communications</h1>

      <CommunicationsList :client-id="selectedClientId" />
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '../../layouts/AppLayout.vue';
import CommunicationsList from '../../pages/Communications/CommunicationsList.vue';
import { ref } from 'vue';

const selectedClientId = ref(1);
</script>

