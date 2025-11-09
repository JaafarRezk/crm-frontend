<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      class="bg-white shadow-lg w-64 flex-shrink-0 hidden md:flex flex-col"
    >
      <div class="h-16 flex items-center justify-center border-b">
        <h1 class="text-lg font-bold text-blue-600">CRM Dashboard</h1>
      </div>

      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-3 py-2 rounded-lg hover:bg-blue-50 transition"
          :class="{
            'bg-blue-100 text-blue-700 font-semibold': isActive(item.path),
          }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-2" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t p-4">
        <button
          @click="logout"
          class="flex items-center w-full px-3 py-2 text-red-600 rounded hover:bg-red-50"
        >
          <LogOut class="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <header
        class="bg-white shadow-sm h-16 flex items-center justify-between px-4 border-b"
      >
        <div class="flex items-center space-x-2">
          <button class="md:hidden" @click="toggleSidebar">
            <Menu class="w-6 h-6" />
          </button>
          <h2 class="text-lg font-semibold">{{ currentTitle }}</h2>
        </div>

        <div class="flex items-center space-x-3">
          <div
            class="flex items-center space-x-3 cursor-pointer"
            @click="goToProfile"
            title="View profile"
          >
            <span class="text-gray-700 font-medium hover:text-blue-600">
              {{ auth.user?.name || 'User' }}
            </span>
            <img
              :src="avatarUrl"
              :alt="auth.user?.name || 'avatar'"
              class="w-8 h-8 rounded-full border"
            />
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
        @click="sidebarOpen = false"
      ></div>
    </transition>

    <!-- Mobile Sidebar -->
    <transition name="slide">
      <aside
        v-if="sidebarOpen"
        class="fixed z-40 inset-y-0 left-0 bg-white w-64 p-4 shadow-lg md:hidden"
      >
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-lg font-bold text-blue-600">CRM Dashboard</h1>
          <button @click="sidebarOpen = false">
            <X class="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav class="space-y-2">
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center px-3 py-2 rounded-lg hover:bg-blue-50"
            @click="sidebarOpen = false"
            :class="{
              'bg-blue-100 text-blue-700 font-semibold': isActive(item.path),
            }"
          >
            <component :is="item.icon" class="w-5 h-5 mr-2" />
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  Home,
  Users,
  MessageSquare,
  Bell,
  Settings,
  ClipboardList,
  LogOut,
  Menu,
  X,
  FileText,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const sidebarOpen = ref(false);
const toggleSidebar = () => (sidebarOpen.value = !sidebarOpen.value);

const logout = async () => {
  await auth.logout();
  router.push('/login');
};

const goToProfile = () => {
  router.push('/profile');
};

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Clients', path: '/clients', icon: Users },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Communications', path: '/communications', icon: MessageSquare },
  { label: 'Follow-ups', path: '/follow-ups', icon: ClipboardList },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Exports', path: '/exports', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const currentTitle = computed(() => {
  const active = menuItems.find((item) => route.path.startsWith(item.path));
  return active ? active.label : 'Dashboard';
});

const avatarUrl = computed(() => {
  const name = auth.user?.name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&rounded=true&size=128`;
});

const isActive = (path) => route.path.startsWith(path);

onMounted(() => {
  auth.restoreSession?.();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
