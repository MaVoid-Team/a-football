"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import playerApi from "@/lib/player-api";
import { Booking, BookingFormData, BookingUpdateData } from "@/schemas/booking.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useBookingsAPI() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): Booking => ({ id: resource.id, ...resource.attributes });

    const fetchBookings = useCallback(async (
        params?: { branch_id?: number; court_id?: number; date?: string; status?: string; payment_status?: string; page?: number; per_page?: number },
        options?: { skipStateUpdate?: boolean }
    ) => {
        if (!options?.skipStateUpdate) setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/bookings${buildQueryString(params)}`);
            const fetched = response.data?.data ? response.data.data.map(flattenResource) : [];
            if (!options?.skipStateUpdate) {
                setBookings(fetched);
                setPagination({
                    totalCount:  Number(response.headers["x-total-count"]  || 0),
                    page:        Number(response.headers["x-page"]         || 1),
                    perPage:     Number(response.headers["x-per-page"]     || 25),
                    totalPages:  Number(response.headers["x-total-pages"]  || 1),
                });
            }
            return { success: true, data: fetched };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch bookings");
            return { success: false, error: err };
        } finally {
            if (!options?.skipStateUpdate) setLoading(false);
        }
    }, []);

    const fetchBooking = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/admin/bookings/${id}`);
            if (response.data?.data) {
                const flat = flattenResource(response.data.data);
                setBooking(flat);
                return { success: true, data: flat };
            }
            return { success: false };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch booking");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    }, []);

    const createBooking = async (data: BookingFormData, paymentScreenshot?: File | null) => {
        setLoading(true);
        setError(null);
        try {
            const { branch_id, ...bookingData } = data;
            const playerToken =
                typeof window !== "undefined" ? localStorage.getItem("player_auth_token") : null;
            const client = playerToken ? playerApi : api;

            if (paymentScreenshot) {
                const formData = new FormData();
                formData.append("branch_id", String(branch_id));

                Object.entries(bookingData).forEach(([key, value]) => {
                    if (key === "booking_slots_attributes" && Array.isArray(value)) {
                        value.forEach((slot: { start_time: string; end_time: string }, idx: number) => {
                            formData.append(`booking[booking_slots_attributes][${idx}][start_time]`, slot.start_time);
                            formData.append(`booking[booking_slots_attributes][${idx}][end_time]`, slot.end_time);
                        });
                    } else if (value !== undefined && value !== null && value !== "") {
                        formData.append(`booking[${key}]`, String(value));
                    }
                });

                formData.append("booking[payment_screenshot]", paymentScreenshot);

                const response = await client.post("/api/bookings", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        ...(playerToken ? { Authorization: `Bearer ${playerToken}` } : {}),
                    },
                });
                return { success: true, data: response.data };
            } else {
                const response = await client.post(
                    "/api/bookings",
                    { branch_id, booking: bookingData },
                    playerToken ? { headers: { Authorization: `Bearer ${playerToken}` } } : undefined
                );
                return { success: true, data: response.data };
            }
        } catch (err: any) {
            const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || "Failed to create booking";
            const errorCodes = err.response?.data?.error_codes || [];
            setError(msg);
            return { success: false, error: err, errorCodes, errorMessage: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateBooking = async (id: string, booking: BookingUpdateData) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/bookings/${id}`, { booking });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to update booking");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentStatus = async (id: string, payment_status: "pending" | "paid" | "failed" | "refunded") => {
        return updateBooking(id, { payment_status });
    };

    const cancelBooking = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/bookings/${id}`, { cancel: true });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to cancel booking");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    const markNoShow = async (id: string, reason?: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.patch(`/api/admin/bookings/${id}/mark_no_show`, reason ? { reason } : {});
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to mark no-show");
            return { success: false, error: err };
        } finally {
            setLoading(false);
        }
    };

    return {
        bookings,
        booking,
        pagination,
        loading,
        error,
        fetchBookings,
        fetchBooking,
        createBooking,
        updateBooking,
        updatePaymentStatus,
        cancelBooking,
        markNoShow,
    };
}
