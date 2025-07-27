"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangleIcon,
  CheckIcon,
  CheckCircleIcon,
  TrashIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusColor } from "../utils/invoiceUtils";

interface InvoiceModalsProps {
  // Delete modal props
  deleteModalOpen: boolean;
  onDeleteModalClose: () => void;
  onDeleteConfirm: () => Promise<void>;
  isDeletingInvoice: boolean;

  // Status modal props
  statusModalOpen: boolean;
  onStatusModalClose: () => void;
  onStatusUpdateConfirm: () => Promise<void>;
  isUpdatingStatus: boolean;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  currentInvoiceStatus: string;
}

export const InvoiceModals = ({
  deleteModalOpen,
  onDeleteModalClose,
  onDeleteConfirm,
  isDeletingInvoice,
  statusModalOpen,
  onStatusModalClose,
  onStatusUpdateConfirm,
  isUpdatingStatus,
  selectedStatus,
  onStatusChange,
  currentInvoiceStatus,
}: InvoiceModalsProps) => {
  return (
    <>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={onDeleteModalClose}>
        <DialogContent className="max-w-[80vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="h-5 w-5 text-red-500" />
              <span>Delete Invoice</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between gap-4 sm:gap-0">
            <Button
              variant="outline"
              onClick={onDeleteModalClose}
              disabled={isDeletingInvoice}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteConfirm}
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
      <Dialog open={statusModalOpen} onOpenChange={onStatusModalClose}>
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
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Current Status:
              </label>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(currentInvoiceStatus)}`}
              >
                {currentInvoiceStatus.charAt(0).toUpperCase() +
                  currentInvoiceStatus.slice(1).replace("_", " ")}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                New Status:
              </label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
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
              onClick={onStatusModalClose}
              disabled={isUpdatingStatus}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={onStatusUpdateConfirm}
              disabled={
                isUpdatingStatus || selectedStatus === currentInvoiceStatus
              }
              className={`gap-2 cursor-pointer ${selectedStatus && selectedStatus !== currentInvoiceStatus ? getStatusColor(selectedStatus) : "bg-gray-100 text-gray-400"}`}
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
    </>
  );
};
