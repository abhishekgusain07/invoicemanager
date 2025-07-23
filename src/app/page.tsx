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
        {/* {showAnnouncement && (
          <Announcement
            show={showAnnouncement}
            key={announcement.message}
            message={announcement.message}
            link={announcement.link}
            emoji={announcement.emoji}
            onDismiss={handleAnnouncementDismiss}
          />
        )} */}
      </Suspense>
      
      <Suspense fallback={<div className="h-16 w-full bg-background" />}>
        <NavbarDemo>
          {/* Hero Section */}
          <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            {/* Clean Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 -z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 -z-10" />
            
            <div className="container px-4 md:px-6 mx-auto max-w-6xl text-center">
              {/* Status Badge */}
              <div className="mb-8">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  1K+ FREELANCERS MANAGE INVOICES WITH US THIS MONTH!
                </Badge>
              </div>
              
              {/* Main Title */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] text-white mb-8 max-w-5xl mx-auto">
                Professional Invoice
                <br />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                  Management
                </span>
                <br />
                for Freelancers & Agencies
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-12">
                Stop chasing payments and focus on what matters. Our intelligent system handles follow-ups, 
                tracks payments, and gets you paid 75% faster.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button asChild size="lg" className="font-medium text-lg px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Link href="/sign-up">
                    Start Free Trial
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="font-medium text-lg px-8 py-4 text-white border-white/20 hover:bg-white/10 transition-all duration-300">
                  <Link href="#features">View Features</Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="text-center">
                <p className="text-slate-400 text-sm uppercase tracking-wide mb-8 font-medium">
                  TRUSTED BY THE FASTEST-GROWING FREELANCERS:
                </p>
                
                {/* Company Logos / Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center max-w-4xl mx-auto opacity-60">
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-white mb-1">1K+</div>
                    <div className="text-sm text-slate-400">Active Users</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-white mb-1">$2M+</div>
                    <div className="text-sm text-slate-400">Tracked Revenue</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-white mb-1">75%</div>
                    <div className="text-sm text-slate-400">Faster Payments</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-3xl font-bold text-white mb-1">99%</div>
                    <div className="text-sm text-slate-400">Client Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Feature Preview Section */}
          <section className="py-24 bg-white relative">
            <div className="container px-4 md:px-6 mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  See InvoiceManager in Action
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Everything you need to manage invoices professionally and get paid on time
                </p>
              </div>
              
              {/* Clean Dashboard Preview */}
              <div className="relative max-w-4xl mx-auto">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
                  {/* Browser Chrome */}
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-100 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-sm text-slate-500 font-medium">invoicemanager.app/dashboard</div>
                    <div className="w-16"></div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="p-8 bg-gradient-to-br from-white to-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {/* Stats Cards */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Outstanding</p>
                            <p className="text-2xl font-bold text-slate-900">$24,500</p>
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">This Month</p>
                            <p className="text-2xl font-bold text-slate-900">$18,200</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Overdue</p>
                            <p className="text-2xl font-bold text-slate-900">$3,400</p>
                          </div>
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recent Invoices */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                      <h3 className="font-semibold text-slate-900 mb-4">Recent Invoices</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Acme Corporation</p>
                              <p className="text-sm text-slate-500">Invoice #001234</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">$5,400</p>
                            <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Design Studio LLC</p>
                              <p className="text-sm text-slate-500">Invoice #001235</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">$3,200</p>
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Tech Startup Inc</p>
                              <p className="text-sm text-slate-500">Invoice #001236</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">$7,800</p>
                            <Badge className="bg-red-100 text-red-800 text-xs">Overdue</Badge>
                          </div>
                        </div>
                      </div>
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