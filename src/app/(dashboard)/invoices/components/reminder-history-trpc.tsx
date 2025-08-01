"use client";

import { api } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
  MailIcon,
  MousePointerClickIcon,
  AlertCircleIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

interface ReminderHistoryProps {
  invoiceId: string;
}

export default function ReminderHistoryTRPC({
  invoiceId,
}: ReminderHistoryProps) {
  // ✅ NEW: Using tRPC query hook instead of useEffect + server action
  const {
    data: result,
    isLoading,
    error,
    refetch,
  } = api.reminder.getInvoiceReminderHistory.useQuery(
    { invoiceId },
    {
      enabled: !!invoiceId, // Only run query if invoiceId exists
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus
    }
  );

  const reminders = result?.data || [];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircleIcon className="h-5 w-5 text-red-500" />
            Error Loading Reminder History
          </CardTitle>
          <CardDescription>
            {error.message || "Failed to load reminder history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminder History</CardTitle>
          <CardDescription>Loading reminder history...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminder History</CardTitle>
          <CardDescription>
            No reminders have been sent for this invoice yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <MailIcon className="h-4 w-4" />;
      case "delivered":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "opened":
        return <EyeIcon className="h-4 w-4" />;
      case "clicked":
        return <MousePointerClickIcon className="h-4 w-4" />;
      case "replied":
        return <CheckIcon className="h-4 w-4" />;
      case "bounced":
        return <XIcon className="h-4 w-4" />;
      default:
        return <MailIcon className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "opened":
        return "bg-purple-100 text-purple-800";
      case "clicked":
        return "bg-indigo-100 text-indigo-800";
      case "replied":
        return "bg-emerald-100 text-emerald-800";
      case "bounced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone?.toLowerCase()) {
      case "polite":
      case "friendly":
        return "bg-green-100 text-green-800";
      case "firm":
      case "direct":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
      case "final":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailIcon className="h-5 w-5" />
          Reminder History ({reminders.length})
        </CardTitle>
        <CardDescription>
          Track of all reminders sent for this invoice
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders.map((reminder, index) => (
            <div
              key={reminder.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    Reminder #{reminder.reminderNumber}
                  </span>
                  <Badge className={getToneColor(reminder.tone)}>
                    {reminder.tone}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getStatusColor(reminder.status)}
                  >
                    {getStatusIcon(reminder.status)}
                    <span className="ml-1 capitalize">{reminder.status}</span>
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="font-medium text-sm">Subject:</p>
                  <p className="text-sm text-gray-600">
                    {reminder.emailSubject}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Sent: {new Date(reminder.sentAt).toLocaleDateString()}
                    </span>
                  </div>

                  {reminder.deliveredAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      <span className="text-gray-600">
                        Delivered:{" "}
                        {new Date(reminder.deliveredAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {reminder.openedAt && (
                    <div className="flex items-center gap-2">
                      <EyeIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-600">
                        Opened:{" "}
                        {new Date(reminder.openedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {reminder.responseReceivedAt && (
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-emerald-500" />
                      <span className="text-gray-600">
                        Response:{" "}
                        {new Date(
                          reminder.responseReceivedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Email content preview */}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                    View Email Content
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                    {reminder.emailContent}
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/*
✅ MIGRATION BENEFITS:

1. **Automatic Loading States**: No manual loading state management
2. **Built-in Error Handling**: Structured error responses with retry functionality  
3. **Intelligent Caching**: Data cached for 5 minutes, reduces API calls
4. **Type Safety**: Full end-to-end TypeScript inference
5. **Optimistic Updates**: Can easily add mutations with optimistic updates
6. **Background Refetching**: Automatic data synchronization
7. **Request Deduplication**: Multiple components requesting same data = single request

BEFORE (Server Action):
- Manual loading state
- Manual error handling  
- No caching
- useEffect complexity
- No request deduplication

AFTER (tRPC):
- Automatic loading/error states
- Intelligent caching & background updates
- Full type safety
- Clean, declarative code
- Optimistic updates ready
*/
