import { Skeleton } from "@/components/ui/skeleton";
import {
  HelpCircleIcon,
  BookOpenIcon,
  CompassIcon,
  HelpCircle,
  Mail,
  ThumbsUpIcon,
} from "lucide-react";

export function HelpSkeleton() {
  return (
    <div className="flex-1 p-6 overflow-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100/50 dark:bg-blue-900/20 mb-4">
          <HelpCircleIcon className="h-8 w-8 text-blue-600/30 dark:text-blue-400/30" />
        </div>
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl mx-auto mb-2" />
        <Skeleton className="h-4 w-full max-w-xl mx-auto mb-6" />

        {/* Search bar skeleton */}
        <div className="relative max-w-md mx-auto">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="max-w-5xl mx-auto">
        <div className="flex w-full justify-center mb-6 gap-2">
          <TabSkeleton
            icon={<BookOpenIcon className="h-4 w-4 text-muted-foreground/40" />}
            text="Getting Started"
            active
          />
          <TabSkeleton
            icon={<CompassIcon className="h-4 w-4 text-muted-foreground/40" />}
            text="Features"
          />
          <TabSkeleton
            icon={<HelpCircle className="h-4 w-4 text-muted-foreground/40" />}
            text="FAQs"
          />
          <TabSkeleton
            icon={<Mail className="h-4 w-4 text-muted-foreground/40" />}
            text="Support"
          />
          <TabSkeleton
            icon={<ThumbsUpIcon className="size-4 text-muted-foreground/40" />}
            text="Feedback"
          />
        </div>

        {/* Content Skeleton - Getting Started */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-card/50 rounded-lg border border-border/50 p-6">
              <Skeleton className="h-6 w-48 mb-6" />

              <div className="space-y-8">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="p-4">
                <Skeleton className="aspect-video w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab skeleton component
function TabSkeleton({
  icon,
  text,
  active = false,
}: {
  icon: React.ReactNode;
  text?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-md ${active ? "bg-muted" : "bg-transparent"}`}
    >
      {icon}
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
