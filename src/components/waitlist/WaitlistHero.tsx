"use client";

import { Badge } from "@/components/ui/badge";
import { WaitlistForm } from "./WaitlistForm";
import { useWaitlistCount } from "@/hooks/useWaitlistCount";

export function WaitlistHero() {
  const { count, isLoading } = useWaitlistCount();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/50 to-white -z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-600/5 -z-10" />

      <div className="container px-4 md:px-6 mx-auto max-w-6xl text-center">
        {/* Status Badge */}
        <div className="mb-8">
          <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 px-4 py-2 text-sm font-medium">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            {isLoading
              ? "LAUNCHING SOON!"
              : `${count}+ PEOPLE ALREADY JOINED THE WAITLIST!`}
          </Badge>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] text-slate-900 mb-8 max-w-5xl mx-auto">
          Professional Invoice
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Management
          </span>
          <br />
          for Freelancers & Agencies
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
          Stop chasing payments and focus on what matters. Our intelligent
          system handles follow-ups, tracks payments, and gets you paid 75%
          faster.
        </p>

        {/* Waitlist Form */}
        <div className="max-w-md mx-auto mb-16">
          <WaitlistForm />
        </div>

        {/* Launch Timeline */}
        <div className="text-center">
          <p className="text-slate-500 text-sm uppercase tracking-wide mb-8 font-medium">
            LAUNCHING Q2 2025 - GET EARLY ACCESS:
          </p>

          {/* Benefits for Waitlist Members */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                Early Access
              </div>
              <div className="text-sm text-slate-600">7 days before launch</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                50% Off
              </div>
              <div className="text-sm text-slate-600">Launch discount</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                Priority Support
              </div>
              <div className="text-sm text-slate-600">
                First in line for help
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
