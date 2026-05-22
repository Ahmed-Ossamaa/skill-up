import { create } from "zustand";
import { authAPI } from "@/lib/api";
import Cookies from "js-cookie";

const useAuthStore = create(
    (set, get) => ({
        user: null,
        accessToken: null, // in memory only
        isAuthenticated: false,
        isReady: false, // becomes true after initial hydration
        isLoading: false,
        error: null,

        // Set auth state (in memory)
        setAuth: ({ user, accessToken }) => {
            set({
                user: user ?? null,
                accessToken: accessToken ?? null,
                isAuthenticated: !!user,
                error: null,
                isReady: true,
            });
        },

        // Mark as ready (called by AuthProvider)
        setReady: (ready) => set({ isReady: ready }),

        // Register
        register: async (userData) => {
            set({ isLoading: true, error: null });

            try {
                const res = await authAPI.register(userData);
                const { user, accessToken } = res.data.data;

                Cookies.set('hasSession', 'true', { path: '/' });
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
            set({ isLoading: true, error: null });

            try {
                const res = await authAPI.login(credentials);
                const { user, accessToken } = res.data.data;

                Cookies.set('hasSession', 'true', { path: '/' });
                get().setAuth({ user, accessToken });

                set({ isLoading: false });

                return { success: true, user };
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
            } catch (error) {
                console.error('Logout error:', error);
            }

            Cookies.remove('hasSession', { path: '/' });
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                error: null,
                isReady: true,
            });
        },

        // Refresh access token (uses HttpOnly cookie)
        refreshAccessToken: async () => {
            try {
                const res = await authAPI.refresh();
                const { accessToken, user } = res.data.data;

                Cookies.set('hasSession', 'true', { path: '/' });
                get().setAuth({ user, accessToken });
                return accessToken;
            } catch (err) {
                console.error('Refresh token error:', err);
                Cookies.remove('hasSession', { path: '/' });
                // Clear state but mark ready so UI can respond
                set({ user: null, accessToken: null, isAuthenticated: false, isReady: true });
                return null;
            }
        },

        // Update user info
        updateUser: (userData) => {
            set({ user: { ...get().user, ...userData } });
        },

        // Clear error
        clearError: () => set({ error: null }),
    })
);

export default useAuthStore;