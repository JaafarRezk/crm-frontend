<template>
  <div>
    <h1 class="text-2xl font-semibold mb-4">User Details</h1>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="user">
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Phone:</strong> {{ user.phone || '-' }}</p>
      <p><strong>Type:</strong> {{ user.user_type }}</p>
      <p><strong>Last Login:</strong> {{ user.last_login || '-' }}</p>

      <button @click="assignRole('admin')" class="text-blue-600 mt-2">Make Admin</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../../stores/user';

const route = useRoute();
const store = useUserStore();

const user = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchUser = async () => {
  loading.value = true;
  error.value = null;
  try {
    user.value = await store.fetchUser(route.params.id);
  } catch (err) {
    error.value = err.message || 'Failed to load user';
  } finally {
    loading.value = false;
  }
};

const assignRole = async (role) => {
  try {
    await store.assignRole(user.value.id, role);
    alert('Role updated');
    await fetchUser();
  } catch (err) {
    alert(err.message || 'Failed to assign role');
  }
};

onMounted(fetchUser);
</script>
