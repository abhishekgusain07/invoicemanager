"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  Clock8Icon,
  SendIcon,
  RefreshCcwIcon,
  UserCogIcon,
  HistoryIcon,
  Palette,
  Sparkles,
  Star,
  Mail,
  Type,
  Code,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "../utils/invoiceUtils";
import { useEmailTemplates } from "../hooks/useEmailTemplates";
import { api } from "@/lib/trpc";

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvoiceId: string | null;
  invoices: any[];
  refreshReminders: number;
  onReminderSent: () => void;
}

export const EmailTemplateModal = ({
  isOpen,
  onClose,
  currentInvoiceId,
  invoices,
  refreshReminders,
  onReminderSent,
}: EmailTemplateModalProps) => {
  const {
    selectedTemplateType,
    selectedCustomTemplate,
    useCustomTemplate,
    customTemplates,
    loadingTemplates,
    isHtmlMode,
    customizedEmailContent,
    previewKey,
    isSendingTemplate,
    handleTemplateChange,
    handleHtmlModeToggle,
    handleContentChange,
    sendReminderWithTemplate,
    initializeTemplateContent,
    handleCustomTemplateSelect,
    handleBuiltInTemplateSelect,
    getAvailableTemplates,
    getCurrentEmailSubject,
    // PDF Attachment properties
    attachPdf,
    selectedInvoiceForAttachment,
    loadingGeneratedInvoices,
    handleAttachPdfToggle,
    handleInvoiceForAttachmentSelect,
    getAvailableInvoicesForAttachment,
    getAttachmentPreviewText,
  } = useEmailTemplates();

  const handleSendReminder = async () => {
    if (!currentInvoiceId) return;

    const invoice = invoices.find((inv) => inv.id === currentInvoiceId);
    if (!invoice) return;

    const success = await sendReminderWithTemplate(
      currentInvoiceId,
      invoice,
      () => {
        onClose();
        onReminderSent();
      }
    );
  };

  const handleReset = () => {
    const invoice = invoices.find((inv) => inv.id === currentInvoiceId);
    if (!invoice) return;

    if (useCustomTemplate && selectedCustomTemplate) {
      // Reset to custom template
      handleCustomTemplateSelect(selectedCustomTemplate);
    } else {
      // Reset to built-in template
      const templateType =
        invoice.status === "paid" ? "thankYou" : selectedTemplateType;
      initializeTemplateContent(templateType, invoice);
    }
  };

  // ✅ NEW: Detailed reminder history component using tRPC
  const LastReminderCellDetailed = ({ invoiceId }: { invoiceId: string }) => {
    const { data: result, isLoading } =
      api.reminder.getInvoiceReminderHistory.useQuery(
        { invoiceId },
        {
          enabled: !!invoiceId,
          staleTime: 5 * 60 * 1000, // Cache for 5 minutes
          refetchOnWindowFocus: false,
        }
      );

    const reminders = result?.data || [];

    if (isLoading) {
      return (
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse bg-muted/50 rounded"></div>
          <div className="h-3 w-3/4 animate-pulse bg-muted/50 rounded"></div>
        </div>
      );
    }

    if (reminders.length === 0) {
      return (
        <div className="space-y-3">
          <div className="py-2 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span>No reminders sent yet</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-32 overflow-y-auto">
        {reminders.map((reminder, index) => (
          <div
            key={reminder.id}
            className="flex items-center justify-between py-2 px-3 bg-white/30 rounded-md"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">
                  #{reminder.reminderNumber}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    reminder.tone === "urgent"
                      ? "bg-red-100 text-red-800"
                      : reminder.tone === "firm"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {reminder.tone}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(reminder.sentAt)}
              </span>
            </div>
            <div className="text-right">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  reminder.status === "sent"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {reminder.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-0 !mx-auto overflow-hidden rounded-xl flex flex-col max-h-[95vh]"
        style={{ width: "90%", maxWidth: "1200px" }}
      >
        {currentInvoiceId &&
          ((() => {
            const invoice = invoices.find((inv) => inv.id === currentInvoiceId);
            if (!invoice) return null;

            const isPaid = invoice.status === "paid";
            const isOverdue =
              new Date(invoice.dueDate) < new Date() &&
              (invoice.status === "pending" || invoice.status === "overdue");

            // Get days overdue or days until due
            const today = new Date();
            const dueDate = new Date(invoice.dueDate);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isDaysOverdue = diffDays < 0;
            const daysText = isDaysOverdue ? Math.abs(diffDays) : diffDays;

            return (
              <div className="grid grid-cols-1 md:grid-cols-5 h-full max-h-[calc(95vh-120px)] overflow-hidden">
                {/* Left Column - Invoice Details */}
                <div
                  className={`p-6 flex flex-col col-span-2 overflow-y-auto ${
                    isPaid
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-r border-green-100"
                      : isOverdue
                        ? "bg-gradient-to-br from-red-50 to-orange-50 border-r border-red-100"
                        : "bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-blue-100"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className={`text-xl font-bold ${isPaid ? "text-green-800" : isOverdue ? "text-red-800" : "text-blue-800"}`}
                      >
                        {isPaid
                          ? "Payment Received"
                          : isOverdue
                            ? "Payment Overdue"
                            : "Payment Due Soon"}
                      </h3>
                      <p
                        className={`text-sm ${isPaid ? "text-green-600" : isOverdue ? "text-red-600" : "text-blue-600"}`}
                      >
                        {isPaid
                          ? "This invoice has been paid in full."
                          : isOverdue
                            ? `This invoice is ${daysText} day${daysText !== 1 ? "s" : ""} overdue.`
                            : `This invoice is due in ${daysText} day${daysText !== 1 ? "s" : ""}.`}
                      </p>
                    </div>
                    <div
                      className={`rounded-full p-3 ${
                        isPaid
                          ? "bg-green-100"
                          : isOverdue
                            ? "bg-red-100"
                            : "bg-blue-100"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      ) : isOverdue ? (
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                      ) : (
                        <Clock8Icon className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                  </div>

                  <div className="bg-white/50 rounded-lg p-4 mb-5 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Invoice Number
                        </p>
                        <p className="font-mono text-sm font-bold">
                          {invoice.invoiceNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Amount
                        </p>
                        <p className="font-bold">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Issue Date
                        </p>
                        <p className="text-sm">
                          {formatDate(invoice.issueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Due Date
                        </p>
                        <p
                          className={`text-sm font-medium ${isOverdue ? "text-red-600" : ""}`}
                        >
                          {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <UserCogIcon className="h-3.5 w-3.5" /> Client Information
                    </h4>
                    <div className="bg-white/50 rounded-lg p-4 shadow-sm">
                      <p className="font-medium">{invoice.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.clientEmail}
                      </p>
                      {invoice.clientPhone && (
                        <p className="text-sm text-muted-foreground">
                          {invoice.clientPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Reminder History Section */}
                  <div className="mt-auto">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <HistoryIcon className="h-3.5 w-3.5" /> Previous Reminders
                    </h4>
                    <div className="bg-white/50 rounded-lg p-4 shadow-sm">
                      <LastReminderCellDetailed invoiceId={invoice.id} />
                    </div>
                  </div>
                </div>

                {/* Right Column - Email Template */}
                <div
                  className="p-6 flex flex-col col-span-3 overflow-y-auto"
                  style={{ maxHeight: "calc(95vh - 120px)" }}
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-1">
                      {isPaid
                        ? "Send Thank You Email"
                        : "Send Payment Reminder"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isPaid
                        ? "Send a thank you note to show your appreciation for the payment."
                        : "Customize your reminder email before sending it to the client."}
                    </p>
                  </div>

                  {!isPaid && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-blue-600" />
                          <Label className="text-sm font-medium">
                            Choose Template
                          </Label>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {useCustomTemplate ? "Custom" : "Built-in"}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {/* Built-in Templates */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Built-in Templates
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {getAvailableTemplates().builtIn.map((template) => (
                              <Button
                                key={template.id}
                                variant={
                                  !useCustomTemplate &&
                                  selectedTemplateType === template.tone
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                  handleBuiltInTemplateSelect(
                                    template.tone as any,
                                    invoice
                                  )
                                }
                                className={cn(
                                  "flex items-center gap-2 h-auto p-3 justify-start",
                                  !useCustomTemplate &&
                                    selectedTemplateType === template.tone &&
                                    "bg-blue-600 text-white"
                                )}
                              >
                                <div
                                  className={cn(
                                    "h-2 w-2 rounded-full",
                                    template.tone === "polite" && "bg-blue-500",
                                    template.tone === "firm" && "bg-amber-500",
                                    template.tone === "urgent" && "bg-red-500"
                                  )}
                                ></div>
                                <span className="text-xs">{template.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Templates */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Custom Templates
                            {loadingTemplates && (
                              <div className="h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-blue-600"></div>
                            )}
                          </h4>

                          {customTemplates &&
                          customTemplates.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {customTemplates.data.map((template) => (
                                <Button
                                  key={template.id}
                                  variant={
                                    useCustomTemplate &&
                                    selectedCustomTemplate?.id === template.id
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleCustomTemplateSelect(template)
                                  }
                                  className={cn(
                                    "flex items-center gap-2 h-auto p-3 justify-start",
                                    useCustomTemplate &&
                                      selectedCustomTemplate?.id ===
                                        template.id &&
                                      "bg-purple-600 text-white"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                    <div className="text-left">
                                      <div className="text-xs font-medium">
                                        {template.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {template.tone}
                                      </div>
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                              <Sparkles className="h-4 w-4 mx-auto mb-1 text-gray-400" />
                              <p>No custom templates yet</p>
                              <p className="mt-1">
                                Create templates in the Templates section
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF Attachment Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-purple-600" />
                        <Label className="text-sm font-medium">
                          PDF Attachment
                        </Label>
                      </div>
                      <Switch
                        checked={attachPdf}
                        onCheckedChange={handleAttachPdfToggle}
                        disabled={isSendingTemplate}
                      />
                    </div>

                    {attachPdf && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-gray-500 mb-2 block">
                            Select Invoice PDF to Attach
                          </Label>
                          <Select
                            value={selectedInvoiceForAttachment?.id || ""}
                            onValueChange={(value) => {
                              const invoice =
                                getAvailableInvoicesForAttachment().find(
                                  (inv) => inv.id === value
                                );
                              if (invoice) {
                                handleInvoiceForAttachmentSelect(invoice);
                              }
                            }}
                            disabled={
                              isSendingTemplate || loadingGeneratedInvoices
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose an invoice to attach..." />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingGeneratedInvoices ? (
                                <SelectItem value="loading" disabled>
                                  Loading invoices...
                                </SelectItem>
                              ) : getAvailableInvoicesForAttachment().length ===
                                0 ? (
                                <SelectItem value="empty" disabled>
                                  No generated invoices available
                                </SelectItem>
                              ) : (
                                getAvailableInvoicesForAttachment().map(
                                  (invoice) => (
                                    <SelectItem
                                      key={invoice.id}
                                      value={invoice.id}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-medium">
                                          {invoice.invoiceNumber}
                                        </span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                          {invoice.clientName} -{" "}
                                          {invoice.currency}
                                          {invoice.totalAmount}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  )
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedInvoiceForAttachment && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Paperclip className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-purple-800">
                                PDF will be attached:
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-purple-700">
                              <strong>
                                {selectedInvoiceForAttachment.invoiceNumber}
                              </strong>{" "}
                              - {selectedInvoiceForAttachment.clientName} -{" "}
                              {selectedInvoiceForAttachment.currency}
                              {selectedInvoiceForAttachment.totalAmount}
                            </div>
                            <div className="mt-1 text-xs text-purple-600">
                              Created:{" "}
                              {formatDate(
                                selectedInvoiceForAttachment.createdAt
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Subject Line */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email Subject
                    </Label>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="text-sm font-medium text-gray-800">
                        {getCurrentEmailSubject(invoice)}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced HTML/Plain Text Toggle */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="html-mode"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        {isHtmlMode ? (
                          <Code className="h-4 w-4 text-green-600" />
                        ) : (
                          <Type className="h-4 w-4 text-amber-600" />
                        )}
                        Content Format
                      </Label>
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-2 px-2 py-0 h-5 text-xs",
                          isHtmlMode
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        {isHtmlMode ? "HTML" : "Text"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Type className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-muted-foreground">
                          Plain Text
                        </span>
                      </div>
                      <Switch
                        id="html-mode"
                        checked={isHtmlMode}
                        onCheckedChange={handleHtmlModeToggle}
                      />
                      <div className="flex items-center gap-1">
                        <Code className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-muted-foreground">
                          HTML
                        </span>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="edit" className="flex-grow flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="edit">Edit Template</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="edit"
                      className="flex-grow flex flex-col"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Label
                          htmlFor="email-content"
                          className="text-sm font-medium"
                        >
                          Email Content
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={handleReset}
                        >
                          <RefreshCcwIcon className="h-3 w-3 mr-1" />
                          Reset to default
                        </Button>
                      </div>

                      <div
                        className="relative flex-grow rounded-md border overflow-hidden mb-6"
                        style={{ height: "400px" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-50"></div>
                        <textarea
                          id="email-content"
                          className="absolute inset-0 bg-transparent p-4 font-mono text-sm w-full resize-none focus:outline-none focus:ring-1 focus:ring-primary overflow-auto"
                          value={customizedEmailContent}
                          onChange={(e) => handleContentChange(e.target.value)}
                          disabled={isSendingTemplate}
                          style={{ height: "100%" }}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="preview"
                      className="flex-grow rounded-md border overflow-hidden bg-white"
                    >
                      {/* PDF Attachment Indicator */}
                      {attachPdf && selectedInvoiceForAttachment && (
                        <div className="bg-purple-50 border-b border-purple-200 px-4 py-2">
                          <div className="flex items-center gap-2 text-sm text-purple-700">
                            <Paperclip className="h-4 w-4" />
                            <span className="font-medium">
                              PDF Attached:{" "}
                              {selectedInvoiceForAttachment.invoiceNumber}
                            </span>
                          </div>
                        </div>
                      )}

                      <div
                        className="w-full h-full"
                        style={{
                          height:
                            attachPdf && selectedInvoiceForAttachment
                              ? "370px"
                              : "400px",
                        }}
                      >
                        <iframe
                          key={previewKey}
                          srcDoc={(() => {
                            if (isHtmlMode) {
                              // For HTML mode, return complete HTML document
                              return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Preview</title>
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
  ${customizedEmailContent}
</body>
</html>`;
                            } else {
                              // For text mode, return complete HTML document with text content
                              return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Preview</title>
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
  <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${customizedEmailContent}</pre>
</body>
</html>`;
                            }
                          })()}
                          title="Email Preview"
                          className="w-full h-full border-0"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <DialogFooter className="flex justify-between gap-4 mt-4 pt-4 border-t border-gray-100 sticky bottom-0 bg-white px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSendingTemplate}
                        className="cursor-pointer hover:bg-gray-100"
                      >
                        Cancel
                      </Button>
                      {/* Template Indicator */}
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>Using:</span>
                        {useCustomTemplate && selectedCustomTemplate ? (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {selectedCustomTemplate.name}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {selectedTemplateType.charAt(0).toUpperCase() +
                              selectedTemplateType.slice(1)}{" "}
                            Template
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant={isPaid ? "default" : "default"}
                      onClick={handleSendReminder}
                      disabled={isSendingTemplate}
                      className={`gap-2 cursor-pointer px-6 ${
                        isPaid
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : isOverdue && selectedTemplateType === "urgent"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : ""
                      }`}
                    >
                      {isSendingTemplate ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <SendIcon className="h-4 w-4" />
                          {isPaid ? "Send Thank You" : "Send Reminder"}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </div>
            );
          })() as ReactNode)}
      </DialogContent>
    </Dialog>
  );
};
