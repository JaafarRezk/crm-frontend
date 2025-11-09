<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <input
      v-model="searchVal"
      @input="debouncedSearch"
      type="text"
      placeholder="Search notes or client..."
      class="border rounded px-3 py-2"
    />

    <select v-model="statusVal" @change="emitFilter('status', statusVal)" class="border rounded px-3 py-2">
      <option value="">All statuses</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>

    <select v-model.number="perPageVal" @change="emitFilter('per_page', perPageVal)" class="border rounded px-3 py-2">
      <option :value="10">10</option>
      <option :value="15">15</option>
      <option :value="25">25</option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import debounce from 'lodash.debounce';

const props = defineProps({
  search: String,
  status: String,
  perPage: Number,
});
const emit = defineEmits(['update-filter']);

const searchVal = ref(props.search || '');
const statusVal = ref(props.status || '');
const perPageVal = ref(props.perPage || 10);

const emitFilter = (key, value) => emit('update-filter', key, value);

// Debounce search
const debouncedSearch = debounce(() => emitFilter('search', searchVal.value), 400);

// Watch props updates
watch(() => props.search, (v) => (searchVal.value = v));
watch(() => props.status, (v) => (statusVal.value = v));
watch(() => props.perPage, (v) => (perPageVal.value = v));
</script>
