"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircleIcon, MailIcon, BookOpenIcon, CompassIcon, 
  ChevronDownIcon, ChevronRightIcon, SearchIcon, ArrowRightIcon,
  PlayCircleIcon, FileTextIcon, MessageSquareIcon, UserIcon,
  BellIcon, BarChartIcon, InboxIcon, ThumbsUpIcon, StarIcon,
  LightbulbIcon, PlusIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback, submitFeatureRequest } from "@/actions/feedback";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";
import { HelpSkeleton } from "./components/help-skeleton";
import { getInvoiceStats } from "@/actions/invoice";

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

const Help = () => {
  const [activeTab, setActiveTab] = useState("getting-started");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featurePriority, setFeaturePriority] = useState("medium");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isSubmittingFeature, setIsSubmittingFeature] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  const [featureRequestMessage, setFeatureRequestMessage] = useState<{type: "success" | "error", message: string} | null>(null);
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setloadingUser] = useState(true)
  const [recentFeatures, setRecentFeatures] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() =>{
    const getSession = async () => {
      setloadingUser(true)
      try {
        const { data: session, error } = await authClient.getSession()
        if(error){
          console.error("Error fetching session:", error)
        } else {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setloadingUser(false)
      }
    }
    getSession()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (loadingUser) return;
      
      setIsLoadingData(true);
      try {
        // Fetch real data for stats and recently implemented features
        const [stats] = await Promise.all([
          getInvoiceStats(),
          // Fetch recent features if you have that endpoint
          // Otherwise we'll use static data for now
        ]);
        
        setStatsData(stats);
        
        // For now, we'll use this data but ideally you'd get it from the backend
        setRecentFeatures([
          {
            title: "Bulk Invoice Actions",
            description: "Select multiple invoices to perform actions like mark as paid, send reminders, or delete.",
            addedDate: "2023-05-15",
            usageCount: stats.paidInvoices || 0
          },
          {
            title: "Custom Email Templates",
            description: "Create and save your own email templates for different reminder scenarios.",
            addedDate: "2023-04-02",
            usageCount: (stats.pendingInvoices || 0) + (stats.overdueInvoices || 0)
          },
          {
            title: "Advanced Analytics Dashboard",
            description: "View detailed payment trends, overdue invoice statistics, and revenue projections.",
            addedDate: "2023-03-10",
            usageCount: stats.recentInvoices?.length || 0
          }
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [loadingUser]);

  if(loadingUser){
    return <HelpSkeleton />;
  }

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleStarClick = (rating: number) => {
    setFeedbackRating(rating);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setFeedbackMessage({
        type: "error",
        message: "You must be logged in to submit feedback."
      });
      return;
    }
    
    if (feedbackText.length < 5) {
      setFeedbackMessage({
        type: "error",
        message: "Please provide more detailed feedback (at least 5 characters)."
      });
      return;
    }
    
    if (feedbackRating === 0) {
      setFeedbackMessage({
        type: "error",
        message: "Please select a rating before submitting."
      });
      return;
    }
    
    try {
      setIsSubmittingFeedback(true);
      
      await submitFeedback({
        feedbackContent: feedbackText,
        stars: feedbackRating,
        userId: user.id
      });
      
      setFeedbackText("");
      setFeedbackRating(0);
      
      setFeedbackMessage({
        type: "success",
        message: "Thank you for your feedback!"
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setFeedbackMessage({
        type: "error",
        message: "There was an error submitting your feedback. Please try again."
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSubmitFeatureRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setFeatureRequestMessage({
        type: "error",
        message: "You must be logged in to submit feature requests."
      });
      return;
    }
    
    if (featureTitle.length < 3) {
      setFeatureRequestMessage({
        type: "error",
        message: "Please provide a more descriptive title (at least 3 characters)."
      });
      return;
    }
    
    if (featureDescription.length < 10) {
      setFeatureRequestMessage({
        type: "error",
        message: "Please provide a more detailed description (at least 10 characters)."
      });
      return;
    }
    
    try {
      setIsSubmittingFeature(true);
      
      await submitFeatureRequest({
        title: featureTitle,
        description: featureDescription,
        priority: featurePriority as "low" | "medium" | "high",
        userId: user.id
      });
      
      setFeatureTitle("");
      setFeatureDescription("");
      setFeaturePriority("medium");
      
      setFeatureRequestMessage({
        type: "success",
        message: "Thank you for your suggestion! We'll review it shortly."
      });
    } catch (error) {
      console.error("Error submitting feature request:", error);
      setFeatureRequestMessage({
        type: "error",
        message: "There was an error submitting your feature request. Please try again."
      });
    } finally {
      setIsSubmittingFeature(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
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
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <ThumbsUpIcon className="h-4 w-4" />
              <span>Feedback</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "getting-started" && (
              <motion.div
                key="getting-started"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <TabsContent value="getting-started" className="space-y-8" forceMount>
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
              </motion.div>
            )}

            {activeTab === "features" && (
              <motion.div
                key="features"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <TabsContent value="features" forceMount>
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
              </motion.div>
            )}

            {activeTab === "faqs" && (
              <motion.div
                key="faqs"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <TabsContent value="faqs" className="space-y-2" forceMount>
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
              </motion.div>
            )}

            {activeTab === "support" && (
              <motion.div
                key="support"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <TabsContent value="support" forceMount>
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
              </motion.div>
            )}

            {activeTab === "feedback" && (
              <motion.div
                key="feedback"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
              >
                <TabsContent value="feedback" forceMount>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Feedback Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ThumbsUpIcon className="h-5 w-5 text-blue-500" />
                          Share Your Feedback
                        </CardTitle>
                        <CardDescription>
                          Let us know what you think about our application
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  className="p-1"
                                  onClick={() => handleStarClick(star)}
                                >
                                  <StarIcon 
                                    className={`h-6 w-6 ${
                                      feedbackRating >= star 
                                        ? "fill-yellow-400 text-yellow-400" 
                                        : "text-muted-foreground"
                                    }`} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="feedback" className="text-sm font-medium">Your Feedback</label>
                            <Textarea
                              id="feedback"
                              placeholder="What did you like or dislike? How can we improve?"
                              className="min-h-[120px] resize-none"
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              required
                            />
                          </div>

                          {feedbackMessage && (
                            <div className={`text-sm p-2 rounded-md ${
                              feedbackMessage.type === "success" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {feedbackMessage.message}
                            </div>
                          )}

                          <Button 
                            type="submit" 
                            className="w-full mt-4"
                            disabled={isSubmittingFeedback}
                          >
                            {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Feature Request Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LightbulbIcon className="h-5 w-5 text-amber-500" />
                          Request a Feature
                        </CardTitle>
                        <CardDescription>
                          Suggest new features or improvements you'd like to see
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmitFeatureRequest} className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="feature-title" className="text-sm font-medium">Feature Title</label>
                            <Input
                              id="feature-title"
                              placeholder="E.g., Recurring Invoices"
                              value={featureTitle}
                              onChange={(e) => setFeatureTitle(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="feature-description" className="text-sm font-medium">Description</label>
                            <Textarea
                              id="feature-description"
                              placeholder="Please describe the feature and why it would be useful..."
                              className="min-h-[120px] resize-none"
                              value={featureDescription}
                              onChange={(e) => setFeatureDescription(e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="feature-priority" className="text-sm font-medium">Priority</label>
                            <Select value={featurePriority} onValueChange={setFeaturePriority}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low - Nice to have</SelectItem>
                                <SelectItem value="medium">Medium - Would improve my experience</SelectItem>
                                <SelectItem value="high">High - Critical for my workflow</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {featureRequestMessage && (
                            <div className={`text-sm p-2 rounded-md ${
                              featureRequestMessage.type === "success" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {featureRequestMessage.message}
                            </div>
                          )}

                          <Button 
                            type="submit" 
                            className="w-full mt-4"
                            disabled={isSubmittingFeature}
                          >
                            {isSubmittingFeature ? "Submitting..." : "Submit Request"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                    
                    {/* Recently Implemented Features */}
                    <Card className="md:col-span-2 mt-4">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PlusIcon className="h-5 w-5 text-green-500" />
                          Recently Implemented Features
                        </CardTitle>
                        <CardDescription>
                          {isLoadingData ? "Loading recently added features..." : 
                           statsData ? "New features we've added based on user feedback" : 
                           "No data available"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingData ? (
                          <div className="space-y-4">
                            {[1, 2, 3].map((item) => (
                              <div key={item} className="bg-muted/50 p-4 rounded-md animate-pulse">
                                <div className="h-5 w-40 bg-muted rounded mb-2"></div>
                                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                                <div className="h-3 w-24 bg-muted rounded"></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {recentFeatures.map((feature, index) => (
                              <div key={index} className="bg-muted/50 p-4 rounded-md">
                                <h3 className="font-medium text-base mb-1">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {feature.description}
                                </p>
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-muted-foreground">Added: {formatDate(feature.addedDate)}</p>
                                  {feature.usageCount > 0 && (
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                      Used {feature.usageCount} time{feature.usageCount !== 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default Help;