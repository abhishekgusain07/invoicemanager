"use client";

import { useState } from "react";
import { 
  HelpCircleIcon, MailIcon, BookOpenIcon, CompassIcon, 
  ChevronDownIcon, ChevronRightIcon, SearchIcon, ArrowRightIcon,
  PlayCircleIcon, FileTextIcon, MessageSquareIcon, UserIcon,
  BellIcon, BarChartIcon, InboxIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const Help = () => {
  const [activeTab, setActiveTab] = useState("getting-started");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const faqs = [
    {
      id: "faq-1",
      question: "How do I create an invoice?",
      answer: "To create an invoice, navigate to the Invoices page and click the 'New Invoice' button in the top right corner. Fill in the client details, invoice items, and payment terms, then click 'Create Invoice'."
    },
    {
      id: "faq-2",
      question: "How do I edit a reminder template?",
      answer: "Go to the Templates page, find the template you want to edit, and click the Edit button. Make your changes in the template editor, then click 'Update Template' to save your changes."
    },
    {
      id: "faq-3",
      question: "Can I customize reminder schedules?",
      answer: "Yes, you can customize reminder schedules in the Settings page under the 'Reminder Settings' tab. Set your preferred reminder frequency, timing, and escalation schedule."
    },
    {
      id: "faq-4",
      question: "How do I mark an invoice as paid?",
      answer: "In the Invoices page, find the invoice you want to mark as paid, click the status dropdown or the checkmark icon, and select 'Paid'. The invoice status will update immediately."
    },
    {
      id: "faq-5",
      question: "How can I view payment analytics?",
      answer: "The Dashboard provides an overview of your payment analytics, including outstanding invoices, payment trends, and overdue invoices. For more detailed reports, use the filtering options."
    },
    {
      id: "faq-6",
      question: "How do I connect my payment gateway?",
      answer: "In the Settings page under 'Payment Settings', click 'Connect' next to your preferred payment gateway. Follow the authentication steps to link your account and enable online payments."
    }
  ];

  const features = [
    {
      id: "feature-1",
      title: "Invoice Management",
      description: "Create, edit, and track invoices with ease",
      icon: <FileTextIcon className="h-6 w-6 text-blue-500" />,
      link: "/invoices"
    },
    {
      id: "feature-2",
      title: "Reminder Templates",
      description: "Customize email templates for different scenarios",
      icon: <MessageSquareIcon className="h-6 w-6 text-purple-500" />,
      link: "/templates"
    },
    {
      id: "feature-3",
      title: "Client Management",
      description: "Organize and maintain your client database",
      icon: <UserIcon className="h-6 w-6 text-green-500" />,
      link: "/clients"
    },
    {
      id: "feature-4",
      title: "Reminder Scheduling",
      description: "Automate payment reminders and follow-ups",
      icon: <BellIcon className="h-6 w-6 text-amber-500" />,
      link: "/settings"
    },
    {
      id: "feature-5",
      title: "Analytics Dashboard",
      description: "Track payment trends and outstanding invoices",
      icon: <BarChartIcon className="h-6 w-6 text-red-500" />,
      link: "/dashboard"
    },
    {
      id: "feature-6",
      title: "Email Notifications",
      description: "Get alerts for important invoice events",
      icon: <InboxIcon className="h-6 w-6 text-cyan-500" />,
      link: "/settings"
    }
  ];

  const gettingStartedSteps = [
    { 
      title: "Create your first invoice", 
      description: "Set up a new invoice with client details and payment terms.",
      link: "/invoices"
    },
    { 
      title: "Customize your reminder templates", 
      description: "Edit the email templates to match your brand's tone and style.",
      link: "/templates"
    },
    { 
      title: "Configure reminder settings", 
      description: "Set when and how frequently reminders should be sent.",
      link: "/settings"
    },
    { 
      title: "Send your first reminder", 
      description: "Automatically send payment reminders to clients with overdue invoices.",
      link: "/invoices"
    }
  ];

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <HelpCircleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
          Get answers to common questions, learn about features, and get support for your invoice management needs.
        </p>
        
        {/* Search bar */}
        <div className="relative max-w-md mx-auto">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search for help topics..." 
            className="pl-9"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="getting-started" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full justify-center mb-6">
            <TabsTrigger value="getting-started" className="flex items-center gap-2">
              <BookOpenIcon className="h-4 w-4" />
              <span>Getting Started</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <CompassIcon className="h-4 w-4" />
              <span>Features</span>
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <HelpCircleIcon className="h-4 w-4" />
              <span>FAQs</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MailIcon className="h-4 w-4" />
              <span>Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6">
                  <h2 className="text-xl font-semibold mb-4">Quick Start Guide</h2>
                  
                  <div className="space-y-8">
                    {gettingStartedSteps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex h-8 w-8 rounded-full bg-primary text-primary-foreground items-center justify-center">
                            {index + 1}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          <Button variant="link" asChild className="p-0 h-auto">
                            <a href={step.link}>
                              Learn more <ArrowRightIcon className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Video Tutorial</CardTitle>
                    <CardDescription>
                      Watch our quick introduction to get started with Invoice Manager
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-950/50 dark:to-purple-950/50"></div>
                      <PlayCircleIcon className="h-16 w-16 text-primary z-10" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {feature.icon}
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <CardDescription className="text-sm mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="link" asChild className="pl-0">
                      <a href={feature.link}>
                        Learn more <ArrowRightIcon className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-2">
            {faqs.map((faq) => (
              <Card key={faq.id} className={`transition-all py-2 px-1 ${expandedFaq === faq.id ? 'ring-1 ring-primary' : ''}`}>
                <CardHeader 
                  className="cursor-pointer py-4 flex flex-row items-center justify-between"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <CardTitle className="text-lg font-medium">{faq.question}</CardTitle>
                  <Button variant="ghost" size="icon">
                    {expandedFaq === faq.id ? 
                      <ChevronDownIcon className="h-5 w-5" /> : 
                      <ChevronRightIcon className="h-5 w-5" />
                    }
                  </Button>
                </CardHeader>
                {expandedFaq === faq.id && (
                  <CardContent className="pt-0 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Still have questions?</CardTitle>
                <CardDescription>
                  Check our comprehensive documentation or contact our support team for assistance.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                <Button variant="outline">
                  <BookOpenIcon className="mr-2 h-4 w-4" />
                  Documentation
                </Button>
                <Button onClick={() => setActiveTab("support")}>
                  <MailIcon className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Get help from our customer support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input id="email" type="email" placeholder="Your email address" />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                      <Input id="subject" placeholder="How can we help you?" />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="message" className="text-sm font-medium">Message</label>
                      <textarea 
                        id="message" 
                        className="min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                        placeholder="Describe your issue in detail"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Send Message</Button>
                </CardFooter>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Support Hours</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monday - Friday</span>
                      <span className="text-sm font-medium">9:00 AM - 5:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Saturday</span>
                      <span className="text-sm font-medium">10:00 AM - 2:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sunday</span>
                      <span className="text-sm font-medium">Closed</span>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground">
                      Average response time: <span className="font-medium">Under 24 hours</span>
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="text-sm font-medium">Documentation</h4>
                        <p className="text-xs text-muted-foreground">Detailed guides and reference</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PlayCircleIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="text-sm font-medium">Video Tutorials</h4>
                        <p className="text-xs text-muted-foreground">Step-by-step visual guides</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquareIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="text-sm font-medium">Community Forum</h4>
                        <p className="text-xs text-muted-foreground">Ask questions and share insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Help;