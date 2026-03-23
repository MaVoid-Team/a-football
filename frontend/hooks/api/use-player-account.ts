"use client";

import { useState } from "react";
import playerApi from "@/lib/player-api";
import {
    PlayerNotification,
    PlayerParticipation,
    PlayerTeam,
    PlayerTeamFormData,
    PlayerUser,
} from "@/schemas/player.schema";
import { Booking } from "@/schemas/booking.schema";
import { TournamentMatch } from "@/schemas/tournament.schema";

const flattenResource = <T extends object>(resource: any): T => ({ id: resource.id, ...resource.attributes }) as T;

export function usePlayerAccountAPI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const withState = async <T,>(fn: () => Promise<T>) => {
        setLoading(true);
        setError(null);
        try {
            return await fn();
        } catch (err: any) {
            const message =
                err.response?.data?.errors?.[0] ||
                err.response?.data?.error ||
                "Request failed";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async () =>
        withState(async () => {
            const response = await playerApi.get("/api/me/profile");
            return flattenResource<PlayerUser>(response.data.data);
        });

    const updateProfile = async (payload: Partial<PlayerUser> & { password?: string }) =>
        withState(async () => {
            const response = await playerApi.patch("/api/me/profile", { user: payload });
            return flattenResource<PlayerUser>(response.data.data);
        });

    const fetchTeams = async () =>
        withState(async () => {
            const response = await playerApi.get("/api/me/teams");
            return (response.data.data || []).map((item: any) => flattenResource<PlayerTeam>(item));
        });

    const createTeam = async (payload: PlayerTeamFormData) =>
        withState(async () => {
            const response = await playerApi.post("/api/me/teams", { team: payload });
            return flattenResource<PlayerTeam>(response.data.data);
        });

    const updateTeam = async (id: string, payload: PlayerTeamFormData) =>
        withState(async () => {
            const response = await playerApi.patch(`/api/me/teams/${id}`, { team: payload });
            return flattenResource<PlayerTeam>(response.data.data);
        });

    const deleteTeam = async (id: string) =>
        withState(async () => {
            await playerApi.delete(`/api/me/teams/${id}`);
            return true;
        });

    const fetchTournaments = async () =>
        withState(async () => {
            const response = await playerApi.get("/api/me/tournaments");
            return (response.data.data || []).map((item: any) => ({ id: item.id, ...item.attributes } as PlayerParticipation));
        });

    const fetchTournamentParticipation = async (id: string) =>
        withState(async () => {
            const response = await playerApi.get(`/api/me/tournaments/${id}`);
            return { id: response.data.data.id, ...response.data.data.attributes } as PlayerParticipation;
        });

    const fetchMatches = async () =>
        withState(async () => {
            const response = await playerApi.get("/api/me/matches");
            return (response.data.data || []).map((item: any) => flattenResource<TournamentMatch>(item));
        });

    const fetchBookings = async () =>
        withState(async () => {
            const response = await playerApi.get("/api/me/bookings");
            return (response.data.data || []).map((item: any) => flattenResource<Booking>(item));
        });

    const fetchNotifications = async () =>
        withState(async () => {
            const response = await playerApi.get("/api/me/notifications");
            return (response.data.data || []).map((item: any) => flattenResource<PlayerNotification>(item));
        });

    const markNotification = async (id: string, read: boolean) =>
        withState(async () => {
            const response = await playerApi.patch(`/api/me/notifications/${id}`, { notification: { read } });
            return flattenResource<PlayerNotification>(response.data.data);
        });

    return {
        loading,
        error,
        fetchProfile,
        updateProfile,
        fetchTeams,
        createTeam,
        updateTeam,
        deleteTeam,
        fetchTournaments,
        fetchTournamentParticipation,
        fetchMatches,
        fetchBookings,
        fetchNotifications,
        markNotification,
    };
}
