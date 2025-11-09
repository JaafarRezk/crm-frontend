<template>
  <AppLayout>
    <div class="p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-blue-600">Clients</h1>
          <p class="text-sm text-gray-500 mt-1">Manage clients — add, edit, delete, restore</p>
        </div>

        <div class="flex items-center gap-3">
          <input v-model="filters.search" @keyup.enter="onSearch" placeholder="Search name or email"
            class="border px-3 py-2 rounded w-48" />

          <select v-model="filters.status" @change="onFilterChange" class="border px-3 py-2 rounded">
            <option value="">All statuses</option>
            <option value="New">New</option>
            <option value="Active">Active</option>
            <option value="Hot">Hot</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select v-model.number="perPage" @change="onPerPageChange" class="border px-3 py-2 rounded">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>

          <button @click="openForm()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Add Client
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-gray-500">Loading clients...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>

      <div v-else class="overflow-x-auto bg-white rounded-lg border">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">#</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Phone</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Assigned</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="client in clients" :key="client.id" class="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
              <td class="px-4 py-3 text-sm text-gray-700">{{ client.id }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ client.name }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ client.email }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ client.phone || '—' }}</td>
              <td class="px-4 py-3 text-sm text-gray-700 capitalize">{{ client.status }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ client.assigned_user?.name || '—' }}</td>
              <td class="px-4 py-3 text-sm text-center">
                <div class="flex justify-center gap-2">
                  <button @click="viewClient(client.id)" class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">View</button>
                  <button @click="openForm(client)" class="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500">Edit</button>
                  <button @click="deleteClient(client)" class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                  <button v-if="client.deleted_at" @click="restoreClient(client)" class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700">Restore</button>
                </div>
              </td>
            </tr>

            <tr v-if="clients.length === 0">
              <td class="px-4 py-6 text-center text-gray-500" colspan="7">No clients found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination" class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-600">
          Showing {{ pagination.from }} — {{ pagination.to }} of {{ pagination.total }}
        </div>

        <div class="flex items-center gap-2">
          <button :disabled="!pagination.prev_page_url" @click="goToPage(pagination.current_page - 1)"
            class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>

          <button v-for="p in pagesToShow" :key="p" :class="['px-3 py-1 border rounded', { 'bg-blue-600 text-white': p === pagination.current_page }]"
            @click="goToPage(p)">
            {{ p }}
          </button>

          <button :disabled="!pagination.next_page_url" @click="goToPage(pagination.current_page + 1)"
            class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>

      <ClientFormModal v-if="formOpen" :client="formClient" @close="closeForm" @saved="onSaved" />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import clientService from "../../services/clientService";
import AppLayout from "../../layouts/AppLayout.vue";
import ClientFormModal from "./ClientFormModal.vue";

const router = useRouter();

const clients = ref([]);
const loading = ref(false);
const error = ref(null);

const filters = ref({
  page: 1,
  per_page: 15,
  status: "",
  assigned_to: "",
  search: "",
});
const perPage = ref(15);
const pagination = ref(null);

const formOpen = ref(false);
const formClient = ref({});

const normalizeResponse = (res) => {
  // res could be: array OR { data: [...], meta: {...} } OR { status,msg,data:... }
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) {
    return { items: payload, meta: null };
  }
  if (payload?.data && Array.isArray(payload.data)) {
    // payload looks like { data: [...], meta: {...} } OR { status,message,data: [...] }
    return { items: payload.data, meta: payload.meta ?? payload.meta ?? null };
  }
  if (payload?.data && payload?.meta) {
    return { items: payload.data, meta: payload.meta };
  }
  // if wrapper {status,message,data: {...}} and data is single object => treat as items []
  if (payload?.data && !Array.isArray(payload.data)) {
    return { items: Array.isArray(payload.data) ? payload.data : [], meta: null };
  }
  // fallback
  return { items: [], meta: null };
};

const fetchClients = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      page: filters.value.page,
      per_page: filters.value.per_page,
      status: filters.value.status || undefined,
      assigned_to: filters.value.assigned_to || undefined,
      search: filters.value.search || undefined,
    };

    const res = await clientService.getClients(params);
    const normalized = normalizeResponse(res);
    clients.value = normalized.items;
    pagination.value = normalized.meta || null;

    // if the backend uses Laravel pagination shape and gave meta in data.meta
    if (!pagination.value && res?.meta) pagination.value = res.meta;
    // some APIs put pagination in data.pagination or data.meta - covered above
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || "Failed to load clients";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  perPage.value = filters.value.per_page;
  fetchClients();
});

const pagesToShow = computed(() => {
  if (!pagination.value) return [];
  const current = Number(pagination.value.current_page || pagination.value.current_page || 1);
  const last = Number(pagination.value.last_page || pagination.value.last_page || 1);
  const window = 5;
  let start = Math.max(1, current - Math.floor(window / 2));
  let end = Math.min(last, start + window - 1);
  if (end - start < window - 1) start = Math.max(1, end - window + 1);
  const pages = [];
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
});

const onPerPageChange = () => {
  filters.value.per_page = perPage.value;
  filters.value.page = 1;
  fetchClients();
};

const onSearch = () => {
  filters.value.page = 1;
  fetchClients();
};

const onFilterChange = () => {
  filters.value.page = 1;
  fetchClients();
};

const goToPage = (p) => {
  if (!pagination.value) return;
  if (p < 1 || p > pagination.value.last_page) return;
  filters.value.page = p;
  fetchClients();
};

const openForm = (client = {}) => {
  formClient.value = { ...client };
  formOpen.value = true;
};

const closeForm = () => {
  formOpen.value = false;
  formClient.value = {};
};

const viewClient = (id) => {
  router.push(`/clients/${id}`);
};

const deleteClient = async (client) => {
  if (!confirm(`Are you sure you want to delete ${client.name}?`)) return;
  try {
    await clientService.deleteClient(client.id);
    // remove locally
    clients.value = clients.value.filter(c => c.id !== client.id);
    // if page became empty, move one page back
    if (pagination.value && clients.value.length === 0 && pagination.value.current_page > 1) {
      filters.value.page = pagination.value.current_page - 1;
      await fetchClients();
    }
  } catch (e) {
    alert(e.response?.data?.message || "Failed to delete client");
  }
};

const restoreClient = async (client) => {
  if (!confirm(`Are you sure you want to restore ${client.name}?`)) return;
  try {
    await clientService.restoreClient(client.id);
    await fetchClients();
  } catch (e) {
    alert(e.response?.data?.message || "Failed to restore client");
  }
};

// onSaved receives created/updated client (from modal)
const onSaved = async (createdOrUpdated) => {
  const clientObj = createdOrUpdated?.data ?? createdOrUpdated;
  if (!clientObj || !clientObj.id) {
    // fallback: refetch current page
    await fetchClients();
    closeForm();
    return;
  }

  // if this id exists locally -> update it
  const idx = clients.value.findIndex(c => String(c.id) === String(clientObj.id));
  if (idx !== -1) {
    clients.value.splice(idx, 1, clientObj);
    closeForm();
    return;
  }

  // creation: safest is to reset to page 1 and re-fetch to match server ordering
  filters.value.page = 1;
  await fetchClients();
  closeForm();
};
</script>


