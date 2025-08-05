import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getServerGeneratedInvoices } from "@/lib/server-api";
import { MyInvoicesClient } from "./MyInvoicesClient";

export default async function MyInvoicesPage() {
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
    const generatedInvoices = await getServerGeneratedInvoices({
      limit: 50,
      offset: 0,
    });

    const queryKey = [
      ["invoice", "getGenerated"],
      { input: { limit: 50, offset: 0 }, type: "query" },
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
