import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerDashboardData } from "@/lib/server-api";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
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
