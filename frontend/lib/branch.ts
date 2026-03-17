/**
 * Retrieves the default branch ID for public-facing components.
 * Defaults to 1 if the environment variable is not set.
 */
export function getDefaultBranchId(): number {
    return Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID || 1);
}
