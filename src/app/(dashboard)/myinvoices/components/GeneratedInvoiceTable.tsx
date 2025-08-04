"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EditIcon,
  TrashIcon,
  ExternalLinkIcon,
  EyeIcon,
  Download,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDate } from "@/app/(dashboard)/invoices/utils/invoiceUtils";
import type { GeneratedInvoice } from "@/db/schema";
import { CURRENCY_SYMBOLS } from "@/lib/validations/invoice-generation";

interface GeneratedInvoiceTableProps {
  invoices: GeneratedInvoice[];
  isLoading: boolean;
  onEdit: (invoiceId: string) => void;
  onRefetch: () => void;
  onCreateInvoice: () => void;
}

export function GeneratedInvoiceTable({
  invoices,
  isLoading,
  onEdit,
  onRefetch,
  onCreateInvoice,
}: GeneratedInvoiceTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // Delete mutation
  const deleteInvoiceMutation = api.invoice.deleteGenerated.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted successfully");
      onRefetch();
      setDeleteModalOpen(false);
      setInvoiceToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete invoice: ${error.message}`);
    },
  });

  // Handle delete
  const handleDeleteClick = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      deleteInvoiceMutation.mutate({ id: invoiceToDelete });
    }
  };

  // Format currency with symbol
  const formatCurrencyWithSymbol = (amount: string, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency;
    const numAmount = parseFloat(amount);
    return `${symbol}${numAmount.toFixed(2)}`;
  };

  // Handle download PDF
  const handleDownloadPDF = async (invoice: GeneratedInvoice) => {
    try {
      const invoiceData = JSON.parse(invoice.invoiceData);
      
      const response = await fetch("/api/generate-invoice-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  // Handle share
  const handleShare = async (invoice: GeneratedInvoice) => {
    try {
      const invoiceData = JSON.parse(invoice.invoiceData);
      // Use the same sharing logic as in the generate invoice page
      const shareUrl = `${window.location.origin}/generateinvoice?id=${invoice.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Invoice link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading invoices...</p>
          </div>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No generated invoices yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first invoice using the advanced invoice generator
            </p>
            <Button onClick={onCreateInvoice}>
              <EditIcon className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium">Invoice #</th>
              <th className="text-left p-4 font-medium">Title</th>
              <th className="text-left p-4 font-medium">Date Issued</th>
              <th className="text-left p-4 font-medium">Due Date</th>
              <th className="text-left p-4 font-medium">Total Amount</th>
              <th className="text-left p-4 font-medium">Template</th>
              <th className="text-left p-4 font-medium">Language</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                  <div className="font-medium">{invoice.invoiceNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(invoice.createdAt)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="max-w-[200px] truncate">
                    {invoice.invoiceTitle || "—"}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {formatDate(invoice.dateOfIssue)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {formatDate(invoice.paymentDue)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-medium">
                    {formatCurrencyWithSymbol(invoice.totalAmount, invoice.currency)}
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="secondary" className="capitalize">
                    {invoice.template}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className="uppercase">
                    {invoice.language}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(invoice.id)}
                      title="Edit Invoice"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadPDF(invoice)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(invoice)}
                      title="Copy Link"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(invoice.id)}
                      title="Delete Invoice"
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteInvoiceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteInvoiceMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}