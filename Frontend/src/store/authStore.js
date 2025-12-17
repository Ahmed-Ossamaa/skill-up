import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/lib/api";

const useAuthStore = create(
    persist(
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
            
            // Register
            register: async (userData) => {
                set({ isLoading: true, error: null });

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
                set({ isLoading: true, error: null });

                try {
                    const res = await authAPI.login(credentials);
                    const { user, accessToken } = res.data.data;

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

                    get().setAuth({ user, accessToken });
                    return accessToken;
                } catch (err) {
                    console.error('Refresh token error:', err);
                    // Clear state but mark ready so UI can respond
                    set({ user: null, accessToken: null, isAuthenticated: false, isReady: true });
                    return null;
                }
            },

            // Hydrate (call on app init)
            hydrate: async () => {
                set({ isLoading: true });
                try {
                    await get().refreshAccessToken();
                } catch (err) {
                    console.error('Hydration failed:', err);
                } finally {
                    set({ isLoading: false, isReady: true });
                }
            },

            // Update user info
            updateUser: (userData) => {
                set({ user: { ...get().user, ...userData } });
            },

            // Clear error
            clearError: () => set({ error: null }),
        }),

        {
            name: "auth-storage", 
            partialize: (state) => ({
                user: state.user,
            }),
        }
    )
);

export default useAuthStore;