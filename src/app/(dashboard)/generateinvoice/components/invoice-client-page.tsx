"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { InvoiceForm } from "./invoice-form";
import { PDFPreview } from "./pdf-preview";
import { PDFDownloadButton } from "./pdf-download-button";
import { ShareInvoiceButton } from "./share-invoice-button";
import { INITIAL_INVOICE_DATA, PDF_DATA_LOCAL_STORAGE_KEY } from "../constants";
import { invoiceGenerationSchema, type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import { toast } from "sonner";
import { decompressFromEncodedURIComponent } from "lz-string";

export function InvoiceClientPage() {
  const [invoiceDataState, setInvoiceDataState] = useState<InvoiceGenerationData | null>(null);
  const [canShareInvoice, setCanShareInvoice] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize data from URL or localStorage on mount
  useEffect(() => {
    const compressedInvoiceDataInUrl = searchParams.get("data");

    // First try to load from URL
    if (compressedInvoiceDataInUrl) {
      try {
        const decompressed = decompressFromEncodedURIComponent(compressedInvoiceDataInUrl);
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
        const newInvoiceDataValidated = invoiceGenerationSchema.parse(invoiceDataState);
        localStorage.setItem(
          PDF_DATA_LOCAL_STORAGE_KEY,
          JSON.stringify(newInvoiceDataValidated)
        );
      } catch (error) {
        console.error("Failed to save invoice data:", error);
        toast.error("Failed to save invoice data");
      }
    }
  }, [invoiceDataState]);

  const handleInvoiceDataChange = (updatedData: InvoiceGenerationData) => {
    setInvoiceDataState(updatedData);
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
              <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
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
                  <ShareInvoiceButton
                    invoiceData={invoiceDataState}
                    canShareInvoice={canShareInvoice}
                    disabled={!invoiceDataState.seller.name || !invoiceDataState.buyer.name || invoiceDataState.items.length === 0}
                  />
                  <PDFDownloadButton 
                    invoiceData={invoiceDataState}
                    disabled={!invoiceDataState.seller.name || !invoiceDataState.buyer.name || invoiceDataState.items.length === 0}
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