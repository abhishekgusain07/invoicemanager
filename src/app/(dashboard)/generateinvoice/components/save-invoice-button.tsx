"use client";

import { Button } from "@/components/ui/button";
import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { Save, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/trpc";

interface SaveInvoiceButtonProps {
  invoiceData: InvoiceGenerationData;
  existingInvoiceId?: string;
  disabled?: boolean;
  onSaved?: (invoiceId: string) => void;
}

export function SaveInvoiceButton({
  invoiceData,
  existingInvoiceId,
  disabled = false,
  onSaved,
}: SaveInvoiceButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const utils = api.useUtils();

  // ✅ NEW: Using tRPC mutations for saving/updating invoices
  const saveInvoiceMutation = api.invoice.saveGenerated.useMutation({
    onSuccess: (result) => {
      setIsSaved(true);
      toast.success("Invoice saved successfully!", {
        description: "You can now access this invoice anytime",
      });

      if (result.invoiceId && onSaved) {
        onSaved(result.invoiceId);
      }

      utils.invoice.getGenerated.invalidate();

      // Reset the saved state after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    },
    onError: (error) => {
      toast.error("Failed to save invoice", {
        description: error.message || "Please try again",
      });
    },
  });

  const updateInvoiceMutation = api.invoice.updateGenerated.useMutation({
    onSuccess: () => {
      setIsSaved(true);
      toast.success("Invoice updated successfully!", {
        description: "Your changes have been saved",
      });

      if (existingInvoiceId && onSaved) {
        onSaved(existingInvoiceId);
      }

      utils.invoice.getGenerated.invalidate();

      // Reset the saved state after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    },
    onError: (error) => {
      toast.error("Failed to update invoice", {
        description: error.message || "Please try again",
      });
    },
  });

  const isSaving =
    saveInvoiceMutation.isPending || updateInvoiceMutation.isPending;

  const handleSave = () => {
    if (disabled || isSaving) return;

    // Basic validation
    if (
      !invoiceData.seller.name ||
      !invoiceData.buyer.name ||
      invoiceData.items.length === 0
    ) {
      toast.error(
        "Please fill out seller, buyer, and add at least one item before saving"
      );
      return;
    }

    if (existingInvoiceId) {
      // Update existing invoice
      updateInvoiceMutation.mutate({
        id: existingInvoiceId,
        data: invoiceData,
      });
    } else {
      // Save new invoice
      saveInvoiceMutation.mutate(invoiceData);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={disabled || isSaving}
      variant="outline"
      size="sm"
      className="whitespace-nowrap"
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          {existingInvoiceId ? "Updating..." : "Saving..."}
        </>
      ) : isSaved ? (
        <>
          <Check className="w-4 h-4 mr-1 text-green-600" />
          {existingInvoiceId ? "Updated!" : "Saved!"}
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-1" />
          {existingInvoiceId ? "Update" : "Save"}
        </>
      )}
    </Button>
  );
}
