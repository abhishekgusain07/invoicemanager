"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PlusIcon, SearchIcon, EditIcon, 
  CheckCircleIcon, MailIcon, TrashIcon, 
  ChevronDownIcon, ChevronUpIcon,
  AlertTriangleIcon
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { CreateInvoiceForm } from "@/components/create-invoice-form";
import { getInvoicesByStatus, deleteInvoice } from "@/actions/invoice";
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

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (isUserLoading || !user) return;
      
      setIsLoading(true);
      try {
        const data = await getInvoicesByStatus(statusFilter as any);
        console.log("invoice response", data);
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
    // Placeholder for edit action
    toast.info("Edit feature coming soon");
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    // Placeholder for mark as paid action
    toast.info("Mark as paid feature coming soon");
  };

  const handleSendReminder = (invoiceId: string) => {
    // Placeholder for send reminder action
    toast.info("Send reminder feature coming soon");
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
        // Remove the invoice from the local state
        const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceToDelete);
        setInvoices(updatedInvoices);
        setFilteredInvoices(filteredInvoices.filter(invoice => invoice.id !== invoiceToDelete));
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
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
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
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        title="Mark as Paid"
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

      {/* Invoice Creation Modal */}
      {isModalOpen && (
        <CreateInvoiceForm
          onClose={() => {
            setIsModalOpen(false);
            // Refresh the data after creating a new invoice
            getInvoicesByStatus(statusFilter as any)
              .then(data => {
                setInvoices(data);
                setFilteredInvoices(data);
              })
              .catch(error => {
                console.error("Error refreshing invoices:", error);
              });
          }}
        />
      )}
    </div>
  );
}