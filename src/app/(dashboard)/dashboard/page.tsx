"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, ClockIcon, AlertTriangleIcon, CheckCircleIcon, DollarSignIcon, ArrowRightIcon } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { CreateInvoiceForm } from "@/components/create-invoice-form";
import { getInvoiceStats, getMonthlyInvoiceData } from "@/actions/invoice";
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
  recentInvoices: [] as Array<any>
};

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invoiceStats, setInvoiceStats] = useState(defaultStats);
  const [chartData, setChartData] = useState(defaultChartData);
  
  const hasInvoices = invoiceStats.recentInvoices.length > 0;

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isUserLoading || !user) return;
      
      setIsLoading(true);
      try {
        // Fetch stats and chart data in parallel
        const [stats, monthlyData] = await Promise.all([
          getInvoiceStats(),
          getMonthlyInvoiceData()
        ]);
        
        setInvoiceStats({
          ...defaultStats,
          pendingInvoices: Number(stats.pendingInvoices),
          overdueInvoices: Number(stats.overdueInvoices), 
          paidInvoices: Number(stats.paidInvoices),
          outstandingAmount: stats.outstandingAmount,
          recentInvoices: stats.recentInvoices || []
        });

        if (monthlyData?.length > 0) {
          setChartData(monthlyData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isUserLoading]);

  // Format status for display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">Pending</span>;
      case "overdue":
        return <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">Overdue</span>;
      case "paid":
        return <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Paid</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">{status}</span>;
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(new Date(date));
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your Invoice Nudger dashboard
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-1">
          <PlusIcon className="h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <div className="h-8 w-12 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                invoiceStats.pendingInvoices
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <div className="h-8 w-12 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                invoiceStats.overdueInvoices
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <div className="h-8 w-12 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                invoiceStats.paidInvoices
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSignIcon className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? (
                <div className="h-8 w-24 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                invoiceStats.outstandingAmount
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Payment Status Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <div className="h-48 w-full animate-pulse bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <div className="flex h-full items-end justify-between gap-2 pb-4 pt-8">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-10 bg-blue-500 rounded-t-md transition-all duration-500" 
                        style={{ height: `${Math.max(20, Math.min(250, item.amount * 5 + 20))}px` }}
                      ></div>
                      <span className="mt-2 text-xs">{item.name}</span>
                    </div>
                  ))}
                </div>
                {chartData.every(item => item.amount === 0) && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    No payment data available yet
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Reminders</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              Settings
            </Button>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ClockIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-muted-foreground">No upcoming reminders</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="h-12 w-full animate-pulse bg-gray-200 rounded"></div>
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
                      <tr key={invoice.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{invoice.clientName}</td>
                        <td className="p-2 font-mono text-sm">{invoice.invoiceNumber}</td>
                        <td className="p-2">{invoice.currency} {parseFloat(invoice.amount).toFixed(2)}</td>
                        <td className="p-2">{formatDate(invoice.dueDate)}</td>
                        <td className="p-2">{getStatusBadge(invoice.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-6">No invoices found. Create your first invoice to get started.</p>
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
            // Re-fetch data when modal is closed to update with new invoice
            if (!isUserLoading && user) {
              Promise.all([getInvoiceStats(), getMonthlyInvoiceData()])
                .then(([stats, monthlyData]) => {
                  setInvoiceStats(stats);
                  if (monthlyData?.length > 0) {
                    setChartData(monthlyData);
                  }
                })
                .catch(error => {
                  console.error("Error refreshing data:", error);
                });
            }
          }}
        />
      )}
    </div>
  );
}
