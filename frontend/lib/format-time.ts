/**
 * Extracts and formats just the time from a full datetime string or standard HH:MM time string.
 */
export function formatTime(timeString: string | undefined | null): string {
    if (!timeString) return "N/A";

    // If already in simple HH:MM format
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
        const [hours, minutes] = timeString.split(":");
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    }

    // Might be full ISO
    try {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return timeString;

        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        }).format(date);
    } catch {
        return timeString;
    }
}
