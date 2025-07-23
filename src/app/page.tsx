"use client";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
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
const Zap = createLazyIcon('Zap');
const Shield = createLazyIcon('Shield');
const Smartphone = createLazyIcon('Smartphone');
const Bot = createLazyIcon('Bot');
const RefreshCw = createLazyIcon('RefreshCw');
const CreditCard = createLazyIcon('CreditCard');

// Lazy load sections with Suspense boundaries
const LazyPricing = dynamic(() => import('@/components/pricing'), {
  loading: () => <div className="h-[600px] w-full animate-pulse bg-muted/50" />,
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
    localStorage.setItem('announcement_dismissed', 'true');
    setShowAnnouncement(false);
  };

  const announcement = {
    message: "✨ New feature:",
    link: {
      text: "AI Smart Invoicing & Reminders",
      url: "#ai-features"
    },
    emoji: "🤖"
  };

  // Statistics to showcase app benefits
  const stats = [
    { value: "75%", label: "Faster Payments", description: "Average improvement in payment collection time" },
    { value: "4.2h", label: "Time Saved Weekly", description: "Per freelancer on invoice management" },
    { value: "96%", label: "Client Satisfaction", description: "With automated professional follow-ups" },
  ];

  // Main features with your specified list
  const features = [
    {
      title: "Client & Payment Tracking",
      description: "Smart tracking per company with detailed payment history, behavior patterns, and automated status updates.",
      icon: Users,
      status: "live",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Recurring Invoices + Auto Follow-Ups",
      description: "Set up recurring invoices and let our system handle automated follow-ups with escalating professional tones.",
      icon: RefreshCw,
      status: "live", 
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Built-in Stripe/PayPal Integration",
      description: "Easy setup with popular payment processors. Accept payments directly through your invoices.",
      icon: CreditCard,
      status: "live",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Role-Based Access (VA/Accountants)",
      description: "Per company access control. Give your team members appropriate permissions for different clients.",
      icon: Shield,
      status: "live",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "AI Smart Invoicing & Reminders",
      description: "Planned AI tools for intelligent invoice generation and personalized reminder scheduling.",
      icon: Bot,
      status: "planned",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Beautiful Dashboards with Receivables",
      description: "UX focused dashboards that give you clear visibility into your cash flow and outstanding payments.",
      icon: PieChart,
      status: "live",
      color: "from-teal-500 to-blue-500"
    }
  ];

  // Benefits section
  const benefits = [
    {
      title: "Stop Chasing Payments",
      description: "Automated reminders handle follow-ups so you can focus on your actual work",
      icon: Clock
    },
    {
      title: "Professional Image",
      description: "Consistent, professional communication that builds trust with clients",
      icon: CheckCircle
    },
    {
      title: "Better Cash Flow",
      description: "Get paid 75% faster on average with our systematic approach",
      icon: DollarSign
    },
    {
      title: "Mobile-First Design",
      description: "Manage invoices on the go with our optimized mobile experience",
      icon: Smartphone
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Suspense fallback={null}>
        {showAnnouncement && (
          <Announcement
            show={showAnnouncement}
            key={announcement.message}
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
          <section className="relative pt-12 pb-24 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 -z-10" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
            
            <div className="container px-4 md:px-6 mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Content */}
                <div className="flex flex-col space-y-8">
                  <Badge className="w-fit bg-gradient-to-r from-primary/20 to-secondary/20 text-primary hover:from-primary/30 hover:to-secondary/30 transition-all duration-300 px-4 py-2 text-sm font-medium border-0">
                    <Zap className="w-4 h-4 mr-2" />
                    Freelancer & Agency Focused
                  </Badge>
                  
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900 dark:text-slate-100">
                    Get Paid On Time, Every Time
                  </h1>
                  
                  <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                    Track every payment, every time — without lifting a finger. While others make it complicated, we make it simple.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button asChild size="lg" className="font-medium text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group">
                      <Link href="/dashboard">
                        Try for free
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="font-medium text-lg border-2 hover:bg-muted/50 transition-all duration-300">
                      <Link href="#features">Request a demo →</Link>
                    </Button>
                  </div>
                  
                  {/* Stats Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 pt-8 border-t border-border/40">
                    {stats.map((stat, index) => (
                      <div key={index} className="flex flex-col space-y-1">
                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">{stat.value}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{stat.label}</span>
                        <span className="text-xs text-muted-foreground leading-relaxed">{stat.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right Content - Illustration */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Mock Invoice Interface */}
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Invoice
                        </Badge>
                      </div>
                      
                      {/* Mock payment methods */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
                          <span className="font-medium">Card</span>
                          <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                          <span className="font-medium flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            UPI
                          </span>
                          <div className="w-6 h-6 bg-slate-600 rounded-full"></div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800/50">
                          <span className="font-medium">Netbanking</span>
                          <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
                          <span className="font-medium">Cash</span>
                          <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Floating elements */}
                      <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-bounce"></div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-secondary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section id="features" className="py-24 px-4 md:px-6 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent dark:via-slate-900/50 -z-10" />
            
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-20 max-w-4xl mx-auto">
                <Badge className="mb-6 bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors border-0">
                  <Zap className="w-4 h-4 mr-2" />
                  Features
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100">
                  Everything you need to manage invoices like a pro
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  From smart tracking to AI-powered reminders, we've got every aspect of invoice management covered.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="group relative p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-border/50 rounded-2xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                      
                      <div className="relative">
                        <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {feature.title}
                          </h3>
                          <Badge 
                            variant={feature.status === 'live' ? 'default' : 'secondary'}
                            className={`text-xs ${
                              feature.status === 'live' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}
                          >
                            {feature.status === 'live' ? 'Live' : 'Planned'}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          
          {/* Benefits Section */}
          <section className="py-24 px-4 md:px-6 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
            <div className="container mx-auto max-w-7xl">
              <div className="text-center mb-20 max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100">
                  Why freelancers choose us
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Built specifically for freelancers and agencies who want to focus on their craft, not chasing payments.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="text-center group"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-24 px-4 md:px-6">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-800/90 backdrop-blur-sm border border-border/50 rounded-2xl p-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100">
                    Ready to get paid faster?
                  </h2>
                  <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                    Transform invoice collection from a time-consuming burden into a streamlined workflow that works while you sleep.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="font-medium text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group">
                      <Link href="/sign-up">
                        Start Your Free Trial
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="font-medium text-lg border-2 hover:bg-muted/50 transition-all duration-300">
                      <Link href="#contact">Book a Demo</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Pricing Section */}
          <section id="pricing">
            <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-muted/50" />}>
              <LazyPricing />
            </Suspense>
          </section>
        </NavbarDemo>
      </Suspense>
      
      <Suspense fallback={<div className="h-16 w-full bg-background" />}>
        <LazyFooter />
      </Suspense>
    </main>
  );
}