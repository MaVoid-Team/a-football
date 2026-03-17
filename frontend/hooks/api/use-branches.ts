"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Branch, BranchFormData } from "@/schemas/branch.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useBranchesAPI() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [branch, setBranch] = useState<Branch | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Flatten JSON:API
    const flattenResource = (resource: any): Branch => {
        return {
            id: resource.id,
            ...resource.attributes,
        };
    };

    const fetchBranches = useCallback(async (params?: { page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/branches${query}`);

            if (response.data?.data) {
                setBranches(response.data.data.map(flattenResource));
            }

            // Read headers for pagination
            const totalCount = Number(response.headers["x-total-count"] || 0);
            const page = Number(response.headers["x-page"] || 1);
            const perPage = Number(response.headers["x-per-page"] || 25);
            const totalPages = Number(response.headers["x-total-pages"] || 1);

            setPagination({ totalCount, page, perPage, totalPages });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch branches");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBranch = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/branches/${id}`);
            if (response.data?.data) {
                const flatBranch = flattenResource(response.data.data);
                setBranch(flatBranch);
                return { success: true, data: flatBranch };
            }
            return { success: false };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch branch");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createBranch = async (data: BranchFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/admin/branches", { branch: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create branch");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updateBranch = async (id: string, data: Partial<BranchFormData>) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/branches/${id}`, { branch: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to update branch");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const deleteBranch = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin/branches/${id}`);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete branch");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const fetchPublicBranches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/branches");
            if (response.data?.data) {
                setBranches(response.data.data.map(flattenResource));
            }
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch branches");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPublicBranch = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/branches/${id}`);
            if (response.data?.data) {
                const flatBranch = flattenResource(response.data.data);
                setBranch(flatBranch);
                return { success: true, data: flatBranch };
            }
            return { success: false };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch branch");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        branches,
        branch,
        pagination,
        loading,
        error,
        fetchBranches,
        fetchBranch,
        createBranch,
        updateBranch,
        deleteBranch,
        fetchPublicBranches,
        fetchPublicBranch,
    };
}
