import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Automatically attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
