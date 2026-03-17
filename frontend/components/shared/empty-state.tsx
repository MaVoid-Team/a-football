import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div
            className="flex flex-col flex-1 h-full min-h-[400px] items-center justify-center rounded-md border border-dashed border-border p-8 text-center animate-in fade-in-50"
            data-testid="empty-state"
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <FolderOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-center text-sm font-normal leading-6 text-muted-foreground max-w-sm">
                {description}
            </p>
        </div>
    );
}
