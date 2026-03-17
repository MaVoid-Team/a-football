"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Package, PackageFormData } from "@/schemas/package.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function usePackagesAPI() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [packageItem, setPackageItem] = useState<Package | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): Package => ({
        id: resource.id,
        ...resource.attributes,
    });

    const fetchAdminPackages = useCallback(async (params?: { branch_id?: number; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/packages${query}`);

            if (response.data?.data) {
                setPackages(response.data.data.map(flattenResource));
            }

            const totalCount = Number(response.headers["x-total-count"] || 0);
            const page = Number(response.headers["x-page"] || 1);
            const perPage = Number(response.headers["x-per-page"] || 25);
            const totalPages = Number(response.headers["x-total-pages"] || 1);

            setPagination({ totalCount, page, perPage, totalPages });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch packages");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPublicPackages = useCallback(async (params?: { branch_id?: number; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        console.log('usePackagesAPI - fetchPublicPackages called with params:', params);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/packages${query}`);
            console.log('usePackagesAPI - response:', response);

            const pkgs = response.data?.data ? response.data.data.map(flattenResource) : [];
            console.log('usePackagesAPI - flattened packages:', pkgs);
            setPackages(pkgs);

            setPagination(null);
            return { success: true, data: pkgs };
        } catch (err: any) {
            console.error('usePackagesAPI - error:', err);
            setPackages([]);
            setError(err.response?.data?.error || "Failed to fetch packages");
            return { success: false, error: err, data: [] as Package[] };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPackage = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/packages/${id}`);
            if (response.data?.data) {
                const flatPackage = flattenResource(response.data.data);
                setPackageItem(flatPackage);
                return { success: true, data: flatPackage };
            }
            return { success: false };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch package");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createPackage = async (data: PackageFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/admin/packages", { package: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create package");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updatePackage = async (id: string, data: Partial<PackageFormData>) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/packages/${id}`, { package: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to update package");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const deletePackage = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin/packages/${id}`);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete package");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        packages,
        packageItem,
        pagination,
        loading,
        error,
        fetchAdminPackages,
        fetchPublicPackages,
        fetchPackage,
        createPackage,
        updatePackage,
        deletePackage,
    };
}
