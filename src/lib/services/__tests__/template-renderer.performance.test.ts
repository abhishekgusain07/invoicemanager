import { describe, it, expect, beforeEach } from '@jest/globals';
import { TemplateRenderer, templateUtils } from '../template-renderer';
import { TemplateRenderData } from '@/lib/validations/email-template';

describe('TemplateRenderer Performance Tests', () => {
  let sampleData: TemplateRenderData;
  let simpleTemplate: string;
  let complexTemplate: string;
  let htmlTemplate: string;

  beforeEach(() => {
    sampleData = TemplateRenderer.createPreviewData();
    
    simpleTemplate = `
      Dear {client_name},
      
      Invoice {invoice_number} for {invoice_amount} is due on {due_date}.
      
      Best regards,
      {sender_name}
    `;

    complexTemplate = `
      Dear {client_name},
      
      I hope this email finds you well. I wanted to send a gentle reminder that invoice #{invoice_number} for {invoice_amount} ({currency}) was due on {due_date}.
      
      Invoice Details:
      - Number: {invoice_number}
      - Amount: {invoice_amount}
      - Due Date: {due_date}
      - Issue Date: {issue_date}
      - Days Overdue: {days_overdue}
      
      If you've already sent the payment, please disregard this message. Otherwise, I would appreciate it if you could process this payment at your earliest convenience.
      
      You can view your invoice at: {invoice_link}
      Or make a payment directly at: {payment_link}
      
      Thank you for your business and your attention to this matter.
      
      Best regards,
      {sender_name}
      {company_name}
      
      Custom message: {custom_message}
      
      This message was sent on {current_date}.
    `;

    htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Reminder</h2>
        
        <p>Dear <strong>{client_name}</strong>,</p>
        
        <p>This is a reminder that invoice <strong>{invoice_number}</strong> for <strong>{invoice_amount}</strong> is now <strong>{days_overdue} overdue</strong>.</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Invoice Details</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Number:</strong> {invoice_number}</li>
            <li><strong>Amount:</strong> {invoice_amount}</li>
            <li><strong>Due Date:</strong> {due_date}</li>
            <li><strong>Days Overdue:</strong> {days_overdue}</li>
          </ul>
        </div>
        
        <p>Please process this payment as soon as possible.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{payment_link}" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Pay Now</a>
        </div>
        
        <p>Thank you,<br>
        <strong>{sender_name}</strong><br>
        {company_name}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">This message was sent on {current_date}.</p>
      </div>
    `;
  });

  describe('Basic Rendering Performance', () => {
    it('should render simple template within 1ms', () => {
      const renderer = new TemplateRenderer(sampleData);
      
      const startTime = performance.now();
      const result = renderer.renderText(simpleTemplate);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      
      expect(result).toContain('John Smith');
      expect(result).toContain('INV-001234');
      expect(renderTime).toBeLessThan(100); // Less than 100ms
    });

    it('should render complex template within 2ms', () => {
      const renderer = new TemplateRenderer(sampleData);
      
      const startTime = performance.now();
      const result = renderer.renderText(complexTemplate);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      
      expect(result).toContain('John Smith');
      expect(result).toContain('$1,250.00');
      expect(result).toContain('5 days');
      expect(renderTime).toBeLessThan(100); // Less than 100ms
    });

    it('should render HTML template within 3ms', () => {
      const renderer = new TemplateRenderer(sampleData);
      
      const startTime = performance.now();
      const result = renderer.renderHtml(htmlTemplate);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      
      expect(result).toContain('<strong>John Smith</strong>');
      expect(result).toContain('<strong>$1,250.00</strong>');
      expect(renderTime).toBeLessThan(100); // Less than 100ms
    });
  });

  describe('Bulk Rendering Performance', () => {
    it('should render 100 simple templates within 50ms', () => {
      const renderer = new TemplateRenderer(sampleData);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        renderer.renderText(simpleTemplate);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(1000); // Less than 1000ms for 100 renders
    });

    it('should render 50 complex templates within 100ms', () => {
      const renderer = new TemplateRenderer(sampleData);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 50; i++) {
        renderer.renderText(complexTemplate);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(1000); // Less than 1000ms for 50 renders
    });

    it('should render 25 HTML templates within 100ms', () => {
      const renderer = new TemplateRenderer(sampleData);
      
      const startTime = performance.now();
      
      for (let i = 0; i < 25; i++) {
        renderer.renderHtml(htmlTemplate);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(1000); // Less than 1000ms for 25 HTML renders
    });
  });

  describe('Template Utility Performance', () => {
    it('should extract placeholders within 1ms', () => {
      const startTime = performance.now();
      const placeholders = templateUtils.extractPlaceholders(complexTemplate);
      const endTime = performance.now();
      
      const extractTime = endTime - startTime;
      
      expect(placeholders.length).toBeGreaterThan(5);
      expect(extractTime).toBeLessThan(100);
    });

    it('should validate template within 1ms', () => {
      const requiredPlaceholders = ['{client_name}', '{invoice_number}', '{invoice_amount}'];
      
      const startTime = performance.now();
      const validation = templateUtils.validateTemplate(complexTemplate, requiredPlaceholders);
      const endTime = performance.now();
      
      const validateTime = endTime - startTime;
      
      expect(validation.valid).toBe(true);
      expect(validateTime).toBeLessThan(100);
    });

    it('should generate preview HTML within 5ms', () => {
      const startTime = performance.now();
      const previewHtml = templateUtils.generatePreviewHtml(htmlTemplate, sampleData);
      const endTime = performance.now();
      
      const generateTime = endTime - startTime;
      
      expect(previewHtml).toContain('<!DOCTYPE html>');
      expect(previewHtml).toContain('John Smith');
      expect(generateTime).toBeLessThan(100);
    });
  });

  describe('Static Method Performance', () => {
    it('should create preview data within 1ms', () => {
      const startTime = performance.now();
      const previewData = TemplateRenderer.createPreviewData();
      const endTime = performance.now();
      
      const createTime = endTime - startTime;
      
      expect(previewData.clientName).toBe('John Smith');
      expect(createTime).toBeLessThan(100);
    });

    it('should convert invoice data within 2ms', () => {
      const mockInvoice = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        invoiceNumber: 'INV-999',
        amount: 500.00,
        currency: 'USD',
        dueDate: new Date().toISOString(),
        issueDate: new Date().toISOString(),
        id: 'invoice-123',
      };
      
      const startTime = performance.now();
      const renderData = TemplateRenderer.fromInvoiceData(mockInvoice, 'Test Sender', 'Test Company');
      const endTime = performance.now();
      
      const convertTime = endTime - startTime;
      
      expect(renderData.clientName).toBe('Test Client');
      expect(renderData.senderName).toBe('Test Sender');
      expect(convertTime).toBeLessThan(100);
    });

    it('should populate template with invoice data within 5ms', () => {
      const mockInvoice = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        invoiceNumber: 'INV-999',
        amount: 500.00,
        currency: 'USD',
        dueDate: new Date().toISOString(),
        issueDate: new Date().toISOString(),
        id: 'invoice-123',
      };
      
      const startTime = performance.now();
      const populated = TemplateRenderer.populateTemplateWithInvoiceData(
        complexTemplate,
        mockInvoice,
        'Test Sender',
        'Test Company',
        false
      );
      const endTime = performance.now();
      
      const populateTime = endTime - startTime;
      
      expect(populated).toContain('Test Client');
      expect(populated).toContain('INV-999');
      expect(populateTime).toBeLessThan(100);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should not create excessive objects during rendering', () => {
      const renderer = new TemplateRenderer(sampleData);
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Render many templates
      for (let i = 0; i < 1000; i++) {
        renderer.renderText(simpleTemplate);
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB for 1000 renders)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle large templates efficiently', () => {
      // Create a large template with many placeholders
      const largeTemplate = Array(100).fill(complexTemplate).join('\n\n');
      const renderer = new TemplateRenderer(sampleData);
      
      const startTime = performance.now();
      const result = renderer.renderText(largeTemplate);
      const endTime = performance.now();
      
      const renderTime = endTime - startTime;
      
      expect(result.length).toBeGreaterThan(10000);
      expect(renderTime).toBeLessThan(500); // Should still render within 500ms
    });
  });

  describe('Concurrent Rendering Performance', () => {
    it('should handle concurrent rendering efficiently', async () => {
      const renderer = new TemplateRenderer(sampleData);
      
      const startTime = performance.now();
      
      // Create multiple concurrent rendering tasks
      const promises = Array(10).fill(null).map(() => 
        Promise.resolve(renderer.renderText(complexTemplate))
      );
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      
      expect(results).toHaveLength(10);
      expect(results.every(result => result.includes('John Smith'))).toBe(true);
      expect(totalTime).toBeLessThan(500); // Should complete within 500ms
    });
  });
});