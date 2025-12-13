"use client";

import useSilentRefresh from "@/hooks/useSilentRefresh";

export default function AuthProvider({ children }) {
    useSilentRefresh();
    return <>{children}</>;
}
