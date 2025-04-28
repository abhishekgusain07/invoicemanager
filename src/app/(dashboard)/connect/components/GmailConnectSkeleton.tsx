import { Mail, CircleCheck, AlertCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";

export function GmailConnectSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <div className="flex flex-col space-y-2 mb-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Card className="overflow-hidden shadow-sm border-slate-200 mb-6">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg">
                <Image src="/gmail.svg" alt="Gmail" width={20} height={20} className="size-9" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">
                  <Skeleton className="h-6 w-36" />
                </CardTitle>
                <CardDescription className="text-sm">
                  <Skeleton className="h-4 w-48" />
                </CardDescription>
              </div>
            </div>
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-5">
            <Skeleton className="h-5 w-full" />
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg shrink-0">
                  <Image src="/gmail.svg" alt="Gmail" width={20} height={20} className="size-9" />
                </div>
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 flex justify-end">
          <Skeleton className="h-10 w-40 rounded-md" />
        </CardFooter>
      </Card>
    </div>
  );
} 