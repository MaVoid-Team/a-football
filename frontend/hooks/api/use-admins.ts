"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Admin, AdminFormData, AdminUpdateData } from "@/schemas/admin.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useAdminsAPI() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): Admin => ({
        id: resource.id,
        ...resource.attributes,
    });

    const fetchAdmins = useCallback(async (params?: { page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get<any>(`/api/admin/admins${query}`);

            if (response.data?.data) {
                setAdmins(response.data.data.map(flattenResource));
            }

            const totalCount = Number(response.headers["x-total-count"] || 0);
            const page = Number(response.headers["x-page"] || 1);
            const perPage = Number(response.headers["x-per-page"] || 25);
            const totalPages = Number(response.headers["x-total-pages"] || 1);

            setPagination({ totalCount, page, perPage, totalPages });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch admins");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createAdmin = async (data: AdminFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/admin/admins", { admin: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create admin");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updateAdmin = async (id: string, data: Partial<AdminUpdateData>) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/admins/${id}`, { admin: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to update admin");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const deleteAdmin = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin/admins/${id}`);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete admin");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        admins,
        pagination,
        loading,
        error,
        fetchAdmins,
        createAdmin,
        updateAdmin,
        deleteAdmin,
    };
}
