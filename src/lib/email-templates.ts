/**
 * Email templates for various invoice reminder tones
 */
export const emailTemplates = {
  /**
   * Friendly tone for early reminders
   */
  friendly: {
    subject: "Friendly reminder: Invoice #" + "{{invoiceNumber}}" + " is due soon",
    body: 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">` +
        `<h2>Friendly Payment Reminder</h2>` +
        `<p>Hello ` + "{{customerName}}" + `,</p>` +
        `<p>We hope this email finds you well! This is a friendly reminder that invoice #` + "{{invoiceNumber}}" + ` for $` + "{{amount}}" + ` is due on ` + "{{dueDate}}" + `.</p>` +
        `<p>If you've already sent your payment, please disregard this message and accept our thanks.</p>` +
        `<div style="margin: 25px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">` +
          `<p style="margin: 0;"><strong>Invoice Number:</strong> ` + "{{invoiceNumber}}" + `</p>` +
          `<p style="margin: 10px 0;"><strong>Amount Due:</strong> $` + "{{amount}}" + `</p>` +
          `<p style="margin: 10px 0;"><strong>Due Date:</strong> ` + "{{dueDate}}" + `</p>` +
        `</div>` +
        `<p>If you have any questions or concerns, please don't hesitate to contact us.</p>` +
        `<p>Thank you for your business!</p>` +
        `<p>Best regards,<br/>The team at ` + "{{companyName}}" + `</p>` +
      `</div>`
  },
  
  /**
   * Firm tone for overdue invoices
   */
  firm: {
    subject: "REMINDER: Invoice #" + "{{invoiceNumber}}" + " is past due",
    body: 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">` +
        `<h2>Payment Reminder</h2>` +
        `<p>Dear ` + "{{customerName}}" + `,</p>` +
        `<p>Our records indicate that we have not yet received payment for invoice #` + "{{invoiceNumber}}" + ` in the amount of $` + "{{amount}}" + `, which was due on ` + "{{dueDate}}" + `.</p>` +
        `<div style="margin: 25px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">` +
          `<p style="margin: 0;"><strong>Invoice Number:</strong> ` + "{{invoiceNumber}}" + `</p>` +
          `<p style="margin: 10px 0;"><strong>Amount Due:</strong> $` + "{{amount}}" + `</p>` +
          `<p style="margin: 10px 0;"><strong>Due Date:</strong> ` + "{{dueDate}}" + ` (PAST DUE)</p>` +
        `</div>` +
        `<p>Please arrange for this payment to be made as soon as possible. If you have already sent payment, please disregard this notice.</p>` +
        `<p>If you have any questions or concerns about this invoice, please contact us promptly.</p>` +
        `<p>Regards,<br/>` + "{{companyName}}" + `</p>` +
      `</div>`
  },
  
  /**
   * Urgent tone for significantly overdue invoices
   */
  urgent: {
    subject: "URGENT: Outstanding Payment Required for Invoice #" + "{{invoiceNumber}}",
    body: 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">` +
        `<h2 style="color: #d9534f;">Urgent Payment Notice</h2>` +
        `<p>Dear ` + "{{customerName}}" + `,</p>` +
        `<p><strong>This is an urgent notice regarding invoice #` + "{{invoiceNumber}}" + ` for $` + "{{amount}}" + ` which was due on ` + "{{dueDate}}" + ` and remains unpaid.</strong></p>` +
        `<div style="margin: 25px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; border-left: 4px solid #d9534f;">` +
          `<p style="margin: 0;"><strong>Invoice Number:</strong> ` + "{{invoiceNumber}}" + `</p>` +
          `<p style="margin: 10px 0;"><strong>Amount Due:</strong> $` + "{{amount}}" + `</p>` +
          `<p style="margin: 10px 0;"><strong>Due Date:</strong> ` + "{{dueDate}}" + ` (SIGNIFICANTLY OVERDUE)</p>` +
          `<p style="margin: 10px 0; color: #d9534f;"><strong>Action Required:</strong> Immediate payment</p>` +
        `</div>` +
        `<p>Your immediate attention to this matter is required. Please make payment within the next 48 hours to avoid further action.</p>` +
        `<p>If you have any questions or need to discuss payment arrangements, please contact us immediately at [Your Phone Number].</p>` +
        `<p>Sincerely,<br/>Accounts Receivable<br/>` + "{{companyName}}" + `</p>` +
      `</div>`
  }
};

/**
 * Replace template placeholders with actual values
 */
export function populateTemplate(template: string, data: Record<string, string>): string {
  return Object.entries(data).reduce((result, [key, value]) => {
    const regex = new RegExp(`\{\{${key}\}\}`, 'g');
    return result.replace(regex, value);
  }, template);
} 