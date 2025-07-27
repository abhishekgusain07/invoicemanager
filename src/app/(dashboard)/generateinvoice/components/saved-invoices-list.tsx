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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  loadGeneratedInvoices,
  deleteGeneratedInvoice,
} from "@/actions/generated-invoices";
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
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load saved invoices when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadInvoices();
    }
  }, [isOpen]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const result = await loadGeneratedInvoices();
      if (result.success) {
        setSavedInvoices(result.invoices || []);
      } else {
        toast.error("Failed to load saved invoices", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Failed to load saved invoices");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDeleteInvoice = async (
    invoiceId: string,
    invoiceNumber: string
  ) => {
    if (!confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      return;
    }

    setIsDeleting(invoiceId);
    try {
      const result = await deleteGeneratedInvoice(invoiceId);
      if (result.success) {
        setSavedInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));
        toast.success("Invoice deleted successfully!");
      } else {
        toast.error("Failed to delete invoice", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(null);
    }
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
        <Button variant="outline" className="w-full">
          <FolderOpen className="w-4 h-4 mr-2" />
          Load Saved Invoice
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
                      disabled={isDeleting === invoice.id}
                    >
                      {isDeleting === invoice.id ? (
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
