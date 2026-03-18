"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface PaymentScreenshotUploadProps {
    value: File | null;
    onChange: (file: File | null) => void;
}

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function PaymentScreenshotUpload({ value, onChange }: PaymentScreenshotUploadProps) {
    const t = useTranslations("publicBook");
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        setError(null);
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError(t("screenshotInvalidType"));
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(t("screenshotTooLarge", { mb: MAX_SIZE_MB }));
            return;
        }
        onChange(file);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        onChange(null);
        setPreview(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium leading-none flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {t("screenshotLabel")}
                <span className="text-muted-foreground font-normal text-xs">({t("screenshotOptional")})</span>
            </label>
            <p className="text-xs text-muted-foreground">{t("screenshotDescription")}</p>

            {value && preview ? (
                <div className="relative rounded-xl overflow-hidden border border-border group">
                    <img
                        src={preview}
                        alt="Payment screenshot"
                        className="w-full max-h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            className="gap-1"
                        >
                            <X className="w-4 h-4" />
                            {t("screenshotRemove")}
                        </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-1.5">
                        <p className="text-white text-xs truncate">{value.name}</p>
                    </div>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => inputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3
                        cursor-pointer transition-all duration-200
                        ${isDragging
                            ? "border-primary bg-primary/10 scale-[1.01]"
                            : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-primary/5"
                        }
                    `}
                >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className={`w-6 h-6 ${isDragging ? "text-primary-text" : "text-muted-foreground"}`} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                            {t("screenshotDropzone")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("screenshotFormats")}
                        </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-1 pointer-events-none">
                        {t("screenshotBrowse")}
                    </Button>
                </div>
            )}

            {error && (
                <p className="text-xs font-medium text-destructive">{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleInputChange}
                className="hidden"
            />
        </div>
    );
}
