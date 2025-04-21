"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BellIcon, UserCogIcon, MailIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import ReminderSettings from "./components/reminder-settings";
import AccountSettings from "./components/account-settings";
import EmailSettings from "./components/email-settings";

type SettingsTab = "reminder" | "account" | "email";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("reminder");

  const handleSaveSettings = () => {
    // In a real app, this would save all settings to the database
    // For now, just show a success toast
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your reminder preferences and account details
          </p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <SaveIcon className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b gap-2">
        <button
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
            activeTab === "reminder"
              ? "border-primary text-primary"
              : "border-transparent hover:border-muted-foreground/20 hover:text-muted-foreground"
          }`}
          onClick={() => setActiveTab("reminder")}
        >
          <BellIcon className="h-4 w-4" /> Reminder Settings
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
            activeTab === "account"
              ? "border-primary text-primary"
              : "border-transparent hover:border-muted-foreground/20 hover:text-muted-foreground"
          }`}
          onClick={() => setActiveTab("account")}
        >
          <UserCogIcon className="h-4 w-4" /> Account Settings
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium ${
            activeTab === "email"
              ? "border-primary text-primary"
              : "border-transparent hover:border-muted-foreground/20 hover:text-muted-foreground"
          }`}
          onClick={() => setActiveTab("email")}
        >
          <MailIcon className="h-4 w-4" /> Email Settings
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="py-4">
        {activeTab === "reminder" && <ReminderSettings />}
        {activeTab === "account" && <AccountSettings />}
        {activeTab === "email" && <EmailSettings />}
      </div>
    </div>
  );
}
