// src/api/client.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
});

// build full static file URL
export const getImageUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${api.defaults.baseURL}/static/icons/${path}`;
};

// Automatically attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// make sure errors always propagate correctly
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     return Promise.reject(error);
//   },
// );
