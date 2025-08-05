import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { prefetchInvoiceData } from "@/lib/prefetch";
import { InvoicesClient } from "./InvoicesClient";

// Server Component with prefetching following modern data fetching guide
export default async function InvoicesPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes for invoice data
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: (query) => !query.state.data, // Only refetch if no data exists
      },
    },
  });

  // 🔥 THE MAGIC: Prefetch invoice data on the server
  // This happens BEFORE the page is sent to the user
  try {
    await prefetchInvoiceData(queryClient, "all");
  } catch (error) {
    // Log error but don't break the page - client will handle loading state
    console.warn("Server-side prefetch failed:", error);
  }

  // Dehydrate the query client state and pass to boundary
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <InvoicesClient />
    </HydrationBoundary>
  );
}
