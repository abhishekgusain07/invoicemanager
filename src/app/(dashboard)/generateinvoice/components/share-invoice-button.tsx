"use client";

import { Button } from "@/components/ui/button";
import { type InvoiceGenerationData, invoiceGenerationSchema } from "@/lib/validations/invoice-generation";
import { Share2, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { compressToEncodedURIComponent } from "lz-string";
import { useRouter } from "next/navigation";

interface ShareInvoiceButtonProps {
  invoiceData: InvoiceGenerationData;
  canShareInvoice: boolean;
  disabled?: boolean;
}

export function ShareInvoiceButton({ 
  invoiceData, 
  canShareInvoice, 
  disabled = false 
}: ShareInvoiceButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const router = useRouter();

  const handleShare = async () => {
    if (disabled || isSharing || !canShareInvoice) return;

    setIsSharing(true);
    
    try {
      const validatedData = invoiceGenerationSchema.parse(invoiceData);
      const stringified = JSON.stringify(validatedData);
      const compressedData = compressToEncodedURIComponent(stringified);

      // Check if the compressed data length exceeds browser URL limits
      const URL_LENGTH_LIMIT = 2000;
      const estimatedUrlLength =
        window.location.origin.length + 25 + compressedData.length; // 25 for "/generateinvoice?data="

      if (estimatedUrlLength > URL_LENGTH_LIMIT) {
        toast.error("Invoice data is too large to share via URL", {
          description: "Try removing some items or simplifying the invoice",
        });
        return;
      }

      // Update URL with compressed data
      const newUrl = `/generateinvoice?data=${compressedData}`;
      router.push(newUrl);

      // Construct full URL for sharing
      const fullUrl = `${window.location.origin}${newUrl}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(fullUrl);

      setIsShared(true);
      toast.success("Invoice link copied to clipboard!", {
        description: "Share this link to let others view and edit this invoice",
      });

      // Reset the shared state after 3 seconds
      setTimeout(() => {
        setIsShared(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to share invoice:", error);
      toast.error("Failed to generate shareable link", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (!canShareInvoice) {
    return (
      <Button
        variant="outline"
        disabled
        className="w-full opacity-50 cursor-not-allowed"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Cannot Share (Logo Present)
      </Button>
    );
  }

  return (
    <Button
      onClick={handleShare}
      disabled={disabled || isSharing}
      variant="outline"
      className="w-full"
    >
      {isSharing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating Link...
        </>
      ) : isShared ? (
        <>
          <Check className="w-4 h-4 mr-2 text-green-600" />
          Link Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Share Invoice
        </>
      )}
    </Button>
  );
}