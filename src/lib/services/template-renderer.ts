import { TemplateRenderData, TEMPLATE_PLACEHOLDERS } from "@/lib/validations/email-template";
import { formatDate, formatCurrency } from "@/lib/utils";

/**
 * Advanced Template Rendering Service
 * Handles placeholder replacement with intelligent formatting
 */
export class TemplateRenderer {
  private data: TemplateRenderData;
  
  constructor(data: TemplateRenderData) {
    this.data = data;
  }

  /**
   * Render text content with placeholder replacement
   */
  renderText(template: string): string {
    return this.replacePlaceholders(template, false);
  }

  /**
   * Render HTML content with placeholder replacement
   */
  renderHtml(template: string): string {
    return this.replacePlaceholders(template, true);
  }

  /**
   * Core placeholder replacement engine
   */
  private replacePlaceholders(template: string, isHtml: boolean): string {
    let rendered = template;

    // Client information
    rendered = rendered.replace(/{client_name}/g, this.data.clientName);
    rendered = rendered.replace(/{client_email}/g, this.data.clientEmail);

    // Invoice details
    rendered = rendered.replace(/{invoice_number}/g, this.data.invoiceNumber);
    rendered = rendered.replace(/{invoice_amount}/g, this.formatAmount(this.data.invoiceAmount, this.data.currency));
    rendered = rendered.replace(/{currency}/g, this.data.currency);
    rendered = rendered.replace(/{due_date}/g, this.formatDate(this.data.dueDate));
    rendered = rendered.replace(/{issue_date}/g, this.formatDate(this.data.issueDate));
    rendered = rendered.replace(/{days_overdue}/g, this.formatDaysOverdue(this.data.daysOverdue));

    // Sender information
    rendered = rendered.replace(/{sender_name}/g, this.data.senderName);
    rendered = rendered.replace(/{company_name}/g, this.data.companyName || this.data.senderName);

    // Links and actions
    rendered = rendered.replace(/{invoice_link}/g, this.data.invoiceLink || '#');
    rendered = rendered.replace(/{payment_link}/g, this.data.invoiceLink || '#');

    // Dates
    rendered = rendered.replace(/{current_date}/g, this.formatDate(new Date().toISOString()));

    // Custom fields
    if (this.data.customFields) {
      Object.entries(this.data.customFields).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
      });
    }

    // Apply HTML-specific formatting if needed
    if (isHtml) {
      rendered = this.applyHtmlFormatting(rendered);
    }

    return rendered;
  }

  /**
   * Format currency amount
   */
  private formatAmount(amount: string, currency: string): string {
    const numAmount = parseFloat(amount);
    return formatCurrency(numAmount, currency);
  }

  /**
   * Format date string
   */
  private formatDate(dateString: string): string {
    return formatDate(dateString);
  }

  /**
   * Format days overdue with proper grammar
   */
  private formatDaysOverdue(days: number): string {
    if (days <= 0) return "0 days";
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  /**
   * Apply HTML-specific formatting
   */
  private applyHtmlFormatting(content: string): string {
    // Convert line breaks to HTML
    let formatted = content.replace(/\n/g, '<br>');
    
    // Add emphasis to important information
    formatted = formatted.replace(/(URGENT|OVERDUE|FINAL NOTICE)/gi, '<strong style="color: #e53e3e;">$1</strong>');
    formatted = formatted.replace(/(Thank you|Thanks)/gi, '<em style="color: #38a169;">$1</em>');
    
    return formatted;
  }

  /**
   * Get available placeholders with descriptions
   */
  static getAvailablePlaceholders(): Array<{ placeholder: string; description: string; example: string }> {
    return [
      { placeholder: '{client_name}', description: 'Client full name', example: 'John Smith' },
      { placeholder: '{client_email}', description: 'Client email address', example: 'john@example.com' },
      { placeholder: '{invoice_number}', description: 'Invoice number', example: 'INV-001' },
      { placeholder: '{invoice_amount}', description: 'Formatted invoice amount', example: '$1,250.00' },
      { placeholder: '{currency}', description: 'Currency code', example: 'USD' },
      { placeholder: '{due_date}', description: 'Formatted due date', example: 'March 15, 2024' },
      { placeholder: '{issue_date}', description: 'Formatted issue date', example: 'March 1, 2024' },
      { placeholder: '{days_overdue}', description: 'Days overdue count', example: '5 days' },
      { placeholder: '{sender_name}', description: 'Your name', example: 'Jane Doe' },
      { placeholder: '{company_name}', description: 'Your company name', example: 'Acme Corp' },
      { placeholder: '{invoice_link}', description: 'Link to invoice', example: 'https://...' },
      { placeholder: '{payment_link}', description: 'Payment link', example: 'https://...' },
      { placeholder: '{current_date}', description: 'Current date', example: 'March 20, 2024' },
    ];
  }

  /**
   * Preview template with sample data
   */
  static createPreviewData(): TemplateRenderData {
    return {
      clientName: "John Smith",
      clientEmail: "john.smith@example.com",
      invoiceNumber: "INV-001234",
      invoiceAmount: "1250.00",
      currency: "USD",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      issueDate: new Date().toISOString(),
      daysOverdue: 5,
      senderName: "Jane Doe",
      companyName: "Acme Corporation",
      invoiceLink: "https://example.com/invoice/001234",
      customFields: {
        custom_message: "Thank you for your business!"
      }
    };
  }

  /**
   * Convert invoice data to template render data
   */
  static fromInvoiceData(invoice: any, senderName: string, companyName?: string): TemplateRenderData {
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      invoiceNumber: invoice.invoiceNumber,
      invoiceAmount: invoice.amount.toString(),
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      issueDate: invoice.issueDate,
      daysOverdue: Math.max(0, daysOverdue),
      senderName,
      companyName,
      invoiceLink: `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoice.id}`,
    };
  }
}

/**
 * Utility functions for template operations
 */
export const templateUtils = {
  /**
   * Extract placeholders from template content
   */
  extractPlaceholders(content: string): string[] {
    const placeholderRegex = /{([^}]+)}/g;
    const matches = content.match(placeholderRegex) || [];
    return [...new Set(matches)];
  },

  /**
   * Validate template content for required placeholders
   */
  validateTemplate(content: string, requiredPlaceholders: string[] = []): { valid: boolean; missing: string[] } {
    const found = this.extractPlaceholders(content);
    const missing = requiredPlaceholders.filter(req => !found.includes(req));
    
    return {
      valid: missing.length === 0,
      missing
    };
  },

  /**
   * Generate template preview HTML
   */
  generatePreviewHtml(content: string, data: TemplateRenderData): string {
    const renderer = new TemplateRenderer(data);
    const rendered = renderer.renderHtml(content);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Template Preview</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .email-container {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              background: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            ${rendered}
          </div>
        </body>
      </html>
    `;
  }
};