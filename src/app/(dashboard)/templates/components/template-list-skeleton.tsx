import { PlusIcon, FilterIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectContent } from "@/components/ui/select";

export function TemplateListSkeleton() {
  // Generate 6 skeleton template cards
  const skeletonCards = Array.from({ length: 6 }).map((_, index) => (
    <Card key={index} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16 rounded-full" />
            {/* Randomly show "Default" badge on some cards */}
            {index % 3 === 0 && (
              <Skeleton className="h-4 w-14 rounded-full" />
            )}
          </div>
          <Skeleton className="h-5 w-3/4 mt-2" />
          <Skeleton className="h-4 w-4/5 mt-1" />
        </div>
        <div className="p-3 bg-muted/50">
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        <div className="p-3 flex justify-end gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Skeleton className="h-10 w-[250px]" />
          <div className="md:w-[180px]">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-[130px]" />
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skeletonCards}
      </div>
    </div>
  );
} 