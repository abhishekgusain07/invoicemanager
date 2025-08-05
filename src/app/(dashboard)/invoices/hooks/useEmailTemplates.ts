"use client";

import { useState, useCallback } from "react";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDate, getDaysOverdue } from "../utils/invoiceUtils";
import { EmailTemplate } from "@/lib/validations/email-template";
import { TemplateRenderer } from "@/lib/services/template-renderer";
import type { GeneratedInvoice } from "@/db/schema";

export const useEmailTemplates = () => {
  const { user } = useUser();

  // tRPC queries
  const {
    data: customTemplates,
    isLoading: loadingTemplates,
    refetch: loadCustomTemplates,
  } = api.templates.getAll.useQuery();

  const {
    data: generatedInvoicesResponse,
    isLoading: loadingGeneratedInvoices,
    refetch: loadGeneratedInvoices,
  } = api.invoice.getGenerated.useQuery({ limit: 50, offset: 0 });

  const sendReminderMutation = api.email.sendReminder.useMutation();

  // Template selection and management
  const [selectedTemplateType, setSelectedTemplateType] = useState<
    "polite" | "firm" | "urgent"
  >("polite");
  const [selectedCustomTemplate, setSelectedCustomTemplate] =
    useState<EmailTemplate | null>(null);
  const [useCustomTemplate, setUseCustomTemplate] = useState<boolean>(false);

  // Content management
  const [isHtmlMode, setIsHtmlMode] = useState<boolean>(true);
  const [htmlEmailContent, setHtmlEmailContent] = useState<string>("");
  const [plainTextEmailContent, setPlainTextEmailContent] =
    useState<string>("");
  const [customizedEmailContent, setCustomizedEmailContent] =
    useState<string>("");
  const [emailSubject, setEmailSubject] = useState<string>("");

  // PDF Attachment state
  const [attachPdf, setAttachPdf] = useState<boolean>(false);
  const [selectedInvoiceForAttachment, setSelectedInvoiceForAttachment] =
    useState<GeneratedInvoice | null>(null);

  // UI state
  const [previewKey, setPreviewKey] = useState<number>(0);
  const isSendingTemplate = sendReminderMutation.isPending;

  // Enhanced template content generation
  const getEmailContent = useCallback(
    (templateType: string, invoice: any) => {
      // If using custom template, render it with invoice data
      if (useCustomTemplate && selectedCustomTemplate) {
        const renderData = TemplateRenderer.fromInvoiceData(
          invoice,
          user?.name || "Your Name",
          user?.name || "Your Company"
        );
        const renderer = new TemplateRenderer(renderData);

        // Use text content if available, otherwise fall back to legacy content
        const templateContent =
          selectedCustomTemplate.textContent || selectedCustomTemplate.content;
        return renderer.renderText(templateContent);
      }

      // Built-in templates (legacy support)
      const templates = {
        polite: `Dear ${invoice.clientName},

I hope this email finds you well. I wanted to send a gentle reminder that invoice #${invoice.invoiceNumber} for ${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)} was due on ${formatDate(invoice.dueDate)}.

If you've already sent the payment, please disregard this message. Otherwise, I would appreciate it if you could process this payment at your earliest convenience.

Thank you for your attention to this matter.

Best regards,
${user?.name}`,
        firm: `Dear ${invoice.clientName},

This is a reminder that invoice #${invoice.invoiceNumber} for ${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)} is now ${getDaysOverdue(invoice.dueDate)} days overdue.

Please process this payment as soon as possible to avoid any late fees.

If you have any questions about this invoice, please don't hesitate to contact us.

Regards,
${user?.name}`,
        urgent: `Dear ${invoice.clientName},

URGENT REMINDER: Invoice #${invoice.invoiceNumber} for ${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)} is now ${getDaysOverdue(invoice.dueDate)} days overdue.

This requires your immediate attention. Please process this payment within 48 hours to avoid additional late fees and potential service interruptions.

If you're experiencing difficulties with payment, please contact us immediately to discuss payment options.

Sincerely,
${user?.name}`,
        thankYou: `Dear ${invoice.clientName},

Thank you for your prompt payment of invoice #${invoice.invoiceNumber} for ${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}.

We greatly appreciate your business and look forward to working with you again in the future.

Best regards,
${user?.name || "Your Company"}`,
      };

      return (
        templates[templateType as keyof typeof templates] || templates.polite
      );
    },
    [user, useCustomTemplate, selectedCustomTemplate]
  );

  // Enhanced HTML email content generation
  const getHtmlEmailContent = useCallback(
    (templateType: string, invoice: any) => {
      // If using custom template, render it with invoice data
      if (useCustomTemplate && selectedCustomTemplate) {
        const renderData = TemplateRenderer.fromInvoiceData(
          invoice,
          user?.name || "Your Name",
          user?.name || "Your Company"
        );
        const renderer = new TemplateRenderer(renderData);

        // Use HTML content if available, otherwise fall back to legacy content
        const templateContent =
          selectedCustomTemplate.htmlContent || selectedCustomTemplate.content;
        return renderer.renderHtml(templateContent);
      }

      // Built-in templates (legacy support)
      const headerColor =
        templateType === "urgent"
          ? "#e53e3e"
          : templateType === "firm"
            ? "#dd6b20"
            : "#3182ce";
      const accentColor =
        templateType === "urgent"
          ? "#fc8181"
          : templateType === "firm"
            ? "#fbd38d"
            : "#90cdf4";

      const baseStyles = `
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
      .email-container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; }
      .header { padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid ${accentColor}; }
      .header h2 { color: ${headerColor}; margin: 0; font-weight: 600; }
      .content { padding: 15px 0; }
      .content p { margin: 10px 0; }
      .highlight { font-weight: bold; color: ${headerColor}; }
      .footer { padding-top: 15px; margin-top: 15px; border-top: 1px solid #e2e8f0; font-size: 0.9em; color: #718096; }
      .details { background-color: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid ${accentColor}; margin: 15px 0; }
      .details .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
      .details .detail-label { font-weight: 500; color: #4a5568; }
      .details .detail-value { font-weight: 600; }
      .cta-button { display: inline-block; background-color: ${headerColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 500; margin-top: 15px; }
    `;

      // Create header title based on the template type
      let headerTitle = "";
      if (templateType === "polite") headerTitle = "Friendly Payment Reminder";
      else if (templateType === "firm")
        headerTitle = "REMINDER: Invoice Payment Overdue";
      else if (templateType === "urgent")
        headerTitle = "URGENT: Invoice Payment Required";
      else if (templateType === "thankYou")
        headerTitle = "Payment Received - Thank You";

      // Create specific content based on template type
      let specificContent = "";

      if (templateType === "polite") {
        specificContent = `
        <p>Dear ${invoice.clientName},</p>
        <p>I hope this email finds you well. I wanted to send a gentle reminder that invoice <span class="highlight">#${invoice.invoiceNumber}</span> for <span class="highlight">${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}</span> was due on <span class="highlight">${formatDate(invoice.dueDate)}</span>.</p>
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Invoice Number:</span>
            <span class="detail-value">#${invoice.invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Due:</span>
            <span class="detail-value">${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Due Date:</span>
            <span class="detail-value">${formatDate(invoice.dueDate)}</span>
          </div>
        </div>
        <p>If you've already sent the payment, please disregard this message. Otherwise, I would appreciate it if you could process this payment at your earliest convenience.</p>
        <p>Thank you for your attention to this matter.</p>
        <p>Best regards,<br>${user?.name}</p>
      `;
      } else if (templateType === "firm") {
        specificContent = `
        <p>Dear ${invoice.clientName},</p>
        <p>This is a reminder that invoice <span class="highlight">#${invoice.invoiceNumber}</span> for <span class="highlight">${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}</span> is now <span class="highlight">${getDaysOverdue(invoice.dueDate)} days overdue</span>.</p>
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Invoice Number:</span>
            <span class="detail-value">#${invoice.invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Due:</span>
            <span class="detail-value">${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Due Date:</span>
            <span class="detail-value">${formatDate(invoice.dueDate)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Days Overdue:</span>
            <span class="detail-value">${getDaysOverdue(invoice.dueDate)}</span>
          </div>
        </div>
        <p>Please process this payment as soon as possible to avoid any late fees.</p>
        <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
        <p>Regards,<br>${user?.name}</p>
      `;
      } else if (templateType === "urgent") {
        specificContent = `
        <p>Dear ${invoice.clientName},</p>
        <p><strong>URGENT REMINDER:</strong> Invoice <span class="highlight">#${invoice.invoiceNumber}</span> for <span class="highlight">${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}</span> is now <span class="highlight">${getDaysOverdue(invoice.dueDate)} days overdue</span>.</p>
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Invoice Number:</span>
            <span class="detail-value">#${invoice.invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Due:</span>
            <span class="detail-value">${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Due Date:</span>
            <span class="detail-value">${formatDate(invoice.dueDate)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Days Overdue:</span>
            <span class="detail-value">${getDaysOverdue(invoice.dueDate)}</span>
          </div>
        </div>
        <p>This requires your <strong>immediate attention</strong>. Please process this payment within 48 hours to avoid additional late fees and potential service interruptions.</p>
        <p>If you're experiencing difficulties with payment, please contact us immediately to discuss payment options.</p>
        <p>Sincerely,<br>${user?.name}</p>
      `;
      } else if (templateType === "thankYou") {
        specificContent = `
        <p>Dear ${invoice.clientName},</p>
        <p>Thank you for your prompt payment of invoice <span class="highlight">#${invoice.invoiceNumber}</span> for <span class="highlight">${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}</span>.</p>
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Invoice Number:</span>
            <span class="detail-value">#${invoice.invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount Paid:</span>
            <span class="detail-value">${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Date:</span>
            <span class="detail-value">${formatDate(invoice.paidDate || new Date())}</span>
          </div>
        </div>
        <p>We greatly appreciate your business and look forward to working with you again in the future.</p>
        <p>Best regards,<br>${user?.name || "Your Company"}</p>
      `;
      }

      // Assemble the full HTML email
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${headerTitle}</title>
        <style>
          ${baseStyles}
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2>${headerTitle}</h2>
          </div>
          <div class="content">
            ${specificContent}
          </div>
          <div class="footer">
            <p>This is an automated message from InvoiceManager.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    },
    [user]
  );

  // Initialize template content
  const initializeTemplateContent = useCallback(
    (templateType: "polite" | "firm" | "urgent" | "thankYou", invoice: any) => {
      const plainTextContent = getEmailContent(templateType, invoice);
      const htmlContent = getHtmlEmailContent(templateType, invoice);

      setPlainTextEmailContent(plainTextContent);
      setHtmlEmailContent(htmlContent);
      setCustomizedEmailContent(isHtmlMode ? htmlContent : plainTextContent);
      setPreviewKey(0);
    },
    [getEmailContent, getHtmlEmailContent, isHtmlMode]
  );

  // Handle template type change
  const handleTemplateChange = useCallback(
    (type: string, invoice: any) => {
      if (type !== "polite" && type !== "firm" && type !== "urgent") return;

      setSelectedTemplateType(type as "polite" | "firm" | "urgent");
      initializeTemplateContent(type as "polite" | "firm" | "urgent", invoice);
    },
    [initializeTemplateContent]
  );

  // Handle HTML mode toggle
  const handleHtmlModeToggle = useCallback(
    (checked: boolean) => {
      setIsHtmlMode(checked);
      setCustomizedEmailContent(
        checked ? htmlEmailContent : plainTextEmailContent
      );
      setPreviewKey((prev) => prev + 1);
    },
    [htmlEmailContent, plainTextEmailContent]
  );

  // Handle content change
  const handleContentChange = useCallback(
    (content: string) => {
      setCustomizedEmailContent(content);
      if (isHtmlMode) {
        setHtmlEmailContent(content);
      } else {
        setPlainTextEmailContent(content);
      }
      setPreviewKey((prev) => prev + 1);
    },
    [isHtmlMode]
  );

  // Send reminder with template
  const sendReminderWithTemplate = useCallback(
    async (invoiceId: string, invoice: any, onSuccess?: () => void) => {
      // Generate email subject based on selected template
      let emailSubject = "";
      if (selectedTemplateType === "polite") {
        emailSubject = `Friendly reminder: Invoice #${invoice.invoiceNumber} payment due`;
      } else if (selectedTemplateType === "firm") {
        emailSubject = `REMINDER: Invoice #${invoice.invoiceNumber} is overdue`;
      } else {
        emailSubject = `URGENT: Invoice #${invoice.invoiceNumber} payment required`;
      }

      try {
        const loadingToastId = toast.loading("Sending reminder...");

        // Use the correct content based on mode
        const emailContent = isHtmlMode
          ? customizedEmailContent
          : `<pre style="font-family: sans-serif; white-space: pre-wrap;">${customizedEmailContent}</pre>`;

        const result = await sendReminderMutation.mutateAsync({
          invoiceId,
          emailSubject,
          emailContent,
          tone: selectedTemplateType,
          isHtml: isHtmlMode,
          // Include PDF attachment data
          attachPdf,
          attachmentInvoiceId: selectedInvoiceForAttachment?.id || null,
        });

        toast.dismiss(loadingToastId);

        if (result.success) {
          toast.success(`Reminder #${result.reminderNumber} sent successfully`);
          onSuccess?.();
          return true;
        } else {
          toast.error("Failed to send reminder");
          return false;
        }
      } catch (error) {
        console.error("Error sending reminder:", error);
        toast.dismiss();
        toast.error("An error occurred while sending the reminder");
        return false;
      }
    },
    [
      selectedTemplateType,
      isHtmlMode,
      customizedEmailContent,
      sendReminderMutation,
      attachPdf,
      selectedInvoiceForAttachment,
    ]
  );

  // Enhanced custom template handling
  const handleCustomTemplateSelect = useCallback((template: EmailTemplate) => {
    setSelectedCustomTemplate(template);
    setUseCustomTemplate(true);

    // Initialize content with selected template
    const renderData = TemplateRenderer.createPreviewData();
    const renderer = new TemplateRenderer(renderData);

    // Set subject from template
    setEmailSubject(renderer.renderText(template.subject));

    // Set content based on available formats
    if (template.htmlContent) {
      setHtmlEmailContent(template.htmlContent);
      setIsHtmlMode(true);
      setCustomizedEmailContent(template.htmlContent);
    } else if (template.textContent) {
      setPlainTextEmailContent(template.textContent);
      setIsHtmlMode(false);
      setCustomizedEmailContent(template.textContent);
    } else {
      // Fall back to legacy content
      setPlainTextEmailContent(template.content);
      setIsHtmlMode(false);
      setCustomizedEmailContent(template.content);
    }

    setPreviewKey((prev) => prev + 1);
    toast.success(`Template "${template.name}" selected`);
  }, []);

  const handleBuiltInTemplateSelect = useCallback(
    (templateType: "polite" | "firm" | "urgent", invoice: any) => {
      setUseCustomTemplate(false);
      setSelectedCustomTemplate(null);
      setSelectedTemplateType(templateType);
      initializeTemplateContent(templateType, invoice);
    },
    [initializeTemplateContent]
  );

  const getAvailableTemplates = useCallback(() => {
    const builtInTemplates = [
      {
        id: "polite",
        name: "Polite Reminder",
        tone: "polite",
        isBuiltIn: true,
      },
      { id: "firm", name: "Firm Reminder", tone: "firm", isBuiltIn: true },
      {
        id: "urgent",
        name: "Urgent Reminder",
        tone: "urgent",
        isBuiltIn: true,
      },
    ];

    const customReminders = Array.isArray(customTemplates?.data)
      ? customTemplates.data.filter(
          (t) => t.category === "reminder" && t.isActive !== false
        )
      : [];

    return { builtIn: builtInTemplates, custom: customReminders };
  }, [customTemplates]);

  const getCurrentEmailSubject = useCallback(
    (invoice: any) => {
      if (useCustomTemplate && selectedCustomTemplate) {
        const renderData = TemplateRenderer.fromInvoiceData(
          invoice,
          user?.name || "Your Name",
          user?.name || "Your Company"
        );
        const renderer = new TemplateRenderer(renderData);
        return renderer.renderText(selectedCustomTemplate.subject);
      }

      // Built-in template subjects
      if (selectedTemplateType === "polite") {
        return `Friendly reminder: Invoice #${invoice.invoiceNumber} payment due`;
      } else if (selectedTemplateType === "firm") {
        return `REMINDER: Invoice #${invoice.invoiceNumber} is overdue`;
      } else {
        return `URGENT: Invoice #${invoice.invoiceNumber} payment required`;
      }
    },
    [useCustomTemplate, selectedCustomTemplate, selectedTemplateType, user]
  );

  // PDF Attachment helpers
  const handleAttachPdfToggle = useCallback((checked: boolean) => {
    setAttachPdf(checked);
    if (!checked) {
      setSelectedInvoiceForAttachment(null);
    }
  }, []);

  const handleInvoiceForAttachmentSelect = useCallback(
    (invoice: GeneratedInvoice) => {
      setSelectedInvoiceForAttachment(invoice);
    },
    []
  );

  const getAvailableInvoicesForAttachment = useCallback(() => {
    return generatedInvoicesResponse?.data || [];
  }, [generatedInvoicesResponse]);

  const getAttachmentPreviewText = useCallback(() => {
    if (!attachPdf || !selectedInvoiceForAttachment) {
      return null;
    }
    return `📎 PDF will be attached: ${selectedInvoiceForAttachment.invoiceNumber} - ${selectedInvoiceForAttachment.clientName} - ${selectedInvoiceForAttachment.currency}${selectedInvoiceForAttachment.totalAmount}`;
  }, [attachPdf, selectedInvoiceForAttachment]);

  return {
    // Enhanced State
    selectedTemplateType,
    selectedCustomTemplate,
    useCustomTemplate,
    customTemplates,
    loadingTemplates,
    isHtmlMode,
    htmlEmailContent,
    plainTextEmailContent,
    customizedEmailContent,
    emailSubject,
    previewKey,
    isSendingTemplate,

    // PDF Attachment State
    attachPdf,
    selectedInvoiceForAttachment,
    generatedInvoicesResponse,
    loadingGeneratedInvoices,

    // Enhanced Actions
    getEmailContent,
    getHtmlEmailContent,
    initializeTemplateContent,
    handleTemplateChange,
    handleHtmlModeToggle,
    handleContentChange,
    sendReminderWithTemplate,

    // Custom Template Actions
    handleCustomTemplateSelect,
    handleBuiltInTemplateSelect,
    getAvailableTemplates,
    getCurrentEmailSubject,
    loadCustomTemplates,

    // PDF Attachment Actions
    handleAttachPdfToggle,
    handleInvoiceForAttachmentSelect,
    getAvailableInvoicesForAttachment,
    getAttachmentPreviewText,
    loadGeneratedInvoices,

    // Enhanced Setters
    setSelectedTemplateType,
    setSelectedCustomTemplate,
    setUseCustomTemplate,
    setIsHtmlMode,
    setHtmlEmailContent,
    setPlainTextEmailContent,
    setCustomizedEmailContent,
    setEmailSubject,
    setPreviewKey,
    setAttachPdf,
    setSelectedInvoiceForAttachment,
  };
};
