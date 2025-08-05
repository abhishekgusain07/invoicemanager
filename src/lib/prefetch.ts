import { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { appRouter } from "@/server/root";
import { createTRPCContext } from "@/server/trpc";
import type { AppRouter } from "@/server/root";
import { api } from "./trpc";
import { TRPCRequestInfo } from "@trpc/server/unstable-core-do-not-import";

// Type definitions for dashboard data
export interface DashboardStats {
  pendingInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
  outstandingAmount: string;
  recentInvoices: Array<any>;
}

export interface DashboardData {
  stats: DashboardStats;
  monthlyData: Array<{
    name: string;
    amount: number;
  }>;
}

// Type definitions for invoice data
export interface InvoiceData {
  id: string;
  clientName: string;
  amount: string;
  status: "pending" | "paid" | "overdue";
  dueDate: Date;
  issueDate: Date;
  invoiceNumber: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GmailConnectionData {
  isConnected: boolean;
  email?: string;
}

// Prefetch utilities for dashboard data
export class DashboardPrefetcher {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Prefetch all dashboard data with proper error handling
   */
  async prefetchDashboardData(): Promise<void> {
    try {
      // Create server-side context and caller
      const ctx = await createTRPCContext({
        req: new Request("http://localhost"),
        resHeaders: {} as Headers,
        info: {} as TRPCRequestInfo,
      });

      // Skip prefetch if user is not authenticated
      if (!ctx.session || !ctx.user) {
        console.warn("Skipping dashboard prefetch - user not authenticated");
        return;
      }

      const caller = appRouter.createCaller(ctx);

      // Get the tRPC query key for the dashboard data
      const queryKey = getQueryKey(
        api.dashboard.getAllDashboardData,
        undefined,
        "query"
      );

      // Check if data is already in cache and fresh
      const existingData = this.queryClient.getQueryData(queryKey);
      const queryState = this.queryClient.getQueryState(queryKey);

      // Only prefetch if no data exists or data is stale
      if (
        !existingData ||
        (queryState && Date.now() - queryState.dataUpdatedAt > 5 * 60 * 1000)
      ) {
        await this.queryClient.prefetchQuery({
          queryKey,
          queryFn: () => caller.dashboard.getAllDashboardData(),
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        });
      }
    } catch (error) {
      // Log error but don't throw - prefetch failures should not break the app
      console.warn("Dashboard data prefetch failed:", error);
    }
  }

  /**
   * Prefetch multiple dashboard-related queries in parallel
   */
  async prefetchAllDashboardQueries(): Promise<void> {
    const prefetchPromises = [
      this.prefetchDashboardData(),
      // Add more prefetch calls here if needed for other dashboard queries
    ];

    // Run all prefetches in parallel and handle individual failures
    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Check if dashboard data is available in cache
   */
  isDashboardDataCached(): boolean {
    const queryKey = getQueryKey(
      api.dashboard.getAllDashboardData,
      undefined,
      "query"
    );
    const data = this.queryClient.getQueryData(queryKey);
    return !!data;
  }

  /**
   * Get cached dashboard data if available
   */
  getCachedDashboardData(): DashboardData | undefined {
    const queryKey = getQueryKey(
      api.dashboard.getAllDashboardData,
      undefined,
      "query"
    );
    return this.queryClient.getQueryData(queryKey) as DashboardData | undefined;
  }
}

// Hook for using the prefetcher
export const useDashboardPrefetcher = (queryClient: QueryClient) => {
  return new DashboardPrefetcher(queryClient);
};

// Utility function to create a prefetcher instance
export const createDashboardPrefetcher = (queryClient: QueryClient) => {
  return new DashboardPrefetcher(queryClient);
};

// Enhanced Invoice Prefetcher Class
export class InvoicePrefetcher {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Prefetch all invoice data for a specific status
   */
  async prefetchInvoicesByStatus(
    status: "pending" | "paid" | "overdue" | "all" = "all"
  ): Promise<void> {
    try {
      const queryKey = getQueryKey(
        api.invoice.getByStatus,
        { status },
        "query"
      );

      const existingData = this.queryClient.getQueryData(queryKey);
      const queryState = this.queryClient.getQueryState(queryKey);

      if (
        !existingData ||
        (queryState && Date.now() - queryState.dataUpdatedAt > 2 * 60 * 1000)
      ) {
        await this.queryClient.prefetchQuery({
          queryKey,
          queryFn: () => this.fetchInvoicesByStatus(status),
          staleTime: 2 * 60 * 1000, // 2 minutes for invoice data
          gcTime: 10 * 60 * 1000, // 10 minutes
        });
      }
    } catch (error) {
      console.warn("Invoice data prefetch failed:", error);
    }
  }

  /**
   * Prefetch Gmail connection status
   */
  async prefetchGmailConnection(): Promise<void> {
    try {
      const queryKey = getQueryKey(
        api.connections.checkGmailConnection,
        undefined,
        "query"
      );

      const existingData = this.queryClient.getQueryData(queryKey);
      const queryState = this.queryClient.getQueryState(queryKey);

      if (
        !existingData ||
        (queryState && Date.now() - queryState.dataUpdatedAt > 5 * 60 * 1000)
      ) {
        await this.queryClient.prefetchQuery({
          queryKey,
          queryFn: () => this.fetchGmailConnection(),
          staleTime: 5 * 60 * 1000, // 5 minutes for connection status
          gcTime: 10 * 60 * 1000,
        });
      }
    } catch (error) {
      console.warn("Gmail connection prefetch failed:", error);
    }
  }

  /**
   * Prefetch all invoice-related data in parallel
   */
  async prefetchAllInvoiceData(
    status: "pending" | "paid" | "overdue" | "all" = "all"
  ): Promise<void> {
    const prefetchPromises = [
      this.prefetchInvoicesByStatus(status),
      this.prefetchGmailConnection(),
    ];

    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Check if invoice data is cached
   */
  isInvoiceDataCached(
    status: "pending" | "paid" | "overdue" | "all" = "all"
  ): boolean {
    const queryKey = getQueryKey(api.invoice.getByStatus, { status }, "query");
    const data = this.queryClient.getQueryData(queryKey);
    return !!data;
  }

  /**
   * Get cached invoice data if available
   */
  getCachedInvoiceData(
    status: "pending" | "paid" | "overdue" | "all" = "all"
  ): InvoiceData[] | undefined {
    const queryKey = getQueryKey(api.invoice.getByStatus, { status }, "query");
    return this.queryClient.getQueryData(queryKey) as InvoiceData[] | undefined;
  }

  /**
   * Private method to fetch invoices by status
   */
  private async fetchInvoicesByStatus(
    status: "pending" | "paid" | "overdue" | "all"
  ): Promise<InvoiceData[]> {
    // Placeholder for tRPC server call
    throw new Error("This should be handled by tRPC React Query integration");
  }

  /**
   * Private method to fetch Gmail connection status
   */
  private async fetchGmailConnection(): Promise<GmailConnectionData> {
    // Placeholder for tRPC server call
    throw new Error("This should be handled by tRPC React Query integration");
  }
}

// Universal Prefetcher Class for all app data
export class AppPrefetcher {
  private queryClient: QueryClient;
  private dashboardPrefetcher: DashboardPrefetcher;
  private invoicePrefetcher: InvoicePrefetcher;
  private generatedInvoicePrefetcher: GeneratedInvoicePrefetcher;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.dashboardPrefetcher = new DashboardPrefetcher(queryClient);
    this.invoicePrefetcher = new InvoicePrefetcher(queryClient);
    this.generatedInvoicePrefetcher = new GeneratedInvoicePrefetcher(
      queryClient
    );
  }

  /**
   * Prefetch data for dashboard page
   */
  async prefetchDashboardPage(): Promise<void> {
    await this.dashboardPrefetcher.prefetchAllDashboardQueries();
  }

  /**
   * Prefetch data for invoices page
   */
  async prefetchInvoicesPage(
    status: "pending" | "paid" | "overdue" | "all" = "all"
  ): Promise<void> {
    await this.invoicePrefetcher.prefetchAllInvoiceData(status);
  }

  /**
   * Prefetch data for myinvoices page
   */
  async prefetchMyInvoicesPage(
    options: { limit?: number; offset?: number } = { limit: 50, offset: 0 }
  ): Promise<void> {
    await this.generatedInvoicePrefetcher.prefetchGeneratedInvoices(options);
  }

  /**
   * Prefetch data for multiple pages (navigation optimization)
   */
  async prefetchMultiplePages(): Promise<void> {
    const prefetchPromises = [
      this.prefetchDashboardPage(),
      this.prefetchInvoicesPage("all"),
      this.prefetchMyInvoicesPage(),
    ];

    await Promise.allSettled(prefetchPromises);
  }

  // Expose individual prefetchers
  get dashboard() {
    return this.dashboardPrefetcher;
  }

  get invoices() {
    return this.invoicePrefetcher;
  }

  get myInvoices() {
    return this.generatedInvoicePrefetcher;
  }
}

// Utility functions for easy prefetching
export const prefetchDashboardData = async (
  queryClient: QueryClient
): Promise<void> => {
  const prefetcher = new DashboardPrefetcher(queryClient);
  await prefetcher.prefetchDashboardData();
};

export const prefetchInvoiceData = async (
  queryClient: QueryClient,
  status: "pending" | "paid" | "overdue" | "all" = "all"
): Promise<void> => {
  const prefetcher = new InvoicePrefetcher(queryClient);
  await prefetcher.prefetchAllInvoiceData(status);
};

export const prefetchGeneratedInvoicesData = async (
  queryClient: QueryClient,
  options: { limit?: number; offset?: number } = { limit: 50, offset: 0 }
): Promise<void> => {
  const prefetcher = new GeneratedInvoicePrefetcher(queryClient);
  await prefetcher.prefetchGeneratedInvoices(options);
};

// Generated Invoice Prefetcher Class
export class GeneratedInvoicePrefetcher {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Prefetch generated invoices data
   */
  async prefetchGeneratedInvoices(
    options: { limit?: number; offset?: number } = { limit: 50, offset: 0 }
  ): Promise<void> {
    try {
      const queryKey = getQueryKey(api.invoice.getGenerated, options, "query");

      const existingData = this.queryClient.getQueryData(queryKey);
      const queryState = this.queryClient.getQueryState(queryKey);

      if (
        !existingData ||
        (queryState && Date.now() - queryState.dataUpdatedAt > 5 * 60 * 1000)
      ) {
        await this.queryClient.prefetchQuery({
          queryKey,
          queryFn: () => this.fetchGeneratedInvoices(options),
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
        });
      }
    } catch (error) {
      console.warn("Generated invoices prefetch failed:", error);
    }
  }

  /**
   * Check if generated invoices data is cached
   */
  isGeneratedInvoicesDataCached(
    options: { limit?: number; offset?: number } = { limit: 50, offset: 0 }
  ): boolean {
    const queryKey = getQueryKey(api.invoice.getGenerated, options, "query");
    const data = this.queryClient.getQueryData(queryKey);
    return !!data;
  }

  /**
   * Get cached generated invoices data if available
   */
  getCachedGeneratedInvoicesData(
    options: { limit?: number; offset?: number } = { limit: 50, offset: 0 }
  ): any | undefined {
    const queryKey = getQueryKey(api.invoice.getGenerated, options, "query");
    return this.queryClient.getQueryData(queryKey);
  }

  /**
   * Private method to fetch generated invoices
   */
  private async fetchGeneratedInvoices(options: {
    limit?: number;
    offset?: number;
  }): Promise<any> {
    // Placeholder for tRPC server call
    throw new Error("This should be handled by tRPC React Query integration");
  }
}

export const createAppPrefetcher = (queryClient: QueryClient) => {
  return new AppPrefetcher(queryClient);
};
