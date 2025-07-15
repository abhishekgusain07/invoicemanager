"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { CreateInvoiceForm } from "@/components/create-invoice-form";
import { toast } from "sonner";

// Import new components
import { InvoiceTable } from "./components/InvoiceTable";
import { InvoiceFilters } from "./components/InvoiceFilters";
import { InvoiceModals } from "./components/InvoiceModals";
import { EmailTemplateModal } from "./components/EmailTemplateModal";
import { GmailConnectionBanner } from "./components/GmailConnectionBanner";

// Import hooks
import { useInvoiceData } from "./hooks/useInvoiceData";
import { useEmailTemplates } from "./hooks/useEmailTemplates";

// Main component starts here

export default function InvoicesPage() {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [invoiceToUpdate, setInvoiceToUpdate] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentInvoiceStatus, setCurrentInvoiceStatus] = useState<string>("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  // Use custom hooks
  const {
    invoices,
    filteredInvoices,
    isLoading,
    searchQuery,
    statusFilter,
    sortConfig,
    refreshReminders,
    isGmailConnected,
    checkingGmailConnection,
    setSearchQuery,
    setStatusFilter,
    handleSort,
    handleDeleteInvoice,
    handleUpdateInvoiceStatus,
    handleRefreshData,
    handleRefreshReminders,
  } = useInvoiceData();

  const { initializeTemplateContent } = useEmailTemplates();

  // Handle opening template modal
  const handleSendReminder = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error("Invoice not found");
      return;
    }

    // Determine default tone based on how overdue it is
    let defaultTone: "polite" | "firm" | "urgent" = "polite";
    
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffTime = now.getTime() - dueDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const isActuallyOverdue = invoice.status === "overdue" || 
      (invoice.status === "pending" && diffDays > 0);
    
    if (isActuallyOverdue) {
      if (diffDays > 14) {
        defaultTone = "urgent";
      } else if (diffDays > 7) {
        defaultTone = "firm";
      }
    }
    
    // Initialize template content
    initializeTemplateContent(defaultTone, invoice);
    
    setCurrentInvoiceId(invoiceId);
    setTemplateModalOpen(true);
  };

  // Handle edit invoice
  const handleEdit = (invoiceId: string) => {
    const invoiceToEdit = invoices.find(invoice => invoice.id === invoiceId);
    if (invoiceToEdit) {
      setEditingInvoice(invoiceToEdit);
      setIsModalOpen(true);
    } else {
      toast.error("Invoice not found");
    }
  };

  // Handle delete modal
  const openDeleteModal = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    
    setIsDeletingInvoice(true);
    try {
      const success = await handleDeleteInvoice(invoiceToDelete);
      if (success) {
        setDeleteModalOpen(false);
        setInvoiceToDelete(null);
      }
    } finally {
      setIsDeletingInvoice(false);
    }
  };

  // Handle status update modal
  const openUpdateStatusModal = (invoiceId: string, currentStatus: string) => {
    const targetInvoice = invoices.find(inv => inv.id === invoiceId);
    if (!targetInvoice) {
      toast.error("Invoice not found");
      return;
    }
    setInvoiceToUpdate(invoiceId);
    setSelectedStatus(targetInvoice.status);
    setCurrentInvoiceStatus(targetInvoice.status);
    setStatusModalOpen(true);
  };

  const handleUpdateStatusConfirm = async () => {
    if (!invoiceToUpdate) return;
    
    setIsUpdatingStatus(true);
    try {
      const success = await handleUpdateInvoiceStatus(invoiceToUpdate, selectedStatus);
      if (success) {
        setStatusModalOpen(false);
        setInvoiceToUpdate(null);
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingInvoice(null);
    handleRefreshData();
  }, [handleRefreshData]);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header and Actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage and track your client invoices
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
          <PlusIcon className="h-4 w-4 mr-2" /> New Invoice
        </Button>
      </div>

      {/* Gmail Connection Banner */}
      <GmailConnectionBanner 
        isGmailConnected={isGmailConnected}
        checkingGmailConnection={checkingGmailConnection}
      />

      {/* Search and Filter */}
      <InvoiceFilters 
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Invoices Table */}
      <InvoiceTable 
        filteredInvoices={filteredInvoices}
        isLoading={isLoading}
        sortConfig={sortConfig}
        refreshReminders={refreshReminders}
        onSort={handleSort}
        onEdit={handleEdit}
        onUpdateStatus={openUpdateStatusModal}
        onSendReminder={handleSendReminder}
        onDelete={openDeleteModal}
        onCreateInvoice={() => setIsModalOpen(true)}
      />

      {/* Modals */}
      <InvoiceModals 
        deleteModalOpen={deleteModalOpen}
        onDeleteModalClose={() => setDeleteModalOpen(false)}
        onDeleteConfirm={handleDeleteConfirm}
        isDeletingInvoice={isDeletingInvoice}
        statusModalOpen={statusModalOpen}
        onStatusModalClose={() => setStatusModalOpen(false)}
        onStatusUpdateConfirm={handleUpdateStatusConfirm}
        isUpdatingStatus={isUpdatingStatus}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        currentInvoiceStatus={currentInvoiceStatus}
      />

      {/* Email Template Modal */}
      <EmailTemplateModal 
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        currentInvoiceId={currentInvoiceId}
        invoices={invoices}
        refreshReminders={refreshReminders}
        onReminderSent={handleRefreshReminders}
      />

      {/* Invoice Creation/Editing Modal */}
      {isModalOpen && (
        <CreateInvoiceForm
          onClose={handleModalClose}
          initialData={editingInvoice}
          isEditing={!!editingInvoice}
        />
      )}
    </div>
  );
}

