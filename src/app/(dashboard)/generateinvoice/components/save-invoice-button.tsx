"use client";

import { Button } from "@/components/ui/button";
import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { Save, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saveGeneratedInvoice, updateGeneratedInvoice } from "@/actions/generated-invoices";

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
  onSaved 
}: SaveInvoiceButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (disabled || isSaving) return;

    // Basic validation
    if (!invoiceData.seller.name || !invoiceData.buyer.name || invoiceData.items.length === 0) {
      toast.error("Please fill out seller, buyer, and add at least one item before saving");
      return;
    }

    setIsSaving(true);
    
    try {
      let result;
      
      if (existingInvoiceId) {
        // Update existing invoice
        result = await updateGeneratedInvoice(existingInvoiceId, invoiceData);
      } else {
        // Save new invoice
        result = await saveGeneratedInvoice(invoiceData);
      }

      if (result.success) {
        setIsSaved(true);
        toast.success(existingInvoiceId ? "Invoice updated successfully!" : "Invoice saved successfully!", {
          description: existingInvoiceId ? "Your changes have been saved" : "You can now access this invoice anytime",
        });

        if (!existingInvoiceId && 'invoiceId' in result && typeof result.invoiceId === 'string' && onSaved) {
          onSaved(result.invoiceId);
        } else if (existingInvoiceId && onSaved) {
          onSaved(existingInvoiceId);
        }

        // Reset the saved state after 3 seconds
        setTimeout(() => {
          setIsSaved(false);
        }, 3000);
      } else {
        toast.error(existingInvoiceId ? "Failed to update invoice" : "Failed to save invoice", {
          description: result.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
      toast.error("Failed to save invoice", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={disabled || isSaving}
      variant="outline"
      className="w-full"
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {existingInvoiceId ? "Updating..." : "Saving..."}
        </>
      ) : isSaved ? (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          {existingInvoiceId ? "Updated!" : "Saved!"}
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          {existingInvoiceId ? "Update Invoice" : "Save Invoice"}
        </>
      )}
    </Button>
  );
}