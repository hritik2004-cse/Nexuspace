import axios from 'axios';

// The base URL for the backend API, usually set in environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    // Check for the standalone token first
    const token = localStorage.getItem('nexuspace_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback for older sessions stored inside the user object
      const storedUser = localStorage.getItem('nexuspace_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth');

    if (error.response && error.response.status === 401 && !isAuthRoute) {
      // Auto-logout the user if the token is invalid or expired
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nexuspace_user');
        localStorage.removeItem('nexuspace_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
