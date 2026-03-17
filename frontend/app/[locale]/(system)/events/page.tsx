"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useEventsAPI } from "@/hooks/api/use-events";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { usePagination } from "@/hooks/code/use-pagination";
import { EventTable } from "@/components/events/event-table";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { EventFormData } from "@/schemas/event.schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function EventsPage() {
    const t = useTranslations("events.page");
    const tToast = useTranslations("events.toasts");
    const [filterBranchId, setFilterBranchId] = useState<string>("all");

    const {
        events,
        pagination: meta,
        loading: eventsLoading,
        fetchAdminEvents,
        createEvent,
        updateEvent,
        deleteEvent
    } = useEventsAPI();

    const { branches, fetchBranches } = useBranchesAPI();
    const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

    const loadData = () => {
        const params: any = { page, per_page: perPage };
        if (filterBranchId !== "all") {
            params.branch_id = Number(filterBranchId);
        }
        fetchAdminEvents(params);
    };

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, perPage, filterBranchId]);

    const handleCreate = async (data: EventFormData) => {
        const res = await createEvent(data);
        if (res.success) {
            toast.success(tToast("created"));
            loadData();
        }
        return res;
    };

    const handleUpdate = async (id: string, data: Partial<EventFormData>) => {
        const res = await updateEvent(id, data);
        if (res.success) {
            toast.success(tToast("updated"));
            loadData();
        }
        return res;
    };

    const handleDelete = async (id: string) => {
        const res = await deleteEvent(id);
        if (res.success) {
            toast.success(tToast("deleted"));
            loadData();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="branch-filter" className="text-sm text-muted-foreground whitespace-nowrap">
                            {t("filterByBranch")}
                        </Label>
                        <Select value={filterBranchId} onValueChange={(v) => { setFilterBranchId(v); goToPage(1); }}>
                            <SelectTrigger id="branch-filter" className="w-[180px]" data-testid="event-branch-filter">
                                <SelectValue placeholder={t("allBranches")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("allBranches")}</SelectItem>
                                {branches.map(b => (
                                    <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <EventFormDialog branches={branches} onSubmit={handleCreate} />
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm p-4">
                <EventTable
                    events={events}
                    branches={branches}
                    isLoading={eventsLoading}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />

                {meta && (
                    <PaginationControls
                        pagination={meta}
                        onPageChange={goToPage}
                        onPerPageChange={changePerPage}
                    />
                )}
            </div>
        </div>
    );
}
