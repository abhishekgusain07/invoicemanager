"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MailIcon, AlertTriangleIcon, InfoIcon, HelpCircleIcon } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function AccountSettings() {
  const { user } = useUser();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setFullName(user.name || "");
    }
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Account Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MailIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Account Information</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Your personal information and preferences
        </p>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-base font-medium">
                  Full Name
                </Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
                <p className="text-xs text-muted-foreground">
                  Set by your account information
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Set by your account information
                </p>
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="business-name" className="text-base font-medium">
                  Business Name
                </Label>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business name"
                />
                <p className="text-xs text-muted-foreground">
                  Appears in your reminder templates
                </p>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone-number" className="text-base font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Your phone number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <InfoIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Additional Information</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Helpful resources and information
        </p>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* About Email Automation */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">
                      About Email Automation
                    </h3>
                    <p className="text-sm text-yellow-700 mb-2">
                      Invoice Nudger helps you create and schedule professional reminder emails. 
                      In this prototype version, the app will show you when reminders are scheduled to be sent.
                    </p>
                    <p className="text-sm text-yellow-700">
                      For production use, the app would connect to email services like SendGrid, 
                      Mailgun, or your email provider to automatically send these reminders.
                    </p>
                  </div>
                </div>
              </div>

              {/* Helpful Resources */}
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Helpful Resources
                </h3>
                <div className="space-y-3">
                  <a 
                    href="#" 
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <HelpCircleIcon className="h-4 w-4" />
                    <span>Reminder Best Practices Guide</span>
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <HelpCircleIcon className="h-4 w-4" />
                    <span>Effective Invoice Collection Strategies</span>
                  </a>
                  <a 
                    href="#" 
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <HelpCircleIcon className="h-4 w-4" />
                    <span>Invoice Template Library</span>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 