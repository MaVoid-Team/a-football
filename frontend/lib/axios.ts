import axios from "axios";
import { handleApiError } from "./error-handler";

// Create instance with base URL
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        // Only access localStorage if we are in the browser
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("auth_token");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors (like 401 Unauthorized, 400 Bad Request)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Intercept and throw toast globally on every API error
        handleApiError(error);
        return Promise.reject(error);
    }
);

export default api;
