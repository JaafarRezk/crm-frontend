<template>
  <AppLayout>
    <div class="p-6">
      <button @click="$router.back()" class="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Back</button>

      <div v-if="loading" class="text-gray-500">Loading client...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else-if="client">
        <h1 class="text-2xl font-semibold mb-4">{{ client.name }}</h1>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div><strong>Email:</strong> {{ client.email || '—' }}</div>
          <div><strong>Phone:</strong> {{ client.phone || '—' }}</div>
          <div><strong>Status:</strong> {{ client.status }}</div>
          <div><strong>Assigned To:</strong> {{ client.assigned_user?.name || '—' }}</div>
          <div><strong>Last Communication:</strong> {{ client.last_communication_at || '—' }}</div>
          <div><strong>Created At:</strong> {{ client.created_at || '—' }}</div>
          <div><strong>Updated At:</strong> {{ client.updated_at || '—' }}</div>
        </div>

        <div class="flex space-x-2">
          <button @click="openEditForm(client)" class="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500">Edit</button>
          <button @click="deleteClient(client)" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
          <button v-if="client.deleted_at" @click="restoreClient(client)" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Restore</button>
        </div>

        <ClientFormModal v-if="formOpen" :client="formClient" @close="closeForm" @saved="fetchClient" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import clientService from '../../services/clientService';
import AppLayout from '../../layouts/AppLayout.vue';
import ClientFormModal from './ClientFormModal.vue';

const route = useRoute();
const client = ref(null);
const loading = ref(true);
const error = ref(null);

const formOpen = ref(false);
const formClient = ref({});

const fetchClient = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await clientService.getClient(route.params.id);
    client.value = res.data;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load client';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchClient);

// Actions
const openEditForm = (c) => { formClient.value = { ...c }; formOpen.value = true; };
const closeForm = () => { formOpen.value = false; formClient.value = {}; };

const deleteClient = async (c) => {
  if (confirm(`Are you sure you want to delete ${c.name}?`)) {
    await clientService.deleteClient(c.id);
    fetchClient();
  }
};

const restoreClient = async (c) => {
  if (confirm(`Are you sure you want to restore ${c.name}?`)) {
    await clientService.restoreClient(c.id);
    fetchClient();
  }
};
</script>
