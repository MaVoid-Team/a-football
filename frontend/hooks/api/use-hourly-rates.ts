"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { HourlyRateFormData } from "@/schemas/hourly-rate.schema";

export function useHourlyRatesAPI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHourlyRates = useCallback(async (courtId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/courts/${courtId}/hourly_rates`);
            return { success: true, data: response.data?.data || [] };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch hourly rates");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createHourlyRate = useCallback(async (courtId: string, data: HourlyRateFormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/api/admin/courts/${courtId}/hourly_rates`, {
                hourly_rate: data,
            });
            return { success: true, data: response.data?.data };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create hourly rate");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateHourlyRate = useCallback(async (courtId: string, id: string, data: Partial<HourlyRateFormData>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/api/admin/courts/${courtId}/hourly_rates/${id}`, {
                hourly_rate: data,
            });
            return { success: true, data: response.data?.data };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to update hourly rate");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteHourlyRate = useCallback(async (courtId: string, id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin/courts/${courtId}/hourly_rates/${id}`);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete hourly rate");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        fetchHourlyRates,
        createHourlyRate,
        updateHourlyRate,
        deleteHourlyRate,
    };
}
