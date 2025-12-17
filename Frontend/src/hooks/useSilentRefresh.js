'use client';
import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";

export default function useSilentRefresh() {
    const { isReady, hydrate } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            // Only hydrate if we haven't yet
            if (!isReady) {
                try {
                    await hydrate();
                } catch (error) {
                    console.error('Failed to hydrate auth on init:', error);
                }
            }
            setIsInitialized(true);
        };

        initAuth();
    }, [isReady, hydrate]);

    return isInitialized;
}

