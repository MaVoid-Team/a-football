/**
 * Converts an object to a URL query string, omitting undefined or null values.
 * e.g., { page: 1, branch_id: null } => "?page=1"
 */
export function buildQueryString(params?: Record<string, string | number | boolean | null | undefined>): string {
    if (!params) return "";

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
}
