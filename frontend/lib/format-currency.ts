/**
 * Formats a number or string representation of a price to local currency (EGP).
 */
export function formatCurrency(amount: string | number | undefined | null): string {
    if (amount === undefined || amount === null) return "EGP 0.00";

    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "EGP 0.00";

    return new Intl.NumberFormat("en-EG", {
        style: "currency",
        currency: "EGP",
    }).format(num);
}
