"use server"
import { db } from "@/db/drizzle";
import { invoiceReminders } from "@/db/schema";
import { auth } from "@/lib/auth";
import { serverDebug } from "@/utils/debug";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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
  const session = await auth.api.getSession({
    headers:  await headers()
  });
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in to create an invoice." };
  }

  try {
    // Insert the reminder record
    await db.insert(invoiceReminders).values({
      id: uuidv4(),
      userId: session.user.id,
      invoiceId,
      emailContent,
      emailSubject,
      reminderNumber: 1, // Assuming this is the first reminder if not specified
      tone: reminderType as any, // Cast the string to the enum type
      status: "sent", // Default email delivery status
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
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