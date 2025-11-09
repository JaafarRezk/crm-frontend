import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    component: () => import('../pages/Auth/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    component: () => import('../pages/Auth/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    component: () => import('../pages/Profile.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/', redirect: '/dashboard' },

  // Clients
  {
    path: '/clients',
    component: () => import('../pages/Client/ClientsList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/clients/:id',
    component: () => import('../pages/Client/ClientDetails.vue'),
    meta: { requiresAuth: true },
  
  },
  // Users
  {
    path: '/users',
    component: () => import('../pages/User/UsersList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/users/:id',
    component: () => import('../pages/User/UserDetails.vue'),
    meta: { requiresAuth: true },
  },

    {
    path: '/communications',
    component:  () => import('../pages/Communications/CommunicationsPage.vue'),
    meta: { requiresAuth: true },
  },
      {
    path: '/follow-ups',
    component:  () => import('../pages/FollowUps/FollowUpsPage.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 🔒 Route Guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  auth.restoreSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && auth.isAuthenticated) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
