"use client";

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import { Review, RatingsResponse } from "@/schemas/review.schema";
import { PaginationMeta } from "@/schemas/api.schema";
import { buildQueryString } from "@/lib/build-query-string";

export function useReviewsAPI() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [ratings, setRatings] = useState<RatingsResponse | null>(null);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const flattenResource = (resource: any): Review => ({
        id: resource.id,
        ...resource.attributes,
    });

    const fetchPublicReviews = useCallback(async (params: { court_id: number; page?: number; per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/reviews${query}`);
            if (response.data?.data) {
                setReviews(response.data.data.map(flattenResource));
            }
            const totalCount = Number(response.headers["x-total-count"] || 0);
            const page = Number(response.headers["x-page"] || 1);
            const perPage = Number(response.headers["x-per-page"] || 25);
            const totalPages = Number(response.headers["x-total-pages"] || 1);
            setPagination({ totalCount, page, perPage, totalPages });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch reviews");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAdminReviews = useCallback(async (params?: {
        court_id?: number;
        branch_id?: number;
        rating?: number;
        page?: number;
        per_page?: number;
    }) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildQueryString(params);
            const response = await api.get(`/api/admin/reviews${query}`);
            if (response.data?.data) {
                setReviews(response.data.data.map(flattenResource));
            }
            const totalCount = Number(response.headers["x-total-count"] || 0);
            const page = Number(response.headers["x-page"] || 1);
            const perPage = Number(response.headers["x-per-page"] || 25);
            const totalPages = Number(response.headers["x-total-pages"] || 1);
            setPagination({ totalCount, page, perPage, totalPages });
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch reviews");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRatings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/admin/ratings");
            setRatings(response.data);
            return { success: true, data: response.data as RatingsResponse };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to fetch ratings");
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, []);

    const createReview = async (data: {
        booking_id: string;
        user_phone: string;
        rating: number;
        body?: string;
    }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post("/api/reviews", { review: data });
            return { success: true, data: response.data };
        } catch (err: any) {
            const message =
                err.response?.data?.error ||
                err.response?.data?.errors?.[0] ||
                "Failed to submit review";
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/api/admin/reviews/${id}`);
            return { success: true };
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to delete review");
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    return {
        reviews,
        ratings,
        pagination,
        loading,
        error,
        fetchPublicReviews,
        fetchAdminReviews,
        fetchRatings,
        createReview,
        deleteReview,
    };
}
