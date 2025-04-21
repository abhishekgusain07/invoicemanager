"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MailIcon, HelpCircleIcon, SendIcon, SmileIcon, UserIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { type EmailSettingsValues } from "@/lib/validations/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailSettingsProps {
  settings: any;
  onChange: (values: Partial<EmailSettingsValues>) => void;
}

export default function EmailSettings({ settings, onChange }: EmailSettingsProps) {
  const [fromName, setFromName] = useState("");
  const [emailSignature, setEmailSignature] = useState("Best regards,");
  const [defaultCC, setDefaultCC] = useState("");
  const [defaultBCC, setDefaultBCC] = useState("");
  const [previewEmails, setPreviewEmails] = useState(true);
  const [reminderTemplate, setReminderTemplate] = useState("");
  const [followUpTemplate, setFollowUpTemplate] = useState("");
  const [finalReminderTemplate, setFinalReminderTemplate] = useState("");
  const [ccAccountant, setCcAccountant] = useState(false);
  const [useBrandedEmails, setUseBrandedEmails] = useState(false);
  const [activeTab, setActiveTab] = useState("initial");

  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      setFromName(settings.fromName || "");
      setEmailSignature(settings.emailSignature || "Best regards,");
      setDefaultCC(settings.defaultCC || "");
      setDefaultBCC(settings.defaultBCC || "");
      setPreviewEmails(settings.previewEmails ?? true);
      setReminderTemplate(settings.reminderTemplate || "");
      setFollowUpTemplate(settings.followUpTemplate || "");
      setFinalReminderTemplate(settings.finalReminderTemplate || "");
      setCcAccountant(settings.ccAccountant || false);
      setUseBrandedEmails(settings.useBrandedEmails || false);
    }
  }, [settings]);

  // Update parent component when settings change
  const handleFromNameChange = (value: string) => {
    setFromName(value);
    onChange({ fromName: value });
  };

  const handleEmailSignatureChange = (value: string) => {
    setEmailSignature(value);
    onChange({ emailSignature: value });
  };

  const handleDefaultCCChange = (value: string) => {
    setDefaultCC(value);
    onChange({ defaultCC: value });
  };

  const handleDefaultBCCChange = (value: string) => {
    setDefaultBCC(value);
    onChange({ defaultBCC: value });
  };

  const handlePreviewEmailsChange = (checked: boolean) => {
    setPreviewEmails(checked);
    onChange({ previewEmails: checked });
  };

  const handleSendTestEmail = () => {
    // This would typically be a server action to send a test email
    // For now, just show a toast notification
    toast.success("Test email would be sent in production");
  };

  // Template change handlers
  const handleReminderTemplateChange = (value: string) => {
    setReminderTemplate(value);
    onChange({ reminderTemplate: value });
  };

  const handleFollowUpTemplateChange = (value: string) => {
    setFollowUpTemplate(value);
    onChange({ followUpTemplate: value });
  };

  const handleFinalReminderTemplateChange = (value: string) => {
    setFinalReminderTemplate(value);
    onChange({ finalReminderTemplate: value });
  };

  const handleCcAccountantChange = (value: boolean) => {
    setCcAccountant(value);
    onChange({ ccAccountant: value });
  };

  const handleUseBrandedEmailsChange = (value: boolean) => {
    setUseBrandedEmails(value);
    onChange({ useBrandedEmails: value });
  };

  return (
    <div className="space-y-8">
      {/* Email Configuration Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MailIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Email Configuration</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Configure how your emails will be sent to clients
        </p>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* From Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="from-name" className="text-base font-medium">
                    From Name
                  </Label>
                  <Tooltip content="The name that will appear in the 'From' field of emails">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="from-name"
                  value={fromName}
                  onChange={(e) => handleFromNameChange(e.target.value)}
                  placeholder="Your name or business name"
                />
              </div>

              {/* Email Signature */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="email-signature" className="text-base font-medium">
                    Email Signature
                  </Label>
                  <Tooltip content="The signature that will appear at the end of your emails">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Textarea
                  id="email-signature"
                  value={emailSignature}
                  onChange={(e) => handleEmailSignatureChange(e.target.value)}
                  placeholder="Your email signature"
                  rows={4}
                />
              </div>

              {/* Default CC */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="default-cc" className="text-base font-medium">
                    Default CC (Optional)
                  </Label>
                  <Tooltip content="Email addresses to be CC'd on all reminders">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="default-cc"
                  type="email"
                  value={defaultCC}
                  onChange={(e) => handleDefaultCCChange(e.target.value)}
                  placeholder="cc@example.com"
                />
              </div>

              {/* Default BCC */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="default-bcc" className="text-base font-medium">
                    Default BCC (Optional)
                  </Label>
                  <Tooltip content="Email addresses to be BCC'd on all reminders">
                    <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="default-bcc"
                  type="email"
                  value={defaultBCC}
                  onChange={(e) => handleDefaultBCCChange(e.target.value)}
                  placeholder="bcc@example.com"
                />
              </div>

              {/* Preview Emails */}
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="preview-emails" className="text-base font-medium">
                      Preview Emails Before Sending
                    </Label>
                    <Tooltip content="If enabled, you'll see a preview of each email before it's sent">
                      <HelpCircleIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                    </Tooltip>
                  </div>
                </div>
                <Switch
                  id="preview-emails"
                  checked={previewEmails}
                  onCheckedChange={handlePreviewEmailsChange}
                />
              </div>

              {/* Send Test Email */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleSendTestEmail}
                >
                  <SendIcon className="h-4 w-4" />
                  Send Test Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Templates Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MailIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Email Templates</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Customize the emails sent to your clients
        </p>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <Tabs defaultValue="initial" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="initial">
                  <div className="flex items-center gap-2">
                    <SendIcon className="h-4 w-4" />
                    <span>Initial Reminder</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="followup">
                  <div className="flex items-center gap-2">
                    <SendIcon className="h-4 w-4" />
                    <span>Follow-up</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="final">
                  <div className="flex items-center gap-2">
                    <SendIcon className="h-4 w-4" />
                    <span>Final Reminder</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="initial">
                <p className="text-sm text-muted-foreground mb-4">
                  This template is used for the first reminder sent to a client when an invoice is overdue.
                </p>
                <div className="space-y-4">
                  <Label htmlFor="reminder-template">
                    Template Content
                  </Label>
                  <Textarea
                    id="reminder-template"
                    value={reminderTemplate}
                    onChange={(e) => handleReminderTemplateChange(e.target.value)}
                    placeholder="Hello {client_name},

I hope this email finds you well. This is a friendly reminder that invoice #{invoice_number} for {invoice_amount} was due on {due_date}.

If you've already made the payment, please disregard this message. If not, I would appreciate your prompt attention to this matter.

You can view and pay the invoice here: {invoice_link}

Thank you for your business.

Best regards,
{sender_name}"
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use the following variables: {"{client_name}"}, {"{invoice_number}"}, {"{invoice_amount}"}, {"{due_date}"}, {"{invoice_link}"}, {"{sender_name}"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="followup">
                <p className="text-sm text-muted-foreground mb-4">
                  This template is used for follow-up reminders when the initial reminder hasn't resulted in payment.
                </p>
                <div className="space-y-4">
                  <Label htmlFor="followup-template">
                    Template Content
                  </Label>
                  <Textarea
                    id="followup-template"
                    value={followUpTemplate}
                    onChange={(e) => handleFollowUpTemplateChange(e.target.value)}
                    placeholder="Hello {client_name},

I'm following up on my previous reminder about invoice #{invoice_number} for {invoice_amount} which was due on {due_date}. Our records show that this invoice remains unpaid.

If you have any questions or concerns about this invoice, please let me know so we can address them promptly.

You can view and pay the invoice here: {invoice_link}

Thank you for your attention to this matter.

Best regards,
{sender_name}"
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use the following variables: {"{client_name}"}, {"{invoice_number}"}, {"{invoice_amount}"}, {"{due_date}"}, {"{invoice_link}"}, {"{sender_name}"}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="final">
                <p className="text-sm text-muted-foreground mb-4">
                  This template is used for the final reminder before taking further action.
                </p>
                <div className="space-y-4">
                  <Label htmlFor="final-template">
                    Template Content
                  </Label>
                  <Textarea
                    id="final-template"
                    value={finalReminderTemplate}
                    onChange={(e) => handleFinalReminderTemplateChange(e.target.value)}
                    placeholder="Hello {client_name},

This is a final reminder regarding invoice #{invoice_number} for {invoice_amount} which was due on {due_date}. Despite several previous reminders, our records indicate that this invoice remains unpaid.

Please arrange for payment as soon as possible to avoid any further action.

You can view and pay the invoice here: {invoice_link}

If you're experiencing difficulties with payment or have questions about the invoice, please contact me immediately.

Best regards,
{sender_name}"
                    className="min-h-[300px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    You can use the following variables: {"{client_name}"}, {"{invoice_number}"}, {"{invoice_amount}"}, {"{due_date}"}, {"{invoice_link}"}, {"{sender_name}"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Email Signature */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Email Signature</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This signature will be appended to all email templates automatically.
              </p>
              <Textarea
                id="email-signature"
                value={emailSignature}
                onChange={(e) => handleEmailSignatureChange(e.target.value)}
                placeholder="Your Name
Your Position
Your Company
Phone: Your Phone Number
Email: Your Email"
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <SmileIcon className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Email Options</h3>
              </div>
              
              {/* CC Accountant */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <Label htmlFor="cc-accountant" className="text-base font-medium cursor-pointer">
                    CC Accountant
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Send a copy of all reminder emails to your accountant
                  </p>
                </div>
                <Switch
                  id="cc-accountant"
                  checked={ccAccountant}
                  onCheckedChange={handleCcAccountantChange}
                />
              </div>

              {/* Use Branded Emails */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="branded-emails" className="text-base font-medium cursor-pointer">
                    Use Branded Emails
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Include your logo and brand colors in email templates
                  </p>
                </div>
                <Switch
                  id="branded-emails"
                  checked={useBrandedEmails}
                  onCheckedChange={handleUseBrandedEmailsChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 