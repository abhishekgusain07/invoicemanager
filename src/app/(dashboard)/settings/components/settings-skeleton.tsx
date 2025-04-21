import { BellIcon, UserCogIcon, MailIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b gap-2">
        <button className="flex items-center gap-2 px-4 py-2 border-b-2 font-medium border-primary text-primary">
          <BellIcon className="h-4 w-4" /> Reminder Settings
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border-b-2 font-medium border-transparent hover:border-muted-foreground/20 hover:text-muted-foreground">
          <UserCogIcon className="h-4 w-4" /> Account Settings
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border-b-2 font-medium border-transparent hover:border-muted-foreground/20 hover:text-muted-foreground">
          <MailIcon className="h-4 w-4" /> Email Settings
        </button>
      </div>

      {/* Skeleton for Reminder Settings (active by default) */}
      <div className="py-4 space-y-8">
        {/* First Settings Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-5 w-full max-w-md mb-3" />
            
            <div className="space-y-4">
              {/* Toggle Row */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              
              {/* Input Rows */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Second Settings Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-52 mb-2" />
            <Skeleton className="h-5 w-full max-w-md mb-3" />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            
            {/* Toggle Rows */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 