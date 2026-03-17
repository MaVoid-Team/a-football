import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { PromoCodeValidationData, PromoCodeValidationResponse } from "@/schemas/promo-code.schema";

export const usePublicPromoCodesAPI = () => {
    const [loading, setLoading] = useState(false);

    const validatePromoCode = useCallback(async (branchId: string, data: PromoCodeValidationData): Promise<PromoCodeValidationResponse> => {
        setLoading(true);
        try {
            const response = await api.post(`/api/branches/${branchId}/promo_codes/validate`, data);
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
        validatePromoCode,
    };
};
