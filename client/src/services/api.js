import axios from "axios";

const DEFAULT_API_URL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:5000/api";

const getApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return DEFAULT_API_URL;
  if (process.env.NODE_ENV === "production" && envUrl.includes("localhost")) {
    return DEFAULT_API_URL;
  }
  return envUrl;
};

const API_URL = getApiUrl();

const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for sending/receiving cookies
});

// Interceptor: Attach CSRF Token
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency Locks & Queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network Errors
    if (!error.response) {
      console.error("[Axios] Network Error - Server Unreachable");
      // Toast logic can go here or in components
      return Promise.reject(error);
    }

    const { status } = error.response;
    const isAuthRoute = originalRequest.url?.includes("/auth");

    // 403 Permission Errors
    if (status === 403) {
      console.error("[Axios] 403 Forbidden:", error.response.data?.message || "Permission Denied");
      return Promise.reject(error);
    }

    // 401 Unauthorized (Trigger Refresh Queue)
    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          originalRequest._retry = true;
          // Clone safety for streams/data
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(function(resolve, reject) {
        // Call refresh endpoint
        axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
          .then((res) => {
            // Success: Queue resolves, retry original
            processQueue(null, res.data);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            // Failure: Token rotation failed or revoked
            processQueue(err, null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("nexuspace_user");
              localStorage.removeItem("nexuspace_token");
              window.location.href = "/login?expired=true";
            }
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // If already retried or it's an auth route failing, pass it down
    return Promise.reject(error);
  }
);

export default api;
