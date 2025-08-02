"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Code,
  Type,
  Palette,
  Sparkles,
  Copy,
  RefreshCw,
  Wand2,
  FileText,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { EmailTemplate } from "@/lib/validations/email-template";
import { api } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import {
  TemplateRenderer,
  templateUtils,
} from "@/lib/services/template-renderer";
import { cn } from "@/lib/utils";

type TemplateFormProps = {
  template?: EmailTemplate;
  onCancel: () => void;
};

// Define the tone type based on available values
type ToneType =
  | "polite"
  | "friendly"
  | "neutral"
  | "firm"
  | "direct"
  | "assertive"
  | "urgent"
  | "final"
  | "serious";
type CategoryType =
  | "reminder"
  | "thank_you"
  | "follow_up"
  | "notice"
  | "welcome"
  | "custom";

export function TemplateForm({ template, onCancel }: TemplateFormProps) {
  const router = useRouter();
  const utils = api.useUtils();

  // ✅ NEW: Using tRPC mutations for template operations
  const createTemplateMutation = api.templates.create.useMutation({
    onSuccess: () => {
      toast.success("Template created successfully");
      utils.templates.getAll.invalidate();
      onCancel();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create template");
    },
  });

  const updateTemplateMutation = api.templates.update.useMutation({
    onSuccess: () => {
      toast.success("Template updated successfully");
      utils.templates.getAll.invalidate();
      onCancel();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update template");
    },
  });

  const isSubmitting =
    createTemplateMutation.isPending || updateTemplateMutation.isPending;

  // Basic template fields
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [description, setDescription] = useState(template?.description || "");
  const [tone, setTone] = useState<ToneType>(
    (template?.tone as ToneType) || "polite"
  );
  const [category, setCategory] = useState<CategoryType>(
    (template?.category as CategoryType) || "reminder"
  );
  const [isDefault, setIsDefault] = useState(template?.isDefault || false);

  // Enhanced content fields
  const [content, setContent] = useState(template?.content || "");
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || "");
  const [textContent, setTextContent] = useState(template?.textContent || "");
  const [contentMode, setContentMode] = useState<"html" | "text">("html");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Preview and validation
  const [previewKey, setPreviewKey] = useState(0);
  const [previewData] = useState(() => TemplateRenderer.createPreviewData());

  // Auto-update preview when content changes and sync content field
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewKey((prev) => prev + 1);
    }, 300); // Debounce updates

    return () => clearTimeout(timer);
  }, [htmlContent, textContent, contentMode]);

  // Sync content field with current content mode
  useEffect(() => {
    const currentContent = contentMode === "html" ? htmlContent : textContent;
    setContent(currentContent);
  }, [contentMode, htmlContent, textContent]);

  const isEditMode = !!template;

  // Enhanced content change handler with proper state updates
  const handleContentChange = useCallback(
    (value: string) => {
      if (contentMode === "html") {
        setHtmlContent(value);
      } else {
        setTextContent(value);
      }
      setContent(value); // Always update content field with current value
    },
    [contentMode]
  );

  // Manual preview refresh handler
  const handlePreviewRefresh = useCallback(() => {
    setPreviewKey((prev) => prev + 1);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    const currentContent = contentMode === "html" ? htmlContent : textContent;
    if (!name || !subject || !currentContent) {
      toast.error("Please fill in all required fields");
      return;
    }

    const templateData = {
      name,
      subject,
      content: currentContent,
      htmlContent: htmlContent || "",
      textContent: textContent || "",
      description: description || "",
      tone,
      category,
      isDefault,
    };

    if (isEditMode && template.id) {
      updateTemplateMutation.mutate({
        id: template.id,
        data: templateData,
      });
    } else {
      createTemplateMutation.mutate(templateData);
    }
  };

  // Enhanced helper functions
  const insertPlaceholder = (placeholder: string) => {
    const currentContentState =
      contentMode === "html" ? htmlContent : textContent;
    const setCurrentContent =
      contentMode === "html" ? setHtmlContent : setTextContent;

    setCurrentContent((currentContent) => {
      const textarea = document.getElementById(
        `template-${contentMode}-content`
      ) as HTMLTextAreaElement;
      const cursorPos = textarea?.selectionStart ?? currentContent.length;

      const newContent =
        currentContent.substring(0, cursorPos) +
        placeholder +
        currentContent.substring(cursorPos);

      // Update content field with new content
      setContent(newContent);
      return newContent;
    });

    setPreviewKey((prev) => prev + 1);
  };

  const generateSampleTemplate = () => {
    const sampleHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        .email-container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', sans-serif; }
        .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
        .content { line-height: 1.6; }
        .invoice-details { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #6b7280; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2 style="color: #3b82f6; margin: 0;">Payment Reminder</h2>
        </div>
        <div class="content">
            <p>Dear {client_name},</p>
            <p>I hope this email finds you well. This is a friendly reminder about your outstanding invoice.</p>
            <div class="invoice-details">
                <strong>Invoice Details:</strong><br>
                • Invoice Number: {invoice_number}<br>
                • Amount: {invoice_amount}<br>
                • Due Date: {due_date}<br>
                • Days Overdue: {days_overdue}
            </div>
            <p>Please process this payment at your earliest convenience.</p>
            <p>Thank you for your business!</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>{sender_name}</p>
        </div>
    </div>
</body>
</html>`;

    const sampleText = `Dear {client_name},

I hope this email finds you well. This is a friendly reminder about your outstanding invoice.

Invoice Details:
• Invoice Number: {invoice_number}
• Amount: {invoice_amount}
• Due Date: {due_date}
• Days Overdue: {days_overdue}

Please process this payment at your earliest convenience.

Thank you for your business!

Best regards,
{sender_name}`;

    const trimmedHtml = sampleHtml.trim();
    const trimmedText = sampleText.trim();

    setHtmlContent(trimmedHtml);
    setTextContent(trimmedText);
    setContent(contentMode === "html" ? trimmedHtml : trimmedText);
    setPreviewKey((prev) => prev + 1);
    toast.success("Sample template generated!");
  };

  const renderPreview = () => {
    const currentContent = contentMode === "html" ? htmlContent : textContent;

    if (contentMode === "html") {
      // For HTML mode, return complete HTML document for iframe
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Preview</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #374151;
      background-color: #ffffff;
    }
  </style>
</head>
<body>
  ${currentContent || '<p style="color: #6b7280; font-style: italic;">No content to preview</p>'}
</body>
</html>`;
    } else {
      // For text mode, show as preformatted text in iframe
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Preview</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: monospace;
      line-height: 1.6;
      color: #374151;
      background-color: #ffffff;
    }
  </style>
</head>
<body>
  <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${currentContent || "No content to preview"}</pre>
</body>
</html>`;
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl shadow-lg border"
      style={{ height: "95vh", overflow: "hidden" }}
    >
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
          {/* Left Column - Template Configuration */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto max-h-full pr-2">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditMode ? "Edit Template" : "Create Template"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Design beautiful email templates with smart placeholders
                  </p>
                </div>
              </div>

              {/* Template Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="template-name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Template Name
                  </Label>
                  <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Professional Payment Reminder"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="template-description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description
                  </Label>
                  <Input
                    id="template-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this template"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="template-tone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Tone
                    </Label>
                    <Select
                      value={tone}
                      onValueChange={(value: ToneType) => setTone(value)}
                    >
                      <SelectTrigger id="template-tone" className="mt-1">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="polite">Polite</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="firm">Firm</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                        <SelectItem value="assertive">Assertive</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="final">Final Notice</SelectItem>
                        <SelectItem value="serious">Serious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="template-category"
                      className="text-sm font-medium text-gray-700"
                    >
                      Category
                    </Label>
                    <Select
                      value={category}
                      onValueChange={(value: CategoryType) =>
                        setCategory(value)
                      }
                    >
                      <SelectTrigger id="template-category" className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="thank_you">Thank You</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="notice">Notice</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="template-subject"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Subject Line
                  </Label>
                  <Input
                    id="template-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Payment Reminder: Invoice {invoice_number}"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="is-default"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Set as default for {tone} tone
                    </Label>
                  </div>
                  <Switch
                    id="is-default"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                </div>
              </div>
            </div>

            {/* Smart Placeholders */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Smart Placeholders
                </h3>
              </div>

              <div className="space-y-3">
                {TemplateRenderer.getAvailablePlaceholders().map(
                  (ph, index) => (
                    <div key={index} className="group">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto hover:bg-purple-50 text-left"
                        onClick={() => insertPlaceholder(ph.placeholder)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">
                              {ph.placeholder}
                            </code>
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {ph.description}
                          </p>
                        </div>
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Template Editor */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto max-h-full pr-2">
            {/* Content Mode Toggle */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Template Editor
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateSampleTemplate}
                    className="gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate Sample
                  </Button>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={contentMode === "html" ? "default" : "secondary"}
                      className="gap-1"
                    >
                      <Code className="w-3 h-3" />
                      HTML
                    </Badge>
                    <Switch
                      checked={contentMode === "html"}
                      onCheckedChange={(checked) =>
                        setContentMode(checked ? "html" : "text")
                      }
                    />
                    <Badge
                      variant={contentMode === "text" ? "default" : "secondary"}
                      className="gap-1"
                    >
                      <Type className="w-3 h-3" />
                      Text
                    </Badge>
                  </div>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab as any}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between min-h-full">
                      <Label
                        htmlFor={`template-${contentMode}-content`}
                        className="text-sm font-medium text-gray-700"
                      >
                        {contentMode === "html"
                          ? "HTML Content"
                          : "Text Content"}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handlePreviewRefresh}
                          title="Refresh preview"
                          className="hover:bg-blue-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      id={`template-${contentMode}-content`}
                      value={contentMode === "html" ? htmlContent : textContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="font-mono text-sm resize-none"
                      style={{ height: "400px" }}
                      placeholder={
                        contentMode === "html"
                          ? "Enter your HTML email template here..."
                          : "Enter your text email template here..."
                      }
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          Live Preview with Sample Data
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePreviewRefresh}
                          className="h-7 text-xs gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Update Preview
                        </Button>
                      </div>
                    </div>
                    <div
                      className="p-4 overflow-y-auto"
                      style={{ height: "400px" }}
                    >
                      <iframe
                        key={previewKey}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          backgroundColor: "#ffffff",
                        }}
                        srcDoc={renderPreview()}
                        title="Template Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {isEditMode ? "Update Template" : "Create Template"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
