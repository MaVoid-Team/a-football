"use client";

import { useTranslations } from "next-intl";
import { Admin } from "@/schemas/admin.schema";
import { DataTable } from "@/components/shared/data-table";
import { AdminFormDialog } from "./admin-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";
import { Branch } from "@/schemas/branch.schema";

interface AdminTableProps {
  admins: Admin[];
  branches: Branch[];
  isLoading: boolean;
  onUpdate: (
    id: string,
    data: any,
  ) => Promise<{ success: boolean; error?: any }>;
  onDelete: (id: string) => Promise<void>;
  currentAdminEmail?: string;
}

export function AdminTable({
  admins,
  branches,
  isLoading,
  onUpdate,
  onDelete,
  currentAdminEmail,
}: AdminTableProps) {
  const t = useTranslations("admins");

  const getBranchName = (branchId: number | null) => {
    if (!branchId) return t("table.allBranches");
    const branch = branches.find((b) => Number(b.id) === branchId);
    return branch ? branch.name : t("table.unknownBranch");
  };

  const columns = [
    {
      header: t("table.emailHeader"),
      accessorKey: "email" as keyof Admin,
      className: "font-medium",
      cell: (a: Admin) => (
        <div className="flex items-center gap-2">
          {a.email}
          {a.email === currentAdminEmail && (
            <Badge variant="outline" className="text-[10px] ml-2">
              {t("table.youBadge")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: t("table.roleHeader"),
      cell: (a: Admin) => (
        <Badge variant={a.role === "super_admin" ? "default" : "secondary"}>
          {a.role === "super_admin"
            ? t("form.roleOptions.superAdmin")
            : t("form.roleOptions.branchAdmin")}
        </Badge>
      ),
    },
    {
      header: t("table.branchHeader"),
      cell: (a: Admin) => (
        <span className="text-sm">{getBranchName(a.branch_id)}</span>
      ),
    },
    {
      header: t("table.createdHeader"),
      cell: (a: Admin) => formatDate(a.created_at, "PP"),
    },
    {
      header: t("table.actionsHeader"),
      className: "text-right",
      cell: (a: Admin) => (
        <div className="flex justify-end gap-2">
          <AdminFormDialog
            admin={a}
            branches={branches}
            onSubmit={(data) => onUpdate(a.id, data)}
          />
          {a.email !== currentAdminEmail && (
            <ConfirmDialog
              title={t("table.deleteConfirmTitle")}
              description={t("table.deleteConfirmDesc", { email: a.email })}
              onConfirm={() => onDelete(a.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={admins}
      isLoading={isLoading}
      emptyStateTitle={t("table.noAdmins")}
      emptyStateDescription={t("table.noAdminsDesc")}
    />
  );
}
