"use client";
import { NavbarDemo } from "@/components/navbar";
import Pricing from "@/components/pricing";
import Image from "next/image";
import Link from "next/link";
import ProblemSection from "./components/problem";
import SolutionSection from "./components/solution";
import Footer from "./components/footer";
import TechnologyUsed from "./components/techused";
import Announcement from "./components/announcement";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import type { LucideIcon } from "lucide-react";

export default function Home() {
  
  const showAnnouncement = true;
  const announcement = {
    message: "New feature:",
    link: {
      text: "Automated Payment Reminders",
      url: "#automated-reminders"
    },
    emoji: "💰"
  };

  const features: Array<{
    title: string;
    description: string;
    link: string;
    icon?: LucideIcon;
  }> = [
    {
      title: "Invoice Management",
      description:
        "Create and store detailed invoice records with client details, amounts, due dates, and custom notes.",
      link: "#invoice-management",
    },
    {
      title: "Dashboard Overview",
      description:
        "At-a-glance visualization with color-coded indicators showing on-time, approaching due date, and overdue invoices.",
      link: "#dashboard",
    },
    {
      title: "Automated Follow-ups",
      description:
        "Pre-designed email templates with escalating tones from soft reminders to final notices with dynamic client information.",
      link: "#follow-ups",
    },
    {
      title: "Client Management",
      description:
        "Detailed client profiles with payment history, behavior patterns, and communication logs for all payment interactions.",
      link: "#client-management",
    },
    {
      title: "Payment Analytics",
      description:
        "Track average days-to-payment metrics and identify problematic accounts to improve your cash flow management.",
      link: "#analytics",
    },
    {
      title: "Mobile Responsive",
      description:
        "Manage your invoices on the go with a fully responsive design that works on desktop, tablet, and mobile devices.",
      link: "#responsive",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Announcement 
        show={showAnnouncement} 
        message={announcement.message}
        link={announcement.link}
        emoji={announcement.emoji}
      />
      <NavbarDemo>
        {/* Hero Section */}
        <section className="pt-8 pb-8 px-4 md:px-8 lg:px-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 leading-tight">
            Get Paid Faster <br />
            <span className="inline-block mt-1 mb-2">Every Time</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-6">
            Streamline your payment collection and end late invoice headaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              Start Managing Invoices
            </Link>
          </div>
        </section>
        {/* Features Section */}
        <section id="features" className="py-16 px-4 md:px-8 lg:px-16 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Powerful Invoice Management</h2>
            <HoverEffect items={features} />
          </div>
        </section>


        <ProblemSection />

        <SolutionSection />
        {/* Pricing Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <Pricing />
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Improve Your Cash Flow?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Transform invoice collection from a time-consuming burden into a streamlined workflow.
            </p>
            <Link href="/sign-up" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium inline-block">
              Start Your Free Trial
            </Link>
          </div>
        </section>
        <Footer />
      </NavbarDemo>
    </div>
  );
}
