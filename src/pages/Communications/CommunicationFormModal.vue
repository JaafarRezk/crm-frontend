<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-96 p-6">
      <h2 class="text-xl font-semibold mb-4">{{ communication.id ? 'Edit' : 'Add' }} Communication</h2>

      <form @submit.prevent="saveCommunication" class="space-y-3">
        <div>
          <label class="block mb-1 font-medium">Type</label>
          <select v-model="form.type" required class="w-full border px-2 py-1 rounded">
            <option value="">Select Type</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
          </select>
        </div>

        <div>
          <label class="block mb-1 font-medium">Date</label>
          <input type="datetime-local" v-model="form.date" class="w-full border px-2 py-1 rounded" />
        </div>

        <div>
          <label class="block mb-1 font-medium">Notes</label>
          <textarea v-model="form.notes" class="w-full border px-2 py-1 rounded" rows="3"></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import communicationService from '../../services/communicationService';
import { useRoute } from 'vue-router';

const props = defineProps({
  communication: { type: Object, default: () => ({}) },
  clientId: { type: Number, required: true }, // clientId ديناميكي
});
const emit = defineEmits(['close','saved']);

const form = ref({ ...props.communication });

watch(() => props.communication, (val) => {
  form.value = { ...val };
});

const saveCommunication = async () => {
  try {
    if (form.value.id) {
      await communicationService.updateCommunication(props.clientId, form.value.id, form.value);
    } else {
      await communicationService.createCommunication(props.clientId, form.value);
    }
    emit('saved');
    emit('close');
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save communication');
  }
};
</script>

