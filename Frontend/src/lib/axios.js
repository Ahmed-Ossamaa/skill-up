import axios from 'axios';
import useAuthStore from '@/store/authStore';


const SERVER_URL = process.env.NEXT_PUBLIC_RENDER_URL || process.env.NEXT_PUBLIC_API_URL;
const baseURL = typeof window === 'undefined' 
    ? SERVER_URL 
    : '/api/v1';

const api = axios.create({
    baseURL: baseURL,  //`http://localhost:5000/api/v1` //...>for local testing
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
        const authStore = useAuthStore.getState();

        if (originalRequest.url.includes('/auth/refresh')) {
            authStore.logout(); // to clear the data in localstorage (avoiding infinite loop)
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry && authStore.user) {
            originalRequest._retry = true;

            try {
                const newToken = await authStore.refreshAccessToken();
                if (newToken) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (err) {
                authStore.logout();
                return Promise.reject(err);

            }
        }
        return Promise.reject(error);
    }
);

export default api;
