"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PlusIcon, SearchIcon, EditIcon, 
  CheckCircleIcon, MailIcon, TrashIcon, 
  ChevronDownIcon, ChevronUpIcon,
  AlertTriangleIcon,
  CheckIcon,
  CalendarIcon,
  SendIcon,
  XIcon,
  Clock8Icon,
  HeartIcon,
  ThumbsUpIcon
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { CreateInvoiceForm } from "@/components/create-invoice-form";
import { getInvoicesByStatus, deleteInvoice, markInvoiceAsPaid, updateInvoiceStatus } from "@/actions/invoice";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { logDebug } from "@/utils/debug";

export default function InvoicesPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>({ key: 'dueDate', direction: 'ascending' });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [invoiceToUpdate, setInvoiceToUpdate] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [currentInvoiceStatus, setCurrentInvoiceStatus] = useState<string>("");
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  
  // New state for reminder modal
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("polite");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [thankYouSent, setThankYouSent] = useState(false);

  // Add a new state for edited template content
  const [editedEmailContent, setEditedEmailContent] = useState<string>("");

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (isUserLoading || !user) return;
      
      setIsLoading(true);
      try {
        const data = await getInvoicesByStatus(statusFilter as any);
        
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user, isUserLoading, statusFilter]);

  // Filter invoices when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInvoices(invoices);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = invoices.filter(invoice => 
      invoice.clientName.toLowerCase().includes(query) || 
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.clientEmail.toLowerCase().includes(query)
    );
    
    setFilteredInvoices(filtered);
  }, [searchQuery, invoices]);

  // Format currency
  const formatCurrency = (amount: string, currency: string) => {
    return `${currency} ${parseFloat(amount).toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(date));
  };

  // Calculate and return last reminder information
  const getLastReminder = (invoice: any) => {
    // Placeholder for now - would be replaced with actual logic
    return "—";
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status: string, dueDate: Date) => {
    // Check if pending invoice is overdue
    const now = new Date();
    const isOverdue = status === "pending" && new Date(dueDate) < now;
    
    // Important: Update the display status but don't modify the actual status property
    const displayStatus = isOverdue ? "overdue" : status;
    
    switch (displayStatus) {
      case "pending":
        return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Pending</span>;
      case "overdue":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Overdue</span>;
      case "paid":
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Paid</span>;
      case "cancelled":
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">Cancelled</span>;
      case "draft":
        return <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">Draft</span>;
      case "partially_paid":
        return <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">Partially Paid</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">{status}</span>;
    }
  };

  // Handle sort click
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedInvoices = [...filteredInvoices].sort((a, b) => {
      if (key === 'amount') {
        return direction === 'ascending' 
          ? parseFloat(a[key]) - parseFloat(b[key])
          : parseFloat(b[key]) - parseFloat(a[key]);
      } else if (key === 'dueDate' || key === 'issueDate') {
        return direction === 'ascending' 
          ? new Date(a[key]).getTime() - new Date(b[key]).getTime()
          : new Date(b[key]).getTime() - new Date(a[key]).getTime();
      } else {
        // String comparison for other fields
        if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
        return 0;
      }
    });
    
    setFilteredInvoices(sortedInvoices);
  };

  // Render sort indicator
  const renderSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronUpIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-50" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ChevronUpIcon className="h-3 w-3 text-muted-foreground" />
      : <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />;
  };

  // Action handlers
  const handleEdit = (invoiceId: string) => {
    // Find the invoice to edit
    const invoiceToEdit = invoices.find(invoice => invoice.id === invoiceId);
    if (invoiceToEdit) {
      setEditingInvoice(invoiceToEdit);
      setIsModalOpen(true);
    } else {
      toast.error("Invoice not found");
    }
  };

  const handleSendReminder = (invoiceId: string) => {
    // Find the selected invoice
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      // Check if the thank you email has been sent (this would be stored in your DB)
      setThankYouSent(invoice.thankYouEmailSent || false);
      // Initialize the edited content based on template
      const initialTemplate = invoice.status === 'paid' ? 'thankYou' : 'polite';
      setEditedEmailContent(getEmailContent(initialTemplate, invoice));
      setReminderModalOpen(true);
    } else {
      toast.error("Invoice not found");
    }
  };

  const openDeleteModal = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    
    setIsDeletingInvoice(true);
    try {
      const result = await deleteInvoice(invoiceToDelete);
      if (result.success) {
        toast.success("Invoice deleted successfully");
        // Remove the invoice ONLY from the main local state
        const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceToDelete);
        setInvoices(updatedInvoices);
        
        // // Remove direct update to filteredInvoices
        // setFilteredInvoices(filteredInvoices.filter(invoice => invoice.id !== invoiceToDelete));
      } else {
        toast.error(result.error || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("An error occurred while deleting the invoice");
    } finally {
      setIsDeletingInvoice(false);
      setDeleteModalOpen(false);
      setInvoiceToDelete(null);
    }
  };

  // Update status modal
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
      const result = await updateInvoiceStatus(invoiceToUpdate, selectedStatus as any);
      
      if (result.success) {
        toast.success(`Invoice status updated to ${selectedStatus} successfully`);
        
        // Update the invoice in the local state
        setInvoices(prev => prev.map(inv => 
          inv.id === invoiceToUpdate ? {...inv, status: selectedStatus} : inv
        ));
        
        // Update filtered invoices too
        setFilteredInvoices(prev => prev.map(inv => 
          inv.id === invoiceToUpdate ? {...inv, status: selectedStatus} : inv
        ));
      } else {
        toast.error(result.error || "Failed to update invoice status");
      }
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("An error occurred while updating the invoice");
    } finally {
      setIsUpdatingStatus(false);
      setStatusModalOpen(false);
      setInvoiceToUpdate(null);
    }
  };

  // Get a color class for the status button based on the status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "paid": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "overdue": return "bg-red-100 text-red-800 hover:bg-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "draft": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "partially_paid": return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Use useCallback to prevent recreating this function on every render
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingInvoice(null);
    // Refresh the data after creating/editing an invoice
    getInvoicesByStatus(statusFilter as any)
      .then(data => {
        setInvoices(data);
        setFilteredInvoices(data);
      })
      .catch(error => {
        console.error("Error refreshing invoices:", error);
      });
  }, [statusFilter, setInvoices, setFilteredInvoices, setIsModalOpen, setEditingInvoice]);

  // Update the template selection to also update edited content
  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    if (selectedInvoice) {
      setEditedEmailContent(getEmailContent(value, selectedInvoice));
    }
  };

  // Update the sendEmail function to use edited content
  const sendEmail = async (templateType: string) => {
    if (!selectedInvoice) return;
    
    setIsSendingEmail(true);
    
    try {
      // This would be your server action to send the email
      // const result = await sendInvoiceEmail({
      //   invoiceId: selectedInvoice.id,
      //   templateType,
      //   clientEmail: selectedInvoice.clientEmail,
      //   clientName: selectedInvoice.clientName,
      //   emailContent: editedEmailContent // Use the edited content
      // });
      
      // For now, simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If paid invoice, mark that thank you email was sent
      if (selectedInvoice.status === 'paid') {
        // Update local state
        setThankYouSent(true);
        
        // You'd also want to update this in your database
        // await updateInvoice(selectedInvoice.id, { thankYouEmailSent: true });
        
        // Update the invoice in local state
        const updatedInvoices = invoices.map(inv => 
          inv.id === selectedInvoice.id 
            ? { ...inv, thankYouEmailSent: true } 
            : inv
        );
        setInvoices(updatedInvoices);
        setFilteredInvoices(filteredInvoices.map(inv => 
          inv.id === selectedInvoice.id 
            ? { ...inv, thankYouEmailSent: true } 
            : inv
        ));
      }
      
      toast.success(`Email sent successfully to ${selectedInvoice.clientName}`);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Function to calculate days overdue
  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Function to get email content based on template
  const getEmailContent = (templateType: string, invoice: any) => {
    const templates = {
      polite: `
Dear ${invoice.clientName},

I hope this email finds you well. I wanted to send a gentle reminder that invoice #${invoice.invoiceNumber} for ${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)} was due on ${formatDate(invoice.dueDate)}.

If you've already sent the payment, please disregard this message. Otherwise, I would appreciate it if you could process this payment at your earliest convenience.

Thank you for your attention to this matter.

Best regards,
[Your Company Name]
      `,
      firm: `
Dear ${invoice.clientName},

This is a reminder that invoice #${invoice.invoiceNumber} for ${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)} is now ${getDaysOverdue(invoice.dueDate)} days overdue.

Please process this payment as soon as possible to avoid any late fees.

If you have any questions about this invoice, please don't hesitate to contact us.

Regards,
[Your Company Name]
      `,
      urgent: `
Dear ${invoice.clientName},

URGENT REMINDER: Invoice #${invoice.invoiceNumber} for ${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)} is now ${getDaysOverdue(invoice.dueDate)} days overdue.

This requires your immediate attention. Please process this payment within 48 hours to avoid additional late fees and potential service interruptions.

If you're experiencing difficulties with payment, please contact us immediately to discuss payment options.

Sincerely,
[Your Company Name]
      `,
      thankYou: `
Dear ${invoice.clientName},

Thank you for your prompt payment of invoice #${invoice.invoiceNumber} for ${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}.

We greatly appreciate your business and look forward to working with you again in the future.

Best regards,
[Your Company Name]
      `
    };
    
    return templates[templateType as keyof typeof templates] || templates.polite;
  };

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

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by client or invoice number..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <div className="relative overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr className="border-b">
              <th 
                className="group cursor-pointer p-4 font-medium"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center gap-1">
                  Client {renderSortIndicator('clientName')}
                </div>
              </th>
              <th 
                className="group cursor-pointer p-4 font-medium"
                onClick={() => handleSort('invoiceNumber')}
              >
                <div className="flex items-center gap-1">
                  Invoice # {renderSortIndicator('invoiceNumber')}
                </div>
              </th>
              <th 
                className="group cursor-pointer p-4 font-medium"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center gap-1">
                  Amount {renderSortIndicator('amount')}
                </div>
              </th>
              <th 
                className="group cursor-pointer p-4 font-medium"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center gap-1">
                  Due Date {renderSortIndicator('dueDate')}
                </div>
              </th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Last Reminder</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton loaders
              Array(5).fill(0).map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4"><div className="h-5 w-32 animate-pulse bg-muted rounded"></div></td>
                  <td className="p-4"><div className="h-5 w-24 animate-pulse bg-muted rounded"></div></td>
                  <td className="p-4"><div className="h-5 w-20 animate-pulse bg-muted rounded"></div></td>
                  <td className="p-4"><div className="h-5 w-28 animate-pulse bg-muted rounded"></div></td>
                  <td className="p-4"><div className="h-5 w-20 animate-pulse bg-muted rounded"></div></td>
                  <td className="p-4"><div className="h-5 w-24 animate-pulse bg-muted rounded"></div></td>
                  <td className="p-4"><div className="h-5 w-16 animate-pulse bg-muted rounded"></div></td>
                </tr>
              ))
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{invoice.clientName}</div>
                      <div className="text-xs text-muted-foreground">{invoice.clientEmail}</div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">{invoice.invoiceNumber}</td>
                  <td className="p-4">{formatCurrency(invoice.amount, invoice.currency)}</td>
                  <td className="p-4">{formatDate(invoice.dueDate)}</td>
                  <td className="p-4">{getStatusBadge(invoice.status, invoice.dueDate)}</td>
                  <td className="p-4 text-muted-foreground">{getLastReminder(invoice)}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => handleEdit(invoice.id)}
                        title="Edit Invoice"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-green-600" 
                        onClick={() => openUpdateStatusModal(invoice.id, invoice.status)}
                        title="Update Status"
                      >
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-blue-600" 
                        onClick={() => handleSendReminder(invoice.id)}
                        title="Send Reminder"
                      >
                        <MailIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-red-600" 
                        onClick={() => openDeleteModal(invoice.id)}
                        title="Delete Invoice"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="text-muted-foreground">
                      {searchQuery ? "No invoices match your search" : "No invoices found"}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-2"
                    >
                      Create your first invoice
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-[80vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-red-500" />
              <span>Delete Invoice</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between gap-4 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeletingInvoice}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isDeletingInvoice}
              className="gap-2 cursor-pointer"
            >
              {isDeletingInvoice ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  Delete Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="max-w-[80vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-blue-500" />
              <span>Update Invoice Status</span>
            </DialogTitle>
            <DialogDescription>
              Select a new status for this invoice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Current Status:</label>
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(currentInvoiceStatus)}`}>
                {currentInvoiceStatus.charAt(0).toUpperCase() + currentInvoiceStatus.slice(1).replace('_', ' ')}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">New Status:</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between gap-4 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setStatusModalOpen(false)}
              disabled={isUpdatingStatus}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleUpdateStatusConfirm}
              disabled={isUpdatingStatus || selectedStatus === currentInvoiceStatus}
              className={`gap-2 cursor-pointer ${selectedStatus && selectedStatus !== currentInvoiceStatus ? getStatusColor(selectedStatus) : 'bg-gray-100 text-gray-400'}`}
            >
              {isUpdatingStatus ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Creation/Editing Modal */}
      {isModalOpen && (
        <CreateInvoiceForm
          onClose={handleModalClose}
          initialData={editingInvoice}
          isEditing={!!editingInvoice}
        />
      )}

      {/* Reminder Modal */}
      <Dialog open={reminderModalOpen} onOpenChange={setReminderModalOpen}>
        <DialogContent 
          className="w-[70%] h-[70%] max-h-[80vh] max-w-[1400px] !min-w-[80vw] !mx-auto overflow-hidden"
          style={{ width: '60%', maxWidth: '90vw', height: 'fit-content', maxHeight: '99vh' }}
        >
          {selectedInvoice && (
            <>
              <DialogHeader className="pb-2">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <MailIcon className="h-5 w-5 text-primary" />
                  <span>
                    {selectedInvoice.status === 'paid' ? 'Send Thank You Email' : 'Send Payment Reminder'}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Invoice #{selectedInvoice.invoiceNumber} for {selectedInvoice.clientName}
                </DialogDescription>
              </DialogHeader>

              {/* For paid invoices */}
              {selectedInvoice.status === 'paid' ? (
                <div className="py-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="mb-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center border border-green-100">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100 mb-2">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">Payment Received</h3>
                    <p className="text-green-700 text-sm">
                      This invoice has been paid in full on {formatDate(selectedInvoice.paidDate || new Date())}.
                    </p>
                    <div className="mt-3 flex justify-center gap-2">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 py-0.5 text-xs">
                        <CheckIcon className="mr-1 h-3 w-3" /> Paid
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 py-0.5 text-xs">
                        <CalendarIcon className="mr-1 h-3 w-3" /> {formatDate(selectedInvoice.paidDate || new Date())}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 py-0.5 text-xs">
                        <ThumbsUpIcon className="mr-1 h-3 w-3" /> {selectedInvoice.currency} {parseFloat(selectedInvoice.amount).toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  <Card className="border-green-100 shadow-sm">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-base text-green-700 flex items-center gap-2">
                        <HeartIcon className="h-4 w-4" /> Thank You Email Preview
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Send a thank you email to your client for their payment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted-foreground">Edit email content below:</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() => setEditedEmailContent(getEmailContent('thankYou', selectedInvoice))}
                          >
                            Reset to default
                          </Button>
                        </div>
                        <textarea 
                          className="rounded-md border bg-slate-50 p-3 font-mono text-sm w-full min-h-[250px] resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                          value={editedEmailContent}
                          onChange={(e) => setEditedEmailContent(e.target.value)}
                          disabled={isSendingEmail}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        onClick={() => sendEmail('thankYou')} 
                        disabled={thankYouSent || isSendingEmail}
                        className={cn(
                          "w-full gap-2", 
                          thankYouSent ? "bg-gray-100 text-gray-500" : "bg-green-600 hover:bg-green-700 text-white"
                        )}
                        size="sm"
                      >
                        {isSendingEmail ? (
                          <>
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Sending...
                          </>
                        ) : thankYouSent ? (
                          <>
                            <CheckCircleIcon className="h-3.5 w-3.5" />
                            Thank You Email Already Sent
                          </>
                        ) : (
                          <>
                            <SendIcon className="h-3.5 w-3.5" />
                            Send Thank You Email
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                // For pending/overdue invoices
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-3">
                  <div className={cn(
                    "rounded-lg p-4 text-center border h-fit",
                    getDaysOverdue(selectedInvoice.dueDate) > 0 
                      ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-100" 
                      : "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100"
                  )}>
                    <div className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full mb-2",
                      getDaysOverdue(selectedInvoice.dueDate) > 0 ? "bg-red-100" : "bg-yellow-100"
                    )}>
                      {getDaysOverdue(selectedInvoice.dueDate) > 0 ? (
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                      ) : (
                        <Clock8Icon className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <h3 className={cn(
                      "text-lg font-semibold",
                      getDaysOverdue(selectedInvoice.dueDate) > 0 ? "text-red-800" : "text-yellow-800"
                    )}>
                      {getDaysOverdue(selectedInvoice.dueDate) > 0 
                        ? `Overdue by ${getDaysOverdue(selectedInvoice.dueDate)} days` 
                        : "Payment Pending"}
                    </h3>
                    <p className={cn("text-sm", getDaysOverdue(selectedInvoice.dueDate) > 0 ? "text-red-700" : "text-yellow-700")}>
                      {getDaysOverdue(selectedInvoice.dueDate) > 0 
                        ? `This invoice was due on ${formatDate(selectedInvoice.dueDate)}.` 
                        : `This invoice is due on ${formatDate(selectedInvoice.dueDate)}.`}
                    </p>
                    <div className="mt-3 flex justify-center gap-2">
                      <Badge className={cn(
                        "py-0.5 text-xs",
                        getDaysOverdue(selectedInvoice.dueDate) > 0 
                          ? "bg-red-100 text-red-800 hover:bg-red-200" 
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      )}>
                        {getDaysOverdue(selectedInvoice.dueDate) > 0 ? (
                          <>
                            <AlertTriangleIcon className="mr-1 h-3 w-3" /> Overdue
                          </>
                        ) : (
                          <>
                            <Clock8Icon className="mr-1 h-3 w-3" /> Pending
                          </>
                        )}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 py-0.5 text-xs">
                        <CalendarIcon className="mr-1 h-3 w-3" /> Due: {formatDate(selectedInvoice.dueDate)}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 py-0.5 text-xs">
                        {selectedInvoice.currency} {parseFloat(selectedInvoice.amount).toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  <Card className="shadow-sm h-fit">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-base text-primary flex items-center gap-2">
                        <MailIcon className="h-4 w-4" /> Email Reminder
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Choose a template tone for your reminder
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-3">
                      <Tabs defaultValue="polite" value={selectedTemplate} onValueChange={handleTemplateChange}>
                        <TabsList className="w-full grid grid-cols-3 mb-3 h-8">
                          <TabsTrigger value="polite" className="text-xs data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
                            Polite
                          </TabsTrigger>
                          <TabsTrigger value="firm" className="text-xs data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800">
                            Firm
                          </TabsTrigger>
                          <TabsTrigger value="urgent" className="text-xs data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                            Urgent
                          </TabsTrigger>
                        </TabsList>

                        <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">Edit email content below:</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => setEditedEmailContent(getEmailContent(selectedTemplate, selectedInvoice))}
                            >
                              Reset to default
                            </Button>
                          </div>
                          <textarea 
                            className="rounded-md border bg-slate-50 p-3 font-mono text-sm w-full min-h-[250px] resize-none focus:outline-none focus:ring-1 focus:ring-primary" 
                            value={editedEmailContent}
                            onChange={(e) => setEditedEmailContent(e.target.value)}
                            disabled={isSendingEmail}
                          />
                        </div>
                      </Tabs>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        onClick={() => sendEmail(selectedTemplate)} 
                        disabled={isSendingEmail}
                        className="w-full gap-2"
                        size="sm"
                        variant={selectedTemplate === 'polite' ? 'default' : selectedTemplate === 'firm' ? 'secondary' : 'destructive'}
                      >
                        {isSendingEmail ? (
                          <>
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <SendIcon className="h-3.5 w-3.5" />
                            Send {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Reminder
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}