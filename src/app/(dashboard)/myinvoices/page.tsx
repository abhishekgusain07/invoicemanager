"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, RefreshCw } from "lucide-react";
import { GeneratedInvoiceTable } from "./components/GeneratedInvoiceTable";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MyInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Fetch generated invoices using tRPC
  const {
    data: invoicesResult,
    isLoading,
    refetch: refetchInvoices,
  } = api.invoice.getGenerated.useQuery(
    { limit: 50, offset: 0 },
    {
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  const invoices = invoicesResult?.invoices || [];

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.invoiceTitle &&
        invoice.invoiceTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refetchInvoices();
      toast.success("Invoices refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh invoices");
    }
  };

  // Handle create new invoice
  const handleCreateInvoice = () => {
    router.push("/generateinvoice");
  };

  // Handle edit invoice
  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/generateinvoice?id=${invoiceId}`);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header and Actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            My Generated Invoices
          </h2>
          <p className="text-muted-foreground">
            View and manage your generated invoices from the advanced invoice
            generator
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleCreateInvoice} className="w-full md:w-auto">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Invoice
          </Button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search invoices by number or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <GeneratedInvoiceTable
        invoices={filteredInvoices}
        isLoading={isLoading}
        onEdit={handleEditInvoice}
        onRefetch={refetchInvoices}
        onCreateInvoice={handleCreateInvoice}
      />
    </div>
  );
}
