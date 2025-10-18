import axois from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axois.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Intercept responses
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;
            // handle 401 Unauth
            if (status === 401) {
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    }
);

export default axiosInstance;
