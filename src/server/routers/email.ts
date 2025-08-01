import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { sendInvoiceReminder } from "@/actions/reminder";

export const emailRouter = createTRPCRouter({
  // Send reminder email
  sendReminder: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        emailSubject: z.string(),
        emailContent: z.string(),
        tone: z.enum(["polite", "firm", "urgent"]),
        isHtml: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await sendInvoiceReminder({
          invoiceId: input.invoiceId,
          emailSubject: input.emailSubject,
          emailContent: input.emailContent,
          tone: input.tone,
          isHtml: input.isHtml,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to send reminder");
        }

        return {
          success: true,
          reminderNumber: result.reminderNumber,
        };
      } catch (error) {
        console.error("Error sending reminder:", error);
        throw new Error("Failed to send reminder email");
      }
    }),

  // Get reminder history for an invoice
  getReminderHistory: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // This would need to be implemented based on your database schema
        // For now, return empty array as placeholder
        return [];
      } catch (error) {
        console.error("Error getting reminder history:", error);
        throw new Error("Failed to get reminder history");
      }
    }),

  // Check Gmail connection status
  checkGmailConnection: protectedProcedure.query(async ({ ctx }) => {
    try {
      // This would need to be implemented based on your auth system
      // For now, return a placeholder response
      return {
        isConnected: false,
        email: null,
      };
    } catch (error) {
      console.error("Error checking Gmail connection:", error);
      throw new Error("Failed to check Gmail connection");
    }
  }),

  // Refresh Gmail tokens
  refreshTokens: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // This would need to be implemented based on your auth system
      // For now, return a placeholder response
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error refreshing tokens:", error);
      throw new Error("Failed to refresh Gmail tokens");
    }
  }),

  // Bulk send reminders
  bulkSendReminders: protectedProcedure
    .input(
      z.object({
        reminders: z.array(
          z.object({
            invoiceId: z.string(),
            emailSubject: z.string(),
            emailContent: z.string(),
            tone: z.enum(["polite", "firm", "urgent"]),
            isHtml: z.boolean().default(true),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results = [];

        for (const reminder of input.reminders) {
          try {
            const result = await sendInvoiceReminder({
              invoiceId: reminder.invoiceId,
              emailSubject: reminder.emailSubject,
              emailContent: reminder.emailContent,
              tone: reminder.tone,
              isHtml: reminder.isHtml,
            });

            results.push({
              invoiceId: reminder.invoiceId,
              success: result.success,
              reminderNumber: result.reminderNumber,
              error: result.error,
            });
          } catch (error) {
            results.push({
              invoiceId: reminder.invoiceId,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        const successCount = results.filter((r) => r.success).length;
        const totalCount = results.length;

        return {
          success: successCount > 0,
          results,
          summary: {
            total: totalCount,
            successful: successCount,
            failed: totalCount - successCount,
          },
        };
      } catch (error) {
        console.error("Error bulk sending reminders:", error);
        throw new Error("Failed to bulk send reminders");
      }
    }),
});
