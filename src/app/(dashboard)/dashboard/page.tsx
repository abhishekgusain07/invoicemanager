"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ClockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  DollarSignIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { CreateInvoiceForm } from "@/components/create-invoice-form";
import { api } from "@/lib/trpc";
import { toast } from "sonner";

// Default chart data structure
const defaultChartData = [
  { name: "Jan", amount: 0 },
  { name: "Feb", amount: 0 },
  { name: "Mar", amount: 0 },
  { name: "Apr", amount: 0 },
  { name: "May", amount: 0 },
  { name: "Jun", amount: 0 },
];

// Default stats structure
const defaultStats = {
  pendingInvoices: 0,
  overdueInvoices: 0,
  paidInvoices: 0,
  outstandingAmount: "$0.00",
  recentInvoices: [] as Array<any>,
};

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  
  // Use tRPC query for dashboard data
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch: refetchDashboardData 
  } = api.dashboard.getAllDashboardData.useQuery(
    undefined, // no input needed
    {
      enabled: !isUserLoading && !!user, // Only run when user is loaded
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Extract data with fallbacks
  const invoiceStats = dashboardData?.stats || defaultStats;
  const chartData = dashboardData?.monthlyData || defaultChartData;
  const hasInvoices = invoiceStats.recentInvoices.length > 0;

  // Handle errors
  if (error) {
    console.error("Error fetching dashboard data:", error);
    toast.error("Failed to load dashboard data");
  }

  // Format status for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
            Pending
          </span>
        );
      case "overdue":
        return (
          <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
            Overdue
          </span>
        );
      case "paid":
        return (
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
            Paid
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  // Calculate total invoices
  const totalInvoices =
    invoiceStats.pendingInvoices +
    invoiceStats.overdueInvoices +
    invoiceStats.paidInvoices;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your Invoice Manager dashboard
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-1">
          <PlusIcon className="h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Invoices
              </CardTitle>
              <span className="text-yellow-600 text-xs font-medium flex items-center">
                <ChevronUpIcon className="h-3 w-3 mr-1" />
                {isLoading
                  ? "..."
                  : `${Math.round((invoiceStats.pendingInvoices / Math.max(totalInvoices, 1)) * 100)}%`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {isLoading ? (
                <div className="h-8 w-12 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                invoiceStats.pendingInvoices
              )}
            </div>
            <div className="flex items-start space-x-2">
              <ClockIcon className="h-4 w-4 text-gray-700 mt-0.5" />
              <div className="text-xs text-gray-500">
                Awaiting payment
                <br />
                {invoiceStats.pendingInvoices === 1
                  ? "Needs attention"
                  : "Need attention"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overdue Invoices
              </CardTitle>
              <span className="text-red-600 text-xs font-medium flex items-center">
                <ChevronUpIcon className="h-3 w-3 mr-1" />
                {isLoading
                  ? "..."
                  : `${Math.round((invoiceStats.overdueInvoices / Math.max(totalInvoices, 1)) * 100)}%`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {isLoading ? (
                <div className="h-8 w-12 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                invoiceStats.overdueInvoices
              )}
            </div>
            <div className="flex items-start space-x-2">
              <AlertTriangleIcon className="h-4 w-4 text-gray-700 mt-0.5" />
              <div className="text-xs text-gray-500">
                Past due date
                <br />
                Requires immediate action
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-gray-600">
                Paid Invoices
              </CardTitle>
              <span className="text-green-600 text-xs font-medium flex items-center">
                <ChevronUpIcon className="h-3 w-3 mr-1" />
                {isLoading
                  ? "..."
                  : `${Math.round((invoiceStats.paidInvoices / Math.max(totalInvoices, 1)) * 100)}%`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {isLoading ? (
                <div className="h-8 w-12 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                invoiceStats.paidInvoices
              )}
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="h-4 w-4 text-gray-700 mt-0.5" />
              <div className="text-xs text-gray-500">
                Successfully collected
                <br />
                Payment received
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium text-gray-600">
                Outstanding Amount
              </CardTitle>
              <span className="text-blue-600 text-xs font-medium">
                Pending + Overdue
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {isLoading ? (
                <div className="h-8 w-24 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                invoiceStats.outstandingAmount
              )}
            </div>
            <div className="flex items-start space-x-2">
              <DollarSignIcon className="h-4 w-4 text-gray-700 mt-0.5" />
              <div className="text-xs text-gray-500">
                Total unbilled amount
                <br />
                Expected revenue
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Payment Status Chart */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Payment Analytics</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={selectedPeriod === "all" ? "secondary" : "outline"}
                  size="sm"
                  className="text-sm"
                  onClick={() => setSelectedPeriod("all")}
                >
                  All Time
                </Button>
                <Button
                  variant={selectedPeriod === "month" ? "secondary" : "outline"}
                  size="sm"
                  className="text-sm"
                  onClick={() => setSelectedPeriod("month")}
                >
                  This Month
                </Button>
                <Button
                  variant={selectedPeriod === "week" ? "secondary" : "outline"}
                  size="sm"
                  className="text-sm"
                  onClick={() => setSelectedPeriod("week")}
                >
                  This Week
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-48 w-full animate-pulse bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <div className="flex h-full items-end justify-between gap-2 pb-4 pt-8 relative">
                  {/* Area Chart Background */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-blue-50 to-transparent opacity-50 rounded-md"
                    style={{ height: "80%", top: "10%" }}
                  ></div>

                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div
                        className="w-10 bg-blue-500 rounded-t-md transition-all duration-500"
                        style={{
                          height: `${Math.max(20, Math.min(250, item.amount * 5 + 20))}px`,
                        }}
                      ></div>
                      <span className="mt-2 text-xs">{item.name}</span>
                    </div>
                  ))}
                </div>
                {chartData.every((item) => item.amount === 0) && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    No payment data available yet
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="md:col-span-3 border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Upcoming Reminders</CardTitle>
              <Button variant="outline" size="sm" className="text-sm">
                Configure
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ClockIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground">No upcoming reminders</p>
            <p className="text-xs text-gray-500 mt-2 max-w-xs">
              Reminders will appear here when you have pending invoices
              approaching their due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Recent Invoices</CardTitle>
            <Button variant="outline" size="sm" asChild className="text-sm">
              <Link href="/invoices">
                View All <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="h-12 w-full animate-pulse bg-gray-200 rounded"
                ></div>
              ))}
            </div>
          ) : hasInvoices ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2 font-medium">Client</th>
                      <th className="p-2 font-medium">Invoice</th>
                      <th className="p-2 font-medium">Amount</th>
                      <th className="p-2 font-medium">Due Date</th>
                      <th className="p-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceStats.recentInvoices.map((invoice: any) => (
                      <tr
                        key={invoice.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2">{invoice.clientName}</td>
                        <td className="p-2 font-mono text-sm">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="p-2">
                          {invoice.currency}{" "}
                          {parseFloat(invoice.amount).toFixed(2)}
                        </td>
                        <td className="p-2">{formatDate(invoice.dueDate)}</td>
                        <td className="p-2">
                          {getStatusBadge(invoice.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-6">
                No invoices found. Create your first invoice to get started.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                Create Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Creation Modal */}
      {isModalOpen && (
        <CreateInvoiceForm
          onClose={() => {
            setIsModalOpen(false);
            // Invalidate and refetch dashboard data when modal is closed
            refetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
