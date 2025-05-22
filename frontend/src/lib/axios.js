// lib/axios.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true, // This is crucial for cookies/sessions
});

// Add request interceptor to handle any common headers
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add any common headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get a 401 (unauthorized) error, it means the user's session expired
    if (error.response?.status === 401) {
      // Don't redirect here, let the auth store handle it
      console.log("Unauthorized request detected");
    }
    return Promise.reject(error);
  }
);