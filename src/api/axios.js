import axios from 'axios';
// const API_BASE_URL = import.meta.env.VITE_API_URL || "https://5e5b-139-228-40-7.ngrok-free.app/api";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const STORAGE_BASE_URL = API_BASE_URL.replace('/api', '') + '/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
});

let loadingCallbacks = { show: null, hide: null };

// Setup loading interceptor
export const setupLoadingInterceptor = (showLoading, hideLoading) => {
  loadingCallbacks.show = showLoading;
  loadingCallbacks.hide = hideLoading;
};

// Request interceptor — attach token & show loading
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Show loading
    if (loadingCallbacks.show) {
      loadingCallbacks.show();
    }

    return config;
  },
  (error) => {
    // Hide loading on error
    if (loadingCallbacks.hide) {
      loadingCallbacks.hide();
    }
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 & hide loading
api.interceptors.response.use(
  (response) => {
    // Hide loading on success
    if (loadingCallbacks.hide) {
      loadingCallbacks.hide();
    }
    return response;
  },
  (error) => {
    // Hide loading on error
    if (loadingCallbacks.hide) {
      loadingCallbacks.hide();
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Redirect to landing page if not already there and not on logout page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/logout' && currentPath !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
