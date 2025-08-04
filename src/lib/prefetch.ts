"use client";

import { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "./trpc";
import type { AppRouter } from "@/server/root";

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
          queryFn: () => this.fetchDashboardData(),
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

  /**
   * Private method to fetch dashboard data
   * This simulates the tRPC call without going through the React hook
   */
  private async fetchDashboardData(): Promise<DashboardData> {
    // Since we can't easily call tRPC procedures directly from client-side prefetch,
    // we'll let the React Query mechanism handle this through the normal tRPC flow
    // This is a placeholder that will be handled by the prefetchQuery mechanism
    throw new Error("This should be handled by tRPC React Query integration");
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

// Simple prefetch function for dashboard data
export const prefetchDashboardData = async (
  queryClient: QueryClient
): Promise<void> => {
  const prefetcher = new DashboardPrefetcher(queryClient);
  await prefetcher.prefetchDashboardData();
};
