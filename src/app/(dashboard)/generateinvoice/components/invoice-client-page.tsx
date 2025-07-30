"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { InvoiceForm } from "./invoice-form";
import dynamic from "next/dynamic";

const PDFPreview = dynamic(
  () => import("./pdf-preview").then((mod) => ({ default: mod.PDFPreview })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        Loading PDF preview...
      </div>
    ),
  }
);
import { PDFDownloadButton } from "./pdf-download-button";
import { ShareInvoiceButton } from "./share-invoice-button";
import { SaveInvoiceButton } from "./save-invoice-button";
import { SavedInvoicesList } from "./saved-invoices-list";
import { INITIAL_INVOICE_DATA, EMPTY_INVOICE_DATA } from "../constants";
import { PDF_DATA_LOCAL_STORAGE_KEY } from "@/lib/validations/invoice-generation";
import {
  invoiceGenerationSchema,
  type InvoiceGenerationData,
} from "@/lib/validations/invoice-generation";
import { toast } from "sonner";
import { decompressFromEncodedURIComponent } from "lz-string";

export function InvoiceClientPage() {
  const [invoiceDataState, setInvoiceDataState] =
    useState<InvoiceGenerationData | null>(null);
  const [canShareInvoice, setCanShareInvoice] = useState(true);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | undefined>(
    undefined
  );
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize data from URL or localStorage on mount
  useEffect(() => {
    const compressedInvoiceDataInUrl = searchParams.get("data");

    // First try to load from URL
    if (compressedInvoiceDataInUrl) {
      try {
        const decompressed = decompressFromEncodedURIComponent(
          compressedInvoiceDataInUrl
        );
        const parsedJSON: unknown = JSON.parse(decompressed);
        const validated = invoiceGenerationSchema.parse(parsedJSON);
        setInvoiceDataState(validated);

        toast.info("Invoice loaded from shared link!", {
          description: "You can now edit and customize this invoice",
        });
      } catch (error) {
        console.error("Failed to parse URL data:", error);
        toast.error("Failed to load shared invoice data", {
          description: "Loading default invoice instead",
        });
        loadFromLocalStorage();
      }
    } else {
      // If no data in URL, load from localStorage
      loadFromLocalStorage();
    }
  }, [searchParams]);

  // Helper function to load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem(PDF_DATA_LOCAL_STORAGE_KEY);
      if (savedData) {
        const json: unknown = JSON.parse(savedData);
        const parsedData = invoiceGenerationSchema.parse(json);
        setInvoiceDataState(parsedData);
      } else {
        setInvoiceDataState(INITIAL_INVOICE_DATA);
      }
    } catch (error) {
      console.error("Failed to load saved invoice data:", error);
      setInvoiceDataState(INITIAL_INVOICE_DATA);
      toast.error(
        "Unable to load your saved invoice data. Starting with default values.",
        {
          duration: 5000,
        }
      );
    }
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (invoiceDataState) {
      try {
        // Use safeParse to avoid throwing errors on invalid data
        const validationResult = invoiceGenerationSchema.safeParse(invoiceDataState);
        if (validationResult.success) {
          localStorage.setItem(
            PDF_DATA_LOCAL_STORAGE_KEY,
            JSON.stringify(validationResult.data)
          );
        } else {
          // Just save the raw data without validation - user might be in the middle of typing
          localStorage.setItem(
            PDF_DATA_LOCAL_STORAGE_KEY,
            JSON.stringify(invoiceDataState)
          );
        }
      } catch (error) {
        console.error("Failed to save invoice data:", error);
        // Only show toast for actual save failures, not validation errors
      }
    }
  }, [invoiceDataState]);

  const handleInvoiceDataChange = (updatedData: InvoiceGenerationData) => {
    setInvoiceDataState(updatedData);
  };

  const handleLoadInvoice = (
    invoiceData: InvoiceGenerationData,
    invoiceId: string
  ) => {
    setInvoiceDataState(invoiceData);
    setCurrentInvoiceId(invoiceId);
  };

  const handleInvoiceSaved = (invoiceId: string) => {
    setCurrentInvoiceId(invoiceId);
  };

  const handleClearTemplate = () => {
    setInvoiceDataState(EMPTY_INVOICE_DATA);
    setCurrentInvoiceId(undefined);
    toast.success("Invoice template cleared", {
      description: "All fields have been reset to empty values",
    });
  };

  if (!invoiceDataState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Generate Invoice</h1>
          <p className="text-gray-600 mt-2">
            Create professional invoices with real-time PDF preview
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Invoice Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearTemplate}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Template
                </Button>
              </div>
              <InvoiceForm
                invoiceData={invoiceDataState}
                onInvoiceDataChange={handleInvoiceDataChange}
                setCanShareInvoice={setCanShareInvoice}
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">PDF Preview</h2>
                <div className="flex gap-2">
                  <SavedInvoicesList onLoadInvoice={handleLoadInvoice} />
                  <SaveInvoiceButton
                    invoiceData={invoiceDataState}
                    existingInvoiceId={currentInvoiceId}
                    onSaved={handleInvoiceSaved}
                    disabled={
                      !invoiceDataState.seller.name ||
                      !invoiceDataState.buyer.name ||
                      invoiceDataState.items.length === 0
                    }
                  />
                  <ShareInvoiceButton
                    invoiceData={invoiceDataState}
                    canShareInvoice={canShareInvoice}
                    disabled={
                      !invoiceDataState.seller.name ||
                      !invoiceDataState.buyer.name ||
                      invoiceDataState.items.length === 0
                    }
                  />
                  <PDFDownloadButton
                    invoiceData={invoiceDataState}
                    disabled={
                      !invoiceDataState.seller.name ||
                      !invoiceDataState.buyer.name ||
                      invoiceDataState.items.length === 0
                    }
                  />
                </div>
              </div>
              <PDFPreview invoiceData={invoiceDataState} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
