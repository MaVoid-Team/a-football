import { toast } from "sonner";
import { AxiosError } from "axios";

const messages = {
    en: {
        network: "Unable to connect to the server. Please check your internet connection.",
        badRequest: "The request was invalid. Please check your input.",
        unauthorized: "Your session has expired. Please log in again.",
        forbidden: "You don't have permission to perform this action.",
        notFound: "The requested resource was not found.",
        conflict: "A conflict occurred. The resource may have been modified.",
        unprocessable: "Please fix the errors in your submission.",
        tooManyRequests: "Too many requests. Please try again later.",
        serverError: "An unexpected server error occurred. Please try again later.",
        unknown: "An unknown error occurred.",
    },
    ar: {
        network: "مش قادرين نوصل للسيرفر. اتأكد من اتصال الإنترنت.",
        badRequest: "الطلب فيه مشكلة. راجع البيانات اللي دخلتها.",
        unauthorized: "انتهت الجلسة. من فضلك سجّل دخول تاني.",
        forbidden: "مش مسموح لك تعمل الإجراء ده.",
        notFound: "العنصر المطلوب مش موجود.",
        conflict: "حصل تعارض. ممكن يكون المورد اتغير.",
        unprocessable: "صلّح الأخطاء في البيانات وحاول تاني.",
        tooManyRequests: "طلبات كتير جدًا. جرب تاني بعد شوية.",
        serverError: "حصل خطأ في السيرفر. حاول تاني بعد شوية.",
        unknown: "حصل خطأ غير متوقع.",
    },
} as const;

function getLocale(): "en" | "ar" {
    if (typeof window === "undefined") return "en";
    return window.location.pathname.startsWith("/ar") ? "ar" : "en";
}

/**
 * Parses an AxiosError to extract a user-friendly error message,
 * based on the HTTP status code and the response payload from the Rails backend.
 */
function getErrorMessage(error: any): string {
    const t = messages[getLocale()];

    if (!error.response) {
        // Network error, request timeout, or server unreachable
        return t.network;
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
            return t.badRequest;
        case 401:
            return t.unauthorized;
        case 403:
            return t.forbidden;
        case 404:
            return t.notFound;
        case 409:
            return t.conflict;
        case 422:
            return t.unprocessable;
        case 429:
            return t.tooManyRequests;
        case 500:
        case 502:
        case 503:
        case 504:
            return t.serverError;
        default:
            return t.unknown;
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
