"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type InvoiceGenerationData } from "@/lib/validations/invoice-generation";
import {
  FolderOpen,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/trpc";
import dayjs from "dayjs";

interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceTitle: string | null;
  dateOfIssue: Date;
  paymentDue: Date;
  language: string;
  currency: string;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  invoiceData: string;
}

interface SavedInvoicesListProps {
  onLoadInvoice: (
    invoiceData: InvoiceGenerationData,
    invoiceId: string
  ) => void;
}

export function SavedInvoicesList({ onLoadInvoice }: SavedInvoicesListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  // ✅ NEW: Using tRPC query to load saved invoices
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = api.invoice.getGenerated.useQuery(
    { limit: 50, offset: 0 },
    {
      enabled: isOpen, // Only fetch when dialog is open
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  // Handle query error
  if (error) {
    toast.error("Failed to load saved invoices", {
      description: error.message,
    });
  }

  // ✅ NEW: Using tRPC mutation for deleting invoices
  const deleteInvoiceMutation = api.invoice.deleteGenerated.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted successfully!");
      utils.invoice.getGenerated.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete invoice", {
        description: error.message,
      });
    },
  });

  const savedInvoices = result?.invoices || [];

  const handleLoadInvoice = (invoice: SavedInvoice) => {
    try {
      const invoiceData = JSON.parse(
        invoice.invoiceData
      ) as InvoiceGenerationData;
      onLoadInvoice(invoiceData, invoice.id);
      setIsOpen(false);
      toast.success("Invoice loaded successfully!", {
        description: `Loaded invoice ${invoice.invoiceNumber}`,
      });
    } catch (error) {
      console.error("Failed to parse invoice data:", error);
      toast.error("Failed to load invoice", {
        description: "Invoice data appears to be corrupted",
      });
    }
  };

  const handleDeleteInvoice = (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return;
    }

    deleteInvoiceMutation.mutate({ id: invoiceId });
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(num);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="whitespace-nowrap">
          <FolderOpen className="w-4 h-4 mr-1" />
          Load
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saved Invoices</DialogTitle>
          <DialogDescription>
            Load a previously saved invoice to continue editing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading saved invoices...</span>
            </div>
          ) : savedInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No saved invoices yet</p>
              <p className="text-sm text-gray-400">
                Save an invoice to see it here
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleLoadInvoice(invoice)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {invoice.invoiceNumber}
                        </h3>
                        {invoice.invoiceTitle && (
                          <span className="text-sm text-gray-600">
                            • {invoice.invoiceTitle}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {formatCurrency(
                              invoice.totalAmount,
                              invoice.currency
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Due:{" "}
                            {dayjs(invoice.paymentDue).format("MMM D, YYYY")}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500">
                          Created:{" "}
                          {dayjs(invoice.createdAt).format("MMM D, YYYY")}
                        </div>

                        <div className="text-xs text-gray-500">
                          Updated:{" "}
                          {dayjs(invoice.updatedAt).format("MMM D, YYYY")}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInvoice(invoice.id, invoice.invoiceNumber);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      disabled={deleteInvoiceMutation.isPending}
                    >
                      {deleteInvoiceMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
