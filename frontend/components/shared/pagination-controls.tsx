"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PaginationMeta } from "@/schemas/api.schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface PaginationControlsProps {
    pagination: PaginationMeta;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
}

export function PaginationControls({
    pagination,
    onPageChange,
    onPerPageChange,
}: PaginationControlsProps) {
    const t = useTranslations("pagination");
    const { page, totalPages, totalCount, perPage } = pagination;

    return (
        <div className="mt-4 flex flex-col gap-3 border-t border-border px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground sm:flex-1">
                {t("showing", {
                    from: Math.min((page - 1) * perPage + 1, totalCount),
                    to: Math.min(page * perPage, totalCount),
                    total: totalCount,
                })}
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end lg:gap-6">
                {onPerPageChange && (
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{t("rowsPerPage")}</p>
                        <Select
                            value={`${perPage}`}
                            onValueChange={(value) => onPerPageChange(Number(value))}
                        >
                            <SelectTrigger
                                className="h-10 w-[78px]"
                                id="per-page-select"
                                data-testid="per-page-select"
                            >
                                <SelectValue placeholder={perPage} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 25, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`} data-testid={`per-page-option-${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="min-w-[100px] text-sm font-medium text-foreground">
                    {t("pageOf", { page, total: totalPages || 1 })}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="h-10 w-10 p-0"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 1}
                        id="prev-page"
                        data-testid="prev-page"
                        aria-label={t("previousPage")}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 w-10 p-0"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages}
                        id="next-page"
                        data-testid="next-page"
                        aria-label={t("nextPage")}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
