import axiosInstance from "../api/api";


export const authServices={
    register: async (email, password) => {
        const res = await axiosInstance.post('auth/register', { email, password });
        return res.data;
    },
    login: async (email, password) => {
        const res = await axiosInstance.post('auth/login', { email, password });
        return res.data;
    },
    logout: async () => {
        const res = await axiosInstance.post('auth/logout');
        return res.data;
    }

}


