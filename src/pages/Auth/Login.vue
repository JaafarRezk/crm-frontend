<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-semibold mb-6 text-center">Login</h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full p-3 border rounded"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full p-3 border rounded"
        />
        <button
          type="submit"
          class="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <p class="text-center mt-4 text-sm text-gray-600">
        Don’t have an account?
        <RouterLink to="/register" class="text-blue-500 hover:underline">
          Register
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const email = ref("");
const password = ref("");
const router = useRouter();
const auth = useAuthStore();

const handleLogin = async () => {
  try {
    await auth.login({ email: email.value, password: password.value });
    router.push("/dashboard");
  } catch (error) {
    alert("Invalid credentials");
  }
};
</script>


