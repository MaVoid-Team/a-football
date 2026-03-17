"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Admin } from "@/schemas/admin.schema";

interface AuthContextType {
    admin: Admin | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (token: string, admin: Admin) => void;
    clearAuth: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("auth_token");
        const storedAdminStr = localStorage.getItem("auth_admin");

        if (storedToken && storedAdminStr) {
            try {
                const storedAdmin = JSON.parse(storedAdminStr) as Admin;
                setToken(storedToken);
                setAdmin(storedAdmin);
            } catch (e) {
                localStorage.removeItem("auth_token");
                localStorage.removeItem("auth_admin");
            }
        }
        setLoading(false);
    }, []);

    const setAuth = (newToken: string, newAdmin: Admin) => {
        localStorage.setItem("auth_token", newToken);
        localStorage.setItem("auth_admin", JSON.stringify(newAdmin));
        setToken(newToken);
        setAdmin(newAdmin);
    };

    const clearAuth = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_admin");
        setToken(null);
        setAdmin(null);
    };

    return (
        <AuthContext.Provider
            value={{
                admin,
                token,
                isAuthenticated: !!token,
                setAuth,
                clearAuth,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}
