"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, DollarSign, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useUser } from "@/hooks/useUser";

type PricingSwitchProps = {
  onSwitch: (value: string) => void;
};

type PricingCardProps = {
  user: any;
  handleCheckout: any;
  priceIdMonthly: any;
  priceIdYearly: any;
  isYearly?: boolean;
  title: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  description: string;
  features: string[];
  actionLabel: string;
  popular?: boolean;
  exclusive?: boolean;
};

const PricingHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div className="text-center mb-10">
    {/* Pill badge */}
    <div className="mx-auto w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 mb-6">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <DollarSign className="h-4 w-4" />
        <span>Pricing</span>
      </div>
    </div>

    <h2 className="text-3xl md:text-4xl font-bold pb-2">
      {title}
    </h2>
    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
      {subtitle}
    </p>
  </div>
);

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <div className="flex justify-center items-center gap-3">
    <Tabs defaultValue="0" className="w-[400px]" onValueChange={onSwitch}>
      <TabsList className="w-full">
        <TabsTrigger value="0" className="w-full">
          Monthly
        </TabsTrigger>
        <TabsTrigger value="1" className="w-full">
          Yearly
          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Save 16%
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
);

const PricingCard = ({
  user,
  handleCheckout,
  isYearly,
  title,
  priceIdMonthly,
  priceIdYearly,
  monthlyPrice,
  yearlyPrice,
  description,
  features,
  actionLabel,
  popular,
  exclusive,
}: PricingCardProps) => {
  const router = useRouter();

  return (
    <Card
      className={cn(
        "w-full max-w-sm flex flex-col justify-between px-2 py-1 backdrop-blur-sm transition-all duration-200 hover:shadow-lg h-full", 
        {
          "relative border-2 border-primary": popular,
          "relative": exclusive,
        }
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1">
          <p className="text-sm font-medium text-white">Most Popular</p>
        </div>
      )}
      
      {exclusive && (
        <div className="absolute -top-3 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1">
          <p className="text-sm font-medium text-white">Enterprise</p>
        </div>
      )}

      <div>
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">
              ${isYearly ? yearlyPrice : monthlyPrice}
            </span>
            <span className="text-muted-foreground">
              /mo
            </span>
          </div>

          <div className="mt-6 space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-muted-foreground">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="mt-auto">
        <Button
          onClick={() => {
            if (!user) {
              router.push("/sign-in");
              return;
            }
            handleCheckout(isYearly ? priceIdYearly : priceIdMonthly, true);
          }}
          className={cn("w-full", {
            "bg-primary hover:bg-primary/90": popular || exclusive,
          })}
        >
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function Pricing() {
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const togglePricingPeriod = (value: string) =>
    setIsYearly(parseInt(value) === 1);
  const { user } = useUser();
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!));
  }, []);

  const handleCheckout = async (priceId: string, subscription: boolean) => {
    try {
      const { data } = await axios.post(
        `/api/payments/create-checkout-session`,
        {
          userId: user?.id,
          email: user?.email,
          priceId,
          subscription,
        }
      );

      if (data.sessionId) {
        const stripe = await stripePromise;
        const response = await stripe?.redirectToCheckout({
          sessionId: data.sessionId,
        });
        return response;
      } else {
        console.error("Failed to create checkout session");
        toast("Failed to create checkout session");
        return;
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast("Error during checkout");
      return;
    }
  };

  const plans = [
    {
      title: "Starter",
      monthlyPrice: 29,
      yearlyPrice: 24,
      description:
        "Perfect for indie developers launching their first SaaS project.",
      features: [
        "All core features",
        "Authentication & user management",
        "Basic Stripe integration",
        "Community support",
        "1 team member"
      ],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      actionLabel: "Get Started",
    },
    {
      title: "Pro",
      monthlyPrice: 79,
      yearlyPrice: 66,
      description: "For growing startups that need more power and features.",
      features: [
        "Everything in Starter",
        "Advanced analytics",
        "Multi-tier subscription management",
        "Priority email support",
        "Up to 5 team members",
        "Custom branding"
      ],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      actionLabel: "Upgrade to Pro",
      popular: true,
    },
    {
      title: "Enterprise",
      monthlyPrice: 299,
      yearlyPrice: 249,
      description: "Custom solutions for high-scale SaaS applications.",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "24/7 dedicated support",
        "Custom integrations",
        "SLA guarantees",
        "White-labeling",
        "Dedicated account manager"
      ],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      actionLabel: "Contact Sales",
      exclusive: true,
    },
  ];

  return (
    <section className="px-4 py-10" id="pricing">
      <div className="max-w-7xl mx-auto">
        <PricingHeader
          title="Simple, Transparent Pricing"
          subtitle="Launch your SaaS product faster with our complete template. All plans include the core infrastructure you need."
        />
        <PricingSwitch onSwitch={togglePricingPeriod} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-10"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1
              }}
              viewport={{ once: true }}
            >
              <PricingCard
                user={user}
                handleCheckout={handleCheckout}
                {...plan}
                isYearly={isYearly}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
