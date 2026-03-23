"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";
import {
    Tournament,
    TournamentCreateData,
    TournamentRegistrationData,
    TournamentMatch,
    TournamentAutoScheduleData,
    TournamentMatchScheduleData,
    TournamentMatchLockData,
} from "@/schemas/tournament.schema";

export function useTournamentsAPI() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flatten = (resource: any): Tournament => ({
        id: resource.id,
        ...resource.attributes,
    });

    const flattenMatch = (resource: any): TournamentMatch => ({
        id: resource.id,
        ...resource.attributes,
    });

    const setPaginationFromHeaders = (headers: any) => {
        const totalCount = Number(headers["x-total-count"] || 0);
        const page = Number(headers["x-page"] || 1);
        const perPage = Number(headers["x-per-page"] || 25);
        const totalPages = Number(headers["x-total-pages"] || 1);
        setPagination({ totalCount, page, perPage, totalPages });
    };

    const getApiErrorMessage = (err: any, fallback: string) => {
        const payload = err?.response?.data;
        if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
            return String(payload.errors[0]);
        }
        if (typeof payload?.error === "string" && payload.error.length > 0) {
            return payload.error;
        }
        return fallback;
    };

    const fetchPublicTournaments = useCallback(async (params?: { branch_id?: number; status?: string; page?: number; per_page?: number }, options?: { silent?: boolean }) => {
        if (!options?.silent) setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/tournaments${query}`);
            const data = response.data?.data?.map(flatten) || [];
            setTournaments(data);
            setPaginationFromHeaders(response.headers);
            return { success: true, data };
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to fetch tournaments"));
            setTournaments([]);
            return { success: false, error: err, data: [] as Tournament[] };
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }, []);

    const fetchAdminTournaments = useCallback(async (params?: { branch_id?: number; status?: string; tournament_type?: string; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/tournaments${query}`);
            const data = response.data?.data?.map(flatten) || [];
            setTournaments(data);
            setPaginationFromHeaders(response.headers);
            return { success: true, data };
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to fetch tournaments"));
            setTournaments([]);
            return { success: false, error: err, data: [] as Tournament[] };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTournament = useCallback(async (id: string, isAdmin = false, options?: { silent?: boolean }) => {
        if (!options?.silent) setLoading(true);
        setError(null);
        try {
            const endpoint = isAdmin ? `/api/admin/tournaments/${id}` : `/api/tournaments/${id}`;
            const response = await api.get(endpoint);
            const data = response.data?.data ? flatten(response.data.data) : null;
            setTournament(data);
            return { success: true, data };
        } catch (err: any) {
            setError(getApiErrorMessage(err, "Failed to fetch tournament"));
            return { success: false, error: err };
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }, []);

    const createTournament = async (payload: TournamentCreateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post("/api/admin/tournaments", { tournament: payload });
            const data = response.data?.data ? flatten(response.data.data) : null;
            return { success: true, data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to create tournament");
            setError(message);
            return { success: false, error: err, errorMessage: message };
        } finally {
            setLoading(false);
        }
    };

    const updateTournament = async (id: string, payload: Partial<TournamentCreateData>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/api/admin/tournaments/${id}`, { tournament: payload });
            const data = response.data?.data ? flatten(response.data.data) : null;
            return { success: true, data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to update tournament");
            setError(message);
            return { success: false, error: err, errorMessage: message };
        } finally {
            setLoading(false);
        }
    };

    const generateBracket = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/api/admin/tournaments/${id}/generate_bracket`);
            const data = response.data?.data ? flatten(response.data.data) : null;
            return { success: true, data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to generate bracket");
            setError(message);
            return { success: false, error: err, errorMessage: message };
        } finally {
            setLoading(false);
        }
    };

    const registerTournament = async (id: string, payload: TournamentRegistrationData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/api/tournaments/${id}/register`, { registration: payload });
            return { success: true, data: response.data?.data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to register");
            setError(message);
            return {
                success: false,
                error: err,
                errorMessage: message,
                errorCodes: err.response?.data?.error_codes || [],
            };
        } finally {
            setLoading(false);
        }
    };

    const fetchBracket = useCallback(async (id: string, isAdmin = false, options?: { silent?: boolean }) => {
        if (!options?.silent) setLoading(true);
        setError(null);
        try {
            const endpoint = isAdmin ? `/api/admin/tournaments/${id}/bracket` : `/api/tournaments/${id}/bracket`;
            const response = await api.get(endpoint);
            const bracket =
                response.data?.data?.attributes?.bracket ||
                response.data?.bracket ||
                {};
            return { success: true, data: bracket };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to fetch bracket");
            setError(message);
            return { success: false, error: err, errorMessage: message };
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }, []);

    const fetchPublicMatches = useCallback(async (tournamentId: string, options?: { silent?: boolean }) => {
        if (!options?.silent) setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/tournaments/${tournamentId}/matches`);
            const data = response.data?.data?.map(flattenMatch) || [];
            setMatches(data);
            return { success: true, data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to fetch tournament matches");
            setError(message);
            setMatches([]);
            return { success: false, error: err, errorMessage: message, data: [] as TournamentMatch[] };
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }, []);

    const fetchAdminMatches = useCallback(async (
        tournamentId: string,
        params?: { status?: string; round_number?: number; page?: number; per_page?: number },
        options?: { silent?: boolean; setState?: boolean }
    ) => {
        const shouldSetState = options?.setState !== false;

        if (!options?.silent) setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/tournaments/${tournamentId}/matches${query}`);
            const data = response.data?.data?.map(flattenMatch) || [];
            if (shouldSetState) {
                setMatches(data);
                setPaginationFromHeaders(response.headers);
            }
            return { success: true, data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to fetch tournament matches");
            setError(message);
            if (shouldSetState) setMatches([]);
            return { success: false, error: err, errorMessage: message, data: [] as TournamentMatch[] };
        } finally {
            if (!options?.silent) setLoading(false);
        }
    }, []);

    const autoScheduleTournament = async (id: string, payload: TournamentAutoScheduleData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post(`/api/admin/tournaments/${id}/auto_schedule`, { schedule: payload });
            const data = response.data?.data?.map(flattenMatch) || [];
            return { success: true, data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to auto schedule");
            setError(message);
            return { success: false, error: err, errorMessage: message, errorCodes: err.response?.data?.error_codes || [] };
        } finally {
            setLoading(false);
        }
    };

    const scheduleMatch = async (id: string, payload: TournamentMatchScheduleData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/api/admin/matches/${id}/schedule`, { match: payload });
            const data = response.data?.data ? flattenMatch(response.data.data) : null;
            return { success: true, data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to schedule match");
            setError(message);
            return { success: false, error: err, errorMessage: message, errorCodes: err.response?.data?.error_codes || [] };
        } finally {
            setLoading(false);
        }
    };

    const lockMatch = async (id: string, payload: TournamentMatchLockData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.patch(`/api/admin/matches/${id}/lock`, { match: payload });
            const data = response.data?.data ? flattenMatch(response.data.data) : null;
            return { success: true, data };
        } catch (err: any) {
            const message = getApiErrorMessage(err, "Failed to update lock");
            setError(message);
            return { success: false, error: err, errorMessage: message, errorCodes: err.response?.data?.error_codes || [] };
        } finally {
            setLoading(false);
        }
    };

    return {
        tournaments,
        tournament,
        matches,
        pagination,
        loading,
        error,
        fetchPublicTournaments,
        fetchAdminTournaments,
        fetchTournament,
        createTournament,
        updateTournament,
        generateBracket,
        registerTournament,
        fetchBracket,
        fetchPublicMatches,
        fetchAdminMatches,
        autoScheduleTournament,
        scheduleMatch,
        lockMatch,
    };
}
