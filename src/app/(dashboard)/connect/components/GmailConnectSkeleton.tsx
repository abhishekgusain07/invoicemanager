import {
  Mail,
  CircleCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
} from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative container max-w-7xl mx-auto py-16 px-6">
        {/* Hero Header Skeleton */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <Skeleton className="h-4 w-32 bg-blue-500" />
          </div>
          <Skeleton className="h-16 w-96 mx-auto mb-6" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>

        {/* Main Gmail Connection Card Skeleton */}
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-blue-50/50 pointer-events-none"></div>

            <CardHeader className="relative pb-8 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl opacity-20 blur-lg"></div>
                    <div className="relative bg-gradient-to-br from-red-500 to-orange-500 p-4 rounded-3xl">
                      <Image
                        src="/gmail.svg"
                        alt="Gmail"
                        width={32}
                        height={32}
                        className="w-8 h-8 filter brightness-0 invert"
                      />
                    </div>
                  </div>
                  <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-8 w-32 rounded-full" />
              </div>
            </CardHeader>

            <CardContent className="relative px-8">
              <div className="space-y-8">
                {/* Connection CTA Skeleton */}
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-lg">
                    <Mail className="w-10 h-10 text-white" />
                  </div>
                  <Skeleton className="h-8 w-80 mx-auto mb-4" />
                  <Skeleton className="h-6 w-96 mx-auto" />
                </div>

                {/* Features Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { color: "from-yellow-400 to-orange-500" },
                    { color: "from-purple-400 to-pink-500" },
                    { color: "from-green-400 to-emerald-500" },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white/60 border border-white/40 rounded-2xl p-6"
                    >
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.color} rounded-2xl mb-4 shadow-lg`}
                      >
                        <Skeleton className="w-6 h-6 bg-white/30" />
                      </div>
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>

                {/* Security Notice Skeleton */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-500 p-2 rounded-xl">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="relative bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200 px-8 py-6">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-40 rounded-md" />
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Coming Soon Section Skeleton */}
        <div className="mt-16 text-center">
          <Skeleton className="h-8 w-80 mx-auto mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { color: "from-purple-400 to-pink-500" },
              { color: "from-orange-400 to-red-500" },
              { color: "from-blue-400 to-indigo-500" },
              { color: "from-green-400 to-emerald-500" },
            ].map((integration, index) => (
              <div
                key={index}
                className="bg-white/40 border border-white/40 rounded-2xl p-4 text-center opacity-60"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${integration.color} rounded-2xl mb-3`}
                >
                  <Skeleton className="w-6 h-6 bg-white/30" />
                </div>
                <Skeleton className="h-5 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
