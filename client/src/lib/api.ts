import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5001/api",
});

// Inject JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("btp.jwt");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// On 401 clear token (session expired)
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("btp.jwt");
    }
    return Promise.reject(err);
  }
);

export default api;