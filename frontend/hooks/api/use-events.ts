"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Event, EventFormData } from "@/schemas/event.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useEventsAPI() {
    const [events, setEvents] = useState<Event[]>([]);
    const [event, setEvent] = useState<Event | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): Event => ({
        id: resource.id,
        ...resource.attributes,
    });

    const fetchAdminEvents = useCallback(async (params?: { branch_id?: number; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/events${query}`);

            if (response.data?.data) {
                setEvents(response.data.data.map(flattenResource));
            }

            const totalCount = Number(response.headers["x-total-count"] || 0);
            const page = Number(response.headers["x-page"] || 1);
            const perPage = Number(response.headers["x-per-page"] || 25);
            const totalPages = Number(response.headers["x-total-pages"] || 1);

            setPagination({ totalCount, page, perPage, totalPages });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch events");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPublicEvents = useCallback(async (params?: { branch_id?: number; upcoming?: boolean; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        console.log('useEventsAPI - fetchPublicEvents called with params:', params);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/events${query}`);
            console.log('useEventsAPI - response:', response);

            const evts = response.data?.data ? response.data.data.map(flattenResource) : [];
            console.log('useEventsAPI - flattened events:', evts);
            setEvents(evts);

            setPagination(null);
            return { success: true, data: evts };
        } catch (err: any) {
            console.error('useEventsAPI - error:', err);
            setEvents([]);
            setError(err.response?.data?.error || "Failed to fetch events");
            return { success: false, error: err, data: [] as Event[] };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEvent = useCallback(async (id: string, isAdmin = true) => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = isAdmin ? `/api/admin/events/${id}` : `/api/events/${id}`;
            const response = await api.get(endpoint);
            if (response.data?.data) {
                const flatEvent = flattenResource(response.data.data);
                setEvent(flatEvent);
                return { success: true, data: flatEvent };
            }
            return { success: false };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch event");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createEvent = async (data: EventFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post("/api/admin/events", { event: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to create event");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updateEvent = async (id: string, data: Partial<EventFormData>) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/events/${id}`, { event: data });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.errors?.[0] || "Failed to update event");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const deleteEvent = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin/events/${id}`);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete event");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        events,
        event,
        pagination,
        loading,
        error,
        fetchAdminEvents,
        fetchPublicEvents,
        fetchEvent,
        createEvent,
        updateEvent,
        deleteEvent,
    };
}
