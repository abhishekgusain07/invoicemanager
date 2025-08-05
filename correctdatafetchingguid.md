The Right Solution: Server Components + tRPC Integration
Keep Your Existing tRPC Setup (DON'T TOUCH)

Keep src/lib/trpc.ts exactly as is
Keep all your tRPC procedures in src/server/
Keep your TRPCReactProvider
Keep all your client-side tRPC queries

The Fix: Server-Side tRPC Calls (Not Client Module Access)
Step 1: Create Server-Side tRPC Caller Utilities
Create: src/lib/server-api.ts
typescriptimport { appRouter } from "@/server/root";
import { createTRPCContext } from "@/server/trpc";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";

// Server-side tRPC caller - NO client module imports
async function createServerContext() {
const { userId } = auth();

return await createTRPCContext({
req: new Request('http://localhost:3000', {
headers: Object.fromEntries(headers().entries())
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

export async function getServerGeneratedInvoices(options: { limit?: number; offset?: number } = {}) {
const api = await createServerAPI();
return await api.invoice.getGenerated(options);
}
Step 2: Update Dashboard Page (Use Server tRPC)
Update: src/app/dashboard/page.tsx
typescriptimport { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { getServerDashboardData } from "@/lib/server-api";
import { api } from "@/lib/trpc";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
const queryClient = new QueryClient({
defaultOptions: {
queries: {
staleTime: 5 _ 60 _ 1000,
gcTime: 10 _ 60 _ 1000,
refetchOnWindowFocus: false,
refetchOnMount: (query) => !query.state.data,
},
},
});

try {
// ✅ CORRECT: Server-side tRPC call (no client module access)
const dashboardData = await getServerDashboardData();

    // ✅ CORRECT: Manually set the query data (not using client module)
    const queryKey = [
      ["dashboard", "getAllDashboardData"],
      { input: undefined, type: "query" }
    ];

    queryClient.setQueryData(queryKey, dashboardData);

    // Dehydrate for client
    const dehydratedState = dehydrate(queryClient);

    return (
      <HydrationBoundary state={dehydratedState}>
        <DashboardClient />
      </HydrationBoundary>
    );

} catch (error) {
console.warn("Server-side dashboard data fetch failed:", error);

    // Return client component without prefetched data
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardClient />
      </HydrationBoundary>
    );

}
}
Step 3: Keep Your Dashboard Client EXACTLY The Same
Your existing dashboard-client.tsx stays UNCHANGED:
typescript"use client";

import { useState, useCallback } from "react";
// ... all your existing imports

export function DashboardClient() {
const { user, isLoading: isUserLoading } = useUser();
const [isModalOpen, setIsModalOpen] = useState(false);

// ✅ This stays EXACTLY the same - your tRPC setup works perfectly
const {
data: dashboardData,
isLoading,
error,
refetch: refetchDashboardData,
} = api.dashboard.getAllDashboardData.useQuery(
undefined,
{
enabled: !isUserLoading && !!user,
staleTime: 5 _ 60 _ 1000,
refetchOnWindowFocus: false,
refetchOnMount: (query) => !query.state.data, // Uses prefetched data if available
}
);

// ✅ All your existing logic stays the same
const invoiceStats = dashboardData?.stats;
const chartData = dashboardData?.monthlyData;
const hasInvoices = (invoiceStats?.recentInvoices?.length ?? 0) > 0;

// ✅ All your existing JSX stays exactly the same
// The difference: NO loading state on initial render because data is prefetched

// Rest of your component unchanged...
}
Step 4: Apply Same Pattern to Other Pages
Update: src/app/invoices/page.tsx
typescriptimport { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerInvoices } from "@/lib/server-api";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage({
searchParams
}: {
searchParams: { status?: string }
}) {
const queryClient = new QueryClient();

try {
const invoices = await getServerInvoices(searchParams.status);

    // Set query data for tRPC
    const queryKey = [
      ["invoice", "getByStatus"],
      { input: { status: searchParams.status || "all" }, type: "query" }
    ];

    queryClient.setQueryData(queryKey, invoices);

} catch (error) {
console.warn("Server-side invoices fetch failed:", error);
}

return (
<HydrationBoundary state={dehydrate(queryClient)}>
<InvoicesClient />
</HydrationBoundary>
);
}
Update: src/app/myinvoices/page.tsx
typescriptimport { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerGeneratedInvoices } from "@/lib/server-api";
import { MyInvoicesClient } from "./myinvoices-client";

export default async function MyInvoicesPage() {
const queryClient = new QueryClient();

try {
const generatedInvoices = await getServerGeneratedInvoices({ limit: 50, offset: 0 });

    const queryKey = [
      ["invoice", "getGenerated"],
      { input: { limit: 50, offset: 0 }, type: "query" }
    ];

    queryClient.setQueryData(queryKey, generatedInvoices);

} catch (error) {
console.warn("Server-side generated invoices fetch failed:", error);
}

return (
<HydrationBoundary state={dehydrate(queryClient)}>
<MyInvoicesClient />
</HydrationBoundary>
);
}
Step 5: Delete Only the Problematic Prefetch File
Delete: src/lib/prefetch.ts - This was the source of the error
What This Approach Does
✅ Keeps Everything You Built

Your tRPC setup stays 100% intact
Your React Query setup stays 100% intact
Your client components stay 100% unchanged
All your mutations and client-side logic work exactly the same

✅ Fixes The Error

No more client module access from server components
Uses proper server-side tRPC calls
Manually sets query data instead of using getQueryKey from client modules

✅ Eliminates Loading States

Server pre-populates React Query cache
Client components receive data immediately
No loading spinners on initial render
tRPC queries still work for updates/refetching

The Flow Now

1. User visits /dashboard
2. Server calls tRPC procedure directly (server-side)
3. Server pre-populates React Query cache
4. Server renders HTML with HydrationBoundary
5. Client receives pre-populated cache
6. Client tRPC query sees data already exists
7. No loading state - immediate render with data
8. tRPC queries still work for real-time updates
   Key Changes Summary

Delete: src/lib/prefetch.ts (the problematic file)
Add: src/lib/server-api.ts (proper server-side tRPC calls)
Update: Page components to use server-side tRPC + manual cache population
Keep: All client components, tRPC setup, React Query setup unchanged

This gives you the best of both worlds: no loading states + your existing tRPC architecture intact.
