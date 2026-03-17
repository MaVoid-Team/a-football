import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { PromoCode, PromoCodeFormData, PromoCodeValidationData, PromoCodeValidationResponse } from "@/schemas/promo-code.schema";

export const usePromoCodesAPI = () => {
    const [loading, setLoading] = useState(false);

    const fetchPromoCodes = useCallback(async (branchId: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/admin/branches/${branchId}/promo_codes`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch promo codes:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const createPromoCode = useCallback(async (branchId: string, data: PromoCodeFormData) => {
        setLoading(true);
        try {
            const response = await api.post(`/api/admin/branches/${branchId}/promo_codes`, { promo_code: data });
            return response.data;
        } catch (error) {
            console.error("Failed to create promo code:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePromoCode = useCallback(async (branchId: string, promoCodeId: string, data: PromoCodeFormData) => {
        setLoading(true);
        try {
            const response = await api.put(`/api/admin/branches/${branchId}/promo_codes/${promoCodeId}`, { promo_code: data });
            return response.data;
        } catch (error) {
            console.error("Failed to update promo code:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePromoCode = useCallback(async (branchId: string, promoCodeId: string) => {
        setLoading(true);
        try {
            await api.delete(`/api/admin/branches/${branchId}/promo_codes/${promoCodeId}`);
        } catch (error) {
            console.error("Failed to delete promo code:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const validatePromoCode = useCallback(async (branchId: string, data: PromoCodeValidationData): Promise<PromoCodeValidationResponse> => {
        setLoading(true);
        try {
            const response = await api.post(`/api/admin/branches/${branchId}/promo_codes/validate`, data);
            return response.data;
        } catch (error) {
            console.error("Failed to validate promo code:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        fetchPromoCodes,
        createPromoCode,
        updatePromoCode,
        deletePromoCode,
        validatePromoCode,
    };
};
