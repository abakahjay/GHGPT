import axios from "axios";
import { API_URL } from "./config";

const API = axios.create({
    baseURL: API_URL,
    // withCredentials: true,
});

// Attach the stored JWT to every request unless the caller set its own header.
API.interceptors.request.use((config) => {
    if (!config.headers?.Authorization) {
        try {
            const token = JSON.parse(localStorage.getItem("user-info"))?.token;
            if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch {
            // Corrupt storage is handled by useAuthStore on load.
        }
    }
    return config;
});

export default API;
