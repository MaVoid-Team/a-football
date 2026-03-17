import { toast } from "sonner";
import { AxiosError } from "axios";

/**
 * Parses an AxiosError to extract a user-friendly error message,
 * based on the HTTP status code and the response payload from the Rails backend.
 */
function getErrorMessage(error: any): string {
    if (!error.response) {
        // Network error, request timeout, or server unreachable
        return "Unable to connect to the server. Please check your internet connection.";
    }

    const { status, data } = error.response;

    // The backend uses either `{ error: "message" }` or `{ errors: ["msg1", "msg2"] }`
    if (data) {
        if (typeof data.error === "string") {
            return data.error;
        }
        if (Array.isArray(data.errors) && data.errors.length > 0) {
            // e.g. ["Title is required", "Date can't be blank"] -> "Title is required, Date can't be blank"
            return data.errors.join(", ");
        }
        if (typeof data.message === "string") {
            return data.message;
        }
    }

    // Fallback messages by HTTP status code
    switch (status) {
        case 400:
            return "The request was invalid. Please check your input.";
        case 401:
            return "Your session has expired. Please log in again.";
        case 403:
            return "You don't have permission to perform this action.";
        case 404:
            return "The requested resource was not found.";
        case 409:
            return "A conflict occurred. The resource may have been modified.";
        case 422:
            return "Please fix the errors in your submission.";
        case 429:
            return "Too many requests. Please try again later.";
        case 500:
        case 502:
        case 503:
        case 504:
            return "An unexpected server error occurred. Please try again later.";
        default:
            return "An unknown error occurred.";
    }
}

/**
 * Handles an API error by extracting the message and showing a toast.
 * Also handles specific side-effects like 401 redirects.
 */
export function handleApiError(error: AxiosError | any) {
    const message = getErrorMessage(error);

    // Show the toast right away
    toast.error(message);

    // Handle localized side-effects like 401s
    if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
            const publicPaths = ["/", "/book", "/event", "/events", "/package"];
            const onPublicPage = publicPaths.some(
                (p) =>
                    window.location.pathname === p ||
                    window.location.pathname.startsWith(p + "/")
            );
            const onLoginPage = window.location.pathname.includes("/auth/login");

            localStorage.removeItem("auth_token");

            // Don't redirect if we're already on the login page or a public page
            if (!onLoginPage && !onPublicPage) {
                window.location.href = "/auth/login";
            }
        }
    }
}
