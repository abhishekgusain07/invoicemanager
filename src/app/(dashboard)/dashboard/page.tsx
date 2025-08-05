import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { prefetchDashboardData } from "@/lib/prefetch";
import { DashboardClient } from "./DashboardClient";

// Server Component with prefetching following modern data fetching guide
export default async function DashboardPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes for dashboard data
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: (query) => !query.state.data, // Only refetch if no data exists
      },
    },
  });

  // 🔥 THE MAGIC: Prefetch dashboard data on the server
  // This happens BEFORE the page is sent to the user
  try {
    await prefetchDashboardData(queryClient);
  } catch (error) {
    // Log error but don't break the page - client will handle loading state
    console.warn("Server-side dashboard prefetch failed:", error);
  }

  // Dehydrate the query client state and pass to boundary
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
