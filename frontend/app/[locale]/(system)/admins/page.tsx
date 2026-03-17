"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAdminsAPI } from "@/hooks/api/use-admins";
import { useBranchesAPI } from "@/hooks/api/use-branches";
import { usePagination } from "@/hooks/code/use-pagination";
import { AdminTable } from "@/components/admins/admin-table";
import { AdminFormDialog } from "@/components/admins/admin-form-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { AdminFormData, AdminUpdateData } from "@/schemas/admin.schema";
import { useAuthContext } from "@/contexts/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function AdminsPage() {
  const t = useTranslations("admins");

  const { admin } = useAuthContext();
  const isSuperAdmin = admin?.role === "super_admin";

  const {
    admins,
    pagination: meta,
    loading: adminsLoading,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
  } = useAdminsAPI();

  const { branches, fetchBranches } = useBranchesAPI();
  const { page, perPage, goToPage, changePerPage } = usePagination(1, 25);

  const loadData = () => {
    fetchAdmins({ page, per_page: perPage });
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchBranches();
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, page, perPage]);

  if (!isSuperAdmin) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-10">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>{t("page.accessDeniedTitle")}</AlertTitle>
        <AlertDescription>{t("page.accessDeniedDesc")}</AlertDescription>
      </Alert>
    );
  }

  const handleCreate = async (data: AdminFormData) => {
    const res = await createAdmin(data);
    if (res.success) {
      toast.success(t("toast.created"));
      loadData();
    }
    return res;
  };

  const handleUpdate = async (id: string, data: Partial<AdminUpdateData>) => {
    const res = await updateAdmin(id, data);
    if (res.success) {
      toast.success(t("toast.updated"));
      loadData();
    }
    return res;
  };

  const handleDelete = async (id: string) => {
    const res = await deleteAdmin(id);
    if (res.success) {
      toast.success(t("toast.deleted"));
      loadData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("page.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("page.subtitle")}
          </p>
        </div>

        <AdminFormDialog branches={branches} onSubmit={handleCreate} />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm p-4">
        <AdminTable
          admins={admins}
          branches={branches}
          isLoading={adminsLoading}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          currentAdminEmail={admin?.email}
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
