"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BellIcon, UserCogIcon, MailIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import ReminderSettings from "./components/reminder-settings";
import AccountSettings from "./components/account-settings";
import {EmailSettings} from "./components/email-settings";
import { getUserSettings, updateAllSettings } from "@/actions/settings";
import { UserSettingsValues } from "@/lib/validations/settings";

type SettingsTab = "reminder" | "account" | "email";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("reminder");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettingsValues|null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const result = await getUserSettings();
        if (result.success && result.data && result.data !== null) {
          setUserSettings(result.data as UserSettingsValues);
          console.log("Loaded user settings:", result.data);
        } else {
          toast.error(result.error || "Failed to load settings");
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    if (!userSettings) return;

    setIsSaving(true);
    try {
      // Create a FormData object to send to the server action
      const formData = new FormData();
      
      // Add all settings to the form data
      Object.entries(userSettings).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Convert boolean values to strings for FormData
          if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Call the server action to update settings
      const result = await updateAllSettings(formData);

      if (result.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle updates to settings
  const handleSettingsChange = (section: string, updatedValues: Record<string, any>) => {
    if (!userSettings) return;

    // Ensure boolean values are properly typed
    Object.entries(updatedValues).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (value === 'true') updatedValues[key] = true;
        else if (value === 'false') updatedValues[key] = false;
      }
    });

    setUserSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updatedValues
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

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
        <Button 
          onClick={handleSaveSettings} 
          className="gap-2"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="h-4 w-4" />
              Save Settings
            </>
          )}
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
        {activeTab === "reminder" && (
          <ReminderSettings 
            settings={userSettings} 
            onChange={(values) => handleSettingsChange("reminder", values)} 
          />
        )}
        {activeTab === "account" && (
          <AccountSettings 
            settings={userSettings} 
            onChange={(values) => handleSettingsChange("account", values)} 
          />
        )}
        {activeTab === "email" && (
          <EmailSettings 
            settings={userSettings ?? {
              emailSignature: "",
              previewEmails: false,
              ccAccountant: false,
              useBrandedEmails: false,
              sendCopyToSelf: false,
              fromName: undefined,
              defaultCC: undefined,
              finalNoticeTemplateId: undefined
            }}
            onChange={(values) => handleSettingsChange("email", values)} 
          />
        )}
      </div>
    </div>
  );
}