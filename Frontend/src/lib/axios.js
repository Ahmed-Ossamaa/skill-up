import axios from 'axios';
import useAuthStore from '@/store/authStore';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // sends HttpOnly refresh cookie automatically
});

// Attach access token
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Refresh token on 401
api.interceptors.response.use(
    res => res,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newToken = await useAuthStore.getState().refreshAccessToken();
            if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
