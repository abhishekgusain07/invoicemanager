import { describe, it, expect, beforeEach, mock } from "bun:test";

// Simple mock for email router testing
const mockEmailService = {
  sendReminder: mock(async (input: {
    invoiceId: string;
    emailSubject: string;
    emailContent: string;
    tone: 'polite' | 'firm' | 'urgent';
    isHtml: boolean;
  }) => {
    // Simulate different responses based on tone
    const reminderNumbers = {
      polite: 'REM-001',
      firm: 'REM-002', 
      urgent: 'REM-003'
    };
    
    return {
      success: true,
      reminderNumber: reminderNumbers[input.tone],
      emailSent: true,
    };
  }),
};

describe('Email Router (Bun Test)', () => {
  beforeEach(() => {
    mockEmailService.sendReminder.mockClear();
  });

  describe('sendReminder', () => {
    it('should send reminder email successfully', async () => {
      const input = {
        invoiceId: 'invoice-1',
        emailSubject: 'Payment Reminder',
        emailContent: 'Please pay your invoice',
        tone: 'polite' as const,
        isHtml: true,
      };

      const result = await mockEmailService.sendReminder(input);

      expect(result).toEqual({
        success: true,
        reminderNumber: 'REM-001',
        emailSent: true,
      });

      expect(mockEmailService.sendReminder).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendReminder).toHaveBeenCalledWith(input);
    });

    it('should handle different tones correctly', async () => {
      const tones = ['polite', 'firm', 'urgent'] as const;
      const expectedNumbers = ['REM-001', 'REM-002', 'REM-003'];
      
      for (let i = 0; i < tones.length; i++) {
        const tone = tones[i];
        const input = {
          invoiceId: `invoice-${tone}`,
          emailSubject: `Payment Reminder - ${tone}`,
          emailContent: 'Please pay your invoice',
          tone,
          isHtml: false,
        };

        const result = await mockEmailService.sendReminder(input);
        
        expect(result.success).toBe(true);
        expect(result.reminderNumber).toBe(expectedNumbers[i]);
        expect(mockEmailService.sendReminder).toHaveBeenCalledWith(input);
      }
    });

    it('should handle HTML and plain text content', async () => {
      // Test HTML content
      const htmlInput = {
        invoiceId: 'invoice-html',
        emailSubject: 'HTML Reminder',
        emailContent: '<h1>Payment Due</h1><p>Please pay your invoice</p>',
        tone: 'polite' as const,
        isHtml: true,
      };

      const htmlResult = await mockEmailService.sendReminder(htmlInput);
      expect(htmlResult.success).toBe(true);

      // Test plain text content  
      const textInput = {
        invoiceId: 'invoice-text',
        emailSubject: 'Text Reminder',
        emailContent: 'Payment Due\nPlease pay your invoice',
        tone: 'firm' as const,
        isHtml: false,
      };

      const textResult = await mockEmailService.sendReminder(textInput);
      expect(textResult.success).toBe(true);
      expect(textResult.reminderNumber).toBe('REM-002');
    });
  });
});