<template>
  <div class="bg-white rounded-2xl shadow p-6 space-y-6">
    <!-- 🔍 Filters + Actions -->
    <div class="flex flex-col sm:flex-row justify-between gap-3 items-center">
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <input
          v-model="filters.search"
          @input="debouncedLoad"
          type="text"
          placeholder="Search communications..."
          class="w-full sm:w-64 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <select
          v-model="filters.type"
          @change="load"
          class="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          <option value="email">Email</option>
          <option value="call">Call</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>

      <div class="flex gap-2">
        <button
          @click="openCreateForm"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Communication
        </button>
        <button
          @click="load"
          class="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- 📋 Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-50">
          <tr class="text-gray-600 text-sm">
            <th class="px-4 py-2 text-left">Type</th>
            <th class="px-4 py-2 text-left">Date</th>
            <th class="px-4 py-2 text-left">Notes</th>
            <th class="px-4 py-2 text-left">Created By</th>
            <th class="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="c in filteredItems"
            :key="c.id"
            class="border-t hover:bg-gray-50 transition"
          >
            <td class="px-4 py-2 font-medium capitalize">{{ c.type }}</td>
            <td class="px-4 py-2">{{ formatDate(c.date) }}</td>
            <td class="px-4 py-2 text-gray-600">{{ c.notes || '—' }}</td>
            <td class="px-4 py-2 text-gray-500">{{ c.creator?.name || '—' }}</td>
            <td class="px-4 py-2 text-center space-x-2">
              <button
                @click="onEdit(c)"
                class="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                v-if="!c.deleted_at"
                @click="onDelete(c)"
                class="text-red-600 hover:underline"
              >
                Delete
              </button>
              <button
                v-else
                @click="onRestore(c)"
                class="text-green-600 hover:underline"
              >
                Restore
              </button>
            </td>
          </tr>

          <tr v-if="!filteredItems.length">
            <td colspan="5" class="text-center text-gray-500 py-6">
              No communications found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ⏳ Loading -->
    <div v-if="loading" class="flex justify-center py-4">
      <div class="loader"></div>
    </div>

    <!-- ✏️ Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 shadow-lg w-full max-w-md space-y-4">
        <h3 class="text-lg font-semibold">
          {{ editingItem ? 'Edit Communication' : 'Add Communication' }}
        </h3>

        <div class="space-y-3">
          <select
            v-model="form.type"
            class="border rounded-lg w-full px-3 py-2"
          >
            <option value="">Select Type</option>
            <option value="email">Email</option>
            <option value="call">Call</option>
            <option value="meeting">Meeting</option>
          </select>

          <input
            type="date"
            v-model="form.date"
            class="border rounded-lg w-full px-3 py-2"
          />

          <textarea
            v-model="form.notes"
            placeholder="Notes..."
            class="border rounded-lg w-full px-3 py-2 h-24"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button @click="closeModal" class="px-3 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            @click="save"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCommunicationStore } from '../../stores/communicationStore';
import debounce from 'lodash.debounce';

const props = defineProps({
  clientId: { type: [String, Number], required: true },
});

const store = useCommunicationStore();
const items = ref([]);
const loading = ref(false);
const error = ref(null);
const showModal = ref(false);
const editingItem = ref(null);

const filters = ref({
  search: '',
  type: '',
});

const form = ref({
  type: '',
  date: '',
  notes: '',
});

const load = async () => {
  loading.value = true;
  error.value = null;
  try {
    await store.fetchForClient(props.clientId, filters.value);
    items.value = store.items;
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to load communications';
  } finally {
    loading.value = false;
  }
};

const debouncedLoad = debounce(load, 400);

const filteredItems = computed(() => {
  let list = items.value || [];
  if (filters.value.type)
    list = list.filter((i) => i.type === filters.value.type);
  if (filters.value.search)
    list = list.filter((i) =>
      i.notes?.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  return list;
});

const openCreateForm = () => {
  editingItem.value = null;
  form.value = { type: '', date: '', notes: '' };
  showModal.value = true;
};

const onEdit = (c) => {
  editingItem.value = c;
  form.value = { type: c.type, date: c.date, notes: c.notes };
  showModal.value = true;
};

const onDelete = async (c) => {
  if (!confirm('Are you sure to delete this communication?')) return;
  await store.remove(props.clientId, c.id);
  load();
};

const onRestore = async (c) => {
  await store.restore(props.clientId, c.id);
  load();
};

const closeModal = () => (showModal.value = false);

const save = async () => {
  if (!form.value.type || !form.value.date) {
    alert('Type and Date are required');
    return;
  }
  if (editingItem.value) {
    await store.update(props.clientId, editingItem.value.id, form.value);
  } else {
    await store.create(props.clientId, form.value);
  }
  showModal.value = false;
  load();
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString() : '-';

onMounted(load);
</script>

<style scoped>
.loader {
  border: 4px solid #eee;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
