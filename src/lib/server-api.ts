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
