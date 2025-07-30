"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { InvoiceForm } from "./invoice-form";
import dynamic from "next/dynamic";
import {
  useInvoiceData,
  useIsLoading,
  useCanShareInvoice,
  useCurrentInvoiceId,
  useIsInitialized,
  useInvoiceActions,
} from "@/stores/invoice-store";
import type { InvoiceGenerationData } from "@/lib/validations/invoice-generation";

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

export function InvoiceClientPage() {
  const searchParams = useSearchParams();
  
  // Zustand store hooks
  const invoiceData = useInvoiceData();
  const isLoading = useIsLoading();
  const canShareInvoice = useCanShareInvoice();
  const currentInvoiceId = useCurrentInvoiceId();
  const isInitialized = useIsInitialized();
  const {
    setInvoiceData,
    setCanShareInvoice,
    clearInvoice,
    initializeStore,
    handleInvoiceSaved,
    handleLoadInvoice,
  } = useInvoiceActions();

  // Form reset function from InvoiceForm
  const [formResetFn, setFormResetFn] = useState<((data: InvoiceGenerationData) => void) | null>(null);

  // Initialize store on mount
  useEffect(() => {
    const compressedInvoiceDataInUrl = searchParams.get("data");
    initializeStore(compressedInvoiceDataInUrl || undefined);
  }, [searchParams, initializeStore]);



  const handleInvoiceDataChange = (updatedData: InvoiceGenerationData) => {
    setInvoiceData(updatedData);
  };

  // Handle loading saved invoice - reset both store and form
  const handleLoadSavedInvoice = (invoiceData: InvoiceGenerationData, invoiceId: string) => {
    // Update store
    handleLoadInvoice(invoiceData, invoiceId);
    // Reset form if reset function is available
    if (formResetFn) {
      formResetFn(invoiceData);
    }
  };

  // Handle clearing template - reset both store and form
  const handleClearTemplate = () => {
    clearInvoice();
    // Reset form to empty data if reset function is available
    if (formResetFn) {
      const emptyData = {
        ...invoiceData!,
        seller: { ...invoiceData!.seller, name: "", address: "", email: "" },
        buyer: { ...invoiceData!.buyer, name: "", address: "", email: "" },
        items: [{ ...invoiceData!.items[0], name: "", netPrice: 0, amount: 1 }],
      };
      formResetFn(emptyData);
    }
  };

  if (isLoading || !isInitialized || !invoiceData) {
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
                invoiceData={invoiceData}
                onInvoiceDataChange={handleInvoiceDataChange}
                setCanShareInvoice={setCanShareInvoice}
                onFormReset={setFormResetFn}
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">PDF Preview</h2>
                <div className="flex gap-2">
                  <SavedInvoicesList onLoadInvoice={handleLoadSavedInvoice} />
                  <SaveInvoiceButton
                    invoiceData={invoiceData}
                    existingInvoiceId={currentInvoiceId}
                    onSaved={handleInvoiceSaved}
                    disabled={
                      !invoiceData.seller.name ||
                      !invoiceData.buyer.name ||
                      invoiceData.items.length === 0
                    }
                  />
                  <ShareInvoiceButton
                    invoiceData={invoiceData}
                    canShareInvoice={canShareInvoice}
                    disabled={
                      !invoiceData.seller.name ||
                      !invoiceData.buyer.name ||
                      invoiceData.items.length === 0
                    }
                  />
                  <PDFDownloadButton
                    invoiceData={invoiceData}
                    disabled={
                      !invoiceData.seller.name ||
                      !invoiceData.buyer.name ||
                      invoiceData.items.length === 0
                    }
                  />
                </div>
              </div>
              <PDFPreview invoiceData={invoiceData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
