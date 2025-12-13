import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/lib/api";

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Set auth state
            setAuth: ({ user, accessToken }) => {
                set({
                    user,
                    accessToken,
                    isAuthenticated: true,
                    error: null,
                });
            },
            
            register: async (userData) => {
                set({ isLoading: true });

                try {
                    const res = await authAPI.register(userData);
                    const { user, accessToken } = res.data.data;

                    get().setAuth({ user, accessToken });

                    set({ isLoading: false });
                    return { success: true };
                } catch (err) {
                    const message = err.response?.data?.message || "Registration failed";
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            // Login
            login: async (credentials) => {
                set({ isLoading: true });

                try {
                    const res = await authAPI.login(credentials);
                    const { user, accessToken } = res.data.data;

                    get().setAuth({ user, accessToken });

                    set({ isLoading: false });
                    return { success: true };
                } catch (err) {
                    const message = err.response?.data?.message || "Login failed";
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            // Logout
            logout: async () => {
                try {
                    await authAPI.logout();
                } catch { }

                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            // Refresh access token
            refreshAccessToken: async () => {
                try {
                    const res = await authAPI.refresh();
                    const { accessToken, user } = res.data.data;

                    get().setAuth({ user, accessToken });

                    return accessToken;
                } catch (err) {
                    get().logout();
                    return null;
                }
            },
        }),

        {
            name: "auth-storage", // localStorage key
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
