// src/stores/auth.js
import { defineStore } from "pinia";
import authService from "../services/authService";
import router from "../router/index";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    access_token: localStorage.getItem("access_token") || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.access_token,
  },

  actions: {
    async login(credentials) {
      const res = await authService.login(credentials);
      // backend shape: res.data.data...
      const payload = res?.data || res;
      const user = payload.user || payload.data?.user;
      const token = payload.access_token || payload.data?.access_token;

      this.user = user;
      this.access_token = token;

      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return res;
    },

    async register(payload) {
      const res = await authService.register(payload);
      const data = res?.data || res;
      const user = data.user || data.data?.user;
      const token = data.access_token || data.data?.access_token;

      this.user = user;
      this.access_token = token;

      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      return res;
    },

    async logout() {
      try {
        await authService.logout();
      } catch (e) {
        console.warn("logout error (ignored):", e);
      }
      this.user = null;
      this.access_token = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      try {
        router.push("/login");
      } catch (e) {}
    },

    restoreSession() {
      const token = localStorage.getItem("access_token");
      const user = localStorage.getItem("user");
      if (token && user) {
        this.access_token = token;
        this.user = JSON.parse(user);
      }
    },

    // Explicit refresh call (can be used manually)
    async refreshToken() {
      try {
        const res = await authService.refresh();
        const payload = res?.data || res;
        const token = payload.access_token || payload.data?.access_token;
        if (token) {
          this.access_token = token;
          localStorage.setItem("access_token", token);
        }
        return token;
      } catch (e) {
        // if refresh fails force logout
        await this.logout();
        throw e;
      }
    },
  },
});
