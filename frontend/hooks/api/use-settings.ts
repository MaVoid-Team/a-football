"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Setting, SettingFormData } from "@/schemas/setting.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useSettingsAPI() {
    const [setting, setSetting] = useState<Setting | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): Setting => ({
        id: resource.id,
        ...resource.attributes,
    });

    const fetchSettings = useCallback(async (params?: { branch_id?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/settings${query}`);
            if (response.data?.data) {
                const flatSetting = flattenResource(response.data.data);
                setSetting(flatSetting);
                return { success: true, data: flatSetting };
            }
            // No setting exists yet for this branch
            setSetting(null);
            return { success: true, data: null };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch settings");
            setSetting(null);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPublicSettings = useCallback(async (params?: { branch_id?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/settings${query}`);
            if (response.data?.data) {
                const flatSetting = flattenResource(response.data.data);
                setSetting(flatSetting);
                return { success: true, data: flatSetting };
            }
            // No setting exists yet for this branch
            setSetting(null);
            return { success: true, data: null };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch settings");
            setSetting(null);
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createSettings = async (data: SettingFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/admin/settings", { setting: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create settings");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (data: Partial<SettingFormData>) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch("/api/admin/settings", { setting: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to update settings");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        setting,
        loading,
        error,
        fetchSettings,
        fetchPublicSettings,
        createSettings,
        updateSettings,
    };
}
