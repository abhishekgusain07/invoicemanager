"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { getInvoicesByStatus, deleteInvoice, updateInvoiceStatus } from "@/actions/invoice";
import { checkGmailConnection } from "@/actions/gmail";
import { toast } from "sonner";
import { filterInvoices, sortInvoices, SortConfig } from "../utils/invoiceUtils";

export const useInvoiceData = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'dueDate', direction: 'ascending' });
  const [refreshReminders, setRefreshReminders] = useState(0);

  // Gmail connection state
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false);
  const [checkingGmailConnection, setCheckingGmailConnection] = useState<boolean>(true);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    if (isUserLoading || !user) return;
    
    setIsLoading(true);
    try {
      const data = await getInvoicesByStatus(statusFilter as any);
      console.log("Fetched invoices:", data);
      
      // Verify the statuses of each invoice
      data.forEach((invoice: any) => {
        console.log(`Invoice ${invoice.invoiceNumber}: status=${invoice.status}, dueDate=${invoice.dueDate}`);
      });
      
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  }, [user, isUserLoading, statusFilter]);

  // Check Gmail connection status
  const checkGmailConnectionStatus = useCallback(async () => {
    if (isUserLoading || !user) return;
    
    setCheckingGmailConnection(true);
    try {
      const { isConnected } = await checkGmailConnection(user.id);
      setIsGmailConnected(isConnected);
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
    } finally {
      setCheckingGmailConnection(false);
    }
  }, [user, isUserLoading]);

  // Effects
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    checkGmailConnectionStatus();
  }, [checkGmailConnectionStatus]);

  // Filter invoices when search query changes
  useEffect(() => {
    const filtered = filterInvoices(invoices, searchQuery);
    const sorted = sortInvoices(filtered, sortConfig);
    setFilteredInvoices(sorted);
  }, [searchQuery, invoices, sortConfig]);

  // Handle sort click
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);
    
    const sorted = sortInvoices(filteredInvoices, newSortConfig);
    setFilteredInvoices(sorted);
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const result = await deleteInvoice(invoiceId);
      if (result.success) {
        toast.success("Invoice deleted successfully");
        // Remove the invoice from the main local state
        const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
        setInvoices(updatedInvoices);
        return true;
      } else {
        toast.error(result.error || "Failed to delete invoice");
        return false;
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("An error occurred while deleting the invoice");
      return false;
    }
  };

  // Update invoice status
  const handleUpdateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const result = await updateInvoiceStatus(invoiceId, newStatus as any);
      
      if (result.success) {
        toast.success(`Invoice status updated to ${newStatus} successfully`);
        
        // Update the invoice in the local state
        setInvoices(prev => prev.map(inv => 
          inv.id === invoiceId ? {...inv, status: newStatus} : inv
        ));
        
        // Update filtered invoices too
        setFilteredInvoices(prev => prev.map(inv => 
          inv.id === invoiceId ? {...inv, status: newStatus} : inv
        ));
        return true;
      } else {
        toast.error(result.error || "Failed to update invoice status");
        return false;
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("An error occurred while updating the invoice");
      return false;
    }
  };

  // Refresh data after modal close
  const handleRefreshData = useCallback(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Increment refresh trigger for reminders
  const handleRefreshReminders = () => {
    setRefreshReminders(prev => prev + 1);
  };

  return {
    // Data
    invoices,
    filteredInvoices,
    isLoading,
    searchQuery,
    statusFilter,
    sortConfig,
    refreshReminders,
    isGmailConnected,
    checkingGmailConnection,

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
    fetchInvoices,
  };
};