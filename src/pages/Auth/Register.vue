<template>
  <AuthLayout>
    <div class="max-w-md mx-auto bg-white shadow-lg p-6 rounded-xl">
      <h2 class="text-2xl font-semibold mb-4 text-center">Register</h2>

      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block mb-1">Name</label>
          <input v-model="form.name" class="border w-full p-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block mb-1">Email</label>
          <input v-model="form.email" type="email" class="border w-full p-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block mb-1">Password</label>
          <input v-model="form.password" type="password" class="border w-full p-2 rounded" required />
        </div>

        <div class="mb-4">
          <label class="block mb-1">Confirm Password</label>
          <input v-model="form.password_confirmation" type="password" class="border w-full p-2 rounded" required />
        </div>

        <button
          type="submit"
          class="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
          :disabled="auth.loading"
        >
          {{ auth.loading ? "Registering..." : "Register" }}
        </button>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const handleRegister = async () => {
  try {
    await auth.register(form);
    router.push("/login");
  } catch (err) {
    alert(err.response?.data?.message || "Registration failed");
  }
};
</script>
