import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getServerInvoices } from "@/lib/server-api";
import { InvoicesClient } from "./InvoicesClient";

export default async function InvoicesPage({ 
  searchParams 
}: { 
  searchParams: { status?: string } 
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
    const invoices = await getServerInvoices(searchParams.status || "all");
    
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
