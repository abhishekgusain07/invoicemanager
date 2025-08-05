import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { getServerTemplates } from "@/lib/server-api";
import { TemplatesClient } from "./TemplatesClient";

export default async function TemplatesPage() {
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
    const templatesData = await getServerTemplates();

    const queryKey = [
      ["templates", "getAll"],
      { input: undefined, type: "query" },
    ];

    queryClient.setQueryData(queryKey, templatesData);
  } catch (error) {
    console.warn("Server-side templates data fetch failed:", error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TemplatesClient />
    </HydrationBoundary>
  );
}
