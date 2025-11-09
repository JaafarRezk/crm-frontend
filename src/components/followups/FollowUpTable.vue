<template>
  <div v-if="items.length" class="bg-white shadow rounded border overflow-x-auto">
    <table class="min-w-full">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-2 text-left text-gray-600 text-sm">Client</th>
          <th class="px-4 py-2 text-left text-gray-600 text-sm">Due Date</th>
          <th class="px-4 py-2 text-left text-gray-600 text-sm">Status</th>
          <th class="px-4 py-2 text-left text-gray-600 text-sm">Priority</th>
          <th class="px-4 py-2 text-left text-gray-600 text-sm">Notes</th>
          <th class="px-4 py-2 text-center text-gray-600 text-sm">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="f in items" :key="f.id" class="border-b hover:bg-gray-50">
          <td class="px-4 py-2">{{ f.client?.name }}</td>
          <td class="px-4 py-2">{{ formatDate(f.due_date) }}</td>
          <td class="px-4 py-2 capitalize"><span :class="statusClass(f.status)" class="px-2 py-1 rounded text-xs">{{ f.status }}</span></td>
          <td class="px-4 py-2 capitalize">{{ f.priority || 'normal' }}</td>
          <td class="px-4 py-2">{{ f.notes || '—' }}</td>
          <td class="px-4 py-2 text-center">
            <div class="flex justify-center gap-2">
              <button @click="$emit('edit', f)" class="px-2 py-1 bg-yellow-400 text-white rounded">Edit</button>
              <button @click="$emit('delete', f.id)" class="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
              <button v-if="f.deleted_at" @click="$emit('restore', f.id)" class="px-2 py-1 bg-green-600 text-white rounded">Restore</button>
              <button v-if="f.status !== 'completed'" @click="$emit('complete', f.id)" class="px-2 py-1 bg-blue-600 text-white rounded">Complete</button>
              <button v-if="f.status !== 'cancelled'" @click="$emit('cancel', f.id)" class="px-2 py-1 bg-gray-500 text-white rounded">Cancel</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="pagination" class="flex justify-between mt-4">
      <button :disabled="pagination.current_page === 1" @click="$emit('go-to-page', pagination.current_page - 1)" class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
      <div class="flex gap-2">
        <button v-for="p in pages" :key="p" @click="$emit('go-to-page', p)" :class="['px-3 py-1 border rounded', { 'bg-blue-600 text-white': p === pagination.current_page }]">{{ p }}</button>
      </div>
      <button :disabled="pagination.current_page === pagination.last_page" @click="$emit('go-to-page', pagination.current_page + 1)" class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
    </div>
  </div>

  <div v-else class="text-center py-4 text-gray-500">No follow-ups found.</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: Array,
  pagination: Object,
});
const emit = defineEmits(['edit','delete','restore','complete','cancel','go-to-page']);

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

const statusClass = (s) => ({
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}[s] || '');

const pages = computed(() => {
  if (!props.pagination) return [];
  const { current_page, last_page } = props.pagination;
  const arr = [];
  for (let p = current_page - 2; p <= current_page + 2; p++) if (p >= 1 && p <= last_page) arr.push(p);
  return arr;
});
</script>
