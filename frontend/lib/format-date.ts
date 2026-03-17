import { format, parseISO } from "date-fns";

/**
 * Formats a date string (e.g. "2026-03-15T09:00:00Z" or "2026-02-25") 
 * into a human-readable format.
 */
export function formatDate(dateString: string | undefined | null, dateFormat = "PPP"): string {
    if (!dateString) return "N/A";

    try {
        const date = parseISO(dateString);
        return format(date, dateFormat);
    } catch (error) {
        return dateString;
    }
}
