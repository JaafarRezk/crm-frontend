// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, 
});

const getAccessToken = () => localStorage.getItem('access_token');
const setAccessToken = (token) => {
  if (token) localStorage.setItem('access_token', token);
  else localStorage.removeItem('access_token');
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    const skipUrls = ['/login', '/register', '/refresh'];
    if (skipUrls.some((u) => originalRequest.url?.includes(u))) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const r = await refreshClient.post('/refresh'); // backend: /api/refresh
      let newToken = null;
      if (r.data?.data?.access_token) newToken = r.data.data.access_token;
      else if (r.data?.access_token) newToken = r.data.access_token;
      else if (r.data?.token) newToken = r.data.token;

      if (!newToken) {
        throw new Error('No refresh token returned');
      }

      setAccessToken(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      isRefreshing = false;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    }
  }
);

function clearSessionAndRedirect() {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  } catch (e) {
    // ignore
  }
  window.location.href = '/login';
}

export default api;

