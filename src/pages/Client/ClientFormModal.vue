<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
      <h2 class="text-xl font-semibold mb-4">{{ form.id ? "Edit Client" : "Add Client" }}</h2>

      <form @submit.prevent="saveClient" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Name</label>
          <input v-model.trim="form.name" type="text" required class="w-full p-2 border rounded" />
          <p v-if="errors.name" class="text-sm text-red-600 mt-1">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model.trim="form.email" type="email" class="w-full p-2 border rounded" />
          <p v-if="errors.email" class="text-sm text-red-600 mt-1">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Phone</label>
          <input v-model.trim="form.phone" type="text" class="w-full p-2 border rounded" />
          <p v-if="errors.phone" class="text-sm text-red-600 mt-1">{{ errors.phone }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Status</label>
          <select v-model="form.status" class="w-full p-2 border rounded" required>
            <option disabled value="">Select status</option>
            <option value="New">New</option>
            <option value="Active">Active</option>
            <option value="Hot">Hot</option>
            <option value="Inactive">Inactive</option>
          </select>
          <p v-if="errors.status" class="text-sm text-red-600 mt-1">{{ errors.status }}</p>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
          <button :disabled="saving" type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {{ saving ? "Saving..." : "Save" }}
          </button>
        </div>
      </form>

      <button @click="$emit('close')" class="absolute top-3 right-3 text-gray-500 hover:text-black">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import clientService from "../../services/clientService";

const props = defineProps({ client: { type: Object, default: () => ({}) } });
const emit = defineEmits(["close", "saved"]);

const form = ref({
  id: null,
  name: "",
  email: "",
  phone: "",
  status: "New",
});

const saving = ref(false);
const errors = ref({});

watch(
  () => props.client,
  (val) => {
    form.value = {
      id: val?.id ?? null,
      name: val?.name ?? "",
      email: val?.email ?? "",
      phone: val?.phone ?? "",
      status: val?.status ?? "New",
    };
    errors.value = {};
  },
  { immediate: true }
);

const saveClient = async () => {
  saving.value = true;
  errors.value = {};
  try {
    const payload = {
      name: form.value.name,
      email: form.value.email || null,
      phone: form.value.phone || null,
      status: form.value.status,
    };

    let result;
    if (form.value.id) {
      // update
      result = await clientService.updateClient(form.value.id, payload);
    } else {
      // create
      result = await clientService.createClient(payload);
    }

    // normalize created/updated client object
    const createdOrUpdated = result?.data ?? result;

    // emit the client so parent can update UI immediately
    emit("saved", createdOrUpdated);
    emit("close");
  } catch (e) {
    if (e.response?.status === 422 && e.response?.data?.errors) {
      errors.value = Object.fromEntries(
        Object.entries(e.response.data.errors).map(([k, v]) => [k, v.join(" ")])
      );
    } else {
      // fallback message
      const message = e.response?.data?.message || e.message || "Failed to save client";
      alert(message);
    }
  } finally {
    saving.value = false;
  }
};
</script>
