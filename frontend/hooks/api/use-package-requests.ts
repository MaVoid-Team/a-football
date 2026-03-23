"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { PackageRequest, PackageRequestFormData } from "@/schemas/package-request.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function usePackageRequestsAPI() {
    const [requests, setRequests] = useState<PackageRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): PackageRequest => ({
        id: resource.id,
        ...resource.attributes,
    });

    const submitRequest = useCallback(async (data: PackageRequestFormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post("/api/package_requests", { package_request: data });
            return { success: true, data: response.data?.data };
        } catch (err: any) {
            const msg = err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to submit request";
            setError(msg);
            return { success: false, error: err, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAdminRequests = useCallback(async (params?: { branch_id?: number; status?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/package_requests${query}`);

            const fetched = response.data?.data ? response.data.data.map(flattenResource) : [];
            setRequests(fetched);

            return { success: true, data: fetched };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch requests");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateRequestStatus = useCallback(async (id: string, status: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/api/admin/package_requests/${id}`, { package_request: { status } });
            return { success: true, data: response.data?.data };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update request");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        requests,
        loading,
        error,
        submitRequest,
        fetchAdminRequests,
        updateRequestStatus,
    };
}
