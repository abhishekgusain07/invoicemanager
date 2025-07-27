"use client";

import { useEffect, useState } from "react";
import { getInvoiceReminderHistory } from "@/actions/reminder";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
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

export default function ReminderHistory({ invoiceId }: ReminderHistoryProps) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminderHistory = async () => {
      setLoading(true);
      try {
        const result = await getInvoiceReminderHistory(invoiceId);
        if (result.success) {
          setReminders(result.data);
        } else {
          setError(result.error || "Failed to load reminder history");
        }
      } catch (err) {
        console.error("Error fetching reminder history:", err);
        setError("An error occurred while fetching reminder history");
      } finally {
        setLoading(false);
      }
    };

    fetchReminderHistory();
  }, [invoiceId]);

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "polite":
        return "bg-blue-100 text-blue-800";
      case "firm":
        return "bg-amber-100 text-amber-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      case "final":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <MailIcon className="h-3 w-3 mr-1" /> Sent
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckIcon className="h-3 w-3 mr-1" /> Delivered
          </Badge>
        );
      case "opened":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 border-indigo-200"
          >
            <EyeIcon className="h-3 w-3 mr-1" /> Opened
          </Badge>
        );
      case "clicked":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            <MousePointerClickIcon className="h-3 w-3 mr-1" /> Clicked
          </Badge>
        );
      case "replied":
        return (
          <Badge
            variant="outline"
            className="bg-teal-50 text-teal-700 border-teal-200"
          >
            <CheckCircleIcon className="h-3 w-3 mr-1" /> Replied
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XIcon className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      case "bounced":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <AlertCircleIcon className="h-3 w-3 mr-1" /> Bounced
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            {status}
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <MailIcon className="h-4 w-4" /> Reminder History
          </CardTitle>
          <CardDescription>Loading reminder history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-4/5 mt-1" />
                <div className="flex justify-between items-center mt-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-md flex items-center gap-2">
            <MailIcon className="h-4 w-4" /> Reminder History
          </CardTitle>
          <CardDescription className="text-red-500">
            Error: {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md flex items-center gap-2">
          <MailIcon className="h-4 w-4" /> Reminder History
        </CardTitle>
        <CardDescription>
          {reminders.length > 0
            ? `${reminders.length} reminder${reminders.length > 1 ? "s" : ""} sent`
            : "No reminders have been sent yet"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MailIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No reminder history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="border rounded-md p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      Reminder #{reminder.reminderNumber}
                    </span>
                    <Badge
                      className={`ml-2 text-xs ${getToneColor(reminder.tone)}`}
                    >
                      {reminder.tone.charAt(0).toUpperCase() +
                        reminder.tone.slice(1)}
                    </Badge>
                  </div>
                  {getStatusBadge(reminder.status)}
                </div>

                <p className="text-sm text-muted-foreground mt-2 font-medium">
                  {reminder.emailSubject}
                </p>

                <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatDate(reminder.sentAt)}
                  </div>

                  {reminder.responseReceived && (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Response received
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
