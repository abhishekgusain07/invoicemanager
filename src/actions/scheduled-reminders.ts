"use server";

import { v4 as uuidv4 } from "uuid";
import { db } from "@/db/drizzle";
import { clientInvoices, invoiceReminders, userSettings } from "@/db/schema";
import { and, eq, lt, desc } from "drizzle-orm";
import { serverDebug } from "@/utils/debug";

// Define interfaces for strong typing
export interface UserReminderSettings {
  userId: string;
  isAutomatedReminders: boolean;
  firstReminderDays: number;
  followUpFrequency: number;
  maxReminders: number;
  firstReminderTone: string;
  secondReminderTone: string;
  thirdReminderTone: string;
  businessName?: string;
  emailSignature?: string;
}

export interface ReminderCheckResult {
  shouldSendReminder: boolean;
  reminderNumber: number;
  tone: string;
  daysOverdue: number;
}

/**
 * Process scheduled reminders based on user settings
 * This should be called by a cron job daily
 */
export async function processScheduledReminders() {
  try {
    serverDebug("ScheduledReminder", "Starting scheduled reminder processing");

    // Get all users who have automated reminders enabled
    const usersWithSettings = await db
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

    serverDebug(
      "ScheduledReminder",
      `Found ${usersWithSettings.length} users with automated reminders enabled`
    );

    // Process reminders for each user
    for (const user of usersWithSettings) {
      // Convert all potentially null values to their defaults
      const safeUser: UserReminderSettings = {
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

      await processUserReminders(safeUser);
    }

    serverDebug("ScheduledReminder", "Completed scheduled reminder processing");
    return { success: true, message: "Reminders processed successfully" };
  } catch (error) {
    console.error("Error processing scheduled reminders:", error);
    return { success: false, message: "Error processing scheduled reminders" };
  }
}

/**
 * Process reminders for a single user
 */
async function processUserReminders(user: UserReminderSettings) {
  try {
    serverDebug(
      "ScheduledReminder",
      `Processing reminders for user ${user.userId}`
    );

    // Get all pending invoices that are due or overdue
    const pendingInvoices = await db
      .select()
      .from(clientInvoices)
      .where(
        and(
          eq(clientInvoices.userId, user.userId),
          eq(clientInvoices.status, "pending")
        )
      );

    serverDebug(
      "ScheduledReminder",
      `Found ${pendingInvoices.length} pending invoices for user ${user.userId}`
    );

    let processedCount = 0;

    for (const invoice of pendingInvoices) {
      // Check if this invoice needs a reminder
      const reminderCheck = await checkIfInvoiceNeedsReminder(invoice, user);

      if (reminderCheck.shouldSendReminder) {
        serverDebug(
          "ScheduledReminder",
          `Sending reminder #${reminderCheck.reminderNumber} for invoice ${invoice.id}, ${reminderCheck.daysOverdue} days overdue`
        );

        await logReminderInDatabase(invoice, user, reminderCheck);
        processedCount++;
      }
    }

    serverDebug(
      "ScheduledReminder",
      `Processed ${processedCount} reminders for user ${user.userId}`
    );

    return { success: true };
  } catch (error) {
    console.error(`Error processing reminders for user ${user.userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if an invoice needs a reminder
 */
async function checkIfInvoiceNeedsReminder(
  invoice: any,
  userSettings: UserReminderSettings
): Promise<ReminderCheckResult> {
  // Get previous reminders for this invoice
  const previousReminders = await db
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
    // First reminder days setting determines when to send the first reminder
    // - Positive number: send X days BEFORE due date (this would be <= 0 days overdue)
    // - Negative number: send X days AFTER due date (this would be >= X days overdue)
    // - Zero: send ON the due date

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
  }
  // We have sent reminders before
  else {
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
        tone: previousReminders[0].tone as string,
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
        ? (previousReminders[0].tone as string)
        : userSettings.firstReminderTone,
    daysOverdue,
  };
}

/**
 * Log a reminder in the database
 */
async function logReminderInDatabase(
  invoice: any,
  user: UserReminderSettings,
  reminderCheck: ReminderCheckResult
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
    await db.insert(invoiceReminders).values({
      id: uuidv4(),
      invoiceId: invoice.id,
      userId: user.userId,
      reminderNumber: reminderCheck.reminderNumber,
      tone: reminderCheck.tone as any, // Cast to enum type
      emailSubject,
      emailContent,
      status: "sent",
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // In a real implementation, you would also send the actual email here
    // using your email sending infrastructure

    serverDebug(
      "ScheduledReminder",
      `Logged reminder #${reminderCheck.reminderNumber} for invoice ${invoice.id}`
    );
    return true;
  } catch (error) {
    console.error(`Error logging reminder for invoice ${invoice.id}:`, error);
    return false;
  }
}

/**
 * Generate email content based on reminder tone and invoice details
 */
function generateEmailContent(
  invoice: any,
  user: UserReminderSettings,
  reminderCheck: ReminderCheckResult
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
