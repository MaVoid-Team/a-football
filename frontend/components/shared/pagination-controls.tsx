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
        <div className="flex items-center justify-between px-2 py-4 border-t border-border mt-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {t("showing", {
                    from: Math.min((page - 1) * perPage + 1, totalCount),
                    to: Math.min(page * perPage, totalCount),
                    total: totalCount,
                })}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                {onPerPageChange && (
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-foreground">{t("rowsPerPage")}</p>
                        <Select
                            value={`${perPage}`}
                            onValueChange={(value) => onPerPageChange(Number(value))}
                        >
                            <SelectTrigger
                                className="h-8 w-[70px]"
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
                <div className="flex flex-col min-w-[100px] items-center justify-center text-sm font-medium text-foreground">
                    {t("pageOf", { page, total: totalPages || 1 })}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
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
                        className="h-8 w-8 p-0"
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
