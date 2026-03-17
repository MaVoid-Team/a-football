"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { AvailabilityResponse } from "@/schemas/availability.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useAvailabilityAPI() {
    const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAvailability = useCallback(async (params: { branch_id: number; court_id: number; date?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/availability${query}`);
            setAvailability(response.data);
            return { success: true, data: response.data as AvailabilityResponse };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch availability");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        availability,
        loading,
        error,
        fetchAvailability,
    };
}
