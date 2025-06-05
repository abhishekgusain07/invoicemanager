"use client";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from "next/link";
import { Suspense, lazy, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Import LucideIcon type and components
import type { LucideIcon } from 'lucide-react';

// Lazy load components
const NavbarDemo = dynamic(() => import('@/components/navbar').then(mod => mod.NavbarDemo), { 
  ssr: true,
  loading: () => <div className="h-16 w-full bg-background" />
});

const LazyFooter = dynamic(() => import('./components/footer'), { 
  ssr: false,
  loading: () => null 
});

const Announcement = dynamic(() => import('./components/announcement'), { 
  ssr: false,
  loading: () => null
});

// UI Components with proper typing
const HoverEffect = dynamic(
  () => import('@/components/ui/card-hover-effect').then(mod => ({
    default: mod.HoverEffect
  })), 
  { ssr: false }
);

const Button = dynamic(
  () => import('@/components/ui/button').then(mod => ({
    default: mod.Button
  })), 
  { ssr: false }
);

const Badge = dynamic(
  () => import('@/components/ui/badge').then(mod => ({
    default: mod.Badge
  })), 
  { ssr: false }
);

// Lazy load icons with proper typing
const createLazyIcon = (iconName: string) => 
  dynamic(
    () => import('lucide-react').then(mod => ({
      default: mod[iconName as keyof typeof mod] as React.ComponentType<any>
    })), 
    { 
      ssr: false,
      loading: () => <span className="inline-block h-6 w-6 animate-pulse rounded bg-muted" />
    }
  );

const ArrowRight = createLazyIcon('ArrowRight');
const CheckCircle = createLazyIcon('CheckCircle');
const Clock = createLazyIcon('Clock');
const DollarSign = createLazyIcon('DollarSign');
const FileText = createLazyIcon('FileText');
const MailCheck = createLazyIcon('MailCheck');
const PieChart = createLazyIcon('PieChart');
const Users = createLazyIcon('Users');

// Lazy load sections with Suspense boundaries
const LazyPricing = dynamic(() => import('@/components/pricing'), {
  loading: () => <div className="h-[600px] w-full animate-pulse bg-muted/50" />,
  ssr: false,
});

const LazyProblemSection = dynamic(() => import('@/app/components/problem'), {
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted/50" />,
  ssr: false,
});

const LazySolutionSection = dynamic(() => import('@/app/components/solution'), {
  loading: () => <div className="h-[400px] w-full animate-pulse bg-muted/50" />,
  ssr: false,
});

const LazyTechnologyUsed = dynamic(() => import('@/app/components/techused'), {
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/50" />,
  ssr: false,
});

export default function Home() {
  
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  
  useEffect(() => {
    const announcementDismissed = localStorage.getItem('announcement_dismissed');
    if (!announcementDismissed) {
      setShowAnnouncement(true);
    }
  }, []);
  
  const handleAnnouncementDismiss = () => {
    // Store the dismissal in localStorage so it stays dismissed on refresh
    localStorage.setItem('announcement_dismissed', 'true');
    setShowAnnouncement(false);
  };
  const announcement = {
    message: "New feature:",
    link: {
      text: "Automated Payment Reminders",
      url: "#automated-reminders"
    },
    emoji: "💰"
  };

  // Statistics to showcase app benefits
  const stats = [
    { value: "68%", label: "Faster payments", description: "Average improvement in payment time" },
    { value: "3.5h", label: "Time saved weekly", description: "Per freelancer on invoice management" },
    { value: "94%", label: "Client satisfaction", description: "With professional invoice handling" },
  ];

  // Testimonials from satisfied users
  const testimonials = [
    {
      quote: "Since using InvoiceManager, my average payment time went from 45 days to just 12. The automated reminders are a game-changer.",
      author: "Sarah Johnson",
      role: "Graphic Designer",
      avatar: "/avatars/sarah.jpg"
    },
    {
      quote: "I used to spend hours chasing payments. Now the system does it for me, and I can focus on actual client work.",
      author: "Michael Chen",
      role: "Web Developer",
      avatar: "/avatars/michael.jpg"
    },
    {
      quote: "The professional templates and tracking features have completely transformed how I manage my freelance business.",
      author: "Aisha Patel",
      role: "Content Strategist",
      avatar: "/avatars/aisha.jpg"
    }
  ];

  const features: Array<{
    title: string;
    description: string;
    link: string;
    icon: LucideIcon;
  }> = [
    {
      title: "Invoice Management",
      description:
        "Create and store detailed invoice records with client details, amounts, due dates, and custom notes.",
      link: "#invoice-management",
      icon: FileText
    },
    {
      title: "Dashboard Overview",
      description:
        "At-a-glance visualization with color-coded indicators showing on-time, approaching due date, and overdue invoices.",
      link: "#dashboard",
      icon: PieChart
    },
    {
      title: "Automated Follow-ups",
      description:
        "Pre-designed email templates with escalating tones from soft reminders to final notices with dynamic client information.",
      link: "#follow-ups",
      icon: MailCheck
    },
    {
      title: "Client Management",
      description:
        "Detailed client profiles with payment history, behavior patterns, and communication logs for all payment interactions.",
      link: "#client-management",
      icon: Users
    },
    {
      title: "Payment Analytics",
      description:
        "Track average days-to-payment metrics and identify problematic accounts to improve your cash flow management.",
      link: "#analytics",
      icon: DollarSign
    },
    {
      title: "Mobile Responsive",
      description:
        "Manage your invoices on the go with a fully responsive design that works on desktop, tablet, and mobile devices.",
      link: "#responsive",
      icon: Clock
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Suspense fallback={null}>
        {showAnnouncement && (
          <Announcement
            message={announcement.message}
            link={announcement.link}
            emoji={announcement.emoji}
            onDismiss={handleAnnouncementDismiss}
          />
        )}
      </Suspense>
      <Suspense fallback={<div className="h-16 w-full bg-background" />}>
        <NavbarDemo>
          {/* Hero Section */}
          <section className="relative pt-8 pb-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10 -z-10" />
            <div className="container px-4 md:px-6 mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col space-y-6">
                  <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-4 py-1.5 text-sm font-medium">Freelancer-Friendly</Badge>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground dark:from-primary-foreground dark:to-primary/80 leading-tight">
                    Get Paid Faster,<br />
                    <span className="inline-block mt-1">Every Single Time</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-xl">
                    Stop chasing payments and focus on what matters—your work. Our intelligent invoice management system handles the follow-ups for you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild size="lg" className="font-medium text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                      <Link href="/dashboard">
                        Start Managing Invoices <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="font-medium text-lg">
                      <Link href="#features">See Features</Link>
                    </Button>
                  </div>
                  
                  {/* Stats Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-border/40">
                    {stats.map((stat, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-3xl font-bold text-primary">{stat.value}</span>
                        <span className="text-sm font-medium">{stat.label}</span>
                        <span className="text-xs text-muted-foreground">{stat.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                    <Image 
                      src="/dashboard-preview.png" 
                      alt="Invoice Manager Dashboard" 
                      width={600} 
                      height={400}
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section id="features" className="py-20 px-4 md:px-6 bg-secondary/5">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-16 max-w-3xl mx-auto">
                <Badge className="mb-4 bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors">Features</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Invoice Management</h2>
                <p className="text-muted-foreground">Everything you need to streamline your invoicing workflow and get paid on time.</p>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="font-medium text-lg">
                    <Link href="#features">See Features</Link>
                  </Button>
                </div>
                
                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-border/40">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col">
                      <span className="text-3xl font-bold text-primary">{stat.value}</span>
                      <span className="text-sm font-medium">{stat.label}</span>
                      <span className="text-xs text-muted-foreground">{stat.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-2xl">
                  <Image 
                    src="/dashboard-preview.png" 
                    alt="Invoice Manager Dashboard" 
                    width={600} 
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
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
