import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Perk, PerkFormData } from "@/schemas/perk.schema";

export const usePerksAPI = () => {
    const [loading, setLoading] = useState(false);

    const fetchPerks = useCallback(async (courtId: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/admin/courts/${courtId}/perks`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch perks:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const createPerk = useCallback(async (courtId: string, data: PerkFormData) => {
        setLoading(true);
        try {
            const response = await api.post(`/api/admin/courts/${courtId}/perks`, { perk: data });
            return response.data;
        } catch (error) {
            console.error("Failed to create perk:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePerk = useCallback(async (courtId: string, perkId: string, data: PerkFormData) => {
        setLoading(true);
        try {
            const response = await api.put(`/api/admin/courts/${courtId}/perks/${perkId}`, { perk: data });
            return response.data;
        } catch (error) {
            console.error("Failed to update perk:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePerk = useCallback(async (courtId: string, perkId: string) => {
        setLoading(true);
        try {
            await api.delete(`/api/admin/courts/${courtId}/perks/${perkId}`);
        } catch (error) {
            console.error("Failed to delete perk:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const reorderPerks = useCallback(async (courtId: string, perkIds: string[]) => {
        setLoading(true);
        try {
            await api.patch(`/api/admin/courts/${courtId}/perks/reorder`, { perks: perkIds });
        } catch (error) {
            console.error("Failed to reorder perks:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        fetchPerks,
        createPerk,
        updatePerk,
        deletePerk,
        reorderPerks,
    };
};
