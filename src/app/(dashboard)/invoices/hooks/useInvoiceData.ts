"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
import {
  filterInvoices,
  sortInvoices,
  SortConfig,
} from "../utils/invoiceUtils";

export const useInvoiceData = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "dueDate",
    direction: "ascending",
  });
  const [refreshReminders, setRefreshReminders] = useState(0);

  // Use tRPC queries for data fetching
  const { 
    data: invoices = [], 
    isLoading: isLoadingInvoices, 
    error: invoicesError,
    refetch: refetchInvoices 
  } = api.invoice.getByStatus.useQuery(
    { status: statusFilter as "pending" | "paid" | "overdue" | "all" },
    {
      enabled: !isUserLoading && !!user,
      staleTime: 2 * 60 * 1000, // 2 minutes for invoice data
      refetchOnWindowFocus: false,
    }
  );

  // Use tRPC query for Gmail connection status
  const { 
    data: gmailConnectionData, 
    isLoading: checkingGmailConnection 
  } = api.connections.checkGmailConnection.useQuery(
    undefined,
    {
      enabled: !isUserLoading && !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes for connection status
      refetchOnWindowFocus: false,
    }
  );

  const isGmailConnected = gmailConnectionData?.isConnected ?? false;

  // Client-side filtering and sorting with useMemo for performance
  const filteredInvoices = useMemo(() => {
    if (!invoices.length) return [];
    
    const filtered = filterInvoices(invoices, searchQuery);
    return sortInvoices(filtered, sortConfig);
  }, [invoices, searchQuery, sortConfig]);

  // Handle errors
  useEffect(() => {
    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      toast.error("Failed to load invoices");
    }
  }, [invoicesError]);

  // tRPC mutations for invoice operations
  const deleteInvoiceMutation = api.invoice.delete.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted successfully");
      // Invalidate and refetch invoices
      refetchInvoices();
    },
    onError: (error) => {
      console.error("Error deleting invoice:", error);
      toast.error(error.message || "Failed to delete invoice");
    },
  });

  const updateInvoiceStatusMutation = api.invoice.updateStatus.useMutation({
    onSuccess: (data, variables) => {
      toast.success(`Invoice status updated to ${variables.status} successfully`);
      // Invalidate and refetch invoices
      refetchInvoices();
    },
    onError: (error) => {
      console.error("Error updating invoice status:", error);
      toast.error(error.message || "Failed to update invoice status");
    },
  });

  // Handle sort click
  const handleSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";

    if (sortConfig && sortConfig.key === key) {
      direction =
        sortConfig.direction === "ascending" ? "descending" : "ascending";
    }

    setSortConfig({ key, direction });
  };

  // Delete invoice with optimistic updates
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoiceMutation.mutateAsync({ id: invoiceId });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Update invoice status with optimistic updates
  const handleUpdateInvoiceStatus = async (
    invoiceId: string,
    newStatus: string
  ) => {
    try {
      await updateInvoiceStatusMutation.mutateAsync({
        id: invoiceId,
        status: newStatus as any,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Refresh data after modal close
  const handleRefreshData = () => {
    refetchInvoices();
  };

  // Increment refresh trigger for reminders
  const handleRefreshReminders = () => {
    setRefreshReminders((prev) => prev + 1);
  };

  return {
    // Data
    invoices,
    filteredInvoices,
    isLoading: isLoadingInvoices,
    searchQuery,
    statusFilter,
    sortConfig,
    refreshReminders,
    isGmailConnected,
    checkingGmailConnection,

    // Mutation states
    isDeletingInvoice: deleteInvoiceMutation.isPending,
    isUpdatingStatus: updateInvoiceStatusMutation.isPending,

    // Setters
    setSearchQuery,
    setStatusFilter,
    setSortConfig,

    // Actions
    handleSort,
    handleDeleteInvoice,
    handleUpdateInvoiceStatus,
    handleRefreshData,
    handleRefreshReminders,
    refetchInvoices,
  };
};
