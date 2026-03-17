"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Statistics } from "@/schemas/statistics.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useStatisticsAPI() {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatistics = useCallback(async (params?: { days?: number; from?: string; to?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/statistics${query}`);
            setStatistics(response.data);
            return { success: true, data: response.data as Statistics };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch statistics");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        statistics,
        loading,
        error,
        fetchStatistics,
    };
}
