'use client';
import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export default function useSilentRefresh() {
    const { accessToken, isAuthenticated, refreshAccessToken } = useAuthStore();

    useEffect(() => {
        //Only refresh if user WAS logged in before
        if (!accessToken && isAuthenticated) {
            refreshAccessToken().catch((err) => { console.error(err) });
        }
    }, [accessToken, isAuthenticated, refreshAccessToken]);
}
