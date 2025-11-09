<template>
  <AppLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-blue-600">Users</h1>
        <button
          @click="openForm()"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      <div v-if="loading" class="text-gray-500">Loading users...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>

      <div v-else class="overflow-x-auto bg-white border rounded-lg shadow">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 border">#</th>
              <th class="px-4 py-2 border">Name</th>
              <th class="px-4 py-2 border">Email</th>
              <th class="px-4 py-2 border">Phone</th>
              <th class="px-4 py-2 border">Type</th>
              <th class="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 text-sm">
              <td class="px-4 py-2 border">{{ user.id }}</td>
              <td class="px-4 py-2 border">{{ user.name }}</td>
              <td class="px-4 py-2 border">{{ user.email }}</td>
              <td class="px-4 py-2 border">{{ user.phone || '—' }}</td>
              <td class="px-4 py-2 border capitalize">{{ user.user_type }}</td>
              <td class="px-4 py-2 border flex gap-1">
                <button
                  @click="openForm(user)"
                  class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  @click="deleteUser(user.id)"
                  class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UserFormModal
        v-if="formOpen"
        :user="formUser"
        @close="closeForm"
        @saved="fetchUsers"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import AppLayout from "../../layouts/AppLayout.vue";
import UserFormModal from "./UserFormModal.vue";
import userService from "../../services/userService";

const users = ref([]);
const loading = ref(false);
const error = ref(null);

const formOpen = ref(false);
const formUser = ref({});

const fetchUsers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await userService.getUsers();
    users.value = res.data.data || res.data;
  } catch (err) {
    error.value = err.response?.data?.message || "Failed to load users";
  } finally {
    loading.value = false;
  }
};

const openForm = (user = {}) => {
  formUser.value = { ...user };
  formOpen.value = true;
};
const closeForm = () => (formOpen.value = false);

const deleteUser = async (id) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await userService.deleteUser(id);
    await fetchUsers(); // تحديث القائمة بعد الحذف
  } catch (err) {
    alert(err.response?.data?.message || "Delete failed");
  }
};

onMounted(fetchUsers);
</script>
