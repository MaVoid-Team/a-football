"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, X } from "lucide-react";

interface BookingTermsDialogProps {
  terms: string | null | undefined;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BookingTermsDialog({ 
  terms, 
  trigger, 
  open: controlledOpen, 
  onOpenChange 
}: BookingTermsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const t = useTranslations("bookingTerms");
  
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled && onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  if (!terms) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t("title")}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenChange(false)}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {terms.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => handleOpenChange(false)}>
            {t("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
