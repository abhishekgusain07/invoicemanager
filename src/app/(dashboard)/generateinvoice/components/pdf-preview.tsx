"use client";

import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  invoiceData: InvoiceGenerationData;
}

export function PDFPreview({ invoiceData }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);

  // Debounced function to generate PDF
  const debouncedGeneratePDF = useDebouncedCallback(async (data: InvoiceGenerationData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-invoice-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Cleanup previous URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      setPdfUrl(url);
    } catch (err) {
      console.error("Error generating PDF preview:", err);
      setError(err instanceof Error ? err.message : "Failed to generate PDF preview");
    } finally {
      setIsLoading(false);
    }
  }, 1000);

  // Generate PDF when invoice data changes
  useEffect(() => {
    // Only generate if we have required data
    if (invoiceData.seller.name && invoiceData.buyer.name && invoiceData.items.length > 0) {
      debouncedGeneratePDF(invoiceData);
    }

    // Cleanup function
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [invoiceData, debouncedGeneratePDF]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError("Failed to load PDF preview");
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Generating PDF preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600 mb-2">Failed to load PDF preview</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-sm text-gray-600">
            Fill out the invoice details to see PDF preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 2.0}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {numPages && (
          <span className="text-sm text-gray-600">
            1 of {numPages} pages
          </span>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-auto max-h-[600px]">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            }
          >
            <Page
              pageNumber={1}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}