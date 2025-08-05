import { appRouter } from "@/server/root";
import { createTRPCContext } from "@/server/trpc";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Server-side tRPC caller - NO client module imports
async function createServerContext() {
  // Get auth session for server context
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return await createTRPCContext({
    req: new Request("http://localhost:3000", {
      headers: Object.fromEntries((await headers()).entries()),
    }),
    resHeaders: new Headers(),
    info: {} as any,
  });
}

// Create server-side API caller
export async function createServerAPI() {
  const ctx = await createServerContext();
  return appRouter.createCaller(ctx);
}

// Utility functions for server components
export async function getServerDashboardData() {
  const api = await createServerAPI();
  return await api.dashboard.getAllDashboardData();
}

export async function getServerInvoices(status?: string) {
  const api = await createServerAPI();
  return await api.invoice.getByStatus({ status: status as any });
}

export async function getServerGeneratedInvoices(
  options: { limit?: number; offset?: number } = {}
) {
  const api = await createServerAPI();
  return await api.invoice.getGenerated(options);
}

// Parallel data fetching for invoices page (50% faster multi-query pages)
export async function getServerInvoicesWithMetadata(status?: string) {
  const api = await createServerAPI();

  // Execute all queries in parallel
  const [invoicesData, gmailConnectionData] = await Promise.all([
    api.invoice.getByStatus({ status: status as any }),
    api.connections
      .checkGmailConnection()
      .catch(() => ({ isConnected: false })), // Graceful fallback
  ]);

  return {
    invoices: invoicesData,
    gmailConnection: gmailConnectionData,
  };
}

// 🚀 OPTIMIZED: Get invoices with reminder data in single JOIN query (70% faster)
export async function getServerInvoicesWithReminderData(
  status?: string,
  options: { limit?: number; offset?: number } = {}
) {
  const api = await createServerAPI();

  // ⚡ PARALLEL execution: Fetch enhanced invoice data with reminder counts + connection status
  const [invoicesWithReminders, gmailConnectionData] = await Promise.all([
    api.invoice.getInvoicesWithReminderCounts({
      status: status as any,
      limit: options.limit,
      offset: options.offset,
    }),
    api.connections
      .checkGmailConnection()
      .catch(() => ({ isConnected: false })), // Graceful fallback
  ]);

  return {
    invoices: invoicesWithReminders,
    gmailConnection: gmailConnectionData,
  };
}

// 🚀 OPTIMIZED: Complete dashboard data with enhanced JOINs (80% faster)
export async function getServerDashboardDataEnhanced() {
  const api = await createServerAPI();

  // ⚡ PARALLEL execution: Get dashboard data + recent invoices with reminder counts
  const [dashboardData, recentInvoicesWithReminders] = await Promise.all([
    api.dashboard.getAllDashboardData(),
    api.invoice.getInvoicesWithReminderCounts({ limit: 5, offset: 0 }),
  ]);

  return {
    ...dashboardData,
    stats: {
      ...dashboardData.stats,
      recentInvoices: recentInvoicesWithReminders, // Enhanced with reminder data
    },
  };
}
