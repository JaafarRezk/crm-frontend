<template>
  <div class="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-semibold mb-6 text-blue-600">Profile</h2>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else>
      <div class="flex items-center space-x-4 mb-6">
        <img
          :src="avatarUrl"
          alt="avatar"
          class="w-20 h-20 rounded-full border"
        />
        <div>
          <h3 class="text-xl font-semibold text-gray-800">{{ user.name }}</h3>
          <p class="text-gray-500">{{ user.email }}</p>
          <p class="text-gray-500 capitalize">Role: {{ user.user_type }}</p>
        </div>
      </div>

      <div class="border-t pt-4 space-y-2 text-gray-700">
        <p><strong>Phone:</strong> {{ user.phone || "—" }}</p>
        <p><strong>Last login:</strong> {{ user.last_login }}</p>
        <p><strong>Created at:</strong> {{ user.created_at }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import api from "../services/api"; // fallback if you want direct call

const auth = useAuthStore();
const user = ref(auth.user ? { ...auth.user } : {});
const loading = ref(true);
const error = ref(null);

const avatarUrl = computed(() => {
  const name = user.value?.name || auth.user?.name || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&rounded=true&size=128`;
});

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    if (auth.getUser) {
      const res = await auth.getUser(); 
      user.value = auth.user ? { ...auth.user } : (res || {});
    } else {
      const res = await api.get("/user");
      user.value = res.data?.data || {};
      auth.user = user.value;
      localStorage.setItem("user", JSON.stringify(user.value));
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load user data";
  } finally {
    loading.value = false;
  }
});
</script>
