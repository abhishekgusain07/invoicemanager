"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import config from "@/config";
import Pricing from "@/components/pricing";

export default function NotSubscriber() {
  return (
    <div className="flex min-w-screen min-h-screen flex-col pt-[4rem] items-center dark:bg-black bg-white justify-between">
      <h1>Not authorized</h1>

      {config.auth.enabled && config.payments.enabled && (
        <section id="pricing" className="pb-[5rem]">
          {/* <Pricing /> */}
          pricing (turned off for now)
        </section>
      )}
    </div>
  );
}

const features = [
  {
    name: "Premium Features",
    description:
      "Access all premium features and tools to enhance your workflow.",
    icon: Sparkles,
  },
  {
    name: "Priority Support",
    description:
      "Get priority access to our support team and quick response times.",
    icon: Sparkles,
  },
  {
    name: "Regular Updates",
    description:
      "Stay ahead with early access to new features and improvements.",
    icon: Sparkles,
  },
];
