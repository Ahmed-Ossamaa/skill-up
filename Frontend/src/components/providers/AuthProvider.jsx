"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import Cookies from "js-cookie";
import { FaSpinner } from "react-icons/fa";

export default function AuthProvider({ children }) {
    const { setReady, refreshAccessToken, isReady } = useAuthStore();
    const [initStarted, setInitStarted] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            if (initStarted) return;
            setInitStarted(true);

            // if user has no session (skip api calls)
            if (!Cookies.get('hasSession')) {
                setReady(true);
                return;
            }

            try {
                // Get fresh access token and user info
                await refreshAccessToken();
            } catch (error) {
                console.error('Auth: Session expired or invalid', error);
            } finally {
                setReady(true);
            }
        };

        initAuth();
    }, [refreshAccessToken, setReady, initStarted]);

    if (!isReady) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <FaSpinner className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
