"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EditIcon,
  CheckCircleIcon,
  MailIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClasses,
  SortConfig,
} from "../utils/invoiceUtils";
import { api } from "@/lib/trpc";

interface InvoiceTableProps {
  filteredInvoices: any[];
  isLoading: boolean;
  sortConfig: SortConfig;
  refreshReminders: number;
  onSort: (key: string) => void;
  onEdit: (invoiceId: string) => void;
  onUpdateStatus: (invoiceId: string, currentStatus: string) => void;
  onSendReminder: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
  onCreateInvoice: () => void;
}

// ✅ NEW: Enhanced LastReminderCell using tRPC
const EnhancedLastReminderCell = ({
  invoice,
  refreshReminders,
}: {
  invoice: any;
  refreshReminders: number;
}) => {
  // ✅ Using tRPC queries instead of useEffect + server actions
  const { data: historyResult, isLoading: historyLoading } =
    api.reminder.getInvoiceReminderHistory.useQuery(
      { invoiceId: invoice.id },
      {
        enabled: !!invoice.id,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false,
      }
    );

  const { data: lastReminderResult, isLoading: lastReminderLoading } =
    api.reminder.getLastReminderSent.useQuery(
      { invoiceId: invoice.id },
      {
        enabled: !!invoice.id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      }
    );

  const isLoading = historyLoading || lastReminderLoading;
  const reminderCount = historyResult?.data?.length || 0;
  const lastReminder = lastReminderResult;

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="h-4 w-16 animate-pulse bg-muted rounded"></div>
        <div className="h-3 w-12 animate-pulse bg-muted rounded mt-1"></div>
      </div>
    );
  }

  if (!lastReminder) {
    return (
      <div className="flex flex-col">
        <span className="text-muted-foreground">—</span>
        <span className="text-xs font-medium text-muted-foreground">
          {reminderCount} sent
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium">
        {formatDate(lastReminder.sentAt)}
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {reminderCount} sent
      </span>
    </div>
  );
};

export const InvoiceTable = ({
  filteredInvoices,
  isLoading,
  sortConfig,
  refreshReminders,
  onSort,
  onEdit,
  onUpdateStatus,
  onSendReminder,
  onDelete,
  onCreateInvoice,
}: InvoiceTableProps) => {
  // Render sort indicator
  const renderSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return (
        <ChevronUpIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-50" />
      );
    }

    return sortConfig.direction === "ascending" ? (
      <ChevronUpIcon className="h-3 w-3 text-muted-foreground" />
    ) : (
      <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />
    );
  };

  return (
    <div className="relative overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr className="border-b">
            <th
              className="group cursor-pointer p-4 font-medium"
              onClick={() => onSort("clientName")}
            >
              <div className="flex items-center gap-1">
                Client {renderSortIndicator("clientName")}
              </div>
            </th>
            <th
              className="group cursor-pointer p-4 font-medium"
              onClick={() => onSort("invoiceNumber")}
            >
              <div className="flex items-center gap-1">
                Invoice # {renderSortIndicator("invoiceNumber")}
              </div>
            </th>
            <th
              className="group cursor-pointer p-4 font-medium"
              onClick={() => onSort("amount")}
            >
              <div className="flex items-center gap-1">
                Amount {renderSortIndicator("amount")}
              </div>
            </th>
            <th
              className="group cursor-pointer p-4 font-medium"
              onClick={() => onSort("dueDate")}
            >
              <div className="flex items-center gap-1">
                Due Date {renderSortIndicator("dueDate")}
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
            Array(5)
              .fill(0)
              .map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="p-4">
                    <div className="h-5 w-32 animate-pulse bg-muted rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-24 animate-pulse bg-muted rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-20 animate-pulse bg-muted rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-28 animate-pulse bg-muted rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-20 animate-pulse bg-muted rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-24 animate-pulse bg-muted rounded"></div>
                  </td>
                  <td className="p-4">
                    <div className="h-5 w-16 animate-pulse bg-muted rounded"></div>
                  </td>
                </tr>
              ))
          ) : filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                  <div>
                    <div className="font-medium">{invoice.clientName}</div>
                    <div className="text-xs text-muted-foreground">
                      {invoice.clientEmail}
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs">
                  {invoice.invoiceNumber}
                </td>
                <td className="p-4">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </td>
                <td className="p-4">{formatDate(invoice.dueDate)}</td>
                <td className="p-4">
                  {(() => {
                    const statusBadge = getStatusBadgeClasses(
                      invoice.status,
                      invoice.dueDate
                    );
                    return (
                      <span className={statusBadge.className}>
                        {statusBadge.text}
                      </span>
                    );
                  })()}
                </td>
                <td className="p-4">
                  <EnhancedLastReminderCell
                    invoice={invoice}
                    refreshReminders={refreshReminders}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEdit(invoice.id)}
                      title="Edit Invoice"
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-600"
                      onClick={() => onUpdateStatus(invoice.id, invoice.status)}
                      title="Update Status"
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-600"
                      onClick={() => onSendReminder(invoice.id)}
                      title="Send Reminder"
                    >
                      <MailIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600"
                      onClick={() => onDelete(invoice.id)}
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
                  <div className="text-muted-foreground">No invoices found</div>
                  <Button
                    variant="outline"
                    onClick={onCreateInvoice}
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
  );
};
