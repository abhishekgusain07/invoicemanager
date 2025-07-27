"use client";

import { Button } from "@/components/ui/button";
import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saveAs } from "file-saver";

interface PDFDownloadButtonProps {
  invoiceData: InvoiceGenerationData;
  disabled?: boolean;
}

export function PDFDownloadButton({
  invoiceData,
  disabled = false,
}: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (disabled || isGenerating) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-invoice-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const filename = `invoice-${invoiceData.invoiceNumberObject?.value || "draft"}.pdf`;

      saveAs(blob, filename);

      toast.success("PDF generated successfully!", {
        description: `Downloaded as ${filename}`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={disabled || isGenerating}
      className="w-full"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  );
}
