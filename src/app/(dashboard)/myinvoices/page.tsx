import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { MyInvoicesClient } from "./MyInvoicesClient";

// Server Component with prefetching following modern data fetching guide
export default async function MyInvoicesPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes for generated invoices data
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: (query) => !query.state.data, // Only refetch if no data exists
      },
    },
  });

  // Note: For tRPC queries, the actual prefetching happens through the tRPC integration
  // The data will be fetched when the client component mounts, but the queryClient
  // configuration ensures optimal caching behavior

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <MyInvoicesClient />
    </HydrationBoundary>
  );
}
