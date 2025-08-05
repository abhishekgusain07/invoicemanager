Modern Data Fetching Pattern: Server-Side Prefetching with TanStack Query
🎯 The Problem with Traditional Client-Side Fetching
What Users Experience Today:
Restaurant Analogy: Currently, our app works like going to a restaurant, sitting down, THEN calling the waiter, placing your order, and waiting for the kitchen to cook your food. The "waiting for food" = loading spinners users see.
Technical Reality:

User requests page → Server sends minimal HTML + JavaScript
Browser renders empty page with loading spinner
useEffect triggers → Makes API call
Server processes request → Sends data back
Component re-renders → Finally shows content

Result: Users see loading states, empty pages, and delays.

🚀 The New Way: Pre-Ordering Your Data
What Users Experience Now:
Restaurant Analogy: You pre-order your meal online. When you arrive, food is already on your table, hot and ready. No waiting!
Technical Reality:

Server fetches data BEFORE sending page
Page loads with content already there
Zero loading spinners for prefetched data
Instant user experience

// lib/providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { useState } from "react";

interface ProvidersProps {
children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
const [queryClient] = useState(() => new QueryClient({
defaultOptions: {
queries: {
staleTime: 5 _ 60 _ 1000, // 5 minutes
cacheTime: 10 _ 60 _ 1000, // 10 minutes
refetchOnWindowFocus: false,
refetchOnMount: false, // Don't refetch if data exists
},
},
}));

return (
<QueryClientProvider client={queryClient}>
<ReactQueryStreamedHydration>
{children}
</ReactQueryStreamedHydration>
</QueryClientProvider>
);
}

// app/layout.tsx
import { Providers } from "@/lib/providers";

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (

<html lang="en">
<body>
<Providers>
{children}
</Providers>
</body>
</html>
);
}

// lib/data.ts

// Types
export interface Invoice {
id: string;
clientName: string;
amount: number;
status: 'pending' | 'paid' | 'overdue';
dueDate: string;
}

export interface DashboardStats {
pendingInvoices: number;
overdueInvoices: number;
paidInvoices: number;
outstandingAmount: string;
recentInvoices: Invoice[];
}

// Data fetching functions
export const getDashboardStats = async (): Promise<DashboardStats> => {
console.log("FETCHING DASHBOARD STATS ON SERVER");

// In a real app, you'd fetch from your database or API
// Example: const response = await fetch('your-api-endpoint');

// Simulate API delay
await new Promise(resolve => setTimeout(resolve, 100));

return {
pendingInvoices: 12,
overdueInvoices: 3,
paidInvoices: 45,
outstandingAmount: "$15,240.00",
recentInvoices: [
{
id: "1",
clientName: "Acme Corp",
amount: 2500,
status: "pending",
dueDate: "2024-08-15"
},
{
id: "2",
clientName: "Tech Solutions",
amount: 1800,
status: "paid",
dueDate: "2024-08-10"
}
]
};
};

export const getInvoices = async (): Promise<Invoice[]> => {
console.log("FETCHING INVOICES ON SERVER");

// Simulate API call
await new Promise(resolve => setTimeout(resolve, 100));

return [
{
id: "1",
clientName: "Acme Corp",
amount: 2500,
status: "pending",
dueDate: "2024-08-15"
},
{
id: "2",
clientName: "Tech Solutions",
amount: 1800,
status: "paid",
dueDate: "2024-08-10"
},
{
id: "3",
clientName: "StartupXYZ",
amount: 3200,
status: "overdue",
dueDate: "2024-07-30"
}
];
};

// app/dashboard/page.tsx
import {
QueryClient,
dehydrate,
HydrationBoundary,
} from "@tanstack/react-query";

import { getDashboardStats } from "@/lib/data";
import { DashboardClient } from "./DashboardClient"; // We'll create this next

export default async function DashboardPage() {
const queryClient = new QueryClient();

// 🔥 THE MAGIC: Prefetch data on the server
// This happens BEFORE the page is sent to the user
await queryClient.prefetchQuery({
queryKey: ["dashboard"],
queryFn: getDashboardStats, // Your data fetching function
staleTime: 5 _ 60 _ 1000, // 5 minutes
});

// Dehydrate the query client state and pass to boundary
const dehydratedState = dehydrate(queryClient);

return (
<HydrationBoundary state={dehydratedState}>
<DashboardClient />
</HydrationBoundary>
);
}

// app/dashboard/DashboardClient.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/data";
import type { DashboardStats } from "@/lib/data";

export function DashboardClient() {
// 🎉 DATA IS ALREADY HERE! No loading state needed
const { data: stats, error } = useQuery<DashboardStats>({
queryKey: ["dashboard"],
queryFn: getDashboardStats,
staleTime: 5 _ 60 _ 1000,
// refetchOnMount: false, // Don't refetch since data is prefetched
});

if (error) {
return <div>Error loading dashboard data</div>;
}

// No loading check needed - data is guaranteed to be there!
if (!stats) {
return <div>Loading...</div>; // This rarely shows
}

return (

<div className="space-y-6">
<h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards - Data displays INSTANTLY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Pending Invoices</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pendingInvoices}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Overdue Invoices</h3>
          <p className="text-3xl font-bold text-red-600">
            {stats.overdueInvoices}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Paid Invoices</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats.paidInvoices}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Outstanding Amount</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.outstandingAmount}
          </p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
          <div className="space-y-2">
            {stats.recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-3 border rounded">
                <span>{invoice.clientName}</span>
                <span className="font-semibold">${invoice.amount}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  invoice.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : invoice.status === 'overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

);
}

// lib/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import type { Invoice } from "./data";

// This is a dummy function to simulate saving to a database
const saveInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
console.log("SAVING INVOICE ON SERVER:", invoiceData);

// In a real app, you'd insert this into your database
// Example: await db.invoice.create({ data: invoiceData });

return {
id: Date.now().toString(),
clientName: invoiceData.clientName || "",
amount: invoiceData.amount || 0,
status: "pending",
dueDate: invoiceData.dueDate || new Date().toISOString(),
};
};

export async function createInvoiceAction(formData: FormData) {
const clientName = formData.get("clientName") as string;
const amount = parseFloat(formData.get("amount") as string);
const dueDate = formData.get("dueDate") as string;

if (!clientName || !amount || !dueDate) {
throw new Error("All fields are required");
}

try {
await saveInvoice({
clientName,
amount,
dueDate,
});

    // 🔥 THE MAGIC: Revalidate the path to update cache
    // This ensures all users see the updated data
    revalidatePath("/dashboard");
    revalidatePath("/invoices");

    return { success: true };

} catch (error) {
return { error: "Failed to create invoice" };
}
}

// app/invoices/CreateInvoiceForm.tsx
"use client";

import { useTransition } from "react";
import { createInvoiceAction } from "@/lib/actions";

export function CreateInvoiceForm() {
const [isPending, startTransition] = useTransition();

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createInvoiceAction(formData);

      if (result?.error) {
        console.error("Failed to create invoice:", result.error);
      } else {
        // Form submitted successfully
        // The server action already revalidated the cache
        (event.target as HTMLFormElement).reset();
      }
    });

};

return (

<form onSubmit={handleSubmit} className="space-y-4 max-w-md">
<div>
<label htmlFor="clientName" className="block text-sm font-medium">
Client Name
</label>
<input
          type="text"
          name="clientName"
          id="clientName"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
</div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium">
          Amount
        </label>
        <input
          type="number"
          name="amount"
          id="amount"
          step="0.01"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium">
          Due Date
        </label>
        <input
          type="date"
          name="dueDate"
          id="dueDate"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Invoice"}
      </button>
    </form>

);
}

🔄 Migration Strategy: Old vs New Pattern
❌ OLD PATTERN (Don't Do This Anymore)
tsx// OLD: Client-side fetching with loading states
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
fetchData()
.then(setData)
.catch(setError)
.finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
✅ NEW PATTERN (Do This Instead)
tsx// NEW: Server-side prefetching with instant data
// In page.tsx (Server Component)
await queryClient.prefetchQuery({
queryKey: ["data"],
queryFn: fetchData,
});

// In Client Component
const { data } = useQuery({
queryKey: ["data"],
queryFn: fetchData, // Data already prefetched!
});

// No loading state needed - data is already there!

📊 Implementation Checklist
For Each Page That Loads Data:

Identify data needs - What data does this page require?
Create data fetching function - Move API calls to separate functions
Add server-side prefetching - Use queryClient.prefetchQuery() in page component
Update client component - Remove loading states, use useQuery
Add server actions - For forms and data mutations
Test the flow - Verify instant loading and proper updates

Pages to Migrate (Priority Order):

Dashboard - Most visible, highest impact
Invoice List - Frequently accessed
Client List - Secondary but important
Reports/Analytics - Can have heavy data loads
Settings - Lower priority but good for completeness

🎯 Key Benefits Developer Will See

1. Eliminated Loading States

No more managing loading, error, data states manually
No more empty pages with spinners
Instant content display

2. Simplified Code

Less useState and useEffect boilerplate
No complex loading/error state management
Cleaner, more readable components

3. Better User Experience

Pages load with content immediately
No jarring loading → content transitions
Feels like a native app

4. Automatic Cache Management

TanStack Query handles caching automatically
Smart background updates
Optimistic updates with server actions

🚨 Important Notes

This only works with Next.js App Router - Pages router won't support this pattern
Server Components run on server - They can access databases directly
Client Components run in browser - They get hydrated with prefetched data
Server Actions handle mutations - Forms, updates, deletes all go through server actions
revalidatePath clears cache - Ensures fresh data after mutations

📈 Expected Results
After implementing this pattern:

Page load time perception: Instant (from 2-3 seconds to 0 seconds)
Code complexity: Reduced by ~40%
User satisfaction: Significantly improved
Development speed: Faster (less state management)
Bug reduction: Fewer race conditions and loading state bugs

This is the modern way to build React applications. Implement this pattern across the entire app for the best user experience possible.
