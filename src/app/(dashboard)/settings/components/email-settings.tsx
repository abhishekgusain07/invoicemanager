"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MailIcon, HelpCircleIcon, SendIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { type EmailSettingsValues } from "@/lib/validations/settings";

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

  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      setFromName(settings.fromName || "");
      setEmailSignature(settings.emailSignature || "Best regards,");
      setDefaultCC(settings.defaultCC || "");
      setDefaultBCC(settings.defaultBCC || "");
      setPreviewEmails(settings.previewEmails ?? true);
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
    </div>
  );
} 