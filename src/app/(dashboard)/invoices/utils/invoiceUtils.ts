// Format currency
export const formatCurrency = (amount: string, currency: string) => {
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};

// Format date for display
export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(new Date(date));
};

// Get status badge styling classes
export const getStatusBadgeClasses = (status: string, dueDate: Date) => {
  // Check if pending invoice is overdue
  const now = new Date();
  // Only consider it overdue for display if specifically marked as overdue in database
  // or if it's both pending AND past due date
  const isOverdue = status === "overdue" || (status === "pending" && new Date(dueDate) < now);
  
  // Important: Update the display status but don't modify the actual status property
  const displayStatus = isOverdue ? "overdue" : status;
  
  switch (displayStatus) {
    case "pending":
      return {
        className: "rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800",
        text: "Pending"
      };
    case "overdue":
      return {
        className: "rounded-full bg-red-100 px-2 py-1 text-xs text-red-800",
        text: "Overdue"
      };
    case "paid":
      return {
        className: "rounded-full bg-green-100 px-2 py-1 text-xs text-green-800",
        text: "Paid"
      };
    case "cancelled":
      return {
        className: "rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800",
        text: "Cancelled"
      };
    case "draft":
      return {
        className: "rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800",
        text: "Draft"
      };
    case "partially_paid":
      return {
        className: "rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800",
        text: "Partially Paid"
      };
    default:
      return {
        className: "rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800",
        text: status
      };
  }
};

// Get a color class for the status button based on the status
export const getStatusColor = (status: string) => {
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

// Function to calculate days overdue
export const getDaysOverdue = (dueDate: string) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Add this function to check if invoice is overdue
export const isInvoiceOverdue = (dueDate: Date, status?: string) => {
  const now = new Date();
  // If status is provided, only consider overdue if it's explicitly "overdue" or if it's "pending" and past due date
  if (status) {
    return status === "overdue" || (status === "pending" && new Date(dueDate) < now);
  }
  // For backward compatibility with existing calls
  return new Date(dueDate) < now;
};

// Add this function to get days overdue or days until due
export const getInvoiceDays = (dueDate: Date) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Sort configuration type
export type SortConfig = {
  key: string;
  direction: 'ascending' | 'descending';
} | null;

// Sort invoices based on configuration
export const sortInvoices = (invoices: any[], sortConfig: SortConfig) => {
  if (!sortConfig) return invoices;
  
  return [...invoices].sort((a, b) => {
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'ascending' 
        ? parseFloat(a[sortConfig.key]) - parseFloat(b[sortConfig.key])
        : parseFloat(b[sortConfig.key]) - parseFloat(a[sortConfig.key]);
    } else if (sortConfig.key === 'dueDate' || sortConfig.key === 'issueDate') {
      return sortConfig.direction === 'ascending' 
        ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
        : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
    } else {
      // String comparison for other fields
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    }
  });
};

// Filter invoices based on search query
export const filterInvoices = (invoices: any[], searchQuery: string) => {
  if (searchQuery.trim() === "") {
    return invoices;
  }

  const query = searchQuery.toLowerCase();
  return invoices.filter(invoice => 
    invoice.clientName.toLowerCase().includes(query) || 
    invoice.invoiceNumber.toLowerCase().includes(query) ||
    invoice.clientEmail.toLowerCase().includes(query)
  );
};