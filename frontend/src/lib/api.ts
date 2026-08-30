import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token from cookies (with localStorage fallback)
api.interceptors.request.use(
  (config) => {
    const token =
      Cookies.get('jwt') ||
      Cookies.get('token') ||
      (typeof window !== 'undefined' ? localStorage.getItem('jwt') : null);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;