"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { BlockedSlot, BlockedSlotFormData } from "@/schemas/blocked-slot.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useBlockedSlotsAPI() {
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
    const [blockedSlot, setBlockedSlot] = useState<BlockedSlot | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): BlockedSlot => ({
        id: resource.id,
        ...resource.attributes,
    });

    const fetchBlockedSlots = useCallback(async (params?: { court_id?: number; date?: string; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/blocked_slots${query}`);

            if (response.data?.data) {
                setBlockedSlots(response.data.data.map(flattenResource));
            }

            const totalCount = Number(response.headers["x-total-count"] || 0);
            const page = Number(response.headers["x-page"] || 1);
            const perPage = Number(response.headers["x-per-page"] || 25);
            const totalPages = Number(response.headers["x-total-pages"] || 1);

            setPagination({ totalCount, page, perPage, totalPages });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch blocked slots");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBlockedSlot = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/blocked_slots/${id}`);
            if (response.data?.data) {
                const flatBlockedSlot = flattenResource(response.data.data);
                setBlockedSlot(flatBlockedSlot);
                return { success: true, data: flatBlockedSlot };
            }
            return { success: false };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch blocked slot");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createBlockedSlot = async (data: BlockedSlotFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/admin/blocked_slots", { blocked_slot: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create blocked slot");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updateBlockedSlot = async (id: string, data: Partial<BlockedSlotFormData>) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/blocked_slots/${id}`, { blocked_slot: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to update blocked slot");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const deleteBlockedSlot = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin/blocked_slots/${id}`);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete blocked slot");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        blockedSlots,
        blockedSlot,
        pagination,
        loading,
        error,
        fetchBlockedSlots,
        fetchBlockedSlot,
        createBlockedSlot,
        updateBlockedSlot,
        deleteBlockedSlot,
    };
}
