<template>
  <transition name="fade">
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div class="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">{{ editingItem ? 'Edit Follow-up' : 'New Follow-up' }}</h2>

        <form @submit.prevent="save">
          <div class="space-y-4">
            <select v-model="form.client_id" class="border rounded w-full px-3 py-2">
              <option value="">Select client...</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>

            <input v-model="form.due_date" type="date" class="border rounded w-full px-3 py-2" />

            <select v-model="form.status" class="border rounded w-full px-3 py-2">
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <textarea v-model="form.notes" placeholder="Notes..." class="border rounded w-full px-3 py-2"></textarea>
          </div>

          <div class="flex justify-end gap-2 mt-4">
            <button type="button" @click="$emit('close')" class="px-3 py-1 border rounded">Cancel</button>
            <button type="submit" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import clientService from '../../services/clientService';

const props = defineProps({
  editingItem: Object,
});
const emit = defineEmits(['save','close']);

const form = ref({
  client_id: '',
  due_date: '',
  status: 'pending',
  notes: '',
});

const clients = ref([]);

const loadClients = async () => {
  try {
    const res = await clientService.getClients({ per_page: 100 });
    clients.value = res.data.data ?? res.data ?? [];
  } catch (e) {
    console.error(e);
  }
};

// Initialize form on mount
onMounted(() => {
  loadClients();
  if (props.editingItem) {
    form.value = {
      client_id: props.editingItem.client?.id ?? '',
      due_date: props.editingItem.due_date?.split('T')[0] ?? '',
      status: props.editingItem.status,
      notes: props.editingItem.notes ?? '',
    };
  }
});

const save = () => emit('save', { ...form.value });
</script>
