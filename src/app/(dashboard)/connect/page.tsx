"use client";
import React, { useState } from "react";
import { GmailConnect } from "@/components/GmailConnect";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CircleCheck,
  Mail,
  AlertCircle,
  Loader2,
  Clock,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Globe,
  Workflow,
  TrendingUp,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";
import { toast } from "sonner";
import { ConnectSkeleton } from "./components/ConnectSkeleton";
import { GmailConnectSkeleton } from "./components/GmailConnectSkeleton";
import Image from "next/image";
import { api } from "@/lib/trpc";

export default function ConnectPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use tRPC to check Gmail connection status
  const {
    data: connectionStatus,
    isLoading: connectionLoading,
    error: connectionError,
    refetch: refetchConnection,
  } = api.connections.checkGmailConnection.useQuery(undefined, {
    enabled: isInitialized, // Only run query after user is initialized
    staleTime: 30 * 1000, // 30 seconds
  });

  // Handle connection errors
  React.useEffect(() => {
    if (connectionError) {
      console.error("Connection check error:", connectionError);
      toast.error("Failed to check connection status");
    }
  }, [connectionError]);

  // Initialize user session
  const initializeUser = async () => {
    try {
      const { data: session, error } = await authClient.getSession();
      if (!session || !session.user) {
        throw new Error(
          "Unauthorized, sign in before connecting gmail account"
        );
      }

      setUser(session.user);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initialize page");
    }
  };

  // Initialize user on component mount
  React.useEffect(() => {
    initializeUser();
  }, []);

  const isConnected = connectionStatus?.isConnected ?? false;
  const connectionData = connectionStatus?.connectionData ?? null;
  const isLoading = !isInitialized || connectionLoading;

  if (isLoading) {
    return <GmailConnectSkeleton />;
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4">
          Please sign in before connecting your Gmail account
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="relative container max-w-7xl mx-auto py-16 px-6">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Supercharge Your Workflow
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            Connect & Automate
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Seamlessly integrate your favorite tools to unlock powerful
            automation and streamline your invoice management workflow.
          </p>
        </div>

        {/* Main Gmail Connection Card */}
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
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                      Gmail Integration
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Setup in under 30 seconds
                    </CardDescription>
                  </div>
                </div>
                {isConnected ? (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 px-4 py-2 text-sm font-medium shadow-lg">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Connected
                  </Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 px-4 py-2 text-sm font-medium shadow-lg">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Connect Now
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="relative px-8">
              {isConnected ? (
                <div className="space-y-8">
                  {/* Connected State */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-emerald-500 p-2 rounded-xl">
                        <Mail className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-emerald-900">
                          {connectionData?.email}
                        </h3>
                        <div className="flex items-center text-emerald-700 text-sm mt-1">
                          <Clock className="h-4 w-4 mr-2" />
                          Connected on{" "}
                          {connectionData?.connectedAt
                            ? new Date(
                                connectionData.connectedAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : ""}
                        </div>
                      </div>
                    </div>
                    <p className="text-emerald-800 leading-relaxed">
                      🎉 Perfect! Your Gmail account is successfully connected
                      and ready to send professional invoice reminders
                      automatically. You're all set to streamline your payment
                      collection process.
                    </p>
                  </div>

                  {/* Features Grid for Connected State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: Workflow,
                        title: "Smart Automation",
                        description:
                          "Intelligent follow-up sequences based on invoice status and payment behavior.",
                      },
                      {
                        icon: Shield,
                        title: "Secure & Private",
                        description:
                          "Bank-level encryption ensures your email credentials are completely secure.",
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="bg-white/60 border border-slate-200 rounded-xl p-4 hover:bg-white/80 transition-all duration-300"
                      >
                        <feature.icon className="w-6 h-6 text-blue-600 mb-3" />
                        <h4 className="font-semibold text-slate-900 mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Connection CTA */}
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-lg">
                      <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      Ready to Automate Your Invoices?
                    </h3>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                      Connect your Gmail account to unlock powerful automation
                      features and never chase a payment manually again.
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                      {
                        icon: Zap,
                        title: "Lightning Fast",
                        description:
                          "Send reminders instantly with just one click, or set up automatic sequences.",
                        color: "from-yellow-400 to-orange-500",
                      },
                      {
                        icon: Star,
                        title: "Professional Templates",
                        description:
                          "Beautiful, customizable email templates that maintain your brand image.",
                        color: "from-purple-400 to-pink-500",
                      },
                      {
                        icon: TrendingUp,
                        title: "Boost Collections",
                        description:
                          "Increase payment rates by up to 40% with timely, professional follow-ups.",
                        color: "from-green-400 to-emerald-500",
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="bg-white/60 border border-white/40 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 hover:scale-105"
                      >
                        <div
                          className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.color} rounded-2xl mb-4 shadow-lg`}
                        >
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-slate-900 mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Security Notice */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-500 p-2 rounded-xl">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">
                          Enterprise-Grade Security
                        </h4>
                        <p className="text-blue-800 text-sm leading-relaxed">
                          We use OAuth 2.0 and bank-level encryption to protect
                          your credentials. We never store your Gmail password,
                          and you can revoke access anytime from your Google
                          account settings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {!isConnected && (
              <CardFooter className="relative bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200 px-8 py-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Shield className="w-4 h-4" />
                    <span>
                      Secure OAuth 2.0 connection - your credentials stay
                      private
                    </span>
                  </div>
                  {user && (
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-slate-600">
                        <div>Ready to automate your invoices?</div>
                        <div className="font-medium">Connect securely →</div>
                      </div>
                      <GmailConnect
                        userId={user.id}
                        onSuccess={() => {
                          // Refetch connection status to update UI
                          refetchConnection();
                          toast.success(
                            "🎉 Gmail connected successfully! You're ready to automate your invoices."
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">
            More Integrations Coming Soon
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              {
                name: "Slack",
                logo: "💬",
                color: "from-purple-400 to-pink-500",
              },
              {
                name: "Zapier",
                logo: "⚡",
                color: "from-orange-400 to-red-500",
              },
              {
                name: "QuickBooks",
                logo: "📊",
                color: "from-blue-400 to-indigo-500",
              },
              {
                name: "Stripe",
                logo: "💳",
                color: "from-green-400 to-emerald-500",
              },
            ].map((integration, index) => (
              <div
                key={index}
                className="bg-white/40 border border-white/40 rounded-2xl p-4 text-center opacity-60"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${integration.color} rounded-2xl mb-3 text-2xl`}
                >
                  {integration.logo}
                </div>
                <div className="font-medium text-slate-700">
                  {integration.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">Coming Soon</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
