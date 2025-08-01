import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { emailRouter } from "../email";

// Mock the reminder action
const mockSendInvoiceReminder = jest.fn();

jest.mock("@/actions/reminder", () => ({
  sendInvoiceReminder: mockSendInvoiceReminder,
}));

describe("Email Router", () => {
  let mockContext: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContext = {
      db: {},
      session: {
        user: {
          id: "test-user-id",
        },
      },
      user: {
        id: "test-user-id",
      },
    };
  });

  describe("sendReminder", () => {
    it("should send reminder email successfully", async () => {
      const mockResult = {
        success: true,
        reminderNumber: "REM-001",
      };

      mockSendInvoiceReminder.mockResolvedValue(mockResult);

      const caller = emailRouter.createCaller(mockContext);
      const result = await caller.sendReminder({
        invoiceId: "invoice-1",
        emailSubject: "Payment Reminder",
        emailContent: "Please pay your invoice",
        tone: "polite",
        isHtml: true,
      });

      expect(result).toEqual({
        success: true,
        reminderNumber: "REM-001",
      });

      expect(mockSendInvoiceReminder).toHaveBeenCalledWith({
        invoiceId: "invoice-1",
        emailSubject: "Payment Reminder",
        emailContent: "Please pay your invoice",
        tone: "polite",
        isHtml: true,
      });
    });

    it("should handle reminder sending failures", async () => {
      const mockResult = {
        success: false,
        error: "Email service unavailable",
      };

      mockSendInvoiceReminder.mockResolvedValue(mockResult);

      const caller = emailRouter.createCaller(mockContext);

      await expect(
        caller.sendReminder({
          invoiceId: "invoice-1",
          emailSubject: "Payment Reminder",
          emailContent: "Please pay your invoice",
          tone: "polite",
          isHtml: true,
        })
      ).rejects.toThrow("Email service unavailable");
    });

    it("should handle reminder action throwing errors", async () => {
      mockSendInvoiceReminder.mockRejectedValue(new Error("Network error"));

      const caller = emailRouter.createCaller(mockContext);

      await expect(
        caller.sendReminder({
          invoiceId: "invoice-1",
          emailSubject: "Payment Reminder",
          emailContent: "Please pay your invoice",
          tone: "polite",
          isHtml: true,
        })
      ).rejects.toThrow("Failed to send reminder email");
    });

    it("should send reminder with different tones", async () => {
      const mockResult = {
        success: true,
        reminderNumber: "REM-002",
      };

      mockSendInvoiceReminder.mockResolvedValue(mockResult);

      const caller = emailRouter.createCaller(mockContext);

      // Test urgent tone
      await caller.sendReminder({
        invoiceId: "invoice-1",
        emailSubject: "URGENT: Payment Required",
        emailContent: "Immediate payment required",
        tone: "urgent",
        isHtml: false,
      });

      expect(mockSendInvoiceReminder).toHaveBeenCalledWith({
        invoiceId: "invoice-1",
        emailSubject: "URGENT: Payment Required",
        emailContent: "Immediate payment required",
        tone: "urgent",
        isHtml: false,
      });
    });
  });

  describe("bulkSendReminders", () => {
    it("should send multiple reminders successfully", async () => {
      const successResult = {
        success: true,
        reminderNumber: "REM-001",
      };

      mockSendInvoiceReminder.mockResolvedValue(successResult);

      const reminders = [
        {
          invoiceId: "invoice-1",
          emailSubject: "Payment Reminder 1",
          emailContent: "Please pay invoice 1",
          tone: "polite" as const,
          isHtml: true,
        },
        {
          invoiceId: "invoice-2",
          emailSubject: "Payment Reminder 2",
          emailContent: "Please pay invoice 2",
          tone: "firm" as const,
          isHtml: true,
        },
      ];

      const caller = emailRouter.createCaller(mockContext);
      const result = await caller.bulkSendReminders({ reminders });

      expect(result.success).toBe(true);
      expect(result.summary).toEqual({
        total: 2,
        successful: 2,
        failed: 0,
      });

      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toMatchObject({
        invoiceId: "invoice-1",
        success: true,
        reminderNumber: "REM-001",
      });

      expect(mockSendInvoiceReminder).toHaveBeenCalledTimes(2);
    });

    it("should handle partial failures in bulk send", async () => {
      mockSendInvoiceReminder
        .mockResolvedValueOnce({ success: true, reminderNumber: "REM-001" })
        .mockResolvedValueOnce({ success: false, error: "Email failed" });

      const reminders = [
        {
          invoiceId: "invoice-1",
          emailSubject: "Payment Reminder 1",
          emailContent: "Please pay invoice 1",
          tone: "polite" as const,
          isHtml: true,
        },
        {
          invoiceId: "invoice-2",
          emailSubject: "Payment Reminder 2",
          emailContent: "Please pay invoice 2",
          tone: "firm" as const,
          isHtml: true,
        },
      ];

      const caller = emailRouter.createCaller(mockContext);
      const result = await caller.bulkSendReminders({ reminders });

      expect(result.success).toBe(true); // Should be true if at least one succeeds
      expect(result.summary).toEqual({
        total: 2,
        successful: 1,
        failed: 1,
      });

      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toBe("Email failed");
    });

    it("should handle complete failure in bulk send", async () => {
      mockSendInvoiceReminder.mockResolvedValue({
        success: false,
        error: "Service unavailable",
      });

      const reminders = [
        {
          invoiceId: "invoice-1",
          emailSubject: "Payment Reminder 1",
          emailContent: "Please pay invoice 1",
          tone: "polite" as const,
          isHtml: true,
        },
      ];

      const caller = emailRouter.createCaller(mockContext);
      const result = await caller.bulkSendReminders({ reminders });

      expect(result.success).toBe(false);
      expect(result.summary).toEqual({
        total: 1,
        successful: 0,
        failed: 1,
      });
    });

    it("should handle exceptions during bulk send", async () => {
      mockSendInvoiceReminder
        .mockResolvedValueOnce({ success: true, reminderNumber: "REM-001" })
        .mockRejectedValueOnce(new Error("Network timeout"));

      const reminders = [
        {
          invoiceId: "invoice-1",
          emailSubject: "Payment Reminder 1",
          emailContent: "Please pay invoice 1",
          tone: "polite" as const,
          isHtml: true,
        },
        {
          invoiceId: "invoice-2",
          emailSubject: "Payment Reminder 2",
          emailContent: "Please pay invoice 2",
          tone: "firm" as const,
          isHtml: true,
        },
      ];

      const caller = emailRouter.createCaller(mockContext);
      const result = await caller.bulkSendReminders({ reminders });

      expect(result.success).toBe(true);
      expect(result.summary).toEqual({
        total: 2,
        successful: 1,
        failed: 1,
      });

      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toBe("Network timeout");
    });
  });

  describe("getReminderHistory", () => {
    it("should return empty reminder history (placeholder)", async () => {
      const caller = emailRouter.createCaller(mockContext);
      const result = await caller.getReminderHistory({
        invoiceId: "invoice-1",
      });

      expect(result).toEqual([]);
    });
  });

  describe("checkGmailConnection", () => {
    it("should return Gmail connection status (placeholder)", async () => {
      const caller = emailRouter.createCaller(mockContext);
      const result = await caller.checkGmailConnection();

      expect(result).toEqual({
        isConnected: false,
        email: null,
      });
    });
  });

  describe("refreshTokens", () => {
    it("should refresh Gmail tokens (placeholder)", async () => {
      const caller = emailRouter.createCaller(mockContext);
      const result = await caller.refreshTokens();

      expect(result).toEqual({
        success: true,
      });
    });
  });
});
