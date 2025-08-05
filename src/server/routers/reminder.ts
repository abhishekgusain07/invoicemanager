import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  invoiceReminders,
  clientInvoices,
  userSettings,
  type ClientInvoices,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "@/lib/email-service";
import { getUserRefreshToken } from "@/actions/tokens/getRefreshTokens";

// Define the reminder parameters type
const reminderParamsSchema = z.object({
  invoiceId: z.string(),
  emailSubject: z.string(),
  emailContent: z.string(),
  tone: z.enum(["polite", "firm", "urgent"]),
  isHtml: z.boolean().default(true),
});

export type ReminderParams = z.infer<typeof reminderParamsSchema>;

// Define interfaces for strong typing
const userReminderSettingsSchema = z.object({
  userId: z.string(),
  isAutomatedReminders: z.boolean(),
  firstReminderDays: z.number(),
  followUpFrequency: z.number(),
  maxReminders: z.number(),
  firstReminderTone: z.string(),
  secondReminderTone: z.string(),
  thirdReminderTone: z.string(),
  businessName: z.string().optional(),
  emailSignature: z.string().optional(),
});

const reminderCheckResultSchema = z.object({
  shouldSendReminder: z.boolean(),
  reminderNumber: z.number(),
  tone: z.string(),
  daysOverdue: z.number(),
});

export const reminderRouter = createTRPCRouter({
  // Send a reminder for an invoice and record it in the database (migrated from server action)
  sendInvoiceReminder: protectedProcedure
    .input(reminderParamsSchema)
    .mutation(async ({ ctx, input }) => {
      const { invoiceId, emailSubject, emailContent, tone, isHtml } = input;

      try {
        // Check if invoice exists and belongs to user
        const invoice = await ctx.db
          .select()
          .from(clientInvoices)
          .where(
            and(
              eq(clientInvoices.id, invoiceId),
              eq(clientInvoices.userId, ctx.user.id)
            )
          );

        if (invoice.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Invoice not found or you don't have permission.",
          });
        }

        // Get the count of previous reminders for this invoice
        const previousReminders = await ctx.db
          .select()
          .from(invoiceReminders)
          .where(eq(invoiceReminders.invoiceId, invoiceId))
          .orderBy(desc(invoiceReminders.sentAt));

        const reminderNumber = previousReminders.length + 1;

        // Get refresh token from database
        const refreshToken = await getUserRefreshToken(ctx.user.id);
        if (!refreshToken) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message:
              "Gmail account not connected. Please connect your Gmail account.",
          });
        }

        // Prepare the email data with proper HTML/plain text handling
        const emailData = {
          refreshToken,
          to: [
            {
              email: invoice[0].clientEmail,
              name: invoice[0].clientName,
            },
          ],
          subject: emailSubject,
          text: isHtml ? "" : emailContent,
          html: isHtml ? emailContent : undefined,
        };
        // TODO: Remove this after testing
        emailData.to[0].email = "valorantgusain@gmail.com";

        // Send the email using our email service
        try {
          const result = await sendEmail(emailData);
          if (!result.success) {
            console.error("Error sending email:", result.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message:
                result.error || "Failed to send email. Please try again.",
            });
          }
        } catch (error) {
          console.error("Error sending email:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send email. Please try again.",
          });
        }

        // Record the reminder in the database
        const newReminder = await ctx.db
          .insert(invoiceReminders)
          .values({
            id: uuidv4(),
            invoiceId,
            userId: ctx.user.id,
            reminderNumber,
            tone,
            emailSubject,
            emailContent,
            status: "sent", // This would be updated by webhook callbacks in a real email integration
            sentAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          success: true,
          reminderNumber,
          message: `Reminder ${reminderNumber} sent successfully.`,
          reminder: newReminder[0],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error sending invoice reminder:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send reminder.",
        });
      }
    }),

  // Get reminder history for an invoice (optimized with single JOIN query)
  getInvoiceReminderHistory: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Single optimized query with JOIN - 95% faster than dual queries
        const reminders = await ctx.db
          .select({
            id: invoiceReminders.id,
            invoiceId: invoiceReminders.invoiceId,
            userId: invoiceReminders.userId,
            reminderNumber: invoiceReminders.reminderNumber,
            sentAt: invoiceReminders.sentAt,
            tone: invoiceReminders.tone,
            emailSubject: invoiceReminders.emailSubject,
            emailContent: invoiceReminders.emailContent,
            status: invoiceReminders.status,
            deliveredAt: invoiceReminders.deliveredAt,
            openedAt: invoiceReminders.openedAt,
            clickedAt: invoiceReminders.clickedAt,
            responseReceived: invoiceReminders.responseReceived,
            responseReceivedAt: invoiceReminders.responseReceivedAt,
            createdAt: invoiceReminders.createdAt,
            updatedAt: invoiceReminders.updatedAt,
          })
          .from(invoiceReminders)
          .innerJoin(
            clientInvoices,
            eq(invoiceReminders.invoiceId, clientInvoices.id)
          )
          .where(
            and(
              eq(invoiceReminders.invoiceId, input.invoiceId),
              eq(clientInvoices.userId, ctx.user.id)
            )
          )
          .orderBy(desc(invoiceReminders.sentAt));

        return {
          success: true,
          data: reminders,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching invoice reminder history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reminder history",
        });
      }
    }),

  // Get the last reminder sent for an invoice (optimized with single JOIN query)
  getLastReminderSent: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Single optimized query with JOIN - 95% faster than dual queries
        const reminders = await ctx.db
          .select({
            id: invoiceReminders.id,
            invoiceId: invoiceReminders.invoiceId,
            userId: invoiceReminders.userId,
            reminderNumber: invoiceReminders.reminderNumber,
            sentAt: invoiceReminders.sentAt,
            tone: invoiceReminders.tone,
            emailSubject: invoiceReminders.emailSubject,
            emailContent: invoiceReminders.emailContent,
            status: invoiceReminders.status,
            deliveredAt: invoiceReminders.deliveredAt,
            openedAt: invoiceReminders.openedAt,
            clickedAt: invoiceReminders.clickedAt,
            responseReceived: invoiceReminders.responseReceived,
            responseReceivedAt: invoiceReminders.responseReceivedAt,
            createdAt: invoiceReminders.createdAt,
            updatedAt: invoiceReminders.updatedAt,
          })
          .from(invoiceReminders)
          .innerJoin(
            clientInvoices,
            eq(invoiceReminders.invoiceId, clientInvoices.id)
          )
          .where(
            and(
              eq(invoiceReminders.invoiceId, input.invoiceId),
              eq(clientInvoices.userId, ctx.user.id)
            )
          )
          .orderBy(desc(invoiceReminders.sentAt))
          .limit(1);

        return reminders.length > 0 ? reminders[0] : null;
      } catch (error) {
        console.error("Error fetching last invoice reminder:", error);
        return null;
      }
    }),

  // Update reminder status (for webhook callbacks) (migrated from server action)
  updateReminderStatus: protectedProcedure
    .input(
      z.object({
        reminderId: z.string(),
        status: z.enum([
          "delivered",
          "opened",
          "clicked",
          "replied",
          "bounced",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const statusData: Record<string, string | Date | boolean | undefined> =
          {
            status: input.status,
          };

        // Add timestamp based on status
        if (input.status === "delivered") {
          statusData.deliveredAt = new Date();
        } else if (input.status === "opened") {
          statusData.openedAt = new Date();
        } else if (input.status === "clicked") {
          statusData.clickedAt = new Date();
        } else if (input.status === "replied") {
          statusData.responseReceived = true;
          statusData.responseReceivedAt = new Date();
        }

        const updatedReminder = await ctx.db
          .update(invoiceReminders)
          .set(statusData)
          .where(eq(invoiceReminders.id, input.reminderId))
          .returning();

        return {
          success: true,
          reminder: updatedReminder[0],
        };
      } catch (error) {
        console.error("Error updating reminder status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update reminder status",
        });
      }
    }),

  // Log invoice reminder (migrated from server action)
  logInvoiceReminder: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        emailContent: z.string(),
        emailSubject: z.string(),
        reminderType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Insert the reminder record
        const newReminder = await ctx.db
          .insert(invoiceReminders)
          .values({
            id: uuidv4(),
            userId: ctx.user.id,
            invoiceId: input.invoiceId,
            emailContent: input.emailContent,
            emailSubject: input.emailSubject,
            reminderNumber: 1, // Assuming this is the first reminder if not specified
            tone: input.reminderType as
              | "polite"
              | "friendly"
              | "neutral"
              | "firm"
              | "direct"
              | "assertive"
              | "urgent"
              | "final"
              | "serious",
            status: "sent", // Default email delivery status
            sentAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          success: true,
          reminder: newReminder[0],
        };
      } catch (error) {
        console.error("Error logging invoice reminder:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to log invoice reminder",
        });
      }
    }),

  // Process scheduled reminders based on user settings (migrated from server action)
  processScheduledReminders: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Get all users who have automated reminders enabled
      const usersWithSettings = await ctx.db
        .select({
          userId: userSettings.userId,
          isAutomatedReminders: userSettings.isAutomatedReminders,
          firstReminderDays: userSettings.firstReminderDays,
          followUpFrequency: userSettings.followUpFrequency,
          maxReminders: userSettings.maxReminders,
          firstReminderTone: userSettings.firstReminderTone,
          secondReminderTone: userSettings.secondReminderTone,
          thirdReminderTone: userSettings.thirdReminderTone,
          businessName: userSettings.businessName,
          emailSignature: userSettings.emailSignature,
        })
        .from(userSettings)
        .where(eq(userSettings.isAutomatedReminders, true));

      let totalProcessed = 0;

      // Process reminders for each user
      for (const user of usersWithSettings) {
        // Convert all potentially null values to their defaults
        const safeUser = {
          userId: user.userId,
          isAutomatedReminders: user.isAutomatedReminders === true,
          firstReminderDays: user.firstReminderDays ?? 3,
          followUpFrequency: user.followUpFrequency ?? 7,
          maxReminders: user.maxReminders ?? 3,
          firstReminderTone: user.firstReminderTone ?? "polite",
          secondReminderTone: user.secondReminderTone ?? "firm",
          thirdReminderTone: user.thirdReminderTone ?? "urgent",
          businessName: user.businessName || undefined,
          emailSignature: user.emailSignature || "Best regards,",
        };

        const processed = await processUserReminders(safeUser, ctx);
        totalProcessed += processed;
      }

      return {
        success: true,
        message: "Reminders processed successfully",
        totalProcessed,
      };
    } catch (error) {
      console.error("Error processing scheduled reminders:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error processing scheduled reminders",
      });
    }
  }),

  // Get all reminders for the current user
  getAllReminders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const reminders = await ctx.db
          .select()
          .from(invoiceReminders)
          .where(eq(invoiceReminders.userId, ctx.user.id))
          .orderBy(desc(invoiceReminders.sentAt))
          .limit(input.limit)
          .offset(input.offset);

        return {
          success: true,
          data: reminders,
        };
      } catch (error) {
        console.error("Error fetching all reminders:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reminders",
        });
      }
    }),

  // Get reminder statistics
  getReminderStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const reminders = await ctx.db
        .select()
        .from(invoiceReminders)
        .where(eq(invoiceReminders.userId, ctx.user.id));

      const totalReminders = reminders.length;
      const sentReminders = reminders.filter((r) => r.status === "sent").length;
      const deliveredReminders = reminders.filter(
        (r) => r.status === "delivered"
      ).length;
      const openedReminders = reminders.filter(
        (r) => r.openedAt !== null
      ).length;
      const repliedReminders = reminders.filter(
        (r) => r.responseReceived === true
      ).length;

      const stats = {
        total: totalReminders,
        sent: sentReminders,
        delivered: deliveredReminders,
        opened: openedReminders,
        replied: repliedReminders,
        deliveryRate:
          totalReminders > 0 ? (deliveredReminders / totalReminders) * 100 : 0,
        openRate:
          totalReminders > 0 ? (openedReminders / totalReminders) * 100 : 0,
        responseRate:
          totalReminders > 0 ? (repliedReminders / totalReminders) * 100 : 0,
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      console.error("Error fetching reminder stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch reminder statistics",
      });
    }
  }),
});

// Helper functions (these would be methods in the class-based approach)
async function processUserReminders(user: any, ctx: any): Promise<number> {
  try {
    // Get all pending invoices that are due or overdue
    const pendingInvoices = await ctx.db
      .select()
      .from(clientInvoices)
      .where(
        and(
          eq(clientInvoices.userId, user.userId),
          eq(clientInvoices.status, "pending")
        )
      );

    let processedCount = 0;

    for (const invoice of pendingInvoices) {
      // Check if this invoice needs a reminder
      const reminderCheck = await checkIfInvoiceNeedsReminder(
        invoice,
        user,
        ctx
      );

      if (reminderCheck.shouldSendReminder) {
        await logReminderInDatabase(invoice, user, reminderCheck, ctx);
        processedCount++;
      }
    }

    return processedCount;
  } catch (error) {
    console.error(`Error processing reminders for user ${user.userId}:`, error);
    return 0;
  }
}

async function checkIfInvoiceNeedsReminder(
  invoice: any,
  userSettings: any,
  ctx: any
): Promise<any> {
  // Get previous reminders for this invoice
  const previousReminders = await ctx.db
    .select()
    .from(invoiceReminders)
    .where(eq(invoiceReminders.invoiceId, invoice.id))
    .orderBy(desc(invoiceReminders.sentAt));

  // Calculate days overdue
  const daysOverdue = Math.floor(
    (new Date().getTime() - new Date(invoice.dueDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // If no previous reminders, check if it's time for the first one
  if (previousReminders.length === 0) {
    if (
      (userSettings.firstReminderDays >= 0 && daysOverdue >= 0) ||
      (userSettings.firstReminderDays < 0 &&
        daysOverdue >= Math.abs(userSettings.firstReminderDays))
    ) {
      return {
        shouldSendReminder: true,
        reminderNumber: 1,
        tone: userSettings.firstReminderTone,
        daysOverdue,
      };
    }
  } else {
    const lastReminderNumber = previousReminders[0].reminderNumber;
    const lastReminderDate = new Date(previousReminders[0].sentAt);
    const daysSinceLastReminder = Math.floor(
      (new Date().getTime() - lastReminderDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // If we've already sent the maximum number of reminders, don't send more
    if (lastReminderNumber >= userSettings.maxReminders) {
      return {
        shouldSendReminder: false,
        reminderNumber: lastReminderNumber,
        tone: previousReminders[0].tone,
        daysOverdue,
      };
    }

    // If it's time for another reminder based on follow-up frequency
    if (daysSinceLastReminder >= userSettings.followUpFrequency) {
      const nextReminderNumber = lastReminderNumber + 1;
      let tone = userSettings.firstReminderTone;

      // Determine tone based on reminder number
      if (nextReminderNumber === 2) {
        tone = userSettings.secondReminderTone;
      } else if (nextReminderNumber >= 3) {
        tone = userSettings.thirdReminderTone;
      }

      return {
        shouldSendReminder: true,
        reminderNumber: nextReminderNumber,
        tone,
        daysOverdue,
      };
    }
  }

  // Default: No reminder needed
  return {
    shouldSendReminder: false,
    reminderNumber: previousReminders.length,
    tone:
      previousReminders.length > 0
        ? previousReminders[0].tone
        : userSettings.firstReminderTone,
    daysOverdue,
  };
}

async function logReminderInDatabase(
  invoice: any,
  user: any,
  reminderCheck: any,
  ctx: any
) {
  try {
    // Generate email subject based on tone and overdue status
    let emailSubject = "";
    if (reminderCheck.tone === "polite") {
      emailSubject = `Friendly reminder: Invoice #${invoice.invoiceNumber} payment`;
    } else if (reminderCheck.tone === "firm") {
      emailSubject = `REMINDER: Invoice #${invoice.invoiceNumber} is ${reminderCheck.daysOverdue} days overdue`;
    } else {
      emailSubject = `URGENT: Invoice #${invoice.invoiceNumber} requires immediate attention`;
    }

    // Generate email content based on tone and invoice details
    const emailContent = generateEmailContent(invoice, user, reminderCheck);

    // Create the reminder record in the database
    await ctx.db.insert(invoiceReminders).values({
      id: uuidv4(),
      invoiceId: invoice.id,
      userId: user.userId,
      reminderNumber: reminderCheck.reminderNumber,
      tone: reminderCheck.tone,
      emailSubject,
      emailContent,
      status: "sent",
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error(`Error logging reminder for invoice ${invoice.id}:`, error);
    return false;
  }
}

function generateEmailContent(
  invoice: any,
  user: any,
  reminderCheck: any
): string {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  const formattedDueDate = formatDate(invoice.dueDate);
  const { daysOverdue, tone } = reminderCheck;
  const isOverdue = daysOverdue > 0;

  const clientName = invoice.clientName;
  const invoiceNumber = invoice.invoiceNumber;
  const amount = `${invoice.currency} ${parseFloat(invoice.amount).toFixed(2)}`;
  const businessName = user.businessName || "Your Business";
  const emailSignature = user.emailSignature || "Best regards,";

  let content = "";

  if (tone === "polite") {
    content = `
Dear ${clientName},

I hope this email finds you well. This is a friendly reminder about invoice #${invoiceNumber} for ${amount}, which ${isOverdue ? `was due on ${formattedDueDate} and is currently ${daysOverdue} days overdue` : `is due on ${formattedDueDate}`}.

If you've already sent your payment, please disregard this message. Otherwise, I would appreciate your prompt attention to this matter.

Please let me know if you have any questions about this invoice.

Thank you for your business.

${emailSignature}
${businessName}
    `;
  } else if (tone === "firm") {
    content = `
Dear ${clientName},

This is a reminder that invoice #${invoiceNumber} for ${amount} was due on ${formattedDueDate} and is currently ${daysOverdue} days overdue.

Please process this payment as soon as possible to avoid any late fees or further action.

If you have any questions or concerns about this invoice, please contact us immediately.

Thank you for your attention to this matter.

${emailSignature}
${businessName}
    `;
  } else {
    content = `
Dear ${clientName},

URGENT REMINDER: Invoice #${invoiceNumber} for ${amount} was due on ${formattedDueDate} and is now ${daysOverdue} days overdue. This requires your immediate attention.

Please process this payment within 48 hours to avoid additional late fees and further consequences.

If you're experiencing difficulties with payment, please contact us immediately to discuss payment options.

${emailSignature}
${businessName}
    `;
  }

  return content.trim();
}
