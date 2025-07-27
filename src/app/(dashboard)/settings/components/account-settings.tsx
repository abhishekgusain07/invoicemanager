"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserIcon, BuildingIcon, HelpCircleIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { type AccountSettingsValues } from "@/lib/validations/settings";

interface AccountSettingsProps {
  settings: any;
  onChange: (values: Partial<AccountSettingsValues>) => void;
}

export default function AccountSettings({
  settings,
  onChange,
}: AccountSettingsProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      setFullName(settings.fullName || "");
      setEmail(settings.email || "");
      setBusinessName(settings.businessName || "");
      setPhoneNumber(settings.phoneNumber || "");
    }
  }, [settings]);

  // Update parent component when settings change
  const handleBusinessNameChange = (value: string) => {
    setBusinessName(value);
    onChange({ businessName: value });
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    onChange({ phoneNumber: value });
  };

  return (
    <div className="space-y-8">
      {/* Account Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <UserIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Account Information</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Your personal account information
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
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  This is your name from your user account and cannot be changed
                  here.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  This is your email from your user account and cannot be
                  changed here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BuildingIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Business Information</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Information about your business that will appear on invoices
        </p>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="business-name"
                    className="text-base font-medium"
                  >
                    Business Name
                  </Label>
                  <Tooltip content="The name of your business that will appear on invoices">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="phone-number"
                    className="text-base font-medium"
                  >
                    Phone Number
                  </Label>
                  <Tooltip content="Your business phone number that will appear on invoices">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
