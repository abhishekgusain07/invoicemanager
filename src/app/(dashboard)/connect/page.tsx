import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getServerGmailConnection } from "@/lib/server-api";
import { ConnectClient } from "./ConnectClient";

export default async function ConnectPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: (query) => !query.state.data,
      },
    },
  });

  try {
    const connectionData = await getServerGmailConnection();

    const queryKey = [
      ["connections", "checkGmailConnection"],
      { input: undefined, type: "query" },
    ];

    queryClient.setQueryData(queryKey, connectionData);
  } catch (error) {
    console.warn("Server-side Gmail connection check failed:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ConnectClient />
    </HydrationBoundary>
  );
}
