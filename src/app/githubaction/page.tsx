"use client";

import { useEffect, useState } from "react";
import { isFullAppMode } from "@/lib/feature-flags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Clock, GitBranch, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/trpc";

interface GitHubActionLog {
  id: string;
  actionName: string;
  runId: string;
  workflowName: string;
  gitRef: string;
  environment: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  status: "running" | "completed" | "failed" | "cancelled" | "skipped";
  triggerEvent: string;
  actor?: string;
  metadata?: any;
  errorDetails?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  running: "bg-blue-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  cancelled: "bg-gray-500",
  skipped: "bg-yellow-500",
};

const statusIcons = {
  running: Clock,
  completed: "✅",
  failed: AlertCircle,
  cancelled: "⏹️",
  skipped: "⏭️",
};

export default function GitHubActionPage() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Use tRPC query for fetching logs
  const {
    data: logsData,
    isLoading: loading,
    error,
    refetch,
  } = api.githubActions.list.useQuery(
    { limit: 50 },
    {
      refetchOnWindowFocus: false,
      refetchInterval: 30000, // Auto-refresh every 30 seconds
    }
  );

  const logs = logsData?.logs || [];

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GitHub Actions Logs</h1>
          <p className="text-muted-foreground">
            Monitor GitHub workflow executions and timing data
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastRefresh && (
            <p className="text-sm text-muted-foreground">
              Last updated: {getRelativeTime(lastRefresh.toISOString())}
            </p>
          )}
          <Button onClick={handleRefresh} disabled={loading} variant="outline">
            <RefreshCcw
              className={cn("h-4 w-4 mr-2", loading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error.message}</p>
            <Button
              onClick={handleRefresh}
              size="sm"
              variant="outline"
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {loading && !logs.length ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No workflow runs found</h3>
              <p className="text-muted-foreground">
                GitHub Actions haven't logged any runs yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {logs.map((log) => {
            const IconComponent = statusIcons[log.status];
            const isRunning = log.status === "running";

            return (
              <Card key={log.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          statusColors[log.status],
                          isRunning && "animate-pulse"
                        )}
                      />
                      <CardTitle className="text-lg">
                        {log.workflowName}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {log.actionName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          log.status === "completed" ? "default" : "secondary"
                        }
                        className="capitalize"
                      >
                        {typeof IconComponent === "string"
                          ? IconComponent
                          : IconComponent && (
                              <IconComponent className="h-3 w-3 mr-1" />
                            )}
                        {log.status}
                      </Badge>
                      <Badge variant="outline">{log.environment}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-xs">{log.gitRef}</span>
                    </div>
                    {log.actor && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{log.actor}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDuration(log.durationMs!)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getRelativeTime(log.startTime.toISOString())}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      <strong>Run ID:</strong> {log.runId}
                    </div>
                    <div>
                      <strong>Trigger:</strong> {log.triggerEvent}
                    </div>
                    <div>
                      <strong>Started:</strong>{" "}
                      {formatDateTime(log.startTime.toISOString())}
                    </div>
                    {log.endTime && (
                      <div>
                        <strong>Completed:</strong>{" "}
                        {formatDateTime(log.endTime.toISOString())}
                      </div>
                    )}
                  </div>

                  {log.errorDetails && (
                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="py-2">
                        <p className="text-xs text-red-700 font-mono">
                          {log.errorDetails}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {log.metadata && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View metadata
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
