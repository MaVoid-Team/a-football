"use client";

import { useState } from "react";
import playerApi from "@/lib/player-api";
import { usePlayerAuthContext } from "@/contexts/player-auth-context";
import { PlayerLoginData, PlayerRegisterData, PlayerUser } from "@/schemas/player.schema";

const flattenUser = (payload: any): PlayerUser => ({
    id: payload.data.id,
    ...payload.data.attributes,
});

export function usePlayerAuthAPI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setAuth, clearAuth } = usePlayerAuthContext();

    const login = async (data: PlayerLoginData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await playerApi.post("/api/auth/login", data);
            const token = response.data.token;
            const user = flattenUser(response.data.user);
            setAuth(token, user);
            return { success: true, user };
        } catch (err: any) {
            const message = err.response?.data?.error || "Failed to login";
            setError(message);
            return { success: false, error: err, errorMessage: message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: PlayerRegisterData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await playerApi.post("/api/auth/register", { user: data });
            const token = response.data.token;
            const user = flattenUser(response.data.user);
            setAuth(token, user);
            return { success: true, user };
        } catch (err: any) {
            const message = err.response?.data?.errors?.[0] || "Failed to register";
            setError(message);
            return { success: false, error: err, errorMessage: message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await playerApi.delete("/api/auth/logout");
        } catch (_error) {
            // Best effort only.
        } finally {
            clearAuth();
            setLoading(false);
        }
    };

    return { login, register, logout, loading, error };
}
