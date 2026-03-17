import { useState, useCallback } from "react";

export function usePagination(initialPage = 1, initialPerPage = 25) {
    const [page, setPage] = useState(initialPage);
    const [perPage, setPerPage] = useState(initialPerPage);

    const goToPage = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const changePerPage = useCallback((newPerPage: number) => {
        setPerPage(newPerPage);
        setPage(1); // Reset to first page when changing page size
    }, []);

    return {
        page,
        perPage,
        goToPage,
        changePerPage,
    };
}
