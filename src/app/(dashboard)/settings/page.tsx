"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { BellIcon, UserIcon, MailIcon, SaveIcon, Loader2 } from "lucide-react";
import { api } from "@/lib/trpc";
import { ReminderSettingsForm } from "./components/reminder-settings-form";
import { AccountSettingsForm } from "./components/account-settings-form";
import { EmailSettingsForm } from "./components/email-settings-form";
import { SettingsError } from "./components/settings-error";
import { SettingsSkeleton } from "./components/settings-skeleton";

const tabVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("reminder");

  // Queries
  const reminderQuery = api.settings.getReminderSettings.useQuery();
  const accountQuery = api.settings.getAccountSettings.useQuery();
  const emailQuery = api.settings.getEmailSettings.useQuery();

  // Mutations
  const updateReminder = api.settings.updateReminderSettings.useMutation({
    onSuccess: () => {
      toast.success("Reminder settings saved!");
      reminderQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateAccount = api.settings.updateAccountSettings.useMutation({
    onSuccess: () => {
      toast.success("Account settings saved!");
      accountQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateEmail = api.settings.updateEmailSettings.useMutation({
    onSuccess: () => {
      toast.success("Email settings saved!");
      emailQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isLoading =
    reminderQuery.isLoading || accountQuery.isLoading || emailQuery.isLoading;
  const hasError =
    reminderQuery.error || accountQuery.error || emailQuery.error;
  const isSaving =
    updateReminder.isPending ||
    updateAccount.isPending ||
    updateEmail.isPending;

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (hasError) {
    return (
      <SettingsError
        onRetry={() => {
          reminderQuery.refetch();
          accountQuery.refetch();
          emailQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reminder" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <MailIcon className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "reminder" && (
            <motion.div
              key="reminder"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              <TabsContent value="reminder" forceMount>
                <Card>
                  <CardHeader>
                    <CardTitle>Reminder Settings</CardTitle>
                    <CardDescription>
                      Configure how and when reminders are sent to your clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReminderSettingsForm
                      data={reminderQuery.data}
                      onSubmit={updateReminder.mutateAsync}
                      isLoading={updateReminder.isPending}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          )}

          {activeTab === "account" && (
            <motion.div
              key="account"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              <TabsContent value="account" forceMount>
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Update your business information and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AccountSettingsForm
                      data={accountQuery.data}
                      onSubmit={updateAccount.mutateAsync}
                      isLoading={updateAccount.isPending}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          )}

          {activeTab === "email" && (
            <motion.div
              key="email"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
            >
              <TabsContent value="email" forceMount>
                <Card>
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>
                      Customize your email preferences and templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmailSettingsForm
                      data={emailQuery.data}
                      onSubmit={updateEmail.mutateAsync}
                      isLoading={updateEmail.isPending}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
