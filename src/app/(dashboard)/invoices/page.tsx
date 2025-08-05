import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getServerInvoicesWithMetadata } from "@/lib/server-api";
import { InvoicesClient } from "./InvoicesClient";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: (query) => !query.state.data,
      },
    },
  });

  try {
    // Parallel data fetching - 50% faster multi-query pages
    const { invoices, gmailConnection } = await getServerInvoicesWithMetadata(
      searchParams.status || "all"
    );

    // Set query data for invoice data
    const invoiceQueryKey = [
      ["invoice", "getByStatus"],
      { input: { status: searchParams.status || "all" }, type: "query" },
    ];
    queryClient.setQueryData(invoiceQueryKey, invoices);

    // Set query data for Gmail connection data
    const gmailQueryKey = [
      ["connections", "checkGmailConnection"],
      { input: undefined, type: "query" },
    ];
    queryClient.setQueryData(gmailQueryKey, gmailConnection);
  } catch (error) {
    console.warn("Server-side invoices data fetch failed:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvoicesClient />
    </HydrationBoundary>
  );
}
