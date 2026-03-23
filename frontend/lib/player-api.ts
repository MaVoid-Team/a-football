import axios from "axios";

const resolvedBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "")
    .trim()
    .replace(/\/+$/, "");

const playerApi = axios.create({
    baseURL: resolvedBaseUrl || "",
    headers: {
        "Content-Type": "application/json",
    },
});

playerApi.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("player_auth_token");
        if (token && config.headers && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

playerApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== "undefined" && error.response?.status === 401) {
            localStorage.removeItem("player_auth_token");
            localStorage.removeItem("player_auth_user");

            const onPlayerAuthPage =
                window.location.pathname.includes("/account/login") ||
                window.location.pathname.includes("/account/register");

            if (!onPlayerAuthPage && window.location.pathname.includes("/account")) {
                window.location.href = window.location.pathname.startsWith("/ar")
                    ? "/ar/account/login"
                    : "/en/account/login";
            }
        }

        return Promise.reject(error);
    }
);

export default playerApi;
