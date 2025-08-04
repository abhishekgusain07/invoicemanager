"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";
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
import { api } from "@/lib/trpc";
import { toast } from "sonner";

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
  const [formResetFn, setFormResetFn] = useState<
    ((data: InvoiceGenerationData) => void) | null
  >(null);

  // Form data getter function from InvoiceForm for manual updates
  const [formDataGetter, setFormDataGetter] = useState<
    (() => InvoiceGenerationData) | null
  >(null);

  // Stable callback wrappers to prevent setState during render
  const handleFormReset = useCallback(
    (resetFn: (data: InvoiceGenerationData) => void) => {
      setFormResetFn(() => resetFn);
    },
    []
  );

  const handleFormDataGetter = useCallback(
    (getterFn: () => InvoiceGenerationData) => {
      setFormDataGetter(() => getterFn);
    },
    []
  );

  // Initialize store on mount
  useEffect(() => {
    const compressedInvoiceDataInUrl = searchParams.get("data");
    const invoiceIdFromUrl = searchParams.get("id");
    
    // Only initialize if not loading an existing invoice by ID
    if (!invoiceIdFromUrl) {
      initializeStore(compressedInvoiceDataInUrl || undefined);
    }
  }, [searchParams, initializeStore]);

  // Function to load existing invoice by ID using tRPC
  const { data: loadedInvoice, isLoading: isLoadingInvoice, error: loadInvoiceError } = api.invoice.getGeneratedById.useQuery(
    { id: searchParams.get("id") || "" },
    { 
      enabled: !!searchParams.get("id"),
    }
  );

  // Handle loaded invoice data
  useEffect(() => {
    if (loadedInvoice?.success && loadedInvoice.invoiceData) {
      handleLoadInvoice(loadedInvoice.invoiceData, loadedInvoice.invoice.id);
      toast.success("Invoice loaded for editing");
    }
  }, [loadedInvoice, handleLoadInvoice]);

  // Handle load error
  useEffect(() => {
    if (loadInvoiceError && searchParams.get("id")) {
      console.error("Failed to load invoice:", loadInvoiceError);
      toast.error("Failed to load invoice", {
        description: "Loading default invoice instead"
      });
      initializeStore();
    }
  }, [loadInvoiceError, searchParams, initializeStore]);

  const handleInvoiceDataChange = (updatedData: InvoiceGenerationData) => {
    setInvoiceData(updatedData);
  };

  // Manual update preview function
  const handleUpdatePreview = () => {
    if (formDataGetter && typeof formDataGetter === "function") {
      const currentFormData = formDataGetter();
      handleInvoiceDataChange(currentFormData);
    }
  };

  // Preview updates when store data changes (less frequent than keystrokes)
  // This replaces the heavy real-time watching that was in InvoiceForm
  useEffect(() => {
    // The preview automatically updates when invoiceData changes
    // This happens when:
    // 1. User blurs from form fields
    // 2. User submits form
    // 3. User loads saved invoice
    // 4. Store is initialized
    // NOT on every keystroke - this is the key performance improvement
  }, [invoiceData]);

  // Handle loading saved invoice - reset both store and form
  const handleLoadSavedInvoice = (
    invoiceData: InvoiceGenerationData,
    invoiceId: string
  ) => {
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
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdatePreview}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Preview
                  </Button>
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
              </div>
              <InvoiceForm
                invoiceData={invoiceData}
                onInvoiceDataChange={handleInvoiceDataChange}
                setCanShareInvoice={setCanShareInvoice}
                onFormReset={handleFormReset}
                onFormDataGetter={handleFormDataGetter}
              />
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">PDF Preview</h2>

                {/* Compact Action Buttons */}
                <div className="flex gap-2 items-center">
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
