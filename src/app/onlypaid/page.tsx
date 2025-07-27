"use client";
import { useUser } from "@/hooks/useUser";
import { isAuthorized } from "@/utils/isAuthorized";
import { Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const OnlyPaidSubs = () => {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [authorized, setAuthorized] = useState<boolean>(true);

  useEffect(() => {
    console.log("Effect running, authorized:", authorized);
    const checkSubscription = async () => {
      if (!user || !user.id) return;

      try {
        setLoading(true);
        const { authorized: res } = await isAuthorized(user.id);
        console.log("Authorization result:", res);
        setAuthorized(res);
        console.log("Set authorized to true");
      } catch (error) {
        console.error("Subscription check error:", error);
        toast.error("Cannot check subscription");
      } finally {
        setLoading(false);
      }
    };

    if (!userLoading && user) {
      checkSubscription();
    }
  }, [user, userLoading, authorized]);

  console.log("Component state:", { userLoading, loading, authorized });

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    console.log("Not authorized, redirecting...");
    router.replace("/not-subscriber");
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Premium Content</h1>
      <p className="mt-4">
        Welcome to the premium area! You are authorized to view this content.
      </p>
    </div>
  );
};

export default OnlyPaidSubs;
