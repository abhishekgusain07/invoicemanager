import { db } from "@/lib/db";
import { invoiceReminders } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { serverDebug } from "@/lib/utils/debug";

/**
 * Log a reminder sent for an invoice
 */
export async function logInvoiceReminder({
  invoiceId,
  emailContent,
  emailSubject,
  reminderType,
}: {
  invoiceId: string;
  emailContent: string;
  emailSubject: string;
  reminderType: string;
}) {
  const { userId } = auth();

  if (!userId) {
    return {
      error: "Unauthorized",
      success: false,
    };
  }

  try {
    // Insert the reminder record
    await db.insert(invoiceReminders).values({
      invoiceId,
      userId,
      emailContent,
      emailSubject,
      reminderType,
      createdAt: new Date(),
    });

    // Revalidate the invoice page path to reflect the change
    revalidatePath("/invoices");
    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    serverDebug("Error logging invoice reminder:", error);
    return {
      error: "Failed to log invoice reminder",
      success: false,
    };
  }
}

/**
 * Get reminder history for an invoice
 */
export async function getInvoiceReminderHistory(invoiceId: string) {
  const { userId } = auth();

  if (!userId) {
    return [];
  }

  try {
    const reminderHistory = await db.query.invoiceReminders.findMany({
      where: (reminders: any, { eq, and }: any) => 
        and(eq(reminders.invoiceId, invoiceId), eq(reminders.userId, userId)),
      orderBy: (reminders: any, { desc }: any) => [desc(reminders.createdAt)]
    });

    return reminderHistory;
  } catch (error) {
    serverDebug("Error fetching invoice reminder history:", error);
    return [];
  }
}

/**
 * Get the last reminder for an invoice
 */
export async function getLastInvoiceReminder(invoiceId: string) {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  try {
    const lastReminder = await db.query.invoiceReminders.findFirst({
      where: (reminders: any, { eq, and }: any) => 
        and(eq(reminders.invoiceId, invoiceId), eq(reminders.userId, userId)),
      orderBy: (reminders: any, { desc }: any) => [desc(reminders.createdAt)]
    });

    return lastReminder;
  } catch (error) {
    serverDebug("Error fetching last invoice reminder:", error);
    return null;
  }
} 