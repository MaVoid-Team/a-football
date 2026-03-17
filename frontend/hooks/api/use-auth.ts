"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { LoginFormData } from "@/schemas/auth.schema";
import { Admin } from "@/schemas/admin.schema";
import { useAuthContext } from "@/contexts/auth-context";

export function useAuthAPI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setAuth, clearAuth } = useAuthContext();

    const login = async (data: LoginFormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post("/api/admin/login", data);
            const token = response.data.token;

            // JSON:API format check
            let rawAdmin = response.data.admin;
            if (rawAdmin?.data?.attributes) {
                // Flatten json:api if needed
                rawAdmin = {
                    id: rawAdmin.data.id,
                    ...rawAdmin.data.attributes
                };
            }

            setAuth(token, rawAdmin as Admin);
            return { success: true };
        } catch (err: any) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.errors?.[0] ||
                "Failed to login. Please check your credentials."
            );
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            // Best effort to logout on server
            await api.delete("/api/admin/logout");
        } catch (e) {
            console.error("Server logout failed", e);
        } finally {
            // Regardless of server success, log out locally
            clearAuth();
            setLoading(false);
        }
    };

    return { login, logout, loading, error };
}
