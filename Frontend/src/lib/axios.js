import axios from 'axios';
import useAuthStore from '@/store/authStore';

const SERVER_URL = process.env.NEXT_PUBLIC_RENDER_URL || process.env.NEXT_PUBLIC_API_URL;
const baseURL = typeof window === 'undefined' 
    ? SERVER_URL 
    : '/api/v1';

const api = axios.create({
    baseURL: baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

function queueRequest(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const authStore = useAuthStore.getState();

        if (error.response?.status === 401 && !originalRequest._retry) {
            const isAuthEndpoint =
                originalRequest.url?.includes('/auth/login') ||
                originalRequest.url?.includes('/auth/register') ||
                originalRequest.url?.includes('/auth/refresh') ||
                originalRequest.url?.includes('/auth/logout');

            if (isAuthEndpoint) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve) => {
                    queueRequest((token) => {
                        originalRequest._retry = true;
                        if (originalRequest.headers.set) {
                            originalRequest.headers.set('Authorization', `Bearer ${token}`);
                        } else {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await authStore.refreshAccessToken();
                
                if (!newToken) {
                    throw new Error("Token refresh failed");
                }

                onRefreshed(newToken);

                if (originalRequest.headers.set) {
                    originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
                } else {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }
                
                return api(originalRequest);
            } catch (refreshError) {
                authStore.logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
