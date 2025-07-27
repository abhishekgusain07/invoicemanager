"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { useUser } from "@/hooks/useUser";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import {
  Loader2,
  LogOut,
  CreditCard,
  UserCircle,
  Settings,
  LayoutDashboard,
  MessageSquareHeart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  // This correctly uses the custom hook, getting userId from the user object
  const { FeedbackModalComponent } = useFeedbackModal(user?.id);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/sign-in");
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <FeedbackButton />
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                onClick={async () => {
                  await authClient.signOut();
                  router.replace("/sign-in");
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center text-center pb-2">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 mb-4 relative">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "Profile"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <UserCircle className="h-full w-full text-gray-400" />
                )}
              </div>
              <CardTitle>{user.name || "Welcome!"}</CardTitle>
              <CardDescription className="mt-1">{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Subscription Status
                </p>
                <p className="font-medium mt-1">
                  {(user as any)?.subscription ? (
                    <span className="text-green-600 dark:text-green-400">
                      Active Premium
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">
                      Free Plan
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push("/settings")}
              >
                <Settings size={16} className="mr-2" />
                Account Settings
              </Button>
            </CardFooter>
          </Card>

          {/* Dashboard Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card className="border-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Welcome back, {user.name?.split(" ")[0] || "there"}!
                </CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  Here's what's happening with your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Your account is fully set up and ready to go.</p>
              </CardContent>
            </Card>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <LayoutDashboard size={18} className="mr-2 text-blue-500" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500">
                    Manage your subscription and billing information
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/onlypaid")}
                    className="w-full"
                  >
                    <CreditCard size={16} className="mr-2" />
                    Manage Subscription
                  </Button>
                </CardFooter>
              </Card>

              <Card className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquareHeart
                      size={18}
                      className="mr-2 text-pink-500"
                    />
                    Your Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-500">
                    We value your opinion! Help us improve our service.
                  </p>
                </CardContent>
                <CardFooter>
                  <FeedbackButton />
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Render the feedback modal (it will only show when opened) */}
      <FeedbackModalComponent />
    </div>
  );
}
