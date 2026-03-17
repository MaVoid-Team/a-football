import { z } from "zod";

export const reviewSchema = z.object({
    id: z.string(),
    booking_id: z.string(),
    court_id: z.number(),
    branch_id: z.number(),
    reviewer_name: z.string(),
    rating: z.number().min(1).max(5),
    body: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Review = z.infer<typeof reviewSchema>;

export const reviewFormSchema = z.object({
    booking_id: z.string(),
    user_phone: z.string(),
    rating: z.number().min(1, "Please select a rating").max(5),
    body: z.string().optional(),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

export const courtRatingSchema = z.object({
    court_id: z.number(),
    court_name: z.string(),
    branch_id: z.number(),
    branch_name: z.string().nullable().optional(),
    avg_rating: z.number(),
    total_reviews: z.number(),
    distribution: z.object({
        1: z.number(),
        2: z.number(),
        3: z.number(),
        4: z.number(),
        5: z.number(),
    }),
});

export type CourtRating = z.infer<typeof courtRatingSchema>;

export const ratingsResponseSchema = z.object({
    overall_avg_rating: z.number(),
    overall_total_reviews: z.number(),
    courts: z.array(courtRatingSchema),
});

export type RatingsResponse = z.infer<typeof ratingsResponseSchema>;
