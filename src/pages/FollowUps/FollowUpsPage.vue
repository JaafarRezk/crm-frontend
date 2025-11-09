<template>
  <DashboardLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-700">Follow-ups</h1>
        <button @click="openModal()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Follow-up
        </button>
      </div>

      <!-- Filters Component -->
      <FollowUpFilters
        :search="search"
        :status="status"
        :per-page="perPage"
        @update-filter="onUpdateFilter"
      />

      <!-- Table Component -->
      <FollowUpTable
        :items="store.items"
        :pagination="store.pagination"
        @edit="openModal"
        @delete="store.delete"
        @restore="store.restore"
        @complete="store.markComplete"
        @cancel="store.markCancelled"
        @go-to-page="goToPage"
      />

      <!-- Modal Component -->
      <FollowUpModal
        v-if="showModal"
        :editing-item="editingItem"
        @close="closeModal"
        @save="saveForm"
      />
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import DashboardLayout from '../../layouts/AppLayout.vue';
import FollowUpFilters from '../../components/followups/FollowUpFilters.vue';
import FollowUpTable from '../../components/followups/FollowUpTable.vue';
import FollowUpModal from '../../components/followups/FollowUpModal.vue';
import { useFollowUpStore } from '../../stores/followUpStore';

const store = useFollowUpStore();

// Filters
const search = ref('');
const status = ref('');
const perPage = ref(10);
const showModal = ref(false);
const editingItem = ref(null);

const onUpdateFilter = (key, value) => {
  store.updateFilter(key, value);
};

// Modal
const openModal = (item = null) => {
  editingItem.value = item;
  showModal.value = true;
};
const closeModal = () => (showModal.value = false);

// Save (create/update)
const saveForm = async (formData) => {
  if (editingItem.value) {
    await store.update(editingItem.value.id, formData);
  } else {
    await store.create(formData);
  }
  closeModal();
};

// Pagination
const goToPage = (page) => store.updateFilter('page', page);

// Initial fetch
onMounted(() => store.fetch());
</script>
