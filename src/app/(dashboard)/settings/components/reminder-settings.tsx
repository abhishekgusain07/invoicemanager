"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClockIcon, HelpCircleIcon, MessageSquareIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { type ReminderSettingsValues } from "@/lib/validations/settings";

interface ReminderSettingsProps {
  settings: any;
  onChange: (values: Partial<ReminderSettingsValues>) => void;
}

export default function ReminderSettings({ settings, onChange }: ReminderSettingsProps) {
  const [isAutomated, setIsAutomated] = useState(true);
  const [firstReminderDays, setFirstReminderDays] = useState(3);
  const [followUpFrequency, setFollowUpFrequency] = useState(7);
  const [maxReminders, setMaxReminders] = useState(3);
  const [firstTone, setFirstTone] = useState("polite");
  const [secondTone, setSecondTone] = useState("firm");
  const [thirdTone, setThirdTone] = useState("urgent");

  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      setIsAutomated(settings.isAutomatedReminders ?? true);
      setFirstReminderDays(settings.firstReminderDays ?? 3);
      setFollowUpFrequency(settings.followUpFrequency ?? 7);
      setMaxReminders(settings.maxReminders ?? 3);
      setFirstTone(settings.firstReminderTone ?? "polite");
      setSecondTone(settings.secondReminderTone ?? "firm");
      setThirdTone(settings.thirdReminderTone ?? "urgent");
    }
  }, [settings]);

  // Update parent component when settings change
  const updateSetting = (key: string, value: any) => {
    const settingKey = key as keyof ReminderSettingsValues;
    onChange({ [settingKey]: value } as Partial<ReminderSettingsValues>);
  };

  // Handle toggle change
  const handleAutomatedChange = (checked: boolean) => {
    setIsAutomated(checked);
    updateSetting('isAutomatedReminders', checked);
  };

  // Handle first reminder days change
  const handleFirstReminderChange = (value: number) => {
    setFirstReminderDays(value);
    updateSetting('firstReminderDays', value);
  };

  // Handle follow-up frequency change
  const handleFrequencyChange = (value: number) => {
    setFollowUpFrequency(value);
    updateSetting('followUpFrequency', value);
  };

  // Handle max reminders change
  const handleMaxRemindersChange = (value: number) => {
    setMaxReminders(value);
    updateSetting('maxReminders', value);
  };

  // Handle tone changes
  const handleFirstToneChange = (value: string) => {
    setFirstTone(value);
    updateSetting('firstReminderTone', value);
  };

  const handleSecondToneChange = (value: string) => {
    setSecondTone(value);
    updateSetting('secondReminderTone', value);
  };

  const handleThirdToneChange = (value: string) => {
    setThirdTone(value);
    updateSetting('thirdReminderTone', value);
  };

  return (
    <div className="space-y-8">
      {/* Reminder Schedule Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ClockIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Reminder Schedule</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Configure when to send invoice reminders
        </p>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Automated Reminders Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="automated-reminders" className="text-base font-medium">
                      Enable Automated Reminders
                    </Label>
                    <Tooltip content="Automatically send reminder emails for overdue invoices based on your schedule">
                      <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                </div>
                <Switch
                  id="automated-reminders"
                  checked={isAutomated}
                  onCheckedChange={handleAutomatedChange}
                />
              </div>

              {/* First Reminder */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="first-reminder" className="text-base font-medium">
                    First Reminder
                  </Label>
                  <Tooltip content="When to send the first reminder after the invoice due date">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    id="first-reminder"
                    type="number"
                    min={1}
                    className="w-20"
                    value={firstReminderDays}
                    onChange={(e) => handleFirstReminderChange(Number(e.target.value))}
                  />
                  <span className="text-muted-foreground">days after due date</span>
                </div>
              </div>

              {/* Follow-up Frequency */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="follow-up-frequency" className="text-base font-medium">
                    Follow-up Frequency
                  </Label>
                  <Tooltip content="How often to send follow-up reminders after the first one">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    id="follow-up-frequency"
                    type="number"
                    min={1}
                    className="w-20"
                    value={followUpFrequency}
                    onChange={(e) => handleFrequencyChange(Number(e.target.value))}
                  />
                  <span className="text-muted-foreground">days between reminders</span>
                </div>
              </div>

              {/* Maximum Reminders */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="max-reminders" className="text-base font-medium">
                    Maximum Reminders
                  </Label>
                  <Tooltip content="Maximum number of reminders to send per invoice">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    id="max-reminders"
                    type="number"
                    min={1}
                    max={10}
                    className="w-20"
                    value={maxReminders}
                    onChange={(e) => handleMaxRemindersChange(Number(e.target.value))}
                  />
                  <span className="text-muted-foreground">reminders per invoice</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder Escalation Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Reminder Escalation</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Configure how reminder tone escalates
        </p>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* First Reminder Tone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="first-tone" className="text-base font-medium">
                    First Reminder Tone
                  </Label>
                  <Tooltip content="Tone used for the first reminder">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Select value={firstTone} onValueChange={handleFirstToneChange}>
                  <SelectTrigger id="first-tone" className="w-full">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="polite">Polite</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Second Reminder Tone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="second-tone" className="text-base font-medium">
                    Second Reminder Tone
                  </Label>
                  <Tooltip content="Tone used for the second reminder">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Select value={secondTone} onValueChange={handleSecondToneChange}>
                  <SelectTrigger id="second-tone" className="w-full">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firm">Firm</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="assertive">Assertive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Third Reminder Tone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="third-tone" className="text-base font-medium">
                    Third Reminder Tone
                  </Label>
                  <Tooltip content="Tone used for the third and subsequent reminders">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Select value={thirdTone} onValueChange={handleThirdToneChange}>
                  <SelectTrigger id="third-tone" className="w-full">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="final">Final Notice</SelectItem>
                    <SelectItem value="serious">Serious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 