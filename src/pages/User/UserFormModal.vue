<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-md rounded-lg shadow p-6 relative">
      <h2 class="text-lg font-semibold mb-4">{{ user?.id ? "Edit User" : "Add User" }}</h2>

      <form @submit.prevent="saveUser" class="space-y-3">
        <div>
          <label>Name</label>
          <input v-model="form.name" type="text" required class="w-full p-2 border rounded" />
          <p v-if="errors.name" class="text-red-600">{{ errors.name }}</p>
        </div>

        <div>
          <label>Email</label>
          <input v-model="form.email" type="email" required class="w-full p-2 border rounded" />
          <p v-if="errors.email" class="text-red-600">{{ errors.email }}</p>
        </div>

        <div v-if="!user?.id">
          <label>Password</label>
          <input v-model="form.password" type="password" required class="w-full p-2 border rounded" />
          <label>Confirm Password</label>
          <input v-model="form.password_confirmation" type="password" required class="w-full p-2 border rounded" />
        </div>

        <div>
          <label>User Type</label>
          <select v-model="form.user_type" required class="w-full p-2 border rounded">
            <option disabled value="">Select type</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="sales_rep">Sales Rep</option>
          </select>
          <p v-if="errors.user_type" class="text-red-600">{{ errors.user_type }}</p>
        </div>

        <div>
          <label>Phone (optional)</label>
          <input v-model="form.phone" class="w-full p-2 border rounded" />
          <p v-if="errors.phone" class="text-red-600">{{ errors.phone }}</p>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">{{ saving ? "Saving..." : "Save" }}</button>
        </div>
      </form>

      <button @click="$emit('close')" class="absolute top-3 right-3 text-gray-500 hover:text-black">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import userService from "../../services/userService";

const props = defineProps({ user: { type: Object, default: () => ({}) } });
const emit = defineEmits(["close", "saved"]);

const form = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  user_type: "",
  phone: "",
});
const errors = ref({});
const saving = ref(false);

watch(
  () => props.user,
  (val) => {
    form.value = {
      name: val?.name || "",
      email: val?.email || "",
      password: "",
      password_confirmation: "",
      user_type: val?.user_type || "",
      phone: val?.phone || "",
    };
    errors.value = {};
  },
  { immediate: true }
);

const saveUser = async () => {
  saving.value = true;
  errors.value = {};
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      user_type: form.value.user_type,
      phone: form.value.phone || null,
    };

    if (!props.user?.id || form.value.password) {
      payload.password = form.value.password;
      payload.password_confirmation = form.value.password_confirmation;
    }

    if (props.user?.id) {
      await userService.updateUser(props.user.id, payload);
    } else {
      await userService.createUser(payload);
    }

    emit("saved");
    emit("close");
  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = Object.fromEntries(
        Object.entries(e.response.data.errors || {}).map(([k, v]) => [k, v.join(" ")])
      );
    } else {
      alert(e.response?.data?.message || "Save failed");
    }
  } finally {
    saving.value = false;
  }
};
</script>
